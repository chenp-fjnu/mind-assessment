// 生成 utils/modules-meta.js（轻量元数据，供首页列表，避免启动加载全部题库）
// 运行：从 wechat-miniprogram 目录执行 node tools/gen-meta.js
const path = require('path')
const fs = require('fs')
const base = process.cwd()
// 单一数据源：直接复用 registry 的 LOADERS，新增模块只需在 registry.js 登记一次，
// 无需再维护这里重复的 id 列表（避免两处不一致）。
const { LOADERS } = require(path.join(base, 'utils', 'registry'))
const ids = Object.keys(LOADERS)
const out = []
for (const id of ids) {
  const m = require(path.join(base, 'modules', id, 'index'))
  // 题量以 getQuestions() 为准，避免手工维护的 questionCount 与真实题量漂移
  const questionCount = (m.getQuestions ? m.getQuestions() : []).length
  out.push({
    id: m.id,
    type: m.type,
    name: m.name,
    shortName: m.shortName,
    icon: m.icon,
    color: m.color,
    desc: m.desc,
    questionCount,
    duration: m.duration,
    tag: m.tag || [],
    reference: m.reference || '',
    scoring: m.scoring || '',
    hot: !!m.hot,
  })
}
const content =
  '// 自动生成：轻量元数据，仅供首页/分类列表使用，避免启动即加载全部题库\n' +
  '// 如需更新，运行 node tools/gen-meta.js\n' +
  'module.exports = ' + JSON.stringify(out, null, 2) + '\n'
fs.writeFileSync(path.join(base, 'utils', 'modules-meta.js'), content)
console.log('wrote', out.length, 'modules meta')
