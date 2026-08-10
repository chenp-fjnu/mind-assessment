/**
 * 服务器测试环境配置
 * 设置环境变量，避免依赖 .env 文件
 */
process.env.JWT_SECRET = 'test-secret-for-jest';
process.env.WX_APPID = 'test-appid';
process.env.WX_SECRET = 'test-secret';
process.env.WX_MCH_ID = 'test-mch-id';
process.env.WX_MCH_SERIAL_NO = 'test-serial-no';
process.env.WX_API_V3_KEY = 'test-api-v3-key-32-bytes-long!!';
process.env.NODE_ENV = 'test';

// 禁用 winston 文件输出（测试环境不需要日志文件）
const winston = require('winston');
const { transports } = winston;
winston.configure({
  level: 'error', // 只输出 error 级别
  format: winston.format.simple(),
  transports: [new transports.Console({ silent: true })],
});
