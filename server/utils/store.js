/**
 * 存储门面层
 * 对外保持稳定接口，内部委托给适配器
 * 生产环境设置 STORE_ADAPTER=redis 或 mysql 即可切换
 */
const adapter = require('./adapters');

// Re-export logger from adapter
const logger = adapter.logger;

function createOrder(order) {
  return adapter.createOrder(order);
}

function getOrder(outTradeNo) {
  return adapter.getOrder(outTradeNo);
}

/**
 * 更新订单信息
 */
function updateOrder(outTradeNo, updates) {
  return adapter.updateOrder(outTradeNo, updates);
}

/**
 * 查找用户未超时的 PENDING 订单（用于幂等控制）
 */
function findPendingOrder(openid, moduleId) {
  if (typeof adapter.findPendingOrder === 'function') {
    return adapter.findPendingOrder(openid, moduleId);
  }
  return null;
}

/**
 * 更新订单为已支付（幂等：已支付订单直接返回 true，不重复处理）
 */
function updateOrderPaid(outTradeNo, transactionId) {
  const o = adapter.getOrder(outTradeNo);
  if (!o) {
    logger.warn('支付回调：订单不存在', { outTradeNo });
    return false;
  }
  if (o.status === 'PAID') {
    logger.info('支付回调：订单已是 PAID 状态，跳过重复处理', { outTradeNo });
    return true;
  }
  if (o.status !== 'PENDING') {
    logger.warn('支付回调：订单状态异常，无法更新', { outTradeNo, status: o.status });
    return false;
  }
  adapter.updateOrder(outTradeNo, {
    status: 'PAID',
    transactionId,
    paidAt: Date.now(),
  });
  if (o.moduleId) {
    adapter.markPaid(o.openid, o.moduleId, outTradeNo);
  }
  logger.info('订单已支付', { outTradeNo, transactionId });
  return true;
}

function markPaid(openid, moduleId, outTradeNo) {
  return adapter.markPaid(openid, moduleId, outTradeNo);
}

function isPaidByOpenidAndModule(openid, moduleId) {
  return adapter.isPaidByOpenidAndModule(openid, moduleId);
}

function isPaid(openid) {
  // 兼容旧接口：检查 openid 是否存在任意付费记录
  if (typeof adapter.hasAnyPaidRecord === 'function') {
    return adapter.hasAnyPaidRecord(openid);
  }
  // 回退：尝试用空 moduleId 查询（适配器可能不支持）
  const record = adapter.getPaidRecord(openid, '');
  if (record) return true;
  return false;
}

function saveRecord(recordId, data) {
  return adapter.saveRecord(recordId, data);
}

function getRecord(recordId) {
  return adapter.getRecord(recordId);
}

function reset() {
  return adapter.reset();
}

/**
 * 清理超时订单（委托给适配器）
 * @returns {number} 清理的订单数
 */
function closeExpiredOrders() {
  if (typeof adapter.closeExpiredOrders === 'function') {
    return adapter.closeExpiredOrders();
  }
  return 0;
}

module.exports = {
  logger,
  createOrder,
  getOrder,
  updateOrder,
  findPendingOrder,
  updateOrderPaid,
  isPaid,
  markPaid,
  isPaidByOpenidAndModule,
  saveRecord,
  getRecord,
  reset,
  closeExpiredOrders,
};
