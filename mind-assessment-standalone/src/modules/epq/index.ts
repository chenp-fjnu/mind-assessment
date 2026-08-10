/**
 * EPQ 艾森克人格问卷（简化版 48 题）
 *
 * 四个维度，每维度 12 题，共 48 题：
 *   E  外向性 (Extraversion)     — 外向热情 vs 内向安静
 *   N  神经质 (Neuroticism)      — 情绪不稳 vs 情绪稳定
 *   P  精神质 (Psychoticism)     — 孤僻不合群 vs 合群友善
 *   L  掩饰性 (Lie)              — 掩饰性强 vs 坦诚
 *
 * 每题为是/否二选一（choice），答案以选项索引存储：
 *   0 = 否，1 = 是
 * 评分：每维度统计"是"的数量（考虑反向计分），
 *       简化为百分位 percent = score / 12 * 100，
 *       并给出 T 分参考（均数 50，标准差 10）。
 * 人格类型由 E、N 两维度的 high/low 组合得出，如"外向稳定型"。
 */

// 维度说明
const DIM_INFO: Record<string, { name: string; en: string; desc: string; high: string; low: string }> = {
  E: { name: '外向性', en: 'Extraversion', desc: '社交活力与外向程度', high: '外向热情，喜欢社交与活动，精力充沛。', low: '内向安静，偏好独处与深思，沉稳内敛。' },
  N: { name: '神经质', en: 'Neuroticism', desc: '情绪稳定性与敏感度', high: '情绪不稳定，易焦虑紧张，感受细腻。', low: '情绪稳定，从容淡定，抗压能力较强。' },
  P: { name: '精神质', en: 'Psychoticism', desc: '孤僻与合群倾向', high: '较孤僻独立，不太合群，行为可能出格。', low: '合群友善，乐于合作，顾及他人。' },
  L: { name: '掩饰性', en: 'Lie', desc: '社会期望性应答', high: '掩饰性较强，倾向于呈现理想化自我。', low: '较为坦诚，应答真实自然。' },
};

// E/N 高低组合得到的人格类型
const TYPE_DESC: Record<string, { name: string; trait: string; desc: string }> = {
  E_HN_L: { name: '外向稳定型', trait: '开朗健谈·从容淡定', desc: '你外向热情、善于社交，同时情绪稳定、从容自信。在团队中常是积极的推动者，能承受压力并保持乐观。' },
  E_HN_H: { name: '外向敏感型', trait: '热情活泼·情绪敏感', desc: '你外向活泼、热爱社交，但情绪较为敏感，容易因外界刺激而波动。富有激情，需注意情绪调节。' },
  E_LN_L: { name: '内向稳定型', trait: '沉静内敛·情绪平稳', desc: '你安静内敛、喜欢独处，情绪平稳温和。做事沉稳可靠，善于独立思考与深度工作。' },
  E_LN_H: { name: '内向敏感型', trait: '安静含蓄·多思多虑', desc: '你安静含蓄、内心丰富，但情绪较易波动，常多思多虑。感受细腻，需关注情绪健康与压力释放。' },
};

