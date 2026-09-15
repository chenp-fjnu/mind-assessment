/**
 * 霍格沃茨分院测试模块
 *
 * 基于《哈利·波特》系列的霍格沃茨分院仪式，
 * 通过 28 道选择题判断你最适合的学院：
 *   格兰芬多 (Gryffindor) - 勇敢、胆识、骑士精神
 *   斯莱特林 (Slytherin)  - 野心、狡猾、领导力
 *   赫奇帕奇 (Hufflepuff) - 勤劳、忠诚、公平
 *   拉文克劳 (Ravenclaw)  - 智慧、机智、创造力
 */

const QUESTIONS = [
  {
    id: 'HW-01',
    text: '如果你进入霍格沃茨，你最想在哪个方面表现出色？',
    options: ['成为最勇敢的巫师', '成为最有权力的巫师', '成为最忠诚的朋友', '成为最聪明的巫师'],
    houses: ['G', 'S', 'H', 'R'],
  },
  {
    id: 'HW-02',
    text: '你最想从魔药课上学会什么？',
    options: ['能让你战胜任何对手的药水', '能让你获得权力的药水', '能帮助你朋友的药水', '能让你理解世界奥秘的药水'],
    houses: ['G', 'S', 'H', 'R'],
  },
  {
    id: 'HW-03',
    text: '你最欣赏邓布利多的哪个品质？',
    options: ['他的勇气和正义感', '他的智慧和谋略', '他的善良和包容', '他的知识和洞察力'],
    houses: ['G', 'S', 'H', 'R'],
  },
  {
    id: 'HW-04',
    text: '如果你在禁林里迷路了，你会怎么做？',
    options: ['勇敢地向前探索', '冷静地寻找出路', '等待有人来救你', '仔细观察周围的线索'],
    houses: ['G', 'S', 'H', 'R'],
  },
  {
    id: 'HW-05',
    text: '你最想拥有哪种魔法能力？',
    options: ['能保护所有人的强大魔法', '能实现任何愿望的魔法', '能治愈伤病的魔法', '能洞察一切的魔法'],
    houses: ['G', 'S', 'H', 'R'],
  },
  {
    id: 'HW-06',
    text: '在魁地奇比赛中，你最想担任哪个位置？',
    options: ['追球手 - 冲锋陷阵', '队长 - 统筹全局', '守门员 - 守护团队', '找球手 - 专注目标'],
    houses: ['G', 'S', 'H', 'R'],
  },
  {
    id: 'HW-07',
    text: '你认为什么样的人最值得尊敬？',
    options: ['勇敢面对困难的人', '有野心并实现目标的人', '善良对待他人的人', '充满智慧的人'],
    houses: ['G', 'S', 'H', 'R'],
  },
  {
    id: 'HW-08',
    text: '如果你发现同学在作弊，你会怎么做？',
    options: ['当面指出他的错误', '想办法利用这个把柄', '私下劝说他改正', '思考为什么他会这样做'],
    houses: ['G', 'S', 'H', 'R'],
  },
  {
    id: 'HW-09',
    text: '你最想在哪间教室上课？',
    options: ['黑魔法防御术 - 学习战斗技巧', '魔药课 - 制作强大药水', '草药课 - 照料神奇植物', '占卜课 - 预见未来'],
    houses: ['G', 'S', 'H', 'R'],
  },
  {
    id: 'HW-10',
    text: '如果你有一整天假期，你会做什么？',
    options: ['去冒险或参加体育活动', '学习新魔法或制定计划', '和朋友们一起度过', '去图书馆看书'],
    houses: ['G', 'S', 'H', 'R'],
  },
  {
    id: 'HW-11',
    text: '你最想从分院帽那里听到什么？',
    options: ['"勇气是你最大的武器"', '"野心是你成功的阶梯"', '"忠诚是你最珍贵的品质"', '"智慧是你最强的法宝"'],
    houses: ['G', 'S', 'H', 'R'],
  },
  {
    id: 'HW-12',
    text: '如果你必须选择一种魔法生物作为伙伴，你会选择？',
    options: ['狮鹫 - 勇敢的象征', '蛇 - 野心的象征', '獾 - 忠诚的象征', '鹰 - 智慧的象征'],
    houses: ['G', 'S', 'H', 'R'],
  },
  {
    id: 'HW-13',
    text: '你认为什么品质在面对伏地魔时最重要？',
    options: ['无所畏惧的勇气', '深谋远虑的智慧', '团结一致的力量', '坚定不移的信念'],
    houses: ['G', 'S', 'H', 'R'],
  },
  {
    id: 'HW-14',
    text: '在分院仪式上，你最希望分院帽考虑什么？',
    options: ['你的勇气和胆识', '你的野心和才能', '你的善良和忠诚', '你的智慧和创造力'],
    houses: ['G', 'S', 'H', 'R'],
  },
  {
    id: 'HW-15',
    text: '你最想成为哈利波特故事中的哪个人物？',
    options: ['哈利 - 勇敢的救世主', '斯内普 - 复杂的智者', '罗恩 - 忠诚的伙伴', '赫敏 - 聪明的天才'],
    houses: ['G', 'S', 'H', 'R'],
  },
  {
    id: 'HW-16',
    text: '如果你能改变霍格沃茨的一个规则，你会改变什么？',
    options: ['允许学生更自由地探索城堡', '让学生有更多权力参与决策', '确保每个学生都被公平对待', '增加更多学习和研究的机会'],
    houses: ['G', 'S', 'H', 'R'],
  },
  {
    id: 'HW-17',
    text: '你认为霍格沃茨最应该教授什么课程？',
    options: ['战斗防御术', '领导力与策略', '团队合作与友谊', '批判性思维与创新'],
    houses: ['G', 'S', 'H', 'R'],
  },
  {
    id: 'HW-18',
    text: '在魔法世界中，你最想从事什么职业？',
    options: ['傲罗 - 追捕黑巫师', '魔法部部长 - 统治魔法界', '治疗师 - 帮助受伤的人', '魔咒研究员 - 发展魔法知识'],
    houses: ['G', 'S', 'H', 'R'],
  },
  {
    id: 'HW-19',
    text: '你最想在哪位教授的指导下学习？',
    options: ['麦格教授 - 严格而公正', '斯内普教授 - 神秘而有深度', '弗立维教授 - 温和而友善', '卢平教授 - 智慧而包容'],
    houses: ['G', 'S', 'H', 'R'],
  },
  {
    id: 'HW-20',
    text: '如果你能拥有一件魔法物品，你会选择？',
    options: ['格兰芬多之剑 - 勇气的象征', '斯莱特林挂坠盒 - 权力的象征', '赫奇帕奇金杯 - 忠诚的象征', '拉文克劳冠冕 - 智慧的象征'],
    houses: ['G', 'S', 'H', 'R'],
  },
  {
    id: 'HW-21',
    text: '在面对危险时，你通常会怎么做？',
    options: ['冲在最前面保护他人', '冷静分析后采取行动', '确保所有人都安全后再行动', '寻找最聪明的解决方案'],
    houses: ['G', 'S', 'H', 'R'],
  },
  {
    id: 'HW-22',
    text: '你最看重朋友的哪个品质？',
    options: ['勇敢 - 能一起面对困难', '聪明 - 能帮助解决问题', '忠诚 - 永远支持你', '善良 - 真心关心你'],
    houses: ['G', 'S', 'H', 'R'],
  },
  {
    id: 'HW-23',
    text: '在团队项目中，你通常扮演什么角色？',
    options: ['领导者 - 带领大家前进', '策划者 - 制定战略', '协调者 - 维护团队和谐', '思考者 - 提供创新想法'],
    houses: ['G', 'S', 'H', 'R'],
  },
  {
    id: 'HW-24',
    text: '如果你能创造一个新的魔法学院，它会是什么主题？',
    options: ['勇气学院 - 培养无畏的战士', '权力学院 - 培养领袖', '和谐学院 - 培养有爱的人', '真理学院 - 培养探索者'],
    houses: ['G', 'S', 'H', 'R'],
  },
  {
    id: 'HW-25',
    text: '你最想学会哪个咒语？',
    options: ['守护神咒 - 击退黑暗', '夺魂咒 - 控制他人', '愈合咒 - 治疗伤病', '摄神取念 - 读取思想'],
    houses: ['G', 'S', 'H', 'R'],
  },
  {
    id: 'HW-26',
    text: '你认为什么最能定义一个人？',
    options: ['他在关键时刻的选择', '他取得的成就', '他对待他人的方式', '他拥有的知识'],
    houses: ['G', 'S', 'H', 'R'],
  },
  {
    id: 'HW-27',
    text: '如果你必须选择一个魔杖杖芯，你会选择？',
    options: ['独角兽毛 - 忠诚的象征', '龙心弦 - 力量的象征', '凤凰羽毛 - 勇气的象征', '夜骐尾毛 - 智慧的象征'],
    houses: ['G', 'S', 'H', 'R'],
  },
  {
    id: 'HW-28',
    text: '在霍格沃茨，你最想参加哪个社团？',
    options: ['决斗俱乐部 - 提升战斗技能', '学生会 - 参与学校管理', '家养小精灵权益社 - 帮助弱者', '神奇动物俱乐部 - 探索魔法世界'],
    houses: ['G', 'S', 'H', 'R'],
  },
];

