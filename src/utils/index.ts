import { ethers } from 'ethers'

export default {
  // Wei to CPC
  formatCPC: ethers.utils.formatEther,
  // CPC to Wei
  parseCPC: ethers.utils.parseEther
}
