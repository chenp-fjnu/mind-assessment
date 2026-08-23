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
  onThemeChange(e) {
    const mode = e.currentTarget.dataset.mode
    console.log('[mine] theme change clicked:', mode, 'setThemeMode exists:', typeof this.setThemeMode, 'full event:', e)
    if (typeof this.setThemeMode === 'function') {
      this.setThemeMode(mode)
      // 强制刷新
      setTimeout(() => {
        if (typeof this.forceThemeUpdate === 'function') {
          this.forceThemeUpdate()
        }
      }, 0)
    } else {
      console.error('[mine] setThemeMode not found on page instance')
    }
  },
  onTestClick() {
    console.log('[mine] TEST CLICK WORKS')
    wx.showToast({ title: '点击生效', icon: 'none' })
  },
})