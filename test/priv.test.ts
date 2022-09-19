import wallets from '../src/wallets'

test('Test', async () => {
  const mnemonic = 'uniform hole fabric shock potato such rough provide nasty second dirt waste'
  const address = '0x1833844Cd9057BBE4987D10d84Dd87883eBA7Cad'
  const wallet = wallets.fromMnemonic(mnemonic)
  console.log(wallet.address)
  expect(wallet.address).toEqual(address)
  const wallet2 = wallets.createByPrivateKey(wallet.privateKey)
  expect(wallet2.mnemonic).toEqual(null)
})
