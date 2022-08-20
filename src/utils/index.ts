import { ethers } from 'ethers'
export * from './fetch'

export default {
  ...ethers.utils,
  // Wei to CPC
  formatCPC: ethers.utils.formatEther,
  // CPC to Wei
  parseCPC: ethers.utils.parseEther
}
