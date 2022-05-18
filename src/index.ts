import * as providers from './providers'
import wallets from './wallets'
import utils from './utils'
import contract from './contract'
export { BigNumber } from 'ethers'
export { type CPCWallet } from './wallets'
export { type CPCJsonRpcProvider } from './providers'

export default {
  providers,
  wallets,
  utils,
  contract
}
