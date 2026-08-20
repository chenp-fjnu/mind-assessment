/**
 * 韦氏成人智力测验模块（简化版 WAIS-Lite）
 *
 * 完整 WAIS-IV 含 15 个分测验，此处简化为 6 个核心子测验，每个 5 题，共 30 题：
 *   言语类：
 *     - 词汇（Vocabulary）：解释词语含义
 *     - 相似性（Similarities）：找出共同点
 *     - 算术（Arithmetic）：心算应用题
 *   操作类：
 *     - 积木（Block Design）：选匹配图案
 *     - 矩阵（Matrix Reasoning）：图形规律
 *     - 数字广度（Digit Span）：数字序列
 *
 * 评分：每题 0-2 分，计算各分测验量表分（简化），
 *       言语智商 VIQ、操作智商 PIQ、总智商 FSIQ（M=100, SD=15）
 */

// 积木题候选图形构造辅助
const R = '#dc2626'
const W = '#ffffff'
const B = '#2563eb'
const G = '#16a34a'
const Y = '#d97706'
function sq(color) {
  return { bg: null, shapes: [{ type: 'square', size: 80, color: color, fill: 'solid', rotation: 0, count: 1 }] }
}
function tri(color) {
  return { bg: null, shapes: [{ type: 'triangle', size: 80, color: color, fill: 'solid', rotation: 0, count: 1 }] }
}
function g2(a, b, c, d) {
  return [[a, b], [c, d]]
}

