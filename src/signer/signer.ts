
import { ADDRESS, UINT256 } from '../types'

export type SignedTransaction = string

export type SignRequest = {
  amount: UINT256
  to: ADDRESS
  data: string
}

/**
 * @deprecated since 0.0.31, replace by Signer
 */
export interface ISigner {
  /**
   * Sign a transaction.
   * @param req sign request
   */
  sign(req: SignRequest): Promise<SignedTransaction>
}

export interface Signer {
  /**
   * Sign a transaction.
   * @param req sign request
   */
  sign(req: SignRequest): Promise<SignedTransaction>

}

// TODO batchSign移到Singer中，
export interface WalletSigner extends Signer {
  /**
   *
   * @param requests
   */
  batchSign(requests: SignRequest[]): Promise<SignedTransaction[]>
}
