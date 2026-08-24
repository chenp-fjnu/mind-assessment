/**
 * 模块结果视图统一构造（与页面解耦，便于复用与单测）
 *
 * 统一契约（路线图第 1 项，已完成全量迁移）：
 *   每个量表模块只暴露一个 `getResultView(r, layout)` 方法，
 *   直接返回标准化视图模型，页面（result.js）与 smoke 测试统一调用，
 *   不再依赖 buildGroupList / buildDimensionList / buildScaleDimensionList /
 * buildSubtestList / buildInterpretations 等多方法鸭子类型分支。
 *
 * 返回结构：
 *   { groups:[], dims:[], subtests:[], interpretations:[], showBipolar:boolean }
 *   - groups:  [{ key, label, percent, display?, isScale? }]
 *   - dims:    [{ key, name, percent?, text?, leftName?, rightName?, leftPercent?, rightPercent?, dominant?, dominantDesc? }]
 *             （含 leftPercent/rightPercent 即双极维度）
 *   - subtests:[{ name, correct, total, scalePercent? }]
 *   - interpretations:[{ title, text }]
 *
 * 注意：本函数不再吞掉模块内部异常——模块若出错会向上抛出，便于在单测/开发期
 * 暴露缺陷；生产环境由调用方（result.js）统一兜底，避免整页白屏。
 */
function getResultView(mod, r, layout) {
  if (typeof mod.getResultView !== 'function') {
    return { groups: [], dims: [], subtests: [], interpretations: [], showBipolar: false }
  }
  const v = mod.getResultView(r, layout) || {}
  return {
    groups: v.groups || [],
    dims: v.dims || [],
    subtests: v.subtests || [],
    interpretations: v.interpretations || [],
    showBipolar: !!v.showBipolar,
  }
}

/**
 * 统一维度映射：消除各模块 getResultView 中逐字重复的 dims 构造逻辑
 * @param {Object|undefined} dimensions - r.dimensions
 * @returns {Array} [{ key, name, percent, text, level }]
 */
function mapDimensions(dimensions) {
  if (!dimensions) return []
  return Object.keys(dimensions).map((k) => {
    const d = dimensions[k]
    return { key: k, name: d.name || k, percent: d.percent, text: d.text, level: d.level }
  })
}

module.exports = { getResultView, mapDimensions }
