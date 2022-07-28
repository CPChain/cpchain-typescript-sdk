import { createJsonRpcProvider } from '../src/providers'
import { expect } from 'chai'
import utils from '../src/utils'

describe('Providers', () => {
  const provider = createJsonRpcProvider('https://civilian.cpchain.io')
  it('getBlockNumber', async () => {
    const number = await provider.getBlockNumber()
    expect(number).to.be.a('number').greaterThan(0)
  }, 20000)

  it('getBalance', async () => {
    const balance = await provider.getBalance('0xfe8c03415df612dc0e8c866283a4ed40277fa48b')
    expect(balance).to.be.a('object')
    expect(utils.formatCPC(balance)).to.be.a('string')
  }, 20000)
})
