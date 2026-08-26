const { mapDimensions } = require('../../utils/result-view')
/**
 * HBDI 全脑优势测评（40 题，教育简化版）
 *
 * 基于 Herrmann 全脑模型（Whole Brain Model），将思维偏好按「左右脑 × 上下脑」
 * 划分为 4 个象限：
 *   A  左上 · 蓝色 分析型 (Analytical)        — 逻辑、理性、技术、批判、事实导向
 *   B  左下 · 绿色 组织型 (Structural)         — 细致、计划、务实、守序、稳健执行
 *   C  右下 · 红色 共情型 (Relational)         — 人际、情感、表达、沟通、关系导向
 *   D  右上 · 黄色 创新型 (Experimental)        — 创意、直觉、想象、整体、冒险探索
 *
 * 每题为 4 选 1（choice），四个选项依次对应 A / B / C / D。
 * 答案以选项索引存储：0=A，1=B，2=C，3=D。
 * 评分：统计各象限被选次数，输出四象限优势剖面，并进一步给出
 *       左/右脑与 上/下脑 的偏好偏向，以及全脑均衡度判断。
 *
 * 说明：官方 HBDI® 为 Herrmann International 的受版权保护的授权测评，
 * 本模块为基于公共领域「全脑模型」思想的教育/演示版简化自陈问卷，非标准化常模。
 */

// 选项顺序固定为 [A, B, C, D]
const QUAD_ORDER = ['A', 'B', 'C', 'D'];

const QUAD_INFO = {
  A: { name: '分析型', en: 'Analytical', color: '#2563eb', desc: '逻辑、理性、技术、批判、事实导向',
    trait: '擅长逻辑分析与理性思考，偏好事实、数据与系统性论证，重视准确性与批判性判断。',
    strength: '逻辑严密、技术专精、善于分析与解决复杂问题',
    growth: '需兼顾人际与情感、避免过度求全；在模糊情境中学会凭直觉决策',
    work: '数据分析、研究论证、建模仿真、技术攻关、质量把控' },
  B: { name: '组织型', en: 'Structural', color: '#059669', desc: '细致、计划、务实、守序、稳健执行',
    trait: '注重条理与计划，偏好稳妥落地与可控流程，重视细节、守时与责任。',
    strength: '细致可靠、计划性强、执行力与落地能力突出',
    growth: '需提升对变化与不确定性的包容，避免过于拘泥流程与保守',
    work: '流程设计、项目排期、制度建设、细节执行、风险控制' },
  C: { name: '共情型', en: 'Relational', color: '#dc2626', desc: '人际、情感、表达、沟通、关系导向',
    trait: '重视人与关系，善于共情、表达与沟通，偏好协作、氛围与情感联结。',
    strength: '人际敏感、沟通感染力强、善于凝聚团队与营造氛围',
    growth: '需平衡任务与关系，在冲突或硬决策中保持客观与边界',
    work: '客户沟通、团队协作、冲突调解、用户服务、激励赋能' },
  D: { name: '创新型', en: 'Experimental', color: '#f59e0b', desc: '创意、直觉、想象、整体、冒险探索',
    trait: '偏好整体视角与概念联想，直觉强、敢冒险，善于想象与突破性创新。',
    strength: '创意丰富、直觉敏锐、善于整体构想与突破性创新',
    growth: '需补强落地与细节执行，在需要持续跟进的事务上保持耐心',
    work: '战略规划、产品创意、品牌策划、商业模式、突破性探索' },
};

