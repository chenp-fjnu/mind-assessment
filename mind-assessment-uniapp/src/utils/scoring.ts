/**
 * SPM 评分与常模工具
 *
 * 说明：本常模表为基于公开 SPM 文献（Raven, Court & Raven）整理的成人组
 * 参考百分位近似值，用于本工具的演示与估算。非临床诊断用途。
 *
 * 原始分范围 0-60，对应百分位与 IQ（均数100、标准差15）估算。
 */

// 原始分 -> 百分位（16-30岁成人参考近似值）
// P2-14: 补充 0-19 分低分常模，避免线性回退导致精度丢失
const RAW_TO_PERCENTILE: Record<number, number> = {
  60: 99, 59: 99, 58: 98, 57: 97, 56: 95, 55: 93,
  54: 90, 53: 88, 52: 85, 51: 82, 50: 78, 49: 75,
  48: 70, 47: 66, 46: 62, 45: 58, 44: 54, 43: 50,
  42: 46, 41: 42, 40: 38, 39: 34, 38: 30, 37: 26,
  36: 23, 35: 20, 34: 17, 33: 14, 32: 12, 31: 10,
  30: 8,  29: 7,  28: 6,  27: 5,  26: 4,  25: 3,
  24: 2,  23: 2,  22: 1,  21: 1,  20: 1,
  // P2-14: 低分常模补充（基于 Raven, Court & Raven 成人参考数据）
  19: 0.5, 18: 0.4, 17: 0.3, 16: 0.2, 15: 0.15,
  14: 0.1, 13: 0.08, 12: 0.05, 11: 0.03, 10: 0.02,
  9: 0.01, 8: 0.01, 7: 0.01, 6: 0.01, 5: 0.01,
  4: 0.01, 3: 0.01, 2: 0.01, 1: 0.01, 0: 0.01,
};

// 百分位 -> IQ（标准分，M=100, SD=15）
function percentileToIQ(p: number): number {
  if (p <= 0) return 55;
  if (p >= 100) return 145;
  // 逆正态分布近似（Beasley-Springer-Moro 简化版）
  const z = invNorm(p / 100);
  return Math.round(100 + z * 15);
}

// 简化逆正态 CDF
function invNorm(p: number): number {
  const a = [-3.969683028665376e1, 2.209460984245205e2, -2.759285104469687e2,
             1.38357751867269e2, -3.066479806614716e1, 2.506628277459239];
  const b = [-5.447609879822406e1, 1.615858368580409e2, -1.556989798598866e2,
             6.680131188771972e1, -1.328068155288572e1];
  const c = [-7.784894002430293e-3, -3.223964580411365e-1, -2.400758277161838,
             -2.549732539343734, 4.374664141464968, 2.938163982698783];
  const d = [7.784695709041462e-3, 3.224671290700398e-1, 2.445134137142996,
             3.754408661907416];
  const plow = 0.02425, phigh = 1 - plow;
  let q: number, r: number;
  if (p < plow) {
    q = Math.sqrt(-2 * Math.log(p));
    return (((((c[0]*q+c[1])*q+c[2])*q+c[3])*q+c[4])*q+c[5]) /
           ((((d[0]*q+d[1])*q+d[2])*q+d[3])*q+1);
  } else if (p <= phigh) {
    q = p - 0.5; r = q*q;
    return (((((a[0]*r+a[1])*r+a[2])*r+a[3])*r+a[4])*r+a[5])*q /
           (((((b[0]*r+b[1])*r+b[2])*r+b[3])*r+b[4])*r+1);
  } else {
    q = Math.sqrt(-2 * Math.log(1 - p));
    return -(((((c[0]*q+c[1])*q+c[2])*q+c[3])*q+c[4])*q+c[5]) /
            ((((d[0]*q+d[1])*q+d[2])*q+d[3])*q+1);
  }
}

/** 分组得分 */
function groupScores(answers: any[], questions: any[]) {
  const groups: any = { A: 0, B: 0, C: 0, D: 0, E: 0 };
  const total = { correct: 0, wrong: 0, skipped: 0 };
  questions.forEach((q, i) => {
    const a = answers[i];
    if (a === undefined || a === null) {
      total.skipped++;
      return;
    }
    if (a === q.answer) {
      groups[q.set]++;
      total.correct++;
    } else {
      total.wrong++;
    }
  });
  return { groups, total };
}

/** 计算完整结果 */
function computeResult(answers: any[], questions: any[], timings: number[] = []) {
  const { groups, total } = groupScores(answers, questions);
  const raw = total.correct;
  // P2-14: 常模表已覆盖 0-60 全范围，无需线性回退
  const percentile = RAW_TO_PERCENTILE[raw] !== undefined
    ? RAW_TO_PERCENTILE[raw]
    : (raw > 60 ? 99 : 0.01);
  const iq = percentileToIQ(percentile);
  const totalTime = timings.reduce((s, t) => s + (t || 0), 0);
  const avgTime = timings.length ? Math.round(totalTime / timings.length) : 0;
  const level = describeLevel(iq);
  return {
    raw,
    total: questions.length,
    percentile,
    iq,
    level: level.label,
    description: level.desc,
    groups,
    totalStat: total,
    totalTime,
    avgTime,
  };
}

function describeLevel(iq: number) {
  if (iq >= 130) return { label: '极优', desc: '智力水平明显高于平均水平，具备卓越的抽象推理与模式识别能力。' };
  if (iq >= 120) return { label: '优秀', desc: '推理能力优于多数人，善于发现复杂规律。' };
  if (iq >= 110) return { label: '中上', desc: '推理能力高于平均水平。' };
  if (iq >= 90)  return { label: '中等', desc: '推理能力处于平均水平。' };
  if (iq >= 80)  return { label: '中下', desc: '推理能力略低于平均水平。' };
  if (iq >= 70)  return { label: '边缘', desc: '推理能力较低，建议结合其他评估。' };
  return { label: '较低', desc: '建议在专业心理评估人员指导下进一步评估。' };
}

export default {
  RAW_TO_PERCENTILE,
  percentileToIQ,
  groupScores,
  computeResult,
  describeLevel,
};
