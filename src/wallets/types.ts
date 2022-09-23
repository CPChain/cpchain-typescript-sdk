
import { ethers } from 'ethers'

// This interface provide several methods for react-native, e.g. scrypt
// Please use react-native-scrypt
// e.g.
//
// import scrypt from 'react-native-scrypt'
// import { pbkdf2 } from '@ethersproject/pbkdf2'
// import cpc from 'cpchain-typescript-sdk'
// cpc.wallets.rn({scrypt, pbkdf2}).from...
export interface ReactNativeAdapter {
  scrypt: (password: string, salt: number[], cost?: number, blocksize?: number, parallel?: number, length?: number) => Promise<string>
  pbkdf2(password: ethers.utils.BytesLike, salt: ethers.utils.BytesLike, iterations: number, keylen: number, hashAlgorithm: string): string
}
