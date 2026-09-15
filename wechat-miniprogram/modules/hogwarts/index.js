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
    text: '深夜，你独自走在一条陌生的小巷里，听到身后有脚步声。你会？',
    options: ['停下脚步，转身面对', '加快脚步，保持警惕', '停下来，看是否需要帮助', '仔细听，判断是什么人'],
    houses: ['G', 'S', 'H', 'R'],
  },
  {
    id: 'HW-02',
    text: '朋友被误解了，大家都不相信他。你会？',
    options: ['站出来替他说话', '想办法找到证据证明他的清白', '陪在他身边支持他', '分析事情的来龙去脉'],
    houses: ['G', 'S', 'H', 'R'],
  },
  {
    id: 'HW-03',
    text: '你面前有两条路，一条热闹但未知，一条安静但熟悉。你会？',
    options: ['选未知的路去冒险', '选熟悉的路比较稳妥', '看有没有人一起走', '先研究一下两条路的情况'],
    houses: ['G', 'S', 'H', 'R'],
  },
  {
    id: 'HW-04',
    text: '在一次竞争中，你落后于人。你会？',
    options: ['加倍努力追赶', '寻找对方的弱点', '专注于自己的节奏', '研究对方的方法'],
    houses: ['G', 'S', 'H', 'R'],
  },
  {
    id: 'HW-05',
    text: '你捡到一个神秘的盒子，你会？',
    options: ['直接打开看看', '想办法弄清楚它的来历', '先收起来，等找到失主', '研究盒子的构造'],
    houses: ['G', 'S', 'H', 'R'],
  },
  {
    id: 'HW-06',
    text: '团队合作时，有人总是偷懒。你会？',
    options: ['直接指出来', '想办法让他主动参与', '默默做完自己的部分', '分析原因，找解决办法'],
    houses: ['G', 'S', 'H', 'R'],
  },
  {
    id: 'HW-07',
    text: '你被邀请参加一个陌生的聚会。你会？',
    options: ['欣然前往，认识新朋友', '先了解聚会的目的和人', '带上好朋友一起去', '研究一下聚会的背景'],
    houses: ['G', 'S', 'H', 'R'],
  },
  {
    id: 'HW-08',
    text: '面对一个难题，你会？',
    options: ['立刻尝试解决', '制定详细的计划', '找人一起讨论', '先分析问题的本质'],
    houses: ['G', 'S', 'H', 'R'],
  },
  {
    id: 'HW-09',
    text: '你最不能忍受什么？',
    options: ['被不公平对待', '被人轻视', '被人背叛', '被人欺骗'],
    houses: ['G', 'S', 'H', 'R'],
  },
  {
    id: 'HW-10',
    text: '你更喜欢哪种生活方式？',
    options: ['充满挑战和变化', '有明确的目标和计划', '温暖稳定有归属感', '自由探索不断学习'],
    houses: ['G', 'S', 'H', 'R'],
  },
  {
    id: 'HW-11',
    text: '如果你有一项超能力，你会选择？',
    options: ['能瞬间移动到任何地方', '能看穿别人的心思', '能治愈任何伤病', '能预知未来'],
    houses: ['G', 'S', 'H', 'R'],
  },
  {
    id: 'HW-12',
    text: '你更欣赏哪种人？',
    options: ['敢于挑战权威的人', '默默达成目标的人', '总是帮助别人的人', '知识渊博的人'],
    houses: ['G', 'S', 'H', 'R'],
  },
  {
    id: 'HW-13',
    text: '你更愿意和谁共事？',
    options: ['有魄力的领导', '聪明的策略家', '友善的同事', '博学的专家'],
    houses: ['G', 'S', 'H', 'R'],
  },
  {
    id: 'HW-14',
    text: '在陌生的地方迷路了，你会？',
    options: ['凭直觉走', '查看地图或导航', '问路人', '观察周围环境'],
    houses: ['G', 'S', 'H', 'R'],
  },
  {
    id: 'HW-15',
    text: '你更看重什么？',
    options: ['当下的体验', '长远的发展', '身边人的感受', '知识的积累'],
    houses: ['G', 'S', 'H', 'R'],
  },
  {
    id: 'HW-16',
    text: '面对不公正的事，你会？',
    options: ['挺身而出', '想办法解决', '安慰受害者', '分析原因'],
    houses: ['G', 'S', 'H', 'R'],
  },
  {
    id: 'HW-17',
    text: '你更喜欢哪种颜色？',
    options: ['红色', '绿色', '黄色', '蓝色'],
    houses: ['G', 'S', 'H', 'R'],
  },
  {
    id: 'HW-18',
    text: '你更喜欢哪种天气？',
    options: ['晴朗炎热', '阴雨连绵', '温暖和煦', '清爽微风'],
    houses: ['G', 'S', 'H', 'R'],
  },
  {
    id: 'HW-19',
    text: '在一场暴风雨中，你会？',
    options: ['冲在最前面', '寻找最佳路线', '确保每个人都安全', '观察风暴的规律'],
    houses: ['G', 'S', 'H', 'R'],
  },
  {
    id: 'HW-20',
    text: '你更喜欢哪种音乐？',
    options: ['激昂的摇滚', '神秘的电子', '温暖的民谣', '古典的交响'],
    houses: ['G', 'S', 'H', 'R'],
  },
  {
    id: 'HW-21',
    text: '面对困难，你更倾向于？',
    options: ['迎难而上', '迂回取胜', '寻求帮助', '深入研究'],
    houses: ['G', 'S', 'H', 'R'],
  },
  {
    id: 'HW-22',
    text: '你更想成为什么样的人？',
    options: ['被人敬佩', '被人需要', '被人喜欢', '被人尊重'],
    houses: ['G', 'S', 'H', 'R'],
  },
  {
    id: 'HW-23',
    text: '你更喜欢哪种运动？',
    options: ['极限运动', '策略游戏', '团队球类', '独自跑步'],
    houses: ['G', 'S', 'H', 'R'],
  },
  {
    id: 'HW-24',
    text: '你更想拥有哪种能力？',
    options: ['说服别人的能力', '预见风险的能力', '化解矛盾的能力', '发现规律的能力'],
    houses: ['G', 'S', 'H', 'R'],
  },
  {
    id: 'HW-25',
    text: '你更喜欢哪种宠物？',
    options: ['大型犬', '猫', '兔子', '猫头鹰'],
    houses: ['G', 'S', 'H', 'R'],
  },
  {
    id: 'HW-26',
    text: '你更想探索什么？',
    options: ['未知的世界', '人心的秘密', '自然的奥秘', '宇宙的真理'],
    houses: ['G', 'S', 'H', 'R'],
  },
  {
    id: 'HW-27',
    text: '你最想拥有什么？',
    options: ['一把能斩断一切的剑', '一个能改变命运的挂坠', '一个能治愈伤病的杯子', '一顶能洞察真相的冠冕'],
    houses: ['G', 'S', 'H', 'R'],
  },
  {
    id: 'HW-28',
    text: '你更喜欢哪种结局？',
    options: ['英雄胜利', '智者成功', '皆大欢喜', '真相大白'],
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
    image: '/assets/images/hogwarts/lion.jpg',
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
    image: '/assets/images/hogwarts/snake.jpg',
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
    image: '/assets/images/hogwarts/badger.jpg',
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
    image: '/assets/images/hogwarts/eagle.jpg',
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
      image: HOUSE_INFO[h].image,
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
      image: HOUSE_INFO[r.house].image,
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
