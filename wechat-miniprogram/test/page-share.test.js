const fs = require('fs')
const path = require('path')
const app = require('../app.json')
const { loadPage } = require('./page-helper')

describe('page sharing', () => {
  app.pages.forEach((route) => {
    test(`${route} supports forwarding and Moments`, () => {
      const sourcePath = path.join(__dirname, '..', route + '.js')
      const source = fs.readFileSync(sourcePath, 'utf8')
      expect(source).toMatch(/onShareAppMessage\s*\(/)
      expect(source).toMatch(/onShareTimeline\s*\(/)
    })
  })

  test('result sharing links to the assessment without sharing personal result data', () => {
    const ctx = loadPage('pages/result/result.js', { id: 'invalid' })
    ctx.data.meta = { id: 'mbti', name: 'MBTI' }

    expect(ctx.onShareAppMessage()).toEqual({
      title: '来了解「MBTI」测评 - 心智探索局',
      path: '/pages/detail/detail?id=mbti',
    })
    expect(ctx.onShareTimeline().query).toBe('id=mbti&share=assessment')
  })

  test('a result Moments link opens the public assessment detail', () => {
    let redirectedTo = ''
    const originalRedirectTo = global.wx.redirectTo
    global.wx.redirectTo = (options) => { redirectedTo = options.url }
    try {
      loadPage('pages/result/result.js', { id: 'mbti', share: 'assessment' })
      expect(redirectedTo).toBe('/pages/detail/detail?id=mbti')
    } finally {
      global.wx.redirectTo = originalRedirectTo
    }
  })

  test.each([
    'pages/history/history.js',
    'pages/mine/mine.js',
    'pages/profile/profile.js',
  ])('%s shares only a neutral home entry', (route) => {
    let relaunchedTo = ''
    const originalRelaunch = global.wx.reLaunch
    global.wx.reLaunch = (options) => { relaunchedTo = options.url }
    try {
      const ctx = loadPage(route, { share: 'home' })
      expect(relaunchedTo).toBe('/pages/index/index')
      expect(ctx.onShareAppMessage().path).toBe('/pages/index/index')
      expect(ctx.onShareTimeline().query).toBe('share=home')
    } finally {
      global.wx.reLaunch = originalRelaunch
    }
  })

  test('a course share links to the route without the sharer progress', () => {
    const ctx = loadPage('pages/course/detail.js', { id: 'action-start' })
    expect(ctx.onShareAppMessage().path).toBe('/pages/course/detail?id=action-start')
    expect(ctx.onShareTimeline().query).toBe('id=action-start')
  })
})
