/**
 * 通用量表评分工具
 * 支持：反向计分、求和、百分比转换、等级判定
 */

interface DimensionInfo {
  name: string;
  en?: string;
  desc?: string;
  high?: string;
  low?: string;
}

interface ScaleOptions {
  min?: number;
  max?: number;
  highThreshold?: number;
  lowThreshold?: number;
  defaultVal?: number;
}

interface ScaleResult {
  name: string;
  en: string;
  desc: string;
  sum: number;
  avg: number;
  percent: number;
  level: string;
  text: string;
}

/**
 * 计算量表维度得分
 */
export function computeScaleScores(
  answers: (number | null)[],
  questions: Array<{ dimension: string; reverse?: boolean }>,
  dimensions: Record<string, DimensionInfo>,
  opts: ScaleOptions = {}
): Record<string, ScaleResult> {
  const { min = 1, max = 5, highThreshold = 70, lowThreshold = 30, defaultVal = 3 } = opts;
  const scores: Record<string, number[]> = {};
  Object.keys(dimensions).forEach((d) => (scores[d] = []));

  questions.forEach((q, i) => {
    const raw = answers[i];
    const val = raw == null ? defaultVal : (q.reverse ? (max + 1 - raw) : raw);
    if (scores[q.dimension]) {
      scores[q.dimension].push(val);
    }
  });

  const result: Record<string, ScaleResult> = {};
  Object.keys(scores).forEach((d) => {
    const arr = scores[d];
    const sum = arr.reduce((a, b) => a + b, 0);
    const avg = arr.length ? sum / arr.length : defaultVal;
    const percent = Math.round(((avg - min) / (max - min)) * 100);
    const info = dimensions[d];
    result[d] = {
      name: info.name,
      en: info.en || '',
      desc: info.desc || '',
      sum,
      avg: Math.round(avg * 10) / 10,
      percent,
      level: percent >= highThreshold ? 'high' : percent <= lowThreshold ? 'low' : 'mid',
      text: percent >= highThreshold ? (info.high || '') : percent <= lowThreshold ? (info.low || '') : '处于中等水平。',
    };
  });
  return result;
}

/**
 * 根据百分比和阈值返回等级信息
 */
export function formatLevel(
  percent: number,
  thresholds: { high?: number; low?: number; highLabel?: string; midLabel?: string; lowLabel?: string } = {}
): { level: string; label: string } {
  const { high = 70, low = 30, highLabel = '偏高', midLabel = '中等', lowLabel = '偏低' } = thresholds;
  if (percent >= high) return { level: 'high', label: highLabel };
  if (percent <= low) return { level: 'low', label: lowLabel };
  return { level: 'mid', label: midLabel };
}
