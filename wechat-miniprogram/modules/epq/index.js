const { makeLabeler } = require('../../utils/labels')
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

const { scoreItem } = require('../../utils/scoring')

// 维度说明
const DIM_INFO = {
  E: { name: '外向性', en: 'Extraversion', desc: '社交活力与外向程度', high: '外向热情，喜欢社交与活动，精力充沛。', low: '内向安静，偏好独处与深思，沉稳内敛。' },
  N: { name: '神经质', en: 'Neuroticism', desc: '情绪稳定性与敏感度', high: '情绪不稳定，易焦虑紧张，感受细腻。', low: '情绪稳定，从容淡定，抗压能力较强。' },
  P: { name: '精神质', en: 'Psychoticism', desc: '孤僻与合群倾向', high: '较孤僻独立，不太合群，行为可能出格。', low: '合群友善，乐于合作，顾及他人。' },
  L: { name: '掩饰性', en: 'Lie', desc: '社会期望性应答', high: '掩饰性较强，倾向于呈现理想化自我。', low: '较为坦诚，应答真实自然。' },
};

// E/N 高低组合得到的人格类型
const TYPE_DESC = {
  E_HN_L: { name: '外向稳定型', trait: '开朗健谈·从容淡定', desc: '你外向热情、善于社交，同时情绪稳定、从容自信。在团队中常是积极的推动者，能承受压力并保持乐观。' },
  E_HN_H: { name: '外向敏感型', trait: '热情活泼·情绪敏感', desc: '你外向活泼、热爱社交，但情绪较为敏感，容易因外界刺激而波动。富有激情，需注意情绪调节。' },
  E_LN_L: { name: '内向稳定型', trait: '沉静内敛·情绪平稳', desc: '你安静内敛、喜欢独处，情绪平稳温和。做事沉稳可靠，善于独立思考与深度工作。' },
  E_LN_H: { name: '内向敏感型', trait: '安静含蓄·多思多虑', desc: '你安静含蓄、内心丰富，但情绪较易波动，常多思多虑。感受细腻，需关注情绪健康与压力释放。' },
};