const HOUSE_INFO = {
  G: {
    name: '格兰芬多',
    nameEn: 'Gryffindor',
    color: '#ae0001',
    secondaryColor: '#d3a625',
    icon: '🦁',
    trait: '勇敢、胆识、骑士精神',
    desc: '格兰芬多学院以其勇敢无畏的精神著称。这里的巫师们敢于面对最黑暗的挑战，永远站在正义的一边。分院帽说："你也许属于格兰芬多，那里有埋藏在心底的勇敢，他们的胆识、气魄和豪侠义气，使格兰芬多出类拔萃。"',
    founder: '戈德里克·格兰芬多',
    element: '火',
    commonRoom: '格兰芬多公共休息室位于塔楼入口处，通过胖修士的肖像进入。',
    famousMembers: ['哈利·波特', '赫敏·格兰杰', '罗恩·韦斯莱', '阿不思·邓布利多'],
  },
  S: {
    name: '斯莱特林',
    nameEn: 'Slytherin',
    color: '#2a623d',
    secondaryColor: '#aaaaaa',
    icon: '🐍',
    trait: '野心、狡猾、领导力',
    desc: '斯莱特林学院培养有野心、有领导力的巫师。这里的学生成就欲极强，通常会获得权力。分院帽说："或许在斯莱特林，你能交到真诚的朋友，但斯莱特林会帮你达到更高的地位。"',
    founder: '萨拉查·斯莱特林',
    element: '水',
    commonRoom: '斯莱特林公共休息室位于地下室，通过一堵石墙上的暗门进入。',
    famousMembers: ['西弗勒斯·斯内普', '德拉科·马尔福', '梅林', '霍拉斯·斯拉格霍恩'],
  },
  H: {
    name: '赫奇帕奇',
    nameEn: 'Hufflepuff',
    color: '#ecb939',
    secondaryColor: '#372e29',
    icon: '🦡',
    trait: '勤劳、忠诚、公平',
    desc: '赫奇帕奇学院以其忠诚和公正著称。这里的学生成长于正直，最具耐心和公正。分院帽说："你也许属于赫奇帕奇，那里的人们公正忠诚，坚韧不诚实，赫奇帕奇会帮你找到真正的宝藏。"',
    founder: '赫尔加·赫奇帕奇',
    element: '土',
    commonRoom: '赫奇帕奇公共休息室位于地下室，通过厨房附近的壁画进入。',
    famousMembers: ['纽特·斯卡曼德', '塞德里克·迪戈里', '汉娜·艾博', '波莫娜·斯普劳特'],
  },
  R: {
    name: '拉文克劳',
    nameEn: 'Ravenclaw',
    color: '#222f5b',
    secondaryColor: '#945b9f',
    icon: '🦅',
    trait: '智慧、机智、创造力',
    desc: '拉文克劳学院以智慧著称。这里的学生成长于智慧，才思敏捷。分院帽说："或者，在拉文克劳，那里有睿智的巫师，他们的头脑充满智慧，那些聪明的人会把世间智慧掌握。"',
    founder: '罗伊纳·拉文克劳',
    element: '风',
    commonRoom: '拉文克劳公共休息室位于塔楼，通过回答门环的谜语进入。',
    famousMembers: ['卢娜·洛夫古德', '秋·张', '奥利弗·伍德', '吉德罗·洛哈特'],
  },
};

