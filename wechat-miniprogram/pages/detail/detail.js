const { getModule } = require('../../utils/registry')

Page({
  data: {
    id: '',
    meta: {},
    resume: null,
    history: { count: 0 },
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
        paid: mod.paid,
        price: mod.price,
        tags: mod.tag || [],
      },
    })
    wx.setNavigationBarTitle({ title: mod.name })
    this.loadResume(mod)
    this.loadHistory(mod)
  },
  loadResume(mod) {
    const prog = wx.getStorageSync('ma_progress_' + mod.id)
    if (prog && prog.answers && prog.answers.some((a) => a !== null)) {
      const answered = prog.answers.filter((a) => a !== null).length
      this.setData({
        resume: {
          percent: Math.round((answered / mod.questionCount) * 100),
          answered,
          total: mod.questionCount,
        },
      })
    }
  },
  loadHistory(mod) {
    const all = wx.getStorageSync('ma_history') || []
    const mine = all.filter((h) => h.id === mod.id)
    if (!mine.length) return
    const info = { count: mine.length, last: { summary: mine[0].summary, level: mine[0].level } }
    const nums = mine.map((h) => parseFloat(h.summary)).filter((n) => !isNaN(n))
    if (nums.length >= 2) info.best = { summary: String(Math.max.apply(null, nums)) }
    this.setData({ history: info })
  },
  start() {
    wx.navigateTo({ url: `/pages/test/test?id=${this.data.id}` })
  },
  resumeTest() {
    wx.navigateTo({ url: `/pages/test/test?id=${this.data.id}` })
  },

  onShareAppMessage() {
    return {
      title: this.data.meta.name + ' - 心智探索局',
      path: '/pages/detail/detail?id=' + this.data.id,
    }
  },
})
