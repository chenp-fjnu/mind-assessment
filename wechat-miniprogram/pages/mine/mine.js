const trainStore = require('../../utils/train-store')
const { useTheme, THEME_MODES } = require('../../utils/theme-store')
const { getUser, saveUser, syncNow, getSyncStatus, ensureUser } = require('../../utils/user')

// 页面加载时确保用户存在（兼容本地和云端）
ensureUser()

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
    profileName: '我的心智档案',
    profileAvatar: '',
    themeMode: THEME_MODES.AUTO,
    currentTheme: THEME_MODES.LIGHT,
    // 云同步相关
    syncStatus: 'pending',
    lastSync: 0,
    hasCloud: false,
  },
  onLoad() {
    useTheme(this)
    // 同步云状态
    this.updateSyncStatus()
  },
  onShow() {
    this.updateDataFromStores()
    // 每次显示时检查是否需要同步
    this.checkAutoSync()
  },
  // 更新同步状态显示
  updateSyncStatus() {
    const status = getSyncStatus()
    this.setData({
      syncStatus: status.userSync,
      lastSync: status.lastSync,
      hasCloud: status.userSync !== 'pending', // 简单判断：有过同步记录即视为已接入云
    })
  },
  // 从存储获取数据并更新页面
  updateDataFromStores() {
    const hist = wx.getStorageSync('ma_history') || []
    const assessCount = hist.length
    const practiceCount = countPractices()
    const trainCount = trainStore.allRecords().length
    const u = getUser()
    const parts = []
    if (assessCount) parts.push('测评 ' + assessCount)
    if (practiceCount) parts.push('方法 ' + practiceCount)
    if (trainCount) parts.push('训练 ' + trainCount)
    
    this.setData({
      assessCount,
      practiceCount,
      trainCount,
      recordSummary: parts.length ? parts.join(' · ') + ' 条记录' : '还没有任何记录',
      profileName: u.nickname || '我的心智档案',
      profileAvatar: u.avatarUrl || '',
    })
  },
  // 自动同步检测（后台检查是否有待同步数据）
  checkAutoSync() {
    // 简单实现：每次进入页面检查同步状态
    // 实际生产可使用 wx.onBackgroundFetch 或定时任务
    const u = getUser()
    if (u.id && u.syncStatus !== 'synced') {
      // 有用户ID但未同步，可选择静默同步或不打扰用户
      // 这里不自动静默，改为在「我的」页面提供手动同步入口
    }
  },
  goHistory() { wx.navigateTo({ url: '/pages/history/history' }) },
  goAbout() { wx.navigateTo({ url: '/pages/about/about' }) },
  goProfile() { wx.navigateTo({ url: '/pages/profile/profile' }) },
  
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
  
  // --- 云同手动同步入口 ---
  
  // 手动触发立即同步
  async syncNow() {
    const success = await syncNow()
    if (success) {
      this.updateSyncStatus()
      this.updateDataFromStores()
      wx.showToast({ title: '同步完成', icon: 'success' })
    } else {
      wx.showToast({ title: '请先保存用户信息', icon: 'none' })
    }
  },
  
  // 查看同步详情/记录
  goSyncRecord() {
    const status = getSyncStatus()
    wx.showToast({ 
      title: `记录数: ${status.recordCount}, 同步状态: ${status.userSync}`,
      icon: 'none'
    })
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