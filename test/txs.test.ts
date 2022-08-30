import { createCPCScanProvider, createJsonRpcProvider } from '../src/providers'
import cpc from '../src'

test('History', async () => {
  const provider = createCPCScanProvider({ networkish: 'Testnet' })
  const res = await provider.getHistory('0x302fa3703fCc25905934A305f0286a4D7E93cF8D', { limit: 20, page: 0, others: { exclude_empty_value: 'true' } })
  console.log(res)
})

test('Detail', async () => {
  const provider = createJsonRpcProvider('https://civilian.testnet.cpchain.io')
  const tx = await provider.getTransactionReceipt('0x69265fb34fa9f18d3979f6780f7313e70f83161aadb9f250c52905006d42db9f')
  console.log(tx)
  const gasPrice = await provider.getGasPrice()
  // Gwei 计算器：https://mycointool.com/en/EtherConverter
  console.log(gasPrice.toNumber())
  console.log(cpc.utils.formatUnits(gasPrice, 'gwei'))
})