// 48 题：每维度 12 题，reverse 表示反向计分（答"否"得分）
const QUESTIONS = [
  // ===== E 外向性 (12题) =====
  { id: 'EPQ-01', dimension: 'E', reverse: false, text: '你喜欢热闹吗？' },
  { id: 'EPQ-02', dimension: 'E', reverse: false, text: '你是一个健谈的人吗？' },
  { id: 'EPQ-03', dimension: 'E', reverse: false, text: '你喜欢主动和陌生人交谈吗？' },
  { id: 'EPQ-04', dimension: 'E', reverse: false, text: '你在聚会中能活跃气氛吗？' },
  { id: 'EPQ-05', dimension: 'E', reverse: false, text: '你做事总是精力充沛、风风火火吗？' },
  { id: 'EPQ-06', dimension: 'E', reverse: false, text: '你喜欢参加人多热闹的活动吗？' },
  { id: 'EPQ-07', dimension: 'E', reverse: false, text: '和不熟悉的人在一起你也能很快放松吗？' },
  { id: 'EPQ-08', dimension: 'E', reverse: true,  text: '你倾向于沉默寡言吗？' },
  { id: 'EPQ-09', dimension: 'E', reverse: true,  text: '你更喜欢安静独处而非热闹场合吗？' },
  { id: 'EPQ-10', dimension: 'E', reverse: true,  text: '在人群中你常常感到拘谨吗？' },
  { id: 'EPQ-11', dimension: 'E', reverse: true,  text: '你不太愿意主动表达自己的想法吗？' },
  { id: 'EPQ-12', dimension: 'E', reverse: true,  text: '你经常回避社交活动吗？' },

  // ===== N 神经质 (12题) =====
  { id: 'EPQ-13', dimension: 'N', reverse: false, text: '你是一个容易动感情的人吗？' },
  { id: 'EPQ-14', dimension: 'N', reverse: false, text: '你常感到心里烦躁不安吗？' },
  { id: 'EPQ-15', dimension: 'N', reverse: false, text: '你的情绪容易大起大落吗？' },
  { id: 'EPQ-16', dimension: 'N', reverse: false, text: '你常为一些小事担忧吗？' },
  { id: 'EPQ-17', dimension: 'N', reverse: false, text: '你容易紧张焦虑吗？' },
  { id: 'EPQ-18', dimension: 'N', reverse: false, text: '遇到挫折你会长时间情绪低落吗？' },
  { id: 'EPQ-19', dimension: 'N', reverse: false, text: '你常感到莫名的忧虑吗？' },
  { id: 'EPQ-20', dimension: 'N', reverse: true,  text: '你通常能保持心情平静吗？' },
  { id: 'EPQ-21', dimension: 'N', reverse: true,  text: '你很少感到紧张不安吗？' },
  { id: 'EPQ-22', dimension: 'N', reverse: true,  text: '你能从容应对压力吗？' },
  { id: 'EPQ-23', dimension: 'N', reverse: true,  text: '你很少因小事而心烦吗？' },
  { id: 'EPQ-24', dimension: 'N', reverse: true,  text: '你认为自己情绪比较稳定吗？' },

  // ===== P 精神质 (12题) =====
  { id: 'EPQ-25', dimension: 'P', reverse: false, text: '你喜欢独自一人做事吗？' },
  { id: 'EPQ-26', dimension: 'P', reverse: false, text: '你觉得和人打交道很麻烦吗？' },
  { id: 'EPQ-27', dimension: 'P', reverse: false, text: '你不太在意别人的感受吗？' },
  { id: 'EPQ-28', dimension: 'P', reverse: false, text: '你有时会做出一些出格的事吗？' },
  { id: 'EPQ-29', dimension: 'P', reverse: false, text: '你喜欢捉弄别人或搞恶作剧吗？' },
  { id: 'EPQ-30', dimension: 'P', reverse: false, text: '你觉得大多数规则都可以被打破吗？' },
  { id: 'EPQ-31', dimension: 'P', reverse: false, text: '你倾向于独来独往吗？' },
  { id: 'EPQ-32', dimension: 'P', reverse: true,  text: '你很在意别人的感受吗？' },
  { id: 'EPQ-33', dimension: 'P', reverse: true,  text: '你乐于与人合作共事吗？' },
  { id: 'EPQ-34', dimension: 'P', reverse: true,  text: '你是一个友善合群的人吗？' },
  { id: 'EPQ-35', dimension: 'P', reverse: true,  text: '你做事会顾及他人感受吗？' },
  { id: 'EPQ-36', dimension: 'P', reverse: true,  text: '你喜欢参加集体活动吗？' },

  // ===== L 掩饰性 (12题) =====
  { id: 'EPQ-37', dimension: 'L', reverse: false, text: '你从未说过谎吗？' },
  { id: 'EPQ-38', dimension: 'L', reverse: false, text: '你从未迟到过吗？' },
  { id: 'EPQ-39', dimension: 'L', reverse: false, text: '你从未在背后议论过别人吗？' },
  { id: 'EPQ-40', dimension: 'L', reverse: false, text: '你从未闯过红灯吗？' },
  { id: 'EPQ-41', dimension: 'L', reverse: false, text: '你从未对别人发过脾气吗？' },
  { id: 'EPQ-42', dimension: 'L', reverse: false, text: '你从未偷懒过吗？' },
  { id: 'EPQ-43', dimension: 'L', reverse: false, text: '你从未违背过自己的承诺吗？' },
  { id: 'EPQ-44', dimension: 'L', reverse: false, text: '你从未占过别人的小便宜吗？' },
  { id: 'EPQ-45', dimension: 'L', reverse: false, text: '你从未在开车或骑车时违反过交通规则吗？' },
  { id: 'EPQ-46', dimension: 'L', reverse: false, text: '你从未迟到早退过吗？' },
  { id: 'EPQ-47', dimension: 'L', reverse: false, text: '你从未对工作敷衍了事吗？' },
  { id: 'EPQ-48', dimension: 'L', reverse: false, text: '你从未把别人的过失放在心上吗？' },
];

// 是/否选项：index 0 = 否，index 1 = 是
const YES_NO_OPTIONS = ['否', '是'];

