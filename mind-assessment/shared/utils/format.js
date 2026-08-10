/**
 * 通用格式化工具
 * 消除 hub.js 与 history.js 中 formatScore 的重复
 */
const modules = require('../modules/module-system');

/**
 * 格式化测评分数为展示文本
 * @param {Object} record - 历史记录
 * @returns {String} 分数文本
 */
function formatScore(record) {
  const mod = modules.getModule(record.testId);
  if (!mod) return String(record.raw || 0);

  const field = mod.resultLayout.primaryField;
  const val = record[field];

  if (val == null) return String(record.raw || 0);

  // trait 字段取前3段
  if (field === 'trait' && typeof val === 'string') {
    return val.split(' ').slice(0, 3).join(' ');
  }

  return String(val);
}

/**
 * 格式化等级文本
 */
function formatLevel(record) {
  if (record.testId === 'mbti') return record.typeName || '';
  return record.level || '';
}

module.exports = { formatScore, formatLevel };
