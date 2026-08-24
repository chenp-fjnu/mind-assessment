const { mapDimensions } = require('../../utils/result-view')
/**
 * PSQI 匹兹堡睡眠质量指数（Pittsburgh Sleep Quality Index，简化自评版）
 *
 * 由 Buysse 等编制，用于评估近一个月的睡眠质量，含 7 个成分：
 *   1. 主观睡眠质量  2. 入睡时间  3. 睡眠时间
 *   4. 睡眠效率      5. 睡眠障碍  6. 催眠药物  7. 日间功能障碍
 *
 * 每题按 0-3 计分，7 个成分分之和为总分（范围 0-21）。
 *   总分 ≤ 7 睡眠质量较好；> 7 表示存在睡眠质量问题的风险。
 *
 * 说明：此为面向自用的简化自评版本，将原始条目转化为可直接勾选的分级选项，
 * 成分分与总分计算遵循 PSQI 标准规则，结果仅供参考。
 *
 * 重要提示：本量表为自评筛查工具，不构成临床诊断。
 */

// 各题选项 index 即对应 0-3 分
const NEVER = ['无', '几乎没有（<1次/周）', '有时（1-2次/周）', '经常（≥3次/周）'];
const SEV = ['没有', '轻度', '中度', '重度'];

const QUESTIONS = [
  { id: 'PSQI-01', dim: 'c1', text: '近一个月，你觉得自己的睡眠质量如何？', labels: ['很好', '较好', '较差', '很差'] },
  { id: 'PSQI-02', dim: 'c2', text: '近一个月，你通常要多长时间（从关灯到睡着）才能入睡？', labels: ['≤15 分钟', '16-30 分钟', '31-60 分钟', '>60 分钟'] },
  { id: 'PSQI-03', dim: 'c3', text: '近一个月，你每晚实际睡在床上的时间大约是多少？', labels: ['>7 小时', '6-7 小时', '5-6 小时', '<5 小时'] },
  { id: 'PSQI-04', dim: 'c4', text: '近一个月，你的睡眠效率（实际睡眠 ÷ 卧床时间）大约为？', labels: ['>85%', '75%-85%', '65%-75%', '<65%'] },
  { id: 'PSQI-05a', dim: 'c2', text: '近一个月，你因为「躺下很久才能睡着」而困扰的频率？', labels: NEVER },
  { id: 'PSQI-05b', dim: 'c5', text: '近一个月，夜间醒来或早醒的困扰程度？', labels: SEV },
  { id: 'PSQI-05c', dim: 'c5', text: '近一个月，起夜上厕所的困扰程度？', labels: SEV },
  { id: 'PSQI-05d', dim: 'c5', text: '近一个月，呼吸不畅/打鼾严重的困扰程度？', labels: SEV },
  { id: 'PSQI-05e', dim: 'c5', text: '近一个月，感觉冷或感觉热的困扰程度？', labels: SEV },
  { id: 'PSQI-05f', dim: 'c5', text: '近一个月，做噩梦的困扰程度？', labels: SEV },
  { id: 'PSQI-05g', dim: 'c5', text: '近一个月，身体疼痛不适的困扰程度？', labels: SEV },
  { id: 'PSQI-05h', dim: 'c5', text: '近一个月，其他影响睡眠的因素（如噪音、光线）的困扰程度？', labels: SEV },
  { id: 'PSQI-05i', dim: 'c5', text: '近一个月，白天困倦但无法小睡的困扰程度？', labels: SEV },
  { id: 'PSQI-06', dim: 'c6', text: '近一个月，你服用助眠药物的频率？', labels: NEVER },
  { id: 'PSQI-07', dim: 'c7', text: '近一个月，白天感到精力不足、疲倦的程度？', labels: SEV },
  { id: 'PSQI-08', dim: 'c7', text: '近一个月，你在工作/学习时难以保持清醒的频率？', labels: NEVER },
];

const COMPONENT_INFO = {
  c1: { name: '主观睡眠质量', max: 3 },
  c2: { name: '入睡时间', max: 3 },
  c3: { name: '睡眠时间', max: 3 },
  c4: { name: '睡眠效率', max: 3 },
  c5: { name: '睡眠障碍', max: 3 },
  c6: { name: '催眠药物', max: 3 },
  c7: { name: '日间功能障碍', max: 3 },
};

function bandC5(sum) {
  if (sum <= 0) return 0;
  if (sum <= 9) return 1;
  if (sum <= 18) return 2;
  return 3;
}

