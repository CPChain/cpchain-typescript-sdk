import { expect } from 'chai'
import { describe, it } from 'mocha'
import { MockSigner } from '../src'
import { createJsonRpcProvider } from '../src/providers'
import utils from '../src/utils'
import wallets from '../src/wallets'

describe('Signer test', () => {
  const mnemonic = 'uniform hole fabric shock potato such rough provide nasty second dirt waste'

  it('should sign and verify', async () => {
    // create a wallet for testing
    const wallet = wallets.fromMnemonic(mnemonic)
    const ksPassword = '123456'
    const ks = await wallet.encrypt(ksPassword)
    const provider = createJsonRpcProvider('https://civilian.testnet.cpchain.io', 41)
    const signer = new MockSigner(
      ks,
      () => {
        // wait user input password
        return new Promise((resolve, reject) => {
          // 等待一秒，模拟用户输入密码
          setTimeout(() => {
            resolve(ksPassword)
          }, 1000)
        })
      },
      provider
    )
    const req = {
      amount: utils.parseCPC('1'),
      to: '0x1833844Cd9057BBE4987D10d84Dd87883eBA7Cad',
      data: '0x'
    }
    const rawSignedTx = await signer.sign(req)
    expect(rawSignedTx).to.be.a('string').length.greaterThan(0)
    // send transantion
    const res = await provider.sendTransaction(rawSignedTx)
    expect(res).to.be.a('object')
    expect(res.hash).to.be.a('string').length.greaterThan(0)
  }).timeout(10000)
})
