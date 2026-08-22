/**
 * 九型人格测试（Enneagram of Personality，简化版）
 *
 * 九种人格类型，每类型 4 题，共 36 题，5 级评分（1-5）：
 *   1 = 非常不符合 ... 5 = 非常符合
 *
 * 评分：各类型维度按平均分换算为百分比，取百分比最高的类型为你的主导类型。
 * 九型人格强调「动态变化」与 subtype/翼型，本测试仅作主导类型初步探索。
 *
 * 重要提示：本测评为趣味/自我探索工具，不构成临床诊断。
 */

const { computeScaleScores } = require('../../utils/scale-scoring');

const DIMENSIONS = {
  '1': { name: '改革者', en: 'Reformer', desc: '理性、有原则、追求正确与改进', high: '你注重原则与品质，习惯把事情做对、做得更好。', low: '你对「必须正确」的要求并不强烈。' },
  '2': { name: '助人者', en: 'Helper', desc: '热心、友善、渴望被需要', high: '你敏锐地关注他人需求，并从中获得价值感。', low: '你不以「被需要」作为主要动力。' },
  '3': { name: '成就者', en: 'Achiever', desc: '目标导向、适应力强、重视形象', high: '你重视表现与成就，擅长高效达成目标。', low: '你不太以外部成就定义自我。' },
  '4': { name: '浪漫者', en: 'Individualist', desc: '独特、敏感、追求深层意义', high: '你重视真实独特的感受，渴望被深入理解。', low: '你较少被「与众不同」的情绪牵引。' },
  '5': { name: '观察家', en: 'Investigator', desc: '冷静、好奇、注重隐私与独立', high: '你偏好先观察再行动，对兴趣领域深入探究。', low: '你对外界探索与独处需求相对平衡。' },
  '6': { name: '忠诚者', en: 'Loyalist', desc: '忠诚、谨慎、寻求安全', high: '你重视可信赖的关系与稳定，会预判风险。', low: '你对不确定性的焦虑较低。' },
  '7': { name: '活跃者', en: 'Enthusiast', desc: '乐观、多变、追求新鲜', high: '你热爱新鲜有趣的事物，难以忍受无聊与限制。', low: '你偏好稳定更甚于多变刺激。' },
  '8': { name: '挑战者', en: 'Challenger', desc: '果断、强势、有保护欲', high: '你习惯掌控局面、直接表达，并保护在意的人。', low: '你较少以主导和控制作为应对方式。' },
  '9': { name: '和平者', en: 'Peacemaker', desc: '温和、随和、避免冲突', high: '你偏好和谐平稳，容易迁就他人、顺其自然。', low: '你对冲突并不特别回避。' },
};

const TYPE_DESC = {
  '1': '你是「改革者」：原则清晰、追求进步，记得也要允许自己和他人不完美。',
  '2': '你是「助人者」：温暖慷慨、善解人意，别忘了照顾自己的需要。',
  '3': '你是「成就者」：高效务实、充满动力，留意别让外在成就掩盖真实感受。',
  '4': '你是「浪漫者」：细腻独特、重视意义，你的感受本身就是珍贵资产。',
  '5': '你是「观察家」：冷静好奇、独立思考，适度向外联结会让洞察更有力量。',
  '6': '你是「忠诚者」：可靠谨慎、重视安全，信任自己也能缓解过度焦虑。',
  '7': '你是「活跃者」：乐观好奇、点子多多，专注深耕会让热情走得更远。',
  '8': '你是「挑战者」：直接有力、保护欲强，柔软的表达能拉近关系。',
  '9': '你是「和平者」：温和包容、稳定安心，表达自我主张同样重要。',
};

