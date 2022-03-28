import wallets from '../src/wallets'
import { createJsonRpcProvider } from '../src/providers'
import { expect } from 'chai'
import { describe, it } from 'mocha'
import contract from '../src/contract'
import fs from 'fs'

describe('Wallets', () => {
  // generate by cpc-wallet and got 100 CPC from test.cpchain.io/faucet
  const mnemonic = 'uniform hole fabric shock potato such rough provide nasty second dirt waste'
  const address = '0x1833844Cd9057BBE4987D10d84Dd87883eBA7Cad'
  it('deploy contract', async () => {
    const wallet = wallets.fromMnemonic(mnemonic)
    expect(wallet.address).to.be.a('string').equal(address)

    const provider = createJsonRpcProvider('https://civilian.testnet.cpchain.io', 41)
    const account = wallet.connect(provider)

    const bytecode = fs.readFileSync('fixtures/contracts/example/Example_sol_Example.bin').toString()
    const abi = JSON.parse(fs.readFileSync('fixtures/contracts/example/Example_sol_Example.abi').toString())

    const exampleContractFactory = new contract.ContractFactory(abi, bytecode, account)

    const exampleContract = await exampleContractFactory.deploy()
    expect(exampleContract.address).to.be.a('string').length.greaterThan(0)

    // call view methods
    expect(await exampleContract.greet()).to.be.a('string').equal('Hello, world')

    // call payable methods
    const tx = await exampleContract.modify('cpchain')
    expect(tx.hash).to.be.a('string').length.greaterThan(0)
    await tx.wait()
    expect(await exampleContract.greet()).to.be.a('string').equal('Hello, cpchain')
  }).timeout(100000)
})
