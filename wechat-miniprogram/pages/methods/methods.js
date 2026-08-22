const methodsData = require('../../utils/methods-data')

function hexToRgba(hex, alpha) {
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex || '')
  if (!m) return 'rgba(100,116,139,0.12)'
  const r = parseInt(m[1], 16)
  const g = parseInt(m[2], 16)
  const b = parseInt(m[3], 16)
  return `rgba(${r},${g},${b},${alpha})`
}

Page({
  data: {
    groups: [],
    count: 0,
    interactiveCount: 0,
  },
  onLoad() {
    const groups = methodsData.groupByCategory().map((g) => ({
      category: g.category,
      list: g.list.map((m) => Object.assign({}, m, { tint: hexToRgba(m.color, 0.12) })),
    }))
    this.setData({
      groups,
      count: methodsData.METHODS.length,
      interactiveCount: methodsData.METHODS.filter((m) => m.interactive).length,
    })
  },
  goDetail(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({ url: `/pages/methods/detail?id=${id}` })
  },
})
