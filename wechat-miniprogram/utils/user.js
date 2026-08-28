// 用户个人信息与记录云存储
// - 兼容本地离线使用，数据优先本地，异步同步云端
// - 结构设计为便于后端完全接入，字段与微信用户信息对齐
// - 通过 userId 关联所有记录（本地生成或云端 openid 关联）
//
// 数据结构说明：
// - user: 个人基础信息（一次性写入， thereafter 增量更新）
// - records: 所有测评/训练记录的集合，通过 userId 关联
// - 每条记录包括：类型、模块ID、模块名称、答案、结果、完成时间、sync状态
//
// 同步策略：
// - 启动时读取本地，若有云 openid 则尝试合并/更新
// - 每次保存记录后自动后台同步（防止丢失）
// - 用户可手动触发「立即同步」
// - 断网情况下本地优先，恢复网络自动继续同步

// 云开发环境配置（需在 project.config.json 或 app.json 中配置）
// const cloud = require('wx-server').init({
//   env: 'prod-XXXX', // 建议使用当前环境或显式指定
// })

const SK = require('./storage-keys')

const KEY = SK.USER
// 记录集合键名（本地存储键）
const RECORDS_KEY = SK.RECORDS

// 云同步开关：当前为占位实现（未接入微信云开发）。置为 false 时所有同步调用静默跳过，
// 避免向用户展示「同步成功」等不实状态。接入后端后取消 wx.cloud 调用注释并改为 true。
const CLOUD_ENABLED = false

// 当前是否已接入云端（供 UI 判断同步能力）
function isCloudEnabled() {
  return CLOUD_ENABLED
}

// 性别用字符串枚举，语义清晰且便于后端直接落库
const GENDERS = ['unknown', 'male', 'female']
const GENDER_LABELS = { unknown: '暂不填写', male: '男', female: '女' }

// 生成本地唯一 ID；后端接入后可用 openid 关联同一用户
function genId() {
  return 'u_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
}

// 默认用户结构
function defaults() {
  return {
    id: '', // 本地生成ID 或云端 openid
    openid: '', // 微信openid，登录后填充
    unionid: '', // 微信unionid，多设备同账号
    nickname: '', // 用户昵称
    avatarUrl: '', // 用户头像
    gender: 'unknown', // unknown/male/female
    birthday: '', // YYYY-MM-DD格式
    createdAt: 0, // 首次创建时间戳
    updatedAt: 0, // 最后更新时间戳
    // 云端同步相关
    syncStatus: 'pending', // pending/synced/conflict
    lastSync: 0, // 最后同步时间戳
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

// 读取本地记录
function readRecordsLocal() {
  const stored = wx.getStorageSync(RECORDS_KEY)
  const obj =
    stored && typeof stored === 'object' && !Array.isArray(stored) ? stored : {}
  return obj
}

// 写入本地记录
function writeRecordsLocal(records) {
  wx.setStorageSync(RECORDS_KEY, records)
  return records
}

// 初始化云开发环境（在小程序启动时调用）
// 注意：必须在基础库2.7.0+且配置了cloud环境时使用
function initCloud() {
  try {
    // wx.cloud.init 推荐在 app.js 中调用，此处提供接口供调用
    // wx.cloud.init({
    //   env: wx.getAccountInfoSync. MiniProgram.environment,
    //   throwErrors: true,
    // })
    console.log('Cloud init called (should be called in app.js)')
    return true
  } catch (e) {
    console.log('Cloud not init, using local only:', e.message)
    return false
  }
}

// 保存用户信息（本地写入，后台异步同步云端）
function saveUser(partial) {
  const local = readLocal()
  const next = Object.assign({}, local, partial || {}, { updatedAt: Date.now() })
  if (!next.id) {
    next.id = genId()
    if (!next.createdAt) next.createdAt = Date.now()
  }
  // 写入本地
  writeLocal(next)
  
  // 异步同步云端（未启用时静默跳过）
  if (CLOUD_ENABLED) syncUserToCloud(next).catch(console.error)
  
  return next
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

// ========== 记录相关操作 ==========

// 保存评估/训练记录
function saveRecord(record) {
  const records = readRecordsLocal()
  const userId = getUserId()
  
  // 添加元数据
  const next = {
    ...record,
    userId,
    _id: record._id || (record.type + '_' + Date.now() + '_' + Math.random().toString(36).slice(2)),
    syncStatus: 'pending', // pending/synced/failed
    createdAt: record.createdAt || Date.now(),
    updatedAt: Date.now(),
  }
  
  // 写入本地
  records[next._id] = next
  writeRecordsLocal(records)
  
  // 异步同步云端（未启用时静默跳过）
  if (CLOUD_ENABLED) syncRecordToCloud(next).catch(console.error)
  
  return next
}

// 获取用户所有记录
function getRecords() {
  const records = readRecordsLocal()
  const userId = getUserId()
  return Object.values(records).filter(r => r.userId === userId)
}

// 获取特定类型的记录
function getRecordsByType(type) {
  const records = getRecords()
  return records.filter(r => r.type === type)
}

// 手动触发立即同步
async function syncNow() {
  if (!CLOUD_ENABLED) return false
  const local = readLocal()
  if (!local.id) {
    wx.showToast({ title: '请先保存用户信息', icon: 'none' })
    return false
  }
  
  // 同步用户信息
  await syncUserToCloud(local)
  
  // 同步所有记录
  const records = readRecordsLocal()
  const userRecords = Object.values(records).filter(r => r.userId === local.id)
  
  for (const record of userRecords) {
    if (record.syncStatus !== 'synced') {
      await syncRecordToCloud(record)
    }
  }
  
  // 重新读取并刷新
  wx.showToast({ title: '同步完成', icon: 'success' })
  return true
}

// 获取同步状态
function getSyncStatus() {
  const u = readLocal()
  return {
    userSync: u.syncStatus,
    lastSync: u.lastSync,
    recordCount: Object.keys(readRecordsLocal()).length,
  }
}

// 内部：同步用户到云端
function syncUserToCloud(user) {
  // 这里集成云调用，示意结构
  // wx.cloud.callFunction({
  //   name: 'user',
  //   data: { action: 'upsert', user },
  //   success: res => {
  //     writeLocal(Object.assign(user, { syncStatus: 'synced', lastSync: Date.now() }))
  //   },
  // })
  return Promise.resolve()
}

// 内部：同步单条记录到云端
function syncRecordToCloud(record) {
  // wx.cloud.callFunction({
  //   name: 'records',
  //   data: { action: 'upsert', record },
  //   success: res => {
  //     const records = readRecordsLocal()
  //     records[record._id].syncStatus = 'synced'
  //     writeRecordsLocal(records)
  //   },
  // })
  return Promise.resolve()
}

// 导出工具方法
module.exports = {
  KEY,
  GENDERS,
  GENDER_LABELS,
  initCloud,
  defaults,
  readLocal,
  writeLocal,
  readRecordsLocal,
  writeRecordsLocal,
  getUser,
  getUserId,
  ensureUser,
  saveUser,
  saveRecord,
  getRecords,
  getRecordsByType,
  syncNow,
  getSyncStatus,
  isCloudEnabled,
}

// 兼容旧版导入（保持向后兼容）
// 旧接口：module.exports = { KEY, GENDERS, GENDER_LABELS, getUser, getUserId, saveUser, ensureUser }