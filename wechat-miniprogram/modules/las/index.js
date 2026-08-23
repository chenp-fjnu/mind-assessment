/**
 * LAS 爱情态度量表（Love Attitudes Scale）
 *
 * 基于 John Alan Lee 的爱情色彩理论，6 种爱情风格：
 *   Eros（激情型）、Ludus（游戏型）、Storge（友谊型）
 *   Pragma（实用型）、Mania（狂热型）、Agape（奉献型）
 *
 * 采用 Hendrick & Hendrick (1986) 公开发表的真实题本（Love Attitudes Scale
 * 长版），共 42 题，每个维度 7 题，5 级评分：
 *   1 = 完全不同意
 *   2 = 不同意
 *   3 = 中立
 *   4 = 同意
 *   5 = 完全同意
 *
 * 题项来源 / Sources:
 *   - Lumen Learning「Activity: Love Attitude Scale」（逐题与风格对应，
 *     Hendrick & Hendrick, 1986, JPSP, 50, 392-402；APA 授权转载）
 *     https://courses.lumenlearning.com/suny-hccc-ss-152-1/chapter/assignment-love-attitude-scale
 *   - APA PsycNet: Love Attitudes Scale--Revised (42-item, 7/style)
 *     https://psycnet.apa.org/doi/10.1037/t02319-000
 *   - psytests.org: Love Attitudes Scale, LAS
 *     https://psytests.org/ipl/aalsen.html
 *
 * 说明：题本为真实版权量表，已获用户授权使用并附免责声明（全局统一添加）。
 * Sternberg 的 Triangular Love Scale (TLS-45) 是另一套量表（3 维度、1-9 级），
 * 与本模块的 6 风格框架不兼容，故此处采用真实、可核验的 Hendrick LAS 长版。
 *
 * 评分：各维度分值之和（7-35），最高分维度为主导爱情风格
 */

const DIMENSIONS = {
  eros: { name: '激情型', icon: '🔥', color: '#dc2626', desc: '基于强烈的身体吸引力与情感共鸣，爱得热烈而专注。' },
  ludus: { name: '游戏型', icon: '🎲', color: '#d97706', desc: '将爱情视为游戏，享受追求过程，不愿被束缚。' },
  storge: { name: '友谊型', icon: '🤝', color: '#16a34a', desc: '爱情由友情自然发展而来，温和而稳定。' },
  pragma: { name: '实用型', icon: '📋', color: '#2563eb', desc: '理性考量伴侣条件，注重现实匹配度。' },
  mania: { name: '狂热型', icon: '⚡', color: '#7c3aed', desc: '情感强烈而波动，易嫉妒，极度依赖伴侣。' },
  agape: { name: '奉献型', icon: '💝', color: '#0d9488', desc: '无私付出，将伴侣的需要置于自己之上。' },
};

