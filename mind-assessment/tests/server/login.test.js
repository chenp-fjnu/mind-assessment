/**
 * 登录路由 - API 集成测试
 */

// Mock wxpay.code2session
jest.mock('../../../server/utils/wxpay', () => ({
  code2session: jest.fn(),
  createJsapiOrder: jest.fn(),
  buildPayParams: jest.fn(),
  verifyNotifySignature: jest.fn(),
  decryptResource: jest.fn(),
  genNonceStr: jest.fn().mockReturnValue('mock-nonce'),
}));

const request = require('supertest');
const app = require('../../../server/app');
const { signToken } = require('../../../server/utils/auth');
const wxpay = require('../../../server/utils/wxpay');

describe('登录路由 /api/login', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('缺少 code 应返回 400', async () => {
    const res = await request(app)
      .post('/api/login')
      .send({});
    expect(res.status).toBe(400);
    expect(res.body.message).toBe('缺少 code');
  });

  test('code2session 成功应返回 token 和 openid', async () => {
    wxpay.code2session.mockResolvedValue({ openid: 'login-test-openid', session_key: 'key' });

    const res = await request(app)
      .post('/api/login')
      .send({ code: 'valid-code' });

    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
    expect(res.body.openid).toBe('login-test-openid');
    expect(wxpay.code2session).toHaveBeenCalledWith('valid-code');
  });

  test('code2session 失败应返回 500', async () => {
    wxpay.code2session.mockRejectedValue(new Error('code 无效'));

    const res = await request(app)
      .post('/api/login')
      .send({ code: 'invalid-code' });

    expect(res.status).toBe(500);
    expect(res.body.message).toContain('登录失败');
  });

  test('返回的 token 可用于后续认证', async () => {
    wxpay.code2session.mockResolvedValue({ openid: 'token-verify-user', session_key: 'key' });

    const loginRes = await request(app)
      .post('/api/login')
      .send({ code: 'test-code' });

    const token = loginRes.body.token;

    // 使用该 token 访问受保护路由
    const res = await request(app)
      .post('/api/result/check-paid')
      .set('Authorization', `Bearer ${token}`)
      .send({ moduleId: 'spm' });

    expect(res.status).toBe(200);
  });
});
