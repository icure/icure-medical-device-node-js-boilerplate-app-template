import { StorageFacade } from '@icure/medical-device-sdk'
import { LocalStorage } from 'node-localstorage'

export class NodeLocalStorage implements StorageFacade<string> {
  private localStorage: LocalStorage
  constructor() {
    this.localStorage = new LocalStorage(process.env.LOCAL_STORAGE_LOCATION ?? './scratch/localStorage')
  }

  getItem(key: string): Promise<string | undefined> {
    const value = this.localStorage.getItem(key)
    return Promise.resolve(value === null ? undefined : value)
  }

  setItem(key: string, valueToStore: string): Promise<void> {
    this.localStorage.setItem(key, valueToStore)
    return Promise.resolve()
  }

  removeItem(key: string): Promise<void> {
    this.localStorage.removeItem(key)
    return Promise.resolve()
  }
}