function computeResult(answers, qs) {
  const counts = { G: 0, S: 0, H: 0, R: 0 };

  qs.forEach((q, i) => {
    const a = answers[i];
    if (a !== null && a !== undefined && a >= 0) {
      const house = q.houses[a];
      if (house && counts.hasOwnProperty(house)) {
        counts[house]++;
      }
    }
  });

  const total = Object.values(counts).reduce((a, b) => a + b, 0) || 1;

  // 找出最高分的学院
  let maxHouse = 'G';
  let maxScore = 0;
  Object.entries(counts).forEach(([house, score]) => {
    if (score > maxScore) {
      maxScore = score;
      maxHouse = house;
    }
  });

  // 计算各学院百分比
  const percentages = {};
  Object.entries(counts).forEach(([house, score]) => {
    percentages[house] = Math.round((score / total) * 100);
  });

  // 计算第二选择
  let secondHouse = null;
  let secondScore = 0;
  Object.entries(counts).forEach(([house, score]) => {
    if (house !== maxHouse && score > secondScore) {
      secondScore = score;
      secondHouse = house;
    }
  });

  const houseInfo = HOUSE_INFO[maxHouse];

  return {
    house: maxHouse,
    houseName: houseInfo.name,
    houseNameEn: houseInfo.nameEn,
    trait: houseInfo.trait,
    description: houseInfo.desc,
    founder: houseInfo.founder,
    element: houseInfo.element,
    commonRoom: houseInfo.commonRoom,
    famousMembers: houseInfo.famousMembers,
    counts,
    percentages,
    secondHouse,
    secondHouseName: secondHouse ? HOUSE_INFO[secondHouse].name : null,
    raw: total,
    total: qs.length,
    totalStat: { correct: 0, wrong: 0, skipped: qs.length - total },
  };
}

