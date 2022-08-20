import * as providers from './providers'
import wallets from './wallets'
import utils from './utils'
import contract from './contract'
import { BigNumber } from 'ethers'
export { BigNumber } from 'ethers'
export { CPCWallet } from './wallets'
export * from './providers'
export { Contract, ContractFactory } from './contract'
export * from './signer'

export interface Receipt {
  to: string
  from: string
  gasUsed: BigNumber
  contractAddress: string | null
  transactionIndex: number
  logsBloom: string
  blockHash: string
  transactionHash: string
  blockNumber: number
  confirmations: number
  cumulativeGasUsed: BigNumber
  status: number // 1 success, 0 failed
  type: number
  byzantium: boolean
  logs: any[]
  events: any[]
}

export interface TxResult{
  hash: string
  wait(): Promise<Receipt>
}

export * from './types'

export default {
  providers,
  wallets,
  utils,
  contract
}
