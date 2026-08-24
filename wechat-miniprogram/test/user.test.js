/**
 * 用户工具单元测试：本地结构化存储，为后端（用户+记录落库）做准备。
 * 运行：npm run test:simulate
 */
const user = require('../utils/user')

function mockStorage() {
  const store = {}
  global.wx.getStorageSync = (k) => (k in store ? store[k] : '')
  global.wx.setStorageSync = (k, v) => {
    store[k] = v
  }
  global.wx.removeStorageSync = (k) => {
    delete store[k]
  }
  return store
}

describe('utils/user', () => {
  beforeEach(() => {
    mockStorage()
  })

  test('getUserId 首次调用创建本地 id', () => {
    const id = user.getUserId()
    expect(typeof id).toBe('string')
    expect(id.length).toBeGreaterThan(0)
    expect(user.getUser().id).toBe(id)
  })

  test('getUserId 多次调用返回稳定同一 id', () => {
    expect(user.getUserId()).toBe(user.getUserId())
  })

  test('saveUser 合并字段并保留 id 与 createdAt', () => {
    const id = user.getUserId()
    user.saveUser({ nickname: '小明', gender: 'male' })
    const u = user.getUser()
    expect(u.id).toBe(id)
    expect(u.nickname).toBe('小明')
    expect(u.gender).toBe('male')
    expect(u.updatedAt).toBeGreaterThan(0)
  })

  test('ensureUser 仅在无 id 时创建一次', () => {
    const first = user.ensureUser()
    const second = user.ensureUser()
    expect(second.id).toBe(first.id)
  })

  test('记录结构含预留的 openid/unionid 字段，默认空串', () => {
    user.ensureUser()
    const u = user.getUser()
    expect(u.openid).toBe('')
    expect(u.unionid).toBe('')
    expect(Array.isArray(user.GENDERS)).toBe(true)
  })
})