module.exports = {
  id: 'hogwarts',
  type: 'personality',
  name: '霍格沃茨分院测试',
  shortName: '霍格沃茨',
  desc: '通过 28 道选择题，看看你最适合进入霍格沃茨的哪个学院！',
  reference: 'J.K. Rowling — Harry Potter 系列',
  scoring: '四学院计分，按选择倾向判定归属',
  icon: '⚡',
  color: '#7c3aed',
  duration: 10,
  questionCount: 28,
  tag: ['人格', '趣味', '哈利波特'],
  questionType: 'choice',
  hot: true,

  getQuestions() {
    return QUESTIONS.map((q) => ({
      id: q.id,
      type: 'choice',
      prompt: q.text,
      options: q.options,
      houses: q.houses,
      answer: null,
    }));
  },

  computeResult,

  getResultView(r) {
    const dims = ['G', 'S', 'H', 'R'].map((h) => ({
      key: h,
      leftPole: h,
      rightPole: h,
      leftName: HOUSE_INFO[h].name,
      rightName: HOUSE_INFO[h].name,
      leftPercent: r.percentages[h],
      rightPercent: r.percentages[h],
      dominant: h,
      dominantDesc: HOUSE_INFO[h].trait,
    }));

    const interpretations = [
      { title: '你的学院', text: `${r.houseName}（${r.houseNameEn}）—— ${r.trait}` },
      { title: '学院介绍', text: r.description },
      { title: '创始人', text: `${r.founder} · 元素：${r.element}` },
      { title: '知名校友', text: r.famousMembers.join('、') },
    ];

    if (r.secondHouse) {
      interpretations.push({
        title: '第二选择',
        text: `你也有${r.secondHouseName}的特质（${r.percentages[r.secondHouse]}%），说明你是一个多面手！`,
      });
    }

    return {
      groups: [],
      dims,
      subtests: [],
      interpretations,
      showBipolar: false,
    };
  },

  resultLayout: {
    primaryField: 'houseName',
    primaryLabel: '你的学院',
    primarySuffix: '',
    interpretation: true,
    renderMode: 'bipolar',
  },
};
