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
