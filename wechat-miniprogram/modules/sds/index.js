/**
 * SDS 抑郁自评量表（Self-Rating Depression Scale）
 *
 * 由 William Zung 编制，共 20 题，4 级评分：
 *   1 = 没有或很少时间
 *   2 = 少部分时间
 *   3 = 相当多时间
 *   4 = 绝大部分或全部时间
 *
 * 其中第 2、5、6、11、12、14、16、17、18、20 题为反向计分（正向叙述）
 *
 * 评分：
 *   1. 原始分 = 各题分值之和（范围 20-80）
 *   2. 标准分（抑郁指数） = 原始分 × 1.25 取整（范围 25-100）
 *   3. 抑郁严重度分级：
 *        < 50   无抑郁
 *        50-59  轻度抑郁
 *        60-69  中度抑郁
 *        ≥ 70   重度抑郁
 *
 * 重要提示：本量表为自评筛查工具，不构成临床诊断。
 */

const { scoreItem } = require('../../utils/scoring')

const QUESTIONS = [
  { id: 'SDS-01', reverse: false, text: '我感到情绪沮丧、郁闷。' },
  { id: 'SDS-02', reverse: true,  text: '我感到早晨心情最好。' },
  { id: 'SDS-03', reverse: false, text: '我要哭或想哭。' },
  { id: 'SDS-04', reverse: false, text: '我夜间睡眠不好。' },
  { id: 'SDS-05', reverse: true,  text: '我吃东西像平时一样多。' },
  { id: 'SDS-06', reverse: true,  text: '我与异性密切接触时和以往一样感到愉快。' },
  { id: 'SDS-07', reverse: false, text: '我感到体重减轻。' },
  { id: 'SDS-08', reverse: false, text: '我有便秘的苦恼。' },
  { id: 'SDS-09', reverse: false, text: '我的心跳比平时快。' },
  { id: 'SDS-10', reverse: false, text: '我无故感到疲劳。' },
  { id: 'SDS-11', reverse: true,  text: '我的头脑像往常一样清楚。' },
  { id: 'SDS-12', reverse: true,  text: '我做经常做的事情没有困难。' },
  { id: 'SDS-13', reverse: false, text: '我感到不安，心情难以平静。' },
  { id: 'SDS-14', reverse: true,  text: '我对未来抱有希望。' },
  { id: 'SDS-15', reverse: false, text: '我比平时更容易生气。' },
  { id: 'SDS-16', reverse: true,  text: '我觉得决定做什么很容易。' },
  { id: 'SDS-17', reverse: true,  text: '我感到自己是有用和不可缺少的人。' },
  { id: 'SDS-18', reverse: true,  text: '我的生活很有意义。' },
  { id: 'SDS-19', reverse: false, text: '假若我死了别人会过得更好。' },
  { id: 'SDS-20', reverse: true,  text: '我仍旧喜爱自己平时喜爱的东西。' },
];

const SCALE_LABELS = ['没有或很少', '少部分时间', '相当多时间', '绝大部分时间'];

