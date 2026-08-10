const express = require('express');
const router = express.Router();
const wxpay = require('../utils/wxpay');
const store = require('../utils/store');
const { signToken } = require('../utils/auth');
const validate = require('../utils/validate');

/**
 * POST /api/login
 * 小程序登录：code 换 openid，并签发 JWT token
 * P1-6: 校验 code2session 返回的 openid 有效性
 */
router.post('/login', async (req, res) => {
  try {
    const { code } = req.body;
    if (!code) return res.status(400).json({ message: '缺少 code' });
    const session = await wxpay.code2session(code);

    // P1-6: 校验返回的 openid 是否有效
    if (!session.openid || !validate.isOpenid(session.openid)) {
      store.logger.error('登录失败：openid 无效', { hasOpenid: !!session.openid });
      return res.status(500).json({ message: '登录失败，请稍后重试' });
    }

    // 签发 JWT token，后续接口凭此鉴权
    const token = signToken({ openid: session.openid });
    res.json({ token, openid: session.openid });
  } catch (e) {
    store.logger.error('登录失败', { error: e.message, stack: e.stack });
    res.status(500).json({ message: '登录失败，请稍后重试' });
  }
});

module.exports = router;
