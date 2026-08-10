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

import { computeScaleScores } from '../../utils/scale-scoring';

const DIMENSIONS: Record<string, { name: string; en: string; desc: string; high: string; low: string }> = {
  R: { name: '现实型', en: 'Realistic', desc: '操作工具、机器与动植物', high: '喜欢动手操作，擅长使用工具、机械，偏好具体实用的活动。', low: '对操作机械和体力活动兴趣不高。' },
  I: { name: '研究型', en: 'Investigative', desc: '研究、分析与解决抽象问题', high: '善于分析思考，喜欢探究原理，乐于解决抽象问题。', low: '对学术研究和抽象分析兴趣不高。' },
  A: { name: '艺术型', en: 'Artistic', desc: '创作与自我表达', high: '富有创意，喜欢通过艺术创作表达自我，追求自由。', low: '对艺术创作和即兴表达兴趣不高。' },
  S: { name: '社会型', en: 'Social', desc: '帮助、教导与服务他人', high: '乐于助人，擅长沟通协作，喜欢教导和服务他人。', low: '对直接服务他人的工作兴趣不高。' },
  E: { name: '企业型', en: 'Enterprising', desc: '说服、管理与领导', high: '善于说服领导，喜欢竞争与影响他人，追求成就。', low: '对管理领导和销售说服兴趣不高。' },
  C: { name: '常规型', en: 'Conventional', desc: '有条理、规则明确的工作', high: '注重秩序细节，喜欢有条理、规则明确的工作。', low: '对程式化和重复性工作兴趣不高。' },
};

// 各主导类型的职业方向与发展建议
const TYPE_CAREER: Record<string, { careers: string; advice: string }> = {
  R: { careers: '工程师、技术员、机械师、农艺师、运动员、手工艺人、飞行员', advice: '可发挥动手与技术优势，选择工程、制造、农业、体育等领域。' },
  I: { careers: '科学家、研究员、医生、数据分析师、程序员、学者', advice: '可发挥分析研究优势，选择科研、医疗、数据、技术等领域。' },
  A: { careers: '设计师、作家、音乐家、演员、艺术家、创意策划', advice: '可发挥创意表达优势，选择设计、文创、传媒、演艺等领域。' },
  S: { careers: '教师、心理咨询师、社工、护士、人力资源、客服', advice: '可发挥沟通服务优势，选择教育、咨询、医疗、公益等领域。' },
  E: { careers: '管理者、销售、创业者、律师、市场策划、政治家', advice: '可发挥说服领导优势，选择管理、销售、创业、法律等领域。' },
  C: { careers: '会计、审计、行政、档案管理、程序员、质检员', advice: '可发挥组织规范优势，选择财务、行政、数据、质量等领域。' },
};