function describeSeverity(index) {
  if (index < 50) return { level: '无抑郁', color: '#16a34a', desc: '目前未显示明显的抑郁症状，心理状态良好。' };
  if (index < 60) return { level: '轻度抑郁', color: '#ca8a04', desc: '存在轻度抑郁倾向，建议关注情绪变化，适当调节。' };
  if (index < 70) return { level: '中度抑郁', color: '#ea580c', desc: '存在中度抑郁症状，建议寻求专业心理咨询。' };
  return { level: '重度抑郁', color: '#dc2626', desc: '存在重度抑郁症状，强烈建议尽快就医评估。' };
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
    // 4 级评分存储为 0/1/2/3（与选项索引一致），转为 1/2/3/4
    const val = raw + 1;
    const score = scoreItem(val, q); // 反向由 scoreItem 统一处理
    rawScore += score;
    items.push({ id: q.id, answered: true, value: val, score });
  });

  // 标准分（抑郁指数）= 原始分 × 1.25，取整
  const index = Math.round(rawScore * 1.25);
  const severity = describeSeverity(index);

  // 四个症状维度（简化分组）
  // 躯体症状：4,7,8,9,10  → index 3,6,7,8,9
  // 心理症状：1,3,13,15,19 → index 0,2,12,14,18
  // 正向感受：2,5,6,11,12,14,16,17,18,20 → 反向题
  // 睡眠饮食：4,5,7 → 部分重复，此处单独看
  const somaticItems = [3, 6, 7, 8, 9];
  const psychItems = [0, 2, 12, 14, 18];
  const positiveItems = [1, 4, 5, 10, 11, 13, 15, 16, 17, 19];

  const sumItems = (indices) => {
    let s = 0, n = 0;
    indices.forEach((idx) => {
      if (items[idx] && items[idx].answered) {
        const q = qs[idx];
        const v = items[idx].value;
        s += scoreItem(v, q);
        n++;
      }
    });
    return { sum: s, avg: n ? Math.round((s / n) * 10) / 10 : 0, count: n };
  };

  const somatic = sumItems(somaticItems);
  const psychological = sumItems(psychItems);
  const positive = sumItems(positiveItems);

  return {
    raw: rawScore,
    total: qs.length,
    totalStat: { correct: 0, wrong: 0, skipped: qs.length - answered },
    // 核心输出
    index,
    rawScore,
    standardScore: index,
    level: severity.level,
    levelColor: severity.color,
    type: String(index),
    typeName: severity.level,
    trait: `抑郁指数 ${index}`,
    description: severity.desc,
    // 分组
    groups: {
      somatic: somatic.sum,
      psychological: psychological.sum,
      positive: positive.sum,
    },
    groupDetails: {
      somatic: { ...somatic, name: '躯体症状', max: 20 },
      psychological: { ...psychological, name: '心理症状', max: 20 },
      positive: { ...positive, name: '正向感受', max: 40 },
    },
    items,
    severity,
  };
}

module.exports = {
  id: 'sds',
  type: 'mood', // 新增大类：情绪筛查
  name: '抑郁自评量表',
  shortName: 'SDS',
  desc: '基于 Zung 抑郁自评量表，评估近一周的抑郁情绪程度，输出抑郁指数与严重度分级。',
  icon: '💙',
  color: '#2563eb',
  duration: 10,
  questionCount: 20,
  paid: false,
  price: 0,
  tag: ['情绪', '抑郁', '心理健康', '筛查'],
  questionType: 'scale',

  getQuestions() {
    return QUESTIONS.map((q) => ({
      id: q.id,
      type: 'scale',
      dimension: 'mood',
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
      { title: '测评结果', text: `抑郁指数 ${r.index}，${r.level}。${r.description}` },
      { title: '症状分布', text: `躯体症状得分 ${r.groups.somatic}，心理症状得分 ${r.groups.psychological}，正向感受得分 ${r.groups.positive}。` },
      { title: '严重度说明', text: r.index < 50 ? '当前情绪状态良好，继续保持健康的生活方式。' : r.index < 60 ? '存在轻度抑郁倾向，建议通过运动、社交、规律作息等方式调节情绪。' : r.index < 70 ? '存在中度抑郁症状，建议寻求专业心理咨询师的帮助。' : '存在重度抑郁症状，强烈建议尽快前往精神科或心理科就诊评估。' },
      { title: '重要提示', text: '本量表为自评筛查工具，结果仅供参考，不构成医学诊断。如情绪困扰持续或加重，请务必寻求专业帮助。' },
    ];
  },

  // 维度标签：SDS 情绪状态维度
  getDimensionLabel(dim) { return dim === 'mood' ? '情绪状态' : dim; },

  resultLayout: {
    primaryField: 'index',
    primaryLabel: '抑郁指数',
    primarySuffix: '',
    groupLabels: { somatic: '躯体症状', psychological: '心理症状', positive: '正向感受' },
    interpretation: true,
  },
};
