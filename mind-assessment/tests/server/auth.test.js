/**
 * auth JWT 认证工具 - 单元测试
 * P1-8: SECRET 不再导出，测试通过 signToken/authMiddleware 间接验证
 */
const { signToken, authMiddleware } = require('../../../server/utils/auth');

describe('auth JWT 认证工具', () => {
  describe('signToken', () => {
    test('应返回有效的 JWT 字符串', () => {
      const token = signToken({ openid: 'test-openid' });
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3); // JWT 三段式
    });

    test('不同 payload 应生成不同 token', () => {
      const t1 = signToken({ openid: 'user1' });
      const t2 = signToken({ openid: 'user2' });
      expect(t1).not.toBe(t2);
    });

    test('token 中应包含 openid', () => {
      const jwt = require('jsonwebtoken');
      const token = signToken({ openid: 'test-openid-123' });
      const decoded = jwt.decode(token);
      expect(decoded.openid).toBe('test-openid-123');
    });

    test('应使用配置的 SECRET 签发 token', () => {
      // P1-8: SECRET 不再导出，通过验证 signToken 产出的 token 能被 authMiddleware 校验通过来间接验证
      const token = signToken({ openid: 'secret-test' });
      expect(token).toBeDefined();
      expect(token.split('.')).toHaveLength(3);
      // authMiddleware 内部使用 SECRET 验证，能通过说明 SECRET 配置正确
      const req = { headers: { authorization: `Bearer ${token}` } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      const next = jest.fn();
      authMiddleware(req, res, next);
      expect(next).toHaveBeenCalled();
      expect(req.user.openid).toBe('secret-test');
    });
  });

  describe('authMiddleware', () => {
    let req, res, next;

    beforeEach(() => {
      req = { headers: {} };
      res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      next = jest.fn();
    });

    test('无 Authorization 头应返回 401', () => {
      authMiddleware(req, res, next);
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: '未登录' });
      expect(next).not.toHaveBeenCalled();
    });

    test('非 Bearer 格式应返回 401', () => {
      req.headers.authorization = 'Basic abc123';
      authMiddleware(req, res, next);
      expect(res.status).toHaveBeenCalledWith(401);
      expect(next).not.toHaveBeenCalled();
    });

    test('无效 token 应返回 401', () => {
      req.headers.authorization = 'Bearer invalid.token.here';
      authMiddleware(req, res, next);
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: 'token 已过期或无效' });
      expect(next).not.toHaveBeenCalled();
    });

    test('有效 token 应调用 next 并挂载 user', () => {
      const token = signToken({ openid: 'valid-user' });
      req.headers.authorization = `Bearer ${token}`;
      authMiddleware(req, res, next);
      expect(next).toHaveBeenCalled();
      expect(req.user).toBeDefined();
      expect(req.user.openid).toBe('valid-user');
    });

    test('过期 token 应返回 401', () => {
      const jwt = require('jsonwebtoken');
      // P1-8: 使用 process.env.JWT_SECRET 替代导出的 SECRET
      const expiredToken = jwt.sign({ openid: 'expired-user' }, process.env.JWT_SECRET, { expiresIn: '-1s' });
      req.headers.authorization = `Bearer ${expiredToken}`;
      authMiddleware(req, res, next);
      expect(res.status).toHaveBeenCalledWith(401);
      expect(next).not.toHaveBeenCalled();
    });
  });
});
