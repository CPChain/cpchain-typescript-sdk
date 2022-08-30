import { SignedTransaction, Signer } from '../signer'
import { address, uint256, uint8 } from '../types'

export interface Erc20Token {
  /**
   * Token name, e.g. CPChain
   */
  name (): string

  /**
   * Token symbol, e.g. CPC
   */
  symbol (): string

  /**
   * Returns the decimals places of the token.
   */
  decimals (): uint8

  /**
   * Get owner
   */
  owner (): address

  /**
   * Returns the amount of tokens in existence.
   */
  totalSupply (): uint256

  /**
   * Get balance of an account
   * @param address Account
   */
  balanceOf (account: address): uint256

  /**
   * Moves `amount` tokens from the caller's account to `to`.
   *
   * Returns a boolean value indicating whether the operation succeeded.
   */
  transfer (signer: Signer, to: address, amount: uint256): SignedTransaction

  /**
   * Returns the remaining number of tokens that `spender` will be
   * allowed to spend on behalf of `owner` through {transferFrom}. This is
   * zero by default.
   *
   * This value changes when {approve} or {transferFrom} are called.
   */
  allowance (owner: address, spender: address): uint256

  /**
   * Sets `amount` as the allowance of `spender` over the caller's tokens.
   *
   * Returns a boolean value indicating whether the operation succeeded.
   *
   * IMPORTANT: Beware that changing an allowance with this method brings the risk
   * that someone may use both the old and the new allowance by unfortunate
   * transaction ordering. One possible solution to mitigate this race
   * condition is to first reduce the spender's allowance to 0 and set the
   * desired value afterwards:
   * https://github.com/ethereum/EIPs/issues/20#issuecomment-263524729
   *
   */
  approve (signer: Signer, spender: address, amount: uint256): void

  /**
   * @dev Moves `amount` tokens from `from` to `to` using the
   * allowance mechanism. `amount` is then deducted from the caller's
   * allowance.
   *
   * Returns a boolean value indicating whether the operation succeeded.
   *
   */
  transferFrom (signer: Signer, from: address, to: address, amount: uint256): void
}
