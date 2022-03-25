import wallets from '../src/wallets'
import { expect } from 'chai'
import { describe, it } from 'mocha'

describe('Wallets', () => {
  // generate by cpc-wallet
  const mnemonic = 'uniform hole fabric shock potato such rough provide nasty second dirt waste'
  const address = '0x1833844Cd9057BBE4987D10d84Dd87883eBA7Cad'
  it('fromMnemonic', () => {
    const wallet = wallets.fromMnemonic(mnemonic)
    expect(wallet).to.be.a('object')
    expect(wallet.address).to.be.a('string').equal(address)
  })
  it('fromEncryptedJson', async () => {
    const wallet = wallets.fromMnemonic(mnemonic)
    const password = '123456'
    const encryptedJson = await wallet.encrypt(password)

    const wallet2 = await wallets.fromEcryptedJsonSync(encryptedJson, password)
    expect(wallet2.address).to.be.a('string').equal(address)
  }).timeout(10000)
  it('createWallet', () => {
    const wallet = wallets.createWallet()
    expect(wallet).to.be.a('object')
  })
})
