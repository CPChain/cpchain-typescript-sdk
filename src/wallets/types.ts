// This interface provide several methods for react-native, e.g. scrypt
// Please use react-native-scrypt
// e.g.
//
// import scrypt from 'react-native-scrypt'
// import cpc from 'cpchain-typescript-sdk'
// cpc.wallets.rn({scrypt}).from...
export interface ReactNativeAdapter {
  scrypt: (password: string, salt: number[], cost?: number, blocksize?: number, parallel?: number, length?: number) => Promise<string>
}
