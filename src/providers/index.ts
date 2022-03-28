import { BytesLike, ethers } from 'ethers'
import fetch from 'cross-fetch'

export class CPCTransactionResponse implements ethers.providers.TransactionResponse {
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

  constructor (hash: string, provider: ethers.providers.Provider, nonce?: number, from?: string) {
    this.hash = hash
    this.provider = provider
    this.confirmations = 3
    this.from = from || ''
    this.nonce = nonce || 0
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

const networks = [
  {
    name: 'Mainnet',
    chainId: 337,
    ensAddress: 'https://civilian.cpchain.io'
  }, {
    name: 'Testnet',
    chainId: 41,
    ensAddress: 'https://testnet.civilian.cpchain.io'
  }
]

function handleNumber (value: string): ethers.BigNumber {
  if (value === '0x') { return ethers.constants.Zero }
  return ethers.BigNumber.from(value)
}

function _parseNonce (rawTransaction: ethers.BytesLike): {
  nonce: number,
  from: string
} {
  const payload = ethers.utils.arrayify(rawTransaction)
  const transaction = ethers.utils.RLP.decode(payload)

  // from
  let chainId = 0
  let fromAddr = ''
  let v = ethers.BigNumber.from(transaction[7]).toNumber()
  const r = ethers.utils.hexZeroPad(transaction[8], 32)
  const s = ethers.utils.hexZeroPad(transaction[9], 32)

  if (ethers.BigNumber.from(r).isZero() && ethers.BigNumber.from(s).isZero()) {
    // EIP-155 unsigned transaction
    chainId = v
    v = 0
  } else {
    // Signed Transaction
    chainId = Math.floor((v - 35) / 2)
    if (chainId < 0) { chainId = 0 }

    let recoveryParam = v - 27

    const raw = transaction.slice(0, 7)

    if (chainId !== 0) {
      raw.push(ethers.utils.hexlify(chainId))
      raw.push('0x')
      raw.push('0x')
      recoveryParam -= chainId * 2 + 8
    }

    const digest = ethers.utils.keccak256(ethers.utils.RLP.encode(raw))
    fromAddr = ethers.utils.recoverAddress(digest, { r: ethers.utils.hexlify(r), s: ethers.utils.hexlify(s), recoveryParam: recoveryParam })
  }

  return {
    nonce: handleNumber(transaction[1]).toNumber(),
    from: fromAddr
  }
}

class CPCJsonRpcProvider extends ethers.providers.JsonRpcProvider {
  private _url: string

  constructor (url: string, network?: ethers.providers.Networkish) {
    super(url, network)
    this._url = url
  }

  detectNetwork (): Promise<ethers.providers.Network> {
    return this.getNetwork()
  }

  getNetwork (): Promise<ethers.providers.Network> {
    const network = networks.find(network => network.ensAddress === this._url) || {
      name: 'Unknown',
      chainId: this._network && this._network.chainId,
      ensAddress: this._url
    }
    return Promise.resolve(network)
  }

  sendTransaction (signedTransaction: string | Promise<string>): Promise<ethers.providers.TransactionResponse> {
    const tx = _parseNonce(<BytesLike>signedTransaction)
    return fetch(this._url, {
      method: 'POST',
      headers: { 'Content-type': 'application/json;charset=UTF-8' },
      body: `{"jsonrpc":"2.0","method":"eth_sendRawTransaction","params":["${signedTransaction}"],"id":1}`
    }).then(async response => {
      const res = await response.json()
      if ((<RPCError>res).error) {
        throw new Error((<RPCError>res).error.message)
      }
      return <ethers.providers.TransactionResponse>(new CPCTransactionResponse((<RPCResult>(res)).result, this, tx.nonce, tx.from))
    })
  }
}

function createJsonRpcProvider (url: string = 'https://civilian.cpchain.io', chainID: number = 337): CPCJsonRpcProvider {
  return new CPCJsonRpcProvider(url, chainID)
}

export {
  createJsonRpcProvider
}
