/**
 * MBTI 人格测试模块（简化版 28 题）
 *
 * 4 个维度，每维度 7 题，共 28 题：
 *   E/I  外向/内向
 *   S/N  实感/直觉
 *   T/F  思考/情感
 *   J/P  判断/感知
 *
 * 每题为二选一（choiceA / choiceB），分别对应两个维度极。
 */

const QUESTIONS = [
  // ===== E/I 外向 vs 内向 (7题) =====
  { id: 'MBTI-01', dimension: 'EI', pole: 'E', text: '在聚会中，你更倾向于：', a: '主动结识新朋友，享受热闹', b: '与熟人深聊，或找个安静角落' },
  { id: 'MBTI-02', dimension: 'EI', pole: 'E', text: '经过一天忙碌社交后，你会：', a: '感到充实，还想继续', b: '觉得疲惫，需要独处充电' },
  { id: 'MBTI-03', dimension: 'EI', pole: 'I', text: '遇到问题时，你通常：', a: '先和别人讨论，边说边想', b: '先自己思考，想清楚再说' },
  { id: 'MBTI-04', dimension: 'EI', pole: 'E', text: '在新环境中，你：', a: '很快适应并开始互动', b: '需要时间观察，慢慢融入' },
  { id: 'MBTI-05', dimension: 'EI', pole: 'I', text: '你的能量来源更多是：', a: '外部的人和事', b: '内心的思考与独处' },
  { id: 'MBTI-06', dimension: 'EI', pole: 'E', text: '周末空闲时，你更想：', a: '约朋友一起活动', b: '在家看书或做自己的事' },
  { id: 'MBTI-07', dimension: 'EI', pole: 'I', text: '说话方式上，你：', a: '想到就说，边说边整理', b: '想好再说，表达较简洁' },

  // ===== S/N 实感 vs 直觉 (7题) =====
  { id: 'MBTI-08', dimension: 'SN', pole: 'S', text: '你更相信：', a: '具体的事实和经验', b: '直觉和未来的可能性' },
  { id: 'MBTI-09', dimension: 'SN', pole: 'N', text: '看一本书时，你更关注：', a: '细节和实际操作步骤', b: '整体思想和隐含意义' },
  { id: 'MBTI-10', dimension: 'SN', pole: 'S', text: '你更喜欢的任务是：', a: '明确、可执行、有标准答案的', b: '开放、有想象空间的' },
  { id: 'MBTI-11', dimension: 'SN', pole: 'N', text: '描述一件事，你倾向于：', a: '按步骤讲清楚来龙去脉', b: '讲整体含义和象征' },
  { id: 'MBTI-12', dimension: 'SN', pole: 'S', text: '你更欣赏的人是：', a: '脚踏实地、注重现实的人', b: '富有想象力、有远见的人' },
  { id: 'MBTI-13', dimension: 'SN', pole: 'N', text: '面对新项目，你先想：', a: '如何落地执行', b: '它的长远意义和可能演变' },
  { id: 'MBTI-14', dimension: 'SN', pole: 'S', text: '你认为自己更擅长：', a: '记住具体细节和数据', b: '把握抽象概念和模式' },

  // ===== T/F 思考 vs 情感 (7题) =====
  { id: 'MBTI-15', dimension: 'TF', pole: 'T', text: '做决定时，你更看重：', a: '客观逻辑和利弊分析', b: '人的感受和价值观' },
  { id: 'MBTI-16', dimension: 'TF', pole: 'F', text: '朋友向你倾诉，你倾向于：', a: '帮他分析问题、给建议', b: '先共情、安慰他的情绪' },
  { id: 'MBTI-17', dimension: 'TF', pole: 'T', text: '你认为公平是：', a: '一视同仁，按规则办事', b: '因人而异，考虑特殊情况' },
  { id: 'MBTI-18', dimension: 'TF', pole: 'F', text: '评价他人时，你更在意：', a: '他是否讲理、有能力', b: '他是否善良、有同理心' },
  { id: 'MBTI-19', dimension: 'TF', pole: 'T', text: '冲突中，你希望：', a: '把道理讲清楚，对事不对人', b: '照顾各方情绪，维护关系' },
  { id: 'MBTI-20', dimension: 'TF', pole: 'F', text: '你更不喜欢：', a: '感情用事、不讲逻辑的人', b: '冷漠无情、只讲规则的人' },
  { id: 'MBTI-21', dimension: 'TF', pole: 'T', text: '被批评时，你更在意：', a: '批评是否客观有据', b: '对方的语气和态度' },

  // ===== J/P 判断 vs 感知 (7题) =====
  { id: 'MBTI-22', dimension: 'JP', pole: 'J', text: '出门旅行，你更倾向：', a: '提前做好详细计划', b: '随性而行，到时再说' },
  { id: 'MBTI-23', dimension: 'JP', pole: 'P', text: '对待截止日期：', a: '尽量提前完成', b: '常在最后期限前冲刺' },
  { id: 'MBTI-24', dimension: 'JP', pole: 'J', text: '你的桌面/房间通常：', a: '整洁有序，物归原位', b: '有些凌乱，但自己能找到' },
  { id: 'MBTI-25', dimension: 'JP', pole: 'P', text: '面对多个选择，你：', a: '尽快决定，确定方向', b: '保持开放，多收集信息' },
  { id: 'MBTI-26', dimension: 'JP', pole: 'J', text: '你更喜欢的生活节奏是：', a: '有计划、有掌控感', b: '灵活、充满变化' },
  { id: 'MBTI-27', dimension: 'JP', pole: 'P', text: '做项目时，你更享受：', a: '收尾、完成的那一刻', b: '探索、讨论的过程' },
  { id: 'MBTI-28', dimension: 'JP', pole: 'J', text: '对于规则，你通常：', a: '遵守并维护', b: '视情况灵活处理' },
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
  icon: '🧠',
  color: '#7c3aed',
  duration: 12,
  questionCount: 28,
  paid: false,
  price: 0,
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

  buildDimensionList(r) {
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
  },

  buildInterpretations(r) {
    return [
      { title: '人格类型', text: `${r.type} · ${r.typeName}：${r.trait}` },
      { title: '类型解读', text: r.description },
      { title: '认知偏好', text: `你的能量来自${r.dimensions.EI.dominant === 'E' ? '外部互动' : '内心深思'}，关注${r.dimensions.SN.dominant === 'S' ? '具体事实' : '抽象可能'}，决策时偏重${r.dimensions.TF.dominant === 'T' ? '逻辑分析' : '人情感受'}，生活节奏${r.dimensions.JP.dominant === 'J' ? '喜欢计划' : '保持灵活'}。` },
      { title: '发展建议', text: '了解自己的偏好有助于选择适合的工作与生活方式，同时也可有意识发展非主导功能以获得更全面的视角。' },
    ];
  },

  // 维度标签：MBTI 四大维度
  getDimensionLabel(dim) {
    const labels = { EI: '外向/内向', SN: '实感/直觉', TF: '思考/情感', JP: '判断/感知' };
    return labels[dim] || dim;
  },

  resultLayout: {
    primaryField: 'type',
    primaryLabel: '人格类型',
    primarySuffix: '',
    showGroups: true,
    groupLabels: DIM_INFO,
    showDetail: false,
    interpretation: true,
    renderMode: 'bipolar',
  },
};
