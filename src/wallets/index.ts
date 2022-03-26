import { ethers } from 'ethers'
import { serializeCPC, UnsignedCPCTransaction, TransactionRequest } from './tx'
import { version } from '../_vertion'
const logger = new ethers.utils.Logger(version)

const getAddress = ethers.utils.getAddress
const resolveProperties = ethers.utils.resolveProperties
const keccak256 = ethers.utils.keccak256

export const defaultPath = "m/44'/337'/0'/0/0"

export class CPCWallet {
  private wallet: ethers.Wallet

  constructor (wallet: ethers.Wallet) {
    this.wallet = wallet
  }

  get address (): string {
    return this.wallet.address
  }

  encrypt (password: string) {
    return this.wallet.encrypt(password)
  }

  private resolveTx (transaction: TransactionRequest): Promise<UnsignedCPCTransaction> {
    return resolveProperties(transaction).then((tx) => {
      if (tx.from != null) {
        if (getAddress(tx.from) !== this.address) {
          logger.throwArgumentError('transaction from address mismatch', 'transaction.from', transaction.from)
        }
        delete tx.from
      }

      return <UnsignedCPCTransaction>tx
    })
  }

  hashTrasaction (transaction: TransactionRequest): Promise<String> {
    return this.resolveTx(transaction).then(tx => {
      return keccak256(serializeCPC(tx))
    })
  }

  signTransaction (transaction: TransactionRequest): Promise<string> {
    return this.resolveTx(transaction).then(tx => {
      const signature = this.wallet._signingKey().signDigest(keccak256(serializeCPC(<UnsignedCPCTransaction>tx)))
      return serializeCPC(<UnsignedCPCTransaction>tx, signature)
    })
  }
}

export default {
  createWallet (privateKey?: string, provider?: ethers.providers.Provider): CPCWallet {
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
  async fromEcryptedJsonSync (json: string, password: string): Promise<CPCWallet> {
    return new CPCWallet(await ethers.Wallet.fromEncryptedJsonSync(json, password))
  }

}
