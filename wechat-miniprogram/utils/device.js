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

/**
 * 检查微信基础库版本是否支持指定特性
 * @param {string} minVersion - 最低版本，格式 '2.21.2'
 * @returns {boolean}
 */
function checkMinVersion(minVersion) {
  try {
    const info = wx.getSystemInfoSync()
    const versionStr = info.SDKVersion
    const versionParts = versionStr.split('.').map(Number)
    const versionNum = versionParts[0] * 10000 + versionParts[1] * 100 + versionParts[2]
    const [minMajor, minMinor, minPatch] = minVersion.split('.').map(Number)
    const minVersionNum = minMajor * 10000 + minMinor * 100 + minPatch
    return versionNum >= minVersionNum
  } catch {
    return false
  }
}

/**
 * 是否支持 chooseAvatar 组件（需基础库 2.21.2+）
 */
function canUseChooseAvatar() {
  return checkMinVersion('2.21.2')
}

module.exports = { getDpr, checkMinVersion, canUseChooseAvatar }