// 40 题：每题 4 个选项，依次对应 A / B / C / D。
const QUESTIONS = [
  // —— 工作与思维偏好（每题 4 选项依次对应 A/B/C/D）——
  { id: 'HBDI-01', text: '面对一个新任务，你最自然的起点是？', a: '先拆解逻辑、梳理数据与事实', b: '先列出步骤、排期与分工', c: '先想清楚要和谁协作、如何沟通', d: '先构想整体方向与可能的突破点' },
  { id: 'HBDI-02', text: '你更信任哪种决策依据？', a: '严谨的分析与证据', b: '成熟的流程与过往经验', c: '他人的感受与团队共识', d: '直觉与对趋势的判断' },
  { id: 'HBDI-03', text: '在团队中你通常承担的角色是？', a: '出思路、做方案论证的人', b: '排计划、盯进度的人', c: '协调关系、活跃气氛的人', d: '提创意、点子最多的人' },
  { id: 'HBDI-04', text: '你最享受的工作状态是？', a: '钻研一个需要逻辑的挑战', b: '把杂乱事项理顺并逐一完成', c: '与人交流、达成共识', d: '自由发散、尝试新想法' },
  { id: 'HBDI-05', text: '别人眼中的你更可能是？', a: '理性冷静的「大脑」', b: '靠谱细致的「管家」', c: '热心体贴的「黏合剂」', d: '天马行空的「点子王」' },
  { id: 'HBDI-06', text: '你整理信息的方式偏向？', a: '分类、建模、找规律', b: '列表、归档、建立秩序', c: '口口相传、靠关系网络', d: '联想、画脑图、抓灵感' },
  { id: 'HBDI-07', text: '写方案时你最在意？', a: '论证是否成立、数据是否支撑', b: '结构是否清晰、能否落地', c: '是否说到了大家心里、好沟通', d: '有没有让人眼前一亮的角度' },
  { id: 'HBDI-08', text: '你更容易被什么吸引？', a: '烧脑的逻辑谜题', b: '井井有条的体系', c: '温暖真实的人际故事', d: '新奇大胆的创意' },
  { id: 'HBDI-09', text: '你对「完美」的定义是？', a: '无懈可击的逻辑', b: '零差错的执行', c: '皆大欢喜的关系', d: '独一无二的灵感' },
  { id: 'HBDI-10', text: '学习新东西时你偏好？', a: '先搞懂原理与机制', b: '照着步骤一步步练熟', c: '有人带、一起讨论着学', d: '先大胆试、在探索中领会' },

  // —— 沟通与表达（每题 4 选项依次对应 A/B/C/D）——
  { id: 'HBDI-11', text: '汇报时你倾向于？', a: '用数据和图表说话', b: '按要点条理清楚地讲', c: '多讲背景与人的感受，重在共鸣', d: '先抛观点与愿景，激发想象' },
  { id: 'HBDI-12', text: '听到一个主张，你第一反应是？', a: '它逻辑通不通', b: '可不可执行、稳不稳', c: '大家会不会接受', d: '有没有更有意思的可能' },
  { id: 'HBDI-13', text: '你更欣赏的沟通风格是？', a: '精准简练、有理有据', b: '清楚明白、有条不紊', c: '真诚温暖、有感染力', d: '生动跳跃、充满画面感' },
  { id: 'HBDI-14', text: '争论中你常用的方式是？', a: '摆事实讲道理', b: '回到规则与流程', c: '缓和情绪、照顾对方面子', d: '换个视角重新定义问题' },
  { id: 'HBDI-15', text: '你写邮件/文档更常出现？', a: '「据分析」「因此」', b: '「第一步」「截止」', c: '「我们」「一起」', d: '「也许」「想象一下」' },

  // —— 解决问题与风险（每题 4 选项依次对应 A/B/C/D）——
  { id: 'HBDI-16', text: '遇到难题，你先？', a: '分解问题、找根因', b: '查流程、看有没有先例', c: '找人商量、集思广益', d: '跳出框架、想非常规解法' },
  { id: 'HBDI-17', text: '对风险的态度的？', a: '先评估概率与后果再动', b: '控制在可承受范围内才做', c: '只要大家支持就敢试', d: '适度的不确定反而有吸引力' },
  { id: 'HBDI-18', text: '你更怕哪种失误？', a: '判断错误、逻辑漏洞', b: '执行出错、细节翻车', c: '伤了关系、让人不舒服', d: '太保守、错过新机会' },
  { id: 'HBDI-19', text: '复盘时你更关注？', a: '哪里分析偏差了', b: '哪里流程没跑顺', c: '谁的情绪和配合出了问题', d: '哪里思路可以更开阔' },
  { id: 'HBDI-20', text: '你给建议的方式是？', a: '指出关键变量与推理', b: '给出可操作的步骤', c: '先共情再一起想办法', d: '用一个新比喻打开思路' },

  // —— 计划与秩序（每题 4 选项依次对应 A/B/C/D）——
  { id: 'HBDI-21', text: '你桌面的常态是？', a: '只有当前要用的资料，极简', b: '分门别类、整整齐齐', c: '随手堆着，但熟人能找到', d: '乱中有灵感，满桌便签' },
  { id: 'HBDI-22', text: '做长期规划时你？', a: '建模预测各种情形', b: '把目标拆成时间表', c: '考虑团队成员的成长与意愿', d: '先定一个激动人心的方向' },
  { id: 'HBDI-23', text: '你更喜欢的工具是？', a: '表格、公式、分析软件', b: '清单、日历、项目管理', c: '群聊、社区、共创白板', d: '灵感笔记、思维导图' },
  { id: 'HBDI-24', text: '对「拖延」你的看法是？', a: '没想清楚前不动手是理性', b: '拖延就是计划没排好', c: '有时是想等大家情绪理顺', d: '灵感没到，强做也没用' },

  // —— 人际与情绪（每题 4 选项依次对应 A/B/C/D）——
  { id: 'HBDI-25', text: '聚会里你更容易？', a: '和人聊深度话题或安静观察', b: '帮忙张罗、照顾细节', c: '主动热场、认识新朋友', d: '聊天马行空的点子' },
  { id: 'HBDI-26', text: '朋友向你倾诉，你通常？', a: '帮他分析因果', b: '帮他列个解决清单', c: '先陪着他、共情安慰', d: '带他换个角度看、轻松起来' },
  { id: 'HBDI-27', text: '你更在意的评价是？', a: '「他/她很聪明、想得透」', b: '「他/她很靠谱、靠得住」', c: '「他/她很暖、懂我」', d: '「他/她很有想法、有趣」' },
  { id: 'HBDI-28', text: '带新人时你更侧重？', a: '讲清原理与判断框架', b: '交代标准动作与规范', c: '多鼓励、建立信任', d: '激发他自己的好奇与探索' },

  // —— 创新与想象（每题 4 选项依次对应 A/B/C/D）——
  { id: 'HBDI-29', text: '你眼中的好点子要？', a: '逻辑自洽、经得起推敲', b: '马上能落地、有抓手', c: '大家愿意参与、有共鸣', d: '足够新奇、前所未见' },
  { id: 'HBDI-30', text: '头脑风暴你常？', a: '负责验证想法的可行性', b: '负责把想法收敛成计划', c: '负责让每个人都能发声', d: '负责抛最多最野的念头' },
  { id: 'HBDI-31', text: '你更喜欢的阅读是？', a: '科普、论文、推理', b: '实操手册、方法论', c: '人物故事、随笔', d: '科幻、诗、脑洞文' },
  { id: 'HBDI-32', text: '对「标准答案」你的态度是？', a: '有标准答案才严谨', b: '按标准来最稳妥', c: '答案要让人舒服才好', d: '哪有标准答案，各有各解' },

  // —— 综合偏好（每题 4 选项依次对应 A/B/C/D）——
  { id: 'HBDI-33', text: '你理想的一天是？', a: '沉浸式搞定一个硬问题', b: '把待办一条条划掉', c: '和合拍的人聊得尽兴', d: '冒出一个让自己兴奋的念头' },
  { id: 'HBDI-34', text: '你更愿被贴的标签是？', a: '理性', b: '靠谱', c: '温暖', d: '创意' },
  { id: 'HBDI-35', text: '选搭档你最看重？', a: '脑子是否清楚', b: '是否细致负责', c: '是否好相处', d: '是否有火花' },
  { id: 'HBDI-36', text: '你减压的方式是？', a: '独自把问题想通', b: '把事情收拾整齐', c: '找人聊聊天', d: '做点随性的新鲜事' },
  { id: 'HBDI-37', text: '看到混乱你第一反应是？', a: '理清背后的结构', b: '赶紧建立秩序', c: '先安抚受影响的人', d: '乱就乱吧，也许有惊喜' },
  { id: 'HBDI-38', text: '你更相信？', a: '逻辑与证据', b: '经验与流程', c: '人情与默契', d: '直觉与灵感' },
  { id: 'HBDI-39', text: '一个项目收尾，你最在意？', a: '结论是否站得住脚', b: '是否按时按质交付', c: '大家是否都满意', d: '过程是否够精彩' },
  { id: 'HBDI-40', text: '如果只能带一种能力，你选？', a: '深度思考', b: '高效执行', c: '共情连接', d: '天马行空' },
];

