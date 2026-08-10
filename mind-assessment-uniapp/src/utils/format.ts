/**
 * 通用格式化工具
 * 改编自现有小程序 utils/format.js 与 storage.js
 */

/**
 * 格式化秒数为 mm:ss
 */
export function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

/**
 * 格式化时间戳为 YYYY-MM-DD HH:mm
 */
export function formatDate(ts: number | string | Date): string {
  const d = new Date(ts);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/**
 * 格式化测评分数为展示文本
 * （保留原有逻辑，移除对 module-system 的强依赖）
 */
export function formatScore(record: any): string {
  if (!record) return '0';

  const field = record.primaryField || record.resultField;
  const val = field != null ? record[field] : null;

  if (val == null) return String(record.raw || 0);

  // trait 字段取前3段
  if (field === 'trait' && typeof val === 'string') {
    return val.split(' ').slice(0, 3).join(' ');
  }

  return String(val);
}
