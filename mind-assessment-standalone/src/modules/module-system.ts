/**
 * 测试模块系统
 *
 * 统一接口规范——每个测试模块需导出：
 * {
 *   id:          'spm' | 'mbti' | 'wechsler' | ...   // 唯一标识
 *   type:        'intelligence' | 'personality' | 'mood' | 'career' | 'self'  // 大类
 *   name:        '瑞文标准推理测验',
 *   shortName:   'SPM',
 *   desc:        '...',
 *   icon:        '🧩',
 *   color:       '#1e3a8a',
 *   duration:    40,        // 预计分钟
 *   questionCount: 60,
 *   paid:        true,      // 是否需付费解锁完整报告
 *   price:       9.9,
 *   tag:         ['智力','图形'],  // 标签
 *
 *   // 题型定义：本模块用到的渲染类型
 *   // matrix    - 3x3 图形矩阵（figure 数据）
 *   // choice    - 单选文字
 *   // scale     - 5 级量表
 *   // number    - 数字输入
 *   // sequence  - 序列选择
 *   questionType: 'matrix' | 'choice' | 'scale' | 'number',
 *
 *   // 取题：返回题目数组（可分页/分段）
 *   getQuestions: () => Array<Question>,
 *
 *   // 评分：输入答案数组，返回标准化结果对象
 *   computeResult: (answers, questions, timings) => Result,
 *
 *   // 结果渲染配置：告诉 report 页如何展示
 *   resultLayout: {
 *     primaryField: 'iq',          // 大号显示字段
 *     primaryLabel: 'IQ',
 *     primarySuffix: '',
 *     showGroups: true,            // 是否展示分组
 *     groupLabels: {...},
 *     showDetail: true,            // 是否展示答题详情
 *     interpretation: true,        // 是否展示解读
 *   }
 * }
 *
 * Question 通用结构：
 * {
 *   id, type, prompt?, matrix?, options?, scale?, answer?, dimension?, score?
 * }
 */

import spm from './spm';
import mbti from './mbti';
import wechsler from './wechsler';
import big5 from './big5';
import pf16 from './pf16';
import sds from './sds';
import sas from './sas';
import gad7 from './gad7';
import dass21 from './dass21';
import epq from './epq';
import holland from './holland';
import disc from './disc';
import ses from './ses';
import las from './las';

/** 所有已注册测试模块 */
const REGISTRY = [
  spm, mbti, wechsler,
  big5, pf16, epq, disc,
  sds, sas, gad7, dass21,
  holland, ses, las,
];

/**
 * 运行时校验模块接口完整性
 * 在开发模式下抛出警告，帮助开发者及早发现接口缺失
 */
const REQUIRED_FIELDS = ['id', 'type', 'name', 'getQuestions', 'computeResult', 'resultLayout'];
const REQUIRED_FUNCTIONS = ['getQuestions', 'computeResult'];
// P2-13: 统一类型白名单，注释与校验保持一致
const VALID_TYPES = ['intelligence', 'personality', 'mood', 'career', 'self'];

function validateModule(mod: any) {
  const missing = REQUIRED_FIELDS.filter((f) => mod[f] === undefined || mod[f] === null);
  if (missing.length) {
    console.warn(`[module-system] 模块 "${mod.id || '未知'}" 缺少必需字段: ${missing.join(', ')}`);
  }
  const missingFns = REQUIRED_FUNCTIONS.filter((f) => typeof mod[f] !== 'function');
  if (missingFns.length) {
    console.warn(`[module-system] 模块 "${mod.id || '未知'}" 缺少必需方法: ${missingFns.join(', ')}`);
  }
  if (mod.resultLayout && typeof mod.resultLayout !== 'object') {
    console.warn(`[module-system] 模块 "${mod.id}" 的 resultLayout 必须为对象`);
  }
  // P2-13: 使用 VALID_TYPES 常量进行校验
  if (mod.type && !VALID_TYPES.includes(mod.type)) {
    console.warn(`[module-system] 模块 "${mod.id}" 的 type "${mod.type}" 不在已知类型中`);
  }
}

// 启动时校验所有模块
REGISTRY.forEach(validateModule);

/** 按 id 查找 */
function getModule(id: string) {
  return REGISTRY.find((m) => m.id === id);
}

/** 按类型筛选 */
function listByType(type: string) {
  return REGISTRY.filter((m) => m.type === type);
}

/** 全部模块 */
function listAll() {
  return REGISTRY.slice();
}

/** 全部模块按类型分组 */
function listGrouped() {
  const groups: Record<string, any[]> = {};
  for (const m of REGISTRY) {
    if (!groups[m.type]) groups[m.type] = [];
    groups[m.type].push(m);
  }
  return groups;
}

/** 获取模块的展示卡片信息 */
function getCard(id: string) {
  const m = getModule(id);
  if (!m) return null;
  return {
    id: m.id,
    type: m.type,
    name: m.name,
    shortName: m.shortName,
    desc: m.desc,
    icon: m.icon,
    color: m.color,
    duration: m.duration,
    questionCount: m.questionCount,
    paid: m.paid,
    price: m.price,
    tag: m.tag,
  };
}

export {
  REGISTRY,
  getModule,
  listByType,
  listAll,
  listGrouped,
  getCard,
};
