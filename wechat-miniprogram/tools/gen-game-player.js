// 根据 utils/game-registry 的 LOADERS 自动生成玩家页（pages/train）的组件挂载：
//   1) pages/train/game.json 的 usingComponents（每个游戏一个组件；呼吸族复用 components/breath）
//   2) pages/train/games-block.wxml（玩家页内各游戏组件的 wx:if 挂载块，被 game.wxml <include>）
//
// 设计意图：新增训练游戏只需「建 games/<id>/ 文件夹 + 在 game-registry 登记一次」，
// 玩家页的 31 个 wx:if 与 usingComponents 由本脚本统一生成，避免手动维护两处易遗漏的清单。
//
// 校验：scripts/check-game-player.js 会重新生成并与已提交文件比对，作为 CI 闸门
// （与 scripts/check-meta.js 同源思路）。运行：node tools/gen-game-player.js
const fs = require('fs')
const path = require('path')

const base = process.cwd()
const outBase = process.env.GEN_OUT ? path.join(base, process.env.GEN_OUT) : base
const { LOADERS } = require(path.join(base, 'utils', 'game-registry'))

const BREATH = { tag: 'breath-game', compPath: '../../components/breath/breath' }

function familyOf(id) {
  try {
    const mod = require(path.join(base, 'games', id, 'index'))
    return mod.family || ''
  } catch (e) {
    return ''
  }
}

const entries = []
let breathEmitted = false
Object.keys(LOADERS).forEach((id) => {
  const fam = familyOf(id)
  if (fam === 'breath') {
    if (breathEmitted) return // 呼吸族 4 个游戏共用一个 breath-game 组件，仅挂载一次
    breathEmitted = true
    entries.push({ id, tag: BREATH.tag, compPath: BREATH.compPath, breath: true })
    return
  }
  entries.push({ id, tag: id + '-game', compPath: `../../games/${id}/game`, breath: false })
})

// 1) game.json 的 usingComponents（保留其余页面配置字段；从真实路径读取，写入输出目录）
const gameJsonRead = path.join(base, 'pages', 'train', 'game.json')
const gameJsonWrite = path.join(outBase, 'pages', 'train', 'game.json')
const gameJson = JSON.parse(fs.readFileSync(gameJsonRead, 'utf8'))
gameJson.usingComponents = {}
entries.forEach((e) => {
  gameJson.usingComponents[e.tag] = e.compPath
})
fs.mkdirSync(path.dirname(gameJsonWrite), { recursive: true })
fs.writeFileSync(gameJsonWrite, JSON.stringify(gameJson, null, 2) + '\n')

// 2) games-block.wxml 的 wx:if 挂载块
const lines = entries.map((e) => {
  if (e.breath) {
    return (
      `    <breath-game wx:if="{{family === 'breath'}}" id="trainGame" ` +
      `gameId="{{gameId}}" level="{{level}}" color="{{meta.color}}" tint="{{tint}}" ` +
      `board-width="{{boardWidth}}" fullscreen="{{fullscreen}}" bind:finish="onFinish" />`
    )
  }
  return `    <${e.tag} wx:if="{{gameId === '${e.id}'}}" id="trainGame" level="{{level}}" board-width="{{boardWidth}}" fullscreen="{{fullscreen}}" bind:finish="onFinish" />`
})
const block =
  '<!-- 本文件由 tools/gen-game-player.js 自动生成，请勿手动修改 -->\n' + lines.join('\n') + '\n'
const blockPath = path.join(outBase, 'pages', 'train', 'games-block.wxml')
fs.mkdirSync(path.dirname(blockPath), { recursive: true })
fs.writeFileSync(blockPath, block)

console.log('generated wiring for', entries.length, 'games')
