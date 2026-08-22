const { makeLabeler } = require('../../utils/labels')
/**
 * SPM 瑞文标准推理测验模块
 * 适配通用模块接口，内部复用现有 questions.js 与 scoring.js
 */
const scoring = require('../../utils/scoring');

// 延迟加载 290KB 题目数据，避免小程序启动时解析拖慢首屏
let _questions = null;
function getQuestionsData() {
  if (!_questions) _questions = require('../../utils/questions');
  return _questions;
}

const moduleDef = {
  id: 'spm',
  type: 'intelligence',
  name: '瑞文标准推理测验',
  shortName: 'SPM',
  desc: '国际通用的非言语智力测验，通过图形规律推理评估抽象思维能力。',
  icon: '🧩',
  color: '#1e3a8a',
  duration: 40,
  questionCount: 60,
  paid: false,
  price: 0,
  tag: ['智力', '图形', '非言语'],
  questionType: 'matrix',

  getQuestions() {
    return getQuestionsData().map((q) => ({
      id: q.id,
      type: 'matrix',
      set: q.set,
      rule: q.rule,
      matrix: q.matrix,
      options: q.options,
      answer: q.answer,
      timeLimit: q.timeLimit,
    }));
  },

  computeResult(answers, qs, options = {}) {
    const timings = (options && options.timings) || [];
    return scoring.computeResult(answers, qs, timings);
  },

  // 构建分组列表（下沉到模块，消除 report.js 硬编码）
  buildGroupList(r, layout) {
    return ['A', 'B', 'C', 'D', 'E'].map((k) => ({
      key: k,
      label: k,
      percent: Math.round(((r.groups[k] || 0) / 12) * 100),
      display: `${r.groups[k] || 0}/12`,
      isScale: false,
    }));
  },

  // 构建解读文本（下沉到模块，消除 report.js 硬编码）
  buildInterpretations(r, groupList) {
    const sorted = [...groupList].sort((a, b) => b.percent - a.percent);
    const strength = sorted[0];
    const weakness = sorted[sorted.length - 1];
    return [
      { title: '总体水平', text: r.description || '' },
      { title: '优势维度', text: `${strength.label} 组得分最高（${strength.display}），该类推理能力较强。` },
      { title: '提升方向', text: `${weakness.label} 组得分较低（${weakness.display}），可针对性训练。` },
      { title: '建议', text: r.iq >= 110 ? '推理能力优秀，可尝试更高难度的逻辑训练。' : '保持日常思维训练，逐步提升弱项。' },
    ];
  },

  // 维度标签：SPM 使用集合字母 A-E 作为标签
    getDimensionLabel: makeLabeler({}),

  resultLayout: {
    primaryField: 'iq',
    primaryLabel: '智商估算 IQ',
    primarySuffix: '',
    groupLabels: {
      A: '完成型', B: '递进型', C: '组合型', D: '变换型', E: '分布型',
    },
    detailType: 'grid',
    interpretation: true,
    renderMode: 'intelligence',
    showGroupLegend: true,
  },
};

module.exports = moduleDef;
