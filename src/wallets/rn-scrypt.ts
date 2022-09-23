/**
 * Used for react-native app
 * A wrapper for react-native scrypt
 */

import { ethers } from 'ethers'
import { arrayify, entropyToMnemonic, getAddress, keccak256, mnemonicToEntropy } from 'ethers/lib/utils'
import { concatBytes, hexlify, looseArrayify, toUtf8Bytes, UnicodeNormalizationForm, uuid, zpad } from '../utils'
import aes from 'aes-js'
import pbkdf2 from '@ethersproject/pbkdf2'
import { ReactNativeAdapter } from './types'

export const defaultPath = "m/44'/337'/0'/0/0"

function getPassword (password: any) {
  if (typeof (password) === 'string') {
    return toUtf8Bytes(password, UnicodeNormalizationForm.NFKC)
  }
  return arrayify(password)
}

// Search an Object and its children recursively, caselessly.
function searchPath (object: any, path: string) {
  let currentChild = object
  const comps = path.toLowerCase().split('/')
  for (let i = 0; i < comps.length; i++) {
    // Search for a child object with a case-insensitive matching key
    let matchingChild = null
    for (const key in currentChild) {
      if (key.toLowerCase() === comps[i]) {
        matchingChild = currentChild[key]
        break
      }
    }
    // Didn't find one. :'(
    if (matchingChild === null) {
      return null
    }
    // Now check this child...
    currentChild = matchingChild
  }
  return currentChild
}

function isType (object: any, type: any) {
  return (object && object._ethersType === type)
}

const isSigningKey = function (value: any) {
  return isType(value, 'SigningKey')
}

function randomBytes (length: number) {
  if (length <= 0 || length > 1024 || parseInt(String(length)) !== length) {
    throw new Error('invalid length')
  }
  const result = new Uint8Array(length)
  crypto.getRandomValues(result)
  return arrayify(result)
}

