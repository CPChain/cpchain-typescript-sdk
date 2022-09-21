import { Contract } from 'ethers'
import { WalletSigner } from '../..'
import { CPCJsonRpcProvider, TransactionResponse } from '../../providers'
import { address } from '../../types'
import utils from '../../utils'
import { simpleEncode } from '../../utils/abi'
import { IHandGame } from './types'
export const HandGameAbi = '[{"constant":true,"inputs":[{"name":"","type":"uint256"}],"name":"games","outputs":[{"name":"gameId","type":"uint64"},{"name":"amount","type":"uint256"},{"name":"starter","type":"address"},{"name":"player","type":"address"},{"name":"status","type":"uint8"},{"name":"starterProof","type":"uint256"},{"name":"playerProof","type":"uint256"},{"name":"timeout","type":"uint256"},{"name":"threshold","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"maxLimit","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"rpsAddress","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"","type":"uint64"}],"name":"gameToGroup","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"proof","type":"uint256"},{"name":"key","type":"uint256"},{"name":"content","type":"uint256"}],"name":"validateProof","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"pure","type":"function"},{"constant":true,"inputs":[],"name":"enabled","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[],"name":"enableContract","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"proof","type":"uint256"},{"name":"key","type":"uint256"},{"name":"content","type":"uint256"}],"name":"setProof","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"timeoutLimit","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[],"name":"claimOwnership","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"groupChatAddress","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"totalGameNumber","outputs":[{"name":"","type":"uint64"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[],"name":"renounceOwnership","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[],"name":"disableContract","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"proof","type":"uint256"}],"name":"viewContent","outputs":[{"name":"","type":"uint256"},{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"owner","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"pendingOwner","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"mintConfig","outputs":[{"name":"createrMint","type":"uint256"},{"name":"staterLockMint","type":"uint256"},{"name":"playerLockMint","type":"uint256"},{"name":"winnerMint","type":"uint256"},{"name":"loserMint","type":"uint256"},{"name":"drawMint","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"newOwner","type":"address"}],"name":"transferOwnership","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"inputs":[],"payable":false,"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"name":"proof","type":"uint256"},{"indexed":true,"name":"key","type":"uint256"},{"indexed":true,"name":"content","type":"uint256"}],"name":"ContentVerified","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"enabled","type":"bool"}],"name":"EnableStatusChanged","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"previousOwner","type":"address"},{"indexed":true,"name":"newOwner","type":"address"}],"name":"OwnershipTransferred","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"limit","type":"uint256"}],"name":"SetMaxLimit","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"limit","type":"uint256"}],"name":"SetTimeoutLimit","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"starterMint","type":"uint256"},{"indexed":false,"name":"staterLockMint","type":"uint256"},{"indexed":false,"name":"playerLockMint","type":"uint256"},{"indexed":false,"name":"winnerMint","type":"uint256"},{"indexed":false,"name":"loserMint","type":"uint256"},{"indexed":false,"name":"drawMint","type":"uint256"}],"name":"SetMintConfig","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"gameId","type":"uint64"},{"indexed":false,"name":"starter","type":"address"},{"indexed":false,"name":"card","type":"uint256"},{"indexed":false,"name":"amount","type":"uint256"},{"indexed":false,"name":"threshold","type":"uint256"}],"name":"GameStarted","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"group_id","type":"uint256"},{"indexed":true,"name":"gameId","type":"uint64"},{"indexed":false,"name":"starter","type":"address"},{"indexed":false,"name":"message","type":"string"},{"indexed":false,"name":"amount","type":"uint256"},{"indexed":false,"name":"threshold","type":"uint256"}],"name":"CreateGroupHandGame","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"gameId","type":"uint64"}],"name":"GameCancelled","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"gameId","type":"uint64"},{"indexed":false,"name":"player","type":"address"},{"indexed":false,"name":"card","type":"uint256"},{"indexed":false,"name":"amount","type":"uint256"}],"name":"GameLocked","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"gameId","type":"uint64"},{"indexed":false,"name":"player","type":"address"},{"indexed":false,"name":"key","type":"uint256"},{"indexed":false,"name":"content","type":"uint256"}],"name":"CardOpened","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"gameId","type":"uint64"},{"indexed":false,"name":"result","type":"int8"}],"name":"GameFinished","type":"event"},{"constant":false,"inputs":[{"name":"starterMint","type":"uint256"},{"name":"staterLockMint","type":"uint256"},{"name":"playerLockMint","type":"uint256"},{"name":"winnerMint","type":"uint256"},{"name":"loserMint","type":"uint256"},{"name":"drawMint","type":"uint256"}],"name":"setMintConfig","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"groupchat","type":"address"}],"name":"setGroupChat","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"rps","type":"address"}],"name":"setRPS","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"limit","type":"uint256"}],"name":"setMaxLimit","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"limit","type":"uint256"}],"name":"setTimeoutLimit","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"gameId","type":"uint64"}],"name":"viewGame","outputs":[{"name":"","type":"uint256"},{"name":"","type":"uint256"},{"name":"","type":"address"},{"name":"","type":"address"},{"name":"","type":"uint8"},{"name":"","type":"uint256"},{"name":"","type":"uint256[]"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"proof","type":"uint256"},{"name":"threshold","type":"uint256"}],"name":"startGame","outputs":[],"payable":true,"stateMutability":"payable","type":"function"},{"constant":false,"inputs":[{"name":"proof","type":"uint256"},{"name":"threshold","type":"uint256"},{"name":"group_id","type":"uint256"},{"name":"userMessage","type":"string"}],"name":"startGroupChatGame","outputs":[],"payable":true,"stateMutability":"payable","type":"function"},{"constant":false,"inputs":[{"name":"gameId","type":"uint64"}],"name":"cancelGame","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"gameId","type":"uint64"},{"name":"proof","type":"uint256"}],"name":"joinGame","outputs":[],"payable":true,"stateMutability":"payable","type":"function"},{"constant":false,"inputs":[{"name":"gameId","type":"uint64"},{"name":"key","type":"uint256"},{"name":"content","type":"uint256"}],"name":"openCard","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"gameId","type":"uint64"}],"name":"finishTimeoutGame","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"}]'

