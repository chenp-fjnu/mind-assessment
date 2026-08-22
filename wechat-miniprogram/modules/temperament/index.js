/**
 * 气质类型问卷（基于 Eysenck 气质维度，60 题简化版）
 *
 * 四个气质维度，每维度 15 题，共 60 题，2 级作答：
 *   否 = 0   是 = 1
 *
 * 评分：各气质维度按「是」的题数计分（范围 0-15），总分最高的维度即为主导气质；
 * 若前两位维度分数接近（差值 ≤ 1），则提示为混合气质。
 *
 * 说明：气质无优劣之分，描述的是先天的行为能量与情绪反应风格。
 * 本测评为自我探索工具，不构成临床诊断。
 */

const TEMPER = {
  choleric: { name: '胆汁质', desc: '精力旺盛、反应迅速、直率急躁，行动力强但情绪易起伏。', advice: '善用你的行动力，同时练习在冲动前先停顿，避免人际摩擦。' },
  sanguine: { name: '多血质', desc: '活泼外向、适应力强、善于交往，兴趣广泛但易转移。', advice: '发挥你的亲和力与灵活性，注意把兴趣转化为持续的行动。' },
  phlegmatic: { name: '粘液质', desc: '安静稳重、耐心持久、情绪平和，做事有条理但偏慢热。', advice: '你的稳定是优势，遇到变化时可适度提高灵活与节奏。' },
  melancholic: { name: '抑郁质', desc: '细腻敏感、体验深刻、谨慎内省，富有同理心但易紧张。', advice: '珍视你的细腻与觉察，留意过度内耗，给情绪留出释放空间。' },
};

const QUESTIONS = [
  // 胆汁质 choleric
  { id: 'TEM-01', dim: 'choleric', text: '你做事常有很强的爆发力，但持续时间不长。' },
  { id: 'TEM-02', dim: 'choleric', text: '你容易因为小事而激动或发怒。' },
  { id: 'TEM-03', dim: 'choleric', text: '你喜欢竞争、争强好胜。' },
  { id: 'TEM-04', dim: 'choleric', text: '你做事雷厉风行，不喜欢拖沓。' },
  { id: 'TEM-05', dim: 'choleric', text: '你情绪来得快、去得也快。' },
  { id: 'TEM-06', dim: 'choleric', text: '遇到不公时你容易感到愤慨。' },
  { id: 'TEM-07', dim: 'choleric', text: '你说话大声、直来直去。' },
  { id: 'TEM-08', dim: 'choleric', text: '你很难长时间安静地坐着。' },
  { id: 'TEM-09', dim: 'choleric', text: '你适应新环境很快，但容易急躁。' },
  { id: 'TEM-10', dim: 'choleric', text: '你宁可冒险也不愿墨守成规。' },
  { id: 'TEM-11', dim: 'choleric', text: '你容易因受挫而恼火。' },
  { id: 'TEM-12', dim: 'choleric', text: '你精力旺盛、活动量大。' },
  { id: 'TEM-13', dim: 'choleric', text: '你不喜欢被细节束缚。' },
  { id: 'TEM-14', dim: 'choleric', text: '你常常先行动后思考。' },
  { id: 'TEM-15', dim: 'choleric', text: '你容易给人「脾气急」的印象。' },
  // 多血质 sanguine
  { id: 'TEM-16', dim: 'sanguine', text: '你活泼好动，喜欢与人交往。' },
  { id: 'TEM-17', dim: 'sanguine', text: '你很容易和陌生人打成一片。' },
  { id: 'TEM-18', dim: 'sanguine', text: '你的兴趣容易转移。' },
  { id: 'TEM-19', dim: 'sanguine', text: '你乐观、爱说笑。' },
  { id: 'TEM-20', dim: 'sanguine', text: '你适应新环境很快。' },
  { id: 'TEM-21', dim: 'sanguine', text: '你乐于参加热闹的聚会。' },
  { id: 'TEM-22', dim: 'sanguine', text: '你做事常有多种想法。' },
  { id: 'TEM-23', dim: 'sanguine', text: '你情绪外露、容易表现。' },
  { id: 'TEM-24', dim: 'sanguine', text: '你反应敏捷、机灵。' },
  { id: 'TEM-25', dim: 'sanguine', text: '你容易对新鲜事物产生兴趣。' },
  { id: 'TEM-26', dim: 'sanguine', text: '你不太记仇，烦恼很快过去。' },
  { id: 'TEM-27', dim: 'sanguine', text: '你喜欢变化，不喜欢单调。' },
  { id: 'TEM-28', dim: 'sanguine', text: '你表达能力强、爱表达。' },
  { id: 'TEM-29', dim: 'sanguine', text: '你容易被外界吸引而分心。' },
  { id: 'TEM-30', dim: 'sanguine', text: '你待人热情、随和。' },
  // 粘液质 phlegmatic
  { id: 'TEM-31', dim: 'phlegmatic', text: '你做事稳重、有耐心。' },
  { id: 'TEM-32', dim: 'phlegmatic', text: '你情绪平稳，不易波动。' },
  { id: 'TEM-33', dim: 'phlegmatic', text: '你喜欢按计划、有条理地做事。' },
  { id: 'TEM-34', dim: 'phlegmatic', text: '你坚持性很强，能长期做一件事。' },
  { id: 'TEM-35', dim: 'phlegmatic', text: '你不易被外界干扰。' },
  { id: 'TEM-36', dim: 'phlegmatic', text: '你待人平和、不喜冲突。' },
  { id: 'TEM-37', dim: 'phlegmatic', text: '你言语不多，但言之有物。' },
  { id: 'TEM-38', dim: 'phlegmatic', text: '你遵守规则、值得信赖。' },
  { id: 'TEM-39', dim: 'phlegmatic', text: '面对变化你会谨慎评估。' },
  { id: 'TEM-40', dim: 'phlegmatic', text: '你情绪内敛、不轻易外露。' },
  { id: 'TEM-41', dim: 'phlegmatic', text: '你做事慢而扎实。' },
  { id: 'TEM-42', dim: 'phlegmatic', text: '你不喜欢太吵闹的环境。' },
  { id: 'TEM-43', dim: 'phlegmatic', text: '你不易冲动，三思后行。' },
  { id: 'TEM-44', dim: 'phlegmatic', text: '你情绪恢复慢但很稳定。' },
  { id: 'TEM-45', dim: 'phlegmatic', text: '你给人「可靠」的感觉。' },
  // 抑郁质 melancholic
  { id: 'TEM-46', dim: 'melancholic', text: '你心思细腻、容易察觉细微变化。' },
  { id: 'TEM-47', dim: 'melancholic', text: '你比较内向、喜静。' },
  { id: 'TEM-48', dim: 'melancholic', text: '你对批评或否定比较敏感。' },
  { id: 'TEM-49', dim: 'melancholic', text: '你情绪体验深刻而持久。' },
  { id: 'TEM-50', dim: 'melancholic', text: '你容易感到紧张或不安。' },
  { id: 'TEM-51', dim: 'melancholic', text: '在陌生场合你会感到拘谨。' },
  { id: 'TEM-52', dim: 'melancholic', text: '你做事细致、追求完美。' },
  { id: 'TEM-53', dim: 'melancholic', text: '你容易为小事而忧心。' },
  { id: 'TEM-54', dim: 'melancholic', text: '你不喜欢成为关注焦点。' },
  { id: 'TEM-55', dim: 'melancholic', text: '你情感丰富但不易表达。' },
  { id: 'TEM-56', dim: 'melancholic', text: '你对他人情绪变化很敏感。' },
  { id: 'TEM-57', dim: 'melancholic', text: '独处时你更自在。' },
  { id: 'TEM-58', dim: 'melancholic', text: '你容易疲劳、需要休息。' },
  { id: 'TEM-59', dim: 'melancholic', text: '你做事谨慎、怕出错。' },
  { id: 'TEM-60', dim: 'melancholic', text: '你给人「安静内向」的印象。' },
];

