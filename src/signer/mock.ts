import { CPCJsonRpcProvider } from '../providers'
import wallets, { CPCWallet } from '../wallets'
import { ISigner, SignedTransaction, Signer, SignRequest } from './signer'

export type PasswordGetter = (() => Promise<string>) | string

/**
 * @description Mock signer for testing, you can specify a function for password to mock the password input.
 */
export class MockSigner implements ISigner, Signer {
  private keystore: string
  private provider: CPCJsonRpcProvider
  private gasLimit = 300000
  private passwordGetter: PasswordGetter
  /**
   * Create a mock signer with a keystore file.
   * @param ks keystore json
   * @param password password string or a function to get password
   * @param provider provider for a network
   * @param gasLimit gas limit (default 300000)
   */
  constructor (ks: string, password: PasswordGetter, provider: CPCJsonRpcProvider, gasLimit = 300000) {
    this.keystore = ks
    this.provider = provider
    this.gasLimit = gasLimit
    this.passwordGetter = password
  }

  private async waitInputPassword (cb: (wallet: CPCWallet) => void) {
    let pwd: PasswordGetter = this.passwordGetter
    if (typeof this.passwordGetter === 'function') {
      pwd = await this.passwordGetter() // 模拟用户输入密码
    }
    wallets.fromEncryptedJson(this.keystore, pwd as string).then(wallet => {
      cb(wallet)
    })
  }

  /**
   * Sign a transaction.
   * @param req sign request
   * @returns raw transaction with signature
   */
  sign (req: SignRequest): Promise<SignedTransaction> {
    return new Promise((resolve, reject) => {
      this.waitInputPassword(wallet => {
        this.provider
          .getTransactionCount(wallet.address)
          .then(nonce => {
            this.provider.getGasPrice().then(gasPrice => {
              const tx = {
                to: req.to,
                from: wallet.address,
                value: req.amount,
                nonce: nonce,
                gasLimit: this.gasLimit,
                gasPrice: gasPrice,
                chainId: this.provider.network.chainId,
                data: req.data
              }
              wallet
                .signTransaction(tx as any)
                .then(raw => {
                  resolve(raw)
                })
                .catch(err => {
                  reject(err)
                })
            })
          })
          .catch(err => {
            reject(err)
          })
      })
    })
  }
}

export class CpcWalletSigner implements ISigner {
  sign (req: SignRequest): Promise<string> {
    // 显示密码输入框
    // 等待用户密码，解密当前钱包
    // 给交易签名
    // 返回签名后的交易
    throw new Error('Method not implemented.')
  }
}
