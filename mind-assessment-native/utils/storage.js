/**
 * 本地存储与请求工具
 * 支持多测试类型：进度和支付状态按测试 ID 隔离
 */

const config = require('../config');

const STORAGE_KEYS = {
  HISTORY: 'mp_history',       // 统一历史（含 testId 字段）
  USER: 'mp_user',
  PROGRESS: 'mp_progress',     // { [testId]: progress }
  PAID: 'mp_paid',             // { [testId]: orderId }
  GAME_SCORES: 'mp_game_scores', // { [gameId]: bestScore }
  GAME_HISTORY: 'mp_game_history', // { [gameId]: [{ score, ts, meta? }] }
};

// P0-2: 计时类游戏分数越小越好，需要特殊处理
const SCORE_LOWER_IS_BETTER = {
  schulte: true,   // 舒尔特方格：完成时间越短越好
};

// ---------- 历史记录 ----------
function getHistory() {
  try {
    return wx.getStorageSync(STORAGE_KEYS.HISTORY) || [];
  } catch (e) { return []; }
}

function saveHistory(record) {
  const list = getHistory();
  list.unshift(record);
  if (list.length > 50) list.length = 50;
  try { wx.setStorageSync(STORAGE_KEYS.HISTORY, list); } catch (e) {}
  return list;
}

function getHistoryByTest(testId) {
  return getHistory().filter((r) => r.testId === testId);
}

// P0-UX: 删除单条历史记录
function deleteHistoryItem(recordId) {
  try {
    const list = getHistory();
    const filtered = list.filter((r) => r.id !== recordId);
    wx.setStorageSync(STORAGE_KEYS.HISTORY, filtered);
    return filtered;
  } catch (e) { return getHistory(); }
}

// ---------- 付费状态（按测试隔离） ----------
function isPaid(testId) {
  try {
    const paid = wx.getStorageSync(STORAGE_KEYS.PAID) || {};
    return !!paid[testId];
  } catch (e) { return false; }
}

function setPaid(testId, orderId) {
  try {
    const paid = wx.getStorageSync(STORAGE_KEYS.PAID) || {};
    paid[testId] = orderId || true;
    wx.setStorageSync(STORAGE_KEYS.PAID, paid);
  } catch (e) {}
}

// ---------- 进度（按测试隔离） ----------
function saveProgress(testId, progress) {
  try {
    const all = wx.getStorageSync(STORAGE_KEYS.PROGRESS) || {};
    all[testId] = progress;
    wx.setStorageSync(STORAGE_KEYS.PROGRESS, all);
  } catch (e) {}
}

function getProgress(testId) {
  try {
    const all = wx.getStorageSync(STORAGE_KEYS.PROGRESS) || {};
    return all[testId] || null;
  } catch (e) { return null; }
}

function getAllProgress() {
  try {
    return wx.getStorageSync(STORAGE_KEYS.PROGRESS) || {};
  } catch (e) { return {}; }
}

function clearProgress(testId) {
  try {
    const all = wx.getStorageSync(STORAGE_KEYS.PROGRESS) || {};
    delete all[testId];
    wx.setStorageSync(STORAGE_KEYS.PROGRESS, all);
  } catch (e) {}
}

// ---------- 游戏分数 ----------
function getGameScore(gameId) {
  try {
    const all = wx.getStorageSync(STORAGE_KEYS.GAME_SCORES) || {};
    return all[gameId] || 0;
  } catch (e) { return 0; }
}

function saveGameScore(gameId, score, opts = {}) {
  try {
    const all = wx.getStorageSync(STORAGE_KEYS.GAME_SCORES) || {};
    // P0-2: 支持"越小越好"的游戏（如 schulte 计时），通过 opts.lowerIsBetter 指定
    const lowerIsBetter = opts.lowerIsBetter || SCORE_LOWER_IS_BETTER[gameId];
    if (lowerIsBetter) {
      if (all[gameId] === undefined || score < all[gameId]) all[gameId] = score;
    } else {
      if (score > (all[gameId] || 0)) all[gameId] = score;
    }
    wx.setStorageSync(STORAGE_KEYS.GAME_SCORES, all);
  } catch (e) {}
}

function getAllGameScores() {
  try {
    return wx.getStorageSync(STORAGE_KEYS.GAME_SCORES) || {};
  } catch (e) { return {}; }
}

// ---------- 游戏历史记录（统一存储） ----------
function getGameHistory(gameId, limit = 5) {
  try {
    const all = wx.getStorageSync(STORAGE_KEYS.GAME_HISTORY) || {};
    const list = all[gameId] || [];
    return list.slice(0, limit);
  } catch (e) { return []; }
}

function saveGameHistory(gameId, entry) {
  try {
    const all = wx.getStorageSync(STORAGE_KEYS.GAME_HISTORY) || {};
    if (!all[gameId]) all[gameId] = [];
    all[gameId].unshift({ ...entry, ts: entry.ts || Date.now() });
    if (all[gameId].length > 20) all[gameId].length = 20; // 最多保留 20 条
    wx.setStorageSync(STORAGE_KEYS.GAME_HISTORY, all);
  } catch (e) {}
}

// ---------- 网络请求 ----------
/**
 * P2-12: 添加 timeout 防止请求挂起
 * P2-13: 移除废弃的 x-openid header，统一使用 JWT Authorization
 */
function request(path, data = {}, method = 'POST') {
  const app = getApp();
  const baseUrl = app && app.globalData && app.globalData.baseUrl
    ? app.globalData.baseUrl
    : config.baseUrl;
  // 优先从 globalData 取 token，其次本地存储（应对冷启动）
  let token = (app && app.globalData && app.globalData.token) || '';
  if (!token) {
    try { token = wx.getStorageSync('mp_auth_token') || ''; } catch (e) {}
  }
  const headers = {
    'content-type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = 'Bearer ' + token;
  }
  return new Promise((resolve, reject) => {
    wx.request({
      url: baseUrl + path,
      method,
      data,
      header: headers,
      timeout: 10000, // P2-12: 10 秒超时
      success: (res) => {
        if (res.statusCode >= 200 && res.statusCode < 300) resolve(res.data);
        else reject(new Error((res.data && res.data.message) || `HTTP ${res.statusCode}`));
      },
      fail: (err) => reject(err),
    });
  });
}

function login() {
  return new Promise((resolve, reject) => {
    wx.login({
      success: (res) => (res.code ? resolve(res.code) : reject(new Error('wx.login 无 code'))),
      fail: reject,
    });
  });
}

function formatTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function formatDate(ts) {
  const d = new Date(ts);
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

module.exports = {
  STORAGE_KEYS,
  getHistory,
  saveHistory,
  getHistoryByTest,
  deleteHistoryItem,
  isPaid,
  setPaid,
  saveProgress,
  getProgress,
  getAllProgress,
  clearProgress,
  getGameScore,
  saveGameScore,
  getAllGameScores,
  getGameHistory,
  saveGameHistory,
  request,
  login,
  formatTime,
  formatDate,
};
