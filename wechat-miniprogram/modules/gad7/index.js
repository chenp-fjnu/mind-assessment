/**
 * GAD-7 广泛性焦虑量表（Generalized Anxiety Disorder 7-item Scale）
 *
 * 由 Spitzer 等编制，共 7 题，4 级评分（0-3）：
 *   0 = 完全没有
 *   1 = 有几天
 *   2 = 一半以上时间
 *   3 = 几乎每天
 *
 * 评分：
 *   1. 总分 = 各题分值之和（范围 0-21），无反向计分
 *   2. 焦虑严重度分级：
 *        0-4   无焦虑
 *        5-9   轻度焦虑
 *        10-14 中度焦虑
 *        15-21 重度焦虑
 *
 * 本量表无分组维度。
 *
 * 重要提示：本量表为自评筛查工具，不构成临床诊断。
 */

const QUESTIONS = [
  { id: 'GAD-01', text: '感觉紧张、不安或烦躁。' },
  { id: 'GAD-02', text: '不能停止或控制担忧。' },
  { id: 'GAD-03', text: '对各种各样的事情担忧过多。' },
  { id: 'GAD-04', text: '很难放松下来。' },
  { id: 'GAD-05', text: '坐立不安，以至于难以静坐。' },
  { id: 'GAD-06', text: '变得容易烦恼或易激惹。' },
  { id: 'GAD-07', text: '感到害怕，好像有可怕的事情会发生。' },
];

const SCALE_LABELS = ['完全没有', '有几天', '一半以上时间', '几乎每天'];

function describeSeverity(score) {
  if (score < 5) return { level: '无焦虑', color: '#16a34a', desc: '目前未显示明显的广泛性焦虑症状，心理状态良好。' };
  if (score < 10) return { level: '轻度焦虑', color: '#ca8a04', desc: '存在轻度焦虑倾向，建议关注情绪变化，适当放松调节。' };
  if (score < 15) return { level: '中度焦虑', color: '#ea580c', desc: '存在中度焦虑症状，建议进一步评估并考虑寻求专业帮助。' };
  return { level: '重度焦虑', color: '#dc2626', desc: '存在重度焦虑症状，强烈建议尽快就医评估。' };
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
    // GAD-7 直接使用 0-3 分值，无需转换为 1-4
    score += raw;
    items.push({ id: q.id, answered: true, value: raw, score: raw });
  });

  const severity = describeSeverity(score);

  return {
    raw: score,
    total: qs.length,
    totalStat: { correct: 0, wrong: 0, skipped: qs.length - answered },
    // 核心输出
    score,
    totalScore: score,
    maxScore: 21,
    level: severity.level,
    levelColor: severity.color,
    type: String(score),
    typeName: severity.level,
    trait: `焦虑评分 ${score}/21`,
    description: severity.desc,
    items,
    severity,
  };
}

module.exports = {
  id: 'gad7',
  type: 'mood', // 情绪筛查
  name: '广泛性焦虑量表',
  shortName: 'GAD-7',
  desc: '基于 GAD-7 广泛性焦虑量表，评估近两周的广泛性焦虑程度，输出总分与严重度分级。',
  icon: '⚡',
  color: '#f59e0b',
  duration: 5,
  questionCount: 7,
  paid: false,
  price: 0,
  tag: ['情绪', '焦虑', '心理健康', '筛查'],
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

  // GAD-7 无分组维度，返回空数组
  buildGroupList() {
    return [];
  },

  buildInterpretations(r) {
    return [
      { title: '测评结果', text: `焦虑评分 ${r.score}/21，${r.level}。${r.description}` },
      { title: '严重度说明', text: r.score < 5 ? '当前焦虑水平较低，情绪状态良好。' : r.score < 10 ? '存在轻度焦虑，建议通过放松训练、规律运动、充足睡眠等方式自我调节。' : r.score < 15 ? '存在中度焦虑，建议进一步评估，必要时寻求心理咨询师帮助。' : '存在重度焦虑，强烈建议尽快前往精神科或心理科就诊评估。' },
      { title: '重要提示', text: '本量表为自评筛查工具，结果仅供参考，不构成医学诊断。如焦虑困扰持续或加重，请务必寻求专业帮助。' },
    ];
  },

  // 维度标签：GAD-7 情绪状态维度
  resultLayout: {
    primaryField: 'score',
    primaryLabel: '焦虑评分',
    primarySuffix: '',
    groupLabels: {},
    interpretation: true,
  },
};
