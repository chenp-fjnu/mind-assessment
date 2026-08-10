/**
 * LAS 爱情态度量表（Love Attitudes Scale）
 *
 * 基于 John Alan Lee 的爱情色彩理论，6 种爱情风格：
 *   Eros（激情型）、Ludus（游戏型）、Storge（友谊型）
 *   Pragma（实用型）、Mania（狂热型）、Agape（奉献型）
 *
 * 简化版共 24 题，每个维度 4 题，5 级评分：
 *   1 = 完全不同意
 *   2 = 不同意
 *   3 = 中立
 *   4 = 同意
 *   5 = 完全同意
 *
 * 评分：各维度分值之和（4-20），最高分维度为主导爱情风格
 */

const DIMENSIONS = {
  eros: { name: '激情型', icon: '🔥', color: '#dc2626', desc: '基于强烈的身体吸引力与情感共鸣，爱得热烈而专注。' },
  ludus: { name: '游戏型', icon: '🎲', color: '#d97706', desc: '将爱情视为游戏，享受追求过程，不愿被束缚。' },
  storge: { name: '友谊型', icon: '🤝', color: '#16a34a', desc: '爱情由友情自然发展而来，温和而稳定。' },
  pragma: { name: '实用型', icon: '📋', color: '#2563eb', desc: '理性考量伴侣条件，注重现实匹配度。' },
  mania: { name: '狂热型', icon: '⚡', color: '#7c3aed', desc: '情感强烈而波动，易嫉妒，极度依赖伴侣。' },
  agape: { name: '奉献型', icon: '💝', color: '#0d9488', desc: '无私付出，将伴侣的需要置于自己之上。' },
};

const QUESTIONS = [
  // Eros 激情型
  { id: 'LAS-01', dim: 'eros', text: '我和伴侣一见钟情，很快坠入爱河。' },
  { id: 'LAS-02', dim: 'eros', text: '我和伴侣之间有强烈的外在吸引力。' },
  { id: 'LAS-03', dim: 'eros', text: '我们的爱情来得迅速而热烈。' },
  { id: 'LAS-04', dim: 'eros', text: '我感到与伴侣在身体和情感上都很契合。' },
  // Ludus 游戏型
  { id: 'LAS-05', dim: 'ludus', text: '我尽量不让伴侣完全了解我。' },
  { id: 'LAS-06', dim: 'ludus', text: '我相信一个人可以同时爱多个对象。' },
  { id: 'LAS-07', dim: 'ludus', text: '我喜欢与不同的人保持暧昧关系。' },
  { id: 'LAS-08', dim: 'ludus', text: '当伴侣太过依赖我时，我会想要退出。' },
  // Storge 友谊型
  { id: 'LAS-09', dim: 'storge', text: '我们的爱情是由长久友情自然发展而来的。' },
  { id: 'LAS-10', dim: 'storge', text: '我难以说出爱情与友情的确切分界。' },
  { id: 'LAS-11', dim: 'storge', text: '我们的爱情是最亲密友谊的延伸。' },
  { id: 'LAS-12', dim: 'storge', text: '相比激情，我更看重与伴侣的默契与陪伴。' },
  // Pragma 实用型
  { id: 'LAS-13', dim: 'pragma', text: '在选择伴侣前，我会考虑对方的生活规划。' },
  { id: 'LAS-14', dim: 'pragma', text: '伴侣是否符合我对未来生活的设想很重要。' },
  { id: 'LAS-15', dim: 'pragma', text: '我会理性评估对方是否是"合适的人选"。' },
  { id: 'LAS-16', dim: 'pragma', text: '我会考虑对方的背景、职业等现实条件。' },
  // Mania 狂热型
  { id: 'LAS-17', dim: 'mania', text: '当伴侣不注意我时，我会感到焦虑不安。' },
  { id: 'LAS-18', dim: 'mania', text: '我会因为伴侣的一举一动而情绪波动。' },
  { id: 'LAS-19', dim: 'mania', text: '我容易对伴侣产生强烈的嫉妒。' },
  { id: 'LAS-20', dim: 'mania', text: '我无法忍受与伴侣分离。' },
  // Agape 奉献型
  { id: 'LAS-21', dim: 'agape', text: '我会为了伴侣的幸福而牺牲自己的利益。' },
  { id: 'LAS-22', dim: 'agape', text: '我将伴侣的需要放在自己的需要之上。' },
  { id: 'LAS-23', dim: 'agape', text: '我愿意无条件地付出而不求回报。' },
  { id: 'LAS-24', dim: 'agape', text: '只要伴侣快乐，我愿意承受一切。' },
];

