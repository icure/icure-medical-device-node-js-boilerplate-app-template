import express from 'express'
import * as dotenv from 'dotenv'
dotenv.config()

import * as bodyParser from 'body-parser'
import 'isomorphic-fetch'
import { getICureApi } from './services/ICureApi'

const PORT = process.env.PORT ? Number(process.env.PORT) : 3000
const HOST = process.env.HOST || '127.0.0.1'

const app = express()
app.use(bodyParser.json())

app.get('/', async function (req, res) {
  const forceCryptKeysCreation = req.query.forceKeysCreation === 'true'

  const medTechApi = await getICureApi(forceCryptKeysCreation)
  const parentUser = await medTechApi.userApi.getLoggedUser()

  res.status(200).json(parentUser.marshal())
})

export const server = app.listen(PORT, HOST, async () => {
  console.log(`Server running on http://${HOST}:${PORT}/`)
})
