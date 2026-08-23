/**
 * MBTI 人格测试模块（标准 70 题版）
 *
 * 4 个维度，共 70 题：
 *   E/I  外向/内向  —— 10 题
 *   S/N  实感/直觉  —— 20 题
 *   T/F  思考/情感  —— 20 题
 *   J/P  判断/感知  —— 20 题
 *
 * 每题为二选一（a / b），选项 a（索引 0）对应 pole 所标示的维度极，
 * 选项 b（索引 1）对应相反极。题源为公开的 MBTI 70 题标准化题库
 * （"MBTI Personality Type Test - 70 questions"，公共领域版本），
 * 已翻译为简体中文。版权题源 disclaimer 由全局统一添加。
 */

const QUESTIONS = [
  // ===== E/I 外向 vs 内向 (10题) =====
  { id: 'MBTI-01', dimension: 'EI', pole: 'E', text: '在聚会上，你更倾向于：', a: '和许多人交流，包括陌生人', b: '只和熟悉的几个人交流' },
  { id: 'MBTI-08', dimension: 'EI', pole: 'E', text: '参加聚会时，你通常会：', a: '待到很晚，越玩越有精神', b: '早早离开，越待越疲惫' },
  { id: 'MBTI-15', dimension: 'EI', pole: 'E', text: '在社交圈里，你：', a: '紧跟大家的最新动态', b: '常常错过大家的消息' },
  { id: 'MBTI-22', dimension: 'EI', pole: 'E', text: '打电话时，你：', a: '很少犹豫，想到就说', b: '会先想好要说什么' },
  { id: 'MBTI-29', dimension: 'EI', pole: 'E', text: '在人群中，你：', a: '主动开启话题', b: '等别人来搭话' },
  { id: 'MBTI-36', dimension: 'EI', pole: 'E', text: '新颖而非惯例的社交互动会让你：', a: '受到激发、精力更充沛', b: '消耗你的精力储备' },
  { id: 'MBTI-43', dimension: 'EI', pole: 'E', text: '你更偏好：', a: '朋友很多但交往较浅', b: '朋友很少但交往很深' },
  { id: 'MBTI-50', dimension: 'EI', pole: 'E', text: '你：', a: '能和陌生人轻松聊上很久', b: '和陌生人没什么可说' },
  { id: 'MBTI-57', dimension: 'EI', pole: 'E', text: '电话响起时，你：', a: '抢着先去接', b: '希望别人去接' },
  { id: 'MBTI-64', dimension: 'EI', pole: 'E', text: '你更：', a: '容易接近', b: '有些矜持' },

  // ===== S/N 实感 vs 直觉 (20题) =====
  { id: 'MBTI-02', dimension: 'SN', pole: 'S', text: '你更倾向于：', a: '务实而非空想', b: '空想而非务实' },
  { id: 'MBTI-03', dimension: 'SN', pole: 'S', text: '哪件事更让你难受：', a: '整天想入非非、不切实际', b: '墨守成规、一成不变' },
  { id: 'MBTI-09', dimension: 'SN', pole: 'S', text: '你更容易被哪种人吸引：', a: '踏实务实的人', b: '富于想象的人' },
  { id: 'MBTI-10', dimension: 'SN', pole: 'S', text: '你更感兴趣的是：', a: '真实存在的事物', b: '可能存在的事物' },
  { id: 'MBTI-16', dimension: 'SN', pole: 'S', text: '做日常小事，你更可能：', a: '按老办法来', b: '按自己的方式来' },
  { id: 'MBTI-17', dimension: 'SN', pole: 'S', text: '你认为作家应该：', a: '有话直说、言必符实', b: '多用比喻来表达' },
  { id: 'MBTI-23', dimension: 'SN', pole: 'S', text: '关于事实，你认为是：', a: '不言自明', b: '用来说明原理的' },
  { id: 'MBTI-24', dimension: 'SN', pole: 'S', text: '你觉得有远见的人：', a: '有点让人烦', b: '相当有魅力' },
  { id: 'MBTI-30', dimension: 'SN', pole: 'S', text: '关于常识，你认为：', a: '很少值得怀疑', b: '常常值得怀疑' },
  { id: 'MBTI-31', dimension: 'SN', pole: 'S', text: '孩子们常常做得不够的是：', a: '让自己更有用处', b: '充分发挥想象力' },
  { id: 'MBTI-37', dimension: 'SN', pole: 'S', text: '你更像是：', a: '脚踏实地的实干派', b: '天马行空的幻想派' },
  { id: 'MBTI-38', dimension: 'SN', pole: 'S', text: '你更容易注意到别人：', a: '有什么用处', b: '怎么看世界' },
  { id: 'MBTI-44', dimension: 'SN', pole: 'S', text: '你做判断更多依据：', a: '事实', b: '原理' },
  { id: 'MBTI-45', dimension: 'SN', pole: 'S', text: '你更感兴趣于：', a: '生产与分配', b: '设计与研究' },
  { id: 'MBTI-51', dimension: 'SN', pole: 'S', text: '你更可能相信你的：', a: '经验', b: '直觉' },
  { id: 'MBTI-52', dimension: 'SN', pole: 'S', text: '你觉得自己：', a: '更务实而非机巧', b: '更机巧而非务实' },
  { id: 'MBTI-58', dimension: 'SN', pole: 'S', text: '你更珍视自己的：', a: '强烈的现实感', b: '生动的想象力' },
  { id: 'MBTI-59', dimension: 'SN', pole: 'S', text: '你更容易被什么吸引：', a: '基本面', b: '弦外之音' },
  { id: 'MBTI-65', dimension: 'SN', pole: 'S', text: '写作时你更喜欢：', a: '更字面的表达', b: '更比喻的表达' },
  { id: 'MBTI-66', dimension: 'SN', pole: 'S', text: '对你来说更难的是：', a: '体谅他人', b: '利用他人' },

  // ===== T/F 思考 vs 情感 (20题) =====
  { id: 'MBTI-04', dimension: 'TF', pole: 'T', text: '更令你印象深刻的是：', a: '原则', b: '情感' },
  { id: 'MBTI-05', dimension: 'TF', pole: 'T', text: '你更容易被什么打动：', a: '有说服力的（逻辑）', b: '感人的（温情）' },
  { id: 'MBTI-11', dimension: 'TF', pole: 'T', text: '评价他人时，你更容易受什么影响：', a: '规则甚于具体情况', b: '具体情况甚于规则' },
  { id: 'MBTI-12', dimension: 'TF', pole: 'T', text: '与人相处时，你更偏向：', a: '客观', b: '主观（重人情）' },
  { id: 'MBTI-18', dimension: 'TF', pole: 'T', text: '你更欣赏：', a: '思路前后一致', b: '人与人之间和谐的关系' },
  { id: 'MBTI-19', dimension: 'TF', pole: 'T', text: '做判断时你更自在：', a: '基于逻辑的判断', b: '基于价值的判断' },
  { id: 'MBTI-25', dimension: 'TF', pole: 'T', text: '你更常是：', a: '头脑冷静的人', b: '心地温热的人' },
  { id: 'MBTI-26', dimension: 'TF', pole: 'T', text: '更糟糕的是：', a: '不公正', b: '冷酷无情' },
  { id: 'MBTI-32', dimension: 'TF', pole: 'T', text: '做决定时，你更舒服地依据：', a: '标准', b: '感受' },
  { id: 'MBTI-33', dimension: 'TF', pole: 'T', text: '你更：', a: '刚强甚于温和', b: '温和甚于刚强' },
  { id: 'MBTI-39', dimension: 'TF', pole: 'T', text: '更令你满足的是：', a: '把一个议题彻底讨论清楚', b: '就某个议题达成一致' },
  { id: 'MBTI-40', dimension: 'TF', pole: 'T', text: '更多地左右你的是：', a: '你的理智', b: '你的情感' },
  { id: 'MBTI-46', dimension: 'TF', pole: 'T', text: '更像是赞美的是：', a: '“这是个非常讲逻辑的人”', b: '“这是个非常多愁善感的人”' },
  { id: 'MBTI-47', dimension: 'TF', pole: 'T', text: '你更看重自己：', a: '坚定不移', b: '忠心投入' },
  { id: 'MBTI-53', dimension: 'TF', pole: 'T', text: '更值得称赞的人是：', a: '思路清晰、有理有据', b: '情感强烈' },
  { id: 'MBTI-54', dimension: 'TF', pole: 'T', text: '你更偏向成为：', a: '公正的人', b: '有同情心的人' },
  { id: 'MBTI-60', dimension: 'TF', pole: 'T', text: '更大的错误是：', a: '太情绪化', b: '太客观' },
  { id: 'MBTI-61', dimension: 'TF', pole: 'T', text: '你觉得自己本质上：', a: '硬朗', b: '心软' },
  { id: 'MBTI-67', dimension: 'TF', pole: 'T', text: '你更希望自己拥有：', a: '清晰的理智', b: '温柔的怜悯' },
  { id: 'MBTI-68', dimension: 'TF', pole: 'T', text: '更大的缺点是：', a: '不分青红皂白', b: '过于苛责' },

  // ===== J/P 判断 vs 感知 (20题) =====
  { id: 'MBTI-06', dimension: 'JP', pole: 'J', text: '你更喜欢怎样工作：', a: '按截止日期完成', b: '无所谓，看心情' },
  { id: 'MBTI-07', dimension: 'JP', pole: 'J', text: '你倾向于：', a: '较为谨慎地选择', b: '较为随性冲动地选择' },
  { id: 'MBTI-13', dimension: 'JP', pole: 'J', text: '你更：', a: '守时', b: '随性' },
  { id: 'MBTI-14', dimension: 'JP', pole: 'J', text: '让你更难受的是事情：', a: '没做完', b: '已完成' },
  { id: 'MBTI-20', dimension: 'JP', pole: 'J', text: '你希望事情：', a: '定下来、有结论', b: '悬而未决、留有变数' },
  { id: 'MBTI-21', dimension: 'JP', pole: 'J', text: '你更像是：', a: '认真而坚定的人', b: '随和的人' },
  { id: 'MBTI-27', dimension: 'JP', pole: 'J', text: '通常应该让事情：', a: '经过审慎选择和取舍而发生', b: '随机、偶然地发生' },
  { id: 'MBTI-28', dimension: 'JP', pole: 'J', text: '你更满意于：', a: '已经买下了', b: '还保留着买不买的选择权' },
  { id: 'MBTI-34', dimension: 'JP', pole: 'J', text: '更值得钦佩的是：', a: '有条理、讲究方法的能力', b: '随机应变、因陋就简的能力' },
  { id: 'MBTI-35', dimension: 'JP', pole: 'J', text: '你更看重：', a: '无限的可能', b: '开放包容的心态' },
  { id: 'MBTI-41', dimension: 'JP', pole: 'J', text: '你更适应哪种工作方式：', a: '签了合同、确定下来', b: '临时、随意地进行' },
  { id: 'MBTI-42', dimension: 'JP', pole: 'J', text: '你更倾向于寻找：', a: '有秩序的东西', b: '碰上什么算什么' },
  { id: 'MBTI-48', dimension: 'JP', pole: 'J', text: '你更常偏好：', a: '最终、不可更改的定论', b: '暂定、初步的说法' },
  { id: 'MBTI-49', dimension: 'JP', pole: 'J', text: '你更自在于：', a: '做决定之后', b: '做决定之前' },
  { id: 'MBTI-55', dimension: 'JP', pole: 'J', text: '多数情况下最好：', a: '把事情安排妥当', b: '顺其自然' },
  { id: 'MBTI-56', dimension: 'JP', pole: 'J', text: '在关系里，多数事情应该：', a: '可以重新商量', b: '随机、因地制宜' },
  { id: 'MBTI-62', dimension: 'JP', pole: 'J', text: '更吸引你的情况是：', a: '有结构、有安排', b: '无结构、无安排' },
  { id: 'MBTI-63', dimension: 'JP', pole: 'J', text: '你更像是：', a: '按部就班而非随心所欲', b: '随心所欲而非按部就班' },
  { id: 'MBTI-69', dimension: 'JP', pole: 'J', text: '你更喜欢：', a: '计划好的活动', b: '没计划的活动' },
  { id: 'MBTI-70', dimension: 'JP', pole: 'J', text: '你更常是：', a: '深思熟虑而非随性', b: '随性而非深思熟虑' },
];

