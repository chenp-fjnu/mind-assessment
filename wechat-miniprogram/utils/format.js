/**
 * 时间格式化工具（收口自 pages/test、pages/result、pages/history、utils/trend 的副本）
 */

// 两位补零
function pad2(n) {
  return n < 10 ? '0' + n : '' + n
}

// 完整日期时间：YYYY-MM-DD HH:mm
function fmt(ts) {
  const d = new Date(ts)
  return (
    d.getFullYear() +
    '-' +
    pad2(d.getMonth() + 1) +
    '-' +
    pad2(d.getDate()) +
    ' ' +
    pad2(d.getHours()) +
    ':' +
    pad2(d.getMinutes())
  )
}

// 简短日期：MM-DD（用于趋势图横轴）
function fmtMD(ts) {
  const d = new Date(ts)
  return pad2(d.getMonth() + 1) + '-' + pad2(d.getDate())
}

module.exports = { pad2, fmt, fmtMD }
