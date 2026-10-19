// 用户个人信息本地存储
// - 当前版本为纯本地、离线使用：所有数据仅存于本机 Storage，无云端同步。
// - 如需上线云同步，接入微信云开发（app.js 调 wx.cloud.init、补 user/records 云函数），
//   届时在本文件按需补回同步逻辑。
const SK = require('./storage-keys')

const KEY = SK.USER

// 性别用字符串枚举，语义清晰
const GENDERS = ['unknown', 'male', 'female']
const GENDER_LABELS = { unknown: '暂不填写', male: '男', female: '女' }

// 生成本地唯一 ID（本地离线使用，无需后端关联）
function genId() {
  return 'u_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
}

// 默认用户结构
function defaults() {
  return {
    id: '', // 本地生成ID
    nickname: '', // 用户昵称
    avatarUrl: '', // 用户头像
    gender: 'unknown', // unknown/male/female
    birthday: '', // YYYY-MM-DD格式
    createdAt: 0, // 首次创建时间戳
    updatedAt: 0, // 最后更新时间戳
  }
}

// 读取本地用户数据并填充默认值
function readLocal() {
  const stored = wx.getStorageSync(KEY)
  const obj =
    stored && typeof stored === 'object' && !Array.isArray(stored) ? stored : {}
  return Object.assign({}, defaults(), obj)
}

// 写入本地存储
function writeLocal(user) {
  wx.setStorageSync(KEY, user)
  return user
}

// 保存用户信息（仅本地写入）
function saveUser(partial) {
  const local = readLocal()
  const next = Object.assign({}, local, partial || {}, { updatedAt: Date.now() })
  if (!next.id) {
    next.id = genId()
    if (!next.createdAt) next.createdAt = Date.now()
  }
  return writeLocal(next)
}

// 获取当前用户信息
function getUser() {
  return readLocal()
}

// 获取当前用户 ID
function getUserId() {
  const u = readLocal()
  if (u.id) return u.id
  const now = Date.now()
  return writeLocal(Object.assign(u, { id: genId(), createdAt: now, updatedAt: now })).id
}

// 确保用户存在（启动时调用）
function ensureUser() {
  const u = readLocal()
  if (u.id) return u
  const now = Date.now()
  return writeLocal(Object.assign(u, { id: genId(), createdAt: now, updatedAt: now }))
}

// 导出工具方法
module.exports = {
  KEY,
  GENDERS,
  GENDER_LABELS,
  defaults,
  readLocal,
  writeLocal,
  getUser,
  getUserId,
  ensureUser,
  saveUser,
}
