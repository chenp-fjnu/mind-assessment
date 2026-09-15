const { mapDimensions } = require('../../utils/result-view')
/**
 * DISC 行为风格测评（36 题，含真实题库改编）
 *
 * 四个维度：
 *   D  支配型 (Dominance)            — 直接、果断、竞争、结果导向
 *   I  影响型 (Influence)            — 热情、乐观、社交、表达力强
 *   S  稳健型 (Steadiness)           — 耐心、温和、合作、稳定
 *   C  谨慎型 (Conscientiousness)    — 精确、分析、系统、标准导向
 *
 * 每题为 4 选 1（choice），四个选项依次对应 D / I / S / C。
 * 答案以选项索引存储：0=D，1=I，2=S，3=C。
 * 评分：统计各维度被选次数，取最高 1~2 个为主导风格，
 *       组合成行为风格代码，如 "D"、"DC"、"IS"。
 */

// 选项顺序固定为 [D, I, S, C]
const DIM_ORDER = ['D', 'I', 'S', 'C'];

const STYLE_INFO = {
  D: { name: '支配型', en: 'Dominance', desc: '直接、果断、竞争、结果导向', trait: '果断有魄力、目标明确，善于推动决策与执行，具竞争意识。', strength: '决策力强、高效推动、敢于挑战', growth: '需注意倾听他人、控制急躁、培养耐心与同理心' },
  I: { name: '影响型', en: 'Influence', desc: '热情、乐观、社交、表达力强', trait: '热情开朗、善于交际，擅长感染他人与营造积极氛围。', strength: '人际沟通、激励团队、乐观积极', growth: '需注意时间管理、落实细节、避免情绪化决策' },
  S: { name: '稳健型', en: 'Steadiness', desc: '耐心、温和、合作、稳定', trait: '温和可靠、耐心细致，善于倾听支持，是团队的稳定力量。', strength: '可靠踏实、团队协作、耐心包容', growth: '需主动表达、拥抱变化、提升决断力' },
  C: { name: '谨慎型', en: 'Conscientiousness', desc: '精确、分析、系统、标准导向', trait: '严谨细致、追求准确，善于分析与规划，重视标准与质量。', strength: '严谨精确、系统分析、注重质量', growth: '需避免过度挑剔、提升效率、敢于决断' },
};

