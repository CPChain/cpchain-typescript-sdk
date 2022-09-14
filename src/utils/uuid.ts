
let rng: any

if (global.crypto && crypto.getRandomValues) {
  // WHATWG crypto-based RNG - http://wiki.whatwg.org/wiki/Crypto
  // Moderately fast, high quality
  const _rnds8 = new Uint8Array(16)
  rng = function whatwgRNG () {
    crypto.getRandomValues(_rnds8)
    return _rnds8
  }
}

if (!rng) {
  // Math.random()-based (RNG)
  //
  // If all else fails, use Math.random().  It's fast, but is of unspecified
  // quality.
  const _rnds = new Array(16)
  rng = function () {
    for (let i = 0, r; i < 16; i++) {
      if ((i & 0x03) === 0) r = Math.random() * 0x100000000
      _rnds[i] = (r as any) >>> ((i & 0x03) << 3) & 0xff
    }

    return _rnds
  }
}

// Maps for number <-> hex string conversion
const _byteToHex: any = []
const _hexToByte: any = {}
for (let i = 0; i < 256; i++) {
  _byteToHex[i] = (i + 0x100).toString(16).substr(1)
  _hexToByte[_byteToHex[i]] = i
}

// **`unparse()` - Convert UUID byte array (ala parse()) into a string**
function unparse (buf: any, offset?: number) {
  let i = offset || 0
  const bth = _byteToHex
  return bth[buf[i++]] + bth[buf[i++]] +
          bth[buf[i++]] + bth[buf[i++]] + '-' +
          bth[buf[i++]] + bth[buf[i++]] + '-' +
          bth[buf[i++]] + bth[buf[i++]] + '-' +
          bth[buf[i++]] + bth[buf[i++]] + '-' +
          bth[buf[i++]] + bth[buf[i++]] +
          bth[buf[i++]] + bth[buf[i++]] +
          bth[buf[i++]] + bth[buf[i++]]
}

// See https://github.com/broofa/node-uuid for API details
function v4 (options: any, buf?: any, offset?: any) {
  // Deprecated - 'format' argument, as supported in v1.2
  const i = (buf && offset) || 0

  if (typeof options === 'string') {
    buf = options === 'binary' ? new Array(16) : null
    options = null
  }
  options = options || {}

  const rnds = options.random || (options.rng || rng)()

  // Per 4.4, set bits for version and `clock_seq_hi_and_reserved`
  rnds[6] = (rnds[6] & 0x0f) | 0x40
  rnds[8] = (rnds[8] & 0x3f) | 0x80

  // Copy bytes to buffer, if provided
  if (buf) {
    for (let ii = 0; ii < 16; ii++) {
      buf[i + ii] = rnds[ii]
    }
  }

  return buf || unparse(rnds)
}

export default {
  v4
}
