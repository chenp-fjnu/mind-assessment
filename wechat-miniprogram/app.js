const { TYPE_LABELS } = require('./utils/registry')
const { registerPrivacyModal } = require('./utils/privacy')
const { initThemeListener, getEffectiveTheme, updateNativeUI } = require('./utils/theme-store')
const { ensureUser } = require('./utils/user')
const SK = require('./utils/storage-keys')

App({
  globalData: {
    TYPE_LABELS,
    searchKeyword: '',
  },
  onLaunch() {
    // 注册隐私授权弹窗，满足相册/剪贴板等隐私接口的合规要求
    registerPrivacyModal()
    // 确保本地用户存在（生成本机 id），为后续记录关联与后端同步做准备
    try {
      ensureUser()
    } catch (e) {
      // 存储异常不应阻断启动
    }
    // 初始化主题监听
    initThemeListener()
    // 设置初始有效主题
    const effectiveTheme = getEffectiveTheme()
    wx.setStorageSync(SK.EFFECTIVE_THEME, effectiveTheme)
    // 同步原生 UI (tabBar, 导航栏)
    updateNativeUI(effectiveTheme)
  },
})