function computeResult(answers, qs) {
  const sums = { choleric: 0, sanguine: 0, phlegmatic: 0, melancholic: 0 };
  let answered = 0;
  qs.forEach((q, i) => {
    const raw = answers[i];
    sums[q.dimension] += raw == null ? 0 : raw; // 0=否 1=是
    if (raw != null) answered++;
  });

  const sorted = Object.keys(sums).sort((a, b) => sums[b] - sums[a]);
  const top = sorted[0];
  const second = sorted[1];
  const mixed = sums[top] - sums[second] <= 1;

  const groups = sums;
  const dimensions = {};
  Object.keys(sums).forEach((k) => {
    dimensions[k] = { name: TEMPER[k].name, sum: sums[k], percent: Math.round((sums[k] / 15) * 100) };
  });

  const typeName = mixed ? `${TEMPER[top].name}·${TEMPER[second].name}（混合）` : TEMPER[top].name;

  return {
    type: typeName,
    typeName,
    trait: typeName,
    description: mixed
      ? `你的气质更接近 ${TEMPER[top].name} 与 ${TEMPER[second].name} 的混合类型：${TEMPER[top].desc}${TEMPER[second].desc}`
      : TEMPER[top].desc,
    advice: mixed ? `${TEMPER[top].advice}${TEMPER[second].advice}` : TEMPER[top].advice,
    dimensions,
    groups,
    raw: answered,
    total: qs.length,
    totalStat: { correct: 0, wrong: 0, skipped: qs.length - answered },
  };
}

module.exports = {
  id: 'temperament',
  type: 'personality',
  name: '气质类型问卷',
  shortName: '气质类型',
  desc: '基于气质四维度的简化测评，探索你的先天行为风格与情绪反应倾向。',
  icon: '🎭',
  color: '#0d9488',
  duration: 12,
  questionCount: 60,
  paid: false,
  price: 0,
  tag: ['人格', '气质', '性格', '自我探索'],
  questionType: 'scale',

  getQuestions() {
    return QUESTIONS.map((q) => ({
      id: q.id,
      type: 'scale',
      dimension: q.dim,
      prompt: q.text,
      scale: { min: 0, max: 1, labels: ['否', '是'] },
      answer: null,
    }));
  },

  computeResult,

  buildGroupList(r, layout) {
    return Object.keys(TEMPER).map((k) => ({
      key: k,
      label: layout.groupLabels[k] || k,
      percent: r.dimensions[k].percent,
      display: `${r.dimensions[k].sum}/15`,
      isScale: true,
    }));
  },

  buildInterpretations(r) {
    return [
      { title: '你的气质类型', text: `你是${r.typeName}。${r.description}` },
      { title: '特点解读', text: r.advice },
      { title: '重要提示', text: '气质由先天因素决定、相对稳定，无优劣之分；它描述的是你的行为能量与情绪风格，而非能力高低。了解气质有助于更好地发挥优势、与人相处。' },
    ];
  },

  getDimensionLabel(dim) {
    return TEMPER[dim] ? TEMPER[dim].name : dim;
  },

  resultLayout: {
    primaryField: 'type',
    primaryLabel: '气质类型',
    primarySuffix: '',
    groupLabels: { choleric: '胆汁质', sanguine: '多血质', phlegmatic: '粘液质', melancholic: '抑郁质' },
    interpretation: true,
  },
};
