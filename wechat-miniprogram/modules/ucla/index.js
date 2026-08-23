/**
 * UCLA 孤独量表（第三版，UCLA Loneliness Scale, Version 3，中文版）
 *
 * 由 Russell 等编制，共 20 题，4 级评分（1-4）：
 *   1 = 从不   2 = 很少   3 = 有时   4 = 经常
 *
 * 其中第 1、5、6、9、10、15、16、19 题为反向计分。
 *
 * 评分：
 *   1. 总分 = 各题分值之和（范围 20-80）
 *   2. 孤独程度分级：
 *        < 40   较低孤独
 *        40-59  中等孤独
 *        ≥ 60   较高孤独
 *
 * 重要提示：本量表为自评筛查工具，不构成临床诊断。
 */

const { scoreItem } = require('../../utils/scoring')

const QUESTIONS = [
  { id: 'UCLA-01', reverse: true,  text: '你常感到和周围的人没有共同话题。' },
  { id: 'UCLA-02', reverse: false, text: '你常感到缺少可以信赖的朋友。' },
  { id: 'UCLA-03', reverse: false, text: '你常感到无法与周围人亲近。' },
  { id: 'UCLA-04', reverse: false, text: '你常感到孤独。' },
  { id: 'UCLA-05', reverse: true,  text: '你常感到自己是群体中的一部分。' },
  { id: 'UCLA-06', reverse: true,  text: '你常感到和别人很亲近。' },
  { id: 'UCLA-07', reverse: false, text: '你常感到自己被冷落。' },
  { id: 'UCLA-08', reverse: false, text: '你常感到需要有人陪伴。' },
  { id: 'UCLA-09', reverse: true,  text: '你常感到和别人关系亲密。' },
  { id: 'UCLA-10', reverse: true,  text: '你常感到有人可以倾诉。' },
  { id: 'UCLA-11', reverse: false, text: '你常感到被孤立。' },
  { id: 'UCLA-12', reverse: false, text: '你常感到和周围人合不来。' },
  { id: 'UCLA-13', reverse: false, text: '你常感到没人真正了解你。' },
  { id: 'UCLA-14', reverse: false, text: '你常感到被排斥。' },
  { id: 'UCLA-15', reverse: true,  text: '你常感到有可依靠的人。' },
  { id: 'UCLA-16', reverse: true,  text: '你常感到自己是受欢迎的。' },
  { id: 'UCLA-17', reverse: false, text: '你常感到孤单。' },
  { id: 'UCLA-18', reverse: false, text: '你常觉得没人可以依靠。' },
  { id: 'UCLA-19', reverse: true,  text: '你常觉得有人真正关心你。' },
  { id: 'UCLA-20', reverse: false, text: '你常感到寂寞。' },
];

const SCALE_LABELS = ['从不', '很少', '有时', '经常'];

function describeLevel(score) {
  if (score < 40) return { level: '较低孤独', color: '#16a34a', desc: '你目前的社会联结感较好，孤独体验较低。' };
  if (score < 60) return { level: '中等孤独', color: '#ca8a04', desc: '你有一定程度的孤独感，可能在某些关系中感到连接不足。' };
  return { level: '较高孤独', color: '#dc2626', desc: '你体验到较高水平的孤独，建议主动拓展或深化人际联结，必要时寻求支持。' };
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
    const val = raw + 1; // 1-4
    const sc = scoreItem(val, q); // 反向由 scoreItem 统一处理
    score += sc;
    items.push({ id: q.id, answered: true, value: val, score: sc });
  });

  const lvl = describeLevel(score);

  return {
    raw: score,
    total: qs.length,
    totalStat: { correct: 0, wrong: 0, skipped: qs.length - answered },
    totalScore: score,
    maxScore: 80,
    level: lvl.level,
    levelColor: lvl.color,
    type: String(score),
    typeName: lvl.level,
    trait: `孤独评分 ${score}/80`,
    description: lvl.desc,
    items,
  };
}

module.exports = {
  id: 'ucla',
  type: 'social',
  name: 'UCLA 孤独量表',
  shortName: 'UCLA',
  desc: '基于 UCLA 第三版的孤独感测评，评估你近期的社会联结与孤独体验。',
  icon: '🌫️',
  color: '#7c3aed',
  duration: 6,
  questionCount: 20,
  paid: false,
  price: 0,
  tag: ['社交', '孤独', '关系', '心理健康'],
  questionType: 'scale',

  getQuestions() {
    return QUESTIONS.map((q) => ({
      id: q.id,
      type: 'scale',
      dimension: 'social',
      reverse: q.reverse,
      prompt: q.text,
      scale: { min: 1, max: 4, labels: SCALE_LABELS },
      answer: null,
    }));
  },

  computeResult,

    getResultView(r, layout) {
    const _mkGroup = function (r, layout) {

    return [];
  
    };
    const _mkInterp = function (r, groupList, scaleDimensionList) {

    return [
      { title: '测评结果', text: `孤独评分 ${r.totalScore}/80，处于${r.level}水平。${r.description}` },
      { title: '联结建议', text: r.totalScore < 40 ? '保持并经营好现有关系，适度参与感兴趣的社群活动即可。' : r.totalScore < 60 ? '可以尝试主动联系旧友、加入共同兴趣的圈子，增加有质量的互动。' : '孤独感较高时，规律的人际接触很重要；若持续困扰，建议寻求心理咨询支持。' },
      { title: '重要提示', text: '本量表为自评筛查工具，结果仅供参考，不构成医学诊断。' },
    ];
  
    };
    const groups = _mkGroup(r, layout);
    const dims = (r && r.dimensions) ? Object.keys(r.dimensions).map((k) => { const d = r.dimensions[k]; return { key: k, name: d.name || k, percent: d.percent, text: d.text, level: d.level }; }) : [];
    const subtests = [];
    const interpretations = _mkInterp(r, groups, dims);
    const showBipolar = !!(dims[0] && dims[0].leftPercent !== undefined);
    return { groups, dims, subtests, interpretations, showBipolar };
  },resultLayout: {
    primaryField: 'totalScore',
    primaryLabel: '孤独评分',
    primarySuffix: '/80',
    groupLabels: {},
    interpretation: true,
  },
};
