/**
 * 页面加载辅助：在已 mock wx/Page 的环境下 require 页面文件，捕获 Page() 定义，
 * 执行 onLoad 并返回页面 ctx（含 data / setData）。供 Jest 页面测试复用。
 */
const path = require('path')

function loadPage(relPath, query) {
  const abs = require.resolve(path.resolve(__dirname, '..', relPath))
  // 用 isolateModules 保证页面模块每次都重新执行（不受 require 缓存影响，跨平台路径安全），
  // 并在隔离作用域内捕获 Page() 定义。
  let captured = null
  jest.isolateModules(() => {
    global.Page = (def) => {
      captured = def
    }
    require(abs)
  })
  const def = captured
  if (!def) {
    throw new Error('Page() 未被调用: ' + relPath)
  }
  const ctx = Object.assign(Object.create(null), def)
  ctx.data = JSON.parse(JSON.stringify(def.data || {}))
  ctx.setData = function (patch, cb) {
    Object.assign(this.data, patch)
    if (cb) cb()
  }
  if (typeof def.onLoad === 'function') def.onLoad.call(ctx, query || {})
  return ctx
}

module.exports = { loadPage }
