import { Contract } from 'ethers'
import { WalletSigner } from '../..'
import { CPCJsonRpcProvider, TransactionResponse } from '../../providers'
import { address } from '../../types'
import { simpleEncode } from '../../utils/abi'
import { IdentityV1, IIdentityService } from './types'
export const IdentityABI = ''

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

  createIdentityV1 (options: Partial<IdentityV1>): IdentityV1 {}

  getPublicKeyV1 (privateKeyBase64: string): string {
    const privateKey = Buffer.from(base64.decode(privateKeyBase64), 'hex')
    const publicKey = eccCrypto.getPublic(privateKey)
    const publicBase64 = base64.encode(publicKey.toString('hex'))
    return publicBase64
  }

  getIdentityV1 (address: string): Promise<IdentityV1 | null> {
    throw new Error('Method not implemented.')
  }

  registerV1 (
    signer: WalletSigner,
    dappRegistration: IdentityV1
  ): Promise<IdentityV1> {
    const signedTransaction = await signer.sign({
      amount: utils.parseCPC('' + amount),
      to: this.contractAddress,
      data: data
    })
    return this.provider.sendTransaction(signedTransaction)
  }
}
