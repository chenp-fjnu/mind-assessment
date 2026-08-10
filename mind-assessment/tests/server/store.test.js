/**
 * Store 层单元测试
 * 覆盖 findPendingOrder、updateOrderPaid 幂等、closeExpiredOrders 等
 */
const store = require('../../../server/utils/store');

describe('Store 存储层', () => {
  beforeEach(() => {
    store.reset();
  });

  describe('findPendingOrder', () => {
    test('应返回未超时的 PENDING 订单', () => {
      store.createOrder({
        outTradeNo: 'MA-001',
        openid: 'user-A',
        moduleId: 'spm',
        amount: 990,
        status: 'PENDING',
        createdAt: Date.now() - 10000, // 10 秒前
      });

      const order = store.findPendingOrder('user-A', 'spm');
      expect(order).toBeTruthy();
      expect(order.outTradeNo).toBe('MA-001');
    });

    test('不应返回其他用户的订单', () => {
      store.createOrder({
        outTradeNo: 'MA-002',
        openid: 'user-B',
        moduleId: 'spm',
        amount: 990,
        status: 'PENDING',
        createdAt: Date.now(),
      });

      const order = store.findPendingOrder('user-A', 'spm');
      expect(order).toBeNull();
    });

    test('不应返回其他模块的订单', () => {
      store.createOrder({
        outTradeNo: 'MA-003',
        openid: 'user-A',
        moduleId: 'wechsler',
        amount: 1290,
        status: 'PENDING',
        createdAt: Date.now(),
      });

      const order = store.findPendingOrder('user-A', 'spm');
      expect(order).toBeNull();
    });

    test('不应返回已支付的订单', () => {
      store.createOrder({
        outTradeNo: 'MA-004',
        openid: 'user-A',
        moduleId: 'spm',
        amount: 990,
        status: 'PAID',
        createdAt: Date.now(),
        paidAt: Date.now(),
      });

      const order = store.findPendingOrder('user-A', 'spm');
      expect(order).toBeNull();
    });
  });

  describe('updateOrderPaid 幂等', () => {
    test('已 PAID 的订单重复回调应返回 true', () => {
      store.createOrder({
        outTradeNo: 'MA-idem-001',
        openid: 'user-A',
        moduleId: 'spm',
        amount: 990,
        status: 'PAID',
        createdAt: Date.now(),
        paidAt: Date.now(),
        transactionId: 'tx-001',
      });

      const ok = store.updateOrderPaid('MA-idem-001', 'tx-002');
      expect(ok).toBe(true);

      // transactionId 不应被覆盖
      const order = store.getOrder('MA-idem-001');
      expect(order.transactionId).toBe('tx-001');
    });

    test('不存在的订单应返回 false', () => {
      const ok = store.updateOrderPaid('nonexistent', 'tx-999');
      expect(ok).toBe(false);
    });

    test('CLOSED 状态的订单不应被更新', () => {
      store.createOrder({
        outTradeNo: 'MA-closed',
        openid: 'user-A',
        moduleId: 'spm',
        amount: 990,
        status: 'CLOSED',
        createdAt: Date.now() - 31 * 60 * 1000,
      });

      const ok = store.updateOrderPaid('MA-closed', 'tx-closed');
      expect(ok).toBe(false);
    });
  });

  describe('closeExpiredOrders', () => {
    test('应关闭超时的 PENDING 订单', () => {
      store.createOrder({
        outTradeNo: 'MA-expired',
        openid: 'user-A',
        moduleId: 'spm',
        amount: 990,
        status: 'PENDING',
        createdAt: Date.now() - 31 * 60 * 1000, // 31 分钟前
      });

      const closed = store.closeExpiredOrders();
      expect(closed).toBeGreaterThan(0);

      const order = store.getOrder('MA-expired');
      expect(order.status).toBe('CLOSED');
    });

    test('不应关闭未超时的 PENDING 订单', () => {
      store.createOrder({
        outTradeNo: 'MA-fresh',
        openid: 'user-A',
        moduleId: 'spm',
        amount: 990,
        status: 'PENDING',
        createdAt: Date.now() - 5000, // 5 秒前
      });

      store.closeExpiredOrders();
      const order = store.getOrder('MA-fresh');
      expect(order.status).toBe('PENDING');
    });
  });
});
