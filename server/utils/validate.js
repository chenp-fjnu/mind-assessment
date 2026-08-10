/**
 * 输入校验工具集
 * 用于对 openid、moduleId、recordId、金额等关键字段进行格式校验
 * P2-2: 提供 maskOpenid 用于日志脱敏
 */
const validate = {
  // openid：非空字符串，长度小于 64
  isOpenid(s) { return typeof s === 'string' && s.length > 0 && s.length < 64; },
  // moduleId：仅小写字母与数字，长度不超过 20
  isModuleId(s) { return typeof s === 'string' && /^[a-z0-9]+$/.test(s) && s.length <= 20; },
  // recordId：以 R 开头后接数字
  isRecordId(s) { return typeof s === 'string' && /^R\d+$/.test(s); },
  // 金额：数值类型，范围 1 ~ 100000（单位：分）
  isAmount(n) { return typeof n === 'number' && n >= 1 && n <= 100000; },
  // P2-2: openid 脱敏 — 保留前4后4，中间用 **** 替代，防止 PII 明文记录到日志
  maskOpenid(s) {
    if (!s || typeof s !== 'string') return 'unknown';
    if (s.length <= 8) return s.slice(0, 2) + '****';
    return s.slice(0, 4) + '****' + s.slice(-4);
  },
};

module.exports = validate;