// 真实题本（Hendrick & Hendrick, 1986 Love Attitudes Scale，长版 42 题，7/风格）
// 维度分配与原始量表计分键一致：Eros(1,7,13,19,25,31,37) Ludus(2,8,14,20,26,32,38)
// Storge(3,9,15,21,27,33,39) Pragma(4,10,16,22,28,34,40) Mania(5,11,17,23,29,35,41) Agape(6,12,18,24,30,36,42)
const QUESTIONS = [
  // Eros 激情型 (1,7,13,19,25,31,37)
  { id: 'LAS-01', dim: 'eros', text: '我和伴侣在初次相见后便立刻相互吸引。' },
  { id: 'LAS-07', dim: 'eros', text: '我和伴侣之间有恰到好处的身体"化学反应"（契合感）。' },
  { id: 'LAS-13', dim: 'eros', text: '我们的亲密关系非常热烈且令人满足。' },
  { id: 'LAS-19', dim: 'eros', text: '我感到我和伴侣是天造地设的一对。' },
  { id: 'LAS-25', dim: 'eros', text: '我和伴侣很快就在情感上深入交往。' },
  { id: 'LAS-31', dim: 'eros', text: '我和伴侣真正理解彼此。' },
  { id: 'LAS-37', dim: 'eros', text: '伴侣符合我理想中的外貌标准。' },
  // Ludus 游戏型 (2,8,14,20,26,32,38)
  { id: 'LAS-02', dim: 'ludus', text: '我试图让伴侣对我的承诺有些拿不准。' },
  { id: 'LAS-08', dim: 'ludus', text: '我相信伴侣不知道的关于我的事，不会伤害到他/她。' },
  { id: 'LAS-14', dim: 'ludus', text: '我有时不得不隐瞒，不让两位伴侣发现彼此的存在。' },
  { id: 'LAS-20', dim: 'ludus', text: '我能相当轻松、快速地走出一段恋情。' },
  { id: 'LAS-26', dim: 'ludus', text: '如果伴侣知道我和别人做过的某些事，他/她会心烦。' },
  { id: 'LAS-32', dim: 'ludus', text: '当伴侣对我太过依赖时，我想稍微退后一些。' },
  { id: 'LAS-38', dim: 'ludus', text: '我喜欢和不同的伴侣玩"爱情游戏"。' },
  // Storge 友谊型 (3,9,15,21,27,33,39)
  { id: 'LAS-03', dim: 'storge', text: '很难说清友情在哪里结束、爱情在哪里开始。' },
  { id: 'LAS-09', dim: 'storge', text: '真正的爱首先需要一段时间的关心。' },
  { id: 'LAS-15', dim: 'storge', text: '我期望与所爱之人永远是朋友。' },
  { id: 'LAS-21', dim: 'storge', text: '最好的爱从长久的友谊中生长出来。' },
  { id: 'LAS-27', dim: 'storge', text: '我们的友情随着时间逐渐融为爱情。' },
  { id: 'LAS-33', dim: 'storge', text: '爱其实是一种深厚的友谊，而非神秘莫测的情感。' },
  { id: 'LAS-39', dim: 'storge', text: '我最满意的恋爱关系都源于良好的友谊。' },
  // Pragma 实用型 (4,10,16,22,28,34,40)
  { id: 'LAS-04', dim: 'pragma', text: '在确定关系前，我会考虑对方将来会成为什么样的人。' },
  { id: 'LAS-10', dim: 'pragma', text: '在选择伴侣前，我会认真规划自己的人生。' },
  { id: 'LAS-16', dim: 'pragma', text: '最好去爱背景相似的人。' },
  { id: 'LAS-22', dim: 'pragma', text: '选择伴侣时，一个主要考量是对方会给我的家庭带来怎样的印象。' },
  { id: 'LAS-28', dim: 'pragma', text: '选择伴侣时，一个重要因素是对方是否会是个好家长。' },
  { id: 'LAS-34', dim: 'pragma', text: '选择伴侣时，我会考虑对方会给我事业带来怎样的影响。' },
  { id: 'LAS-40', dim: 'pragma', text: '在深入投入一段关系前，我会考虑双方遗传背景是否相配，以防将来有孩子。' },
  // Mania 狂热型 (5,11,17,23,29,35,41)
  { id: 'LAS-05', dim: 'mania', text: '当我和伴侣之间出了问题，我会反胃不适。' },
  { id: 'LAS-11', dim: 'mania', text: '当恋情结束时，我会极度消沉。' },
  { id: 'LAS-17', dim: 'mania', text: '有时陷入爱情让我太过兴奋而睡不着。' },
  { id: 'LAS-23', dim: 'mania', text: '当伴侣不关注我时，我浑身难受。' },
  { id: 'LAS-29', dim: 'mania', text: '当我陷入爱情时，很难集中注意力。' },
  { id: 'LAS-35', dim: 'mania', text: '如果伴侣冷落我一阵子，我会做傻事来重新引起他/她的注意。' },
  { id: 'LAS-41', dim: 'mania', text: '如果怀疑伴侣和别人在一起，我无法放松。' },
  // Agape 奉献型 (6,12,18,24,30,36,42)
  { id: 'LAS-06', dim: 'agape', text: '我总是尽力帮助伴侣度过难关。' },
  { id: 'LAS-12', dim: 'agape', text: '我宁愿自己受苦，也不愿让伴侣受苦。' },
  { id: 'LAS-18', dim: 'agape', text: '除非把伴侣的幸福置于自己之上，否则我无法快乐。' },
  { id: 'LAS-24', dim: 'agape', text: '我通常愿意牺牲自己的愿望，成全伴侣。' },
  { id: 'LAS-30', dim: 'agape', text: '我拥有的一切都任由伴侣随意使用。' },
  { id: 'LAS-36', dim: 'agape', text: '当伴侣对我发怒时，我仍会完整而无条件地爱他/她。' },
  { id: 'LAS-42', dim: 'agape', text: '为了伴侣，我愿承受一切。' },
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
        { name: v.name, icon: v.icon, color: v.color, desc: v.desc, sum: dimScores[k], avg: dimCounts[k] ? Math.round((dimScores[k] / dimCounts[k]) * 10) / 10 : 0, max: 35 },
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
  reference: "Hendrick, C. & Hendrick, S. (1986) — 爱情态度量表（LAS，六型浪漫风格）",
  scoring: "42 题 Likert 计分，六型爱情风格分量表累加法",
  icon: '❤️',
  color: '#be185d',
  duration: 8,
  questionCount: 42,
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

    getResultView(r, layout) {
    const _mkGroup = function (r, layout) {

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
  
    };
    const _mkInterp = function (r, groupList, scaleDimensionList) {

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
  
    };
    const groups = _mkGroup(r, layout);
    const dims = (r && r.dimensions) ? Object.keys(r.dimensions).map((k) => { const d = r.dimensions[k]; return { key: k, name: d.name || k, percent: d.percent, text: d.text, level: d.level }; }) : [];
    const subtests = [];
    const interpretations = _mkInterp(r, groups, dims);
    const showBipolar = !!(dims[0] && dims[0].leftPercent !== undefined);
    return { groups, dims, subtests, interpretations, showBipolar };
  },resultLayout: {
    primaryField: 'dominantName',
    primaryLabel: '主导风格',
    primarySuffix: '型',
    groupLabels: { eros: '激情型', ludus: '游戏型', storge: '友谊型', pragma: '实用型', mania: '狂热型', agape: '奉献型' },
    interpretation: true,
  },
};
