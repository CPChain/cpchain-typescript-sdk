import { CPChainNetwork, TestnetNetwork } from '../networks'
import { ListResults, Network, Networkish } from '../types'
import { xfetch } from '../utils'

/**
 * Transaction return from centralized service
 */
export interface TransactionResult {
  value: number
  time: number
  txhash: string
  from: string
  to: string
  flag: 'in' | 'out'
  txfee: number
  block: number
  status: 0 | 1
  input: string
}

export type GetHistoryProps = {
  limit?: number // default 20
  page?: number // initial is 1
  others?: {[key: string]: unknown}
}

export interface CPCScanProvider {
  getBaseUrl(): string
  /**
   * Detect network
   */
  detectNetwork(): Promise<Network>
  /**
   * Get all transactions of  Window size is 10,000
   * @param addressOrName address or name (this function will got address from the CNS)
   */
  getHistory(addressOrName: string | Promise<string>, props: GetHistoryProps): Promise<ListResults<TransactionResult>>
}

export class CPCScanProviderImpl implements CPCScanProvider {
  private network: Network
  constructor (networkish: Networkish) {
    if (typeof networkish !== 'string') {
      this.network = networkish as Network
    } else if (networkish === 'CPChain') {
      this.network = CPChainNetwork
    } else if (networkish === 'Testnet') {
      this.network = TestnetNetwork
    } else {
      throw new Error(`Don't find ${networkish}`)
    }
  }

  private getUrl (path: string) {
    const base = this.getBaseUrl()
    const lastOfBase = base[base.length - 1]
    if (!path) {
      return base
    }
    if (lastOfBase === '/' && path[0] === '/') {
      path = path.substring(1)
    } else if (lastOfBase !== '/' && path[0] !== '/') {
      path = '/' + path
    }
    return this.getBaseUrl() + path
  }

  async detectNetwork (): Promise<Network> {
    return this.network
  }

  async getHistory (addressOrName: string | Promise<string>, props?: GetHistoryProps): Promise<ListResults<TransactionResult>> {
    const limit = (props?.limit || 20)
    const page = props?.page === undefined ? 1 : props.page
    const params = new URLSearchParams({
      address: addressOrName as string,
      limit: '' + limit,
      page: '' + page,
      ...(props?.others || {})
    })
    const response = await xfetch(this.getUrl('/chain/tx/?') + params)
    const res = await response.json()
    return res as any
  }

  getBaseUrl (): string {
    return this.network.centralizedOpts.baseUrl
  }
}

export interface CreateCPCScanProviderProps {
  networkish: Networkish
}

export const createCPCScanProvider = ({ networkish }: CreateCPCScanProviderProps) => {
  return new CPCScanProviderImpl(networkish)
}