function computeResult(answers, qs) {
  const counts = { A: 0, B: 0, C: 0, D: 0 };
  let answered = 0;

  qs.forEach((q, i) => {
    const a = answers[i];
    if (a == null) return;
    const dim = QUAD_ORDER[a];
    if (counts[dim] !== undefined) counts[dim]++;
    answered++;
  });

  const total = answered || qs.length;

  // 按被选次数排序
  const sorted = Object.keys(counts).sort((a, b) => counts[b] - counts[a]);
  const top = sorted[0];
  const second = sorted[1];

  // 主导象限（领先 4 票及以上取单一，否则取前二组合）
  let style;
  if (counts[top] >= counts[second] + 4) {
    style = top;
  } else {
    style = top + second;
  }

  // 左/右脑（cerebral）与 上/下脑（limbic）偏好
  const left = counts.A + counts.B;
  const right = counts.C + counts.D;
  const upper = counts.A + counts.D;
  const lower = counts.B + counts.C;

  const hemisphere = left > right ? '左脑主导（理性/务实）' : (right > left ? '右脑主导（人际/创意）' : '左右脑均衡');
  const level = upper > lower ? '上脑主导（逻辑/创新）' : (lower > upper ? '下脑主导（组织/共情）' : '上下脑均衡');

  // 全脑均衡度：最高与最低象限差 ≤ 4 视为均衡型
  const maxC = counts[sorted[0]];
  const minC = counts[sorted[3]];
  const balanced = (maxC - minC) <= 4;

  const profileName = balanced
    ? '全脑均衡型'
    : QUAD_INFO[top].name + '主导';

  // 相对薄弱象限：用于优势管理中的「刻意补位 / 借力」建议
  const weak = sorted[3];

  const letters = style.split('');
  const nameParts = letters.map((k) => QUAD_INFO[k].name);
  const enParts = letters.map((k) => QUAD_INFO[k].en);
  const typeName = nameParts.join('·');
  const trait = `${style} · ${enParts.join('/')}`;
  const description = letters.map((k) => `${QUAD_INFO[k].name}（${QUAD_INFO[k].desc}）`).join('；') + '。';

  return {
    style,
    type: style,
    typeName,
    profileName,
    balanced,
    weak,
    devName: QUAD_INFO[weak].name,
    hemisphere,
    level,
    trait,
    description,
    counts,
    groups: counts,
    raw: answered,
    total: qs.length,
    totalStat: { correct: 0, wrong: 0, skipped: qs.length - answered },
  };
}