// 16 型人格描述
const TYPE_DESC = {
  INTJ: { name: '建筑师', trait: '富有想象力又有决断力的战略家', desc: '理性、独立、有远见，善于将愿景转化为系统方案。' },
  INTP: { name: '逻辑学家', trait: '热爱知识的创新思想家', desc: '逻辑严密、好奇心强，喜欢探索理论与抽象问题。' },
  ENTJ: { name: '指挥官', trait: '大胆、有魅力的领导者', desc: '果断、有战略眼光，善于组织和推动目标达成。' },
  ENTP: { name: '辩论家', trait: '聪明好奇的思想者', desc: '机智、有创造力，喜欢挑战观点、探索新可能。' },
  INFJ: { name: '提倡者', trait: '安静而神秘的理想主义者', desc: '有洞察力、有使命感，关心他人与世界的深层意义。' },
  INFP: { name: '调停者', trait: '诗意、善良的利他主义者', desc: '理想主义、富有同理心，追求内心真实的价值观。' },
  ENFJ: { name: '主人公', trait: '富有魅力的激励者', desc: '温暖、有感染力，善于引导他人成长与协作。' },
  ENFP: { name: '竞选者', trait: '热情、有创造力的自由灵魂', desc: '充满好奇与热情，善于发现生活中的可能性。' },
  ISTJ: { name: '物流师', trait: '务实、可靠的守护者', desc: '严谨、负责、注重事实与传统，值得信赖。' },
  ISFJ: { name: '守卫者', trait: '温暖、细致的保护者', desc: '善良、勤恳、有奉献精神，默默照顾身边的人。' },
  ESTJ: { name: '总经理', trait: '务实、果断的管理者', desc: '有条理、重秩序，善于组织资源和落实规则。' },
  ESFJ: { name: '执政官', trait: '热心、有责任感的小组守护者', desc: '友善、合群、乐于助人，重视和谐与传统。' },
  ISTP: { name: '鉴赏家', trait: '大胆而灵活的实验家', desc: '冷静、动手能力强，喜欢拆解和理解事物运作方式。' },
  ISFP: { name: '探险家', trait: '温和、有审美力的艺术家', desc: '敏感、有创意，活在当下，重视个人表达。' },
  ESTP: { name: '企业家', trait: '精力充沛的行动派', desc: '大胆、现实、善于应变，享受风险与挑战。' },
  ESFP: { name: '表演者', trait: '热情、即兴的明星', desc: '活泼、有感染力，享受当下与人际互动。' },
};

