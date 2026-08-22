const { makeLabeler } = require('../../utils/labels')
/**
 * 霍兰德职业兴趣测试（Holland / RIASEC，简化版 48 题）
 *
 * 六个维度，每维度 8 题，共 48 题：
 *   R  现实型 (Realistic)       — 喜欢操作工具/机器/动植物
 *   I  研究型 (Investigative)    — 喜欢研究/分析/解决抽象问题
 *   A  艺术型 (Artistic)         — 喜欢创作/自我表达
 *   S  社会型 (Social)           — 喜欢帮助/教导/服务他人
 *   E  企业型 (Enterprising)     — 喜欢说服/管理/领导
 *   C  常规型 (Conventional)     — 喜欢有条理/规则明确的工作
 *
 * 每题为 5 级量表：1=非常不同意 ... 5=非常同意
 * 评分复用通用量表工具 computeScaleScores。
 * 结果取百分位最高的三个维度组合成"职业代码"，如 "RIS"。
 */

const { computeScaleScores } = require('../../utils/scale-scoring');

const DIMENSIONS = {
  R: { name: '现实型', en: 'Realistic', desc: '操作工具、机器与动植物', high: '喜欢动手操作，擅长使用工具、机械，偏好具体实用的活动。', low: '对操作机械和体力活动兴趣不高。' },
  I: { name: '研究型', en: 'Investigative', desc: '研究、分析与解决抽象问题', high: '善于分析思考，喜欢探究原理，乐于解决抽象问题。', low: '对学术研究和抽象分析兴趣不高。' },
  A: { name: '艺术型', en: 'Artistic', desc: '创作与自我表达', high: '富有创意，喜欢通过艺术创作表达自我，追求自由。', low: '对艺术创作和即兴表达兴趣不高。' },
  S: { name: '社会型', en: 'Social', desc: '帮助、教导与服务他人', high: '乐于助人，擅长沟通协作，喜欢教导和服务他人。', low: '对直接服务他人的工作兴趣不高。' },
  E: { name: '企业型', en: 'Enterprising', desc: '说服、管理与领导', high: '善于说服领导，喜欢竞争与影响他人，追求成就。', low: '对管理领导和销售说服兴趣不高。' },
  C: { name: '常规型', en: 'Conventional', desc: '有条理、规则明确的工作', high: '注重秩序细节，喜欢有条理、规则明确的工作。', low: '对程式化和重复性工作兴趣不高。' },
};

// 各主导类型的职业方向与发展建议
const TYPE_CAREER = {
  R: { careers: '工程师、技术员、机械师、农艺师、运动员、手工艺人、飞行员', advice: '可发挥动手与技术优势，选择工程、制造、农业、体育等领域。' },
  I: { careers: '科学家、研究员、医生、数据分析师、程序员、学者', advice: '可发挥分析研究优势，选择科研、医疗、数据、技术等领域。' },
  A: { careers: '设计师、作家、音乐家、演员、艺术家、创意策划', advice: '可发挥创意表达优势，选择设计、文创、传媒、演艺等领域。' },
  S: { careers: '教师、心理咨询师、社工、护士、人力资源、客服', advice: '可发挥沟通服务优势，选择教育、咨询、医疗、公益等领域。' },
  E: { careers: '管理者、销售、创业者、律师、市场策划、政治家', advice: '可发挥说服领导优势，选择管理、销售、创业、法律等领域。' },
  C: { careers: '会计、审计、行政、档案管理、程序员、质检员', advice: '可发挥组织规范优势，选择财务、行政、数据、质量等领域。' },
};

