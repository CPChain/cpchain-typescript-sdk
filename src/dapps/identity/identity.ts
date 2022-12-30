import { BigNumber, Contract } from 'ethers'
import { WalletSigner } from '../..'
import { Base64 } from '../../lib'
import { generatePrivate, getPublic } from '@cpchain-tools/ecc'
import { CPCJsonRpcProvider, TransactionResponse } from '../../providers'
import { address } from '../../types'
import { simpleEncode } from '../../utils/abi'
import { IdentityV1, IIdentityService } from './types'
export const IdentityABI = '[{"constant":true,"inputs":[],"name":"count","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"enabled","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[],"name":"enableContract","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[],"name":"disableContract","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[],"name":"remove","outputs":[],"payable":true,"stateMutability":"payable","type":"function"},{"constant":true,"inputs":[{"name":"addr","type":"address"}],"name":"get","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"content","type":"string"}],"name":"register","outputs":[],"payable":true,"stateMutability":"payable","type":"function"},{"inputs":[],"payable":false,"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":false,"name":"who","type":"address"},{"indexed":false,"name":"identity","type":"string"}],"name":"NewIdentity","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"who","type":"address"},{"indexed":false,"name":"identity","type":"string"}],"name":"UpdateIdentity","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"who","type":"address"}],"name":"RemoveIdentity","type":"event"}]'

export class IdentityService implements IIdentityService {
  private contractAddress: address;
  private provider: CPCJsonRpcProvider;
  private contractIns: Contract;

  constructor (provider: CPCJsonRpcProvider, contractAddress: address) {
    this.contractAddress = contractAddress
    this.provider = provider
    this.contractIns = new Contract(
      this.contractAddress,
      IdentityABI,
      this.provider
    )
  }

  createIdentityV1 (options: Partial<IdentityV1>): Partial<IdentityV1> {
    const privateKey = generatePrivate()
    const publicKey = getPublic(privateKey)
    const privateBase64 = Base64.encode(privateKey.toString('hex'))
    const publicBase64 = Base64.encode(publicKey.toString('hex'))
    return {
      ...options,
      privateKey: privateBase64,
      publicKey: publicBase64
    }
  }

  getPublicKeyV1 (privateKeyBase64: string): string {
    const privateKey = Buffer.from(Base64.decode(privateKeyBase64), 'hex')
    const publicKey = getPublic(privateKey)
    const publicBase64 = Base64.encode(publicKey.toString('hex'))
    return publicBase64
  }

  async getIdentityV1 (address: string): Promise<IdentityV1 | null> {
    try {
      const result = await this?.contractIns.get(address)
      return JSON.parse(result)
    } catch (_error:any) {
      /**
       * 合约设定查询未注册的人会有call revert exception异常，此处封装异常
       */
      if (_error.message.includes('call revert exception')) { return null } else throw _error
    }
  }

  async registerV1 (
    signer: WalletSigner,
    dappRegistration: IdentityV1
  ): Promise<TransactionResponse> {
    const signedTransaction = await signer.sign({
      amount: BigNumber.from(0),
      to: this.contractAddress,
      data: '0x' + simpleEncode(
        'register(string)',
        JSON.stringify({
          pub_key: dappRegistration.publicKey,
          name: dappRegistration.name
        })
      ).toString('hex')
    })
    return this.provider.sendTransaction(signedTransaction)
  }
}
