import { ethers } from 'ethers'
import { serializeCPC, UnsignedCPCTransaction, CPCTransactionRequest } from './tx'
import { version } from '../_vertion'
const logger = new ethers.utils.Logger(version)

const getAddress = ethers.utils.getAddress
const resolveProperties = ethers.utils.resolveProperties
const keccak256 = ethers.utils.keccak256

export const defaultPath = "m/44'/337'/0'/0/0"

export class CPCWallet extends ethers.Signer {
  private wallet: ethers.Wallet
  private _provider?: ethers.providers.Provider

  constructor (wallet: ethers.Wallet) {
    super()
    this.wallet = wallet
  }

  get address (): string {
    return this.wallet.address
  }

  get mnemonic (): ethers.utils.Mnemonic {
    return this.wallet.mnemonic
  }

  get privateKey (): string {
    return this.wallet.privateKey
  }

  getAddress (): Promise<string> {
    return Promise.resolve(this.wallet.address)
  }

  signMessage (message: string | ethers.utils.Bytes): Promise<string> {
    throw new Error('Method not implemented.')
  }

  encrypt (password: string) {
    return this.wallet.encrypt(password)
  }

  connect (provider: ethers.providers.Provider): CPCWallet {
    ethers.utils.defineReadOnly(this, 'provider', provider || null)
    this._provider = provider
    return this
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
