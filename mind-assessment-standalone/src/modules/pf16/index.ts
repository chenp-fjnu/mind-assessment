/**
 * 16PF 卡特尔 16 种人格因素问卷（简化版 48 题）
 *
 * 完整 16PF 共 187 题，此处简化为每因素 3 题，共 48 题：
 *   A  乐群性 (Warmth)             — 热情 vs 冷漠
 *   B  聪慧性 (Reasoning)           — 善于抽象思考
 *   C  稳定性 (Emotional Stability) — 情绪成熟 vs 易波动
 *   E  恃强性 (Dominance)          — 支配 vs 顺从
 *   F  兴奋性 (Liveliness)         — 活泼 vs 严肃
 *   G  有恒性 (Rule-Consciousness) — 责任感 vs 权变
 *   H  敢为性 (Social Boldness)    — 大胆 vs 害羞
 *   I  敏感性 (Sensitivity)        — 感性 vs 理性
 *   L  怀疑性 (Vigilance)          — 警惕 vs 信任
 *   M  幻想性 (Abstractedness)     — 爱幻想 vs 务实
 *   N  世故性 (Privateness)        — 精明 vs 直率
 *   O  忧虑性 (Apprehension)       — 不安 vs 自信
 *   Q1 实验性 (Openness to Change) — 求新 vs 保守
 *   Q2 独立性 (Self-Reliance)      — 自主 vs 依赖群体
 *   Q3 自律性 (Perfectionism)      — 自制 vs 随意
 *   Q4 紧张性 (Tension)            — 紧张 vs 放松
 *
 * 每题为 5 级量表：1=非常不同意 ... 5=非常同意
 * 部分题目反向计分。
 */

import { computeScaleScores } from '../../utils/scale-scoring';

const FACTORS: Record<string, { name: string; en: string; low: string; high: string }> = {
  A:  { name: '乐群性', en: 'Warmth',              low: '冷淡矜持，偏好独处，与人保持距离。',          high: '热情开朗，乐于与人交往，容易亲近。' },
  B:  { name: '聪慧性', en: 'Reasoning',           low: '偏重具体思维，抽象推理能力有待加强。',        high: '善于抽象思考，逻辑推理能力强。' },
  C:  { name: '稳定性', en: 'Emotional Stability', low: '情绪易波动，受挫后恢复较慢。',                high: '情绪成熟稳定，能从容应对压力。' },
  E:  { name: '恃强性', en: 'Dominance',           low: '顺从谦和，不喜欢与人争执。',                  high: '独立强势，喜欢主导和影响他人。' },
  F:  { name: '兴奋性', en: 'Liveliness',          low: '严肃审慎，沉默寡言。',                        high: '活泼热情，健谈风趣。' },
  G:  { name: '有恒性', en: 'Rule-Consciousness',  low: '灵活权变，不拘泥规则。',                      high: '有责任感，遵守规则，持之以恒。' },
  H:  { name: '敢为性', en: 'Social Boldness',     low: '害羞退缩，在陌生场合拘谨。',                  high: '大胆自信，敢于在社交中表现自我。' },
  I:  { name: '敏感性', en: 'Sensitivity',         low: '理性务实，注重客观事实。',                    high: '感性细腻，重视情感与审美。' },
  L:  { name: '怀疑性', en: 'Vigilance',           low: '信任他人，坦诚接纳。',                        high: '警惕多疑，对他人动机保持戒备。' },
  M:  { name: '幻想性', en: 'Abstractedness',      low: '脚踏实地，关注现实。',                        high: '富有想象力，常沉浸于幻想与创意。' },
  N:  { name: '世故性', en: 'Privateness',         low: '直率天真，心里藏不住话。',                    high: '精明老练，懂得人情世故。' },
  O:  { name: '忧虑性', en: 'Apprehension',        low: '自信安详，较少自我怀疑。',                    high: '忧虑不安，常自责与担忧。' },
  Q1: { name: '实验性', en: 'Openness to Change',  low: '保守传统，尊重既有观念。',                    high: '思想开放，乐于尝试新观念新方法。' },
  Q2: { name: '独立性', en: 'Self-Reliance',       low: '依赖群体，喜欢集体决策。',                    high: '独立自主，自己做决定。' },
  Q3: { name: '自律性', en: 'Perfectionism',       low: '随性自然，不喜约束。',                        high: '自律严谨，对自己要求高。' },
  Q4: { name: '紧张性', en: 'Tension',             low: '轻松平静，身心松弛。',                        high: '紧张焦虑，常处于驱动状态。' },
};

