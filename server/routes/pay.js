const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const wxpay = require('../utils/wxpay');
const store = require('../utils/store');
const { authMiddleware } = require('../utils/auth');
const validate = require('../utils/validate');
const { PRICE_TABLE, isPaidModule } = require('../config/price-table');

// 注意：/notify 为微信支付回调端点，不需要 JWT 鉴权（使用微信支付签名验证）
// 其余支付接口需要登录
router.use((req, res, next) => {
  if (req.path === '/notify') return next();
  authMiddleware(req, res, next);
});

/**
 * POST /api/pay/create-order
 * 创建微信支付订单（JSAPI 统一下单）
 * 金额由服务端 PRICE_TABLE 决定，不信任客户端传入
 */
router.post('/create-order', async (req, res) => {
  try {
    const { recordId, moduleId } = req.body;
    const openid = req.user.openid; // 从 JWT 获取，不信任客户端
    if (!moduleId) return res.status(400).json({ message: '缺少 moduleId' });
    if (!validate.isModuleId(moduleId)) return res.status(400).json({ message: '无效的测评类型' });

    // P1-8: 校验 recordId 格式（如果传入的话）
    if (recordId && !validate.isRecordId(recordId)) {
      return res.status(400).json({ message: '无效的记录ID' });
    }

    // 金额由服务端查表决定
    const amount = PRICE_TABLE[moduleId];
    if (!isPaidModule(moduleId)) return res.status(400).json({ message: '该测评不支持付费' });

    // 检查是否已付费
    if (store.isPaidByOpenidAndModule(openid, moduleId)) {
      return res.json({ alreadyPaid: true, message: '该测评已解锁' });
    }

    // 惰性清理超时订单（PENDING 超过 30 分钟标记为 CLOSED）
    store.closeExpiredOrders();

    // P1-4: 幂等控制 — 检查是否已有有效 PENDING 订单，有则复用
    const existingOrder = store.findPendingOrder(openid, moduleId);
    if (existingOrder && existingOrder.prepayId) {
      // 复用已有订单的 prepayId，重新生成支付参数
      const payParams = await wxpay.buildPayParams(existingOrder.prepayId);
      store.logger.info('复用已有 PENDING 订单', { outTradeNo: existingOrder.outTradeNo, openid: validate.maskOpenid(openid), moduleId });
      return res.json({ outTradeNo: existingOrder.outTradeNo, payParams, amount });
    }

    // P2-8: 防碰撞订单号（使用 crypto.randomBytes 替代 Math.random）
    const outTradeNo = 'MA' + Date.now() + crypto.randomBytes(4).toString('hex');
    const order = store.createOrder({
      outTradeNo, recordId, moduleId, openid, amount,
      description: '心智测评报告',
      status: 'PENDING', createdAt: Date.now(),
    });

    // 调用微信支付统一下单
    const result = await wxpay.createJsapiOrder({
      openid, amount,
      description: order.description, outTradeNo,
    });

    // 缓存 prepayId 以支持幂等复用
    store.updateOrder(outTradeNo, { prepayId: result.prepay_id });

    // 构造前端调起支付参数
    const payParams = await wxpay.buildPayParams(result.prepay_id);
    store.logger.info('订单已创建', { outTradeNo, openid: validate.maskOpenid(openid), moduleId, amount });
    res.json({ outTradeNo, payParams, amount });
  } catch (e) {
    store.logger.error('创建订单失败', { error: e.message, stack: e.stack });
    // P1-5: 不回显内部错误信息
    res.status(500).json({ message: '创建订单失败，请稍后重试' });
  }
});

/**
 * POST /api/pay/notify
 * 微信支付回调通知
 * 注意：必须为 HTTPS，且 URL 需在微信支付商户平台配置
 * 注意：此路由不需要 JWT 鉴权（由微信支付签名验证保障安全）
 * 兼容 express.json 已解析（req.body 为对象）和 express.raw（req.body 为 Buffer）两种情况
 */
