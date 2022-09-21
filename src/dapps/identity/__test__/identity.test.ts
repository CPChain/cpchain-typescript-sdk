import { createJsonRpcProvider } from '../../..'
import { IdentityService } from '../identity'

test('get identity', async () => {
  const provider = createJsonRpcProvider('https://civilian.testnet.cpchain.io', 41)
  const idService = new IdentityService(provider, '0x79De6319EC3e11Ed7F79eb8Cf6C37885EBc25Ead')

  /**
   * 未注册的地址，结果应该返回null
   */
  const id = await idService.getIdentityV1('0xC53367856164DA3De57784E0c96710088DA77e20')
  expect(id).toEqual(null)
})