const QUESTIONS = [
  // ===== 词汇 Vocabulary (5题) =====
  { id: 'WCH-01', subtest: '词汇', domain: 'verbal', text: '"苹果"是什么？',
    options: ['一种水果', '一个品牌', '一种颜色', '一部电影'], answer: 0, maxScore: 2 },
  { id: 'WCH-02', subtest: '词汇', domain: 'verbal', text: '"勇敢"的意思最接近：',
    options: ['鲁莽', '面对危险不退缩', '力气大', '聪明'], answer: 1, maxScore: 2 },
  { id: 'WCH-03', subtest: '词汇', domain: 'verbal', text: '"通货膨胀"指：',
    options: ['物价持续上涨货币贬值', '商品变便宜', '人口增加', '经济衰退'], answer: 0, maxScore: 2 },
  { id: 'WCH-04', subtest: '词汇', domain: 'verbal', text: '"谦虚"的意思是：',
    options: ['自卑', '不自大、肯接受意见', '害羞', '沉默寡言'], answer: 1, maxScore: 2 },
  { id: 'WCH-05', subtest: '词汇', domain: 'verbal', text: '"可持续发展"强调：',
    options: ['短期增长', '既满足当代又不损害后代', '高速发展', '技术进步'], answer: 1, maxScore: 2 },

  // ===== 相似性 Similarities (5题) =====
  { id: 'WCH-06', subtest: '相似性', domain: 'verbal', text: '狗和猫的相似之处是：',
    options: ['都是植物', '都是哺乳动物', '都会飞', '都生活在水里'], answer: 1, maxScore: 2 },
  { id: 'WCH-07', subtest: '相似性', domain: 'verbal', text: '书和电影的相似之处是：',
    options: ['都是食物', '都能承载故事与信息', '都需要电', '都是交通工具'], answer: 1, maxScore: 2 },
  { id: 'WCH-08', subtest: '相似性', domain: 'verbal', text: '法官和裁判的相似之处是：',
    options: ['都穿黑衣', '都依据规则做出裁决', '都是运动员', '都在医院工作'], answer: 1, maxScore: 2 },
  { id: 'WCH-09', subtest: '相似性', domain: 'verbal', text: '望远镜和显微镜的相似之处是：',
    options: ['都用于放大观察远/微小物体', '都是武器', '都用于烹饪', '都是交通工具'], answer: 0, maxScore: 2 },
  { id: 'WCH-10', subtest: '相似性', domain: 'verbal', text: '愤怒和悲伤的相似之处是：',
    options: ['都是情绪', '都是颜色', '都是天气', '都是食物'], answer: 0, maxScore: 2 },

  // ===== 算术 Arithmetic (5题) =====
  { id: 'WCH-11', subtest: '算术', domain: 'verbal', text: '3 本书各 25 元，共多少元？',
    options: ['60', '75', '80', '50'], answer: 1, maxScore: 2 },
  { id: 'WCH-12', subtest: '算术', domain: 'verbal', text: '从 100 减去 37 等于？',
    options: ['63', '73', '67', '53'], answer: 0, maxScore: 2 },
  { id: 'WCH-13', subtest: '算术', domain: 'verbal', text: '一件衣服打 8 折后 160 元，原价多少？',
    options: ['180', '200', '220', '128'], answer: 1, maxScore: 2 },
  { id: 'WCH-14', subtest: '算术', domain: 'verbal', text: '若 5x = 45，则 x = ?',
    options: ['7', '8', '9', '10'], answer: 2, maxScore: 2 },
  { id: 'WCH-15', subtest: '算术', domain: 'verbal', text: '一个数列 2,4,8,16,? 下一个是？',
    options: ['20', '24', '32', '18'], answer: 2, maxScore: 2 },

  // ===== 积木 Block Design (5题) - 用图形矩阵表示 =====
  // 真实候选图形数据：candidates[answer] 即为与目标一致的图案，其余为同主题干扰项
  { id: 'WCH-16', subtest: '积木', domain: 'performance', text: '哪个选项能拼出目标图案？（红白方块组合）',
    options: ['图案A', '图案B', '图案C', '图案D'], answer: 0, maxScore: 2,
    matrix: [[sq(R), sq(W)], [sq(W), sq(R)]],
    targetPattern: 'red-white-checker',
    candidates: [g2(sq(R), sq(W), sq(W), sq(R)), g2(sq(R), sq(R), sq(W), sq(W)), g2(sq(W), sq(W), sq(R), sq(R)), g2(sq(R), sq(W), sq(R), sq(W))] },
  { id: 'WCH-17', subtest: '积木', domain: 'performance', text: '目标图案为对角分割，选正确选项：',
    options: ['对角A', '对角B', '对角C', '对角D'], answer: 1, maxScore: 2,
    candidates: [g2(sq(R), sq(R), sq(B), sq(B)), g2(sq(R), sq(B), sq(B), sq(R)), g2(sq(B), sq(R), sq(R), sq(B)), g2(sq(R), sq(B), sq(R), sq(B))] },
  { id: 'WCH-18', subtest: '积木', domain: 'performance', text: '目标图案为三角组合，选正确选项：',
    options: ['三角A', '三角B', '三角C', '三角D'], answer: 2, maxScore: 2,
    candidates: [g2(tri(R), tri(R), tri(B), tri(B)), g2(tri(R), tri(G), tri(B), tri(Y)), g2(tri(R), tri(B), tri(G), tri(Y)), g2(tri(Y), tri(R), tri(B), tri(G))] },
  { id: 'WCH-19', subtest: '积木', domain: 'performance', text: '目标图案为四色田字格，选正确选项：',
    options: ['田字A', '田字B', '田字C', '田字D'], answer: 0, maxScore: 2,
    candidates: [g2(sq(R), sq(B), sq(G), sq(Y)), g2(sq(R), sq(G), sq(B), sq(Y)), g2(sq(B), sq(R), sq(Y), sq(G)), g2(sq(R), sq(Y), sq(B), sq(G))] },
  { id: 'WCH-20', subtest: '积木', domain: 'performance', text: '目标图案为嵌套方块（外红内蓝），选正确选项：',
    options: ['嵌套A', '嵌套B', '嵌套C', '嵌套D'], answer: 1, maxScore: 2,
    candidates: [g2(sq(B), sq(R), sq(R), sq(B)), g2(sq(R), sq(B), sq(B), sq(R)), g2(sq(R), sq(R), sq(B), sq(B)), g2(sq(R), sq(B), sq(R), sq(B))] },

  // ===== 矩阵推理 Matrix Reasoning (5题) =====
  { id: 'WCH-21', subtest: '矩阵推理', domain: 'performance', text: '补全图形规律：圆形→方形→？',
    options: ['圆形', '方形', '三角形', '星形'], answer: 2, maxScore: 2 },
  { id: 'WCH-22', subtest: '矩阵推理', domain: 'performance', text: '序列：1个点,2个点,3个点,?',
    options: ['1个点', '2个点', '4个点', '5个点'], answer: 2, maxScore: 2 },
  { id: 'WCH-23', subtest: '矩阵推理', domain: 'performance', text: '图形按顺时针旋转90°，下一个是？',
    options: ['旋转0°', '旋转90°', '旋转180°', '旋转270°'], answer: 3, maxScore: 2 },
  { id: 'WCH-24', subtest: '矩阵推理', domain: 'performance', text: '颜色序列：红,蓝,红,蓝,?',
    options: ['红', '蓝', '绿', '黄'], answer: 0, maxScore: 2 },
  { id: 'WCH-25', subtest: '矩阵推理', domain: 'performance', text: '大小序列：大,中,小,大,中,?',
    options: ['大', '中', '小', '特大'], answer: 2, maxScore: 2 },

  // ===== 数字广度 Digit Span (5题) =====
  { id: 'WCH-26', subtest: '数字广度', domain: 'performance', text: '记住序列后正序复述：3-7-1',
    options: ['3-7-1', '7-3-1', '1-7-3', '3-1-7'], answer: 0, maxScore: 2 },
  { id: 'WCH-27', subtest: '数字广度', domain: 'performance', text: '正序复述：4-9-2-6',
    options: ['4-9-2-6', '6-2-9-4', '4-2-9-6', '9-4-6-2'], answer: 0, maxScore: 2 },
  { id: 'WCH-28', subtest: '数字广度', domain: 'performance', text: '倒序复述：5-8-2（应回答 2-8-5）',
    options: ['5-8-2', '2-8-5', '8-5-2', '2-5-8'], answer: 1, maxScore: 2 },
  { id: 'WCH-29', subtest: '数字广度', domain: 'performance', text: '正序复述：1-3-5-7-9',
    options: ['1-3-5-7-9', '9-7-5-3-1', '1-5-3-7-9', '1-3-7-5-9'], answer: 0, maxScore: 2 },
  { id: 'WCH-30', subtest: '数字广度', domain: 'performance', text: '倒序复述：6-4-9-1（应回答 1-9-4-6）',
    options: ['6-4-9-1', '1-9-4-6', '6-1-9-4', '4-6-1-9'], answer: 1, maxScore: 2 },
];

