/**
 * Big Five 大五人格测试模块（简化版 25 题）
 *
 * 五大维度（OCEAN），每维度 5 题，共 25 题：
 *   O  开放性 (Openness)          — 想象力、好奇心、创造力
 *   C  尽责性 (Conscientiousness) — 自律、组织、责任感
 *   E  外向性 (Extraversion)      — 活力、社交、积极情绪
 *   A  宜人性 (Agreeableness)     — 信任、利他、合作
 *   N  神经质 (Neuroticism)       — 情绪波动、焦虑、敏感
 *
 * 每题为 5 级量表：1=非常不同意 ... 5=非常同意
 * 部分题目反向计分。
 */

const { computeScaleScores } = require('../../utils/scale-scoring');

const DIMENSIONS = {
  O: { name: '开放性', en: 'Openness', desc: '想象、好奇与创造', high: '富有想象力和创造力，喜欢探索新事物和新观念。', low: '务实保守，偏好传统和熟悉的方式。' },
  C: { name: '尽责性', en: 'Conscientiousness', desc: '自律、组织与责任', high: '自律、有条理、可靠，做事有计划有目标。', low: '灵活随性，不喜拘束，有时缺乏规划。' },
  E: { name: '外向性', en: 'Extraversion', desc: '活力、社交与积极', high: '热情、爱社交，从人际互动中获取能量。', low: '安静、内敛，偏好独处或小范围社交。' },
  A: { name: '宜人性', en: 'Agreeableness', desc: '信任、利他与合作', high: '友善、信任他人，乐于合作与帮助。', low: '客观、直接，更注重事实而非人情。' },
  N: { name: '神经质', en: 'Neuroticism', desc: '情绪波动与敏感', high: '情绪敏感，易焦虑或波动，体验负面情绪较多。', low: '情绪稳定，从容淡定，抗压能力较强。' },
};

const QUESTIONS = [
  // O 开放性 (5题)
  { id: 'BF-01', dim: 'O', reverse: false, text: '我喜欢思考抽象的概念和理论。' },
  { id: 'BF-02', dim: 'O', reverse: false, text: '我经常对艺术、音乐或文学有浓厚兴趣。' },
  { id: 'BF-03', dim: 'O', reverse: false, text: '我愿意尝试不寻常的新做法和新想法。' },
  { id: 'BF-04', dim: 'O', reverse: true,  text: '我认为艺术和美对我来说不太重要。' },
  { id: 'BF-05', dim: 'O', reverse: false, text: '我常思考事物的深层含义和本质。' },

  // C 尽责性 (5题)
  { id: 'BF-06', dim: 'C', reverse: false, text: '我会提前制定计划并严格执行。' },
  { id: 'BF-07', dim: 'C', reverse: false, text: '我做事有始有终，不轻易半途而废。' },
  { id: 'BF-08', dim: 'C', reverse: false, text: '我注重细节，力求把事情做好。' },
  { id: 'BF-09', dim: 'C', reverse: true,  text: '我常常把事情拖到最后才做。' },
  { id: 'BF-10', dim: 'C', reverse: true,  text: '我的生活和工作空间常常比较凌乱。' },

  // E 外向性 (5题)
  { id: 'BF-11', dim: 'E', reverse: false, text: '我在人群中感到充满活力。' },
  { id: 'BF-12', dim: 'E', reverse: false, text: '我乐于主动发起对话和活动。' },
  { id: 'BF-13', dim: 'E', reverse: false, text: '我通常是个乐观积极的人。' },
  { id: 'BF-14', dim: 'E', reverse: true,  text: '我倾向于沉默，不太主动说话。' },
  { id: 'BF-15', dim: 'E', reverse: true,  text: '大型聚会让我感到疲惫而非兴奋。' },

  // A 宜人性 (5题)
  { id: 'BF-16', dim: 'A', reverse: false, text: '我容易信任别人的善意。' },
  { id: 'BF-17', dim: 'A', reverse: false, text: '我乐于帮助他人，即使要付出代价。' },
  { id: 'BF-18', dim: 'A', reverse: false, text: '遇到冲突时我倾向于妥协和让步。' },
  { id: 'BF-19', dim: 'A', reverse: true,  text: '我有时觉得别人在针对我。' },
  { id: 'BF-20', dim: 'A', reverse: true,  text: '与人争论时我会据理力争，不留情面。' },

  // N 神经质 (5题)
  { id: 'BF-21', dim: 'N', reverse: false, text: '我经常感到紧张或焦虑。' },
  { id: 'BF-22', dim: 'N', reverse: false, text: '我的情绪容易波动起伏。' },
  { id: 'BF-23', dim: 'N', reverse: false, text: '遇到挫折时我会长时间感到低落。' },
  { id: 'BF-24', dim: 'N', reverse: true,  text: '我通常能平静地应对压力。' },
  { id: 'BF-25', dim: 'N', reverse: true,  text: '我很少感到沮丧或忧郁。' },
];

