/**
 * 16PF 卡特尔 16 种人格因素问卷（扩展版 160 题）
 *
 * 完整 16PF 共 187 题，此处采用公开领域 IPIP 16PF 初步量表，每因素 10 题，共 160 题：
 *   A  乐群性 (Warmth)             — 热情 vs 冷漠
 *   B  聪慧性 (Reasoning)           — 善于抽象思考
 *   C  稳定性 (Emotional Stability) — 情绪成熟 vs 易波动
 *   E  恃强性 (Dominance)          — 支配 vs 顺从
 *   F  兴奋性 (Liveliness)         — 活泼 vs 严肃
 *   G  有恒性 (Rule-Consciousness) — 责任感 vs 权变
 *   H  敢为性 (Social Boldness)    — 大胆 vs 害羞
 *   I  敏感性 (Sensitivity)        — 感性 vs 理性
 *   L  怀疑性 (Vigilance)          — 警惕 vs 信任
 *   M  幻想性 (Abstractedness)     — 爱幻想 vs 务实
 *   N  世故性 (Privateness)        — 精明 vs 直率
 *   O  忧虑性 (Apprehension)       — 不安 vs 自信
 *   Q1 实验性 (Openness to Change) — 求新 vs 保守
 *   Q2 独立性 (Self-Reliance)      — 自主 vs 依赖群体
 *   Q3 自律性 (Perfectionism)      — 自制 vs 随意
 *   Q4 紧张性 (Tension)            — 紧张 vs 放松
 *
 * 每题为 5 级量表：1=非常不同意 ... 5=非常同意
 * 部分题目反向计分。
 */

const { computeScaleScores } = require('../../utils/scale-scoring');

const FACTORS = {
  A:  { name: '乐群性', en: 'Warmth',              low: '冷淡矜持，偏好独处，与人保持距离。',          high: '热情开朗，乐于与人交往，容易亲近。' },
  B:  { name: '聪慧性', en: 'Reasoning',           low: '偏重具体思维，抽象推理能力有待加强。',        high: '善于抽象思考，逻辑推理能力强。' },
  C:  { name: '稳定性', en: 'Emotional Stability', low: '情绪易波动，受挫后恢复较慢。',                high: '情绪成熟稳定，能从容应对压力。' },
  E:  { name: '恃强性', en: 'Dominance',           low: '顺从谦和，不喜欢与人争执。',                  high: '独立强势，喜欢主导和影响他人。' },
  F:  { name: '兴奋性', en: 'Liveliness',          low: '严肃审慎，沉默寡言。',                        high: '活泼热情，健谈风趣。' },
  G:  { name: '有恒性', en: 'Rule-Consciousness',  low: '灵活权变，不拘泥规则。',                      high: '有责任感，遵守规则，持之以恒。' },
  H:  { name: '敢为性', en: 'Social Boldness',     low: '害羞退缩，在陌生场合拘谨。',                  high: '大胆自信，敢于在社交中表现自我。' },
  I:  { name: '敏感性', en: 'Sensitivity',         low: '理性务实，注重客观事实。',                    high: '感性细腻，重视情感与审美。' },
  L:  { name: '怀疑性', en: 'Vigilance',           low: '信任他人，坦诚接纳。',                        high: '警惕多疑，对他人动机保持戒备。' },
  M:  { name: '幻想性', en: 'Abstractedness',      low: '脚踏实地，关注现实。',                        high: '富有想象力，常沉浸于幻想与创意。' },
  N:  { name: '世故性', en: 'Privateness',         low: '直率天真，心里藏不住话。',                    high: '精明老练，懂得人情世故。' },
  O:  { name: '忧虑性', en: 'Apprehension',        low: '自信安详，较少自我怀疑。',                    high: '忧虑不安，常自责与担忧。' },
  Q1: { name: '实验性', en: 'Openness to Change',  low: '保守传统，尊重既有观念。',                    high: '思想开放，乐于尝试新观念新方法。' },
  Q2: { name: '独立性', en: 'Self-Reliance',       low: '依赖群体，喜欢集体决策。',                    high: '独立自主，自己做决定。' },
  Q3: { name: '自律性', en: 'Perfectionism',       low: '随性自然，不喜约束。',                        high: '自律严谨，对自己要求高。' },
  Q4: { name: '紧张性', en: 'Tension',             low: '轻松平静，身心松弛。',                        high: '紧张焦虑，常处于驱动状态。' },
};

