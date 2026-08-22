/**
 * 模块结果视图构造（与页面解耦，便于复用与单测）
 *
 * 把 result.js / smoke.js 中重复出现的「鸭子类型」分支（buildGroupList /
 * buildScaleDimensionList / buildDimensionList / buildSubtestList /
 * buildInterpretations）收敛到这里，统一返回标准化视图模型。
 * 任一 build* 抛错都会被 safeCall 吞掉并返回兜底空数组，避免整页崩溃。
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

function buildModuleView(mod, r, layout) {
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

module.exports = { buildModuleView, safeCall }
