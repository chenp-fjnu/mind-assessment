const { TYPE_LABELS } = require('./utils/registry')
const { registerPrivacyModal } = require('./utils/privacy')
const { initThemeListener, getEffectiveTheme, updateNativeUI } = require('./utils/theme-store')

App({
  globalData: {
    TYPE_LABELS,
  },
  onLaunch() {
    // 注册隐私授权弹窗，满足相册/剪贴板等隐私接口的合规要求
    registerPrivacyModal()
    // 初始化主题监听
    initThemeListener()
    // 设置初始有效主题
    const effectiveTheme = getEffectiveTheme()
    wx.setStorageSync('current-effective-theme', effectiveTheme)
    // 同步原生 UI (tabBar, 导航栏)
    updateNativeUI(effectiveTheme)
  },
})
