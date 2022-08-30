import { simpleEncode } from './abi'

test('abi test', () => {
  const data = simpleEncode('joinGame(uint64,uint256)', 1, 1)
  const expected = '9d65a67e00000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000001'
  expect(data.toString('hex')).toEqual(expected)
})
