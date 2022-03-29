# CPChain TypeScript SDK

This is the SDK for developing on CPChain with TypeScript(JavaScript).

## Getting Started

```bash

npm install cpchain-typescript-sdk

```

Example code:

```typescript

import cpc from 'cpchain-typescript-sdk'

// Create a wallet
const wallet = cpc.wallets.createWallet()

console.log(wallet.address)

// Check current blocknumber on testnet
const provider = cpc.providers.createJsonRpcProvider('https://testnet.cpchain.io')
provider.getBlockNumber().then(num => {
  console.log(num)
})

// Get balance of your wallet
provider.getBalance(wallet.address).then(balance => {
  console.log('Balance:', cpc.utils.formatCPC(balance))
})

```

## API

### Wallets

#### Create Wallet

You can create a new wallet as below:

```typescript

import cpc from 'cpchain-typescript-sdk'

// Create a wallet
const wallet = cpc.wallets.createWallet()

console.log(wallet.address)

```

#### Generate Keystore

```typescript

const password = '123456'

wallet.encrypt(password).then(encryptedJson => {
    console.log(encryptedJson)
})

```

#### Sign and Send Transactions

```typescript

const wallet = // ...
const provider = createJsonRpcProvider('https://civilian.testnet.cpchain.io')

const transaction = {
    type: 0,
    to: address,
    value: utils.parseCPC('1'),
    nonce: await provider.getTransactionCount(address), // get Nonce
    gas: 300000,
    gasPrice: await provider.getGasPrice(), // get current Gas price
    chainId: 41
}
// 使用 cpchain/chain 生成的交易哈希
const rawTx = await wallet.signTransaction(transaction)

// submit tx
const response = await provider.sendTransaction(rawTx)
const receipt = await response.wait()

console.log(receipt.status)

```

#### Import Wallet

You can import a wallet by private key or mnemonic or keystore:

```typescript

// private key
const wallet1 = wallets.createWallet(privateKey)

// mnemonic
const mnemonic = 'uniform hole fabric shock potato such rough provide nasty second dirt waste'
const wallet2 = wallets.fromMnemonic(mnemonic)

// keystore
const wallet3 = wallets.fromEcryptedJson(encryptedJson)

```

### Providers

#### JsonRPCProviders

```typescript

// Create a provider
const provider = createJsonRpcProvider('https://civilian.cpchain.io')

// Access chain data
const number = await provider.getBlockNumber()
const balance = await provider.getBalance('0xfe8c03415df612dc0e8c866283a4ed40277fa48b')

console.log(utils.formatCPC(balance))

```

### Contracts

We wrote a test contract, please check it at **fixtures/contracts/example**. Below is the code of the example contract:

```solidity

pragma solidity ^0.4.24;

contract Example {
    event ModifyName(string name, uint256 blockNumber);
    string name;
    address owner;

    constructor() public {
        name = "world";
        owner = msg.sender;
    }

    modifier onlyOwner {
        require(msg.sender == owner);
        _;
    }

    function greet() public view returns (string) {
        return string(abi.encodePacked("Hello, ", name));
    }

    function modify(string newName) public payable {
        name = newName;
        emit ModifyName(name, block.number);
    }

    function collectBack() onlyOwner public {
        msg.sender.transfer(address(this).balance);
    }
}

```

*Note: If you want to develop smart contract on CPChain, please use this tool to help you create project: [cpchain-cli](https://github.com/cpchain/cpchain-cli).*

#### Deploy Contracts

```typescript

// const wallet = ...
// const provider = ...

const account = wallet.connect(provider)

const bytecode = fs.readFileSync('fixtures/contracts/example/Example_sol_Example.bin').toString()
const abi = JSON.parse(fs.readFileSync('fixtures/contracts/example/Example_sol_Example.abi').toString())

const exampleContractFactory = new contract.ContractFactory(abi, bytecode, account)

const exampleContract = await exampleContractFactory.deploy()

console.log(exampleContract.address)

```

#### Call Methods

```typescript

// call view methods
console.log(await exampleContract.greet())
// output: hello, world!

// call payable methods
const tx = await exampleContract.modify('cpchain')

await tx.wait()

console.log(await exampleContract.greet())
// output: hello, cpchain!

// call payable methods with sending CPC
const tx2 = await exampleContract.modify('cpchain', {
    value: utils.parseCPC('1')
})
await tx2.wait()
console.log(await getBalance(provider, exampleContract.address))

// collect CPC back to sender
await (await exampleContract.collectBack()).wait()
console.log(await getBalance(provider, exampleContract.address))

```

#### Listen and Query Events

```typescript

// listen events
exampleContract.on('ModifyName', (name: string, blockNumber: any, event: any) => {
    console.log(name, blockNumber, event)
})

// get history events
const filterFrom = exampleContract.filters.ModifyName()
const currentBlock = await provider.getBlockNumber()
const historicalEvents = await exampleContract.queryFilter(filterFrom, currentBlock - 10, currentBlock)

console.log(historicalEvents)


```

### Utils

```typescript

// convert Wei to CPC
utils.formatCPC(1)

// convert CPC to Wei
utils.parseCPC('1')

```

## Test

All tests wirte in `test`.

```bash

npm test

```

## Build and Uses in Browser

You can build this SDK then uses in the browser.

```bash

npm run build

```

The `bundle.min.js` will be generated in `dist` floder. Import this file by `script` tag. Then there will be a global object `CPChain` which is accessible in your front-end code.