const SUBTESTS = ['词汇', '相似性', '算术', '积木', '矩阵推理', '数字广度'];

function computeResult(answers, qs, timings = []) {
  // 按子测验统计
  const subScores = {};
  SUBTESTS.forEach((s) => (subScores[s] = { correct: 0, total: 0, domain: '' }));
  qs.forEach((q, i) => {
    const sub = subScores[q.subtest];
    sub.total++;
    sub.domain = q.domain;
    if (answers[i] === q.answer) sub.correct++;
  });

  // P0-7: 修正量表分公式 — correct/total * 15 + 4（范围 4-19，与 WAIS 量表分一致）
  // 全对=19, 全错=4, 中间线性插值
  const scaleScores = {};
  let verbalSum = 0, perfSum = 0;
  Object.entries(subScores).forEach(([name, s]) => {
    const scale = Math.round((s.correct / s.total) * 15) + 4;
    scaleScores[name] = scale;
    if (s.domain === 'verbal') verbalSum += scale;
    else perfSum += scale;
  });

  // P0-7: 修正 IQ 转换 — 3 个子测验量表分范围 12-57（3×4=12 ~ 3×19=57）
  // 映射到 IQ 50-145（M=100, SD≈15）
  const viq = Math.round(50 + ((verbalSum - 12) / (57 - 12)) * 95);
  const piq = Math.round(50 + ((perfSum - 12) / (57 - 12)) * 95);
  // P0-7: FSIQ 使用量表分总和转换，而非简单算术平均
  const totalScale = verbalSum + perfSum; // 范围 24-114
  const fsiq = Math.round(50 + ((totalScale - 24) / (114 - 24)) * 95);

  const totalCorrect = qs.filter((q, i) => answers[i] === q.answer).length;
  const totalStat = {
    correct: totalCorrect,
    wrong: qs.length - totalCorrect - answers.filter(a => a === null).length,
    skipped: answers.filter(a => a === null).length,
  };

  return {
    raw: totalCorrect,
    total: qs.length,
    viq, piq, fsiq,
    level: describeIQ(fsiq),
    scaleScores,
    subScores,
    groups: {
      言语: Object.entries(subScores).filter(([, s]) => s.domain === 'verbal').reduce((a, [, s]) => a + s.correct, 0),
      操作: Object.entries(subScores).filter(([, s]) => s.domain === 'performance').reduce((a, [, s]) => a + s.correct, 0),
    },
    totalStat,
    totalTime: timings.reduce((s, t) => s + (t || 0), 0),
    avgTime: timings.length ? Math.round(timings.reduce((s, t) => s + (t || 0), 0) / timings.length) : 0,
  };
}

