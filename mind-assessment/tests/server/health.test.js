/**
 * 健康检查与基础路由 - 集成测试
 */
const request = require('supertest');
const app = require('../../../server/app');

describe('基础路由', () => {
  test('GET /health 应返回 200 + ok', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(res.body.ts).toBeDefined();
  });

  test('GET /unknown 应返回 404', async () => {
    const res = await request(app).get('/unknown-path');
    expect(res.status).toBe(404);
    expect(res.body.message).toBe('Not Found');
  });

  test('未带 Authorization 访问受保护路由应返回 401', async () => {
    const res = await request(app).get('/api/result/R123');
    expect(res.status).toBe(401);
    expect(res.body.message).toBe('未登录');
  });
});