// 48 题：每维度 8 题，均为正向计分
const QUESTIONS = [
  // R 现实型 (8题)
  { id: 'HOL-01', dim: 'R', text: '我喜欢修理电器或机械。' },
  { id: 'HOL-02', dim: 'R', text: '我喜欢使用工具动手制作物品。' },
  { id: 'HOL-03', dim: 'R', text: '我喜欢户外活动或体力劳动。' },
  { id: 'HOL-04', dim: 'R', text: '我喜欢操作机器和设备。' },
  { id: 'HOL-05', dim: 'R', text: '我喜欢种植花草或饲养动物。' },
  { id: 'HOL-06', dim: 'R', text: '我喜欢拆解并组装各种物件。' },
  { id: 'HOL-07', dim: 'R', text: '我倾向于通过动手实践来学习新事物。' },
  { id: 'HOL-08', dim: 'R', text: '我喜欢从事需要体力或技术的工作。' },

  // I 研究型 (8题)
  { id: 'HOL-09', dim: 'I', text: '我喜欢研究科学问题。' },
  { id: 'HOL-10', dim: 'I', text: '我喜欢分析复杂的数据和现象。' },
  { id: 'HOL-11', dim: 'I', text: '我喜欢阅读学术或专业书籍。' },
  { id: 'HOL-12', dim: 'I', text: '我喜欢探索事物背后的原理和规律。' },
  { id: 'HOL-13', dim: 'I', text: '我喜欢独立思考并解决抽象问题。' },
  { id: 'HOL-14', dim: 'I', text: '我对科学实验和研究感兴趣。' },
  { id: 'HOL-15', dim: 'I', text: '我喜欢提出假设并加以验证。' },
  { id: 'HOL-16', dim: 'I', text: '我享受钻研难题的过程。' },

  // A 艺术型 (8题)
  { id: 'HOL-17', dim: 'A', text: '我喜欢绘画、写作或音乐创作。' },
  { id: 'HOL-18', dim: 'A', text: '我喜欢通过艺术方式表达自我。' },
  { id: 'HOL-19', dim: 'A', text: '我欣赏富有创意和美感的事物。' },
  { id: 'HOL-20', dim: 'A', text: '我喜欢参加文艺演出或艺术展览。' },
  { id: 'HOL-21', dim: 'A', text: '我常有不拘一格的创意想法。' },
  { id: 'HOL-22', dim: 'A', text: '我喜欢设计或装饰环境。' },
  { id: 'HOL-23', dim: 'A', text: '我享受即兴创作的过程。' },
  { id: 'HOL-24', dim: 'A', text: '我倾向于在自由灵活的环境中工作。' },

  // S 社会型 (8题)
  { id: 'HOL-25', dim: 'S', text: '我喜欢帮助他人解决困难。' },
  { id: 'HOL-26', dim: 'S', text: '我乐于教导和培训别人。' },
  { id: 'HOL-27', dim: 'S', text: '我喜欢参与志愿服务或公益活动。' },
  { id: 'HOL-28', dim: 'S', text: '我擅长倾听和安慰他人。' },
  { id: 'HOL-29', dim: 'S', text: '我喜欢与人合作完成团队任务。' },
  { id: 'HOL-30', dim: 'S', text: '我关心他人的成长与福祉。' },
  { id: 'HOL-31', dim: 'S', text: '我享受为他人提供服务。' },
  { id: 'HOL-32', dim: 'S', text: '我倾向于在人际互动中获得满足。' },

  // E 企业型 (8题)
  { id: 'HOL-33', dim: 'E', text: '我喜欢说服别人接受我的观点。' },
  { id: 'HOL-34', dim: 'E', text: '我喜欢组织和领导团队。' },
  { id: 'HOL-35', dim: 'E', text: '我乐于制定计划并推动执行。' },
  { id: 'HOL-36', dim: 'E', text: '我喜欢参与竞争并争取胜利。' },
  { id: 'HOL-37', dim: 'E', text: '我擅长推销产品或想法。' },
  { id: 'HOL-38', dim: 'E', text: '我喜欢承担管理责任。' },
  { id: 'HOL-39', dim: 'E', text: '我享受影响和带动他人的过程。' },
  { id: 'HOL-40', dim: 'E', text: '我倾向于追求成就和社会地位。' },

  // C 常规型 (8题)
  { id: 'HOL-41', dim: 'C', text: '我喜欢有条理、规则明确的工作。' },
  { id: 'HOL-42', dim: 'C', text: '我擅长整理和归档资料。' },
  { id: 'HOL-43', dim: 'C', text: '我喜欢按照既定流程和标准做事。' },
  { id: 'HOL-44', dim: 'C', text: '我注重细节和准确性。' },
  { id: 'HOL-45', dim: 'C', text: '我喜欢处理数据和记录信息。' },
  { id: 'HOL-46', dim: 'C', text: '我乐于维护秩序和规范。' },
  { id: 'HOL-47', dim: 'C', text: '我喜欢制作计划表和时间表。' },
  { id: 'HOL-48', dim: 'C', text: '我倾向于在稳定可预期的环境中工作。' },
];

function computeResult(answers: any[], qs: any[]) {
  const dims = computeScaleScores(answers, qs, DIMENSIONS, {
    min: 1, max: 5, highThreshold: 70, lowThreshold: 30, defaultVal: 3,
  });

  // 按百分位（其次按总分）排序，取前三组成职业代码
  const sorted = Object.keys(dims).sort((a, b) => (dims as any)[b].percent - (dims as any)[a].percent || (dims as any)[b].sum - (dims as any)[a].sum);
  const code = sorted.slice(0, 3).join('');

  const groups: Record<string, number> = {};
  Object.keys(dims).forEach((k) => (groups[k] = (dims as any)[k].sum));

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
    raw: Object.values(groups).reduce((a: number, b: number) => a + b, 0),
    total: qs.length,
    totalStat: { correct: 0, wrong: 0, skipped: answers.filter((a: any) => a == null).length },
  };
}

export default {
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

  buildGroupList(r: any, layout: any) {
    return ['R', 'I', 'A', 'S', 'E', 'C'].map((k) => ({
      key: k,
      label: layout.groupLabels[k] || k,
      percent: Math.round((r.groups[k] / 40) * 100),
      display: `${r.groups[k]}/40`,
      isScale: true,
    }));
  },

  buildInterpretations(r: any) {
    const code = r.code;
    const d = r.dimensions;
    const sorted = [...Object.values(d)].sort((a: any, b: any) => b.percent - a.percent);
    const top = sorted[0] as any;
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
  getDimensionLabel(dim: string) {
    const labels: Record<string, string> = { R: '现实型', I: '研究型', A: '艺术型', S: '社会型', E: '企业型', C: '常规型' };
    return labels[dim] || dim;
  },

  resultLayout: {
    primaryField: 'code',
    primaryLabel: '职业代码',
    primarySuffix: '',
    showGroups: true,
    groupLabels: { R: '现实型', I: '研究型', A: '艺术型', S: '社会型', E: '企业型', C: '常规型' },
    showDetail: false,
    interpretation: true,
  },
};
