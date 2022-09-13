import { ethers } from 'ethers'
import { CPCWallet, defaultPath } from './wallet'
import { decryptRN } from './rn-scrypt'
export * from './wallet'

export default {
  CPCWallet,
  createWallet (path: string | null = defaultPath): CPCWallet {
    const wallet = ethers.Wallet.createRandom({
      path: path
    })
    return new CPCWallet(wallet)
  },
  createByPrivateKey (privateKey?: string, provider?: ethers.providers.Provider): CPCWallet {
    if (!privateKey) {
      privateKey = ethers.Wallet.createRandom().privateKey
    }
    return new CPCWallet(new ethers.Wallet(privateKey, provider))
  },
  fromMnemonic (mnemonic: string, path?: string): CPCWallet {
    if (!path) {
      path = defaultPath
    }
    return new CPCWallet(ethers.Wallet.fromMnemonic(mnemonic, path))
  },
  fromEncryptedJson (json: string, password: string): Promise<CPCWallet> {
    return ethers.Wallet.fromEncryptedJson(json, password).then(wallet => {
      return new CPCWallet(wallet)
    })
  },
  fromEncryptedJsonSync (json: string, password: string): CPCWallet {
    return new CPCWallet(ethers.Wallet.fromEncryptedJsonSync(json, password))
  },
  // support react-native
  rn: {
    // While there exist scrypt implementations written in javascript they are extremely slow and impractical for use in mobile apps.
    // This method is for use with React Native and allows your application to use scrypt on iOS/Android devices using native C code, achieving orders of magnitude faster calculation.
    // It is based on libscrypt.
    // This method return an wallet, when use this wallet to encrypt, is also use the Scrypt written in C.
    fromEncryptedJson (json: string, password: string): Promise<CPCWallet> {
      return decryptRN(json, password, null).then((wallet: any) => {
        return new CPCWallet(wallet)
      })
    }
  }

}
