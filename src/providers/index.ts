import { ethers } from 'ethers'
import fetch from 'node-fetch'

class CPCTransactionResponse implements ethers.providers.TransactionResponse {
  hash: string
  provider: ethers.providers.Provider
  blockNumber?: number | undefined
  blockHash?: string | undefined
  timestamp?: number | undefined
  confirmations: number
  from: string
  raw?: string | undefined
  to?: string | undefined
  nonce: number
  gasLimit: ethers.BigNumber
  gasPrice?: ethers.BigNumber | undefined
  data: string
  value: ethers.BigNumber
  chainId: number
  r?: string | undefined
  s?: string | undefined
  v?: number | undefined
  type?: number | null | undefined
  accessList?: ethers.utils.AccessList | undefined
  maxPriorityFeePerGas?: ethers.BigNumber | undefined
  maxFeePerGas?: ethers.BigNumber | undefined

  constructor (hash: string, provider: ethers.providers.Provider) {
    this.hash = hash
    this.provider = provider
    this.confirmations = 3
    this.from = ''
    this.nonce = 0
    this.gasLimit = ethers.BigNumber.from(0)
    this.data = ''
    this.value = ethers.BigNumber.from(0)
    this.chainId = 0
  }

  wait (confirmations?: number | undefined) : Promise<ethers.providers.TransactionReceipt> {
    return this.provider.waitForTransaction(this.hash, confirmations)
  }
}

interface RPCResult {
  result: string
}

interface RPCError {
  error: {
    code: number,
    message: string
  }
}

class CPCJsonRpcProvider extends ethers.providers.JsonRpcProvider {
  private _url: string

  constructor (url: string, network?: ethers.providers.Networkish) {
    super(url, network)
    this._url = url
  }

  sendTransaction (signedTransaction: string | Promise<string>): Promise<ethers.providers.TransactionResponse> {
    return fetch(this._url, {
      method: 'POST',
      headers: { 'Content-type': 'application/json;charset=UTF-8' },
      body: `{"jsonrpc":"2.0","method":"eth_sendRawTransaction","params":["${signedTransaction}"],"id":1}`
    }).then(async response => {
      const res = await response.json()
      if ((<RPCError>res).error) {
        throw new Error((<RPCError>res).error.message)
      }
      return <ethers.providers.TransactionResponse>(new CPCTransactionResponse((<RPCResult>(res)).result, this))
    })
  }
}

function createJsonRpcProvider (url: string = 'https://civilian.cpchain.io'): CPCJsonRpcProvider {
  return new CPCJsonRpcProvider(url)
}

export {
  createJsonRpcProvider
}
