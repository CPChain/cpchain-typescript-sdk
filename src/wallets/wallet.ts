import { ethers } from 'ethers'
import { serializeCPC, UnsignedCPCTransaction, CPCTransactionRequest } from './tx'
import { version } from '../_vertion'
import { encryptRN } from './rn-scrypt'
import { ReactNativeAdapter } from './types'

export * from './tx'

const logger = new ethers.utils.Logger(version)

const getAddress = ethers.utils.getAddress
const resolveProperties = ethers.utils.resolveProperties
export const keccak256 = ethers.utils.keccak256

export const defaultPath = "m/44'/337'/0'/0/0"

export type TransactionRequest = ethers.providers.TransactionRequest

export interface CPCWalletProps {
  isRN?: boolean // 是否为 react-native 环境
  rnAdapter?: ReactNativeAdapter
}

export class CPCWallet extends ethers.Signer {
  private wallet: ethers.Wallet
  private _provider?: ethers.providers.Provider
  private props?: CPCWalletProps

  constructor (wallet: ethers.Wallet, props?: CPCWalletProps) {
    super()
    this.wallet = wallet
    this.props = props
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
    if (this.props?.isRN) {
      return encryptRN(this.wallet.privateKey, password, {
        client: 'cpchain-typescript-sdk',
        path: defaultPath
      }, null, this.props.rnAdapter)
    }
    return this.wallet.encrypt(password)
  }

  connect (provider: ethers.providers.Provider): CPCWallet {
    ethers.utils.defineReadOnly(this, 'provider', provider || null)
    this._provider = provider
    return this
  }

  protected resolveTx (transaction: ethers.providers.TransactionRequest): Promise<UnsignedCPCTransaction> {
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

  signTransaction (transaction: TransactionRequest): Promise<string> {
    return this.resolveTx(transaction).then(tx => {
      const signature = this.wallet._signingKey().signDigest(keccak256(serializeCPC(<UnsignedCPCTransaction>tx)))
      return serializeCPC(<UnsignedCPCTransaction>tx, signature)
    })
  }

  hash (transaction: TransactionRequest): Promise<string> {
    return this.resolveTx(transaction).then(tx => {
      return keccak256(serializeCPC(<UnsignedCPCTransaction>tx))
    })
  }
}