// 每因素 3 题，共 48 题
const QUESTIONS = [
  // A 乐群性
  { id: 'PF-01', factor: 'A', reverse: false, text: '我喜欢参加人多热闹的聚会。' },
  { id: 'PF-02', factor: 'A', reverse: false, text: '我很容易和陌生人打开话题。' },
  { id: 'PF-03', factor: 'A', reverse: true,  text: '独处比社交更让我感到自在。' },
  // B 聪慧性
  { id: 'PF-04', factor: 'B', reverse: false, text: '我善于理解复杂的抽象概念。' },
  { id: 'PF-05', factor: 'B', reverse: false, text: '我喜欢思考需要逻辑推理的问题。' },
  { id: 'PF-06', factor: 'B', reverse: true,  text: '我更愿意处理具体实际的事务而非理论。' },
  // C 稳定性
  { id: 'PF-07', factor: 'C', reverse: false, text: '遇到突发状况我能保持冷静。' },
  { id: 'PF-08', factor: 'C', reverse: true,  text: '我的情绪常常起伏不定。' },
  { id: 'PF-09', factor: 'C', reverse: false, text: '挫折后我能很快调整好心态。' },
  // E 恃强性
  { id: 'PF-10', factor: 'E', reverse: false, text: '我在讨论中常坚持自己的观点。' },
  { id: 'PF-11', factor: 'E', reverse: true,  text: '我更愿意顺从他人的意见。' },
  { id: 'PF-12', factor: 'E', reverse: false, text: '我天生有领导他人的倾向。' },
  // F 兴奋性
  { id: 'PF-13', factor: 'F', reverse: false, text: '我说话做事风风火火，充满活力。' },
  { id: 'PF-14', factor: 'F', reverse: true,  text: '我为人严肃，不苟言笑。' },
  { id: 'PF-15', factor: 'F', reverse: false, text: '我能在聚会中活跃气氛。' },
  // G 有恒性
  { id: 'PF-16', factor: 'G', reverse: false, text: '我做事讲究规矩和原则。' },
  { id: 'PF-17', factor: 'G', reverse: false, text: '我会坚持完成承诺过的事。' },
  { id: 'PF-18', factor: 'G', reverse: true,  text: '规则是死的，应灵活变通。' },
  // H 敢为性
  { id: 'PF-19', factor: 'H', reverse: false, text: '我敢于在众人面前表达观点。' },
  { id: 'PF-20', factor: 'H', reverse: true,  text: '陌生场合让我感到拘谨不安。' },
  { id: 'PF-21', factor: 'H', reverse: false, text: '面对新环境我主动融入。' },
  // I 敏感性
  { id: 'PF-22', factor: 'I', reverse: false, text: '我很容易被艺术作品打动。' },
  { id: 'PF-23', factor: 'I', reverse: true,  text: '我做决定时很少受情感影响。' },
  { id: 'PF-24', factor: 'I', reverse: false, text: '我能敏锐感知他人的情绪变化。' },
  // L 怀疑性
  { id: 'PF-25', factor: 'L', reverse: false, text: '我对他人的动机常持怀疑态度。' },
  { id: 'PF-26', factor: 'L', reverse: true,  text: '我倾向于相信别人的善意。' },
  { id: 'PF-27', factor: 'L', reverse: false, text: '我觉得别人常在背后议论我。' },
  // M 幻想性
  { id: 'PF-28', factor: 'M', reverse: false, text: '我常沉浸于想象和幻想之中。' },
  { id: 'PF-29', factor: 'M', reverse: true,  text: '我做事关注现实，不胡思乱想。' },
  { id: 'PF-30', factor: 'M', reverse: false, text: '我喜欢天马行空地构思创意。' },
  // N 世故性
  { id: 'PF-31', factor: 'N', reverse: false, text: '我懂得在不同场合说合适的话。' },
  { id: 'PF-32', factor: 'N', reverse: true,  text: '我心直口快，有话直说。' },
  { id: 'PF-33', factor: 'N', reverse: false, text: '我能洞察他人的真实意图。' },
  // O 忧虑性
  { id: 'PF-34', factor: 'O', reverse: false, text: '我常为自己的不足感到忧虑。' },
  { id: 'PF-35', factor: 'O', reverse: true,  text: '我对自己的能力充满信心。' },
  { id: 'PF-36', factor: 'O', reverse: false, text: '我容易陷入自我怀疑。' },
  // Q1 实验性
  { id: 'PF-37', factor: 'Q1', reverse: false, text: '我乐于尝试新的生活方式。' },
  { id: 'PF-38', factor: 'Q1', reverse: true,  text: '我尊重传统和既有的做法。' },
  { id: 'PF-39', factor: 'Q1', reverse: false, text: '我支持打破常规的改革。' },
  // Q2 独立性
  { id: 'PF-40', factor: 'Q2', reverse: false, text: '我习惯独立思考和做决定。' },
  { id: 'PF-41', factor: 'Q2', reverse: true,  text: '我做事喜欢征求他人意见。' },
  { id: 'PF-42', factor: 'Q2', reverse: false, text: '独处时我的效率更高。' },
  // Q3 自律性
  { id: 'PF-43', factor: 'Q3', reverse: false, text: '我对自己有严格的要求。' },
  { id: 'PF-44', factor: 'Q3', reverse: true,  text: '我做事比较随性，不喜约束。' },
  { id: 'PF-45', factor: 'Q3', reverse: false, text: '我能控制冲动，按计划行事。' },
  // Q4 紧张性
  { id: 'PF-46', factor: 'Q4', reverse: false, text: '我常感到时间紧迫、压力很大。' },
  { id: 'PF-47', factor: 'Q4', reverse: true,  text: '我大多数时候感到放松自在。' },
  { id: 'PF-48', factor: 'Q4', reverse: false, text: '我容易因小事而烦躁不安。' },
];

