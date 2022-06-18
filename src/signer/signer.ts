
import { ADDRESS, UINT256 } from '../types'

export type SignedTransaction = string

export type SignRequest = {
  amount: UINT256
  to: ADDRESS
  data: string
}

export interface ISigner {
  /**
   * Sign a transaction.
   * @param req sign request
   */
  sign(req: SignRequest): Promise<SignedTransaction>
}
