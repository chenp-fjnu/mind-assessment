/**
 * PSS-10 压力知觉量表（Perceived Stress Scale，中文修订版）
 *
 * 由 Cohen 等编制，杨廷忠等翻译修订，共 10 题，5 级评分（0-4）：
 *   0 = 从不   1 = 偶尔   2 = 有时   3 = 经常   4 = 总是
 *
 * 其中第 4、5、7、8 题为反向计分（正向叙述）。
 *
 * 评分：
 *   1. 总分 = 各题分值之和（范围 0-40）
 *   2. 压力程度分级（参考中文常模）：
 *        < 14   较低压力
 *        14-26  中等压力
 *        ≥ 27   较高压力
 *
 * 重要提示：本量表为自评筛查工具，不构成临床诊断。
 */

const { scoreItem } = require('../../utils/scoring')

const QUESTIONS = [
  { id: 'PSS-01', reverse: false, text: '因为一些意料之外的事情而感到心烦意乱。' },
  { id: 'PSS-02', reverse: false, text: '感到无法掌控生活中的重要事情。' },
  { id: 'PSS-03', reverse: false, text: '感到紧张和压力。' },
  { id: 'PSS-04', reverse: true,  text: '能够成功地处理恼人的生活麻烦。' },
  { id: 'PSS-05', reverse: true,  text: '感到自己能有效地应对生活中发生的重要变化。' },
  { id: 'PSS-06', reverse: false, text: '感到自己有能力应对所有难题。' },
  { id: 'PSS-07', reverse: true,  text: '感到能掌控生活中发生的一切。' },
  { id: 'PSS-08', reverse: true,  text: '因为有超出自己控制范围的事情而恼火。' },
  { id: 'PSS-09', reverse: false, text: '感到困难的事情堆积如山，已经无法克服。' },
  { id: 'PSS-10', reverse: false, text: '感到自己有能力应付生活中的所有烦恼。' },
];

const SCALE_LABELS = ['从不', '偶尔', '有时', '经常', '总是'];

function describeSeverity(score) {
  if (score < 14) return { level: '较低压力', color: '#16a34a', desc: '你感知到的压力水平较低，状态相对轻松。' };
  if (score < 27) return { level: '中等压力', color: '#ca8a04', desc: '你正承受中等程度的压力，建议关注压力来源并适当调节。' };
  return { level: '较高压力', color: '#dc2626', desc: '你感知到的压力水平较高，长期高压可能影响身心健康，建议主动减压或寻求支持。' };
}

function computeResult(answers, qs) {
  let rawScore = 0;
  let answered = 0;
  const items = [];

  qs.forEach((q, i) => {
    const raw = answers[i];
    if (raw == null) {
      items.push({ id: q.id, answered: false, value: 0 });
      return;
    }
    answered++;
    const val = raw; // 0-4 直接使用
    const score = scoreItem(val, q); // 反向由 scoreItem 统一处理
    rawScore += score;
    items.push({ id: q.id, answered: true, value: val, score });
  });

  const severity = describeSeverity(rawScore);

  return {
    raw: rawScore,
    total: qs.length,
    totalStat: { correct: 0, wrong: 0, skipped: qs.length - answered },
    totalScore: rawScore,
    maxScore: 40,
    level: severity.level,
    levelColor: severity.color,
    type: String(rawScore),
    typeName: severity.level,
    trait: `压力评分 ${rawScore}/40`,
    description: severity.desc,
    items,
    severity,
  };
}

module.exports = {
  id: 'pss',
  type: 'stress',
  name: '压力知觉量表',
  shortName: 'PSS-10',
  desc: '基于 PSS-10 的压力知觉测评，评估近一个月你感知到的压力程度与应对感受。',
  icon: '🌪️',
  color: '#dc2626',
  duration: 5,
  questionCount: 10,
  paid: false,
  price: 0,
  tag: ['压力', '应激', '心理健康', '筛查'],
  questionType: 'scale',

  getQuestions() {
    return QUESTIONS.map((q) => ({
      id: q.id,
      type: 'scale',
      dimension: 'stress',
      reverse: q.reverse,
      prompt: q.text,
      scale: { min: 0, max: 4, labels: SCALE_LABELS },
      answer: null,
    }));
  },

  computeResult,

  buildGroupList() {
    return [];
  },

  buildInterpretations(r) {
    return [
      { title: '测评结果', text: `压力评分 ${r.totalScore}/40，${r.level}。${r.description}` },
      { title: '调节建议', text: r.totalScore < 14 ? '保持当前的生活节奏，规律运动与充足睡眠有助于维持低压力状态。' : r.totalScore < 27 ? '尝试梳理压力来源，通过时间管理、运动、倾诉等方式主动减压。' : '建议重新审视工作与生活的平衡，必要时寻求心理咨询或社会支持，避免长期高压透支身心。' },
      { title: '重要提示', text: '本量表为自评筛查工具，结果仅供参考，不构成医学诊断。' },
    ];
  },

  getDimensionLabel(dim) { return dim === 'stress' ? '压力感知' : dim; },

  resultLayout: {
    primaryField: 'totalScore',
    primaryLabel: '压力评分',
    primarySuffix: '/40',
    groupLabels: {},
    interpretation: true,
  },
};
