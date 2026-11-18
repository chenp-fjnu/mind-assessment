/**
 * 量表主结果的「优劣方向」元数据。
 *
 * 详情页/结果页的「历史最佳」不能一律取最大值：
 *  - lower：症状 / 困扰类，分数越低越好（焦虑、抑郁、压力、睡眠、孤独）；
 *  - higher：能力 / 积极心理类，分数越高越好（自尊、自我效能、韧性、推理、正确率）；
 *  - none：类型 / 画像类，没有单一「最佳」（MBTI、DISC、霍兰德等）。
 *
 * 未列出的模块一律按 none 处理，避免把类型字符串当成分数比较。
 * 后续如把 better 下沉到各模块 resultLayout，可在 registry 层合并，页面无需改动。
 */
const LOWER_BETTER = ['sds', 'sas', 'gad7', 'dass21', 'phq9', 'pss', 'psqi', 'ucla']
const HIGHER_BETTER = ['ses', 'gses', 'cdrise', 'spm', 'wechsler', 'n808', 'mind6']

function directionFor(id) {
  if (LOWER_BETTER.indexOf(id) >= 0) return 'lower'
  if (HIGHER_BETTER.indexOf(id) >= 0) return 'higher'
  return 'none'
}

// 从主结果值中选出「最佳」；none 或无数值返回 null
function pickBest(values, direction) {
  const nums = (values || [])
    .map((v) => parseFloat(v))
    .filter((n) => !isNaN(n))
  if (!nums.length || direction === 'none') return null
  return direction === 'lower' ? Math.min.apply(null, nums) : Math.max.apply(null, nums)
}

module.exports = { directionFor, pickBest, LOWER_BETTER, HIGHER_BETTER }
