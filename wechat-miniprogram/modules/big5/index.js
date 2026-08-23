/**
 * Big Five 大五人格测试模块（IPIP-50 国际人格项目库 50 题）
 *
 * 采用 Goldberg (1992) 的 IPIP Big-Five Factor Markers（公开领域/public domain，
 * 可自由使用与翻译），每维度 10 题，共 50 题：
 *   O  开放性/智力与想象 (Intellect or Imagination) — 想象力、抽象思维、好奇心
 *   C  尽责性 (Conscientiousness) — 自律、组织、责任感
 *   E  外向性 (Extraversion)      — 活力、社交、积极情绪
 *   A  宜人性 (Agreeableness)     — 信任、利他、合作
 *   N  情绪稳定性 (Emotional Stability) — 冷静、抗压、少负面情绪
 *
 * 每题为 5 级量表：1=非常不同意 ... 5=非常同意
 * 部分题目反向计分（reverse:true，对应 IPIP 的 -keyed 条目）。
 *
 * 注意：IPIP 的 Factor IV 命名为 Emotional Stability（情绪稳定性），
 * 其高分代表“冷静稳定”，与常见 Neuroticism（神经质，高分=焦虑敏感）方向相反。
 * 本模块维度 N 沿用 IPIP 原始计分方向与 keying 录入，请按“情绪稳定性”理解 N 维度得分。
 * 来源：https://ipip.ori.org/newBigFive5broadKey.htm
 */

const { computeScaleScores } = require('../../utils/scale-scoring');

const DIMENSIONS = {
  O: { name: '开放性', en: 'Openness', desc: '想象、好奇与创造', high: '富有想象力和创造力，喜欢探索新事物和新观念。', low: '务实保守，偏好传统和熟悉的方式。' },
  C: { name: '尽责性', en: 'Conscientiousness', desc: '自律、组织与责任', high: '自律、有条理、可靠，做事有计划有目标。', low: '灵活随性，不喜拘束，有时缺乏规划。' },
  E: { name: '外向性', en: 'Extraversion', desc: '活力、社交与积极', high: '热情、爱社交，从人际互动中获取能量。', low: '安静、内敛，偏好独处或小范围社交。' },
  A: { name: '宜人性', en: 'Agreeableness', desc: '信任、利他与合作', high: '友善、信任他人，乐于合作与帮助。', low: '客观、直接，更注重事实而非人情。' },
  N: { name: '情绪稳定性', en: 'Emotional Stability', desc: '冷静、抗压与稳定', high: '情绪稳定，从容淡定，抗压能力较强。', low: '情绪敏感，易焦虑或波动，体验负面情绪较多。' },
};

