import { Network } from '../types'
import { CPChainNetworkType } from './types'

export const TestnetNetwork: Network = {
  type: CPChainNetworkType,
  name: 'Testnet',
  chainId: 41,
  nodes: [
    'https://civilian.testnet.cpchain.io'
  ],
  centralizedOpts: {
    baseUrl: 'https://api.testnet.cpchain.io'
  }
}
