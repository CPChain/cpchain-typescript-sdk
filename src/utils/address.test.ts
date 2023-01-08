import { isAddress } from './address'

test('isAddress', () => {
  expect(isAddress('')).toBe(false)
  expect(isAddress('hello')).toBe(false)
  expect(isAddress('0x50f8c76f6d8442c54905c74245ae163132b9f4ae')).toBe(true)
  expect(isAddress('0x50f8c76f6d8442c54905c74245ae163132b9f4ae'.toLowerCase())).toBe(true)
  expect(isAddress('0x' + '50f8c76f6d8442c54905c74245ae163132b9f4ae'.toUpperCase())).toBe(true)
  expect(isAddress('0x50i8c76f6d8442c54905c74245ae163132b9f4ae')).toBe(false)
  expect(isAddress('50f8c76f6d8442c54905c74245ae163132b9f4ae')).toBe(true)
  expect(isAddress('50F8C76f6d8442c54905c74245ae163132b9f4ae')).toBe(true)
  expect(isAddress('0x50F8C76f6d8442c54905c74245ae163132b9f4ae')).toBe(true)
  expect(isAddress('0f8c76f6d8442c54905c74245ae163132b9f4ae')).toBe(false)
  expect(isAddress('50F8c76f6d8442c54905c74245ae163132b9f4ae11')).toBe(false)
})
