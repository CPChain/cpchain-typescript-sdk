import { ethers } from 'ethers'
import { arrayify, DataOptions, hexlify, isBytesLike, SignatureLike, splitSignature, stripZeros } from '@ethersproject/bytes'
import { checkProperties } from '@ethersproject/properties'
import * as RLP from '@ethersproject/rlp'
import { Logger } from '@ethersproject/logger'
import { version } from '../_vertion'
const logger = new Logger(version)

export type TransactionRequest = {
  to?: string,
  from?: string,
  nonce?: ethers.BigNumberish,

  gas?: ethers.BigNumberish,
  gasPrice?: ethers.BigNumberish,

  input?: ethers.BytesLike,
  value?: ethers.BigNumberish,
  chainId?: number

  type?: number;
}

export type UnsignedCPCTransaction = {
  to?: string;
  nonce?: number;

  gas?: ethers.BigNumberish;
  gasPrice?: ethers.BigNumberish;

  input?: ethers.BytesLike;
  value?: ethers.BigNumberish;
  chainId?: number;

  // Typed-Transaction features
  type?: number | null;
}

const allowedCPCTransactionKeys: { [ key: string ]: boolean } = {
  chainId: true, input: true, gas: true, gasPrice: true, nonce: true, to: true, value: true, type: true
}

const cpcTransactionFields = [
  { name: 'type', maxLength: 32, numeric: true },
  { name: 'nonce', maxLength: 32, numeric: true },
  { name: 'gasPrice', maxLength: 32, numeric: true },
  { name: 'gas', maxLength: 32, numeric: true },
  { name: 'to', length: 20 },
  { name: 'value', maxLength: 32, numeric: true },
  { name: 'input' }
]

function _serializeCPC (transaction: UnsignedCPCTransaction, signature?: SignatureLike): string {
  checkProperties(transaction, allowedCPCTransactionKeys)

  const raw: Array<string | Uint8Array> = []

  cpcTransactionFields.forEach(function (fieldInfo) {
    let value = (<any>transaction)[fieldInfo.name] || ([])
    const options: DataOptions = { }
    if (fieldInfo.numeric) { options.hexPad = 'left' }
    value = arrayify(hexlify(value, options))

    // Fixed-width field
    if (fieldInfo.length && value.length !== fieldInfo.length && value.length > 0) {
      logger.throwArgumentError('invalid length for ' + fieldInfo.name, ('transaction:' + fieldInfo.name), value)
    }

    // Variable-width (with a maximum)
    if (fieldInfo.maxLength) {
      value = stripZeros(value)
      if (value.length > fieldInfo.maxLength) {
        logger.throwArgumentError('invalid length for ' + fieldInfo.name, ('transaction:' + fieldInfo.name), value)
      }
    }
    raw.push(hexlify(value))
  })

  let chainId = 0
  if (transaction.chainId != null) {
    // A chainId was provided; if non-zero we'll use EIP-155
    chainId = transaction.chainId

    if (typeof (chainId) !== 'number') {
      logger.throwArgumentError('invalid transaction.chainId', 'transaction', transaction)
    }
  } else if (signature && !isBytesLike(signature) && signature.v && signature.v > 28) {
    // No chainId provided, but the signature is signing with EIP-155; derive chainId
    chainId = Math.floor((signature.v - 35) / 2)
  }

  // We have an EIP-155 transaction (chainId was specified and non-zero)
  if (chainId !== 0) {
    raw.push(hexlify(chainId)) // @TODO: hexValue?
    raw.push('0x')
    raw.push('0x')
  }

  // Requesting an unsigned transation
  if (!signature) {
    return RLP.encode(raw)
  }

  // The splitSignature will ensure the transaction has a recoveryParam in the
  // case that the signTransaction function only adds a v.
  const sig = splitSignature(signature)

  // We pushed a chainId and null r, s on for hashing only; remove those
  let v = 27 + sig.recoveryParam
  if (chainId !== 0) {
    raw.pop()
    raw.pop()
    raw.pop()
    v += chainId * 2 + 8

    // If an EIP-155 v (directly or indirectly; maybe _vs) was provided, check it!
    if (sig.v > 28 && sig.v !== v) {
      logger.throwArgumentError('transaction.chainId/signature.v mismatch', 'signature', signature)
    }
  } else if (sig.v !== v) {
    logger.throwArgumentError('transaction.chainId/signature.v mismatch', 'signature', signature)
  }

  raw.push(hexlify(v))
  raw.push(stripZeros(arrayify(sig.r)))
  raw.push(stripZeros(arrayify(sig.s)))

  return RLP.encode(raw)
}

export function serializeCPC (transaction: UnsignedCPCTransaction, signature?: SignatureLike): string {
  switch (transaction.type) {
    case 0:
      return _serializeCPC(transaction, signature)
    default:
      break
  }

  return logger.throwError(`unsupported transaction type: ${transaction.type}`, Logger.errors.UNSUPPORTED_OPERATION, {
    operation: 'serializeTransaction',
    transactionType: transaction.type
  })
}