// 48 题：艾森克人格问卷简式量表中国版（EPQ-RSC，钱铭怡等，2000），
// 即 EPQ-RS 的权威中文标准化版本，每维度 12 题。
// 维度分配：P(2,6,10,14,18,22,26,28,31,35,39,43)
//           E(3,7,11,15,19,23,27,32,36,41,44,48)
//           N(1,5,9,13,17,21,25,30,34,38,42,46)
//           L(4,8,12,16,20,24,29,33,37,40,45,47)
// 计分键（钱铭怡等，2000，心理学报）：
//   正向（答"是"得 1 分）：P 10/14/22/31/39；E 除 27 外全部；N 全部；L 4/16/45
//   反向（答"否"得 1 分，即 reverse:true）：P 2/6/18/26/28/35/43；E 27；L 8/12/20/24/29/33/37/40/47
// reverse: true 表示反向计分（答"否"得 1 分），与 computeResult 中 (1 - a) 一致。
const QUESTIONS = [
  { id: 'EPQ-01', dimension: 'N', reverse: false, text: '你的情绪是否时起时落？' },
  { id: 'EPQ-02', dimension: 'P', reverse: true,  text: '当你看到小孩（或动物）受折磨时是否感到难受？' },
  { id: 'EPQ-03', dimension: 'E', reverse: false, text: '你是个健谈的人吗？' },
  { id: 'EPQ-04', dimension: 'L', reverse: false, text: '如果你说了要做什么事，是否不论此事可能遇到什么困难，你都总能遵守诺言？' },
  { id: 'EPQ-05', dimension: 'N', reverse: false, text: '你是否会无缘无故地感到“很惨”？' },
  { id: 'EPQ-06', dimension: 'P', reverse: true,  text: '欠债会使你感到忧虑吗？' },
  { id: 'EPQ-07', dimension: 'E', reverse: false, text: '你是个生气勃勃的人吗？' },
  { id: 'EPQ-08', dimension: 'L', reverse: true,  text: '你是否曾贪图过超过你应得的分外之物？' },
  { id: 'EPQ-09', dimension: 'N', reverse: false, text: '你是个容易被激怒的人吗？' },
  { id: 'EPQ-10', dimension: 'P', reverse: false, text: '你会服用能产生奇异或危险效果的药物吗？' },
  { id: 'EPQ-11', dimension: 'E', reverse: false, text: '你愿意认识陌生人吗？' },
  { id: 'EPQ-12', dimension: 'L', reverse: true,  text: '你是否曾经有过明知自己做错了事却责备别人的情况？' },
  { id: 'EPQ-13', dimension: 'N', reverse: false, text: '你的感情容易受伤害吗？' },
  { id: 'EPQ-14', dimension: 'P', reverse: false, text: '你是否愿意按照自己的方式行事，而不愿意按照规则办事？' },
  { id: 'EPQ-15', dimension: 'E', reverse: false, text: '在热闹的聚会中你能使自己放得开，使自己玩得开心吗？' },
  { id: 'EPQ-16', dimension: 'L', reverse: false, text: '你所有的习惯是否都是好的？' },
  { id: 'EPQ-17', dimension: 'N', reverse: false, text: '你是否时常感到“极其厌倦”？' },
  { id: 'EPQ-18', dimension: 'P', reverse: true,  text: '良好的举止和整洁对你来说很重要吗？' },
  { id: 'EPQ-19', dimension: 'E', reverse: false, text: '在结交新朋友时，你经常是积极主动的吗？' },
  { id: 'EPQ-20', dimension: 'L', reverse: true,  text: '你是否有过随口骂人的时候？' },
  { id: 'EPQ-21', dimension: 'N', reverse: false, text: '你认为自己是一个胆怯不安的人吗？' },
  { id: 'EPQ-22', dimension: 'P', reverse: false, text: '你是否认为婚姻是不合时宜的，应该废除？' },
  { id: 'EPQ-23', dimension: 'E', reverse: false, text: '你能否很容易地给一个沉闷的聚会注入活力？' },
  { id: 'EPQ-24', dimension: 'L', reverse: true,  text: '你曾毁坏或丢失过别人的东西吗？' },
  { id: 'EPQ-25', dimension: 'N', reverse: false, text: '你是个忧心忡忡的人吗？' },
  { id: 'EPQ-26', dimension: 'P', reverse: true,  text: '你爱和别人合作吗？' },
  { id: 'EPQ-27', dimension: 'E', reverse: true,  text: '在社交场合你是否倾向于呆在不显眼的地方？' },
  { id: 'EPQ-28', dimension: 'P', reverse: true,  text: '如果在你的工作中出现了错误，你知道后会感到忧虑吗？' },
  { id: 'EPQ-29', dimension: 'L', reverse: true,  text: '你讲过别人的坏话或脏话吗？' },
  { id: 'EPQ-30', dimension: 'N', reverse: false, text: '你认为自己是个神经紧张或“弦绷得过紧”的人吗？' },
  { id: 'EPQ-31', dimension: 'P', reverse: false, text: '你是否觉得人们为了未来有保障，而在储蓄和保险方面花费的时间太多了？' },
  { id: 'EPQ-32', dimension: 'E', reverse: false, text: '你是否喜欢和人们相处在一起？' },
  { id: 'EPQ-33', dimension: 'L', reverse: true,  text: '当你还是个小孩子的时候，你是否曾有过对父母耍赖或不听话的行为？' },
  { id: 'EPQ-34', dimension: 'N', reverse: false, text: '在经历了一次令人难堪的事之后，你是否会为此烦恼很长时间？' },
  { id: 'EPQ-35', dimension: 'P', reverse: true,  text: '你是否努力使自己对人不粗鲁？' },
  { id: 'EPQ-36', dimension: 'E', reverse: false, text: '你是否喜欢在自己周围有许多热闹和令人兴奋的事情？' },
  { id: 'EPQ-37', dimension: 'L', reverse: true,  text: '你曾在玩游戏时作过弊吗？' },
  { id: 'EPQ-38', dimension: 'N', reverse: false, text: '你是否因自己的“神经过敏”而感到痛苦？' },
  { id: 'EPQ-39', dimension: 'P', reverse: false, text: '你愿意别人怕你吗？' },
  { id: 'EPQ-40', dimension: 'L', reverse: true,  text: '你曾利用过别人吗？' },
  { id: 'EPQ-41', dimension: 'E', reverse: false, text: '你是否喜欢说笑话和谈论有趣的事？' },
  { id: 'EPQ-42', dimension: 'N', reverse: false, text: '你是否时常感到孤独？' },
  { id: 'EPQ-43', dimension: 'P', reverse: true,  text: '你是否认为遵循社会规范比按照个人方式行事更好一些？' },
  { id: 'EPQ-44', dimension: 'E', reverse: false, text: '在别人眼里你总是充满活力的吗？' },
  { id: 'EPQ-45', dimension: 'L', reverse: false, text: '你总能做到言行一致吗？' },
  { id: 'EPQ-46', dimension: 'N', reverse: false, text: '你是否时常被负疚感所困扰？' },
  { id: 'EPQ-47', dimension: 'L', reverse: true,  text: '你有时将今天该做的事情拖到明天去做吗？' },
  { id: 'EPQ-48', dimension: 'E', reverse: false, text: '你能使一个聚会顺利进行下去吗？' },
];