function computeResult(answers, qs) {
  const dims = computeScaleScores(answers, qs, DIMENSIONS, {
    min: 1, max: 5, highThreshold: 70, lowThreshold: 30, defaultVal: 3,
  });

  return {
    dimensions: dims,
    raw: Object.values(dims).reduce((a, d) => a + d.sum, 0),
    total: qs.length,
    totalStat: { correct: 0, wrong: 0, skipped: answers.filter(a => a == null).length },
    type: Object.keys(dims).map(d => dims[d].level === 'high' ? d : (dims[d].level === 'low' ? d.toLowerCase() : d + '=')).join(''),
    typeName: '五维人格画像',
    trait: `O${dims.O.percent}% C${dims.C.percent}% E${dims.E.percent}% A${dims.A.percent}% N${dims.N.percent}%`,
    description: `开放性${dims.O.percent}%、尽责性${dims.C.percent}%、外向性${dims.E.percent}%、宜人性${dims.A.percent}%、神经质${dims.N.percent}%。`,
    groups: {
      O: dims.O.sum, C: dims.C.sum, E: dims.E.sum, A: dims.A.sum, N: dims.N.sum,
    },
  };
}

module.exports = {
  id: 'big5',
  type: 'personality',
  name: '大五人格测试',
  shortName: 'Big Five',
  desc: '基于 OCEAN 五因素模型的人格测评，评估开放性、尽责性、外向性、宜人性、神经质五个维度。',
  icon: '🌟',
  color: '#0891b2',
  duration: 10,
  questionCount: 25,
  paid: false,
  price: 0,
  tag: ['人格', '性格', 'OCEAN'],
  questionType: 'scale',

  getQuestions() {
    return QUESTIONS.map((q) => ({
      id: q.id,
      type: 'scale',
      dimension: q.dim,
      reverse: q.reverse,
      prompt: q.text,
      scale: { min: 1, max: 5, labels: ['非常不同意', '不同意', '中立', '同意', '非常同意'] },
      answer: null,
    }));
  },

  computeResult,

  buildScaleDimensionList(r) {
    if (!r.dimensions) return [];
    return Object.entries(r.dimensions).map(([k, dim]) => ({
      key: k,
      name: dim.name,
      en: dim.en || '',
      percent: dim.percent,
      level: dim.level,
      text: dim.text,
      sum: dim.sum,
    }));
  },

  buildInterpretations(r, groupList, scaleDimensionList) {
    const sorted = [...scaleDimensionList].sort((a, b) => b.percent - a.percent);
    const top = sorted[0];
    const bottom = sorted[sorted.length - 1];
    return [
      { title: '总体画像', text: r.description },
      { title: '突出特质', text: `${top.name}得分最高（${top.percent}%），${top.text}` },
      { title: '较低维度', text: `${bottom.name}得分较低（${bottom.percent}%），${bottom.text}` },
      { title: '发展建议', text: '大五人格各维度无好坏之分，了解自身特点有助于职业选择、人际沟通与自我成长。可在低分维度适当拓展。' },
    ];
  },

  // 维度标签：大五人格五大维度
  getDimensionLabel(dim) {
    const labels = { O: '开放性', C: '尽责性', E: '外向性', A: '宜人性', N: '神经质' };
    return labels[dim] || dim;
  },

  resultLayout: {
    primaryField: 'trait',
    primaryLabel: '人格画像',
    primarySuffix: '',
    showGroups: true,
    groupLabels: { O: '开放性', C: '尽责性', E: '外向性', A: '宜人性', N: '神经质' },
    showDetail: false,
    interpretation: true,
    renderMode: 'scale',
  },
};