router.post('/notify', async (req, res) => {
  try {
    const body = typeof req.body === 'string' ? req.body : (Buffer.isBuffer(req.body) ? req.body.toString() : JSON.stringify(req.body));
    const parsed = typeof req.body === 'object' && !Buffer.isBuffer(req.body) ? req.body : JSON.parse(body);
    const { timestamp, nonce, serial, resource } = parsed;
    const signature = req.headers['wechatpay-signature'];

    // P1-7: 校验 timestamp 时效性（超过 5 分钟的回调视为过期，防止重放攻击）
    const now = Math.floor(Date.now() / 1000);
    const NOTIFY_TTL = 5 * 60; // 5 分钟
    const parsedTs = parseInt(timestamp, 10);
    // P1-4: 修复 NaN 绕过 — parseInt 对非数字返回 NaN，需显式校验
    if (!timestamp || isNaN(parsedTs) || Math.abs(now - parsedTs) > NOTIFY_TTL) {
      store.logger.warn('支付回调 timestamp 过期或无效', { timestamp, serverNow: now });
      return res.status(401).json({ code: 'FAIL', message: '回调已过期' });
    }

    // 验签
    const ok = wxpay.verifyNotifySignature({
      timestamp, nonce, serial,
      body, signature,
    });
    if (!ok) return res.status(401).json({ code: 'FAIL', message: '验签失败' });

    // 解密回调资源
    const decrypted = wxpay.decryptResource(
      resource.ciphertext, resource.associated_data, resource.nonce
    );
    if (decrypted.trade_state === 'SUCCESS') {
      // P1-7: 金额一致性校验 — 回调金额必须与订单金额匹配
      const order = store.getOrder(decrypted.out_trade_no);
      if (!order) {
        store.logger.warn('支付回调：订单不存在', { outTradeNo: decrypted.out_trade_no });
        // P1-4: 返回 FAIL 让微信重试，但使用 404 而非 500
        return res.status(404).json({ code: 'FAIL', message: '订单不存在' });
      }
      // P1-6: 金额校验必须存在且匹配，amount 缺失时视为异常拒绝
      const callbackAmount = decrypted.amount && decrypted.amount.total;
      if (callbackAmount === undefined || callbackAmount === null) {
        store.logger.error('支付回调缺少金额字段', { outTradeNo: decrypted.out_trade_no });
        return res.status(400).json({ code: 'FAIL', message: '回调数据异常' });
      }
      if (callbackAmount !== order.amount) {
        store.logger.error('支付回调金额不一致', {
          outTradeNo: decrypted.out_trade_no,
          orderAmount: order.amount,
          callbackAmount,
        });
        return res.status(409).json({ code: 'FAIL', message: '金额不一致' });
      }

      const ok = store.updateOrderPaid(decrypted.out_trade_no, decrypted.transaction_id);
      if (!ok) {
        store.logger.warn('支付回调：订单处理失败（可能不存在或状态异常）', {
          outTradeNo: decrypted.out_trade_no,
          tradeState: decrypted.trade_state,
        });
        // P1-3: 订单不存在时返回 FAIL，触发微信重试（最多 15 次）
        return res.status(500).json({ code: 'FAIL', message: '订单处理失败' });
      }
    }
    res.json({ code: 'SUCCESS', message: '成功' });
  } catch (e) {
    store.logger.error('回调处理失败', { error: e.message, stack: e.stack });
    // P1-5: 不回显内部错误信息
    res.status(500).json({ code: 'FAIL', message: '回调处理失败' });
  }
});

/**
 * POST /api/pay/confirm
 * 前端支付成功后主动确认（双保险，真实状态以回调为准）
 * P0-1: 增加 openid + moduleId 双重归属校验，防止越权解锁
 * P3-19: 必须传 outTradeNo，不再支持无订单号的确认
 */
router.post('/confirm', async (req, res) => {
  try {
    const { moduleId, outTradeNo } = req.body;
    const openid = req.user.openid;
    if (!moduleId) return res.status(400).json({ message: '缺少 moduleId' });
    if (!outTradeNo) return res.status(400).json({ message: '缺少 outTradeNo' });
    if (!validate.isModuleId(moduleId)) return res.status(400).json({ message: '无效的测评类型' });

    const order = store.getOrder(outTradeNo);
    // P1-9: 统一返回 404，不区分"不存在"与"无权访问"，防止订单号枚举
    if (!order) return res.status(404).json({ message: '订单不存在' });

    // P0-1: 双重归属校验 — 订单 openid 必须匹配当前用户，moduleId 必须匹配请求
    if (order.openid !== openid || order.moduleId !== moduleId) {
      store.logger.warn('越权解锁尝试', { outTradeNo, openid: validate.maskOpenid(openid), orderOpenid: validate.maskOpenid(order.openid), requestModuleId: moduleId, orderModuleId: order.moduleId });
      return res.status(404).json({ message: '订单不存在' });
    }

    if (order.status === 'PAID') {
      store.markPaid(openid, moduleId, outTradeNo);
      return res.json({ ok: true, paid: true });
    }

    // 订单未支付，返回当前状态
    res.json({ ok: true, paid: false, status: order.status });
  } catch (e) {
    store.logger.error('确认支付失败', { error: e.message, stack: e.stack });
    res.status(500).json({ message: '确认支付失败，请稍后重试' });
  }
});

/**
 * GET /api/pay/status?outTradeNo=
 * 查询订单状态（需校验订单归属）
 * P1-8: 不区分"不存在"和"无权访问"，统一返回 404 防止信息泄露
 */
router.get('/status', async (req, res) => {
  try {
    const openid = req.user.openid;
    const { outTradeNo } = req.query;
    if (!outTradeNo) return res.status(400).json({ message: '缺少 outTradeNo' });

    // 惰性清理超时订单（PENDING 超过 30 分钟标记为 CLOSED）
    store.closeExpiredOrders();

    const order = store.getOrder(outTradeNo);
    // P1-8: 统一返回"订单不存在"，不区分不存在与越权，避免攻击者探测订单号
    if (!order) return res.status(404).json({ message: '订单不存在' });
    if (order.openid !== openid) {
      store.logger.warn('订单状态查询越权', { outTradeNo, openid: validate.maskOpenid(openid) });
      return res.status(404).json({ message: '订单不存在' });
    }
    res.json({ status: order.status, paid: order.status === 'PAID' });
  } catch (e) {
    store.logger.error('查询订单状态失败', { error: e.message, stack: e.stack });
    res.status(500).json({ message: '查询失败，请稍后重试' });
  }
});

module.exports = router;
