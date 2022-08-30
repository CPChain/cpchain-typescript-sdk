import { BigNumber } from 'ethers'

export * from './block'
export * from './networkish'
export * from './http'

/**
 * @deprecated since 0.0.31 replace by uint256
 */
export type UINT256 = BigNumber
export type uint256 = BigNumber
/**
 * @deprecated since 0.0.31
 */
export type BOOL = boolean
/**
 * @deprecated since 0.0.31 replace by address
 */
export type ADDRESS = string
export type address = string
/**
 * @deprecated since 0.0.31 replace by uint64
 */
export type UINT64 = number
export type uint64 = number
/**
 * @deprecated since 0.0.31 replace by uint8
 */
export type UINT8 = number
export type uint8 = number
/**
 * @deprecated since 0.0.31 replace by int8
 */
export type INT8 = number
export type int8 = number

export {
  BigNumber
}
