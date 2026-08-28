// 集中定义所有本地存储键，避免字符串拼写漂移导致读写错位。
// 注意：修改键名会影响历史数据的读取兼容性，新增键请保持向后兼容。
module.exports = {
  // 测评
  HISTORY: 'ma_history', // 测评记录数组（≤30，最新在前）
  PROGRESS_PREFIX: 'ma_progress_', // 未完成进度前缀：ma_progress_<id>
  // 方法
  PRACTICES: 'ma_practices', // 方法练习记录：{ [methodId]: [...] }
  // 训练
  TRAIN_PREFIX: 'ma_train_', // 训练成绩前缀：ma_train_<id>__<level>
  TRAIN_LAST: 'ma_train_last', // 最近一次训练（游戏 + 难度）
  // 用户（云同步当前为占位实现，见 utils/user.js）
  USER: 'ma_user',
  // 主题
  THEME_PREF: 'user-theme-preference',
  EFFECTIVE_THEME: 'current-effective-theme',
  // 带 id 的键拼接助手
  progressKey: (id) => 'ma_progress_' + id,
  trainKey: (id, level) => 'ma_train_' + id + '__' + level,
}
