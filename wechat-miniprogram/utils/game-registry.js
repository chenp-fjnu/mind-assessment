// 训练游戏注册表：懒加载，结构同 utils/registry（字面量 require 保证打包）
const LOADERS = {
  schulte: () => require('../games/schulte/index'),
  'memory-match': () => require('../games/memory-match/index'),
  stroop: () => require('../games/stroop/index'),
  'box-breathing': () => require('../games/box-breathing/index'),
  'reaction-time': () => require('../games/reaction-time/index'),
  'n-back': () => require('../games/n-back/index'),
  flanker: () => require('../games/flanker/index'),
}

const DIM_LABELS = {
  attention: '注意力',
  memory: '工作记忆',
  reaction: '反应速度',
  relax: '放松正念',
  exec: '执行功能',
}

const _cache = {}

function getGame(id) {
  if (!id) return null
  const loader = LOADERS[id]
  if (!loader) return null
  if (!_cache[id]) _cache[id] = loader()
  return _cache[id]
}

// 列表只需轻量元数据（直接调用模块导出的静态字段，不触发 generate）
function getMetaList() {
  return Object.keys(LOADERS).map((id) => {
    const g = getGame(id)
    return {
      id: g.id,
      name: g.name,
      dim: g.dim,
      dimLabel: DIM_LABELS[g.dim] || g.dim,
      icon: g.icon,
      color: g.color,
      desc: g.desc,
      levels: g.levels,
      metric: g.metric,
      reference: g.reference,
    }
  })
}

function gamesByDim() {
  const map = {}
  getMetaList().forEach((m) => {
    if (!map[m.dim]) map[m.dim] = []
    map[m.dim].push(m)
  })
  return map
}

module.exports = { getGame, getMetaList, gamesByDim, DIM_LABELS, LOADERS }
