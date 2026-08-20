/**
 * 主题工具：判断当前系统是否为暗色模式
 * 用于画布（趋势图、结果卡片）等无法使用 CSS 变量的场景取色
 */
function isDark() {
  try {
    const info = (wx.getAppBaseInfo && wx.getAppBaseInfo()) || wx.getSystemInfoSync()
    return !!(info && info.theme === 'dark')
  } catch (e) {
    return false
  }
}

module.exports = { isDark }