// 36 题：每题 4 个选项，依次对应 D / I / S / C。
// 题源：teamazing.com《100+ DISC Personality Questions》（情境类，每题 4 选项明确对应 D/I/S/C）
//       与 prepclubs.com DISC 练习（强制四选一词语块，每词对应一个 DISC 维度）。
// DISC 模型属公共领域，强制四选一词语块已转换为本模块统一的 4 选 1 计分格式。
const QUESTIONS = [
  // —— 情境类（译自 teamazing.com 真实题库，每题 4 选项依次对应 D/I/S/C）——
  { id: 'DISC-01', text: '你处理工作的方式最符合以下哪一句？', d: '我主动担责并追求快速结果', i: '我激励他人并营造积极氛围', s: '我注重团队合作并支持他人', c: '我确保准确并遵循流程' },
  { id: 'DISC-02', text: '你通常如何对待截止期限？', d: '我争取提前完成', i: '我把截止期限当作动力、保持干劲', s: '我精心规划、从容达成而不焦虑', c: '我反复核对细节，确保无误后再提交' },
  { id: 'DISC-03', text: '沟通时你更偏好哪种方式？', d: '直接了当、直奔主题', i: '热情洋溢、富有感染力', s: '体贴周到、给予支持', c: '清晰准确、注重细节' },
  { id: 'DISC-04', text: '面对批评，你通常会？', d: '直接面对，必要时立即改进', i: '开诚布公地讨论并很快翻篇', s: '认真反思它如何影响团队', c: '仔细评估以改进自己的表现' },
  { id: 'DISC-05', text: '你的决策方式更接近哪一种？', d: '快速果断地做出选择', i: '征求他人意见并参考他们的想法', s: '宁可慢一点也要避免风险', c: '基于数据与深入分析做决定' },
  { id: 'DISC-06', text: '你如何处理他人给你的反馈？', d: '我会考虑并在必要时做出改变', i: '我感激反馈并用它改进方法', s: '我放在心上并调整以维持和谐', c: '我仔细评估并打磨我的工作' },
  { id: 'DISC-07', text: '你的规划风格是？', d: '我设定雄心目标并列出达成步骤', i: '我制定灵活计划、保留随性空间', s: '我仔细规划以确保稳定一致', c: '我制定详细计划并严格执行' },
  { id: 'DISC-08', text: '你如何给任务排定优先级？', d: '我先处理最重要的任务', i: '我优先处理需要协作的任务', s: '我优先处理能维持稳定的任务', c: '我按逻辑重要性对任务排序' },
  { id: 'DISC-09', text: '哪种描述最贴近你的工作态度？', d: '目标驱动、注重结果', i: '精力充沛、以人为中心', s: '可靠踏实、始终如一', c: '注重细节、一丝不苟' },
  { id: 'DISC-10', text: '你最希望以何种方式获得认可？', d: '公开表彰我的成就', i: '获得正面评价与社交认可', s: '安静的欣赏与认可', c: '对我准确与高质量的认可' },
  { id: 'DISC-11', text: '你授权他人的方式是？', d: '我授权以确保工作高效完成', i: '我让他人参与以保持投入与动力', s: '我谨慎授权，确保人人感到舒适', c: '我把任务交给能维持高标准的人' },
  { id: 'DISC-12', text: '你通常为重要会议做怎样的准备？', d: '我列出关键要点与要达成的目标', i: '我思考如何调动他人、营造积极氛围', s: '我考虑如何让会议顺畅协作', c: '我收集所有必要信息并准备详尽笔记' },
  { id: 'DISC-13', text: '化解冲突时，你通常扮演什么角色？', d: '我掌控局面，迅速化解冲突', i: '我居中调解，保持氛围积极高效', s: '我发挥安抚作用，帮助大家找到共识', c: '我分析症结并提出合乎逻辑的方案' },
  { id: 'DISC-14', text: '对于工作中的风险，你的态度是？', d: '为实现更大成功我愿意承担风险', i: '只要能带来令人兴奋的机会我就愿意尝试', s: '我倾向于规避风险、维持稳定', c: '我谨慎评估风险后再行动' },
  { id: 'DISC-15', text: '你给予他人反馈的方式是？', d: '直接而坦诚，聚焦改进', i: '正面鼓励，多肯定少批评', s: '温和委婉，重在维持和谐', c: '详尽细致，给出具体观察与建议' },
  { id: 'DISC-16', text: '在激励他人方面，你通常怎么做？', d: '我鞭策他们、设定高期望', i: '我用热情鼓舞和激励他们', s: '我默默支持，给予持续鼓励', c: '我以高质量工作树立榜样来激励' },
  { id: 'DISC-17', text: '面对突如其来的挑战，你的反应是？', d: '我主动掌控，迅速找到克服之道', i: '我保持乐观，带动他人一起应对', s: '我冷静面对，按部就班地处理', c: '我评估所有细节并谨慎规划应对' },
  { id: 'DISC-18', text: '你更倾向于如何庆祝成就？', d: '私下庆祝，随即聚焦下一个挑战', i: '公开庆祝，与他人分享成功', s: '安静地庆祝，侧重反思收获', c: '细致地庆祝，肯定其中的细节与付出' },
  { id: 'DISC-19', text: '当工作环境需要变化时，你如何处理？', d: '若能带来更好结果我就推动变革', i: '我保持积极，借助他人互动平滑过渡', s: '我慢慢适应，确保不破坏稳定', c: '我详细评估变化并调整流程以维持高标准' },

  // —— 行为情境类（译自 DISC 真实题库改编）——
  { id: 'DISC-20', text: '开会时，你通常会？', d: '直接发表意见，推动决策', i: '积极发言，调动气氛', s: '认真倾听，在需要时发言', c: '准备充分数据后再发言' },
  { id: 'DISC-21', text: '面对新同事，你会？', d: '主动介绍工作流程', i: '热情打招呼，聊家常', s: '微笑示意，等待对方需要帮助', c: '告诉对方需要注意的细节' },
  { id: 'DISC-22', text: '项目出问题时，你会？', d: '立刻找出负责人解决', i: '召集大家讨论解决方案', s: '先稳定大家情绪再想办法', c: '仔细分析问题原因' },

  // —— 行为情境类（公共领域 DISC 题库改编）——
  { id: 'DISC-23', text: '面对紧急任务，你会？', d: '马上动手，边做边调整', i: '找人一起分担', s: '按部就班地完成', c: '先制定详细计划' },
  { id: 'DISC-24', text: '团队意见不一致时，你会？', d: '拍板决定方向', i: '说服大家接受方案', s: '协调各方达成共识', c: '用数据说话' },
  { id: 'DISC-25', text: '收到意外的好消息，你会？', d: '马上思考下一步计划', i: '立刻分享给更多人', s: '开心但保持平静', c: '核实消息是否准确' },
  { id: 'DISC-26', text: '周末你更想做什么？', d: '挑战新的运动项目', i: '和朋友聚会', s: '在家放松休息', c: '学习新技能' },
  { id: 'DISC-27', text: '别人向你求助时，你会？', d: '直接告诉他该怎么做', i: '热情地帮忙出主意', s: '耐心听他说完再给建议', c: '帮他分析问题的各个方面' },
  { id: 'DISC-28', text: '面对失败，你会？', d: '总结教训，重新来过', i: '找朋友倾诉', s: '接受现实，调整心态', c: '分析失败的原因' },
  { id: 'DISC-29', text: '你更喜欢哪种工作环境？', d: '节奏快、有挑战', i: '氛围好、同事有趣', s: '稳定、有归属感', c: '规范、有标准流程' },
  { id: 'DISC-30', text: '你更想成为哪种领导？', d: '果断决策型', i: '激励人心型', s: '支持下属型', c: '严谨专业型' },
  { id: 'DISC-31', text: '你更看重什么？', d: '效率和结果', i: '人际关系和氛围', s: '稳定和和谐', c: '准确和质量' },
  { id: 'DISC-32', text: '面对竞争，你会？', d: '全力以赴争取胜利', i: '享受竞争的过程', s: '尽力而为，不强求', c: '分析对手，找突破口' },
  { id: 'DISC-33', text: '你更喜欢哪种沟通方式？', d: '简明扼要', i: '生动有趣', s: '温和耐心', c: '准确严谨' },
  { id: 'DISC-34', text: '你更看重什么？', d: '掌控感', i: '认同感', s: '安全感', c: '精确感' },
  { id: 'DISC-35', text: '你最看重什么？', d: '达成目标', i: '被人喜欢', s: '被人信任', c: '被人认可专业能力' },
  { id: 'DISC-36', text: '面对规则，你会？', d: '考虑是否合理', i: '愿意遵守但也会提建议', s: '认真遵守', c: '研究规则背后的逻辑' },
];