// 每因素 10 题，共 160 题
// 题目来源于公开领域的 IPIP 16PF 初步量表（公有领域，https://ipip.ori.org/new16PFKey.htm），
// 该量表由 Lewis Goldberg 将 IPIP 题库项目按与 16PF 各因子的相关性进行键控，
// 亦被 openpsychometrics.org 的 16PF 测试所采用。此处翻译为简体中文。
// 正向键控（agree=高分）reverse:false；负向键控（agree=低分）reverse:true。
const QUESTIONS = [
  // A 乐群性 (Warmth)
  { id: 'PF-01', factor: 'A', reverse: false, text: '我懂得如何安慰他人。' },
  { id: 'PF-02', factor: 'A', reverse: false, text: '我喜欢把人们聚到一起。' },
  { id: 'PF-03', factor: 'A', reverse: false, text: '我能感受到他人的情绪。' },
  { id: 'PF-04', factor: 'A', reverse: false, text: '我对他人的生活感兴趣。' },
  { id: 'PF-05', factor: 'A', reverse: false, text: '我能让他人振作起来。' },
  { id: 'PF-06', factor: 'A', reverse: false, text: '我能让别人感到轻松自在。' },
  { id: 'PF-07', factor: 'A', reverse: false, text: '我愿意花时间陪伴他人。' },
  { id: 'PF-08', factor: 'A', reverse: true,  text: '我不喜欢卷入他人的麻烦中。' },
  { id: 'PF-09', factor: 'A', reverse: true,  text: '我对别人并不真正感兴趣。' },
  { id: 'PF-10', factor: 'A', reverse: true,  text: '我尽量不去想那些需要帮助的人。' },
  // B 聪慧性 (Reasoning)
  { id: 'PF-11', factor: 'B', reverse: false, text: '我能提出有见地的见解。' },
  { id: 'PF-12', factor: 'B', reverse: false, text: '我知道很多问题的答案。' },
  { id: 'PF-13', factor: 'B', reverse: false, text: '我倾向于分析事物。' },
  { id: 'PF-14', factor: 'B', reverse: false, text: '我善于动脑筋。' },
  { id: 'PF-15', factor: 'B', reverse: false, text: '我学东西很快。' },
  { id: 'PF-16', factor: 'B', reverse: false, text: '我能反驳他人的论点。' },
  { id: 'PF-17', factor: 'B', reverse: false, text: '行动前我会先反思。' },
  { id: 'PF-18', factor: 'B', reverse: true,  text: '我认为自己只是个普通人。' },
  { id: 'PF-19', factor: 'B', reverse: true,  text: '我很容易感到困惑。' },
  { id: 'PF-20', factor: 'B', reverse: true,  text: '我知道自己并非特殊的人。' },
  // C 稳定性 (Emotional Stability)
  { id: 'PF-21', factor: 'C', reverse: false, text: '我很少感到沮丧。' },
  { id: 'PF-22', factor: 'C', reverse: false, text: '我对自己感到坦然自在。' },
  { id: 'PF-23', factor: 'C', reverse: false, text: '我能很快从挫折中恢复。' },
  { id: 'PF-24', factor: 'C', reverse: false, text: '大多数时候我很放松。' },
  { id: 'PF-25', factor: 'C', reverse: false, text: '我不容易感到挫败。' },
  { id: 'PF-26', factor: 'C', reverse: true,  text: '我的情绪波动很频繁。' },
  { id: 'PF-27', factor: 'C', reverse: true,  text: '我经常感到沮丧。' },
  { id: 'PF-28', factor: 'C', reverse: true,  text: '我不太喜欢自己。' },
  { id: 'PF-29', factor: 'C', reverse: true,  text: '我常感到绝望。' },
  { id: 'PF-30', factor: 'C', reverse: true,  text: '我很容易被泄气。' },
  // E 恃强性 (Dominance)
  { id: 'PF-31', factor: 'E', reverse: false, text: '我习惯掌控局面。' },
  { id: 'PF-32', factor: 'E', reverse: false, text: '我想成为负责人。' },
  { id: 'PF-33', factor: 'E', reverse: false, text: '我会说出自己的想法。' },
  { id: 'PF-34', factor: 'E', reverse: false, text: '我不怕提出批评。' },
  { id: 'PF-35', factor: 'E', reverse: false, text: '我会主动控制事情。' },
  { id: 'PF-36', factor: 'E', reverse: false, text: '我能够采取强硬措施。' },
  { id: 'PF-37', factor: 'E', reverse: true,  text: '我会等别人来带头。' },
  { id: 'PF-38', factor: 'E', reverse: true,  text: '我从不质疑事情。' },
  { id: 'PF-39', factor: 'E', reverse: true,  text: '我让别人来做决定。' },
  { id: 'PF-40', factor: 'E', reverse: true,  text: '我任由别人摆布。' },
  // F 兴奋性 (Liveliness)
  { id: 'PF-41', factor: 'F', reverse: false, text: '我是聚会的活跃核心。' },
  { id: 'PF-42', factor: 'F', reverse: false, text: '我喜欢大型聚会。' },
  { id: 'PF-43', factor: 'F', reverse: false, text: '我经常开玩笑。' },
  { id: 'PF-44', factor: 'F', reverse: false, text: '我享受身处热闹的人群。' },
  { id: 'PF-45', factor: 'F', reverse: false, text: '我能逗朋友们开心。' },
  { id: 'PF-46', factor: 'F', reverse: false, text: '我有时会表现得疯狂放肆。' },
  { id: 'PF-47', factor: 'F', reverse: true,  text: '我很少开玩笑。' },
  { id: 'PF-48', factor: 'F', reverse: true,  text: '我不喜欢拥挤的场合。' },
  { id: 'PF-49', factor: 'F', reverse: true,  text: '听到玩笑我总是最后才笑。' },
  { id: 'PF-50', factor: 'F', reverse: true,  text: '我不喜欢吵闹的音乐。' },
  // G 有恒性 (Rule-Consciousness)
  { id: 'PF-51', factor: 'G', reverse: false, text: '我认为法律应当严格执行。' },
  { id: 'PF-52', factor: 'G', reverse: false, text: '我尽量遵守规则。' },
  { id: 'PF-53', factor: 'G', reverse: false, text: '我相信唯一真正的信仰。' },
  { id: 'PF-54', factor: 'G', reverse: false, text: '我尊重权威。' },
  { id: 'PF-55', factor: 'G', reverse: false, text: '我愿在国歌奏响时起身站立。' },
  { id: 'PF-56', factor: 'G', reverse: true,  text: '我抗拒权威。' },
  { id: 'PF-57', factor: 'G', reverse: true,  text: '我会破坏规则。' },
  { id: 'PF-58', factor: 'G', reverse: true,  text: '我会说脏话。' },
  { id: 'PF-59', factor: 'G', reverse: true,  text: '我反对权威。' },
  { id: 'PF-60', factor: 'G', reverse: true,  text: '我知道如何钻规则的空子。' },
  // H 敢为性 (Social Boldness)
  { id: 'PF-61', factor: 'H', reverse: false, text: '我在人群之中感到自在。' },
  { id: 'PF-62', factor: 'H', reverse: false, text: '在聚会上我会和很多人交谈。' },
  { id: 'PF-63', factor: 'H', reverse: false, text: '我不介意成为关注的中心。' },
  { id: 'PF-64', factor: 'H', reverse: false, text: '我很容易交到朋友。' },
  { id: 'PF-65', factor: 'H', reverse: false, text: '我会主动开启话题。' },
  { id: 'PF-66', factor: 'H', reverse: true,  text: '我觉得主动接近别人很困难。' },
  { id: 'PF-67', factor: 'H', reverse: true,  text: '在别人身边我常感到不自在。' },
  { id: 'PF-68', factor: 'H', reverse: true,  text: '我没什么话可说。' },
  { id: 'PF-69', factor: 'H', reverse: true,  text: '在陌生人面前我很安静。' },
  { id: 'PF-70', factor: 'H', reverse: true,  text: '我习惯待在幕后。' },
  // I 敏感性 (Sensitivity)
  { id: 'PF-71', factor: 'I', reverse: false, text: '我喜欢阅读。' },
  { id: 'PF-72', factor: 'I', reverse: false, text: '我喜欢和别人讨论电影与书籍。' },
  { id: 'PF-73', factor: 'I', reverse: false, text: '我读很多书。' },
  { id: 'PF-74', factor: 'I', reverse: false, text: '我不喜欢动作片。' },
  { id: 'PF-75', factor: 'I', reverse: false, text: '看电影时我会流泪。' },
  { id: 'PF-76', factor: 'I', reverse: false, text: '我喜爱花朵。' },
  { id: 'PF-77', factor: 'I', reverse: true,  text: '我不喜欢看舞蹈表演。' },
  { id: 'PF-78', factor: 'I', reverse: true,  text: '我不喜欢诗歌。' },
  { id: 'PF-79', factor: 'I', reverse: true,  text: '我不喜欢小说类作品。' },
  { id: 'PF-80', factor: 'I', reverse: true,  text: '我很少注意到自己的情绪反应。' },
  // L 怀疑性 (Vigilance)
  { id: 'PF-81', factor: 'L', reverse: false, text: '我很难原谅别人。' },
  { id: 'PF-82', factor: 'L', reverse: false, text: '我怀疑他人隐藏的动机。' },
  { id: 'PF-83', factor: 'L', reverse: false, text: '我对他人保持警惕。' },
  { id: 'PF-84', factor: 'L', reverse: false, text: '我不信任别人。' },
  { id: 'PF-85', factor: 'L', reverse: false, text: '我相信人们很少说出全部真相。' },
  { id: 'PF-86', factor: 'L', reverse: false, text: '我相信人性本恶。' },
  { id: 'PF-87', factor: 'L', reverse: true,  text: '我相信别人说的话。' },
  { id: 'PF-88', factor: 'L', reverse: true,  text: '我信任他人。' },
  { id: 'PF-89', factor: 'L', reverse: true,  text: '我相信他人心怀善意。' },
  { id: 'PF-90', factor: 'L', reverse: true,  text: '我相信人本质上是道德的。' },
  // M 幻想性 (Abstractedness)
  { id: 'PF-91', factor: 'M', reverse: false, text: '我会做些别人觉得奇怪的事。' },
  { id: 'PF-92', factor: 'M', reverse: false, text: '我喜欢陷入沉思。' },
  { id: 'PF-93', factor: 'M', reverse: false, text: '我享受天马行空的幻想。' },
  { id: 'PF-94', factor: 'M', reverse: false, text: '我爱做白日梦。' },
  { id: 'PF-95', factor: 'M', reverse: false, text: '我常不随大流，逆流而行。' },
  { id: 'PF-96', factor: 'M', reverse: false, text: '我常持有反常的立场。' },
  { id: 'PF-97', factor: 'M', reverse: false, text: '我会做一些出人意料的事。' },
  { id: 'PF-98', factor: 'M', reverse: true,  text: '我按部就班地做事。' },
  { id: 'PF-99', factor: 'M', reverse: true,  text: '我很少做白日梦。' },
  { id: 'PF-100', factor: 'M', reverse: true,  text: '我很少陷入沉思。' },
  // N 世故性 (Privateness)
  { id: 'PF-101', factor: 'N', reverse: false, text: '我很少透露自己的事。' },
  { id: 'PF-102', factor: 'N', reverse: false, text: '我难以被了解。' },
  { id: 'PF-103', factor: 'N', reverse: false, text: '我不怎么说话。' },
  { id: 'PF-104', factor: 'N', reverse: false, text: '我把感情憋在心里。' },
  { id: 'PF-105', factor: 'N', reverse: false, text: '我守着自己的想法不外露。' },
  { id: 'PF-106', factor: 'N', reverse: true,  text: '我对他人敞开自己。' },
  { id: 'PF-107', factor: 'N', reverse: true,  text: '我毫不掩饰自己的感受。' },
  { id: 'PF-108', factor: 'N', reverse: true,  text: '我会吐露内心的想法。' },
  { id: 'PF-109', factor: 'N', reverse: true,  text: '我会表露自己的情绪。' },
  { id: 'PF-110', factor: 'N', reverse: true,  text: '我愿意谈论自己。' },
  // O 忧虑性 (Apprehension)
  { id: 'PF-111', factor: 'O', reverse: false, text: '我害怕自己会做错事。' },
  { id: 'PF-112', factor: 'O', reverse: false, text: '我很容易感到受威胁。' },
  { id: 'PF-113', factor: 'O', reverse: false, text: '我很容易受伤。' },
  { id: 'PF-114', factor: 'O', reverse: false, text: '我会为各种事情担忧。' },
  { id: 'PF-115', factor: 'O', reverse: false, text: '我会花时间回想过去的错误。' },
  { id: 'PF-116', factor: 'O', reverse: false, text: '我说"不"的时候会感到内疚。' },
  { id: 'PF-117', factor: 'O', reverse: false, text: '挫折令我难以承受。' },
  { id: 'PF-118', factor: 'O', reverse: true,  text: '我不为已经发生的事担忧。' },
  { id: 'PF-119', factor: 'O', reverse: true,  text: '我不太容易被事情困扰。' },
  { id: 'PF-120', factor: 'O', reverse: true,  text: '我不会让别人使我泄气。' },
  // Q1 实验性 (Openness to Change)
  { id: 'PF-121', factor: 'Q1', reverse: false, text: '我相信艺术很重要。' },
  { id: 'PF-122', factor: 'Q1', reverse: false, text: '我爱想出做事的新方法。' },
  { id: 'PF-123', factor: 'Q1', reverse: false, text: '我喜欢听新的想法。' },
  { id: 'PF-124', factor: 'Q1', reverse: false, text: '我会把谈话提升到更高层次。' },
  { id: 'PF-125', factor: 'Q1', reverse: false, text: '比起例行公事，我更喜欢变化。' },
  { id: 'PF-126', factor: 'Q1', reverse: true,  text: '我回避哲学讨论。' },
  { id: 'PF-127', factor: 'Q1', reverse: true,  text: '我很少去探究事物更深层的意义。' },
  { id: 'PF-128', factor: 'Q1', reverse: true,  text: '我对理论讨论不感兴趣。' },
  { id: 'PF-129', factor: 'Q1', reverse: true,  text: '我对抽象概念不感兴趣。' },
  { id: 'PF-130', factor: 'Q1', reverse: true,  text: '我尽量避开复杂的人。' },
  // Q2 独立性 (Self-Reliance)
  { id: 'PF-131', factor: 'Q2', reverse: false, text: '我希望独处。' },
  { id: 'PF-132', factor: 'Q2', reverse: false, text: '我更喜欢自己做事。' },
  { id: 'PF-133', factor: 'Q2', reverse: false, text: '我享受独自度过的时光。' },
  { id: 'PF-134', factor: 'Q2', reverse: false, text: '我寻求安静。' },
  { id: 'PF-135', factor: 'Q2', reverse: false, text: '我不介意一个人吃饭。' },
  { id: 'PF-136', factor: 'Q2', reverse: false, text: '我享受宁静。' },
  { id: 'PF-137', factor: 'Q2', reverse: false, text: '我享受自己的隐私。' },
  { id: 'PF-138', factor: 'Q2', reverse: true,  text: '我享受成为群体的一员。' },
  { id: 'PF-139', factor: 'Q2', reverse: true,  text: '我享受团队合作。' },
  { id: 'PF-140', factor: 'Q2', reverse: true,  text: '我离不开他人的陪伴。' },
  // Q3 自律性 (Perfectionism)
  { id: 'PF-141', factor: 'Q3', reverse: false, text: '我希望一切"恰到好处"。' },
  { id: 'PF-142', factor: 'Q3', reverse: false, text: '我马上就把杂务做完。' },
  { id: 'PF-143', factor: 'Q3', reverse: false, text: '我喜欢条理有序。' },
  { id: 'PF-144', factor: 'Q3', reverse: false, text: '我会一直做到尽善尽美。' },
  { id: 'PF-145', factor: 'Q3', reverse: false, text: '我对工作要求严格。' },
  { id: 'PF-146', factor: 'Q3', reverse: true,  text: '乱糟糟的人不会让我困扰。' },
  { id: 'PF-147', factor: 'Q3', reverse: true,  text: '我不被混乱所困扰。' },
  { id: 'PF-148', factor: 'Q3', reverse: true,  text: '我的房间一团糟。' },
  { id: 'PF-149', factor: 'Q3', reverse: true,  text: '我把东西随处乱放。' },
  { id: 'PF-150', factor: 'Q3', reverse: true,  text: '我会拖延不愉快的任务。' },
  // Q4 紧张性 (Tension)
  { id: 'PF-151', factor: 'Q4', reverse: false, text: '我很容易烦躁。' },
  { id: 'PF-152', factor: 'Q4', reverse: false, text: '我很容易生气。' },
  { id: 'PF-153', factor: 'Q4', reverse: false, text: '我很快就对人下判断。' },
  { id: 'PF-154', factor: 'Q4', reverse: false, text: '别人的错误会让我恼火。' },
  { id: 'PF-155', factor: 'Q4', reverse: false, text: '我很容易被惹恼。' },
  { id: 'PF-156', factor: 'Q4', reverse: false, text: '我受不了被人反驳。' },
  { id: 'PF-157', factor: 'Q4', reverse: false, text: '我以貌取人。' },
  { id: 'PF-158', factor: 'Q4', reverse: true,  text: '我不易被惹恼。' },
  { id: 'PF-159', factor: 'Q4', reverse: true,  text: '我尽量原谅并忘却。' },
  { id: 'PF-160', factor: 'Q4', reverse: true,  text: '我对每个人都说好话。' },
];

