/**
 * 工具层单元测试（纯函数 + 模块契约 + 结果视图 + 图形渲染）。
 * 运行：npm install && npm run test:simulate
 */
const { readableTextColor, hexToRgba, hexToRgb } = require('../utils/color')
const { isDark } = require('../utils/theme')
const { scoreItem, computeResult } = require('../utils/scoring')
const { computeTrend, isNumeric, fmtMD } = require('../utils/trend')
const { getResultView } = require('../utils/result-view')
const { getModule, getMetaList, TYPE_LABELS } = require('../utils/registry')
const { textureForColor, COLOR_TEXTURE, drawShape, drawCell } = require('../utils/figure')
const methodsData = require('../utils/methods-data')
const trainStore = require('../utils/train-store')

function pickAnswer(q) {
  if (q.answer != null) return q.answer
  const n = (q.options || []).length
  if (n) return Math.floor(n / 2)
  if (q.scale && q.scale.labels) return Math.floor(q.scale.labels.length / 2)
  return 0
}

describe('color', () => {
  test('readableTextColor 按亮度选前景色', () => {
    expect(readableTextColor('#7c3aed')).toBe('#ffffff')
    expect(readableTextColor('#ffffff')).toBe('#1e293b')
    expect(readableTextColor('')).toBe('#ffffff')
  })
  test('hexToRgb / hexToRgba', () => {
    expect(hexToRgb('#ff0000')).toEqual([255, 0, 0])
    expect(hexToRgba('#7c3aed', 0.12)).toMatch(/^rgba\(124,\s*58,\s*237,\s*0\.12\)$/)
    expect(hexToRgba('', 0.1)).toMatch(/^rgba\(/)
  })
})

describe('theme', () => {
  test('isDark 无 wx 环境安全返回布尔', () => {
    expect(typeof isDark()).toBe('boolean')
  })
})

describe('scoring', () => {
  test('scoreItem 反向计分', () => {
    const scale = { min: 0, max: 4 }
    expect(scoreItem(0, { reverse: true, scale })).toBe(4)
    expect(scoreItem(4, { reverse: true, scale })).toBe(0)
    expect(scoreItem(2, { reverse: false, scale })).toBe(2)
    expect(scoreItem(null, { reverse: true, scale })).toBe(0)
  })
  test('computeResult PSS 边界', () => {
    const pss = getModule('pss')
    expect(pss.computeResult(new Array(10).fill(0), pss.getQuestions()).raw).toBe(16)
    expect(pss.computeResult(new Array(10).fill(4), pss.getQuestions()).raw).toBe(24)
  })
  test('computeResult UCLA 全 1 => 44', () => {
    const ucla = getModule('ucla')
    expect(ucla.computeResult(new Array(20).fill(0), ucla.getQuestions()).raw).toBe(44)
  })
  test('computeResult SDS 全 1 => 50', () => {
    const sds = getModule('sds')
    expect(sds.computeResult(new Array(20).fill(0), sds.getQuestions()).raw).toBe(50)
  })
})

describe('trend', () => {
  const hist = (id, summaries, times) =>
    summaries.map((s, i) => ({ id, summary: String(s), time: times[i] }))

  test('数值型趋势：>=2 条显示折线并计算 delta', () => {
    const h = hist('sds', ['50', '65'], [1000, 2000])
    const t = computeTrend(h, 'sds')
    expect(t.showTrend).toBe(true)
    expect(t.trendValues).toEqual([50, 65])
    expect(t.trendDelta).toBe(15)
    expect(t.trendDates).toEqual(['01-01', '01-01'])
  })
  test('类型型趋势：>=2 条显示 catList，不显示折线', () => {
    const h = hist('mbti', ['INTJ', 'ENFP'], [1000, 2000])
    const t = computeTrend(h, 'mbti')
    expect(t.showTrend).toBe(false)
    expect(t.catList.length).toBe(2)
    expect(t.firstSummary).toBe('INTJ')
    expect(t.lastSummary).toBe('ENFP')
  })
  test('不足 2 条不展示趋势', () => {
    const t = computeTrend(hist('sds', ['50'], [1000]), 'sds')
    expect(t.showTrend).toBe(false)
    expect(t.catList).toEqual([])
  })
  test('isNumeric / fmtMD', () => {
    expect(isNumeric('12')).toBe(true)
    expect(isNumeric('1.5')).toBe(true)
    expect(isNumeric('INTJ')).toBe(false)
    expect(fmtMD(0)).toMatch(/^\d{2}-\d{2}$/)
  })
})

describe('registry 完整性', () => {
  const meta = getMetaList()
  test('23 个量表均有 reference 与 scoring', () => {
    expect(meta.length).toBe(23)
    meta.forEach((m) => {
      expect(m.reference && String(m.reference).trim()).toBeTruthy()
      expect(m.scoring && String(m.scoring).trim()).toBeTruthy()
    })
  })
  test('每个模块暴露 computeResult 与 getResultView', () => {
    meta.forEach((m) => {
      const mod = getModule(m.id)
      expect(typeof mod.computeResult).toBe('function')
      expect(typeof mod.getResultView).toBe('function')
    })
  })
  test('TYPE_LABELS 覆盖所有 type', () => {
    const types = new Set(meta.map((m) => m.type))
    types.forEach((t) => expect(TYPE_LABELS[t]).toBeTruthy())
  })
})

describe('result-view getResultView', () => {
  getMetaList().forEach((m) => {
    test(`${m.id} 返回标准化视图结构`, () => {
      const mod = getModule(m.id)
      const qs = mod.getQuestions()
      const v = getResultView(mod, mod.computeResult(qs.map(pickAnswer), qs), mod.resultLayout || {})
      expect(Array.isArray(v.groups)).toBe(true)
      expect(Array.isArray(v.dims)).toBe(true)
      expect(Array.isArray(v.subtests)).toBe(true)
      expect(Array.isArray(v.interpretations)).toBe(true)
      expect(typeof v.showBipolar).toBe('boolean')
    })
  })
  test('showBipolar 由双极维度推断（mbti=true, sds=false）', () => {
    const mk = (id) => {
      const mod = getModule(id)
      return getResultView(mod, mod.computeResult(mod.getQuestions().map(pickAnswer), mod.getQuestions()), mod.resultLayout || {})
    }
    expect(mk('mbti').showBipolar).toBe(true)
    expect(mk('sds').showBipolar).toBe(false)
  })
})

describe('figure 色盲纹理', () => {
  test('textureForColor 颜色→纹理映射', () => {
    expect(textureForColor('#dc2626')).toBe('striped')
    expect(textureForColor('#2563eb')).toBe('dotted')
    expect(textureForColor('#16a34a')).toBe('hollow')
    expect(textureForColor('#d97706')).toBe('solid')
    expect(textureForColor('#000000')).toBe('solid')
    expect(textureForColor('unknown')).toBe('solid')
  })
  test('COLOR_TEXTURE 导出且覆盖主色', () => {
    expect(COLOR_TEXTURE['#dc2626']).toBe('striped')
  })
  test('drawShape / drawCell 在 mock ctx 下不抛错', () => {
    const ctx = global.__mockCtx
    expect(() => drawShape(ctx, { type: 'circle', size: 50, color: '#dc2626' }, 0, 0, 100)).not.toThrow()
    expect(() =>
      drawCell(ctx, { bg: '#ffffff', shapes: [{ type: 'square', size: 60, color: '#2563eb' }] }, 0, 0, 100)
    ).not.toThrow()
  })
})

describe('methods-data recommendFor', () => {
  test('已知类型返回非空数组', () => {
    const r = methodsData.recommendFor('personality')
    expect(Array.isArray(r)).toBe(true)
    expect(r.length).toBeGreaterThan(0)
  })
  test('未知类型兜底非空', () => {
    const r = methodsData.recommendFor('intelligence')
    expect(Array.isArray(r)).toBe(true)
    expect(r.length).toBeGreaterThan(0)
  })
})

describe('relations 跨域关联（测评↔方法↔训练）', () => {
  const relations = require('../utils/relations')
  test('情绪类量表关联放松训练', () => {
    const games = relations.relatedGames('sds')
    expect(games.length).toBeGreaterThan(0)
    expect(games.every((g) => g.kind === 'train' && g.nav.indexOf('/pages/train/game') === 0)).toBe(true)
  })
  test('智力类量表关联注意力/记忆/反应训练', () => {
    const games = relations.relatedGames('spm')
    const dims = games.map((g) => g.dimLabel)
    expect(dims).toEqual(expect.arrayContaining(['注意力', '工作记忆']))
  })
  test('HBDI 关联执行功能+注意力训练', () => {
    const games = relations.relatedGames('hbdi')
    const dims = games.map((g) => g.dimLabel)
    expect(dims).toEqual(expect.arrayContaining(['执行功能', '注意力']))
  })
  test('测评关联方法论非空且可跳转', () => {
    const methods = relations.relatedMethods('mbti')
    expect(methods.length).toBeGreaterThan(0)
    expect(methods.every((m) => m.kind === 'method' && m.nav.indexOf('/pages/methods/detail') === 0)).toBe(true)
  })
  test('buildLinks 同时返回方法与训练', () => {
    const links = relations.buildLinks('gad7')
    expect(Array.isArray(links.methods)).toBe(true)
    expect(Array.isArray(links.games)).toBe(true)
  })
})

describe('train-store 按等级分离记录与统计', () => {
  let store
  beforeEach(() => {
    store = {}
    global.wx.getStorageSync = (k) => (k in store ? store[k] : [])
    global.wx.setStorageSync = (k, v) => {
      store[k] = v
    }
    global.wx.removeStorageSync = (k) => {
      delete store[k]
    }
    global.wx.getStorageInfoSync = () => ({ keys: Object.keys(store) })
  })
  afterEach(() => {
    global.wx.getStorageSync = () => []
  })
  test('不同等级分别记录历史与最佳成绩', () => {
    trainStore.save('schulte', 3, 10, { detail: 'a' })
    trainStore.save('schulte', 5, 20, { detail: 'b' })
    trainStore.save('schulte', 3, 8, { detail: 'c' })
    expect(trainStore.best('schulte', 3, 'lower')).toBe(8)
    expect(trainStore.best('schulte', 5, 'lower')).toBe(20)
    expect(trainStore.bestOverall('schulte', [{ value: 3 }, { value: 5 }], 'lower')).toBe(8)
    expect(trainStore.allRecords().length).toBe(3)
  })
  test('同等级内最佳不跨等级', () => {
    trainStore.save('schulte', 3, 5, {})
    trainStore.save('schulte', 9, 9, {})
    expect(trainStore.best('schulte', 3, 'lower')).toBe(5)
    expect(trainStore.best('schulte', 9, 'lower')).toBe(9)
  })
  test('setLast / getLast 记录最近一次训练（含难度）', () => {
    trainStore.setLast('schulte', 5, {
      levelLabel: '5×5 标准',
      name: '舒尔特方格',
      icon: '🔢',
      color: '#7c3aed',
      dimLabel: '注意力',
    })
    const last = trainStore.getLast()
    expect(last.id).toBe('schulte')
    expect(last.level).toBe(5)
    expect(last.levelLabel).toBe('5×5 标准')
  })
  test('deleteRecord 仅删除指定等级下的一条记录', () => {
    trainStore.save('schulte', 3, 10, {})
    trainStore.save('schulte', 3, 12, {})
    const rec = trainStore.load('schulte', 3)[0]
    trainStore.deleteRecord('schulte', 3, rec.rid)
    expect(trainStore.load('schulte', 3).length).toBe(1)
    expect(trainStore.load('schulte', 3)[0].summary).toBe('12')
  })
})
