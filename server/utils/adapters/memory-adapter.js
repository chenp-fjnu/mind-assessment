/**
 * 内存存储适配器（开发/演示用）
 * 生产环境请替换为 MySQL / MongoDB / Redis 适配器
 */

const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
  ],
});

// 内存表
const orders = new Map();
const records = new Map();
const paidMap = new Map();

const ORDER_TIMEOUT = 30 * 60 * 1000; // 30 分钟
const CLEANUP_INTERVAL = 60 * 60 * 1000; // P1-5: 每小时清理一次
const RECORD_MAX_AGE = 7 * 24 * 60 * 60 * 1000; // P1-5: 记录最长保留 7 天

/**
 * 清理超时订单（PENDING 超过 30 分钟标记为 CLOSED）
 * @returns {number} 清理的订单数
 */
function closeExpiredOrders() {
  const now = Date.now();
  let closed = 0;
  for (const [no, o] of orders) {
    if (o.status === 'PENDING' && (now - o.createdAt) > ORDER_TIMEOUT) {
      o.status = 'CLOSED';
      o.closedAt = now; // P1-5: 记录关闭时间，供 cleanupStaleData 使用
      closed++;
      logger.info('订单超时关闭', { outTradeNo: no, createdAt: o.createdAt });
    }
  }
  return closed;
}

/**
 * P1-5: 清理已关闭的旧订单和过期记录，防止内存无限增长
 * CLOSED 超过 1 小时的订单删除，超过 7 天的记录删除
 */
function cleanupStaleData() {
  const now = Date.now();
  let removedOrders = 0;
  let removedRecords = 0;

  for (const [no, o] of orders) {
    if (o.status === 'CLOSED' && (now - (o.closedAt || o.createdAt)) > CLEANUP_INTERVAL) {
      orders.delete(no);
      removedOrders++;
    }
  }

  for (const [id, r] of records) {
    if (r.savedAt && (now - r.savedAt) > RECORD_MAX_AGE) {
      records.delete(id);
      removedRecords++;
    }
  }

  if (removedOrders || removedRecords) {
    logger.info('内存清理完成', { removedOrders, removedRecords, ordersRemaining: orders.size, recordsRemaining: records.size });
  }
}

// P1-5: 启动定时清理（每小时执行一次）
let cleanupTimer = null;
function startCleanupScheduler() {
  if (cleanupTimer) return;
  cleanupTimer = setInterval(() => {
    try {
      closeExpiredOrders();
      cleanupStaleData();
    } catch (e) {
      logger.error('内存清理失败', { error: e.message });
    }
  }, CLEANUP_INTERVAL);
}
startCleanupScheduler();

module.exports = {
  logger,

  createOrder(order) {
    orders.set(order.outTradeNo, order);
    return order;
  },

  getOrder(outTradeNo) {
    return orders.get(outTradeNo);
  },

  getAllOrders() {
    return Array.from(orders.values());
  },

  updateOrder(outTradeNo, updates) {
    const o = orders.get(outTradeNo);
    if (!o) return null;
    Object.assign(o, updates);
    return o;
  },

  /**
   * 查找用户未超时的 PENDING 订单（用于幂等控制）
   * @param {string} openid 用户 openid
   * @param {string} moduleId 模块 ID
   * @returns {object|null} 订单对象或 null
   */
  findPendingOrder(openid, moduleId) {
    const now = Date.now();
    for (const o of orders.values()) {
      if (o.openid === openid &&
          o.moduleId === moduleId &&
          o.status === 'PENDING' &&
          (now - o.createdAt) < ORDER_TIMEOUT) {
        return o;
      }
    }
    return null;
  },

  markPaid(openid, moduleId, outTradeNo) {
    const key = `${openid}:${moduleId}`;
    paidMap.set(key, { outTradeNo, paidAt: Date.now() });
    // P2-2: 日志中 openid 脱敏，防止 PII 明文记录
    const validate = require('../validate');
    logger.info('标记已支付', { openid: validate.maskOpenid(openid), moduleId, outTradeNo });
  },

  isPaidByOpenidAndModule(openid, moduleId) {
    return paidMap.has(`${openid}:${moduleId}`);
  },

  getPaidRecord(openid, moduleId) {
    return paidMap.get(`${openid}:${moduleId}`);
  },

  /**
   * 检查某 openid 是否存在任意付费记录
   * 用于兼容旧版 isPaid(openid) 接口
   */
  hasAnyPaidRecord(openid) {
    for (const key of paidMap.keys()) {
      if (key.startsWith(`${openid}:`)) return true;
    }
    return false;
  },

  saveRecord(recordId, data) {
    records.set(recordId, { ...data, savedAt: Date.now() });
  },

  getRecord(recordId) {
    return records.get(recordId);
  },

  closeExpiredOrders,

  reset() {
    orders.clear();
    records.clear();
    paidMap.clear();
  },
};
