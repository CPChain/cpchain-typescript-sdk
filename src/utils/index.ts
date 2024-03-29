import { ethers } from 'ethers'
export * from './fetch'
export * from './utils'
export * from './rn-ethers'
export { default as uuid } from './uuid'
export * from './abi'
export * from './address'

export function toChecksumAddress (address: string): string {
  if (!ethers.utils.isHexString(address, 20)) {
    throw new Error(`Invalid address ${address}`)
  }
  address = address.toLowerCase()
  const chars = address.substring(2).split('')
  const expanded = new Uint8Array(40)
  for (let i = 0; i < 40; i++) {
    expanded[i] = chars[i].charCodeAt(0)
  }
  const hashed = ethers.utils.arrayify(ethers.utils.keccak256(expanded))

  for (let i = 0; i < 40; i += 2) {
    if ((hashed[i >> 1] >> 4) >= 8) {
      chars[i] = chars[i].toUpperCase()
    }
    if ((hashed[i >> 1] & 0x0f) >= 8) {
      chars[i + 1] = chars[i + 1].toUpperCase()
    }
  }

  return '0x' + chars.join('')
}

export function zpad (value: any, length: number) {
  value = String(value)
  while (value.length < length) {
    value = '0' + value
  }
  return value
}

export default {
  ...ethers.utils,
  // Wei to CPC
  formatCPC: ethers.utils.formatEther,
  // CPC to Wei
  parseCPC: ethers.utils.parseEther,
  toChecksumAddress
}
