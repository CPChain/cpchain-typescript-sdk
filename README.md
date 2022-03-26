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
