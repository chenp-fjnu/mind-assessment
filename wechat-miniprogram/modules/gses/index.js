/**
 * GSES 一般自我效能感量表（General Self-Efficacy Scale，中文版）
 *
 * 由 Schwarzer 等编制，王才康翻译修订，共 10 题，4 级评分（1-4）：
 *   1 = 完全不正确   2 = 有点正确   3 = 多数正确   4 = 完全正确
 *
 * 评分：
 *   1. 总分 = 各题分值之和（范围 10-40），均为正向计分
 *   2. 自我效能分级：
 *        < 20   偏低
 *        20-29  中等
 *        ≥ 30   较高
 *
 * 重要提示：本量表为自评筛查工具，不构成临床诊断。
 */

const QUESTIONS = [
  { id: 'GSES-01', text: '如果我尽力去做的话，我总是能够解决问题的。' },
  { id: 'GSES-02', text: '即使别人反对我，我仍有办法取得我所要的。' },
  { id: 'GSES-03', text: '对我来说，坚持理想和达成目标是轻而易举的。' },
  { id: 'GSES-04', text: '我自信能有效地应付任何突如其来的事情。' },
  { id: 'GSES-05', text: '以我的才智，我定能应付意料之外的情况。' },
  { id: 'GSES-06', text: '如果我付出必要的努力，我一定能解决大多数的难题。' },
  { id: 'GSES-07', text: '我能冷静地面对困难，因为我信赖自己处理问题的能力。' },
  { id: 'GSES-08', text: '面对一个难题时，我通常能找到几个解决方法。' },
  { id: 'GSES-09', text: '有麻烦的时候，我通常能想到一些应付的方法。' },
  { id: 'GSES-10', text: '无论什么事在我身上发生，我都能够应付自如。' },
];

const SCALE_LABELS = ['完全不正确', '有点正确', '多数正确', '完全正确'];

function describeLevel(score) {
  if (score < 20) return { level: '偏低', color: '#ea580c', desc: '你的自我效能感偏低，面对挑战时容易犹豫或退缩，可以尝试从小目标开始积累掌控感。' };
  if (score < 30) return { level: '中等', color: '#ca8a04', desc: '你的自我效能感处于中等水平，多数情况下相信自己能应对，仍有提升空间。' };
  return { level: '较高', color: '#16a34a', desc: '你的自我效能感较高，面对困难时普遍相信自己能应对，这是很好的心理资源。' };
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
    const val = raw + 1; // 0-based → 1-4
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
    trait: `自我效能 ${score}/40`,
    description: lvl.desc,
    items,
  };
}

module.exports = {
  id: 'gses',
  type: 'self',
  name: '一般自我效能感量表',
  shortName: 'GSES',
  desc: '基于 GSES 的自我效能测评，评估你面对挑战时相信自己能应付的总体信心。',
  icon: '🔥',
  color: '#0891b2',
  duration: 5,
  questionCount: 10,
  paid: false,
  price: 0,
  tag: ['自我', '自信', '自我效能', '积极心理'],
  questionType: 'scale',

  getQuestions() {
    return QUESTIONS.map((q) => ({
      id: q.id,
      type: 'scale',
      dimension: 'self',
      reverse: false,
      prompt: q.text,
      scale: { min: 1, max: 4, labels: SCALE_LABELS },
      answer: null,
    }));
  },

  computeResult,

  buildGroupList() {
    return [];
  },

  buildInterpretations(r) {
    return [
      { title: '测评结果', text: `自我效能评分 ${r.totalScore}/40，处于${r.level}水平。${r.description}` },
      { title: '提升建议', text: r.totalScore < 20 ? '把大目标拆成可达成的小步骤，每完成一项就肯定自己，逐步积累「我能行」的经验。' : r.totalScore < 30 ? '在擅长的领域继续深耕，同时有意识地在薄弱环节练习「先行动、再调整」的应对方式。' : '善用你的信心去尝试更有挑战性的任务，并在团队中带动他人，将效能感转化为行动力。' },
      { title: '重要提示', text: '本量表为自评筛查工具，结果仅供参考，不构成医学诊断。' },
    ];
  },

  getDimensionLabel(dim) { return dim === 'self' ? '自我效能' : dim; },

  resultLayout: {
    primaryField: 'totalScore',
    primaryLabel: '自我效能',
    primarySuffix: '/40',
    showGroups: false,
    groupLabels: {},
    showDetail: false,
    interpretation: true,
  },
};
