// 训练成绩存储：按「游戏 + 难度等级」分别记录与统计（不同等级的历史与最佳相互隔离）。
// 复用 utils/trend.js 的趋势计算。
const { computeTrend } = require('./trend')
const { getUserId } = require('./user')
const SK = require('./storage-keys')

const PREFIX = SK.TRAIN_PREFIX
const LAST_KEY = SK.TRAIN_LAST

// 毫秒时间戳下限（2001-09-09）；小于它的 time 视为旧版误写入的「单局耗时（秒）」
const MIN_TS = 1e12

// 旧数据兼容：早期版本把单局耗时写进了记录级 time（秒），导致历史显示 1970 年。
// 这里按 rid 前缀（Date.now()）还原记录时间，并把原值迁到 elapsed（秒）。
function normalizeRecord(r) {
  if (!r || typeof r !== 'object') return r
  const t = Number(r.time)
  if (!isFinite(t) || t >= MIN_TS) return r
  const ridTs = parseInt(String(r.rid || '').split('_')[0], 10)
  if (!isFinite(ridTs) || ridTs < MIN_TS) return r
  return Object.assign({}, r, {
    time: ridTs,
    elapsed: r.elapsed == null ? t : r.elapsed,
  })
}

// 每个 (游戏, 难度) 对应一个独立存储键，保证历史与最佳按等级分开统计
function key(id, level) {
  return PREFIX + id + '__' + level
}

function load(id, level) {
  return (wx.getStorageSync(key(id, level)) || []).map(normalizeRecord)
}

function save(id, level, metricValue, detail) {
  const k = key(id, level)
  let arr = wx.getStorageSync(k) || []
  // 记录级 time / rid 由存储层统一生成，禁止 detail 覆盖：
  // 游戏耗时应通过 elapsed（秒）传递，避免时间戳被覆盖成 1970。
  const extra = Object.assign({}, detail || {})
  delete extra.time
  delete extra.rid
  const rec = Object.assign(
    { rid: Date.now() + '_' + Math.random().toString(36).slice(2, 8), level: level, time: Date.now(), summary: String(metricValue), userId: getUserId() },
    extra
  )
  arr.push(rec)
  if (arr.length > 50) arr = arr.slice(-50)
  try {
    wx.setStorageSync(k, arr)
  } catch (e) {
    // 超出配额时丢弃最旧记录；只有仍包含本次成绩时才算保存成功。
    if (arr.length <= 1) throw e
    arr = arr.slice(1)
    wx.setStorageSync(k, arr)
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
    recs.map(normalizeRecord).forEach((r) => out.push(Object.assign({ gameId: id, level: level }, r)))
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
