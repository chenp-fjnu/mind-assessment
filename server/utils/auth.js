/**
 * JWT 认证中间件
 * 用于校验请求头中的 Bearer Token，并将解码后的用户信息挂载到 req.user
 */
const jwt = require('jsonwebtoken');

// 密钥：必须从环境变量读取，禁止硬编码默认值
const SECRET = process.env.JWT_SECRET;
if (!SECRET) {
  throw new Error('缺少环境变量 JWT_SECRET，服务端无法启动。请在 .env 文件中配置随机长字符串作为 JWT 密钥。');
}

/**
 * 认证中间件：校验 Authorization: Bearer <token>
 * 校验通过后将用户信息挂载到 req.user，否则返回 401
 */
function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: '未登录' });
  }
  const token = authHeader.replace('Bearer ', '');
  try {
    // P1-8: 指定算法为 HS256，防止 algorithm=none 攻击
    req.user = jwt.verify(token, SECRET, { algorithms: ['HS256'] });
    next();
  } catch (e) {
    return res.status(401).json({ message: 'token 已过期或无效' });
  }
}

/**
 * 签发 JWT token
 * @param {object} payload 载荷，通常为 { openid }
 * @returns {string} JWT token，有效期 7 天
 */
function signToken(payload) {
  return jwt.sign(payload, SECRET, { expiresIn: '7d' });
}

// P1-8: 不导出 SECRET，防止其他模块直接使用密钥绕过签名校验
module.exports = { authMiddleware, signToken };
