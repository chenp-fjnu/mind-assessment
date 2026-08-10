/**
 * DASS-21 抑郁焦虑压力复合量表（Depression Anxiety Stress Scales 21）
 *
 * 由 Lovibond & Lovibond 编制（DASS-42 简版），共 21 题，3 个维度各 7 题：
 *   抑郁 Depression (D)：题 3, 5, 10, 13, 16, 17, 21
 *   焦虑 Anxiety   (A)：题 2, 4, 7, 9, 15, 19, 20
 *   压力 Stress    (S)：题 1, 6, 8, 11, 12, 14, 18
 *
 * 4 级评分（0-3）：
 *   0 = 不符合
 *   1 = 有些符合
 *   2 = 多数符合
 *   3 = 总是符合
 *
 * 评分：
 *   1. 各维度原始分 = 该维度 7 题分值之和（范围 0-21），无反向计分
 *   2. DASS-42 等效分 = 原始分 × 2（范围 0-42）
 *   3. 五级分级（按 DASS-42 等效分阈值）：
 *        抑郁：正常<9 / 轻度9-12 / 中度13-19 / 重度20-27 / 极重度≥28
 *        焦虑：正常<7 / 轻度7-8  / 中度9-13  / 重度14-19 / 极重度≥20
 *        压力：正常<8 / 轻度8-11 / 中度12-15 / 重度16-20 / 极重度≥21
 *
 * 分组：depression / anxiety / stress 三组
 *
 * 重要提示：本量表为自评筛查工具，不构成临床诊断。
 */

const QUESTIONS = [
  { id: 'DASS-01', dim: 'stress',    text: '我发现自己很难产生兴奋的感觉。' },
  { id: 'DASS-02', dim: 'anxiety',   text: '我感到口干舌燥。' },
  { id: 'DASS-03', dim: 'depression', text: '我似乎不能体验到任何积极的感受。' },
  { id: 'DASS-04', dim: 'anxiety',   text: '我感到呼吸困难（例如喘不上气、过度换气）。' },
  { id: 'DASS-05', dim: 'depression', text: '我发现自己很难主动去做事情。' },
  { id: 'DASS-06', dim: 'stress',    text: '我发现自己对事情反应过度。' },
  { id: 'DASS-07', dim: 'anxiety',   text: '我感到颤抖（例如腿部颤抖）。' },
  { id: 'DASS-08', dim: 'stress',    text: '我感觉自己消耗了很多精力。' },
  { id: 'DASS-09', dim: 'anxiety',   text: '我担心可能陷入恐慌的情境。' },
  { id: 'DASS-10', dim: 'depression', text: '我觉得自己对未来没有可期待的事情。' },
  { id: 'DASS-11', dim: 'stress',    text: '我发现自己变得容易急躁。' },
  { id: 'DASS-12', dim: 'stress',    text: '我感到难以放松。' },
  { id: 'DASS-13', dim: 'depression', text: '我感到沮丧和情绪低落。' },
  { id: 'DASS-14', dim: 'stress',    text: '我发现自己对任何事情都难以容忍。' },
  { id: 'DASS-15', dim: 'anxiety',   text: '我感到自己接近恐慌。' },
  { id: 'DASS-16', dim: 'depression', text: '我发现自己对什么事情都提不起兴趣。' },
  { id: 'DASS-17', dim: 'depression', text: '我感觉自己作为一个人没什么价值。' },
  { id: 'DASS-18', dim: 'stress',    text: '我发现自己变得相当容易动感情。' },
  { id: 'DASS-19', dim: 'anxiety',   text: '我感觉到心跳明显加快（即使没有运动）。' },
  { id: 'DASS-20', dim: 'anxiety',   text: '我无缘无故地感到害怕。' },
  { id: 'DASS-21', dim: 'depression', text: '我感到生活没有意义。' },
];

const SCALE_LABELS = ['不符合', '有些符合', '多数符合', '总是符合'];

const DIM_INFO: Record<string, { name: string; en: string; thresholds: number[] }> = {
  depression: { name: '抑郁', en: 'Depression', thresholds: [9, 13, 20, 28] },
  anxiety:    { name: '焦虑', en: 'Anxiety',    thresholds: [7, 9, 14, 20] },
  stress:     { name: '压力', en: 'Stress',     thresholds: [8, 12, 16, 21] },
};

// 严重度排序（用于取最突出的维度）
const LEVEL_ORDER = ['正常', '轻度', '中度', '重度', '极重度'];

function describeLevel(dimension: string, dass42: number) {
  const [mild, moderate, severe, extreme] = DIM_INFO[dimension].thresholds;
  if (dass42 < mild) return { level: '正常', color: '#16a34a' };
  if (dass42 < moderate) return { level: '轻度', color: '#ca8a04' };
  if (dass42 < severe) return { level: '中度', color: '#ea580c' };
  if (dass42 < extreme) return { level: '重度', color: '#dc2626' };
  return { level: '极重度', color: '#7c2d12' };
}

