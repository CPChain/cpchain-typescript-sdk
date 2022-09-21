import { WalletSigner } from '../../signer'

export class NeedRegisterError extends Error {
  get message (): string {
    return 'Need Register'
  }
}

export class PrivateKeyLostError extends Error {
  get message (): string {
    return 'Private key lost'
  }
}

export type DappRegistrationV1 = {
  address: string;
  name: string;
  privateKey: string;
  publicKey: string;
};

export type ECDHMessage = { iv: string; ciphertext: string; mac?: string };

export interface RegisterService {
  /**
   * 根据地址获取链上注册信息
   * @param address
   */
  onchainV1(address: string): Promise<DappRegistrationV1 | null>;

  /**
   * 提交注册信息
   * @param dappRegistration
   */
  registerV1(singer:WalletSigner, dappRegistration: DappRegistrationV1): Promise<DappRegistrationV1>;
}
