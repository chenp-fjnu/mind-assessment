/**
 * 小程序 UI 自动化测试（基于 @miniprogram/simulate）。
 * 该测试需要小程序运行时环境，运行：npm install && npm run test:simulate
 *
 * 说明：miniprogram-simulate 会在 Node 中加载并渲染小程序页面/组件，
 * 可用于断言页面结构、绑定数据、tap 事件等。此处以首页与答题页为例。
 */
const simulate = require('@miniprogram/simulate')
const path = require('path')

const projectPath = path.resolve(__dirname, '..')

describe('页面渲染（miniprogram-simulate）', () => {
  test('首页渲染出全部量表卡片', () => {
    const comp = simulate.load('/pages/index/index', { projectPath })
    const dom = simulate.render(comp)
    const items = dom.querySelectorAll('.item')
    expect(items.length).toBeGreaterThan(10)
  })

  test('首页历史区存在清空入口', () => {
    const comp = simulate.load('/pages/index/index', { projectPath })
    const dom = simulate.render(comp)
    const clears = dom.querySelectorAll('.hist-clear')
    expect(clears.length).toBe(1)
  })

  test('答题页可加载并渲染首题', () => {
    const comp = simulate.load('/pages/test/test', {
      projectPath,
      query: { id: 'spm' },
    })
    const dom = simulate.render(comp)
    const qText = dom.querySelector('.q-text')
    expect(qText).toBeTruthy()
  })
})
