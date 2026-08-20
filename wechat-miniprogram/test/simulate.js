// 用 mock 的 wx / Page / getApp 模拟页面 onLoad，捕获运行期错误（会导致真机/工具里白屏）
const path = require('path')

function mockWx() {
  const noop = () => {}
  return {
    getStorageSync: (k) => (k === 'ma_history' ? [] : undefined),
    setStorageSync: noop,
    removeStorageSync: noop,
    getWindowInfo: () => ({ pixelRatio: 2 }),
    getSystemInfoSync: () => ({ pixelRatio: 2 }),
    setNavigationBarTitle: noop,
    showModal: noop,
    showToast: noop,
    showLoading: noop,
    hideLoading: noop,
    createSelectorQuery: () => {
      const q = {
        in: () => q,
        select: () => q,
        fields: () => q,
        exec: (cb) => cb([null]),
      }
      return q
    },
    canvasToTempFilePath: (o) => o && o.success && o.success({ tempFilePath: 'x' }),
    saveImageToPhotosAlbum: noop,
    reLaunch: noop,
    navigateTo: noop,
    redirectTo: noop,
    switchTab: noop,
  }
}

function run(file, query) {
  const captured = {}
  global.wx = mockWx()
  global.getApp = () => ({ globalData: { lastResult: null } })
  global.Page = (def) => {
    captured.def = def
  }
  try {
    require(path.resolve(file))
  } catch (e) {
    return { error: 'require failed: ' + e.message + '\n' + e.stack }
  }
  const def = captured.def
  if (!def) return { error: 'Page() never called' }
  const setDataCalls = []
  const pageCtx = Object.assign({}, def, {
    data: JSON.parse(JSON.stringify(def.data || {})),
    setData(patch, cb) {
      Object.assign(this.data, patch)
      setDataCalls.push(patch)
      if (cb) cb()
    },
  })
  try {
    if (def.onLoad) def.onLoad.call(pageCtx, query || {})
  } catch (e) {
    return { error: 'onLoad threw: ' + e.message + '\n' + e.stack }
  }
  return { ok: true, dataKeys: Object.keys(pageCtx.data), sample: pageCtx.data }
}

for (const [file, q] of [
  ['pages/detail/detail.js', { id: 'mbti' }],
  ['pages/result/result.js', { id: 'mbti' }],
]) {
  const r = run(file, q)
  console.log('=== ' + file + ' ===')
  if (r.error) {
    console.log(r.error)
  } else {
    console.log('onLoad OK. meta.name =', r.sample.meta && r.sample.meta.name, '| primaryValue =', r.sample.primaryValue)
  }
}
