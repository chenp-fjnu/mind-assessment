// 生成 utils/modules-meta.js（轻量元数据，供首页列表，避免启动加载全部题库）
// 运行：从 wechat-miniprogram 目录执行 node tools/gen-meta.js
const path = require('path')
const fs = require('fs')
const base = process.cwd()
const ids = ['mbti','big5','epq','disc','pf16','sds','sas','gad7','dass21','ses','las','holland','spm','wechsler']
const out = []
for (const id of ids) {
  const m = require(path.join(base, 'modules', id, 'index'))
  out.push({
    id: m.id,
    type: m.type,
    name: m.name,
    shortName: m.shortName,
    icon: m.icon,
    color: m.color,
    desc: m.desc,
    questionCount: m.questionCount,
    duration: m.duration,
    paid: m.paid,
    price: m.price,
    tag: m.tag || [],
  })
}
const content =
  '// 自动生成：轻量元数据，仅供首页/分类列表使用，避免启动即加载全部题库\n' +
  '// 如需更新，运行 node tools/gen-meta.js\n' +
  'module.exports = ' + JSON.stringify(out, null, 2) + '\n'
fs.writeFileSync(path.join(base, 'utils', 'modules-meta.js'), content)
console.log('wrote', out.length, 'modules meta')