const DIM_INFO = {
  EI: { left: 'E', right: 'I', leftName: '外向', rightName: '内向', leftDesc: '能量来自外部，喜欢互动', rightDesc: '能量来自内部，喜欢深思' },
  SN: { left: 'S', right: 'N', leftName: '实感', rightName: '直觉', leftDesc: '关注具体事实与细节', rightDesc: '关注整体意义与可能' },
  TF: { left: 'T', right: 'F', leftName: '思考', rightName: '情感', leftDesc: '基于逻辑做决定', rightDesc: '基于价值与人做决定' },
  JP: { left: 'J', right: 'P', leftName: '判断', rightName: '感知', leftDesc: '喜欢计划与确定', rightDesc: '喜欢灵活与开放' },
};

function computeResult(answers, qs) {
  const counts = { E: 0, I: 0, S: 0, N: 0, T: 0, F: 0, J: 0, P: 0 };
  qs.forEach((q, i) => {
    const a = answers[i];
    if (a === 0) counts[q.pole]++;
    else if (a === 1) counts[opposite(q.pole)]++;
  });
  const type =
    (counts.E >= counts.I ? 'E' : 'I') +
    (counts.S >= counts.N ? 'S' : 'N') +
    (counts.T >= counts.F ? 'T' : 'F') +
    (counts.J >= counts.P ? 'J' : 'P');

  const dims = {};
  ['EI', 'SN', 'TF', 'JP'].forEach((d) => {
    const info = DIM_INFO[d];
    const l = counts[info.left];
    const r = counts[info.right];
    const total = l + r || 1;
    dims[d] = {
      left: l, right: r,
      leftPercent: Math.round((l / total) * 100),
      rightPercent: Math.round((r / total) * 100),
      dominant: l >= r ? info.left : info.right,
      info,
    };
  });

  const typeDesc = TYPE_DESC[type] || { name: '未知', trait: '', desc: '' };
  return {
    type,
    typeName: typeDesc.name,
    trait: typeDesc.trait,
    description: typeDesc.desc,
    dimensions: dims,
    counts,
    raw: Object.values(counts).reduce((a, b) => a + b, 0),
    total: qs.length,
    totalStat: { correct: 0, wrong: 0, skipped: qs.length - Object.values(counts).reduce((a, b) => a + b, 0) },
  };
}