function computeResult(answers, qs) {
  const counts = { D: 0, I: 0, S: 0, C: 0 };
  let answered = 0;

  qs.forEach((q, i) => {
    const a = answers[i];
    if (a == null) return;
    const dim = DIM_ORDER[a];
    if (counts[dim] !== undefined) counts[dim]++;
    answered++;
  });

  // 按被选次数排序
  const sorted = Object.keys(counts).sort((a, b) => counts[b] - counts[a]);
  const top = sorted[0];
  const second = sorted[1];

  // 主导优势明显（领先 4 票及以上）取单一风格，否则取前二组合
  let style;
  if (counts[top] >= counts[second] + 4) {
    style = top;
  } else {
    style = top + second;
  }

  const letters = style.split('');
  const nameParts = letters.map((k) => STYLE_INFO[k].name);
  const enParts = letters.map((k) => STYLE_INFO[k].en);
  const typeName = nameParts.join('·');
  const trait = `${style} · ${enParts.join('/')}`;
  const description = letters.map((k) => `${STYLE_INFO[k].name}（${STYLE_INFO[k].desc}）`).join('；') + '。';

  const groups = { D: counts.D, I: counts.I, S: counts.S, C: counts.C };

  return {
    style,
    type: style,
    typeName,
    trait,
    description,
    counts,
    groups,
    raw: answered,
    total: qs.length,
    totalStat: { correct: 0, wrong: 0, skipped: qs.length - answered },
  };
}


