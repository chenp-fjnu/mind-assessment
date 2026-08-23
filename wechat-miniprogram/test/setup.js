/**
 * Jest 全局 setup：用最小 mock 提供小程序运行时全局（wx / Page / Component / App / getApp），
 * 使页面/工具层可在 Node 中加载与 onLoad，无需真实小程序运行时或 @miniprogram/simulate。
 * canvas 2d context 用 Proxy 全部 noop，保证绘制逻辑不报错。
 */

const noop = () => {}

function mockCtx() {
  const handler = {
    get(_t, prop) {
      if (prop === 'measureText') return () => ({ width: 10 })
      if (prop === 'createLinearGradient' || prop === 'createPattern') {
        return () => ({ addColorStop: noop })
      }
      if (prop === 'getContext') return () => mockCtx()
      return noop
    },
    set() {
      return true
    },
  }
  return new Proxy({}, handler)
}

function mockWx() {
  const q = {
    in: () => q,
    select: () => q,
    selectAll: () => q,
    selectViewport: () => q,
    boundingClientRect: () => q,
    fields: () => q,
    scrollOffset: () => q,
    exec: (cb) => {
      // 返回带 node 的结构，node.getContext 返回 mockCtx，供 canvas 绘制
      if (cb) cb([{ node: { getContext: () => mockCtx(), width: 100, height: 100 }, width: 100, height: 100 }])
    },
  }
  return {
    getStorageSync: () => [],
    setStorageSync: noop,
    removeStorageSync: noop,
    getWindowInfo: () => ({ pixelRatio: 2 }),
    getSystemInfoSync: () => ({ pixelRatio: 2 }),
    setNavigationBarTitle: noop,
    showModal: noop,
    showToast: noop,
    showLoading: noop,
    hideLoading: noop,
    createSelectorQuery: () => q,
    canvasToTempFilePath: (o) => o && o.success && o.success({ tempFilePath: 'x' }),
    saveImageToPhotosAlbum: noop,
    reLaunch: noop,
    navigateTo: noop,
    redirectTo: noop,
    switchTab: noop,
    request: noop,
    getMenuButtonBoundingClientRect: () => ({ top: 20, height: 32 }),
  }
}

global.wx = mockWx()
global.getApp = () => ({ globalData: { lastResult: null, history: [] } })
global.App = (def) => {
  global.__appDef = def
}
global.Page = (def) => {
  global.__lastPageDef = def
}
global.Component = (def) => {
  global.__lastCompDef = def
}
global.__mockCtx = mockCtx()

