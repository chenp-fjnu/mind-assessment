const { getModule } = require('../../utils/registry')

Page({
  data: {
    meta: {},
    primaryValue: '',
    primaryLabel: '',
    primaryColor: '#2563eb',
    levelText: '',
    levelColor: '',
    descText: '',
    groups: [],
    dims: [],
    subtests: [],
    interpretations: [],
    showGroups: false,
    showBipolar: false,
    showDims: false,
    showSubtests: false,
  },

  onLoad(query) {
    const app = getApp()
    const saved = app.globalData.lastResult
    const id = query.id || (saved && saved.id)
    if (!id || !saved) {
      wx.showToast({ title: '暂无结果', icon: 'none' })
      return
    }
    const mod = getModule(id)
    if (!mod) return
    const questions = mod.getQuestions()
    const r = mod.computeResult(saved.answers, questions)
    const layout = mod.resultLayout || {}

    const primaryField = layout.primaryField || 'score'
    const primaryValue = r[primaryField]
    const levelColor = r.levelColor || mod.color
    const descText = r.description || (r.trait && String(r.trait) !== String(primaryValue) ? r.trait : '')

    const hasBuildGroupList = typeof mod.buildGroupList === 'function'
    const groups = hasBuildGroupList ? safeCall(() => mod.buildGroupList(r, layout)) : []
    const subtests = typeof mod.buildSubtestList === 'function' ? safeCall(() => mod.buildSubtestList(r)) : []

    let dims = []
    let showBipolar = false
    if (typeof mod.buildDimensionList === 'function') {
      dims = safeCall(() => mod.buildDimensionList(r)) || []
      showBipolar = !!(dims && dims[0] && dims[0].leftPercent !== undefined)
    } else if (r.dimensions) {
      dims = Object.keys(r.dimensions).map((k) => {
        const d = r.dimensions[k]
        return { key: k, name: d.name || k, percent: d.percent, text: d.text, level: d.level }
      })
    }

    const interpretations =
      typeof mod.buildInterpretations === 'function'
        ? safeCall(() => mod.buildInterpretations(r, groups, dims)) || []
        : []

    const pv = primaryValue == null ? '' : String(primaryValue)
    const primarySize = pv.length <= 4 ? 'big' : pv.length <= 10 ? 'mid' : 'small'

    this.setData({
      meta: { id: mod.id, name: mod.name, icon: mod.icon, color: mod.color },
      primaryValue: pv,
      primarySize,
      primaryLabel: layout.primaryLabel || '测评结果',
      primaryColor: mod.color,
      levelText: r.level || '',
      levelColor,
      descText,
      groups: groups || [],
      dims: dims || [],
      subtests: subtests || [],
      interpretations: interpretations || [],
      showGroups: !!(groups && groups.length),
      showBipolar,
      showDims: !!(dims && dims.length) && !showBipolar && !hasBuildGroupList,
      showSubtests: !!(subtests && subtests.length),
    })
    wx.setNavigationBarTitle({ title: mod.name + ' · 结果' })
  },

  goHome() {
    wx.reLaunch({ url: '/pages/index/index' })
  },
  retest() {
    wx.redirectTo({ url: `/pages/test/test?id=${this.data.meta.id}` })
  },

  onShareAppMessage() {
    return {
      title: this.data.meta.name + '测评结果 - 心智测评中心',
      path: '/pages/index/index',
    }
  },
})

function safeCall(fn) {
  try {
    return fn()
  } catch (e) {
    return []
  }
}
