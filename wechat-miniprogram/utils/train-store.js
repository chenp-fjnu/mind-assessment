// 训练成绩存储：按「游戏 + 难度等级」分别记录与统计（不同等级的历史与最佳相互隔离）。
// 复用 utils/trend.js 的趋势计算。
const { computeTrend } = require('./trend')
const { getUserId } = require('./user')

const PREFIX = 'ma_train_'
const LAST_KEY = 'ma_train_last'

// 每个 (游戏, 难度) 对应一个独立存储键，保证历史与最佳按等级分开统计
function key(id, level) {
  return PREFIX + id + '__' + level
}

function load(id, level) {
  return wx.getStorageSync(key(id, level)) || []
}

function save(id, level, metricValue, detail) {
  const k = key(id, level)
  let arr = wx.getStorageSync(k) || []
  const rec = Object.assign(
    { rid: Date.now() + '_' + Math.random().toString(36).slice(2, 8), level: level, time: Date.now(), summary: String(metricValue), userId: getUserId() },
    detail || {}
  )
  arr.push(rec)
  if (arr.length > 50) arr = arr.slice(-50)
  try {
    wx.setStorageSync(k, arr)
  } catch (e) {
    // 超出配额时丢弃最旧
    if (arr.length > 1) wx.setStorageSync(k, arr.slice(1))
  }
  return arr
}

// 仅统计指定难度等级下的最佳成绩
function best(id, level, better) {
  const arr = load(id, level)
  const nums = arr.map((r) => parseFloat(r.summary)).filter((n) => !isNaN(n))
  if (!nums.length) return null
  return better === 'lower' ? Math.min.apply(null, nums) : Math.max.apply(null, nums)
}

// 跨所有等级的总体最佳（用于训练列表的快捷展示，详细最佳在游戏页按等级分别呈现）
function bestOverall(id, levels, better) {
  let bestVal = null
  ;(levels || []).forEach((lv) => {
    const v = best(id, lv.value, better)
    if (v == null) return
    if (bestVal == null) bestVal = v
    else if (better === 'lower') bestVal = Math.min(bestVal, v)
    else bestVal = Math.max(bestVal, v)
  })
  return bestVal
}

function trend(id, level) {
  return computeTrend(
    load(id, level).map((r) => ({ id, summary: r.summary, time: r.time })),
    id
  )
}

// 记录最近一次训练的「游戏 + 难度」，供首页「继续训练」使用
function setLast(id, level, meta) {
  wx.setStorageSync(LAST_KEY, {
    id,
    level,
    levelLabel: meta.levelLabel,
    name: meta.name,
    icon: meta.icon,
    color: meta.color,
    dimLabel: meta.dimLabel,
    time: Date.now(),
  })
}

function getLast() {
  return wx.getStorageSync(LAST_KEY) || null
}

// 汇总所有等级的训练记录（用于「我的记录 - 训练」列表与计数）
function allRecords() {
  const info = (wx.getStorageInfoSync && wx.getStorageInfoSync()) || { keys: [] }
  const keys = (info.keys || []).filter((k) => k.indexOf(PREFIX) === 0 && k !== LAST_KEY)
  const out = []
  keys.forEach((k) => {
    const idx = k.lastIndexOf('__')
    if (idx <= PREFIX.length) return
    const id = k.slice(PREFIX.length, idx)
    const level = k.slice(idx + 2)
    const recs = wx.getStorageSync(k) || []
    recs.forEach((r) => out.push(Object.assign({ gameId: id, level: level }, r)))
  })
  out.sort((a, b) => b.time - a.time)
  return out
}

// 删除某条指定训练记录（按 游戏 + 难度 + rid 唯一定位，避免同毫秒时间戳误删）
function deleteRecord(id, level, rid) {
  const k = key(id, level)
  const arr = wx.getStorageSync(k) || []
  const next = arr.filter((r) => r.rid !== rid)
  if (next.length) wx.setStorageSync(k, next)
  else wx.removeStorageSync(k)
  return next
}

module.exports = { load, save, best, bestOverall, trend, setLast, getLast, allRecords, deleteRecord, key }
