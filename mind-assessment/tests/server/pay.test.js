/**
 * 支付路由 - API 集成测试
 * 使用 jest.mock 模拟微信支付外部调用
 */

// Mock wxpay 模块，避免真实 HTTP 调用
jest.mock('../../../server/utils/wxpay', () => ({
  code2session: jest.fn().mockResolvedValue({ openid: 'mock-openid', session_key: 'mock-key' }),
  createJsapiOrder: jest.fn().mockResolvedValue({ prepay_id: 'mock-prepay-id' }),
  buildPayParams: jest.fn().mockResolvedValue({
    timeStamp: '1234567890',
    nonceStr: 'mock-nonce',
    package: 'prepay_id=mock-prepay-id',
    signType: 'RSA',
    paySign: 'mock-sign',
  }),
  verifyNotifySignature: jest.fn().mockReturnValue(true),
  decryptResource: jest.fn().mockReturnValue({
    trade_state: 'SUCCESS',
    out_trade_no: 'mock-order',
    transaction_id: 'mock-tx-id',
  }),
  genNonceStr: jest.fn().mockReturnValue('mock-nonce-str'),
}));

const request = require('supertest');
const app = require('../../../server/app');
const { signToken } = require('../../../server/utils/auth');
const store = require('../../../server/utils/store');
const wxpay = require('../../../server/utils/wxpay');

// 生成测试用 token
function makeToken(openid = 'test-user-001') {
  return signToken({ openid });
}

