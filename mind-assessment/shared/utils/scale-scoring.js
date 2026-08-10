/**
 * 通用量表评分工具
 * 支持：反向计分、求和、百分比转换、等级判定
 */

/**
 * 计算量表维度得分
 * @param {Array} answers - 答案数组
 * @param {Array} questions - 题目数组（含 dimension, reverse）
 * @param {Object} dimensions - 维度定义（含 name, en, high, low 等）
 * @param {Object} opts - { min, max, highThreshold, lowThreshold, defaultVal }
 * @returns {Object} 各维度得分对象
 */
function computeScaleScores(answers, questions, dimensions, opts = {}) {
  const { min = 1, max = 5, highThreshold = 70, lowThreshold = 30, defaultVal = 3 } = opts;
  const scores = {};
  Object.keys(dimensions).forEach((d) => (scores[d] = []));

  questions.forEach((q, i) => {
    const raw = answers[i];
    // P0-2: runner.js 中答案以 0-based 选项索引存储，需转换为实际分值
    // 对于 min=1 的量表：索引 0→分值1, 索引 4→分值5
    // 对于 min=0 的量表：索引 0→分值0, 索引 3→分值3（DASS-21 等）
    const actual = raw == null ? defaultVal : (raw + min);
    // P0-2: 修复反向计分公式，使用 (max + min - actual) 替代 (max + 1 - raw)
    const val = q.reverse ? (max + min - actual) : actual;
    scores[q.dimension].push(val);
  });

  const result = {};
  Object.keys(scores).forEach((d) => {
    const arr = scores[d];
    const sum = arr.reduce((a, b) => a + b, 0);
    const avg = arr.length ? sum / arr.length : defaultVal;
    // P2-14: 百分比边界钳制，防止异常数据产生负数或超 100
    const percent = Math.max(0, Math.min(100, Math.round((avg - min) / (max - min) * 100)));
    const info = dimensions[d];
    result[d] = {
      name: info.name,
      en: info.en || '',
      desc: info.desc || '',
      sum,
      avg: Math.round(avg * 10) / 10,
      percent,
      level: percent >= highThreshold ? 'high' : percent <= lowThreshold ? 'low' : 'mid',
      text: percent >= highThreshold ? info.high : percent <= lowThreshold ? info.low : '处于中等水平。',
    };
  });
  return result;
}

/**
 * 根据百分比和阈值返回等级信息
 * @param {number} percent - 百分比得分 (0-100)
 * @param {Object} thresholds - { high: 70, low: 30, mid: '中等', highLabel: '偏高', lowLabel: '偏低' }
 * @returns {{ level: string, label: string }}
 */
function formatLevel(percent, thresholds = {}) {
  const { high = 70, low = 30, highLabel = '偏高', midLabel = '中等', lowLabel = '偏低' } = thresholds;
  if (percent >= high) return { level: 'high', label: highLabel };
  if (percent <= low) return { level: 'low', label: lowLabel };
  return { level: 'mid', label: midLabel };
}

module.exports = { computeScaleScores, formatLevel };