export function encryptRN (privateKey: any, password: string, options: any, progressCallback: any, adapter?: ReactNativeAdapter) {
  // the options are optional, so adjust the call as needed
  if (typeof (options) === 'function' && !progressCallback) {
    progressCallback = options
    options = {}
  }
  if (!options) {
    options = {}
  }
  // Check the private key
  let privateKeyBytes: any = null
  if (isSigningKey(privateKey)) {
    privateKeyBytes = arrayify(privateKey.privateKey)
  } else {
    privateKeyBytes = arrayify(privateKey)
  }
  if (privateKeyBytes.length !== 32) {
    throw new Error('invalid private key')
  }
  // let passwordBytes = getPassword(password)
  let entropy: any = null
  if (options.entropy) {
    entropy = arrayify(options.entropy)
  }
  if (options.mnemonic) {
    if (entropy) {
      if (entropyToMnemonic(entropy) !== options.mnemonic) {
        throw new Error('entropy and mnemonic mismatch')
      }
    } else {
      entropy = arrayify(mnemonicToEntropy(options.mnemonic))
    }
  }
  let path = options.path
  if (entropy && !path) {
    path = defaultPath
  }
  let client = options.client
  if (!client) {
    client = 'ethers.js'
  }
  // Check/generate the salt
  let salt: any = null
  if (options.salt) {
    salt = arrayify(options.salt)
  } else {
    salt = randomBytes(32)
  }
  // Override initialization vector
  let iv: any = null
  if (options.iv) {
    iv = arrayify(options.iv)
    if (iv.length !== 16) {
      throw new Error('invalid iv')
    }
  } else {
    iv = randomBytes(16)
  }
  // Override the uuid
  let uuidRandom: any = null
  if (options.uuid) {
    uuidRandom = arrayify(options.uuid)
    if (uuidRandom.length !== 16) {
      throw new Error('invalid uuid')
    }
  } else {
    uuidRandom = randomBytes(16)
  }
  // Override the scrypt password-based key derivation function parameters
  let N = (1 << 17)
  let r = 8
  let p = 1
  if (options.scrypt) {
    if (options.scrypt.N) {
      N = options.scrypt.N
    }
    if (options.scrypt.r) {
      r = options.scrypt.r
    }
    if (options.scrypt.p) {
      p = options.scrypt.p
    }
  }
  return new Promise(function (resolve: (privKey: string) => void, reject: any) {
    if (progressCallback) {
      progressCallback(0)
    }
    // We take 64 bytes:
    //   - 32 bytes   As normal for the Web3 secret storage (derivedKey, macPrefix)
    //   - 32 bytes   AES key to encrypt mnemonic with (required here to be Ethers Wallet)

    const saltNew: any = []
    salt.forEach((element: any) => {
      saltNew.push(element)
    })

    adapter?.scrypt(password, saltNew, N, r, p, 64).then((key:any) => {
      if (key) {
        key = arrayify('0x' + key)
        // This will be used to encrypt the wallet (as per Web3 secret storage)
        const derivedKey = key.slice(0, 16)
        const macPrefix = key.slice(16, 32)
        // This will be used to encrypt the mnemonic phrase (if any)
        const mnemonicKey = key.slice(32, 64)
        // Get the address for this private key
        const address = (new ethers.Wallet(privateKeyBytes)).address
        // Encrypt the private key
        const counter = new aes.Counter(iv)
        // eslint-disable-next-line new-cap
        const aesCtr = new aes.ModeOfOperation.ctr(derivedKey, counter)
        const ciphertext = arrayify(aesCtr.encrypt(privateKeyBytes))
        // Compute the message authentication code, used to check the password
        const mac = keccak256(concatBytes([macPrefix, ciphertext]))
        // See: https://github.com/ethereum/wiki/wiki/Web3-Secret-Storage-Definition
        const data: any = {
          address: address.substring(2).toLowerCase(),
          id: uuid.v4({ random: uuidRandom }),
          version: 3,
          Crypto: {
            cipher: 'aes-128-ctr',
            cipherparams: {
              iv: hexlify(iv).substring(2)
            },
            ciphertext: hexlify(ciphertext).substring(2),
            kdf: 'scrypt',
            kdfparams: {
              salt: hexlify(salt).substring(2),
              n: N,
              dklen: 32,
              p: p,
              r: r
            },
            mac: mac.substring(2)
          }
        }
        // If we have a mnemonic, encrypt it into the JSON wallet
        if (entropy) {
          const mnemonicIv = randomBytes(16)
          const mnemonicCounter = new aes.Counter(mnemonicIv)
          // eslint-disable-next-line new-cap
          const mnemonicAesCtr = new aes.ModeOfOperation.ctr(mnemonicKey, mnemonicCounter)
          const mnemonicCiphertext = arrayify(mnemonicAesCtr.encrypt(entropy))
          const now = new Date()
          const timestamp = (now.getUTCFullYear() + '-' +
              zpad(now.getUTCMonth() + 1, 2) + '-' +
              zpad(now.getUTCDate(), 2) + 'T' +
              zpad(now.getUTCHours(), 2) + '-' +
              zpad(now.getUTCMinutes(), 2) + '-' +
              zpad(now.getUTCSeconds(), 2) + '.0Z')
          data['x-ethers'] = {
            client: client,
            gethFilename: ('UTC--' + timestamp + '--' + data.address),
            mnemonicCounter: hexlify(mnemonicIv).substring(2),
            mnemonicCiphertext: hexlify(mnemonicCiphertext).substring(2),
            path: path,
            version: '0.1'
          }
        }
        if (progressCallback) {
          progressCallback(1)
        }
        resolve(JSON.stringify(data))
      }
    }).catch((e: any) => reject(e))
  })
}

