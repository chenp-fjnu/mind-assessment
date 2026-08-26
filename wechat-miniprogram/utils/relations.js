// 跨域关联：测评 ↔ 方法论 ↔ 训练
// 思路：测评帮人「认识自己」，方法论给出「怎么用」，训练提供「练起来」，
// 三者构成「认知 → 方法 → 练习」的闭环。本文件统一计算某测评对应的相关
// 方法论与相关训练，供详情页（测评内容）与结果页复用，避免各页重复造关联逻辑。
const gameReg = require('./game-registry')
const methodsData = require('./methods-data')
const { getModule } = require('./registry')

// 测评 type → 训练维度 的主题映射（依据量表关注的心智能力归类）
const ASSESS_TYPE_TO_GAME_DIM = {
  mood: ['relax'],                       // 情绪筛查 → 放松正念（平复情绪）
  stress: ['relax', 'exec'],            // 压力 → 放松 + 执行功能（应对规划）
  sleep: ['relax'],                     // 睡眠 → 放松正念
  self: ['relax', 'exec'],              // 自我认知 → 放松 + 执行（自我调控）
  wellbeing: ['relax', 'exec'],         // 积极心理 → 放松 + 执行
  career: ['exec'],                     // 职业 → 执行功能（决策/规划）
  personality: ['exec'],                // 人格 → 执行功能（元认知/自我觉察）
  intelligence: ['attention', 'memory', 'reaction'], // 智力 → 注意力/工作记忆/反应
  social: ['relax', 'exec'],            // 社交 → 放松 + 执行
}

// 特定量表额外聚焦的训练维度（覆盖/补充上面的按类型映射）
const ASSESS_ID_TO_GAME_DIM = {
  hbdi: ['exec', 'attention'],          // 全脑优势 → 决策执行 + 专注
  holland: ['exec'],
  disc: ['exec'],
}

function relatedMethods(assessId, n) {
  const mod = getModule(assessId)
  if (!mod) return []
  const list = methodsData.recommendFor(mod.type)
  return list.slice(0, n || 4).map((m) => ({
    id: m.id,
    name: m.name,
    icon: m.icon,
    color: m.color,
    summary: m.summary,
    interactive: !!m.interactive,
    kind: 'method',
    nav: '/pages/methods/detail?id=' + m.id,
  }))
}

function relatedGames(assessId, n) {
  const mod = getModule(assessId)
  if (!mod) return []
  const dims = ASSESS_ID_TO_GAME_DIM[assessId] || ASSESS_TYPE_TO_GAME_DIM[mod.type] || ['exec']
  // 每个维度各取若干，保证推荐覆盖不同认知维度而非单一堆砌
  const perDim = 2
  const picked = []
  dims.forEach((d) => {
    gameReg.getMetaList().filter((g) => g.dim === d).slice(0, perDim).forEach((g) => picked.push(g))
  })
  return picked.slice(0, n || 8).map((g) => ({
    id: g.id,
    name: g.name,
    icon: g.icon,
    color: g.color,
    summary: g.desc,
    dimLabel: g.dimLabel,
    kind: 'train',
    nav: '/pages/train/game?gameId=' + g.id,
  }))
}

// 统一构造某测评的关联入口（详情页/结果页共用）
function buildLinks(assessId) {
  return {
    methods: relatedMethods(assessId),
    games: relatedGames(assessId),
  }
}

module.exports = {
  buildLinks,
  relatedMethods,
  relatedGames,
  ASSESS_TYPE_TO_GAME_DIM,
  ASSESS_ID_TO_GAME_DIM,
}
