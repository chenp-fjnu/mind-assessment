/**
 * 设备能力工具（收口自 pages/test、pages/result 中重复的设备像素比取值逻辑）
 */

// 获取设备像素比，兼容新旧 API 与异常，缺省 2
function getDpr() {
  try {
    if (wx.getWindowInfo) {
      const w = wx.getWindowInfo()
      if (w && w.pixelRatio) return w.pixelRatio
    }
  } catch (e) {
    void 0
  }
  try {
    if (wx.getDeviceInfo) {
      const d = wx.getDeviceInfo()
      if (d && d.pixelRatio) return d.pixelRatio
    }
  } catch (e) {
    void 0
  }
  return 2
}

module.exports = { getDpr }