// 是/否选项：index 0 = 否，index 1 = 是
const YES_NO_OPTIONS = ['否', '是'];

function computeResult(answers, qs) {
  const dims = { E: { score: 0, count: 0 }, N: { score: 0, count: 0 }, P: { score: 0, count: 0 }, L: { score: 0, count: 0 } };

  qs.forEach((q, i) => {
    const d = q.dimension;
    dims[d].count++;
    const a = answers[i];
    if (a == null) return;
    // a: 0(否) / 1(是)；reverse 题答"否"计 1 分（由 scoreItem 统一处理）
    const score = scoreItem(a, q);
    dims[d].score += score;
  });

  const groups = {};
  const dimensions = {};
  Object.keys(dims).forEach((d) => {
    const { score, count } = dims[d];
    const total = count || 12;
    const percent = Math.round((score / total) * 100);
    // P0-8: 移除编造的 T 分常模，改用百分位描述
    // 标准 EPQ 需按性别、年龄分组查表获取 T 分，简化版不具备此条件
    // 仅保留 percent 作为相对倾向参考
    const info = DIM_INFO[d];
    groups[d] = score;
    // L 量表：高分提示掩饰性强，与临床维度不同
    const isLie = d === 'L';
    const level = isLie
      ? (percent >= 60 ? 'high' : percent <= 40 ? 'low' : 'mid')
      : (percent >= 60 ? 'high' : percent <= 40 ? 'low' : 'mid');
    dimensions[d] = {
      name: info.name,
      en: info.en,
      score,
      count: total,
      percent,
      level,
      text: level === 'high' ? info.high : level === 'low' ? info.low : '处于中等水平。',
    };
  });

  // 由 E、N 的 high/low 组合得到人格类型
  const eHigh = dimensions.E.level === 'high';
  const nHigh = dimensions.N.level === 'high';
  let typeKey;
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
    totalStat: { correct: 0, wrong: 0, skipped: answers.filter((a) => a == null).length },
  };
}

const DIM_LABELS = { E: '外向性', N: '神经质', P: '精神质', L: '掩饰性' };

module.exports = {
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
      scale: { min: 0, max: 1, labels: YES_NO_OPTIONS }, // 供 scoreItem 统一反向计分
      answer: null, // EPQ 无对错
    }));
  },

  computeResult,

    getResultView(r, layout) {
    const _mkGroup = function (r, layout) {

    return ['E', 'N', 'P', 'L'].map((k) => ({
      key: k,
      label: layout.groupLabels[k] || k,
      percent: Math.round((r.groups[k] / 12) * 100),
      display: `${r.groups[k]}/12`,
      isScale: true,
    }));
  
    };
    const _mkInterp = function (r, groupList, scaleDimensionList) {

    const d = r.dimensions;
    return [
      { title: '人格类型', text: `${r.type}：${r.description}` },
      { title: '维度解读', text: `外向性 ${d.E.percent}%（${d.E.text}）；神经质 ${d.N.percent}%（${d.N.text}）；精神质 ${d.P.percent}%（${d.P.text}）；掩饰性 ${d.L.percent}%（${d.L.text}）。` },
      { title: '行为倾向', text: r.trait + '。' + (d.E.level === 'high' ? '你善于在社交互动中获取能量。' : '你更擅长在独处思考中恢复能量。') + (d.N.level === 'high' ? '建议加强情绪管理与压力调节。' : '你的情绪基础良好，继续保持。') },
      { title: '发展建议', text: 'EPQ 各维度无优劣之分，了解自身倾向有助于职业选择与人际相处。若 L（掩饰性）偏高，提示作答时社会期望影响较大，建议更真实作答以获得准确结果。' },
    ];
  
    };
    const groups = _mkGroup(r, layout);
    const dims = (r && r.dimensions) ? Object.keys(r.dimensions).map((k) => { const d = r.dimensions[k]; return { key: k, name: d.name || k, percent: d.percent, text: d.text, level: d.level }; }) : [];
    const subtests = [];
    const interpretations = _mkInterp(r, groups, dims);
    const showBipolar = !!(dims[0] && dims[0].leftPercent !== undefined);
    return { groups, dims, subtests, interpretations, showBipolar };
  },// 维度标签：EPQ 四个维度
  resultLayout: {
    primaryField: 'type',
    primaryLabel: '人格类型',
    primarySuffix: '',
    groupLabels: { E: '外向性', N: '神经质', P: '精神质', L: '掩饰性' },
    interpretation: true,
  },
};
