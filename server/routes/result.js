const express = require('express');
const router = express.Router();
const store = require('../utils/store');
const { authMiddleware } = require('../utils/auth');
const validate = require('../utils/validate');
const { isPaidModule } = require('../config/price-table');

// P0-6: 结果大小限制（JSON 序列化后最大 64KB）
const MAX_RESULT_SIZE = 64 * 1024;

// P0-6: 校验 result 结构必须包含的顶层字段
const REQUIRED_RESULT_FIELDS = ['testId'];

// 所有结果接口需要登录
router.use(authMiddleware);

/**
 * POST /api/result/save
 * 保存测验结果（付费后可调用以持久化到服务端）
 */
router.post('/save', (req, res) => {
  try {
    const { recordId, result } = req.body;
    if (!recordId || !result) return res.status(400).json({ message: '参数缺失' });
    if (!validate.isRecordId(recordId)) return res.status(400).json({ message: '无效的记录ID' });

    // P0-6: 校验 result 必须是对象且包含必需字段
    if (typeof result !== 'object' || result === null || Array.isArray(result)) {
      return res.status(400).json({ message: 'result 必须为对象' });
    }
    for (const field of REQUIRED_RESULT_FIELDS) {
      if (result[field] === undefined || result[field] === null) {
        return res.status(400).json({ message: `result 缺少字段: ${field}` });
      }
    }

    // P0-6: 校验 result.testId 为合法 moduleId
    if (!validate.isModuleId(result.testId)) {
      return res.status(400).json({ message: '无效的测评类型' });
    }

    // P0-6: 校验序列化后大小不超过限制
    const serialized = JSON.stringify(result);
    if (serialized.length > MAX_RESULT_SIZE) {
      store.logger.warn('结果过大，拒绝保存', { recordId, size: serialized.length });
      return res.status(413).json({ message: '结果数据过大' });
    }

    // 付费模块需要验证已支付
    const moduleId = result.testId;
    if (moduleId && isPaidModule(moduleId)) {
      if (!store.isPaidByOpenidAndModule(req.user.openid, moduleId)) {
        return res.status(403).json({ message: '请先完成支付' });
      }
    }

    // P1-5: IDOR 防护 — 若 recordId 已存在且不属于当前用户，拒绝覆盖
    const existing = store.getRecord(recordId);
    if (existing && existing.openid !== req.user.openid) {
      store.logger.warn('IDOR 越权保存尝试', { recordId, openid: validate.maskOpenid(req.user.openid), ownerOpenid: validate.maskOpenid(existing.openid) });
      return res.status(403).json({ message: '无权操作此记录' });
    }

    store.saveRecord(recordId, { ...result, openid: req.user.openid });
    res.json({ ok: true });
  } catch (e) {
    store.logger.error('保存结果失败', { error: e.message, stack: e.stack });
    res.status(500).json({ message: '保存失败，请稍后重试' });
  }
});

/**
 * GET /api/result/:id
 * 获取已保存的结果（需验证所有权）
 * P1-12: 添加 try-catch + recordId 格式校验 + 统一 404 防信息泄露
 */
router.get('/:id', (req, res) => {
  try {
    const { id } = req.params;
    // P1-12: 校验 recordId 格式
    if (!validate.isRecordId(id)) return res.status(404).json({ message: '未找到' });

    const record = store.getRecord(id);
    // P1-12: 统一返回 404，不区分"不存在"与"无权访问"
    if (!record) return res.status(404).json({ message: '未找到' });
    if (record.openid !== req.user.openid) {
      store.logger.warn('结果查询越权', { recordId: id, openid: validate.maskOpenid(req.user.openid) });
      return res.status(404).json({ message: '未找到' });
    }
    res.json(record);
  } catch (e) {
    store.logger.error('获取结果失败', { error: e.message, stack: e.stack });
    res.status(500).json({ message: '获取失败，请稍后重试' });
  }
});

/**
 * POST /api/result/check-paid
 * 检查用户是否已对指定模块付费解锁
 * P1-12: 添加 moduleId 格式校验 + try-catch
 */
router.post('/check-paid', (req, res) => {
  try {
    const { moduleId } = req.body;
    if (!moduleId) return res.status(400).json({ message: '缺少 moduleId' });
    if (!validate.isModuleId(moduleId)) return res.status(400).json({ message: '无效的测评类型' });
    const paid = store.isPaidByOpenidAndModule(req.user.openid, moduleId);
    res.json({ paid });
  } catch (e) {
    store.logger.error('检查付费状态失败', { error: e.message, stack: e.stack });
    res.status(500).json({ message: '查询失败，请稍后重试' });
  }
});

module.exports = router;
