import * as providers from './providers'
import wallets from './wallets'
import utils from './utils'
import contract from './contract'
export { BigNumber } from 'ethers'
export { CPCWallet } from './wallets'
export { CPCJsonRpcProvider } from './providers'
export { Contract, ContractFactory } from './contract'

export default {
  providers,
  wallets,
  utils,
  contract
}
