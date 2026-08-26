// 模块注册表：懒加载，避免启动即加载全部题库
// 注意：必须使用「字面量」require（如 require('../modules/mbti/index')），
// 微信打包器才能静态分析并打包对应文件。动态 require(变量) 会导致文件不被打包、运行时报
// "module ... is not defined"。这里用 loader 函数包裹字面量 require，既保证打包、又延迟执行。
const LOADERS = {
  mbti: () => require('../modules/mbti/index'),
  big5: () => require('../modules/big5/index'),
  epq: () => require('../modules/epq/index'),
  disc: () => require('../modules/disc/index'),
  pf16: () => require('../modules/pf16/index'),
  sds: () => require('../modules/sds/index'),
  sas: () => require('../modules/sas/index'),
  gad7: () => require('../modules/gad7/index'),
  dass21: () => require('../modules/dass21/index'),
  ses: () => require('../modules/ses/index'),
  las: () => require('../modules/las/index'),
  holland: () => require('../modules/holland/index'),
  spm: () => require('../modules/spm/index'),
  wechsler: () => require('../modules/wechsler/index'),
  phq9: () => require('../modules/phq9/index'),
  pss: () => require('../modules/pss/index'),
  psqi: () => require('../modules/psqi/index'),
  gses: () => require('../modules/gses/index'),
  ucla: () => require('../modules/ucla/index'),
  cdrise: () => require('../modules/cdrise/index'),
  enneagram: () => require('../modules/enneagram/index'),
  temperament: () => require('../modules/temperament/index'),
  hbdi: () => require('../modules/hbdi/index'),
}

const MODULES_META = require('./modules-meta')

const TYPE_LABELS = {
  personality: '人格性格',
  mood: '情绪筛查',
  intelligence: '智力推理',
  career: '职业兴趣',
  self: '自我认知',
  stress: '压力应对',
  sleep: '睡眠健康',
  social: '社交关系',
  wellbeing: '积极心理',
}

const _cache = {}

// 懒加载：仅在打开具体测评时才执行对应模块的 require（模块文件已被静态打包）
function getModule(id) {
  if (!id) return null
  const loader = LOADERS[id]
  if (!loader) return null
  if (!_cache[id]) _cache[id] = loader()
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

module.exports = { getModule, getMetaList, modulesByType, TYPE_LABELS, LOADERS }
