import { BigNumber } from 'ethers'
import wallets from '.'
import { TransactionRequest } from './wallet'

test('Get tx hash', async () => {
  const mnemonic = 'uniform hole fabric shock potato such rough provide nasty second dirt waste'
  const wallet = wallets.fromMnemonic(mnemonic)
  const tx: TransactionRequest = {
    nonce: 0,
    from: wallet.address,
    to: '0x1833844Cd9057BBE4987D10d84Dd87883eBA7Cad',
    value: BigNumber.from('1000000000000000000'),
    gasLimit: 300000,
    gasPrice: 18000000000,
    chainId: 337
  }
  const hash = await wallet.hash(tx)
  console.log(hash)
})
