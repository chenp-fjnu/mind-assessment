/**
 * 结果路由 - API 集成测试
 */
const request = require('supertest');
const app = require('../../../server/app');
const { signToken } = require('../../../server/utils/auth');
const store = require('../../../server/utils/store');

function makeToken(openid = 'result-test-user') {
  return signToken({ openid });
}

describe('结果路由 /api/result', () => {
  let token;

  beforeEach(() => {
    token = makeToken();
    store.reset();
  });

  describe('POST /api/result/save', () => {
    test('无 token 应返回 401', async () => {
      const res = await request(app)
        .post('/api/result/save')
        .send({ recordId: 'R123', result: {} });
      expect(res.status).toBe(401);
    });

    test('缺少参数应返回 400', async () => {
      const res = await request(app)
        .post('/api/result/save')
        .set('Authorization', `Bearer ${token}`)
        .send({ recordId: 'R123' });
      expect(res.status).toBe(400);
      expect(res.body.message).toBe('参数缺失');
    });

    test('无效 recordId 应返回 400', async () => {
      const res = await request(app)
        .post('/api/result/save')
        .set('Authorization', `Bearer ${token}`)
        .send({ recordId: 'invalid-id', result: { iq: 100 } });
      expect(res.status).toBe(400);
      expect(res.body.message).toBe('无效的记录ID');
    });

    test('合法请求应保存成功', async () => {
      const res = await request(app)
        .post('/api/result/save')
        .set('Authorization', `Bearer ${token}`)
        // P0-6: result 必须包含 testId 字段；使用免费模块 mbti 避免触发付费校验
        .send({ recordId: 'R999001', result: { testId: 'mbti', type: 'INTJ', typeName: '建筑师' } });
      expect(res.status).toBe(200);
      expect(res.body.ok).toBe(true);
    });
  });

  describe('GET /api/result/:id', () => {
    test('无 token 应返回 401', async () => {
      const res = await request(app).get('/api/result/R999001');
      expect(res.status).toBe(401);
    });

    test('不存在的记录应返回 404', async () => {
      const res = await request(app)
        .get('/api/result/R-not-exist')
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(404);
    });

    test('应能获取已保存的结果', async () => {
      // 先保存
      await request(app)
        .post('/api/result/save')
        .set('Authorization', `Bearer ${token}`)
        // P0-6: result 必须包含 testId 字段；使用免费模块 mbti 避免触发付费校验
        .send({ recordId: 'R999002', result: { testId: 'mbti', type: 'ENFP', typeName: '竞选者' } });

      const res = await request(app)
        .get('/api/result/R999002')
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(200);
      expect(res.body.type).toBe('ENFP');
      expect(res.body.openid).toBe('result-test-user');
    });

    test('无权访问他人结果应返回 404', async () => {
      // 用户 A 保存
      const tokenA = makeToken('user-a');
      await request(app)
        .post('/api/result/save')
        .set('Authorization', `Bearer ${tokenA}`)
        // P0-6: result 必须包含 testId 字段；使用免费模块 mbti 避免触发付费校验
        .send({ recordId: 'R999003', result: { testId: 'mbti', type: 'ISTJ' } });

      // 用户 B 访问
      const tokenB = makeToken('user-b');
      const res = await request(app)
        .get('/api/result/R999003')
        .set('Authorization', `Bearer ${tokenB}`);
      // P1-12: 统一返回 404，不区分"不存在"与"无权访问"
      expect(res.status).toBe(404);
      expect(res.body.message).toBe('未找到');
    });
  });

  describe('POST /api/result/check-paid', () => {
    test('无 token 应返回 401', async () => {
      const res = await request(app)
        .post('/api/result/check-paid')
        .send({ moduleId: 'spm' });
      expect(res.status).toBe(401);
    });

    test('缺少 moduleId 应返回 400', async () => {
      const res = await request(app)
        .post('/api/result/check-paid')
        .set('Authorization', `Bearer ${token}`)
        .send({});
      expect(res.status).toBe(400);
    });

    test('未付费应返回 paid=false', async () => {
      const res = await request(app)
        .post('/api/result/check-paid')
        .set('Authorization', `Bearer ${token}`)
        .send({ moduleId: 'spm' });
      expect(res.status).toBe(200);
      expect(res.body.paid).toBe(false);
    });

    test('已付费应返回 paid=true', async () => {
      store.markPaid('result-test-user', 'spm', 'MA-paid-order');
      const res = await request(app)
        .post('/api/result/check-paid')
        .set('Authorization', `Bearer ${token}`)
        .send({ moduleId: 'spm' });
      expect(res.status).toBe(200);
      expect(res.body.paid).toBe(true);
    });
  });
});
