/**
 * 模块结果视图构造（与页面解耦，便于复用与单测）
 *
 * 统一契约（路线图第 1 项）：
 *   模块可整体实现 `getResultView(r, layout)` 直接返回标准化视图模型，
 *   实现零样板；未实现时回退到「鸭子类型」分支（buildGroupList /
 *   buildScaleDimensionList / buildDimensionList / buildSubtestList /
 *   buildInterpretations）。任一 build* 抛错都会被 safeCall 吞掉并返回兜底空数组。
 *
 * @param {Object} mod 量表模块
 * @param {Object} r computeResult 的返回值
 * @param {Object} layout mod.resultLayout
 * @returns {{ groups:Array, dims:Array, subtests:Array, interpretations:Array, showBipolar:boolean }}
 */
function safeCall(fn) {
  try {
    return fn()
  } catch (e) {
    console.warn('[result-view] build failed:', e)
    return []
  }
}

// 回退实现：兼容现有模块的 build* 鸭子类型分支
function fallbackBuild(mod, r, layout) {
  const groups =
    typeof mod.buildGroupList === 'function' ? safeCall(() => mod.buildGroupList(r, layout)) || [] : []
  const subtests =
    typeof mod.buildSubtestList === 'function' ? safeCall(() => mod.buildSubtestList(r)) || [] : []

  let dims = []
  let showBipolar = false
  if (typeof mod.buildScaleDimensionList === 'function') {
    dims = safeCall(() => mod.buildScaleDimensionList(r)) || []
    showBipolar = !!(dims[0] && dims[0].leftPercent !== undefined)
  } else if (typeof mod.buildDimensionList === 'function') {
    dims = safeCall(() => mod.buildDimensionList(r)) || []
    showBipolar = !!(dims[0] && dims[0].leftPercent !== undefined)
  } else if (r && r.dimensions) {
    dims = Object.keys(r.dimensions).map((k) => {
      const d = r.dimensions[k]
      return { key: k, name: d.name || k, percent: d.percent, text: d.text, level: d.level }
    })
  }

  const interpretations =
    typeof mod.buildInterpretations === 'function'
      ? safeCall(() => mod.buildInterpretations(r, groups, dims)) || []
      : []

  return {
    groups: groups || [],
    dims: dims || [],
    subtests: subtests || [],
    interpretations: interpretations || [],
    showBipolar,
  }
}

// 统一入口：优先使用模块自实现的 getResultView，否则回退
function getResultView(mod, r, layout) {
  if (typeof mod.getResultView === 'function') {
    try {
      const v = mod.getResultView(r, layout)
      if (v && typeof v === 'object') return v
    } catch (e) {
      console.warn('[result-view] getResultView failed, fallback:', e)
    }
  }
  return fallbackBuild(mod, r, layout)
}

module.exports = { getResultView, buildModuleView: getResultView, safeCall }
