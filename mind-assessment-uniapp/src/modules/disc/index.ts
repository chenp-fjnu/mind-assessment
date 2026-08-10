/**
 * DISC 行为风格测评（简化版 24 题）
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

const STYLE_INFO: Record<string, { name: string; en: string; desc: string; trait: string; strength: string; growth: string }> = {
  D: { name: '支配型', en: 'Dominance', desc: '直接、果断、竞争、结果导向', trait: '果断有魄力、目标明确，善于推动决策与执行，具竞争意识。', strength: '决策力强、高效推动、敢于挑战', growth: '需注意倾听他人、控制急躁、培养耐心与同理心' },
  I: { name: '影响型', en: 'Influence', desc: '热情、乐观、社交、表达力强', trait: '热情开朗、善于交际，擅长感染他人与营造积极氛围。', strength: '人际沟通、激励团队、乐观积极', growth: '需注意时间管理、落实细节、避免情绪化决策' },
  S: { name: '稳健型', en: 'Steadiness', desc: '耐心、温和、合作、稳定', trait: '温和可靠、耐心细致，善于倾听支持，是团队的稳定力量。', strength: '可靠踏实、团队协作、耐心包容', growth: '需主动表达、拥抱变化、提升决断力' },
  C: { name: '谨慎型', en: 'Conscientiousness', desc: '精确、分析、系统、标准导向', trait: '严谨细致、追求准确，善于分析与规划，重视标准与质量。', strength: '严谨精确、系统分析、注重质量', growth: '需避免过度挑剔、提升效率、敢于决断' },
};

// 24 题：每题 4 个选项，依次对应 D / I / S / C
const QUESTIONS = [
  { id: 'DISC-01', text: '在团队工作中，你最看重什么？', d: '快速达成目标并取得成果', i: '团队氛围融洽充满活力', s: '稳定协作互相支持', c: '流程规范质量达标' },
  { id: 'DISC-02', text: '面对一个新项目，你的第一反应是？', d: '立即制定目标并推动执行', i: '召集团队一起头脑风暴', s: '评估风险并稳妥推进', c: '梳理细节制定详细计划' },
  { id: 'DISC-03', text: '遇到意见分歧时，你倾向于？', d: '坚持己见据理力争', i: '用热情和沟通化解矛盾', s: '耐心倾听寻求折中', c: '用数据和逻辑分析对错' },
  { id: 'DISC-04', text: '你的沟通风格是？', d: '直接了当直奔主题', i: '热情洋溢善于表达', s: '温和耐心善于倾听', c: '严谨准确注重细节' },
  { id: 'DISC-05', text: '做决定时，你最看重？', d: '效率和结果', i: '他人的认同和支持', s: '各方的接受程度', c: '信息的完整和准确' },
  { id: 'DISC-06', text: '面对压力，你通常会？', d: '迎难而上主动出击', i: '保持乐观积极应对', s: '沉稳应对循序渐进', c: '冷静分析找出对策' },
  { id: 'DISC-07', text: '你最欣赏的领导者特质是？', d: '果断有魄力', i: '有感染力和亲和力', s: '稳重可靠有耐心', c: '严谨专业讲原则' },
  { id: 'DISC-08', text: '在社交场合，你通常？', d: '主动掌控话题和节奏', i: '成为焦点活跃气氛', s: '安静观察适时参与', c: '与少数人深入交流' },
  { id: 'DISC-09', text: '你的工作节奏倾向于？', d: '快节奏追求高效率', i: '灵活多变充满热情', s: '稳定有序按部就班', c: '精细严谨精益求精' },
  { id: 'DISC-10', text: '当别人犯错时，你会？', d: '直接指出并要求改正', i: '用幽默方式善意提醒', s: '体谅对方温和建议', c: '详细分析错误原因' },
  { id: 'DISC-11', text: '你最喜欢的奖励方式是？', d: '晋升和更大的权力', i: '公开表扬和认可', s: '稳定的福利和关怀', c: '专业成就和认可' },
  { id: 'DISC-12', text: '面对变化，你的态度是？', d: '积极推动变革', i: '充满期待和兴奋', s: '谨慎评估后接受', c: '关注变化对细节的影响' },
  { id: 'DISC-13', text: '你认为成功的关键是？', d: '果断的行动力', i: '良好的人际关系', s: '持之以恒的坚持', c: '严谨周密的规划' },
  { id: 'DISC-14', text: '在冲突中，你倾向于？', d: '正面交锋争取胜利', i: '化解僵局重建和谐', s: '避免对抗维护关系', c: '摆事实讲道理' },
  { id: 'DISC-15', text: '你的时间管理方式是？', d: '同时推进多个任务', i: '灵活安排随性而为', s: '按计划有条不紊', c: '制定详细时间表' },
  { id: 'DISC-16', text: '你如何看待规则？', d: '规则为结果服务可灵活变通', i: '规则要为人际和谐让路', s: '规则有助稳定应遵守', c: '规则必须严格执行' },
  { id: 'DISC-17', text: '你最不喜欢的情境是？', d: '进展缓慢缺乏掌控', i: '气氛沉闷无人互动', s: '剧烈变动冲突不断', c: '流程混乱粗心大意' },
  { id: 'DISC-18', text: '接到一个新任务，你会？', d: '立即着手快速推进', i: '拉上伙伴一起做', s: '先了解清楚再稳步开展', c: '先研究方法和标准' },
  { id: 'DISC-19', text: '你如何评价自己？', d: '有决断力目标明确', i: '热情开朗善于交际', s: '温和可靠乐于合作', c: '严谨细致追求完美' },
  { id: 'DISC-20', text: '面对未知，你倾向于？', d: '大胆尝试抢占先机', i: '充满好奇乐于探索', s: '谨慎前行步步为营', c: '充分调研后再行动' },
  { id: 'DISC-21', text: '你在团队中的角色多为？', d: '推动者和决策者', i: '激励者和协调者', s: '支持者和稳定器', c: '分析者和把关者' },
  { id: 'DISC-22', text: '你最看重的价值观是？', d: '成就与掌控', i: '认同与友谊', s: '和谐与稳定', c: '精确与专业' },
  { id: 'DISC-23', text: '遇到紧急情况，你会？', d: '当机立断迅速处置', i: '鼓舞士气稳定人心', s: '沉着应对按预案处理', c: '评估风险谨慎决策' },
  { id: 'DISC-24', text: '你希望给别人留下的印象是？', d: '干练果断能力出众', i: '热情开朗富有魅力', s: '温和可靠值得信赖', c: '严谨专业一丝不苟' },
];

function computeResult(answers: any[], qs: any[]) {
  const counts: Record<string, number> = { D: 0, I: 0, S: 0, C: 0 };
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
  let style: string;
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

export default {
  id: 'disc',
  type: 'career',
  name: 'DISC 行为风格测评',
  shortName: 'DISC',
  desc: '基于 DISC 模型的行为风格测评，评估支配、影响、稳健、谨慎四种行为特质。',
  icon: '📊',
  color: '#0891b2',
  duration: 8,
  questionCount: 24,
  paid: false,
  price: 0,
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

  buildGroupList(r: any, layout: any) {
    const total = r.total || 24;
    return ['D', 'I', 'S', 'C'].map((k) => ({
      key: k,
      label: layout.groupLabels[k] || k,
      percent: Math.round((r.groups[k] / total) * 100),
      display: `${r.groups[k]}/${total}`,
      isScale: false,
    }));
  },

  buildInterpretations(r: any) {
    const style = r.style;
    const letters = style.split('');
    const intros = letters.map((k: string) => `${STYLE_INFO[k].name}：${STYLE_INFO[k].trait}`);
    const strengths = letters.map((k: string) => `${STYLE_INFO[k].name}——优势：${STYLE_INFO[k].strength}`);
    const growths = letters.map((k: string) => `${STYLE_INFO[k].name}——发展：${STYLE_INFO[k].growth}`);
    return [
      { title: '行为风格', text: `你的主导行为风格为 ${style}（${r.typeName}）。` + intros.join(' ') },
      { title: '风格优势', text: strengths.join('；') + '。' },
      { title: '发展建议', text: growths.join('；') + '。建议在发挥主导风格优势的同时，有意识地调整与互补。' },
      { title: '人际提示', text: '了解自身与他人的 DISC 风格差异，有助于因人而异地沟通协作，提升团队效能。' },
    ];
  },

  // 维度标签：DISC 四种行为风格
  getDimensionLabel(dim: string) {
    const labels: Record<string, string> = { D: '支配型', I: '影响型', S: '稳健型', C: '谨慎型' };
    return labels[dim] || dim;
  },

  resultLayout: {
    primaryField: 'style',
    primaryLabel: '行为风格',
    primarySuffix: '',
    showGroups: true,
    groupLabels: { D: '支配型', I: '影响型', S: '稳健型', C: '谨慎型' },
    showDetail: false,
    interpretation: true,
  },
};
