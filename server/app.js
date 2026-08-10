/**
 * 心智测评中心小程序后端
 * 提供：登录、微信支付（统一下单 + 回调）、结果存储
 */
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const fs = require('fs');
const path = require('path');

const authRoute = require('./routes/auth');
const payRoute = require('./routes/pay');
const resultRoute = require('./routes/result');
const { logger } = require('./utils/store');

const app = express();
const PORT = process.env.PORT || 3000;

// P0-3: trust proxy — 确保 express-rate-limit 能获取真实客户端 IP（反向代理场景）
app.set('trust proxy', 1);

// ---------- 启动环境校验 ----------
function validateEnv() {
  const required = ['WX_APPID', 'WX_SECRET', 'WX_MCH_ID', 'WX_MCH_SERIAL_NO', 'WX_API_V3_KEY', 'JWT_SECRET'];
  const missing = required.filter((k) => !process.env[k]);
  if (missing.length) {
    throw new Error(`缺少必要的环境变量: ${missing.join(', ')}，服务端无法启动。`);
  }
}
validateEnv();

// 初始化微信支付证书管理器（异步刷新，不阻塞启动）
const certManager = require('./utils/cert-manager');
certManager.init().catch((e) => {
  console.warn('证书管理器初始化失败:', e.message);
});

// ---------- 中间件 ----------
// CORS：生产环境限制来源，开发环境允许本地
// P2-1: trim 空格防止 "a.com, b.com" 中第二个 origin 带前导空格
const allowedOrigins = (process.env.CORS_ORIGINS || '').split(',').map((s) => s.trim()).filter(Boolean);
if (allowedOrigins.length === 0 && process.env.NODE_ENV !== 'production') {
  allowedOrigins.push('http://localhost:3000');
}
app.use(cors({
  origin: allowedOrigins.length ? allowedOrigins : false,
  credentials: true,
}));

// 支付回调使用 raw body 以保障签名验证（必须在 express.json 之前）
app.use('/api/pay/notify', express.raw({ type: 'application/json' }));
app.use(express.json({ limit: '1mb' }));

// 日志
app.use((req, _res, next) => {
  logger.info(`${req.method} ${req.url}`);
  next();
});

// 限流：每个 IP 在 15 分钟内最多 100 次请求（全局默认）
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 分钟
  max: 100, // 每个 IP 最多 100 次请求
  message: { message: '请求过于频繁，请稍后再试' },
});

// P0-3: 敏感接口差异化限流（必须注册在全局限流之前，否则会被全局截断）
// 登录接口：每个 IP 在 15 分钟内最多 20 次（防止 code 爆破）
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { message: '登录尝试过于频繁，请稍后再试' },
});
app.use('/api/login', loginLimiter);

// 创建订单接口：每个 IP 在 15 分钟内最多 30 次（防止恶意下单）
const createOrderLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: { message: '操作过于频繁，请稍后再试' },
});
app.use('/api/pay/create-order', createOrderLimiter);

// P0-3: 全局限流 — 排除支付回调路径（微信回调不应被限流）
app.use('/api/', (req, res, next) => {
  // 支付回调豁免限流，避免微信重试被拦截
  if (req.path === '/pay/notify') return next();
  limiter(req, res, next);
});

// 路由
app.use('/api', authRoute);
app.use('/api/pay', payRoute);
app.use('/api/result', resultRoute);

// 健康检查
app.get('/health', (_req, res) => res.json({ ok: true, ts: Date.now() }));

// 确保日志目录存在
const logDir = path.join(__dirname, 'logs');
if (!fs.existsSync(logDir)) fs.mkdirSync(logDir);

// 404
app.use((_req, res) => res.status(404).json({ message: 'Not Found' }));

// 错误处理
app.use((err, _req, res, _next) => {
  logger.error('未捕获错误', { error: err.message, stack: err.stack });
  res.status(500).json({ message: '服务器内部错误' });
});

// 仅在直接运行时启动监听；被 require 时不自动监听（便于集成测试）
if (require.main === module) {
  const server = app.listen(PORT, () => {
    logger.info(`心智测评中心后端已启动: http://localhost:${PORT}`);
  });

  // P2-8: 优雅关闭 — 收到 SIGTERM/SIGINT 时停止接收新请求，等待在途请求完成
  function gracefulShutdown(signal) {
    logger.info(`收到 ${signal}，开始优雅关闭...`);
    server.close(() => {
      logger.info('所有连接已断开，服务关闭');
      process.exit(0);
    });
    // 超时强制退出（防止某些请求卡住）
    setTimeout(() => {
      logger.warn('优雅关闭超时，强制退出');
      process.exit(1);
    }, 10000);
  }
  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  process.on('SIGINT', () => gracefulShutdown('SIGINT'));
}

module.exports = app;
