/**
 * 反向计分公式的单一实现（single source of truth）。
 *
 * 历史上反向公式散落在两处：
 * - utils/scoring.js 的 scoreItem（Likert 分值）
 * - utils/scale-scoring.js 的 computeScaleScores（0-based 索引换算后分值）
 * 两处写法略有差异、易随演进漂移。现收敛到本函数，供两者共用。
 *
 * @param {number|null|undefined} raw 已换算到 [min, max] 区间的分值
 * @param {number} min 量表下限
 * @param {number} max 量表上限
 * @returns {number} min + max - raw（raw 为 null/undefined 时返回 0）
 */
function reverseValue(raw, min, max) {
  if (raw == null) return 0
  return min + max - raw
}

module.exports = { reverseValue }
