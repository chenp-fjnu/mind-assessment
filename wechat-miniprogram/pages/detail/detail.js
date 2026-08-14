const { getModule } = require('../../utils/registry')

Page({
  data: {
    id: '',
    meta: {},
  },
  onLoad(query) {
    const mod = getModule(query.id)
    if (!mod) {
      wx.showToast({ title: '未找到测评', icon: 'none' })
      return
    }
    this.setData({
      id: mod.id,
      meta: {
        icon: mod.icon,
        name: mod.name,
        shortName: mod.shortName,
        desc: mod.desc,
        duration: mod.duration,
        questionCount: mod.questionCount,
        color: mod.color,
        tags: mod.tag || [],
        type: mod.questionType,
      },
    })
    wx.setNavigationBarTitle({ title: mod.name })
  },
  start() {
    wx.navigateTo({ url: `/pages/test/test?id=${this.data.id}` })
  },

  onShareAppMessage() {
    return {
      title: this.data.meta.name + ' - 心智测评中心',
      path: '/pages/detail/detail?id=' + this.data.id,
    }
  },
})
