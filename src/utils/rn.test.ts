import { toUtf8Bytes, UnicodeNormalizationForm } from './rn-ethers'

test('toUtf8Bytes', () => {
  const text = 'password'
  console.log(toUtf8Bytes(text, UnicodeNormalizationForm.NFKC))
})
