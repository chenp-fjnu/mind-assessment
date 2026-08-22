/**
 * SES 自尊量表（Self-Esteem Scale）
 *
 * 由 Morris Rosenberg (1965) 编制，共 10 题，4 级评分：
 *   1 = 非常不符合
 *   2 = 不符合
 *   3 = 符合
 *   4 = 非常符合
 *
 * 其中第 3、5、8、9、10 题为反向计分
 *
 * 评分：
 *   1. 各题分值之和（范围 10-40）
 *   2. 分级：
 *        < 15   自尊很低
 *        15-19  自尊较低
 *        20-25  自尊正常
 *        26-34  自尊较高
 *        ≥ 35   自尊很高
 */

const { scoreItem } = require('../../utils/scoring')

const QUESTIONS = [
  { id: 'SES-01', reverse: false, text: '我感到自己是一个有价值的人，至少与其他人在同一水平上。' },
  { id: 'SES-02', reverse: false, text: '我感到我有许多好的品质。' },
  { id: 'SES-03', reverse: true,  text: '归根结底，我倾向于觉得自己是一个失败者。' },
  { id: 'SES-04', reverse: false, text: '我能像大多数人一样把事情做好。' },
  { id: 'SES-05', reverse: true,  text: '我感到自己值得自豪的地方不多。' },
  { id: 'SES-06', reverse: false, text: '我对自己持肯定态度。' },
  { id: 'SES-07', reverse: false, text: '总的来说，我对自己是满意的。' },
  { id: 'SES-08', reverse: true,  text: '我希望我能为自己赢得更多尊重。' },
  { id: 'SES-09', reverse: true,  text: '我确实时常感到自己毫无用处。' },
  { id: 'SES-10', reverse: true,  text: '我时常认为自己一无是处。' },
];

const SCALE_LABELS = ['非常不符合', '不符合', '符合', '非常符合'];

function describeLevel(score) {
  if (score < 15) return { level: '自尊很低', color: '#dc2626', desc: '自尊水平较低，可能常感自我怀疑，建议关注自我价值感。' };
  if (score < 20) return { level: '自尊较低', color: '#ea580c', desc: '自尊偏低，部分方面存在自我否定倾向。' };
  if (score < 26) return { level: '自尊正常', color: '#16a34a', desc: '自尊处于正常范围，对自我有基本正面的评价。' };
  if (score < 35) return { level: '自尊较高', color: '#2563eb', desc: '自尊水平较高，自我接纳与自我肯定良好。' };
  return { level: '自尊很高', color: '#7c3aed', desc: '自尊水平很高，对自我价值有强烈认同。' };
}

function computeResult(answers, qs) {
  let totalScore = 0;
  let answered = 0;
  const items = [];

  qs.forEach((q, i) => {
    const raw = answers[i];
    if (raw == null) {
      items.push({ id: q.id, answered: false, value: 0 });
      return;
    }
    answered++;
    const val = raw + 1; // 0/1/2/3 → 1/2/3/4
    const score = scoreItem(val, q); // 反向由 scoreItem 统一处理
    totalScore += score;
    items.push({ id: q.id, answered: true, value: val, score });
  });

  const level = describeLevel(totalScore);

  // 正向题与反向题分组
  const positiveItems = qs.map((q, i) => ({ q, i })).filter((x) => !x.q.reverse);
  const reverseItems = qs.map((q, i) => ({ q, i })).filter((x) => x.q.reverse);

  const sumItems = (list) => {
    let s = 0, n = 0;
    list.forEach(({ q, i }) => {
      if (items[i] && items[i].answered) {
        const v = items[i].value;
        s += scoreItem(v, q);
        n++;
      }
    });
    return { sum: s, avg: n ? Math.round((s / n) * 10) / 10 : 0, count: n };
  };

  const positive = sumItems(positiveItems);
  const reverse = sumItems(reverseItems);

  return {
    raw: totalScore,
    total: qs.length,
    totalStat: { correct: 0, wrong: 0, skipped: qs.length - answered },
    score: totalScore,
    level: level.level,
    levelColor: level.color,
    type: String(totalScore),
    typeName: level.level,
    trait: `自尊得分 ${totalScore}`,
    description: level.desc,
    groups: {
      positive: positive.sum,
      reverse: reverse.sum,
    },
    groupDetails: {
      positive: { ...positive, name: '正向自我评价', max: 20 },
      reverse: { ...reverse, name: '负向自我评价（反向计分）', max: 20 },
    },
    items,
    levelInfo: level,
  };
}

module.exports = {
  id: 'ses',
  type: 'self',
  name: '自尊量表',
  shortName: 'SES',
  desc: '基于 Rosenberg 自尊量表，评估整体自我价值感与自我接纳程度。',
  icon: '💪',
  color: '#0d9488',
  duration: 5,
  questionCount: 10,
  paid: false,
  price: 0,
  tag: ['自我', '自尊', '自我价值'],
  questionType: 'scale',

  getQuestions() {
    return QUESTIONS.map((q) => ({
      id: q.id,
      type: 'scale',
      dimension: 'self-esteem',
      reverse: q.reverse,
      prompt: q.text,
      scale: { min: 1, max: 4, labels: SCALE_LABELS },
      answer: null,
    }));
  },

  computeResult,

  buildGroupList(r, layout) {
    return Object.entries(r.groups).map(([k, v]) => ({
      key: k,
      label: layout.groupLabels[k] || k,
      percent: Math.round((v / (r.groupDetails[k]?.max || 20)) * 100),
      display: `${v}/${r.groupDetails[k]?.max || 20}`,
      isScale: true,
    }));
  },

  buildInterpretations(r) {
    return [
      { title: '测评结果', text: `自尊得分 ${r.score}，${r.level}。${r.description}` },
      { title: '维度分析', text: `正向自我评价得分 ${r.groups.positive}，负向自我评价（反向计分后）得分 ${r.groups.reverse}。` },
      { title: '改善建议', text: r.score < 20 ? '可通过记录自身优点、设定可达成的小目标、练习自我关怀等方式逐步提升自尊。' : r.score < 26 ? '保持积极的自我对话，继续发掘自身优势。' : '自尊状态良好，继续保持积极的自我认知。' },
      { title: '说明', text: '本量表为自评工具，结果仅供参考。如自我评价困扰持续存在，可寻求专业心理咨询。' },
    ];
  },

  getDimensionLabel(dim) { return dim === 'self-esteem' ? '自我评价' : dim; },

  resultLayout: {
    primaryField: 'score',
    primaryLabel: '自尊得分',
    primarySuffix: '',
    groupLabels: { positive: '正向自我评价', reverse: '负向自我评价' },
    interpretation: true,
  },
};
