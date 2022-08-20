
/**
 * For distinguish those incompatible networks, e.g. ethereum and cpchain
 */
export interface NetworkType {
  name: string
  logo?: string
  path?: string
}

/**
 * Options for centralized service
 */
export interface CentralizedOptions {
  baseUrl: string
}

/**
 * Network, we define a network as a chain that has nodes and own chainId
 * Every network has decentralized nodes, and centralized service
 */
export interface Network {
  type: NetworkType
  name: string // 链名称，非链类型名称
  isTestnet?: boolean // 是否为测试链
  chainId: number
  nodes: string[]
  centralizedOpts: CentralizedOptions
}

/**
 * You can define a specified network or use a name to represent networks which we already know,
 * e.g. 'CPChain', 'Testnet'(CPC)
 */
export type Networkish = Network | 'CPChain' | 'Testnet';
