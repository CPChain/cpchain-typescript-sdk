import { WalletSigner } from '../../signer'

/**
 * V1版本上链的数据结构
 */
export type IdentityV1 = {
  name: string;
  privateKey: string;
  publicKey: string;
};

export interface IIdentityService {

  /**
   * 创建身份注册的数据结构,生成公私钥
   */
  createIdentityV1(options:Partial<IdentityV1>):IdentityV1

  /**
   * 通过私钥进行导出公钥
   * @param privateKeyBase64
   */
  getPublicKeyV1(privateKeyBase64:string):string

  /**
   * 根据地址获取链上注册信息
   * @param address
   */
  getIdentityV1(address: string): Promise<IdentityV1 | null>;

  /**
   * 提交注册信息(包括修改注册信息)
   * @param dappRegistration
   */
  registerV1(signer: WalletSigner, dappRegistration: IdentityV1): Promise<IdentityV1>;
}
