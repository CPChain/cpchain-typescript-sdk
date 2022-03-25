import { ethers } from 'ethers'

export const defaultPath = "m/44'/337'/0'/0/0"

export default {
  createWallet (privateKey?: string, provider?: ethers.providers.Provider): ethers.Wallet {
    if (!privateKey) {
      privateKey = ethers.Wallet.createRandom().privateKey
    }
    return new ethers.Wallet(privateKey, provider)
  },
  fromMnemonic (mnemonic: string, path?: string): ethers.Wallet {
    if (!path) {
      path = defaultPath
    }
    return ethers.Wallet.fromMnemonic(mnemonic, path)
  },
  fromEncryptedJson (json: string, password: string): Promise<ethers.Wallet> {
    return ethers.Wallet.fromEncryptedJson(json, password)
  },
  async fromEcryptedJsonSync (json: string, password: string): Promise<ethers.Wallet> {
    return await ethers.Wallet.fromEncryptedJsonSync(json, password)
  }

}
