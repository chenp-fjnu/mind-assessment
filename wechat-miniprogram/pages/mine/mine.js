const trainStore = require('../../utils/train-store')
const { useTheme, THEME_MODES } = require('../../utils/theme-store')

function countPractices() {
  const stored = wx.getStorageSync('ma_practices') || {}
  return Object.keys(stored).reduce((n, k) => n + (stored[k] || []).length, 0)
}

Page({
  data: {
    assessCount: 0,
    practiceCount: 0,
    trainCount: 0,
    recordSummary: '',
    themeMode: THEME_MODES.AUTO,
    currentTheme: THEME_MODES.LIGHT,
  },
  onLoad() {
    useTheme(this)
  },
  onShow() {
    const hist = wx.getStorageSync('ma_history') || []
    const assessCount = hist.length
    const practiceCount = countPractices()
    const trainCount = trainStore.allRecords().length
    const parts = []
    if (assessCount) parts.push('测评 ' + assessCount)
    if (practiceCount) parts.push('方法 ' + practiceCount)
    if (trainCount) parts.push('训练 ' + trainCount)
    this.setData({
      assessCount,
      practiceCount,
      trainCount,
      recordSummary: parts.length ? parts.join(' · ') + ' 条记录' : '还没有任何记录',
    })
  },
  goHistory() { wx.navigateTo({ url: '/pages/history/history' }) },
  goAbout() { wx.navigateTo({ url: '/pages/about/about' }) },

  setThemeAuto() {
    this.setThemeMode('auto')
    setTimeout(() => this.forceThemeUpdate && this.forceThemeUpdate(), 0)
  },
  setThemeLight() {
    this.setThemeMode('light')
    setTimeout(() => this.forceThemeUpdate && this.forceThemeUpdate(), 0)
  },
  setThemeDark() {
    this.setThemeMode('dark')
    setTimeout(() => this.forceThemeUpdate && this.forceThemeUpdate(), 0)
  },
  onShareAppMessage() {
    return {
      title: '我的心智探索档案 - 记录成长轨迹',
      path: '/pages/mine/mine',
    }
  },
  onShareTimeline() {
    return {
      title: '我的心智探索档案 - 记录成长轨迹',
    }
  },
})