export class HandGame implements IHandGame {
    private contractAddress: address
    private provider: CPCJsonRpcProvider
    private contractIns: Contract

    constructor (provider: CPCJsonRpcProvider, contractAddress: address) {
      this.contractAddress = contractAddress
      this.provider = provider
      this.contractIns = new Contract(this.contractAddress, HandGameAbi, this.provider)
    }

    async totalGameNumber (): Promise<number> {
      return (await this.contractIns.totalGameNumber()).toNumber()
    }

    async timeoutLimit (): Promise<number> {
      return (await this.contractIns.timeoutLimit()).toNumber()
    }

    async getGameIdByHash (txhash: string): Promise<number | null> {
      const res = await this.provider.getTransactionReceipt(txhash)
      if (res === null) {
        return null
      }
      if (res?.status === 0) {
      // 交易失败
        return -1
      }
      const events = await this.contractIns.queryFilter(this.contractIns.filters.GameStarted(), res.blockNumber, res.blockNumber)

      if (!events || events.length === 0) {
        return -1
      }
      const gameId = events[0].args?.gameId
      return gameId.toNumber()
    }

    startGroupGame (signer:WalletSigner, card: string, amount: number, threshold: number, groupId: number, message: string): Promise<TransactionResponse> {
      const thresholdBn = utils.parseCPC('' + threshold)
      const data = simpleEncode('startGroupChatGame(uint256,uint256,uint256,string)', card, thresholdBn.toHexString(), groupId, message)
      return this._sendTx(signer, amount, data)
    }

    startGame (signer:WalletSigner, card: string, amount: number, threshold: number) {
      const thresholdBn = utils.parseCPC('' + threshold)
      const data = simpleEncode('startGame(uint256,uint256)', card, thresholdBn.toHexString())
      return this._sendTx(signer, amount, data)
    }

    cancelGame (signer:WalletSigner, gameId: number) {
      const data = simpleEncode('cancelGame(uint64)', gameId)
      return this._sendTx(signer, 0, data)
    }

    joinAndOpen (signer:WalletSigner, gameId: number, card: string, amount: number, key: string, content: string | number) {
      const data1 = simpleEncode('joinGame(uint64,uint256)', gameId, card)
      const data2 = simpleEncode('openCard(uint64,uint256,uint256)', gameId, key, content)
      return this._sendBatchTx(signer, [
        { amount, data: data1 },
        { amount: 0, data: data2 }
      ])
    }

    finishTimeOutGame (signer:WalletSigner, gameId: number) {
      const data = simpleEncode('finishTimeoutGame(uint64)', gameId)
      return this._sendTx(signer, 0, data)
    }

    joinGame (signer:WalletSigner, gameId: number, card: string, amount: number) {
      const data = simpleEncode('joinGame(uint64,uint256)', gameId, card)
      return this._sendTx(signer, amount, data)
    }

    openCard (signer:WalletSigner, gameId: number, key: string, content: string | number) {
      const data = simpleEncode('openCard(uint64,uint256,uint256)', gameId, key, content)
      return this._sendTx(signer, 0, data)
    }

    private async _sendTx (signer:WalletSigner, amount: number, data: any) {
      const signedTransaction = await signer.sign({ amount: utils.parseCPC('' + amount), to: this.contractAddress, data: data })
      return this.provider.sendTransaction(signedTransaction)
    }

    private async _sendBatchTx (signer:WalletSigner, req: Array<{amount: number; data: any}>) {
      const responses: TransactionResponse [] = []
      const signedTransaction = await signer.batchSign(
        req.map(({ amount, data }) => {
          return { amount: utils.parseCPC('' + amount), to: this.contractAddress, data: data }
        })
      )

      for (let index = 0; index < signedTransaction.length; index++) {
        responses.push(await this.provider.sendTransaction(signedTransaction[index]))
      }
      return responses
    }
}
