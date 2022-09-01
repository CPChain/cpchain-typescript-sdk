import { Erc20TokenImpl } from '.'
import { createJsonRpcProvider } from '../../providers'
import fs from 'fs'
import utils, { toChecksumAddress } from '../../utils'
import { address, BigNumber } from '../../types'
import wallets from '../../wallets'
import { MockSigner } from '../../signer'

const getAccount = (addr: address, password: string) => {
  addr = toChecksumAddress(addr)
  const file = `fixtures/contracts/tokens/${addr}.json`
  const content = fs.readFileSync(file)
  return wallets.fromEncryptedJsonSync(content.toString(), password)
}

describe('Token test', () => {
  const contractAddress = '0xfC6eB4ecB6e213fCfF464630170a4c89476454A4'
  const provider = createJsonRpcProvider('https://civilian.testnet.cpchain.io', 41)
  const metaToken = new Erc20TokenImpl(provider, contractAddress)
  const account1 = getAccount('0x38981c70448189768fB1B4E88ed0ccC833c86B0e', 'a')
  const account2 = getAccount('0x66454030ce2320899484245514f8406ED70BC9a6', '123456')
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
    expect(utils.formatCPC(totalSupply)).toEqual('100000000.0')
  })

  it('Balance of', async () => {
    const balance = await metaToken.balanceOf(account1.address)
    expect(balance.gt(BigNumber.from(0))).toEqual(true)
  })

  it('Transfer', async () => {
    const signer = new MockSigner(await account1.encrypt('a'), 'a', provider)
    const account1BeforeBalance = await metaToken.balanceOf(account1.address)
    const account2BeforeBalance = await metaToken.balanceOf(account2.address)
    const cpc = 100
    const tx = await metaToken.transfer(signer, account2.address, utils.parseCPC('' + cpc))
    const receipt = await tx.wait()
    const status = receipt.status === 1 ? 'success' : 'failed'
    expect(status).toEqual('success')
    const account1AfterBalance = await metaToken.balanceOf(account1.address)
    const account2AfterBalance = await metaToken.balanceOf(account2.address)
    expect(utils.formatCPC(account1BeforeBalance.sub(account1AfterBalance))).toEqual('100.0')
    expect(utils.formatCPC(account2AfterBalance.sub(account2BeforeBalance))).toEqual('100.0')
  }, 35000)
})
