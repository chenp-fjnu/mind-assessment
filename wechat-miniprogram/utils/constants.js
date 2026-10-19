/**
 * 跨页面共享的常量，集中在此避免多处重复定义漂移。
 */

// 测评记录数据结构版本：模块题量/计分方式变更时递增。
// test.js 写入历史记录、result.js 读取校验时共用同一来源。
const SCHEMA_VERSION = 1

module.exports = {
  SCHEMA_VERSION,
}