export function decryptRN (json: string, password: string, progressCallback: any, adapter?: ReactNativeAdapter) {
  const data = JSON.parse(json)
  const passwordBytes = getPassword(password)
  const decrypt = function (key: any, ciphertext: any) {
    const cipher = searchPath(data, 'crypto/cipher')
    if (cipher === 'aes-128-ctr') {
      const iv = looseArrayify(searchPath(data, 'crypto/cipherparams/iv'))
      const counter = new aes.Counter(iv)
      // eslint-disable-next-line new-cap
      const aesCtr = new aes.ModeOfOperation.ctr(key as any, counter)
      return arrayify(aesCtr.decrypt(ciphertext))
    }
    return null
  }
  const computeMAC = function (derivedHalf: any, ciphertext: any) {
    return keccak256(concatBytes([derivedHalf, ciphertext]))
  }
  const getSigningKey = function (key: any, reject: any) {
    const ciphertext = looseArrayify(searchPath(data, 'crypto/ciphertext'))
    const computedMAC = hexlify(computeMAC(key.slice(16, 32), ciphertext))
      .substring(2)
    if (computedMAC !== searchPath(data, 'crypto/mac').toLowerCase()) {
      reject(new Error('invalid password'))
      return null
    }
    const privateKey = decrypt(key.slice(0, 16), ciphertext)
    const mnemonicKey = key.slice(32, 64)
    if (!privateKey) {
      reject(new Error('unsupported cipher'))
      return null
    }

    let signingKey = new ethers.Wallet(privateKey)
    if (signingKey.address !== getAddress(data.address)) {
      reject(new Error('address mismatch'))
      return null
    }
    // Version 0.1 x-ethers metadata must contain an encrypted mnemonic phrase
    if (searchPath(data, 'x-ethers/version') === '0.1') {
      const mnemonicCiphertext = looseArrayify(
        searchPath(data, 'x-ethers/mnemonicCiphertext')
      )
      const mnemonicIv = looseArrayify(
        searchPath(data, 'x-ethers/mnemonicCounter')
      )
      const mnemonicCounter = new aes.Counter(mnemonicIv)
      // eslint-disable-next-line new-cap
      const mnemonicAesCtr = new aes.ModeOfOperation.ctr(
        mnemonicKey,
        mnemonicCounter
      )
      const path = searchPath(data, 'x-ethers/path') || defaultPath
      const entropy = arrayify(
        mnemonicAesCtr.decrypt(mnemonicCiphertext)
      )
      const mnemonic = entropyToMnemonic(entropy)
      const node = ethers.Wallet.fromMnemonic(mnemonic, path)
      if (node.privateKey !== hexlify(privateKey)) {
        reject(new Error('mnemonic mismatch'))
        return null
      }
      signingKey = node
    }
    return signingKey
  }
  return new Promise(function (resolve: (w: ethers.Wallet) => void, reject) {
    const kdf = searchPath(data, 'crypto/kdf')
    if (kdf && typeof kdf === 'string') {
      if (kdf.toLowerCase() === 'scrypt') {
        const salt = looseArrayify(searchPath(data, 'crypto/kdfparams/salt'))
        const N = parseInt(searchPath(data, 'crypto/kdfparams/n'))
        const r = parseInt(searchPath(data, 'crypto/kdfparams/r'))
        const p = parseInt(searchPath(data, 'crypto/kdfparams/p'))
        if (!N || !r || !p) {
          reject(new Error('unsupported key-derivation function parameters'))
          return
        }
        // Make sure N is a power of 2
        if ((N & (N - 1)) !== 0) {
          reject(
            new Error(
              'unsupported key-derivation function parameter value for N'
            )
          )
          return
        }
        const dkLen = parseInt(searchPath(data, 'crypto/kdfparams/dklen'))
        if (dkLen !== 32) {
          reject(new Error('unsupported key-derivation derived-key length'))
          return
        }
        if (progressCallback) {
          progressCallback(0)
        }
        const saltNew: any = []
        salt.forEach((element: any) => {
          saltNew.push(element)
        })

        adapter?.scrypt(password, saltNew, N, r, p, 64)
          .then((key: any) => {
            if (key) {
              key = arrayify('0x' + key)
              const signingKey = getSigningKey(key, reject)
              if (!signingKey) {
                return
              }
              if (progressCallback) {
                progressCallback(1)
              }
              resolve(signingKey)
            }
          })
          .catch((e: any) => reject(e))
      } else if (kdf.toLowerCase() === 'pbkdf2') {
        const salt = looseArrayify(searchPath(data, 'crypto/kdfparams/salt'))
        let prfFunc = null
        const prf = searchPath(data, 'crypto/kdfparams/prf')
        if (prf === 'hmac-sha256') {
          prfFunc = 'sha256'
        } else if (prf === 'hmac-sha512') {
          prfFunc = 'sha512'
        } else {
          reject(new Error('unsupported prf'))
          return
        }
        const c = parseInt(searchPath(data, 'crypto/kdfparams/c'))
        const dkLen = parseInt(searchPath(data, 'crypto/kdfparams/dklen'))
        if (dkLen !== 32) {
          reject(new Error('unsupported key-derivation derived-key length'))
          return
        }
        const key = pbkdf2.pbkdf2(passwordBytes, salt, c, dkLen, prfFunc)
        const signingKey = getSigningKey(key, reject)
        if (!signingKey) {
          return
        }
        resolve(signingKey)
      } else {
        reject(new Error('unsupported key-derivation function'))
      }
    } else {
      reject(new Error('unsupported key-derivation function'))
    }
  })
}
