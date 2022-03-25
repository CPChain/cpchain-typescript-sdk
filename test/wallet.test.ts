import wallets from '../src/wallets'
import { createJsonRpcProvider } from '../src/providers'
import { expect } from 'chai'
import { describe, it } from 'mocha'
import utils from '../src/utils'

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
  it('signTransaction', async () => {
    const wallet = wallets.fromMnemonic(mnemonic)
    // ${address} have been got 100 CPC from faucet on CPChain Testnet
    const provider = createJsonRpcProvider('https://civilian.testnet.cpchain.io')
    const transaction = {
      type: 0,
      to: address,
      value: utils.parseCPC('1'),
      nonce: await provider.getTransactionCount(address),
      gas: 300000,
      gasPrice: await provider.getGasPrice(),
      chainId: 41
    }
    // 使用 cpchain/chain 生成的交易哈希
    const rawTx = await wallet.signTransaction(transaction)
    expect(rawTx).to.be.a('string').length.greaterThan(0)

    // submit tx
    const response = await provider.sendTransaction(rawTx)
    expect(response).to.be.a('object')
    expect(response.hash).to.be.a('string').length.greaterThan(0)
    const receipt = await response.wait()
    expect(receipt).to.be.a('object')
    expect(receipt.status).to.be.a('number').equal(1)
  }).timeout(200000)
})
