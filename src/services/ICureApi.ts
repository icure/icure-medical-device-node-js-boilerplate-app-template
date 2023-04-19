import * as dotenv from 'dotenv'
dotenv.config()

import * as fs from 'fs/promises'

import 'isomorphic-fetch'
import { webcrypto } from 'crypto'

import { HealthcareProfessional, MedTechApi, MedTechApiBuilder, SystemMetaDataOwner, User, ua2hex } from '@icure/medical-device-sdk'
import { NodeLocalStorage } from '../storage/NodeLocalStorage'

let iCureMedTechApi: MedTechApi | undefined = undefined

export async function getICureApi(forceCryptKeysCreation = false): Promise<MedTechApi> {
  if (iCureMedTechApi === undefined) {
    iCureMedTechApi = await initICureApi(forceCryptKeysCreation)
  }

  return iCureMedTechApi
}

async function initICureApi(forceCryptKeysCreation: boolean): Promise<MedTechApi> {
  if (!process.env.PARENT_ORGANISATION_USERNAME || !process.env.PARENT_ORGANISATION_TOKEN) {
    throw new Error('Provide your Parent Organisation credentials in .env file to create your MedTechApi')
  }

  const api = await new MedTechApiBuilder()
    .withUserName(process.env.PARENT_ORGANISATION_USERNAME)
    .withPassword(process.env.PARENT_ORGANISATION_TOKEN)
    .withCrypto(webcrypto as Crypto)
    .withStorage(new NodeLocalStorage())
    .preventCookieUsage()
    .build()

  const parentUser = await api.userApi.getLoggedUser()

  if (!(await parentOrgCryptographicKeysExist(api, parentUser))) {
    const parentOrgCryptKeys = await getOrCreateParentHcpCryptographicKeys(api, parentUser, forceCryptKeysCreation)
    await api.addKeyPair(parentUser.healthcarePartyId!, parentOrgCryptKeys)
  }

  return api
}

async function parentOrgCryptographicKeysExist(medTechApi: MedTechApi, parentUser: User): Promise<boolean> {
  return await medTechApi.healthcareProfessionalApi
    .getHealthcareProfessional(parentUser.healthcarePartyId!)
    .then((dataOwner) => {
      return dataOwner.systemMetaData?.publicKey
    })
    .then(async (publicKey) => {
      return publicKey ? (await medTechApi.keyStorage.getKeypair(`${parentUser.healthcarePartyId}.${publicKey.slice(-32)}`)) !== undefined : false
    })
    .then((keysExist) => {
      if (keysExist) {
        console.info(`Parent Organisation cryptographic keys already exist in localStorage`)
      } else {
        console.info(`Parent Organisation cryptographic keys not in localStorage. Trying to get them from .env file or to create them...`)
      }
      return keysExist
    })
    .catch((e) => {
      console.error(`Could not retrieve parent organisation: ${e}`)
      throw e
    })
}

async function getOrCreateParentHcpCryptographicKeys(
  medTechApi: MedTechApi,
  parentUser: User,
  forceCryptKeysCreation = false
): Promise<{ publicKey: string; privateKey: string }> {
  return (
    (!forceCryptKeysCreation ? getParentOrgCryptographicKeys() : undefined) ??
    (await createAndSaveParentOrgCryptographicKeys(medTechApi, parentUser, forceCryptKeysCreation))
  )
}

function getParentOrgCryptographicKeys(): { publicKey: string; privateKey: string } | undefined {
  const publicKey = process.env.PARENT_ORGANISATION_PUBLIC_KEY
  const privateKey = process.env.PARENT_ORGANISATION_PRIVATE_KEY

  if (publicKey && privateKey) {
    console.info('Using cryptographic keys from .env file')
    return { publicKey: publicKey, privateKey: privateKey }
  }
  return undefined
}

async function createAndSaveParentOrgCryptographicKeys(
  medTechApi: MedTechApi,
  parentUser: User,
  forceCryptKeysCreation: boolean
): Promise<{ publicKey: string; privateKey: string }> {
  const { publicKey, privateKey } = await medTechApi.cryptoApi.RSA.generateKeyPair()
  const publicKeyHex = ua2hex(await medTechApi.cryptoApi.RSA.exportKey(publicKey, 'spki'))
  const privateKeyHex = ua2hex(await medTechApi.cryptoApi.RSA.exportKey(privateKey, 'pkcs8'))

  const currentHcp = await medTechApi.healthcareProfessionalApi.getHealthcareProfessional(parentUser.healthcarePartyId!)
  if (currentHcp.systemMetaData?.publicKey && currentHcp.systemMetaData.publicKey !== publicKeyHex && !forceCryptKeysCreation) {
    throw new Error(`Aborting Cryptographic Keys creation: Current HCP already has cryptographic keys: ${currentHcp.systemMetaData.publicKey} !`)
  }

  if (!currentHcp.systemMetaData) {
    currentHcp.systemMetaData = new SystemMetaDataOwner({
      publicKey: publicKeyHex,
    })
  } else {
    currentHcp.systemMetaData.publicKey = publicKeyHex
  }

  return await medTechApi.healthcareProfessionalApi
    .createOrModifyHealthcareProfessional(currentHcp)
    .then((hcp: HealthcareProfessional) => {
      if (hcp.systemMetaData?.publicKey !== publicKeyHex) {
        throw new Error(
          `Public key of the current HCP does not match the one generated. Expected: ${publicKeyHex} but got ${hcp.systemMetaData?.publicKey}`
        )
      }
      return { publicKey: publicKeyHex, privateKey: privateKeyHex }
    })
    .then(async (cryptographicKeys) => {
      await saveCryptographicKeysInEnvVars(cryptographicKeys)
      return cryptographicKeys
    })
    .catch((err) => {
      console.error(`Could not save Parent Org Cryptographic Keys due to: ${err}`)
      throw new Error(err)
    })
}

async function saveCryptographicKeysInEnvVars(keysToSave: { publicKey: string; privateKey: string }) {
  await fs
    .appendFile('.env', `\nPARENT_ORGANISATION_PUBLIC_KEY=${keysToSave.publicKey}\nPARENT_ORGANISATION_PRIVATE_KEY=${keysToSave.privateKey}`)
    .then(() => {
      console.log('Parent Org Cryptographic keys created and saved in .env file')
    })
    .catch((err) => {
      console.error(`Could not write cryptographic keys in .env file due to ${err}}`)
      throw new Error(err)
    })
}
