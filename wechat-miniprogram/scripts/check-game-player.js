// 玩家页组件挂载一致性校验：确保 pages/train/game.json 与 games-block.wxml
// 与 tools/gen-game-player.js 依据 game-registry 生成的结果完全一致。
// 若不一致，说明有人手动改了这两个文件（或忘了重新生成），需重跑生成脚本。
// 运行：node scripts/check-game-player.js（已并入 npm run validate 与 test:all）
const cp = require('child_process')
const fs = require('fs')
const os = require('os')
const path = require('path')
const base = process.cwd()
// 临时产物放在项目目录之外（系统临时目录），避免微信开发者工具把 .gencheck 当作
// 工程文件去编译/打开，从而报 “ENOENT: no such file ... .gencheck/...” 的错误。
const tmp = path.join(os.tmpdir(), 'mind-gencheck-' + process.pid)

let errors = 0
try {
  cp.execSync('node tools/gen-game-player.js', {
    cwd: base,
    env: Object.assign({}, process.env, { GEN_OUT: tmp }),
    stdio: 'ignore',
  })
  const targets = ['pages/train/games-block.wxml', 'pages/train/game.json']
  for (const rel of targets) {
    const current = fs.readFileSync(path.join(base, rel), 'utf8')
    const generated = fs.readFileSync(path.join(tmp, rel), 'utf8')
    if (current !== generated) {
      console.error('✗ 不一致：', rel, '（请运行 node tools/gen-game-player.js 重新生成）')
      errors++
    }
  }
} catch (e) {
  console.error('✗ 校验失败：', e.message)
  errors++
} finally {
  // 无论校验是否通过都清理临时产物，绝不在工程内残留 .gencheck
  fs.rmSync(tmp, { recursive: true, force: true })
}

if (errors) {
  console.error(`\n校验失败：${errors} 处玩家页挂载与生成结果不一致`)
  process.exit(1)
}
console.log('✓ 玩家页组件挂载校验通过：与 game-registry 生成结果一致')
