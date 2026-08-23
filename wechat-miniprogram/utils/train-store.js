// 训练成绩存储：复用 utils/trend.js 的趋势计算
const { computeTrend } = require('./trend')

const PREFIX = 'ma_train_'
function key(id) {
  return PREFIX + id
}
function load(id) {
  return wx.getStorageSync(key(id)) || []
}
function save(id, metricValue, detail) {
  let arr = load(id)
  const rec = Object.assign({ time: Date.now(), summary: String(metricValue) }, detail || {})
  arr.push(rec)
  if (arr.length > 50) arr = arr.slice(-50)
  try {
    wx.setStorageSync(key(id), arr)
  } catch (e) {
    // 超出配额时丢弃最旧
    if (arr.length > 1) wx.setStorageSync(key(id), arr.slice(1))
  }
  return arr
}
function best(id, better) {
  const arr = load(id)
  const nums = arr.map((r) => parseFloat(r.summary)).filter((n) => !isNaN(n))
  if (!nums.length) return null
  return better === 'lower' ? Math.min.apply(null, nums) : Math.max.apply(null, nums)
}
function trend(id) {
  return computeTrend(
    load(id).map((r) => ({ id, summary: r.summary, time: r.time })),
    id
  )
}
module.exports = { load, save, best, trend, key }