describe('支付路由 /api/pay', () => {
  let token;

  beforeEach(() => {
    token = makeToken();
    jest.clearAllMocks();
    // 清空内存存储，确保测试隔离
    store.reset();
    // 保留 wxpay 的默认 mock 行为
    wxpay.code2session.mockResolvedValue({ openid: 'mock-openid', session_key: 'mock-key' });
    wxpay.createJsapiOrder.mockResolvedValue({ prepay_id: 'mock-prepay-id' });
    wxpay.buildPayParams.mockResolvedValue({
      timeStamp: '1234567890', nonceStr: 'mock-nonce',
      package: 'prepay_id=mock-prepay-id', signType: 'RSA', paySign: 'mock-sign',
    });
  });

  describe('POST /api/pay/create-order', () => {
    test('无 token 应返回 401', async () => {
      const res = await request(app)
        .post('/api/pay/create-order')
        .send({ moduleId: 'spm' });
      expect(res.status).toBe(401);
    });

    test('缺少 moduleId 应返回 400', async () => {
      const res = await request(app)
        .post('/api/pay/create-order')
        .set('Authorization', `Bearer ${token}`)
        .send({});
      expect(res.status).toBe(400);
      expect(res.body.message).toBe('缺少 moduleId');
    });

    test('无效 moduleId 应返回 400', async () => {
      const res = await request(app)
        .post('/api/pay/create-order')
        .set('Authorization', `Bearer ${token}`)
        .send({ moduleId: 'INVALID!!' });
      expect(res.status).toBe(400);
      expect(res.body.message).toBe('无效的测评类型');
    });

    test('免费模块应返回 400（不支持付费）', async () => {
      const res = await request(app)
        .post('/api/pay/create-order')
        .set('Authorization', `Bearer ${token}`)
        .send({ moduleId: 'mbti' });
      expect(res.status).toBe(400);
      expect(res.body.message).toBe('该测评不支持付费');
    });

    test('付费模块应返回支付参数', async () => {
      const res = await request(app)
        .post('/api/pay/create-order')
        .set('Authorization', `Bearer ${token}`)
        .send({ moduleId: 'spm', recordId: 'R123456' });
      expect(res.status).toBe(200);
      expect(res.body.outTradeNo).toBeDefined();
      expect(res.body.payParams).toBeDefined();
      expect(res.body.amount).toBe(990); // 服务端价格表
      expect(wxpay.createJsapiOrder).toHaveBeenCalled();
    });

    test('金额应由服务端决定（不信任客户端）', async () => {
      const res = await request(app)
        .post('/api/pay/create-order')
        .set('Authorization', `Bearer ${token}`)
        .send({ moduleId: 'wechsler', recordId: 'R123', amount: 1 }); // 客户端传 1 分
      expect(res.status).toBe(200);
      expect(res.body.amount).toBe(1290); // 服务端价格 12.9 元 = 1290 分
    });

    test('已付费模块应返回 alreadyPaid', async () => {
      // 先标记已付费
      store.markPaid('test-user-001', 'spm', 'MA-order-1');
      const res = await request(app)
        .post('/api/pay/create-order')
        .set('Authorization', `Bearer ${token}`)
        .send({ moduleId: 'spm' });
      expect(res.status).toBe(200);
      expect(res.body.alreadyPaid).toBe(true);
    });
  });

  describe('POST /api/pay/confirm', () => {
    test('无 token 应返回 401', async () => {
      const res = await request(app)
        .post('/api/pay/confirm')
        .send({ moduleId: 'spm' });
      expect(res.status).toBe(401);
    });

    test('缺少 moduleId 应返回 400', async () => {
      const res = await request(app)
        .post('/api/pay/confirm')
        .set('Authorization', `Bearer ${token}`)
        .send({});
      expect(res.status).toBe(400);
    });

    // P3-19: confirm 现在必须传 outTradeNo
    test('缺少 outTradeNo 应返回 400', async () => {
      const res = await request(app)
        .post('/api/pay/confirm')
        .set('Authorization', `Bearer ${token}`)
        .send({ moduleId: 'spm' });
      expect(res.status).toBe(400);
      expect(res.body.message).toBe('缺少 outTradeNo');
    });

    test('订单不存在应返回 404', async () => {
      const res = await request(app)
        .post('/api/pay/confirm')
        .set('Authorization', `Bearer ${token}`)
        .send({ moduleId: 'spm', outTradeNo: 'nonexistent' });
      expect(res.status).toBe(404);
    });

    test('未支付订单应返回 paid=false', async () => {
      store.createOrder({
        outTradeNo: 'MA-pending',
        moduleId: 'spm',
        openid: 'test-user-001',
        amount: 990,
        status: 'PENDING',
        createdAt: Date.now(),
      });
      const res = await request(app)
        .post('/api/pay/confirm')
        .set('Authorization', `Bearer ${token}`)
        .send({ moduleId: 'spm', outTradeNo: 'MA-pending' });
      expect(res.status).toBe(200);
      expect(res.body.paid).toBe(false);
    });

    // P0-1: 越权漏洞修复测试
    test('他人订单应返回 403（越权防护）', async () => {
      store.createOrder({
        outTradeNo: 'MA-other',
        moduleId: 'spm',
        openid: 'different-user',
        amount: 990,
        status: 'PAID',
        paidAt: Date.now(),
      });
      const res = await request(app)
        .post('/api/pay/confirm')
        .set('Authorization', `Bearer ${token}`)
        .send({ moduleId: 'spm', outTradeNo: 'MA-other' });
      // P1-9: 统一返回 404，不区分"不存在"与"无权访问"，防止订单号枚举
      expect(res.status).toBe(404);
      expect(res.body.message).toBe('订单不存在');
    });

    // P0-1: moduleId 不匹配应返回 404（P1-9: 统一不泄露订单存在性）
    test('moduleId 不匹配应返回 404（防跨模块解锁）', async () => {
      store.createOrder({
        outTradeNo: 'MA-mismatch',
        moduleId: 'spm',
        openid: 'test-user-001',
        amount: 990,
        status: 'PAID',
        paidAt: Date.now(),
      });
      const res = await request(app)
        .post('/api/pay/confirm')
        .set('Authorization', `Bearer ${token}`)
        .send({ moduleId: 'wechsler', outTradeNo: 'MA-mismatch' });
      expect(res.status).toBe(404);
    });

    test('已支付订单应返回 paid=true', async () => {
      store.createOrder({
        outTradeNo: 'MA-paid',
        moduleId: 'pf16',
        openid: 'test-user-001',
        amount: 990,
        status: 'PAID',
        paidAt: Date.now(),
      });
      const res = await request(app)
        .post('/api/pay/confirm')
        .set('Authorization', `Bearer ${token}`)
        .send({ moduleId: 'pf16', outTradeNo: 'MA-paid' });
      expect(res.status).toBe(200);
      expect(res.body.paid).toBe(true);
    });
  });

  describe('GET /api/pay/status', () => {
    test('无 token 应返回 401', async () => {
      const res = await request(app).get('/api/pay/status?outTradeNo=MA123');
      expect(res.status).toBe(401);
    });

    test('不存在的订单应返回 404', async () => {
      const res = await request(app)
        .get('/api/pay/status?outTradeNo=nonexistent')
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(404);
    });

    test('他人订单应返回 404（所有权校验）', async () => {
      // 创建属于其他用户的订单
      store.createOrder({
        outTradeNo: 'MA-other-user',
        moduleId: 'spm',
        openid: 'different-user',
        amount: 990,
        status: 'PENDING',
        createdAt: Date.now(),
      });
      const res = await request(app)
        .get('/api/pay/status?outTradeNo=MA-other-user')
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(404); // 不泄露订单存在性
    });

    test('自己的订单应返回状态', async () => {
      store.createOrder({
        outTradeNo: 'MA-my-order',
        moduleId: 'spm',
        openid: 'test-user-001',
        amount: 990,
        status: 'PENDING',
        createdAt: Date.now(),
      });
      const res = await request(app)
        .get('/api/pay/status?outTradeNo=MA-my-order')
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('PENDING');
      expect(res.body.paid).toBe(false);
    });
  });

  describe('POST /api/pay/notify', () => {
    test('验签通过应处理回调', async () => {
      wxpay.verifyNotifySignature.mockReturnValue(true);
      wxpay.decryptResource.mockReturnValue({
        trade_state: 'SUCCESS',
        out_trade_no: 'MA-notify-test',
        transaction_id: 'tx-notify-001',
        amount: { total: 990 },
      });

      // 先创建订单
      store.createOrder({
        outTradeNo: 'MA-notify-test',
        moduleId: 'spm',
        openid: 'notify-user',
        amount: 990,
        status: 'PENDING',
        createdAt: Date.now(),
      });

      // P1-7: 使用当前时间戳（秒级），确保通过时效性校验
      const nowTs = Math.floor(Date.now() / 1000).toString();
      const res = await request(app)
        .post('/api/pay/notify')
        .set('Content-Type', 'application/json')
        .set('wechatpay-signature', 'mock-sig')
        .send({
          timestamp: nowTs,
          nonce: 'mock-nonce',
          serial: 'mock-serial',
          resource: {
            ciphertext: 'mock-cipher',
            associated_data: 'mock-aad',
            nonce: 'mock-nonce',
          },
        });

      expect(res.status).toBe(200);
      expect(res.body.code).toBe('SUCCESS');

      // 验证订单已更新
      const order = store.getOrder('MA-notify-test');
      expect(order.status).toBe('PAID');
    });

    test('验签失败应返回 401', async () => {
      wxpay.verifyNotifySignature.mockReturnValue(false);

      // P1-7: 使用当前时间戳
      const nowTs = Math.floor(Date.now() / 1000).toString();
      const res = await request(app)
        .post('/api/pay/notify')
        .set('Content-Type', 'application/json')
        .set('wechatpay-signature', 'bad-sig')
        .send({
          timestamp: nowTs,
          nonce: 'n',
          serial: 's',
          resource: { ciphertext: 'c', associated_data: 'a', nonce: 'n' },
        });

      expect(res.status).toBe(401);
      expect(res.body.code).toBe('FAIL');
    });

    // P1-4: 订单不存在时回调应返回 404 FAIL（触发微信重试）
    test('订单不存在的回调应返回 404 FAIL', async () => {
      wxpay.verifyNotifySignature.mockReturnValue(true);
      wxpay.decryptResource.mockReturnValue({
        trade_state: 'SUCCESS',
        out_trade_no: 'MA-nonexistent-callback',
        transaction_id: 'tx-nonexistent',
        amount: { total: 990 },
      });

      // P1-7: 使用当前时间戳
      const nowTs = Math.floor(Date.now() / 1000).toString();
      const res = await request(app)
        .post('/api/pay/notify')
        .set('Content-Type', 'application/json')
        .set('wechatpay-signature', 'mock-sig')
        .send({
          timestamp: nowTs,
          nonce: 'mock-nonce',
          serial: 'mock-serial',
          resource: {
            ciphertext: 'mock-cipher',
            associated_data: 'mock-aad',
            nonce: 'mock-nonce',
          },
        });

      expect(res.status).toBe(404);
      expect(res.body.code).toBe('FAIL');
    });
  });

  // P1-4: 订单幂等控制测试
  describe('订单幂等控制', () => {
    test('重复创建订单应复用已有 PENDING 订单', async () => {
      // 第一次创建订单
      const res1 = await request(app)
        .post('/api/pay/create-order')
        .set('Authorization', `Bearer ${token}`)
        .send({ moduleId: 'spm', recordId: 'R123456' });
      expect(res1.status).toBe(200);
      expect(res1.body.outTradeNo).toBeDefined();

      // 第二次创建相同模块订单，应复用
      const res2 = await request(app)
        .post('/api/pay/create-order')
        .set('Authorization', `Bearer ${token}`)
        .send({ moduleId: 'spm', recordId: 'R123456' });
      expect(res2.status).toBe(200);
      expect(res2.body.outTradeNo).toBe(res1.body.outTradeNo); // 复用同一订单号
    });
  });

  // P1-5: 错误信息不泄露测试
  describe('错误信息安全', () => {
    test('创建订单失败不回显内部错误', async () => {
      wxpay.createJsapiOrder.mockRejectedValue(new Error('internal: db connection failed at 10.0.0.1:3306'));
      const res = await request(app)
        .post('/api/pay/create-order')
        .set('Authorization', `Bearer ${token}`)
        .send({ moduleId: 'spm' });
      expect(res.status).toBe(500);
      expect(res.body.message).not.toContain('internal');
      expect(res.body.message).not.toContain('db');
      expect(res.body.message).not.toContain('10.0.0.1');
    });
  });
});