module.exports = {
  id: 'disc',
  type: 'career',
  name: 'DISC 行为风格测评',
  shortName: 'DISC',
  desc: '基于 DISC 模型的行为风格测评，评估支配、影响、稳健、谨慎四种行为特质。',
  reference: "Marston, W.M. — DISC 行为风格模型（Dominance/Influence/Steadiness/Conscientiousness）",
  scoring: "四因子倾向计分，按主导风格归类",
  icon: '📊',
  color: '#0891b2',
  duration: 8,
  questionCount: 36,
  tag: ['行为风格', '职场', '沟通'],
  questionType: 'choice',

  getQuestions() {
    return QUESTIONS.map((q) => ({
      id: q.id,
      type: 'choice',
      prompt: q.text,
      options: [q.d, q.i, q.s, q.c], // 0=D，1=I，2=S，3=C
      answer: null, // DISC 无对错
    }));
  },

  computeResult,

    getResultView(r, layout) {
    const _mkGroup = function (r, layout) {

    const total = r.total || 24;
    return ['D', 'I', 'S', 'C'].map((k) => ({
      key: k,
      label: layout.groupLabels[k] || k,
      percent: Math.round((r.groups[k] / total) * 100),
      display: `${r.groups[k]}/${total}`,
      isScale: false,
    }));
  
    };
    const _mkInterp = function (r, groupList, scaleDimensionList) {

    const style = r.style;
    const letters = style.split('');
    const intros = letters.map((k) => `${STYLE_INFO[k].name}：${STYLE_INFO[k].trait}`);
    const strengths = letters.map((k) => `${STYLE_INFO[k].name}——优势：${STYLE_INFO[k].strength}`);
    const growths = letters.map((k) => `${STYLE_INFO[k].name}——发展：${STYLE_INFO[k].growth}`);
    return [
      { title: '行为风格', text: `你的主导行为风格为 ${style}（${r.typeName}）。` + intros.join(' ') },
      { title: '风格优势', text: strengths.join('；') + '。' },
      { title: '发展建议', text: growths.join('；') + '。建议在发挥主导风格优势的同时，有意识地调整与互补。' },
      { title: '人际提示', text: '了解自身与他人的 DISC 风格差异，有助于因人而异地沟通协作，提升团队效能。' },
    ];
  
    };
    const groups = _mkGroup(r, layout);
    const dims = mapDimensions(r.dimensions);
    const subtests = [];
    const interpretations = _mkInterp(r, groups, dims);
    const showBipolar = !!(dims[0] && dims[0].leftPercent !== undefined);
    return { groups, dims, subtests, interpretations, showBipolar };
  },// 维度标签：DISC 四种行为风格
  resultLayout: {
    primaryField: 'style',
    primaryLabel: '行为风格',
    primarySuffix: '',
    groupLabels: { D: '支配型', I: '影响型', S: '稳健型', C: '谨慎型' },
    interpretation: true,
  },
};
