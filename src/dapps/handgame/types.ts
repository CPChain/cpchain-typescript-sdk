import { TransactionResponse } from '../../providers'
import { WalletSigner } from '../../signer'

export interface IHandGame{
  /**
   * 根据创建交易哈希获取创建游戏的id
   * @param txhash 交易哈希
   */
   getGameIdByHash(txhash: string): Promise<number | null>

   /**
   * 发起取消游戏
   * @param gameId 游戏id
   */
  cancelGame(signer:WalletSigner, gameId: number): Promise<TransactionResponse>

  /**
   * 结果已开始但超时的游戏
   * @param gameId 游戏id
   */
   finishTimeOutGame(signer:WalletSigner, gameId: number): Promise<TransactionResponse>

   /**
    * 发起对战
    * @param card 隐私数据凭证
    * @param amount 对战金额
    * @param threshold 最小参与金额
    */
   startGame(signer:WalletSigner, card: string, amount: number, threshold: number): Promise<TransactionResponse>

   /**
    * 发起群对战
    * @param card 隐私数据凭证
    * @param amount 对战金额
    * @param threshold 最小参与金额
    * @param groupId 群id
    * @param message 文本消息
    */
   startGroupGame(signer:WalletSigner, card: string, amount: number, threshold: number, groupId: number, message: string): Promise<TransactionResponse>

   /**
    * 参与游戏
    * @param gameId 游戏id
    * @param card 隐私数据凭证
    * @param amount 参与金额
    */
   joinGame(signer:WalletSigner, gameId: number, card: string, amount: number): Promise<TransactionResponse>

   /**
    * 开牌
    * @param gameId 游戏ID
    * @param key 隐私数据私钥
    * @param content 隐私卡牌内容
    */
   openCard(signer:WalletSigner, gameId: number, key: string, content: string | number): Promise<TransactionResponse>

   /**
    * 加入游戏的同时自动开牌
    * @param gameId 游戏id
    * @param card 卡牌凭证
    * @param amount 金额
    * @param key 隐私密码
    * @param content 内容
    */
   joinAndOpen(signer:WalletSigner, gameId: number, card: string, amount: number, key: string, content: string | number): Promise<TransactionResponse[]>
}
