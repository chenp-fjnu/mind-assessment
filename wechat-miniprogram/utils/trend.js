/**
 * 同量表历史趋势计算（可单测，与页面解耦）
 * @param {Array} history - ma_history 记录数组
 * @param {string} id - 量表 id
 * @returns {{ showTrend:boolean, trendValues:number[], trendDelta:number, trendDates:string[], catList:Array }}
 */
const { fmtMD } = require('./format')

function isNumeric(s) {
  return /^\d+(\.\d+)?$/.test(s)
}

function computeTrend(history, id) {
  const sameId = (history || [])
    .filter((h) => h.id === id)
    .sort((a, b) => a.time - b.time)

  let showTrend = false
  let trendValues = []
  let trendDelta = 0
  let trendDates = []
  let catList = []
  let firstValue = null
  let lastValue = null
  let firstSummary = ''
  let lastSummary = ''

  const numericItems = sameId
    .map((h) => ({ raw: String(h.summary || ''), num: parseFloat(h.summary) }))
    .filter((x) => isNumeric(x.raw))

  if (numericItems.length >= 2) {
    showTrend = true
    trendValues = numericItems.map((x) => x.num)
    trendDelta = trendValues[trendValues.length - 1] - trendValues[trendValues.length - 2]
    trendDates = sameId.map((h) => fmtMD(h.time))
    firstValue = trendValues[0]
    lastValue = trendValues[trendValues.length - 1]
  } else if (sameId.length >= 2) {
    catList = sameId.map((h) => ({ summary: String(h.summary || ''), timeText: fmtMD(h.time) }))
    firstSummary = catList[0].summary
    lastSummary = catList[catList.length - 1].summary
  }

  return {
    showTrend,
    trendValues,
    trendDelta,
    trendDates,
    catList,
    firstValue,
    lastValue,
    firstSummary,
    lastSummary,
  }
}

module.exports = { computeTrend, fmtMD, isNumeric }
