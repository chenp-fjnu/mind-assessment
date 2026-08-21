const { TYPE_LABELS } = require('./utils/registry')
const { registerPrivacyModal } = require('./utils/privacy')

App({
  globalData: {
    TYPE_LABELS,
  },
  onLaunch() {
    // 注册隐私授权弹窗，满足相册/剪贴板等隐私接口的合规要求
    registerPrivacyModal()
  },
})
