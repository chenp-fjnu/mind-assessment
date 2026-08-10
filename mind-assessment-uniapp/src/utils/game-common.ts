/**
 * 游戏通用工具函数
 */

/**
 * 生成随机整数 [min, max]
 */
export function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * 打乱数组（Fisher-Yates）
 */
export function shuffle<T>(arr: T[]): T[] {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * 生成随机颜色（用于斯特鲁普等游戏）
 */
export const GAME_COLORS = [
  { name: '红', value: '#dc2626', text: '红' },
  { name: '绿', value: '#16a34a', text: '绿' },
  { name: '蓝', value: '#2563eb', text: '蓝' },
  { name: '黄', value: '#d97706', text: '黄' },
  { name: '紫', value: '#7c3aed', text: '紫' },
];

/**
 * 格式化时间显示 mm:ss.ms
 */
export function formatTime(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const milliseconds = Math.floor((ms % 1000) / 10);
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(2, '0')}`;
}

/**
 * 计算游戏等级
 */
export function calcGameLevel(score: number, thresholds: number[]): number {
  for (let i = 0; i < thresholds.length; i++) {
    if (score < thresholds[i]) return i + 1;
  }
  return thresholds.length + 1;
}

/**
 * 延迟函数
 */
export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * 保存游戏记录到本地
 */
export function saveGameRecord(gameId: string, record: { score: number; level: number; date: string }) {
  const key = `game_record_${gameId}`;
  const existing = uni.getStorageSync(key) || [];
  existing.unshift(record);
  // 最多保留50条
  if (existing.length > 50) existing.length = 50;
  uni.setStorageSync(key, existing);
}

/**
 * 获取游戏历史记录
 */
export function getGameRecords(gameId: string): any[] {
  return uni.getStorageSync(`game_record_${gameId}`) || [];
}

/**
 * 游戏状态管理类型
 */
export interface GameState {
  status: 'idle' | 'countdown' | 'playing' | 'paused' | 'finished';
  score: number;
  level: number;
  startTime: number;
  endTime: number;
}