function computeResult(answers: any[], qs: any[]) {
  const dims: Record<string, { score: number; count: number }> = { E: { score: 0, count: 0 }, N: { score: 0, count: 0 }, P: { score: 0, count: 0 }, L: { score: 0, count: 0 } };

  qs.forEach((q, i) => {
    const d = q.dimension;
    dims[d].count++;
    const a = answers[i];
    if (a == null) return;
    // a: 0(否) / 1(是)；reverse 题答"否"计 1 分
    const score = q.reverse ? (1 - a) : a;
    dims[d].score += score;
  });

  const groups: Record<string, number> = {};
  const dimensions: Record<string, any> = {};
  Object.keys(dims).forEach((d) => {
    const { score, count } = dims[d];
    const total = count || 12;
    const percent = Math.round((score / total) * 100);
    // 简化 T 分（均数 50，标准差 10）：以 total/2 为均分参考，total/4 为标准差参考
    const tScore = Math.round(50 + ((score - total / 2) / (total / 4)) * 10);
    const info = DIM_INFO[d];
    groups[d] = score;
    dimensions[d] = {
      name: info.name,
      en: info.en,
      score,
      count: total,
      percent,
      tScore,
      level: percent >= 50 ? 'high' : 'low',
      text: percent >= 50 ? info.high : info.low,
    };
  });

  // 由 E、N 的 high/low 组合得到人格类型
  const eHigh = dimensions.E.percent >= 50;
  const nHigh = dimensions.N.percent >= 50;
  let typeKey: string;
  if (eHigh && !nHigh) typeKey = 'E_HN_L';
  else if (eHigh && nHigh) typeKey = 'E_HN_H';
  else if (!eHigh && !nHigh) typeKey = 'E_LN_L';
  else typeKey = 'E_LN_H';
  const typeInfo = TYPE_DESC[typeKey];

  return {
    type: typeInfo.name,
    typeName: typeInfo.name,
    trait: typeInfo.trait,
    description: typeInfo.desc,
    dimensions,
    groups,
    raw: groups.E + groups.N + groups.P + groups.L,
    total: qs.length,
    totalStat: { correct: 0, wrong: 0, skipped: answers.filter((a: any) => a == null).length },
  };
}

export default {
  id: 'epq',
  type: 'personality',
  name: '艾森克人格问卷',
  shortName: 'EPQ',
  desc: '基于艾森克人格问卷的简化版测评，评估外向性、神经质、精神质与掩饰性四个维度。',
  icon: '🔬',
  color: '#4338ca',
  duration: 10,
  questionCount: 48,
  paid: false,
  price: 0,
  tag: ['人格', '性格', 'EPQ'],
  questionType: 'choice',

  getQuestions() {
    return QUESTIONS.map((q) => ({
      id: q.id,
      type: 'choice',
      dimension: q.dimension,
      reverse: q.reverse,
      prompt: q.text,
      options: YES_NO_OPTIONS, // 0=否，1=是
      answer: null, // EPQ 无对错
    }));
  },

  computeResult,

  buildGroupList(r: any, layout: any) {
    return ['E', 'N', 'P', 'L'].map((k) => ({
      key: k,
      label: layout.groupLabels[k] || k,
      percent: Math.round((r.groups[k] / 12) * 100),
      display: `${r.groups[k]}/12`,
      isScale: true,
    }));
  },

  buildInterpretations(r: any) {
    const d = r.dimensions;
    return [
      { title: '人格类型', text: `${r.type}：${r.description}` },
      { title: '维度解读', text: `外向性 ${d.E.percent}%（${d.E.text}）；神经质 ${d.N.percent}%（${d.N.text}）；精神质 ${d.P.percent}%（${d.P.text}）；掩饰性 ${d.L.percent}%（${d.L.text}）。` },
      { title: '行为倾向', text: r.trait + '。' + (d.E.level === 'high' ? '你善于在社交互动中获取能量。' : '你更擅长在独处思考中恢复能量。') + (d.N.level === 'high' ? '建议加强情绪管理与压力调节。' : '你的情绪基础良好，继续保持。') },
      { title: '发展建议', text: 'EPQ 各维度无优劣之分，了解自身倾向有助于职业选择与人际相处。若 L（掩饰性）偏高，提示作答时社会期望影响较大，建议更真实作答以获得准确结果。' },
    ];
  },

  // 维度标签：EPQ 四个维度
  getDimensionLabel(dim: string) {
    const labels: Record<string, string> = { E: '外向性', N: '神经质', P: '精神质', L: '掩饰性' };
    return labels[dim] || dim;
  },

  resultLayout: {
    primaryField: 'type',
    primaryLabel: '人格类型',
    primarySuffix: '',
    showGroups: true,
    groupLabels: { E: '外向性', N: '神经质', P: '精神质', L: '掩饰性' },
    showDetail: false,
    interpretation: true,
  },
};
