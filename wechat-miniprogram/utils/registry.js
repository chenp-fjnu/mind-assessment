// 模块注册表：按需懒加载，避免启动即加载全部题库
const MODULE_PATHS = {
  mbti: '../modules/mbti/index',
  big5: '../modules/big5/index',
  epq: '../modules/epq/index',
  disc: '../modules/disc/index',
  pf16: '../modules/pf16/index',
  sds: '../modules/sds/index',
  sas: '../modules/sas/index',
  gad7: '../modules/gad7/index',
  dass21: '../modules/dass21/index',
  ses: '../modules/ses/index',
  las: '../modules/las/index',
  holland: '../modules/holland/index',
  spm: '../modules/spm/index',
  wechsler: '../modules/wechsler/index',
}

const MODULES_META = require('./modules-meta')

const TYPE_LABELS = {
  personality: '人格性格',
  mood: '情绪筛查',
  intelligence: '智力推理',
  career: '职业兴趣',
  self: '自我认知',
}

const _cache = {}

// 懒加载：仅在打开具体测评时才 require 对应模块（含其题库）
function getModule(id) {
  if (!id) return null
  if (!_cache[id]) {
    const p = MODULE_PATHS[id]
    if (!p) return null
    _cache[id] = require(p)
  }
  return _cache[id]
}

// 首页/分类列表只需轻量元数据，不触发题库加载
function getMetaList() {
  return MODULES_META
}

function modulesByType() {
  const map = {}
  MODULES_META.forEach((m) => {
    if (!map[m.type]) map[m.type] = []
    map[m.type].push(m)
  })
  return map
}

module.exports = { getModule, getMetaList, modulesByType, TYPE_LABELS, MODULE_PATHS }
