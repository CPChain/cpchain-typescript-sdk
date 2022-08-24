import { createCPCScanProvider } from '../src/providers'

test('History', async () => {
  const provider = createCPCScanProvider({ networkish: 'Testnet' })
  const res = await provider.getHistory('0x302fa3703fCc25905934A305f0286a4D7E93cF8D', { limit: 20, page: 0, others: { exclude_empty_value: 'true' } })
  console.log(res)
})