function computeResult(answers, qs) {
  const factors = computeScaleScores(answers, qs, FACTORS, {
    min: 1, max: 5, highThreshold: 65, lowThreshold: 35, defaultVal: 3,
  });

  // 次元因素（简化估算）
  const anxietyScore = (100 - factors.C.percent) + factors.O.percent + factors.Q4.percent;
  const extroversionScore = factors.A.percent + factors.F.percent + factors.H.percent + (100 - factors.Q2.percent);
  const sensitivityScore = factors.I.percent + factors.M.percent;

  return {
    factors,
    dimensions: factors,
    raw: Object.values(factors).reduce((a, f) => a + f.sum, 0),
    total: qs.length,
    totalStat: { correct: 0, wrong: 0, skipped: answers.filter((a) => a == null).length },
    type: '16PF',
    typeName: '十六因素人格画像',
    trait: `${Object.keys(factors).map((f) => f + factors[f].percent).join(' ')}`,
    description: `16项人格因素中，${Object.entries(factors)
      .filter(([, f]) => f.level === 'high')
      .slice(0, 4)
      .map(([k, f]) => f.name + '偏高')
      .join('、') || '各因素较为均衡'}。`,
    groups: Object.fromEntries(Object.entries(factors).map(([k, f]) => [k, f.sum])),
    secondary: {
      anxiety: { score: Math.round(anxietyScore / 3), label: anxietyScore / 3 < 50 ? '适应型' : '焦虑型' },
      extroversion: { score: Math.round(extroversionScore / 4), label: extroversionScore / 4 >= 50 ? '外向型' : '内向型' },
      sensitivity: { score: Math.round(sensitivityScore / 2), label: sensitivityScore / 2 >= 50 ? '感性型' : '理性型' },
    },
  };
}