const QUESTIONS = [
  // O 开放性 / 智力与想象 (Intellect or Imagination) — 10 题（7 +keyed, 3 -keyed）
  { id: 'BF-01', dim: 'O', reverse: false, text: '我的词汇量很丰富。' },
  { id: 'BF-02', dim: 'O', reverse: false, text: '我拥有生动的想象力。' },
  { id: 'BF-03', dim: 'O', reverse: false, text: '我常有绝妙的点子。' },
  { id: 'BF-04', dim: 'O', reverse: false, text: '我理解事物很快。' },
  { id: 'BF-05', dim: 'O', reverse: false, text: '我常使用一些艰深的词语。' },
  { id: 'BF-06', dim: 'O', reverse: false, text: '我常花时间反思事物。' },
  { id: 'BF-07', dim: 'O', reverse: false, text: '我脑子里充满各种想法。' },
  { id: 'BF-08', dim: 'O', reverse: true,  text: '我很难理解抽象的概念。' },
  { id: 'BF-09', dim: 'O', reverse: true,  text: '我对抽象的概念不感兴趣。' },
  { id: 'BF-10', dim: 'O', reverse: true,  text: '我的想象力不太好。' },

  // C 尽责性 (Conscientiousness) — 10 题（6 +keyed, 4 -keyed）
  { id: 'BF-11', dim: 'C', reverse: false, text: '我凡事都提前做好准备。' },
  { id: 'BF-12', dim: 'C', reverse: false, text: '我注重细节。' },
  { id: 'BF-13', dim: 'C', reverse: false, text: '我会立刻把杂事做完。' },
  { id: 'BF-14', dim: 'C', reverse: false, text: '我喜欢井然有序。' },
  { id: 'BF-15', dim: 'C', reverse: false, text: '我会按计划行事。' },
  { id: 'BF-16', dim: 'C', reverse: false, text: '我对自己的工作要求严格。' },
  { id: 'BF-17', dim: 'C', reverse: true,  text: '我常把随身物品随处乱放。' },
  { id: 'BF-18', dim: 'C', reverse: true,  text: '我常把事情弄得一团糟。' },
  { id: 'BF-19', dim: 'C', reverse: true,  text: '我常忘记把东西放回原处。' },
  { id: 'BF-20', dim: 'C', reverse: true,  text: '我常逃避自己的职责。' },

  // E 外向性 (Extraversion) — 10 题（5 +keyed, 5 -keyed）
  { id: 'BF-21', dim: 'E', reverse: false, text: '我是聚会中的灵魂人物。' },
  { id: 'BF-22', dim: 'E', reverse: false, text: '在人群中我感到自在。' },
  { id: 'BF-23', dim: 'E', reverse: false, text: '我会主动发起对话。' },
  { id: 'BF-24', dim: 'E', reverse: false, text: '在聚会上我会和许多不同的人交谈。' },
  { id: 'BF-25', dim: 'E', reverse: false, text: '我不介意成为众人关注的焦点。' },
  { id: 'BF-26', dim: 'E', reverse: true,  text: '我不怎么爱说话。' },
  { id: 'BF-27', dim: 'E', reverse: true,  text: '我习惯待在不显眼的位置。' },
  { id: 'BF-28', dim: 'E', reverse: true,  text: '我很少有什么可说的。' },
  { id: 'BF-29', dim: 'E', reverse: true,  text: '我不喜欢成为别人注意的焦点。' },
  { id: 'BF-30', dim: 'E', reverse: true,  text: '在陌生人面前我很安静。' },

  // A 宜人性 (Agreeableness) — 10 题（6 +keyed, 4 -keyed）
  { id: 'BF-31', dim: 'A', reverse: false, text: '我对他人感兴趣。' },
  { id: 'BF-32', dim: 'A', reverse: false, text: '我能体谅他人的感受。' },
  { id: 'BF-33', dim: 'A', reverse: false, text: '我心肠很软。' },
  { id: 'BF-34', dim: 'A', reverse: false, text: '我愿意抽出时间帮助他人。' },
  { id: 'BF-35', dim: 'A', reverse: false, text: '我能感受到他人的情绪。' },
  { id: 'BF-36', dim: 'A', reverse: false, text: '我能让别人感到轻松自在。' },
  { id: 'BF-37', dim: 'A', reverse: true,  text: '我对别人其实不太感兴趣。' },
  { id: 'BF-38', dim: 'A', reverse: true,  text: '我会出言羞辱别人。' },
  { id: 'BF-39', dim: 'A', reverse: true,  text: '我对别人的烦恼不感兴趣。' },
  { id: 'BF-40', dim: 'A', reverse: true,  text: '我很少关心别人。' },

  // N 情绪稳定性 (Emotional Stability) — 10 题（2 +keyed, 8 -keyed）
  // 注：IPIP 此因子为"情绪稳定性"，高分=冷静稳定；与 Neuroticism 方向相反。
  { id: 'BF-41', dim: 'N', reverse: false, text: '大多数时候我都很放松。' },
  { id: 'BF-42', dim: 'N', reverse: false, text: '我很少感到沮丧。' },
  { id: 'BF-43', dim: 'N', reverse: true,  text: '我很容易感到压力。' },
  { id: 'BF-44', dim: 'N', reverse: true,  text: '我常为各种事情担忧。' },
  { id: 'BF-45', dim: 'N', reverse: true,  text: '我很容易心烦意乱。' },
  { id: 'BF-46', dim: 'N', reverse: true,  text: '我很容易难过或心烦。' },
  { id: 'BF-47', dim: 'N', reverse: true,  text: '我的情绪变化很大。' },
  { id: 'BF-48', dim: 'N', reverse: true,  text: '我经常情绪起伏不定。' },
  { id: 'BF-49', dim: 'N', reverse: true,  text: '我很容易被激怒。' },
  { id: 'BF-50', dim: 'N', reverse: true,  text: '我经常感到沮丧。' },
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
  reference: "Goldberg, L.R. — IPIP-50 大五人格量表（OCEAN 五因素模型）",
  scoring: "0–5 Likert 累加法，按维度 T 分／百分位常模",
  icon: '🌟',
  color: '#0891b2',
  duration: 10,
  questionCount: 50,
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

    getResultView(r, layout) {
    const _mkScaleDim = function (r) {

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
  
    };
    const _mkInterp = function (r, groupList, scaleDimensionList) {

    const sorted = [...scaleDimensionList].sort((a, b) => b.percent - a.percent);
    const top = sorted[0];
    const bottom = sorted[sorted.length - 1];
    return [
      { title: '总体画像', text: r.description },
      { title: '突出特质', text: `${top.name}得分最高（${top.percent}%），${top.text}` },
      { title: '较低维度', text: `${bottom.name}得分较低（${bottom.percent}%），${bottom.text}` },
      { title: '发展建议', text: '大五人格各维度无好坏之分，了解自身特点有助于职业选择、人际沟通与自我成长。可在低分维度适当拓展。' },
    ];
  
    };
    const groups = [];
    const dims = _mkScaleDim(r);
    const subtests = [];
    const interpretations = _mkInterp(r, groups, dims);
    const showBipolar = !!(dims[0] && dims[0].leftPercent !== undefined);
    return { groups, dims, subtests, interpretations, showBipolar };
  },// 维度标签：大五人格五大维度
  resultLayout: {
    primaryField: 'trait',
    primaryLabel: '人格画像',
    primarySuffix: '',
    groupLabels: { O: '开放性', C: '尽责性', E: '外向性', A: '宜人性', N: '神经质' },
    interpretation: true,
    renderMode: 'scale',
  },
};
