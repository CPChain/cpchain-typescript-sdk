import { BigNumber } from '../types'
import BN from 'bn.js'
import { BigNumberish } from 'ethers'

export function isHexPrefixed (str: string) {
  if (typeof str !== 'string') {
    return false
  }
  return str.slice(0, 2) === '0x'
}

export function stripHexPrefix (str: string) {
  if (typeof str !== 'string') {
    return str
  }
  return isHexPrefixed(str) ? str.slice(2) : str
}

export const zeros = function (bytes: number): Buffer {
  return Buffer.allocUnsafe(bytes).fill(0)
}

/**
 * Pads a `Buffer` with zeros till it has `length` bytes.
 * Truncates the beginning or end of input if its length exceeds `length`.
 * @param msg the value to pad (Buffer)
 * @param length the number of bytes the output should be
 * @param right whether to start padding form the left or right
 * @return (Buffer)
 */
export const setLength = function (msg: Buffer, length: number, right: boolean) {
  const buf = zeros(length)
  if (right) {
    if (msg.length < length) {
      msg.copy(buf)
      return buf
    }
    return msg.slice(0, length)
  } else {
    if (msg.length < length) {
      msg.copy(buf, length - msg.length)
      return buf
    }
    return msg.slice(-length)
  }
}

/**
 * Throws if input is not a buffer
 * @param {Buffer} input value to check
 */
export const assertIsBuffer = function (input: Buffer): void {
  if (!Buffer.isBuffer(input)) {
    const msg = `This method only supports Buffer but input was: ${input}`
    throw new Error(msg)
  }
}

/**
 * Right Pads a `Buffer` with trailing zeros till it has `length` bytes.
 * it truncates the end if it exceeds.
 * @param msg the value to pad (Buffer)
 * @param length the number of bytes the output should be
 * @return (Buffer)
 */
export const setLengthRight = function (msg: Buffer, length: number) {
  assertIsBuffer(msg)
  return setLength(msg, length, true)
}

export const fromHexString = (hexString: string) =>
  Uint8Array.from(Buffer.from(stripHexPrefix(hexString), 'hex'))

export const toHexString = (bytes: number[]) =>
  bytes.reduce((str, byte) => str + byte.toString(16).padStart(2, '0'), '')

export function toBigNumber (value: BN): BigNumber {
  return BigNumber.from(toHex(value))
}

export function toBN (value: BigNumberish): BN {
  const hex = BigNumber.from(value).toHexString()
  if (hex[0] === '-') {
    return (new BN('-' + hex.substring(3), 16))
  }
  return new BN(hex.substring(2), 16)
}

// Normalize the hex string
export function toHex (value: string | BN): string {
  // For BN, call on the hex string
  if (typeof value !== 'string') {
    return toHex(value.toString(16))
  }

  // If negative, prepend the negative sign to the normalized positive value
  if (value[0] === '-') {
    // Strip off the negative sign
    value = value.substring(1)

    // Cannot have multiple negative signs (e.g. '--0x04')
    if (value[0] === '-') { throw new Error(`invalid hex value: ${value}`) }

    // Call toHex on the positive component
    value = toHex(value)

    // Do not allow '-0x00'
    if (value === '0x00') { return value }

    // Negate the value
    return '-' + value
  }

  // Add a '0x' prefix if missing
  if (value.substring(0, 2) !== '0x') { value = '0x' + value }

  // Normalize zero
  if (value === '0x') { return '0x00' }

  // Make the string even length
  if (value.length % 2) { value = '0x0' + value.substring(2) }

  // Trim to smallest even-length string
  while (value.length > 4 && value.substring(0, 4) === '0x00') {
    value = '0x' + value.substring(4)
  }

  return value
}
