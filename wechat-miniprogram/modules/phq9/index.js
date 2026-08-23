/**
 * PHQ-9 抑郁症筛查量表（Patient Health Questionnaire-9）
 *
 * 基于美国精神医学学会 DSM-IV 抑郁诊断标准编制，共 9 题，4 级评分（0-3）：
 *   0 = 完全没有
 *   1 = 有几天
 *   2 = 一半以上的时间
 *   3 = 几乎每天
 *
 * 评分：
 *   1. 总分 = 各题分值之和（范围 0-27），无反向计分
 *   2. 抑郁严重度分级：
 *        0-4    无抑郁
 *        5-9    轻度抑郁
 *        10-14  中度抑郁
 *        15-19  中重度抑郁
 *        20-27  重度抑郁
 *
 * 第 9 题涉及自伤/自杀念头，结果中会给出高危提示与援助热线。
 *
 * 重要提示：本量表为自评筛查工具，不构成临床诊断。
 */

const QUESTIONS = [
  { id: 'PHQ-01', text: '做事时提不起劲或没有兴趣。' },
  { id: 'PHQ-02', text: '感到心情低落、沮丧或绝望。' },
  { id: 'PHQ-03', text: '入睡困难、睡不安稳或睡眠过多。' },
  { id: 'PHQ-04', text: '感觉疲倦或没有活力。' },
  { id: 'PHQ-05', text: '食欲不振或吃太多。' },
  { id: 'PHQ-06', text: '觉得自己很糟，或觉得自己很失败，或让自己、家人失望。' },
  { id: 'PHQ-07', text: '对事物专注有困难，例如阅读报纸或看电视时。' },
  { id: 'PHQ-08', text: '行动或说话速度缓慢到别人已经察觉？或正好相反——变得比平日更烦躁、坐立不安、动来动去。' },
  { id: 'PHQ-09', text: '有不如死掉或用某种方式伤害自己的念头。' },
];

const SCALE_LABELS = ['完全没有', '有几天', '一半以上时间', '几乎每天'];

function describeSeverity(score) {
  if (score < 5) return { level: '无抑郁', color: '#16a34a', desc: '目前未显示明显的抑郁症状，心理状态良好。' };
  if (score < 10) return { level: '轻度抑郁', color: '#ca8a04', desc: '存在轻度抑郁倾向，建议关注情绪变化，适当调节。' };
  if (score < 15) return { level: '中度抑郁', color: '#ea580c', desc: '存在中度抑郁症状，建议进一步评估并考虑寻求专业帮助。' };
  if (score < 20) return { level: '中重度抑郁', color: '#dc2626', desc: '存在中重度抑郁症状，强烈建议尽快寻求专业帮助。' };
  return { level: '重度抑郁', color: '#b91c1c', desc: '存在重度抑郁症状，务必尽快就医评估。' };
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
    score += raw;
    items.push({ id: q.id, answered: true, value: raw, score: raw });
  });

  const severity = describeSeverity(score);
  const highRisk = (items[8] && items[8].answered && items[8].value > 0);

  return {
    raw: score,
    total: qs.length,
    totalStat: { correct: 0, wrong: 0, skipped: qs.length - answered },
    score,
    totalScore: score,
    maxScore: 27,
    level: severity.level,
    levelColor: severity.color,
    type: String(score),
    typeName: severity.level,
    trait: `抑郁评分 ${score}/27`,
    description: severity.desc,
    highRisk,
    items,
    severity,
  };
}

module.exports = {
  id: 'phq9',
  type: 'mood',
  name: 'PHQ-9 抑郁筛查',
  shortName: 'PHQ-9',
  desc: '基于 DSM-IV 抑郁诊断标准的 9 题抑郁筛查，评估近两周抑郁症状严重程度。',
  icon: '🌧️',
  color: '#0891b2',
  duration: 5,
  questionCount: 9,
  paid: false,
  price: 0,
  tag: ['情绪', '抑郁', '筛查', 'DSM-IV'],
  questionType: 'scale',

  getQuestions() {
    return QUESTIONS.map((q) => ({
      id: q.id,
      type: 'scale',
      dimension: 'mood',
      reverse: false,
      prompt: q.text,
      scale: { min: 0, max: 3, labels: SCALE_LABELS },
      answer: null,
    }));
  },

  computeResult,

    getResultView(r, layout) {
    const _mkGroup = function (r, layout) {

    return [];
  
    };
    const _mkInterp = function (r, groupList, scaleDimensionList) {

    const lines = [
      { title: '测评结果', text: `抑郁评分 ${r.score}/27，${r.level}。${r.description}` },
      { title: '严重度说明', text: r.score < 5 ? '当前情绪状态良好，继续保持健康的生活方式。' : r.score < 10 ? '存在轻度抑郁倾向，建议通过运动、社交、规律作息等方式调节情绪。' : r.score < 15 ? '存在中度抑郁症状，建议寻求专业心理咨询师帮助。' : '存在中重度及以上抑郁症状，强烈建议尽快前往精神科或心理科就诊评估。' },
    ];
    if (r.highRisk) {
      lines.push({ title: '重要提示', text: '你提到了伤害自己的念头。请务必重视：全国心理援助热线 400-161-9995（24 小时）。如有紧急危险，请立即联系家人或拨打 120 / 当地急救与危机干预热线。' });
    } else {
      lines.push({ title: '重要提示', text: '本量表为自评筛查工具，结果仅供参考，不构成医学诊断。如情绪困扰持续或加重，请务必寻求专业帮助。' });
    }
    return lines;
  
    };
    const groups = _mkGroup(r, layout);
    const dims = (r && r.dimensions) ? Object.keys(r.dimensions).map((k) => { const d = r.dimensions[k]; return { key: k, name: d.name || k, percent: d.percent, text: d.text, level: d.level }; }) : [];
    const subtests = [];
    const interpretations = _mkInterp(r, groups, dims);
    const showBipolar = !!(dims[0] && dims[0].leftPercent !== undefined);
    return { groups, dims, subtests, interpretations, showBipolar };
  },resultLayout: {
    primaryField: 'score',
    primaryLabel: '抑郁评分',
    primarySuffix: '/27',
    groupLabels: {},
    interpretation: true,
  },
};