module.exports = {
  id: 'pf16',
  type: 'personality',
  name: '卡特尔 16PF 人格测验',
  shortName: '16PF',
  desc: '基于卡特尔 16 种人格因素模型的测评，全面评估 16 个独立人格维度及次元特征。',
  icon: '🎯',
  color: '#be185d',
  duration: 20,
  questionCount: 160,
  paid: false,
  price: 0,
  tag: ['人格', '性格', '16因素'],
  questionType: 'scale',

  getQuestions() {
    return QUESTIONS.map((q) => ({
      id: q.id,
      type: 'scale',
      dimension: q.factor,
      reverse: q.reverse,
      prompt: q.text,
      scale: { min: 1, max: 5, labels: ['非常不同意', '不同意', '中立', '同意', '非常同意'] },
      answer: null,
    }));
  },

  computeResult,

  buildScaleDimensionList(r) {
    if (!r.dimensions) return [];
    return Object.entries(r.dimensions).map(([k, dim]) => ({
      key: k,
      name: dim.name,
      en: dim.en || '',
      percent: dim.percent,
      level: dim.level,
      text: dim.text,
      sum: dim.sum,
    }));
  },

  buildInterpretations(r, groupList, scaleDimensionList) {
    const sorted = [...scaleDimensionList].sort((a, b) => b.percent - a.percent);
    const highs = sorted.filter((d) => d.level === 'high').slice(0, 3);
    const lows = sorted.filter((d) => d.level === 'low').slice(0, 3);
    return [
      { title: '总体画像', text: r.description },
      { title: '突出因素', text: highs.length ? highs.map((d) => `${d.name}偏高(${d.percent}%)`).join('、') + '。' : '各因素较为均衡。' },
      { title: '较低因素', text: lows.length ? lows.map((d) => `${d.name}偏低(${d.percent}%)`).join('、') + '。' : '无明显低分因素。' },
      { title: '次元特征', text: `综合来看，你偏向${r.secondary.extroversion.label}、${r.secondary.anxiety.label}、${r.secondary.sensitivity.label}。` },
      { title: '发展建议', text: '16PF 反映人格的丰富细节，可结合职业发展与人际关系理解自身特点，在优势领域发挥特长。' },
    ];
  },

  // 维度标签：16PF 十六种人格因素
  getDimensionLabel(dim) {
    const labels = {
      A: '乐群性', B: '聪慧性', C: '稳定性', E: '恃强性', F: '兴奋性',
      G: '有恒性', H: '敢为性', I: '敏感性', L: '怀疑性', M: '幻想性',
      N: '世故性', O: '忧虑性', Q1: '实验性', Q2: '独立性', Q3: '自律性', Q4: '紧张性',
    };
    return labels[dim] || dim;
  },

  resultLayout: {
    primaryField: 'trait',
    primaryLabel: '人格画像',
    primarySuffix: '',
    groupLabels: Object.fromEntries(Object.entries(FACTORS).map(([k, v]) => [k, v.name])),
    interpretation: true,
    renderMode: 'scale',
  },
};
