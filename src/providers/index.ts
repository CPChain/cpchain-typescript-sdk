import { ethers } from 'ethers'

function createJsonRpcProvider (url: string = 'https://civilian.cpchain.io'): ethers.providers.JsonRpcProvider {
  return new ethers.providers.JsonRpcProvider(url)
}

export {
  createJsonRpcProvider
}
