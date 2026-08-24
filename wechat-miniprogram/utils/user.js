// 用户个人信息：本地结构化存储，为后续接入后端（把用户与记录保存到数据库）做准备。
// - 记录通过 userId 关联到此用户；
// - openid / unionid 预留，待后端登录（wx.login -> code -> session）后回填；
// - 当前仅存本机，后端接入时可整体 POST 到用户接口，记录接口携带 userId 即可关联。

const KEY = 'ma_user'

// 性别用字符串枚举，语义清晰且便于后端直接落库
const GENDERS = ['unknown', 'male', 'female']
const GENDER_LABELS = { unknown: '暂不填写', male: '男', female: '女' }

// 生成本地唯一 ID；后端接入后可用 openid 关联同一用户
function genId() {
  return 'u_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
}

function defaults() {
  return {
    id: '',
    openid: '',
    unionid: '',
    nickname: '',
    avatarUrl: '',
    gender: 'unknown',
    birthday: '', // YYYY-MM-DD
    createdAt: 0,
    updatedAt: 0,
  }
}

// 读取并合并默认字段；兼容存储不存在 / 返回空字符串 / 测试桩返回数组等情况
function read() {
  const stored = wx.getStorageSync(KEY)
  const obj =
    stored && typeof stored === 'object' && !Array.isArray(stored) ? stored : {}
  return Object.assign(defaults(), obj)
}

function write(user) {
  wx.setStorageSync(KEY, user)
  return user
}

function getUser() {
  return read()
}

// 返回当前用户 ID，若尚未创建则立即生成（保证任何记录都能关联到用户）
function getUserId() {
  const u = read()
  if (u.id) return u.id
  const now = Date.now()
  return write(Object.assign(u, { id: genId(), createdAt: now, updatedAt: now })).id
}

// 局部更新用户信息；首次保存且无 id 时自动生成
function saveUser(partial) {
  const u = read()
  const next = Object.assign(u, partial || {}, { updatedAt: Date.now() })
  if (!next.id) {
    next.id = genId()
    if (!next.createdAt) next.createdAt = Date.now()
  }
  return write(next)
}

// 应用启动时调用：确保用户存在（生成本地 id），便于后续记录关联
function ensureUser() {
  const u = read()
  if (u.id) return u
  const now = Date.now()
  return write(Object.assign(u, { id: genId(), createdAt: now, updatedAt: now }))
}

module.exports = {
  KEY,
  GENDERS,
  GENDER_LABELS,
  getUser,
  getUserId,
  saveUser,
  ensureUser,
}