function computeResult(answers: any[], qs: any[]) {
  const factors = computeScaleScores(answers, qs, FACTORS, {
    min: 1, max: 5, highThreshold: 65, lowThreshold: 35, defaultVal: 3,
  });

  // 次元因素（简化估算）
  const anxietyScore = (100 - (factors as any).C.percent) + (factors as any).O.percent + (factors as any).Q4.percent;
  const extroversionScore = (factors as any).A.percent + (factors as any).F.percent + (factors as any).H.percent + (100 - (factors as any).Q2.percent);
  const sensitivityScore = (factors as any).I.percent + (factors as any).M.percent;

  return {
    factors,
    dimensions: factors,
    raw: Object.values(factors).reduce((a: number, f: any) => a + f.sum, 0),
    total: qs.length,
    totalStat: { correct: 0, wrong: 0, skipped: answers.filter((a: any) => a == null).length },
    type: '16PF',
    typeName: '十六因素人格画像',
    trait: `${Object.keys(factors).map((f: string) => f + (factors as any)[f].percent).join(' ')}`,
    description: `16项人格因素中，${Object.entries(factors)
      .filter(([, f]: [string, any]) => f.level === 'high')
      .slice(0, 4)
      .map(([k, f]: [string, any]) => f.name + '偏高')
      .join('、') || '各因素较为均衡'}。`,
    groups: Object.fromEntries(Object.entries(factors).map(([k, f]: [string, any]) => [k, f.sum])),
    secondary: {
      anxiety: { score: Math.round(anxietyScore / 3), label: anxietyScore / 3 < 50 ? '适应型' : '焦虑型' },
      extroversion: { score: Math.round(extroversionScore / 4), label: extroversionScore / 4 >= 50 ? '外向型' : '内向型' },
      sensitivity: { score: Math.round(sensitivityScore / 2), label: sensitivityScore / 2 >= 50 ? '感性型' : '理性型' },
    },
  };
}

