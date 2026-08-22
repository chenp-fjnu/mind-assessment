/**
 * SAS 焦虑自评量表（Self-Rating Anxiety Scale）
 *
 * 由 William Zung 编制，共 20 题，4 级评分：
 *   1 = 没有或很少时间
 *   2 = 少部分时间
 *   3 = 相当多时间
 *   4 = 绝大部分或全部时间
 *
 * 其中第 5、9、13、17、19 题为反向计分（正向叙述）
 *
 * 评分：
 *   1. 原始分 = 各题分值之和（范围 20-80）
 *   2. 标准分（焦虑指数） = 原始分 × 1.25 取整（范围 25-100）
 *   3. 焦虑严重度分级：
 *        < 50   无焦虑
 *        50-59  轻度焦虑
 *        60-69  中度焦虑
 *        ≥ 70   重度焦虑
 *
 * 分组（简化）：
 *   躯体症状：题 1-8   → index 0-7
 *   焦虑心境：题 9-12  → index 8-11
 *   其他症状：题 13-20 → index 12-19
 *
 * 重要提示：本量表为自评筛查工具，不构成临床诊断。
 */

const { scoreItem } = require('../../utils/scoring')

const QUESTIONS = [
  { id: 'SAS-01', reverse: false, text: '我感到比平常更紧张或着急。' },
  { id: 'SAS-02', reverse: false, text: '我无缘无故地感到害怕。' },
  { id: 'SAS-03', reverse: false, text: '我容易心烦意乱或感到惊恐。' },
  { id: 'SAS-04', reverse: false, text: '我感觉我好像要发疯。' },
  { id: 'SAS-05', reverse: true,  text: '我感觉一切都很好，不会发生什么不幸。' },
  { id: 'SAS-06', reverse: false, text: '我手脚发抖震颤。' },
  { id: 'SAS-07', reverse: false, text: '我因为头痛、颈痛和背痛而苦恼。' },
  { id: 'SAS-08', reverse: false, text: '我感到无力且容易疲劳。' },
  { id: 'SAS-09', reverse: true,  text: '我感觉心平气和，能安静坐着。' },
  { id: 'SAS-10', reverse: false, text: '我感觉到心跳得很快。' },
  { id: 'SAS-11', reverse: false, text: '我因为一阵阵头晕而苦恼。' },
  { id: 'SAS-12', reverse: false, text: '我有晕厥发作，或觉得要晕厥似的。' },
  { id: 'SAS-13', reverse: true,  text: '我呼气吸气都感到很容易。' },
  { id: 'SAS-14', reverse: false, text: '我手脚麻木和刺痛。' },
  { id: 'SAS-15', reverse: false, text: '我因为胃痛和消化不良而苦恼。' },
  { id: 'SAS-16', reverse: false, text: '我必须要频繁排尿。' },
  { id: 'SAS-17', reverse: true,  text: '我的手总是干燥温暖的。' },
  { id: 'SAS-18', reverse: false, text: '我脸红发热。' },
  { id: 'SAS-19', reverse: true,  text: '我容易入睡并且晚上睡得很好。' },
  { id: 'SAS-20', reverse: false, text: '我做噩梦。' },
];

const SCALE_LABELS = ['没有或很少', '少部分时间', '相当多时间', '绝大部分时间'];

function describeSeverity(index) {
  if (index < 50) return { level: '无焦虑', color: '#16a34a', desc: '目前未显示明显的焦虑症状，心理状态良好。' };
  if (index < 60) return { level: '轻度焦虑', color: '#ca8a04', desc: '存在轻度焦虑倾向，建议关注情绪变化，适当放松调节。' };
  if (index < 70) return { level: '中度焦虑', color: '#ea580c', desc: '存在中度焦虑症状，建议寻求专业心理咨询。' };
  return { level: '重度焦虑', color: '#dc2626', desc: '存在重度焦虑症状，强烈建议尽快就医评估。' };
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

  // 标准分（焦虑指数）= 原始分 × 1.25，取整
  const index = Math.round(rawScore * 1.25);
  const severity = describeSeverity(index);

  // 三个症状维度（简化分组）
  // 躯体症状：题 1-8   → index 0-7
  // 焦虑心境：题 9-12  → index 8-11
  // 其他症状：题 13-20 → index 12-19
  const somaticItems = [0, 1, 2, 3, 4, 5, 6, 7];
  const anxietyItems = [8, 9, 10, 11];
  const otherItems = [12, 13, 14, 15, 16, 17, 18, 19];

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
  const anxiety = sumItems(anxietyItems);
  const other = sumItems(otherItems);

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
    trait: `焦虑指数 ${index}`,
    description: severity.desc,
    // 分组
    groups: {
      somatic: somatic.sum,
      anxiety: anxiety.sum,
      other: other.sum,
    },
    groupDetails: {
      somatic: { ...somatic, name: '躯体症状', max: 32 },
      anxiety: { ...anxiety, name: '焦虑心境', max: 16 },
      other: { ...other, name: '其他症状', max: 32 },
    },
    items,
    severity,
  };
}

module.exports = {
  id: 'sas',
  type: 'mood', // 新增大类：情绪筛查
  name: '焦虑自评量表',
  shortName: 'SAS',
  desc: '基于 Zung 焦虑自评量表，评估近一周的焦虑情绪程度，输出焦虑指数与严重度分级。',
  icon: '💛',
  color: '#ea580c',
  duration: 10,
  questionCount: 20,
  paid: false,
  price: 0,
  tag: ['情绪', '焦虑', '心理健康', '筛查'],
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
      { title: '测评结果', text: `焦虑指数 ${r.index}，${r.level}。${r.description}` },
      { title: '症状分布', text: `躯体症状得分 ${r.groups.somatic}，焦虑心境得分 ${r.groups.anxiety}，其他症状得分 ${r.groups.other}。` },
      { title: '严重度说明', text: r.index < 50 ? '当前情绪状态良好，继续保持健康的生活方式。' : r.index < 60 ? '存在轻度焦虑倾向，建议通过放松训练、运动、规律作息等方式调节情绪。' : r.index < 70 ? '存在中度焦虑症状，建议寻求专业心理咨询师的帮助。' : '存在重度焦虑症状，强烈建议尽快前往精神科或心理科就诊评估。' },
      { title: '重要提示', text: '本量表为自评筛查工具，结果仅供参考，不构成医学诊断。如焦虑困扰持续或加重，请务必寻求专业帮助。' },
    ];
  },

  // 维度标签：SAS 情绪状态维度
  resultLayout: {
    primaryField: 'index',
    primaryLabel: '焦虑指数',
    primarySuffix: '',
    groupLabels: { somatic: '躯体症状', anxiety: '焦虑心境', other: '其他症状' },
    interpretation: true,
  },
};