function opposite(pole) {
  return { E: 'I', I: 'E', S: 'N', N: 'S', T: 'F', F: 'T', J: 'P', P: 'J' }[pole];
}


module.exports = {
  id: 'mbti',
  type: 'personality',
  name: 'MBTI 人格测试',
  shortName: 'MBTI',
  desc: '基于荣格类型论的 16 型人格测试，了解你的思维与行为偏好。',
  reference: "Myers, I.B. & Briggs, K.C. — MBTI® 类型指标；本题源为公开领域 70 题标准化版整理（简体中文译）",
  scoring: "四维度二分计分（E/I、S/N、T/F、J/P），按题项倾向归类型，无临床常模",
  icon: '🧠',
  color: '#7c3aed',
  duration: 20,
  questionCount: 70,
  tag: ['人格', '性格', '自我认知'],
  questionType: 'choice',

  getQuestions() {
    return QUESTIONS.map((q) => ({
      id: q.id,
      type: 'choice',
      dimension: q.dimension,
      pole: q.pole,
      prompt: q.text,
      options: [q.a, q.b],
      answer: null, // MBTI 无对错，answer 不使用
    }));
  },

  computeResult,

    getResultView(r, layout) {
    const _mkDim = function (r) {

    if (!r.dimensions) return [];
    return ['EI', 'SN', 'TF', 'JP'].map((d) => {
      const dim = r.dimensions[d];
      const info = dim.info;
      return {
        key: d,
        leftPole: info.left,
        rightPole: info.right,
        leftName: info.leftName,
        rightName: info.rightName,
        leftPercent: dim.leftPercent,
        rightPercent: dim.rightPercent,
        dominant: dim.dominant,
        dominantDesc: dim.dominant === info.left ? info.leftDesc : info.rightDesc,
      };
    });
  
    };
    const _mkInterp = function (r, groupList, scaleDimensionList) {

    return [
      { title: '人格类型', text: `${r.type} · ${r.typeName}：${r.trait}` },
      { title: '类型解读', text: r.description },
      { title: '认知偏好', text: `你的能量来自${r.dimensions.EI.dominant === 'E' ? '外部互动' : '内心深思'}，关注${r.dimensions.SN.dominant === 'S' ? '具体事实' : '抽象可能'}，决策时偏重${r.dimensions.TF.dominant === 'T' ? '逻辑分析' : '人情感受'}，生活节奏${r.dimensions.JP.dominant === 'J' ? '喜欢计划' : '保持灵活'}。` },
      { title: '发展建议', text: '了解自己的偏好有助于选择适合的工作与生活方式，同时也可有意识发展非主导功能以获得更全面的视角。' },
    ];
  
    };
    const groups = [];
    const dims = _mkDim(r);
    const subtests = [];
    const interpretations = _mkInterp(r, groups, dims);
    const showBipolar = !!(dims[0] && dims[0].leftPercent !== undefined);
    return { groups, dims, subtests, interpretations, showBipolar };
  },// 维度标签：MBTI 四大维度
  resultLayout: {
    primaryField: 'type',
    primaryLabel: '人格类型',
    primarySuffix: '',
    groupLabels: DIM_INFO,
    interpretation: true,
    renderMode: 'bipolar',
  },
};
