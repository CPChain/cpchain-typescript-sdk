
const UNSUPPORTED_OPERATION = 'UNSUPPORTED_OPERATION'

// Invalid argument (e.g. value is incompatible with type) to a function:
//   - argument: The argument name that was invalid
//   - value: The value of the argument
const INVALID_ARGUMENT = 'INVALID_ARGUMENT'
// Numeric Fault
//   - operation: the operation being executed
//   - fault: the reason this faulted
const NUMERIC_FAULT = 'NUMERIC_FAULT'

export const UnicodeNormalizationForm: any = {};
(function (UnicodeNormalizationForm: any) {
  UnicodeNormalizationForm.current = ''
  UnicodeNormalizationForm.NFC = 'NFC'
  UnicodeNormalizationForm.NFD = 'NFD'
  UnicodeNormalizationForm.NFKC = 'NFKC'
  UnicodeNormalizationForm.NFKD = 'NFKD'
})(UnicodeNormalizationForm)

function checkNormalize () {
  try {
    // Make sure all forms of normalization are supported
    ['NFD', 'NFC', 'NFKD', 'NFKC'].forEach(function (form) {
      try {
        'test'.normalize(form)
      } catch (error) {
        throw new Error('missing ' + form)
      }
    })
    if (String.fromCharCode(0xe9).normalize('NFD') !== String.fromCharCode(0x65, 0x0301)) {
      throw new Error('broken implementation')
    }
  } catch (error: any) {
    throwError('platform missing String.prototype.normalize', UNSUPPORTED_OPERATION, { operation: 'String.prototype.normalize', form: error.message })
  }
}

const _censorErrors = false
const _version = '4.0.27'

function throwError (message: any, code: any, params: any) {
  if (_censorErrors) {
    throw new Error('unknown error')
  }
  if (!code) {
    code = exports.UNKNOWN_ERROR
  }
  if (!params) {
    params = {}
  }
  const messageDetails = []
  Object.keys(params).forEach(function (key) {
    try {
      messageDetails.push(key + '=' + JSON.stringify(params[key]))
    } catch (error) {
      messageDetails.push(key + '=' + JSON.stringify(params[key].toString()))
    }
  })
  messageDetails.push('version=' + _version)
  const reason = message
  if (messageDetails.length) {
    message += ' (' + messageDetails.join(', ') + ')'
  }
  // @TODO: Any??
  const error: any = new Error(message)
  error.reason = reason
  error.code = code
  Object.keys(params).forEach(function (key) {
    error[key] = params[key]
  })
  throw error
}

function isHexable (value: any) {
  return !!(value.toHexString)
}

function addSlice (array: any) {
  if (array.slice) {
    return array
  }
  array.slice = function () {
    const args: any = Array.prototype.slice.call(arguments)
    return addSlice(new Uint8Array(Array.prototype.slice.apply(array, args)))
  }
  return array
}

export function looseArrayify (hexString: any) {
  if (typeof (hexString) === 'string' && hexString.substring(0, 2) !== '0x') {
    hexString = '0x' + hexString
  }
  return arrayify(hexString)
}

export function arrayify (value: any) {
  if (value == null) {
    throwError('cannot convert null value to array', INVALID_ARGUMENT, { arg: 'value', value: value })
  }
  if (isHexable(value)) {
    value = value.toHexString()
  }
  if (typeof (value) === 'string') {
    const match: any = value.match(/^(0x)?[0-9a-fA-F]*$/)
    if (!match) {
      throwError('invalid hexidecimal string', INVALID_ARGUMENT, { arg: 'value', value: value })
    }
    if (match[1] !== '0x') {
      throwError('hex string must have 0x prefix', INVALID_ARGUMENT, { arg: 'value', value: value })
    }
    value = value.substring(2)
    if (value.length % 2) {
      value = '0' + value
    }
    const result = []
    for (let i = 0; i < value.length; i += 2) {
      result.push(parseInt(value.substr(i, 2), 16))
    }
    return addSlice(new Uint8Array(result))
  }
  if (isArrayish(value)) {
    return addSlice(new Uint8Array(value))
  }
  throwError('invalid arrayify value', null, { arg: 'value', value: value, type: typeof (value) })
  return null
}