module.exports = {
  id: 'hbdi',
  type: 'personality',
  name: 'HBDI 全脑优势测评',
  shortName: 'HBDI',
  desc: '基于赫曼全脑模型，评估你分析、组织、共情、创新四大思维象限的优势剖面。',
  reference: 'Herrmann, N. — Whole Brain Model / HBDI® 全脑优势模型（本实现为公共领域全脑模型的教育简化版，非授权常模）',
  scoring: '四象限倾向计分，输出象限剖面与左/右脑、上/下脑偏好',
  icon: '🧠',
  color: '#2563eb',
  duration: 10,
  questionCount: 40,
  tag: ['全脑', '思维风格', '职场', '自我探索'],
  questionType: 'choice',

  getQuestions() {
    return QUESTIONS.map((q) => ({
      id: q.id,
      type: 'choice',
      prompt: q.text,
      options: [q.a, q.b, q.c, q.d], // 0=A，1=B，2=C，3=D
      answer: null, // HBDI 无对错
    }));
  },

  computeResult,

  getResultView(r, layout) {
    const _mkGroup = function (r, layout) {
      const total = r.total || 40;
      return ['A', 'B', 'C', 'D'].map((k) => ({
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
      const intros = letters.map((k) => `${QUAD_INFO[k].name}：${QUAD_INFO[k].trait}`);
      const strengths = letters.map((k) => `${QUAD_INFO[k].name}——优势：${QUAD_INFO[k].strength}`);
      const growths = letters.map((k) => `${QUAD_INFO[k].name}——发展：${QUAD_INFO[k].growth}`);

      // 优势管理：主导象限（优势）与相对薄弱象限（发展区）
      const devText = r.balanced
        ? '你四象限分布均衡，优势面广泛，可在不同情境中灵活调用各象限；发展重点在于避免「什么都想抓」，聚焦关键目标。'
        : `你的相对薄弱象限是 ${r.weak}（${r.devName}），典型弱项常表现为：${QUAD_INFO[r.weak].growth}。` +
          `优势管理建议：在 ${QUAD_INFO[r.weak].name} 相关事务上「刻意补位」或「借力」擅长该象限的伙伴，` +
          `把主要精力放在你最强的 ${style} 象限上，再以 IDP（个人发展计划）逐步拓展弹性。`;

      // 工作元素映射：把思维象限对应到具体工作场景（参考全脑能力模型思路）
      const workText = ['A', 'B', 'C', 'D'].map((k) =>
        `${QUAD_INFO[k].name}（${QUAD_INFO[k].en}）擅长的「工作元素」：${QUAD_INFO[k].work}`
      ).join('；') + '。';

      const brain = `脑区偏好：${r.hemisphere}；${r.level}。` +
        (r.balanced ? '你的四象限分布较为均衡，属于「全脑均衡型」，能灵活切换不同思维模式。' : '你的思维能量有明显集中区，可刻意锻炼相对薄弱的象限以拓展思维弹性。');

      // 职业应用：结合自我优势与职业生涯管理
      const careerText = r.balanced
        ? '职业上你适配度高、转型弹性大：可优先选择能发挥全脑协作的岗位，并警惕因兴趣过广而分散深耕。'
        : `职业生涯上，你的「优势才干」集中在 ${style} 象限，适合承担 ${QUAD_INFO[letters[0]].work.split('、')[0]} 类核心职责；` +
          `规划转型或制定 IDP 时，可把 ${r.weak} 象限对应的能力列为「可迁移短板」，用 ADKAR 式变革思路（认知-渴望-知识-能力-巩固）小步迭代补齐。`;

      return [
        { title: '全脑优势', text: `你的主导思维象限为 ${style}（${r.typeName}），整体轮廓为「${r.profileName}」。${intros.join(' ')}` },
        { title: '思维优势', text: strengths.join('；') + '。' },
        { title: '发展建议', text: growths.join('；') + '。' },
        { title: '优势管理', text: devText },
        { title: '工作元素', text: workText },
        { title: '职业应用', text: careerText },
        { title: '脑区偏好', text: brain },
        { title: '协作提示', text: '了解自己与他人在各象限的强弱差异，有助于在团队中互补分工：分析型把关逻辑、组织型保障落地、共情型凝聚人心、创新型打开局面。' },
      ];
    };
    const groups = _mkGroup(r, layout);
    const dims = mapDimensions(r.dimensions);
    const subtests = [];
    const interpretations = _mkInterp(r, groups, dims);
    const showBipolar = !!(dims[0] && dims[0].leftPercent !== undefined);
    return { groups, dims, subtests, interpretations, showBipolar };
  },

  resultLayout: {
    primaryField: 'style',
    primaryLabel: '全脑优势',
    primarySuffix: '',
    groupLabels: { A: '分析型(蓝)', B: '组织型(绿)', C: '共情型(红)', D: '创新型(黄)' },
    interpretation: true,
  },
};
