import { ethers } from 'ethers'
import { serializeCPC, UnsignedCPCTransaction, CPCTransactionRequest } from './tx'
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

  private resolveTx (transaction: ethers.providers.TransactionRequest): Promise<UnsignedCPCTransaction> {
    const _tx: CPCTransactionRequest = {
      to: transaction.to,
      from: transaction.from,
      nonce: transaction.nonce,

      gas: transaction.gasLimit,
      gasPrice: transaction.gasPrice,

      input: transaction.data,
      value: transaction.value,
      chainId: transaction.chainId,
      type: 0
    }
    return resolveProperties(_tx).then((tx) => {
      if (tx.from != null) {
        if (getAddress(tx.from) !== this.address) {
          logger.throwArgumentError('transaction from address mismatch', 'transaction.from', tx.from)
        }
        delete tx.from
      }

      return <UnsignedCPCTransaction>tx
    })
  }

  signTransaction (transaction: ethers.providers.TransactionRequest): Promise<string> {
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
