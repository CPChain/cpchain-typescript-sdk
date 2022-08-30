// ABI Specification: https://docs.soliditylang.org/en/v0.8.16/abi-spec.html#basic-design
import { utils } from 'ethers'
import BN from 'bn.js'
import { fromHexString, isHexPrefixed, setLengthRight, stripHexPrefix, zeros } from './utils'

// Convert from short to canonical names
// FIXME: optimise or make this nicer?
function elementaryName (name: string) {
  if (name.startsWith('int[')) {
    return 'int256' + name.slice(3)
  } else if (name === 'int') {
    return 'int256'
  } else if (name.startsWith('uint[')) {
    return 'uint256' + name.slice(4)
  } else if (name === 'uint') {
    return 'uint256'
  } else if (name.startsWith('fixed[')) {
    return 'fixed128x128' + name.slice(5)
  } else if (name === 'fixed') {
    return 'fixed128x128'
  } else if (name.startsWith('ufixed[')) {
    return 'ufixed128x128' + name.slice(6)
  } else if (name === 'ufixed') {
    return 'ufixed128x128'
  }
  return name
}

function parseSignature (sig: string) {
  const tmp = /^(\w+)\((.*)\)$/.exec(sig)
  if (tmp?.length !== 3) {
    throw new Error('Invalid method signature')
  }

  const args = /^(.+)\):\((.+)$/.exec(tmp[2])

  if (args !== null && args.length === 3) {
    return {
      method: tmp[1],
      args: args[1].split(','),
      retargs: args[2].split(',')
    }
  }
  let params = tmp[2].split(',')
  if (params.length === 1 && params[0] === '') {
    // Special-case (possibly naive) fixup for functions that take no arguments.
    // TODO: special cases are always bad, but this makes the function return
    // match what the calling functions expect
    params = []
  }
  return {
    method: tmp[1],
    args: params
  }
}

const eventID = (name: string, types: string[]) => {
  // FIXME: use node.js util.format?
  const sig = name + '(' + types.map(elementaryName).join(',') + ')'
  return fromHexString(utils.keccak256(Buffer.from(sig)))
}

const methodID = (name: string, types: string[]) => {
  return eventID(name, types).slice(0, 4)
}

// Is a type an array?
function isArray (type: string) {
  return type.lastIndexOf(']') === type.length - 1
}

// Parse N in type[<N>] where "type" can itself be an array type.
function parseTypeArray (type: string) {
  const tmp = type.match(/(.*)\[(.*?)\]$/)
  if (tmp) {
    return tmp[2] === '' ? 'dynamic' : parseInt(tmp[2], 10)
  }
  return 0
}

function parseNumber (arg: string | number | BN) {
  const type = typeof arg
  if (type === 'string') {
    if (isHexPrefixed(arg as string)) {
      return new BN(stripHexPrefix(arg as string), 16)
    } else {
      return new BN(arg, 10)
    }
  } else if (type === 'number') {
    return new BN(arg)
  } else if ((arg as BN).toArray) {
    // assume this is a BN for the moment, replace with BN.isBN soon
    return arg as BN
  } else {
    throw new Error('Argument is not a number')
  }
}

// Parse N from type<N>
function parseTypeN (type: string) {
  const r = /^\D+(\d+)$/.exec(type)
  if (!r) {
    return 0
  }
  return r && parseInt(r[1], 10)
}

// Parse N,M from type<N>x<M>
function parseTypeNxM (type: string) {
  const tmp = /^\D+(\d+)x(\d+)$/.exec(type)
  if (!tmp || !tmp[1] || !tmp[2]) {
    return [0, 0]
  }
  return [parseInt(tmp[1], 10), parseInt(tmp[2], 10)]
}

