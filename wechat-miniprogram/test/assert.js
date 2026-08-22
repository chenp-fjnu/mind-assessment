/**
 * 断言测试：已知输入 -> 期望分数的确定性校验（不依赖随机冒烟）
 */
const assert = require('assert')
const { getModule } = require('../utils/registry')
const { scoreItem } = require('../utils/scoring')

let passed = 0
function check(name, fn) {
  fn()
  passed++
  console.log('  ✓ ' + name)
}

// scoreItem 反向计分公式
check('scoreItem 反向 0->4', () => assert.strictEqual(scoreItem(0, { reverse: true, scale: { min: 0, max: 4 } }), 4))
check('scoreItem 反向 4->0', () => assert.strictEqual(scoreItem(4, { reverse: true, scale: { min: 0, max: 4 } }), 0))
check('scoreItem 非反向原值', () => assert.strictEqual(scoreItem(2, { reverse: false }), 2))
check('scoreItem 未答=0', () => assert.strictEqual(scoreItem(null, { reverse: true, scale: { min: 0, max: 4 } }), 0))

// PSS：10 题，4 道反向，0-4 分
const pss = getModule('pss')
check('PSS 全 0 => 16', () => {
  const r = pss.computeResult(new Array(10).fill(0), pss.getQuestions())
  assert.strictEqual(r.raw, 16)
})
check('PSS 全 4 => 24', () => {
  const r = pss.computeResult(new Array(10).fill(4), pss.getQuestions())
  assert.strictEqual(r.raw, 24)
})

// UCLA：20 题，8 道反向，1-4 分（val=raw+1）
const ucla = getModule('ucla')
check('UCLA 全选 1(索引0) => 44', () => {
  const r = ucla.computeResult(new Array(20).fill(0), ucla.getQuestions())
  // 12 正向*1 + 8 反向*(5-1=4) = 12 + 32 = 44
  assert.strictEqual(r.raw, 44)
})

// SDS：20 题，10 道反向，1-4 分
const sds = getModule('sds')
check('SDS 全选 1 => 50', () => {
  const r = sds.computeResult(new Array(20).fill(0), sds.getQuestions())
  // 10 正向*1 + 10 反向*(5-1=4) = 10 + 40 = 50
  assert.strictEqual(r.raw, 50)
})

// recommendFor 兜底（intelligence 无匹配）
const methodsData = require('../utils/methods-data')
check('recommendFor(intelligence) 兜底非空', () => {
  const rec = methodsData.recommendFor('intelligence')
  assert.ok(Array.isArray(rec) && rec.length > 0)
})

console.log('\n断言测试完成：通过 ' + passed)
