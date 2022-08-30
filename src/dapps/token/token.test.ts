import { Erc20TokenImpl } from '.'
import { createJsonRpcProvider } from '../../providers'
import fs from 'fs'
import utils, { toChecksumAddress } from '../../utils'
import { address } from '../../types'
import wallets from '../../wallets'

const PASSWORD = 'a'

const getAccount = (addr: address) => {
  addr = toChecksumAddress(addr)
  const file = `fixtures/contracts/tokens/${addr}.json`
  const content = fs.readFileSync(file)
  return wallets.fromEncryptedJsonSync(content.toString(), PASSWORD)
}

describe('Token test', () => {
  const contractAddress = '0xfC6eB4ecB6e213fCfF464630170a4c89476454A4'
  const provider = createJsonRpcProvider('https://civilian.testnet.cpchain.io', 41)
  const metaToken = new Erc20TokenImpl(provider, contractAddress)
  const account1 = getAccount('0x38981c70448189768fB1B4E88ed0ccC833c86B0e')
  it('readonly methods', async () => {
    const name = await metaToken.name()
    expect(name).toEqual('CPChain')
    const symbol = await metaToken.symbol()
    expect(symbol).toEqual('CPC')
    const decimals = await metaToken.decimals()
    expect(decimals).toEqual(18)
  })

  it('Total supply', async () => {
    const totalSupply = await metaToken.totalSupply()
    console.log(utils.formatCPC(totalSupply))
    expect(utils.formatCPC(totalSupply)).toEqual('100000000.0')
  })

  it('Balance of', async () => {
    const balance = await metaToken.balanceOf(account1.address)
    console.log('----->>>>', balance)
  })
})