function computeResult(answers, qs) {
  const v = {};
  qs.forEach((q, i) => {
    const raw = answers[i];
    const dim = q.dimension;
    v[dim] = v[dim] || [];
    v[dim].push(raw == null ? 0 : raw);
  });

  const c1 = v.c1[0];
  const c2 = Math.max(v.c2[0], v.c2[1]);
  const c3 = v.c3[0];
  const c4 = v.c4[0];
  const c5 = bandC5(v.c5.reduce((a, b) => a + b, 0));
  const c6 = v.c6[0];
  const c7 = Math.max(v.c7[0], v.c7[1]);

  const comps = { c1, c2, c3, c4, c5, c6, c7 };
  const total = c1 + c2 + c3 + c4 + c5 + c6 + c7;

  const level = total <= 7
    ? { level: '睡眠质量较好', color: '#16a34a', desc: '你的睡眠质量整体较好，继续保持规律作息。' }
    : { level: '存在睡眠问题风险', color: '#dc2626', desc: '你的睡眠指数偏高，提示存在睡眠质量下降的风险，建议关注睡眠卫生或就医评估。' };

  const groups = {};
  Object.keys(comps).forEach((k) => (groups[k] = comps[k]));

  return {
    raw: total,
    total: qs.length,
    totalStat: { correct: 0, wrong: 0, skipped: 0 },
    totalScore: total,
    maxScore: 21,
    level: level.level,
    levelColor: level.color,
    type: String(total),
    typeName: level.level,
    trait: `睡眠指数 ${total}/21`,
    description: level.desc,
    components: comps,
    groups,
  };
}

module.exports = {
  id: 'psqi',
  type: 'sleep',
  name: '匹兹堡睡眠质量指数',
  shortName: 'PSQI',
  desc: '基于 PSQI 的睡眠质量测评，从 7 个维度评估你近一个月的睡眠质量。',
  reference: "Buysse, D.J. et al. (1989) — 匹兹堡睡眠质量指数（PSQI，7 个成分）",
  scoring: "19 自评+5 他评，7 成分累加成总分（0–21），常模分级",
  icon: '🌙',
  color: '#4f46e5',
  duration: 8,
  questionCount: QUESTIONS.length,
  tag: ['睡眠', '健康', '生活质量', '筛查'],
  questionType: 'scale',

  getQuestions() {
    return QUESTIONS.map((q) => ({
      id: q.id,
      type: 'scale',
      dimension: q.dim,
      reverse: false,
      prompt: q.text,
      scale: { min: 0, max: 3, labels: q.labels },
      answer: null,
    }));
  },

  computeResult,

    getResultView(r, layout) {
    const _mkGroup = function (r, layout) {

    return Object.keys(COMPONENT_INFO).map((k) => ({
      key: k,
      label: layout.groupLabels[k] || k,
      percent: Math.round((r.components[k] / COMPONENT_INFO[k].max) * 100),
      display: `${r.components[k]}/${COMPONENT_INFO[k].max}`,
      isScale: true,
    }));
  
    };
    const _mkInterp = function (r, groupList, scaleDimensionList) {

    return [
      { title: '测评结果', text: `睡眠指数 ${r.totalScore}/21，${r.level}。${r.description}` },
      { title: '成分解读', text: `主观质量 ${r.components.c1}、入睡时间 ${r.components.c2}、睡眠时间 ${r.components.c3}、睡眠效率 ${r.components.c4}、睡眠障碍 ${r.components.c5}、催眠药物 ${r.components.c6}、日间功能 ${r.components.c7}（各 0-3 分）。` },
      { title: '改善建议', text: r.totalScore <= 7 ? '保持固定的作息与睡前放松习惯即可。' : '建议减少睡前屏幕时间、规律运动、避免咖啡因与酒精；若长期失眠或影响日间功能，请到睡眠门诊或精神心理科进一步评估。' },
      { title: '重要提示', text: '本量表为自评筛查工具，结果仅供参考，不构成医学诊断。' },
    ];
  
    };
    const groups = _mkGroup(r, layout);
    const dims = mapDimensions(r.dimensions);
    const subtests = [];
    const interpretations = _mkInterp(r, groups, dims);
    const showBipolar = !!(dims[0] && dims[0].leftPercent !== undefined);
    return { groups, dims, subtests, interpretations, showBipolar };
  },resultLayout: {
    primaryField: 'totalScore',
    primaryLabel: '睡眠指数',
    primarySuffix: '/21',
    groupLabels: { c1: '主观质量', c2: '入睡时间', c3: '睡眠时间', c4: '睡眠效率', c5: '睡眠障碍', c6: '催眠药物', c7: '日间功能' },
    interpretation: true,
  },
};
