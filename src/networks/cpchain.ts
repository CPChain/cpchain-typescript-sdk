import { Network } from '../types'
import { CPChainNetworkType } from './types'

export const CPChainNetwork: Network = {
  type: CPChainNetworkType,
  name: 'CPChain',
  chainId: 337,
  nodes: [
    'https://civilian.cpchain.io'
  ],
  centralizedOpts: {
    baseUrl: 'https://api.cpchain.io'
  }
}
