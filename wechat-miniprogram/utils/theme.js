/**
 * 主题工具
 *
 * - isDark(): 判断当前系统是否为深色模式，供 canvas 等绘制逻辑适配。
 *
 * 页面/组件的主题切换由 utils/theme-store.js 的 useTheme 负责（向根节点注入
 * themeClass，并同步原生 tabBar / navigationBar）；界面样式以 app.wxss 的
 * CSS 变量为准，本文件不承载色板定义。
 */

function isDark() {
  try {
    if (wx.getWindowInfo) {
      const windowInfo = wx.getWindowInfo()
      if (windowInfo.theme) {
        return windowInfo.theme === 'dark'
      }
    }
    // 基础库 2.30.0+ 使用 wx.getDeviceInfo
    if (wx.getDeviceInfo) {
      const deviceInfo = wx.getDeviceInfo()
      if (deviceInfo.theme) {
        return deviceInfo.theme === 'dark'
      }
    }
    return false
  } catch {
    return false
  }
}

module.exports = { isDark }
