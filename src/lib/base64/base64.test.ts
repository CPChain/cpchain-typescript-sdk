import { Base64 } from "."


test('base64', () => {
  const test = 'hello world'
  const encoded = Base64.encode(test)
  expect(encoded).toEqual('aGVsbG8gd29ybGQ=')
  const decoded = Base64.decode(encoded)
  expect(decoded).toEqual(test)


})