function computeResult(answers: any[], qs: any[]) {
  let answered = 0;
  const items: any[] = [];
  const dimRaw: Record<string, number> = { depression: 0, anxiety: 0, stress: 0 };

  qs.forEach((q, i) => {
    const raw = answers[i];
    if (raw == null) {
      items.push({ id: q.id, answered: false, value: 0 });
      return;
    }
    answered++;
    // DASS-21 直接使用 0-3 分值，无反向计分
    dimRaw[q.dimension] += raw;
    items.push({ id: q.id, answered: true, value: raw, score: raw });
  });

  // 各维度 × 2 = DASS-42 等效分
  const buildDim = (key: string) => {
    const raw = dimRaw[key];
    const score = raw * 2; // DASS-42 等效分（0-42）
    const info = describeLevel(key, score);
    const meta = DIM_INFO[key];
    return {
      name: meta.name,
      en: meta.en,
      raw,
      score,
      max: 42,
      level: info.level,
      color: info.color,
    };
  };

  const depression = buildDim('depression');
  const anxiety = buildDim('anxiety');
  const stress = buildDim('stress');

  const dimensions = { depression, anxiety, stress };

  // 总体：取最严重（极重度优先）的维度作为主提示
  const ranked = ['depression', 'anxiety', 'stress']
    .map((k) => ({ key: k, ...dimensions[k as keyof typeof dimensions] }))
    .sort((a, b) => LEVEL_ORDER.indexOf(b.level) - LEVEL_ORDER.indexOf(a.level));
  const worst = ranked[0];

  const trait = `焦虑${anxiety.level}·抑郁${depression.level}·压力${stress.level}`;
  const level = `${worst.level}${worst.name}倾向`;

  return {
    raw: dimRaw.depression + dimRaw.anxiety + dimRaw.stress,
    total: qs.length,
    totalStat: { correct: 0, wrong: 0, skipped: qs.length - answered },
    // 核心输出
    dimensions,
    groups: {
      depression: depression.score,
      anxiety: anxiety.score,
      stress: stress.score,
    },
    groupDetails: {
      depression: { ...depression },
      anxiety: { ...anxiety },
      stress: { ...stress },
    },
    trait,
    level,
    type: 'DASS-21',
    typeName: '情绪综合评估',
    description: `抑郁${depression.level}、焦虑${anxiety.level}、压力${stress.level}。最突出为${worst.name}（${worst.level}）。`,
    items,
  };
}

export default {
  id: 'dass21',
  type: 'mood',
  name: '情绪综合量表',
  shortName: 'DASS-21',
  desc: '基于 DASS-21 抑郁焦虑压力复合量表，同时评估抑郁、焦虑、压力三个维度，输出各维度严重度分级。',
  icon: '🎯',
  color: '#7c3aed',
  duration: 10,
  questionCount: 21,
  paid: false,
  price: 0,
  tag: ['情绪', '抑郁', '焦虑', '压力', '心理健康', '筛查'],
  questionType: 'scale',

  getQuestions() {
    return QUESTIONS.map((q) => ({
      id: q.id,
      type: 'scale',
      dimension: q.dim,
      reverse: false,
      prompt: q.text,
      scale: { min: 0, max: 3, labels: SCALE_LABELS },
      answer: null,
    }));
  },

  computeResult,

  buildGroupList(r: any, layout: any) {
    return Object.entries(r.groups).map(([k, v]: [string, any]) => {
      const detail = r.groupDetails[k];
      return {
        key: k,
        label: layout.groupLabels[k] || k,
        percent: Math.round((v / (detail?.max || 42)) * 100),
        display: `${v}·${detail?.level || ''}`,
        isScale: true,
      };
    });
  },

  buildInterpretations(r: any, groupList: any[], scaleDimensionList: any[]) {
    const d = r.groupDetails.depression;
    const a = r.groupDetails.anxiety;
    const s = r.groupDetails.stress;

    // 找到最严重与最轻的维度
    const arr = [
      { name: '抑郁', ...d },
      { name: '焦虑', ...a },
      { name: '压力', ...s },
    ].sort((x: any, y: any) => LEVEL_ORDER.indexOf(y.level) - LEVEL_ORDER.indexOf(x.level));
    const worst = arr[0];
    const best = arr[arr.length - 1];

    return [
      { title: '测评结果', text: `抑郁${d.level}（等效分 ${d.score}）、焦虑${a.level}（${a.score}）、压力${s.level}（${s.score}）。${r.description}` },
      { title: '维度分析', text: `最突出的情绪困扰为${worst.name}（${worst.level}），相对最轻的为${best.name}（${best.level}）。三个维度可同时存在，建议综合关注。` },
      { title: '分级说明', text: '各维度采用 DASS-42 等效分阈值：抑郁 9/13/20/28、焦虑 7/9/14/20、压力 8/12/16/21，依次划分为正常、轻度、中度、重度、极重度。' },
      { title: '建议', text: worst.level === '正常' ? '当前情绪状态总体良好，继续保持健康的生活方式与压力管理。' : worst.level === '轻度' ? '存在轻度情绪困扰，建议通过运动、规律作息、社交支持等方式自我调节。' : worst.level === '中度' ? '存在中度情绪困扰，建议寻求专业心理咨询师的帮助。' : '存在重度及以上情绪困扰，强烈建议尽快前往精神科或心理科就诊评估。' },
      { title: '重要提示', text: '本量表为自评筛查工具，结果仅供参考，不构成医学诊断。如情绪困扰持续或加重，请务必寻求专业帮助。' },
    ];
  },

  // 维度标签：DASS-21 三个情绪维度
  getDimensionLabel(dim: string) {
    const labels: Record<string, string> = { depression: '抑郁', anxiety: '焦虑', stress: '压力' };
    return labels[dim] || dim;
  },

  resultLayout: {
    primaryField: 'trait',
    primaryLabel: '情绪综合评估',
    primarySuffix: '',
    showGroups: true,
    groupLabels: { depression: '抑郁', anxiety: '焦虑', stress: '压力' },
    showDetail: false,
    interpretation: true,
  },
};
