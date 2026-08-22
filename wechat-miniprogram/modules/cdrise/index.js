/**
 * CD-RISC-10 心理韧性量表（Connor-Davidson Resilience Scale，简版）
 *
 * 由 Connor 与 Davidson 编制，共 10 题，5 级评分（0-4）：
 *   0 = 从来不   1 = 很少   2 = 有时   3 = 经常   4 = 几乎总是
 *
 * 评分：
 *   1. 总分 = 各题分值之和（范围 0-40），均为正向计分
 *   2. 心理韧性分级：
 *        < 20   偏低
 *        20-29  中等
 *        ≥ 30   较高
 *
 * 重要提示：本量表为自评筛查工具，不构成临床诊断。
 */

const QUESTIONS = [
  { id: 'CDR-01', text: '我能很好地适应变化。' },
  { id: 'CDR-02', text: '我能够应对任何发生的事情。' },
  { id: 'CDR-03', text: '我能在压力下保持冷静。' },
  { id: 'CDR-04', text: '我能从挫折或困难中恢复过来。' },
  { id: 'CDR-05', text: '我相信自己能处理好出现的难题。' },
  { id: 'CDR-06', text: '在生病、困难或压力之下，我仍能保持积极态度。' },
  { id: 'CDR-07', text: '我知道去哪里寻求需要的帮助。' },
  { id: 'CDR-08', text: '在压力下，我仍能集中注意力把事情做好。' },
  { id: 'CDR-09', text: '我不轻易被失败打倒。' },
  { id: 'CDR-10', text: '在困境中，我仍能做出明智的决定。' },
];

const SCALE_LABELS = ['从来不', '很少', '有时', '经常', '几乎总是'];

function describeLevel(score) {
  if (score < 20) return { level: '偏低', color: '#ea580c', desc: '你的心理韧性偏低，面对压力或挫折时容易受较大影响，可以有意识地练习复原力。' };
  if (score < 30) return { level: '中等', color: '#ca8a04', desc: '你的心理韧性处于中等水平，多数时候能扛住压力，仍有提升空间。' };
  return { level: '较高', color: '#16a34a', desc: '你的心理韧性较高，面对逆境时普遍能较快恢复，这是重要的心理资本。' };
}

function computeResult(answers, qs) {
  let score = 0;
  let answered = 0;
  const items = [];

  qs.forEach((q, i) => {
    const raw = answers[i];
    if (raw == null) {
      items.push({ id: q.id, answered: false, value: 0 });
      return;
    }
    answered++;
    const val = raw; // 0-4
    score += val;
    items.push({ id: q.id, answered: true, value: val, score: val });
  });

  const lvl = describeLevel(score);

  return {
    raw: score,
    total: qs.length,
    totalStat: { correct: 0, wrong: 0, skipped: qs.length - answered },
    totalScore: score,
    maxScore: 40,
    level: lvl.level,
    levelColor: lvl.color,
    type: String(score),
    typeName: lvl.level,
    trait: `韧性评分 ${score}/40`,
    description: lvl.desc,
    items,
  };
}

module.exports = {
  id: 'cdrise',
  type: 'wellbeing',
  name: '心理韧性量表',
  shortName: 'CD-RISC-10',
  desc: '基于 CD-RISC 简版的心理韧性测评，评估你面对压力与逆境时的复原能力。',
  icon: '🌱',
  color: '#059669',
  duration: 5,
  questionCount: 10,
  paid: false,
  price: 0,
  tag: ['积极心理', '韧性', '抗压', '自我成长'],
  questionType: 'scale',

  getQuestions() {
    return QUESTIONS.map((q) => ({
      id: q.id,
      type: 'scale',
      dimension: 'wellbeing',
      reverse: false,
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
      { title: '测评结果', text: `心理韧性评分 ${r.totalScore}/40，处于${r.level}水平。${r.description}` },
      { title: '提升建议', text: r.totalScore < 20 ? '从规律的睡眠、运动与冥想开始建立稳定的身心基础，遇到挫折时给自己恢复的时间。' : r.totalScore < 30 ? '在压力情境中练习「暂停—重新评估—行动」的应对节奏，并经营好支持性人际圈。' : '把你的韧性转化为支持他人的力量，同时留意长期高压下的耗竭，保持自我关怀。' },
      { title: '重要提示', text: '本量表为自评筛查工具，结果仅供参考，不构成医学诊断。' },
    ];
  },

  resultLayout: {
    primaryField: 'totalScore',
    primaryLabel: '韧性评分',
    primarySuffix: '/40',
    groupLabels: {},
    interpretation: true,
  },
};
