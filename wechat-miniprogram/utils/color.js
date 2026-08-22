/**
 * 颜色工具：根据背景色亮度自动计算可读的前景色（黑/白）
 * 用于保留多彩主色的同时保证文字对比度（WCAG 可用性）
 */

function hexToRgb(hex) {
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex || '')
  if (!m) return null
  return [parseInt(m[1], 16), parseInt(m[2], 16), parseInt(m[3], 16)]
}

/**
 * 返回在给定背景色上可读性更好的文字色
 * @param {string} hex 背景色 #RRGGBB
 * @returns {'#ffffff' | '#1e293b'}
 */
function readableTextColor(hex) {
  const rgb = hexToRgb(hex)
  if (!rgb) return '#ffffff'
  const [r, g, b] = rgb
  // 相对亮度（sRGB 近似），范围 0~1
  const lum = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255
  // 亮度较高（浅色背景）用深字，否则用白字
  return lum > 0.6 ? '#1e293b' : '#ffffff'
}

/**
 * 将 #RRGGBB 转换为带透明度的 rgba 字符串
 * @param {string} hex 颜色 #RRGGBB
 * @param {number} alpha 透明度 0~1
 * @returns {string} rgba(...)
 */
function hexToRgba(hex, alpha = 1) {
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex || '')
  if (!m) return `rgba(100,116,139,${alpha})`
  const r = parseInt(m[1], 16)
  const g = parseInt(m[2], 16)
  const b = parseInt(m[3], 16)
  return `rgba(${r},${g},${b},${alpha})`
}

module.exports = { readableTextColor, hexToRgb, hexToRgba }
