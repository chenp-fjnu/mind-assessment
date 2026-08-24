/**
 * 隐私接口合规封装
 *
 * 微信自基础库 2.32.3 起要求：相册写入（AlbumWriteOnly）、剪贴板（Clipboard）等
 * 隐私接口，必须在用户同意《隐私保护指引》后方可调用。本工具统一封装授权流程：
 *  - registerPrivacyModal：在 App.onLaunch 注册一次，自定义隐私授权弹窗；
 *  - withPrivacy：在调用隐私接口前包裹，未授权时自动弹出授权，授权后执行动作。
 *
 * 兼容低版本基础库：不支持时直接执行动作，不影响既有功能。
 */

// 在 App.onLaunch 中调用一次，接管隐私授权弹窗
function registerPrivacyModal() {
  if (typeof wx.onNeedPrivacyAuthorize !== 'function') return
  wx.onNeedPrivacyAuthorize((resolve, refuse) => {
    wx.showModal({
      title: '隐私授权提示',
      content: '设置头像、昵称，保存图片、复制内容等功能会用到你的微信头像/昵称、相册与剪贴板。本程序所有题目、计分与结果均在你的设备本地完成，不会上传任何数据。详见《隐私保护指引》。',
      confirmText: '同意并继续',
      cancelText: '暂不允许',
      success: (res) => {
        if (res.confirm) {
          if (resolve) resolve({ event: 'agree' })
        } else if (refuse) {
          refuse()
        }
      },
      fail: () => {
        if (refuse) refuse()
      },
    })
  })
}

// 包裹隐私接口调用：未授权则先弹授权，授权成功后执行 action
function withPrivacy(action, onRefuse) {
  if (typeof wx.requirePrivacyAuthorize !== 'function') {
    if (action) action()
    return
  }
  wx.requirePrivacyAuthorize({
    success: () => {
      if (action) action()
    },
    fail: () => {
      if (onRefuse) onRefuse()
      else wx.showToast({ title: '需要授权后才能使用该功能', icon: 'none' })
    },
  })
}

// 打开微信官方《隐私保护指引》页面（需在小程序后台配置隐私协议）
function openPrivacyContract() {
  if (typeof wx.openPrivacyContract === 'function') {
    wx.openPrivacyContract({
      fail: () => wx.showToast({ title: '暂未配置隐私协议', icon: 'none' }),
    })
  } else {
    wx.showToast({ title: '当前基础库不支持', icon: 'none' })
  }
}

module.exports = { registerPrivacyModal, withPrivacy, openPrivacyContract }