const SCALE_LABELS = ['完全不同意', '不同意', '中立', '同意', '完全同意'];

function computeResult(answers, qs) {
  let answered = 0;
  const items = [];
  const dimScores = {};
  const dimCounts = {};

  Object.keys(DIMENSIONS).forEach((k) => {
    dimScores[k] = 0;
    dimCounts[k] = 0;
  });

  qs.forEach((q, i) => {
    const raw = answers[i];
    if (raw == null) {
      items.push({ id: q.id, answered: false, value: 0 });
      return;
    }
    answered++;
    const val = raw + 1; // 0-4 → 1-5
    dimScores[q.dim] += val;
    dimCounts[q.dim] += 1;
    items.push({ id: q.id, answered: true, value: val, score: val, dim: q.dim });
  });

  // 找出最高分维度
  let maxDim = 'eros';
  let maxScore = -1;
  Object.entries(dimScores).forEach(([k, v]) => {
    if (v > maxScore) {
      maxScore = v;
      maxDim = k;
    }
  });

  const dominant = DIMENSIONS[maxDim];

  return {
    raw: maxScore,
    total: qs.length,
    totalStat: { correct: 0, wrong: 0, skipped: qs.length - answered },
    score: maxScore,
    dominantStyle: maxDim,
    dominantName: dominant.name,
    level: dominant.name,
    levelColor: dominant.color,
    type: maxDim,
    typeName: dominant.name,
    trait: `${dominant.name}型`,
    description: dominant.desc,
    groups: { ...dimScores },
    groupDetails: Object.fromEntries(
      Object.entries(DIMENSIONS).map(([k, v]) => [
        k,
        { name: v.name, icon: v.icon, color: v.color, desc: v.desc, sum: dimScores[k], avg: dimCounts[k] ? Math.round((dimScores[k] / dimCounts[k]) * 10) / 10 : 0, max: 20 },
      ])
    ),
    items,
    dominant,
  };
}

module.exports = {
  id: 'las',
  type: 'self',
  name: '爱情态度量表',
  shortName: 'LAS',
  desc: '基于 Lee 的爱情色彩理论，测查你在亲密关系中的 6 种爱情风格倾向。',
  icon: '❤️',
  color: '#be185d',
  duration: 8,
  questionCount: 24,
  paid: false,
  price: 0,
  tag: ['自我', '爱情', '亲密关系'],
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
    return Object.entries(r.groups).map(([k, v]) => {
      const detail = r.groupDetails[k];
      return {
        key: k,
        label: detail ? `${detail.icon} ${detail.name}` : (layout.groupLabels[k] || k),
        percent: Math.round((v / 20) * 100),
        display: `${v}/20`,
        isScale: true,
      };
    });
  },

  buildInterpretations(r) {
    const top3 = Object.entries(r.groups)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([k]) => r.groupDetails[k]);

    return [
      { title: '主导风格', text: `你的主导爱情风格是${r.dominantName}型（${r.dominant.icon}）。${r.description}` },
      { title: '风格排序', text: `你最突出的三种风格依次是：${top3.map((d) => `${d.name}(${d.sum}分)`).join('、')}。` },
      { title: '风格说明', text: '每个人通常以一两种风格为主导，并兼有其他风格的特征。风格无好坏之分，了解自己的倾向有助于更好地经营亲密关系。' },
      { title: '提醒', text: '本量表为自评工具，结果仅供参考。爱情是复杂的情感体验，量表仅反映你的倾向性。' },
    ];
  },

  getDimensionLabel(dim) {
    const map = { eros: '激情', ludus: '游戏', storge: '友谊', pragma: '实用', mania: '狂热', agape: '奉献' };
    return map[dim] || dim;
  },

  resultLayout: {
    primaryField: 'dominantName',
    primaryLabel: '主导风格',
    primarySuffix: '型',
    showGroups: true,
    groupLabels: { eros: '激情型', ludus: '游戏型', storge: '友谊型', pragma: '实用型', mania: '狂热型', agape: '奉献型' },
    showDetail: false,
    interpretation: true,
  },
};