export default {
  id: 'pf16',
  type: 'personality',
  name: '卡特尔 16PF 人格测验',
  shortName: '16PF',
  desc: '基于卡特尔 16 种人格因素模型的测评，全面评估 16 个独立人格维度及次元特征。',
  icon: '🎯',
  color: '#be185d',
  duration: 20,
  questionCount: 48,
  paid: false,
  price: 0,
  tag: ['人格', '性格', '16因素'],
  questionType: 'scale',

  getQuestions() {
    return QUESTIONS.map((q) => ({
      id: q.id,
      type: 'scale',
      dimension: q.factor,
      reverse: q.reverse,
      prompt: q.text,
      scale: { min: 1, max: 5, labels: ['非常不同意', '不同意', '中立', '同意', '非常同意'] },
      answer: null,
    }));
  },

  computeResult,

  buildScaleDimensionList(r: any) {
    if (!r.dimensions) return [];
    return Object.entries(r.dimensions).map(([k, dim]: [string, any]) => ({
      key: k,
      name: dim.name,
      en: dim.en || '',
      percent: dim.percent,
      level: dim.level,
      text: dim.text,
      sum: dim.sum,
    }));
  },

  buildInterpretations(r: any, groupList: any[], scaleDimensionList: any[]) {
    const sorted = [...scaleDimensionList].sort((a, b) => b.percent - a.percent);
    const highs = sorted.filter((d: any) => d.level === 'high').slice(0, 3);
    const lows = sorted.filter((d: any) => d.level === 'low').slice(0, 3);
    return [
      { title: '总体画像', text: r.description },
      { title: '突出因素', text: highs.length ? highs.map((d: any) => `${d.name}偏高(${d.percent}%)`).join('、') + '。' : '各因素较为均衡。' },
      { title: '较低因素', text: lows.length ? lows.map((d: any) => `${d.name}偏低(${d.percent}%)`).join('、') + '。' : '无明显低分因素。' },
      { title: '次元特征', text: `综合来看，你偏向${r.secondary.extroversion.label}、${r.secondary.anxiety.label}、${r.secondary.sensitivity.label}。` },
      { title: '发展建议', text: '16PF 反映人格的丰富细节，可结合职业发展与人际关系理解自身特点，在优势领域发挥特长。' },
    ];
  },

  // 维度标签：16PF 十六种人格因素
  getDimensionLabel(dim: string) {
    const labels: Record<string, string> = {
      A: '乐群性', B: '聪慧性', C: '稳定性', E: '恃强性', F: '兴奋性',
      G: '有恒性', H: '敢为性', I: '敏感性', L: '怀疑性', M: '幻想性',
      N: '世故性', O: '忧虑性', Q1: '实验性', Q2: '独立性', Q3: '自律性', Q4: '紧张性',
    };
    return labels[dim] || dim;
  },

  resultLayout: {
    primaryField: 'trait',
    primaryLabel: '人格画像',
    primarySuffix: '',
    showGroups: true,
    groupLabels: Object.fromEntries(Object.entries(FACTORS).map(([k, v]) => [k, v.name])),
    showDetail: false,
    interpretation: true,
    renderMode: 'scale',
  },
};