function isArrayish (value: any) {
  if (!value || parseInt(String(value.length)) !== value.length || typeof (value) === 'string') {
    return false
  }
  for (let i = 0; i < value.length; i++) {
    const v = value[i]
    if (v < 0 || v >= 256 || parseInt(String(v)) !== v) {
      return false
    }
  }
  return true
}

// http://stackoverflow.com/questions/18729405/how-to-convert-utf8-string-to-byte-array
export function toUtf8Bytes (str: any, form: any) {
  if (form === undefined) { form = UnicodeNormalizationForm.current }
  if (form !== UnicodeNormalizationForm.current) {
    checkNormalize()
    str = str.normalize(form)
  }
  const result = []
  for (let i = 0; i < str.length; i++) {
    let c = str.charCodeAt(i)
    if (c < 0x80) {
      result.push(c)
    } else if (c < 0x800) {
      result.push((c >> 6) | 0xc0)
      result.push((c & 0x3f) | 0x80)
    } else if ((c & 0xfc00) === 0xd800) {
      i++
      const c2 = str.charCodeAt(i)
      if (i >= str.length || (c2 & 0xfc00) !== 0xdc00) {
        throw new Error('invalid utf-8 string')
      }
      // Surrogate Pair
      c = 0x10000 + ((c & 0x03ff) << 10) + (c2 & 0x03ff)
      result.push((c >> 18) | 0xf0)
      result.push(((c >> 12) & 0x3f) | 0x80)
      result.push(((c >> 6) & 0x3f) | 0x80)
      result.push((c & 0x3f) | 0x80)
    } else {
      result.push((c >> 12) | 0xe0)
      result.push(((c >> 6) & 0x3f) | 0x80)
      result.push((c & 0x3f) | 0x80)
    }
  }
  return arrayify(result)
}

const HexCharacters = '0123456789abcdef'
export function hexlify (value: any) {
  if (isHexable(value)) {
    return value.toHexString()
  }
  if (typeof (value) === 'number') {
    if (value < 0) {
      throwError('cannot hexlify negative value', INVALID_ARGUMENT, { arg: 'value', value: value })
    }
    // @TODO: Roll this into the above error as a numeric fault (overflow); next version, not backward compatible
    // We can about (value == MAX_INT) to as well, since that may indicate we underflowed already
    if (value >= 9007199254740991) {
      throwError('out-of-range', NUMERIC_FAULT, {
        operartion: 'hexlify',
        fault: 'out-of-safe-range'
      })
    }
    let hex = ''
    while (value) {
      hex = HexCharacters[value & 0x0f] + hex
      value = Math.floor(value / 16)
    }
    if (hex.length) {
      if (hex.length % 2) {
        hex = '0' + hex
      }
      return '0x' + hex
    }
    return '0x00'
  }
  if (typeof (value) === 'string') {
    const match: any = value.match(/^(0x)?[0-9a-fA-F]*$/)
    if (!match) {
      throwError('invalid hexidecimal string', INVALID_ARGUMENT, { arg: 'value', value: value })
    }
    if (match[1] !== '0x') {
      throwError('hex string must have 0x prefix', INVALID_ARGUMENT, { arg: 'value', value: value })
    }
    if (value.length % 2) {
      value = '0x0' + value.substring(2)
    }
    return value
  }
  if (isArrayish(value)) {
    const result = []
    for (let i = 0; i < value.length; i++) {
      const v = value[i]
      result.push(HexCharacters[(v & 0xf0) >> 4] + HexCharacters[v & 0x0f])
    }
    return '0x' + result.join('')
  }
  throwError('invalid hexlify value', null, { arg: 'value', value: value })
  return 'never'
}

export function concatBytes (objects: any) {
  const arrays = []
  let length = 0
  for (let i = 0; i < objects.length; i++) {
    const object = arrayify(objects[i])
    arrays.push(object)
    length += object.length
  }
  const result = new Uint8Array(length)
  let offset = 0
  for (let i = 0; i < arrays.length; i++) {
    result.set(arrays[i], offset)
    offset += arrays[i].length
  }
  return addSlice(result)
}