function describeIQ(iq) {
  if (iq >= 130) return '极优';
  if (iq >= 120) return '优秀';
  if (iq >= 110) return '中上';
  if (iq >= 90) return '中等';
  if (iq >= 80) return '中下';
  if (iq >= 70) return '边缘';
  return '较低';
}

module.exports = {
  id: 'wechsler',
  type: 'intelligence',
  name: '韦氏智力测验',
  shortName: 'WAIS',
  desc: '基于 WAIS 的简化版智力测验，含言语与操作两类共 6 个分测验。',
  icon: '📐',
  color: '#0d9488',
  duration: 25,
  questionCount: 30,
  paid: false,
  price: 0,
  tag: ['智力', '言语', '操作', '综合'],
  questionType: 'choice',

  getQuestions() {
    return QUESTIONS.map((q) => ({
      id: q.id,
      type: 'choice',
      subtest: q.subtest,
      domain: q.domain,
      prompt: q.text,
      options: q.options,
      answer: q.answer,
      maxScore: q.maxScore,
      matrix: q.matrix,
      candidates: q.candidates,
      targetPattern: q.targetPattern,
      timeLimit: 60,
    }));
  },

  computeResult,

  buildGroupList(r, layout) {
    return Object.entries(r.groups).map(([k, v]) => ({
      key: k,
      label: layout.groupLabels[k] || k,
      percent: Math.round((v / 15) * 100),
      display: `${v}/15`,
      isScale: false,
    }));
  },

  buildSubtestList(r) {
    if (!r.subScores) return [];
    return Object.entries(r.subScores).map(([name, sub]) => ({
      name,
      domain: sub.domain,
      scale: r.scaleScores ? r.scaleScores[name] : 0,
      scalePercent: Math.round((((r.scaleScores ? r.scaleScores[name] : 0) - 4) / 15) * 100),
      correct: sub.correct,
      total: sub.total,
    }));
  },

  buildInterpretations(r) {
    return [
      { title: '总体水平', text: `总智商 FSIQ=${r.fsiq}，${r.level}。言语智商 ${r.viq}，操作智商 ${r.piq}。` },
      { title: '优势领域', text: r.viq >= r.piq ? '言语理解能力优于操作推理，擅长语言类任务。' : '操作推理能力优于言语理解，擅长空间与图形任务。' },
      { title: '提升方向', text: r.viq >= r.piq ? '可加强图形推理与空间思维训练。' : '可加强词汇积累与言语推理训练。' },
      { title: '建议', text: r.fsiq >= 110 ? '综合智力优秀，可挑战更高难度任务。' : '建议系统训练薄弱分测验相关能力。' },
    ];
  },

  // 维度标签：韦氏使用子测验名作为标签
  getDimensionLabel(dim) { return dim; },

  resultLayout: {
    primaryField: 'fsiq',
    primaryLabel: '总智商 FSIQ',
    primarySuffix: '',
    showGroups: true,
    groupLabels: { 言语: '言语理解', 操作: '操作推理' },
    showDetail: true,
    detailType: 'subtest',
    interpretation: true,
    renderMode: 'subtest',
    groupTitle: '分测验表现',
  },
};
