const { MODULES, TYPE_LABELS, modulesByType } = require('../../utils/registry')

Page({
  data: {
    groups: [],
  },
  onLoad() {
    const map = modulesByType()
    const groups = Object.keys(map).map((type) => ({
      type,
      label: TYPE_LABELS[type] || type,
      list: map[type].map((m) => ({
        id: m.id,
        icon: m.icon,
        name: m.name,
        shortName: m.shortName,
        desc: m.desc,
        duration: m.duration,
        questionCount: m.questionCount,
        paid: m.paid,
        price: m.price,
        color: m.color,
      })),
    }))
    this.setData({ groups })
  },
  goDetail(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({ url: `/pages/detail/detail?id=${id}` })
  },
})