// Encodes a single item (can be dynamic array)
// @returns: Buffer
function encodeSingle (type: any, arg: any): any {
  let size, num, ret, i

  if (type === 'address') {
    return encodeSingle('uint160', parseNumber(arg))
  } else if (type === 'bool') {
    return encodeSingle('uint8', arg ? 1 : 0)
  } else if (type === 'string') {
    return encodeSingle('bytes', Buffer.from(arg, 'utf8'))
  } else if (isArray(type)) {
    // this part handles fixed-length ([2]) and variable length ([]) arrays
    // NOTE: we catch here all calls to arrays, that simplifies the rest
    if (typeof arg.length === 'undefined') {
      throw new Error('Not an array?')
    }
    size = parseTypeArray(type)
    if (size !== 'dynamic' && size !== 0 && arg.length > size) {
      throw new Error('Elements exceed array size: ' + size)
    }
    ret = []
    type = type.slice(0, type.lastIndexOf('['))
    if (typeof arg === 'string') {
      arg = JSON.parse(arg)
    }
    for (i in arg) {
      ret.push(encodeSingle(type, arg[i]))
    }
    if (size === 'dynamic') {
      const length = encodeSingle('uint256', arg.length)
      ret.unshift(length)
    }
    return Buffer.concat(ret)
  } else if (type === 'bytes') {
    arg = Buffer.from(arg)

    ret = Buffer.concat([encodeSingle('uint256', arg.length), arg])

    if ((arg.length % 32) !== 0) {
      ret = Buffer.concat([ret, zeros(32 - (arg.length % 32))])
    }

    return ret
  } else if (type.startsWith('bytes')) {
    size = parseTypeN(type)
    if (size < 1 || size > 32) {
      throw new Error('Invalid bytes<N> width: ' + size)
    }

    return setLengthRight(arg, 32)
  } else if (type.startsWith('uint')) {
    size = parseTypeN(type)
    if ((size % 8) || (size < 8) || (size > 256)) {
      throw new Error('Invalid uint<N> width: ' + size)
    }

    num = parseNumber(arg)
    if (num.bitLength() > size) {
      throw new Error('Supplied uint exceeds width: ' + size + ' vs ' + num.bitLength())
    }

    if (num.lt(new BN(0))) {
      throw new Error('Supplied uint is negative')
    }

    return num.toArrayLike(Buffer, 'be', 32)
  } else if (type.startsWith('int')) {
    size = parseTypeN(type)
    if ((size % 8) || (size < 8) || (size > 256)) {
      throw new Error('Invalid int<N> width: ' + size)
    }

    num = parseNumber(arg)
    if (num.bitLength() > size) {
      throw new Error('Supplied int exceeds width: ' + size + ' vs ' + num.bitLength())
    }

    return num.toTwos(256).toArrayLike(Buffer, 'be', 32)
  } else if (type.startsWith('ufixed')) {
    size = parseTypeNxM(type)

    num = parseNumber(arg)

    if (num.lt(new BN(0))) {
      throw new Error('Supplied ufixed is negative')
    }

    return encodeSingle('uint256', num.mul(new BN(2).pow(new BN(size[1]))))
  } else if (type.startsWith('fixed')) {
    size = parseTypeNxM(type)

    return encodeSingle('int256', parseNumber(arg).mul(new BN(2).pow(new BN(size[1]))))
  }

  throw new Error('Unsupported or invalid type: ' + type)
}

// Is a type dynamic?
function isDynamic (type: string) {
  // FIXME: handle all types? I don't think anything is missing now
  return (type === 'string') || (type === 'bytes') || (parseTypeArray(type) === 'dynamic')
}

// Encode a method/event with arguments
// @types an array of string type names
// @args  an array of the appropriate values
const rawEncode = (types: string[], values: unknown[]) => {
  const output = []
  const data = []

  let headLength = 0

  types.forEach(function (type) {
    if (isArray(type)) {
      const size = parseTypeArray(type)

      if (size !== 'dynamic') {
        headLength += 32 * size
      } else {
        headLength += 32
      }
    } else {
      headLength += 32
    }
  })

  for (let i = 0; i < types.length; i++) {
    const type = elementaryName(types[i])
    const value = values[i]
    const cur = encodeSingle(type, value)

    // Use the head/tail method for storing dynamic data
    if (isDynamic(type)) {
      output.push(encodeSingle('uint256', headLength))
      data.push(cur)
      headLength += cur.length
    } else {
      output.push(cur)
    }
  }

  return Buffer.concat(output.concat(data))
}

export const simpleEncode = (method: string, ...args: unknown[]) => {
  const sig = parseSignature(method)

  // FIXME: validate/convert arguments
  if (args.length !== sig.args.length) {
    throw new Error('Argument count mismatch')
  }
  return Buffer.concat([methodID(sig.method, sig.args), rawEncode(sig.args, args)])
}