// 48 题（真实题本）：每维度 8 题，均为正向计分。
// 题源：Liao, H-Y., Armstrong, P. I., & Rounds, J. (2008).
// "Development and initial validation of public domain basic interest markers."
// Journal of Vocational Behavior, 73, 159-183.（公开领域 RIASEC 题项，亦见
// Open-Source Psychometrics Project 的 Holland Code 测试）。
// 说明：以下为受版权保护的原始题项的中文翻译，仅供学习研究使用，相关权利归原作者所有。
const QUESTIONS = [
  // R 现实型 (8题) — Realistic
  { id: 'HOL-01', dim: 'R', text: '在发货前检验零部件的质量。' },
  { id: 'HOL-02', dim: 'R', text: '砌砖或铺设瓷砖。' },
  { id: 'HOL-03', dim: 'R', text: '在海上石油钻井平台上工作。' },
  { id: 'HOL-04', dim: 'R', text: '装配电子零件。' },
  { id: 'HOL-05', dim: 'R', text: '在工厂操作磨床。' },
  { id: 'HOL-06', dim: 'R', text: '修理破损的水龙头。' },
  { id: 'HOL-07', dim: 'R', text: '在工厂组装产品。' },
  { id: 'HOL-08', dim: 'R', text: '安装房屋的地板。' },

  // I 研究型 (8题) — Investigative
  { id: 'HOL-09', dim: 'I', text: '研究人体的结构。' },
  { id: 'HOL-10', dim: 'I', text: '研究动物的行为。' },
  { id: 'HOL-11', dim: 'I', text: '对植物或动物进行研究。' },
  { id: 'HOL-12', dim: 'I', text: '开发新的医疗方法或治疗程序。' },
  { id: 'HOL-13', dim: 'I', text: '进行生物学研究。' },
  { id: 'HOL-14', dim: 'I', text: '研究鲸鱼及其他海洋生物。' },
  { id: 'HOL-15', dim: 'I', text: '在生物学实验室工作。' },
  { id: 'HOL-16', dim: 'I', text: '绘制海底地图。' },

  // A 艺术型 (8题) — Artistic
  { id: 'HOL-17', dim: 'A', text: '指挥一个合唱团。' },
  { id: 'HOL-18', dim: 'A', text: '执导一部戏剧。' },
  { id: 'HOL-19', dim: 'A', text: '为杂志设计美术作品。' },
  { id: 'HOL-20', dim: 'A', text: '写一首歌。' },
  { id: 'HOL-21', dim: 'A', text: '写书或剧本。' },
  { id: 'HOL-22', dim: 'A', text: '演奏一种乐器。' },
  { id: 'HOL-23', dim: 'A', text: '为电影或电视节目表演特技。' },
  { id: 'HOL-24', dim: 'A', text: '为戏剧设计布景。' },

  // S 社会型 (8题) — Social
  { id: 'HOL-25', dim: 'S', text: '为人们提供职业指导。' },
  { id: 'HOL-26', dim: 'S', text: '在非营利组织做志愿工作。' },
  { id: 'HOL-27', dim: 'S', text: '帮助有药物或酒精问题的人。' },
  { id: 'HOL-28', dim: 'S', text: '教个人一套锻炼方法。' },
  { id: 'HOL-29', dim: 'S', text: '帮助有家庭问题的人。' },
  { id: 'HOL-30', dim: 'S', text: '在夏令营监督儿童的活动。' },
  { id: 'HOL-31', dim: 'S', text: '教儿童阅读。' },
  { id: 'HOL-32', dim: 'S', text: '帮助老年人进行日常活动。' },

  // E 企业型 (8题) — Enterprising
  { id: 'HOL-33', dim: 'E', text: '向个人出售餐饮连锁的加盟权。' },
  { id: 'HOL-34', dim: 'E', text: '在百货商店销售商品。' },
  { id: 'HOL-35', dim: 'E', text: '管理一家酒店的运营。' },
  { id: 'HOL-36', dim: 'E', text: '经营一家美容院或理发店。' },
  { id: 'HOL-37', dim: 'E', text: '管理大公司内的一个部门。' },
  { id: 'HOL-38', dim: 'E', text: '管理一家服装店。' },
  { id: 'HOL-39', dim: 'E', text: '销售房屋（房产）。' },
  { id: 'HOL-40', dim: 'E', text: '经营一家玩具店。' },

  // C 常规型 (8题) — Conventional
  { id: 'HOL-41', dim: 'C', text: '为办公室开具每月的工资支票。' },
  { id: 'HOL-42', dim: 'C', text: '用手持电脑盘点物资库存。' },
  { id: 'HOL-43', dim: 'C', text: '用计算机程序生成客户账单。' },
  { id: 'HOL-44', dim: 'C', text: '维护员工档案。' },
  { id: 'HOL-45', dim: 'C', text: '计算并记录统计数据及其他数值资料。' },
  { id: 'HOL-46', dim: 'C', text: '操作计算器。' },
  { id: 'HOL-47', dim: 'C', text: '处理客户的银行交易。' },
  { id: 'HOL-48', dim: 'C', text: '保存发货与收货记录。' },
];