const QUESTIONS = [
  // 1 改革者
  { id: 'ENN-01', dim: '1', text: '我常注意事情哪里可以做得更好、更正确。' },
  { id: 'ENN-02', dim: '1', text: '我对自己和他人都有较高的标准。' },
  { id: 'ENN-03', dim: '1', text: '看到不公或错误时，我会忍不住指出来。' },
  { id: 'ENN-04', dim: '1', text: '我做事讲求原则，难以接受敷衍了事。' },
  // 2 助人者
  { id: 'ENN-05', dim: '2', text: '我很容易察觉别人的需要与情绪。' },
  { id: 'ENN-06', dim: '2', text: '我乐于助人，并从中获得价值感。' },
  { id: 'ENN-07', dim: '2', text: '我会在意自己是否被别人需要。' },
  { id: 'ENN-08', dim: '2', text: '我倾向于把别人的事看得比自己的更重要。' },
  // 3 成就者
  { id: 'ENN-09', dim: '3', text: '我很在意自己的表现与成就。' },
  { id: 'ENN-10', dim: '3', text: '我擅长设定目标并高效达成。' },
  { id: 'ENN-11', dim: '3', text: '我在意别人对我的评价与印象。' },
  { id: 'ENN-12', dim: '3', text: '我习惯保持忙碌、不断进步。' },
  // 4 浪漫者
  { id: 'ENN-13', dim: '4', text: '我觉得自己和别人有种本质上的不同。' },
  { id: 'ENN-14', dim: '4', text: '我重视真实、独特的感受与体验。' },
  { id: 'ENN-15', dim: '4', text: '我容易被强烈的情绪打动。' },
  { id: 'ENN-16', dim: '4', text: '我渴望被深入理解，而非表面认同。' },
  // 5 观察家
  { id: 'ENN-17', dim: '5', text: '我需要独处的时间来恢复能量。' },
  { id: 'ENN-18', dim: '5', text: '我对感兴趣的事物会深入探究。' },
  { id: 'ENN-19', dim: '5', text: '我倾向于先观察、再行动。' },
  { id: 'ENN-20', dim: '5', text: '我重视个人隐私与独立。' },
  // 6 忠诚者
  { id: 'ENN-21', dim: '6', text: '我做决定前会反复考虑风险。' },
  { id: 'ENN-22', dim: '6', text: '我重视可信任的关系与稳定的环境。' },
  { id: 'ENN-23', dim: '6', text: '面对不确定时，我会感到焦虑。' },
  { id: 'ENN-24', dim: '6', text: '我对权威既依赖又有所质疑。' },
  // 7 活跃者
  { id: 'ENN-25', dim: '7', text: '我喜欢新鲜、有趣的事物与计划。' },
  { id: 'ENN-26', dim: '7', text: '我难以忍受无聊与限制。' },
  { id: 'ENN-27', dim: '7', text: '我总能看到事情积极、好玩的一面。' },
  { id: 'ENN-28', dim: '7', text: '我容易同时开启多个兴趣，难以专一。' },
  // 8 挑战者
  { id: 'ENN-29', dim: '8', text: '我习惯掌控局面、直接表达。' },
  { id: 'ENN-30', dim: '8', text: '我会保护自己在意的人。' },
  { id: 'ENN-31', dim: '8', text: '我不喜欢被人指挥或控制。' },
  { id: 'ENN-32', dim: '8', text: '面对冲突，我倾向于正面迎战。' },
  // 9 和平者
  { id: 'ENN-33', dim: '9', text: '我偏好和谐、平稳的氛围。' },
  { id: 'ENN-34', dim: '9', text: '我容易迁就别人，忽略自己的需求。' },
  { id: 'ENN-35', dim: '9', text: '我不喜欢冲突与强烈的对立。' },
  { id: 'ENN-36', dim: '9', text: '我做事节奏偏慢，喜欢顺其自然。' },
];

const SCALE_LABELS = ['非常不符合', '不符合', '中立', '符合', '非常符合'];

function computeResult(answers, qs) {
  const dims = computeScaleScores(answers, qs, DIMENSIONS, {
    min: 1, max: 5, highThreshold: 65, lowThreshold: 35, defaultVal: 3,
  });

  const sorted = Object.keys(dims).sort((a, b) => dims[b].percent - dims[a].percent || dims[b].sum - dims[a].sum);
  const top = sorted[0];
  const second = sorted[1];

  const groups = {};
  Object.keys(dims).forEach((k) => (groups[k] = dims[k].sum));

  return {
    type: top,
    typeName: `${top} 号 · ${DIMENSIONS[top].name}`,
    trait: `${top} 号 ${DIMENSIONS[top].name}`,
    description: TYPE_DESC[top],
    dimensions: dims,
    groups,
    secondary: second,
    raw: Object.values(groups).reduce((a, b) => a + b, 0),
    total: qs.length,
    totalStat: { correct: 0, wrong: 0, skipped: answers.filter((a) => a == null).length },
  };
}

module.exports = {
  id: 'enneagram',
  type: 'personality',
  name: '九型人格测试',
  shortName: 'Enneagram',
  desc: '基于九型人格理论的简化测评，探索你的主导人格类型与特质倾向。',
  icon: '🌀',
  color: '#be185d',
  duration: 10,
  questionCount: 36,
  paid: false,
  price: 0,
  tag: ['人格', '性格', '九型', '自我探索'],
  questionType: 'scale',

  getQuestions() {
    return QUESTIONS.map((q) => ({
      id: q.id,
      type: 'scale',
      dimension: q.dim,
      prompt: q.text,
      scale: { min: 1, max: 5, labels: SCALE_LABELS },
      answer: null,
    }));
  },

  computeResult,

  buildGroupList(r, layout) {
    return Object.keys(DIMENSIONS).map((k) => ({
      key: k,
      label: layout.groupLabels[k] || k,
      percent: r.dimensions[k].percent,
      display: `${r.dimensions[k].sum}/20`,
      isScale: true,
    }));
  },

  buildInterpretations(r) {
    const d = r.dimensions;
    const top = r.type;
    const second = r.secondary;
    return [
      { title: '你的主导类型', text: `你是 ${top} 号 · ${DIMENSIONS[top].name}。${r.description}` },
      { title: '类型特质', text: d[top].text },
      { title: '次要倾向', text: `你的次高类型为 ${second} 号 · ${DIMENSIONS[second].name}，可与主导类型共同塑造你的性格轮廓（类似「翼型」的雏形）。` },
      { title: '成长方向', text: '九型人格强调动态成长：在压力与安全状态下，人的表现会向其他类型流动。了解类型是为了更有觉察地接纳与发展自己，而非自我设限。' },
    ];
  },

  getDimensionLabel(dim) {
    return DIMENSIONS[dim] ? `${dim} 号 ${DIMENSIONS[dim].name}` : dim;
  },

  resultLayout: {
    primaryField: 'type',
    primaryLabel: '主导类型',
    primarySuffix: '号',
    groupLabels: { '1': '1 改革者', '2': '2 助人者', '3': '3 成就者', '4': '4 浪漫者', '5': '5 观察家', '6': '6 忠诚者', '7': '7 活跃者', '8': '8 挑战者', '9': '9 和平者' },
    interpretation: true,
  },
};