function computeResult(answers, qs) {
  const dims = computeScaleScores(answers, qs, DIMENSIONS, {
    min: 1, max: 5, highThreshold: 70, lowThreshold: 30, defaultVal: 3,
  });

  // 按百分位（其次按总分）排序，取前三组成职业代码
  const sorted = Object.keys(dims).sort((a, b) => dims[b].percent - dims[a].percent || dims[b].sum - dims[a].sum);
  const code = sorted.slice(0, 3).join('');

  const groups = {};
  Object.keys(dims).forEach((k) => (groups[k] = dims[k].sum));

  const primary = TYPE_CAREER[code[0]];
  const secondary = TYPE_CAREER[code[1]];

  return {
    code,
    type: code,
    typeName: `${DIMENSIONS[code[0]].name}·${DIMENSIONS[code[1]].name}·${DIMENSIONS[code[2]].name}`,
    trait: `职业代码 ${code}`,
    description: `你的霍兰德职业代码为 ${code}，主导兴趣依次为${DIMENSIONS[code[0]].name}、${DIMENSIONS[code[1]].name}、${DIMENSIONS[code[2]].name}。`,
    dimensions: dims,
    groups,
    careers: primary.careers,
    secondaryCareers: secondary.careers,
    careerAdvice: primary.advice,
    raw: Object.values(groups).reduce((a, b) => a + b, 0),
    total: qs.length,
    totalStat: { correct: 0, wrong: 0, skipped: answers.filter((a) => a == null).length },
  };
}

const DIM_LABELS = { R: '现实型', I: '研究型', A: '艺术型', S: '社会型', E: '企业型', C: '常规型' };

module.exports = {
  id: 'holland',
  type: 'career',
  name: '霍兰德职业兴趣测试',
  shortName: 'Holland',
  desc: '基于霍兰德 RIASEC 模型的职业兴趣测评，评估六种职业兴趣类型并生成职业代码。',
  icon: '💼',
  color: '#059669',
  duration: 15,
  questionCount: 48,
  paid: false,
  price: 0,
  tag: ['职业', '兴趣', 'RIASEC'],
  questionType: 'scale',

  getQuestions() {
    return QUESTIONS.map((q) => ({
      id: q.id,
      type: 'scale',
      dimension: q.dim,
      prompt: q.text,
      scale: { min: 1, max: 5, labels: ['非常不同意', '不同意', '中立', '同意', '非常同意'] },
      answer: null,
    }));
  },

  computeResult,

  buildGroupList(r, layout) {
    // P0-4: 使用 computeScaleScores 返回的 percent，保持与评分逻辑一致
    return ['R', 'I', 'A', 'S', 'E', 'C'].map((k) => ({
      key: k,
      label: layout.groupLabels[k] || k,
      percent: r.dimensions[k].percent,
      display: `${r.groups[k]}/40`,
      isScale: true,
    }));
  },

  buildInterpretations(r) {
    const code = r.code;
    const d = r.dimensions;
    const sorted = [...Object.values(d)].sort((a, b) => b.percent - a.percent);
    const top = sorted[0];
    const primary = TYPE_CAREER[code[0]];
    const secondary = TYPE_CAREER[code[1]];
    return [
      { title: '职业代码', text: `你的霍兰德代码为 ${code}，主导兴趣为${d[code[0]].name}、${d[code[1]].name}、${d[code[2]].name}。` },
      { title: '兴趣解读', text: `${top.name}得分最高（${top.percent}%），${top.text}` },
      { title: '推荐职业', text: `结合你的代码 ${code}，适合的方向包括：${primary.careers}等。兼顾次要维度，也可考虑${secondary.careers}。` },
      { title: '发展建议', text: primary.advice + '职业兴趣并非一成不变，可在主导方向上深耕，同时适当拓展相邻类型的能力，以拓宽职业选择空间。' },
    ];
  },

  // 维度标签：霍兰德六种职业兴趣类型
  resultLayout: {
    primaryField: 'code',
    primaryLabel: '职业代码',
    primarySuffix: '',
    groupLabels: { R: '现实型', I: '研究型', A: '艺术型', S: '社会型', E: '企业型', C: '常规型' },
    interpretation: true,
  },
};
