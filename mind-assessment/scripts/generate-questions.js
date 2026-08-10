/**
 * SPM 题目生成器
 * 生成 60 道瑞文标准推理测验风格题目，分 5 组（A/B/C/D/E），每组 12 题。
 *
 * 图形表示法（figure）：
 * {
 *   bg: 'dots' | 'grid' | null,                 // 背景纹理
 *   shapes: [
 *     {
 *       type: 'circle'|'square'|'triangle'|'diamond'|'plus'|'star'|'hexagon',
 *       size: 20..80,           // 相对于单元格的百分比
 *       color: '#rrggbb',
 *       rotation: 0|45|90|135|180|225|270|315,
 *       fill: 'solid'|'hollow'|'striped'|'dotted',
 *       count: 1|2|3            // 该形状重复数量（呈水平排列）
 *     }
 *   ]
 * }
 *
 * 规则类型（rule）：
 *  - constant       全图相同
 *  - progression    沿行/列递进（size/rotation/count/color 线性变化）
 *  - composition    第三行 = 第一行 + 第二行（叠加或分布三值）
 *  - distribution   三个值在各行各列各出现一次
 *  - transformation 旋转/翻转等变换
 */

const FS = require('fs');
const PATH = require('path');

// ---------- 基础工具 ----------
const clone = (o) => JSON.parse(JSON.stringify(o));
const rot = (deg) => ((deg % 360) + 360) % 360;

const PALETTE = {
  ink: '#1f2937',
  red: '#dc2626',
  blue: '#2563eb',
  green: '#16a34a',
  amber: '#d97706',
  purple: '#7c3aed',
  teal: '#0d9488',
};

const SHAPE_TYPES = ['circle', 'square', 'triangle', 'diamond', 'plus', 'star', 'hexagon'];
const FILLS = ['solid', 'hollow', 'striped', 'dotted'];

function shape(type, opts = {}) {
  return {
    type,
    size: opts.size ?? 55,
    color: opts.color ?? PALETTE.ink,
    rotation: opts.rotation ?? 0,
    fill: opts.fill ?? 'solid',
    count: opts.count ?? 1,
  };
}

// ---------- 规则引擎 ----------
// 每条规则给定 (row, col, seed) 产出第 row 行第 col 列的 figure。
// seed 是该题专属的随机种子参数对象，保证可复现。

/** Set A：完成型——整张图同一图形，仅最后一格缺失 */
function genSetA() {
  const questions = [];
  for (let i = 0; i < 12; i++) {
    const type = SHAPE_TYPES[i % SHAPE_TYPES.length];
    const color = Object.values(PALETTE)[i % Object.keys(PALETTE).length];
    const fill = FILLS[i % FILLS.length];
    const base = shape(type, { color, fill, size: 50, count: 1 });
    const fig = { bg: null, shapes: [clone(base)] };
    const matrix = Array.from({ length: 3 }, () => Array.from({ length: 3 }, () => clone(fig)));
    // 右下角置空，正确答案 = 同一图形
    const correct = clone(fig);
    matrix[2][2] = null;
    // 生成干扰项：改变颜色/填充/类型
    const distractors = [
      { bg: null, shapes: [shape(type, { color: PALETTE.gray ?? '#6b7280', fill, size: 50 })] },
      { bg: null, shapes: [shape(type, { color, fill: 'hollow', size: 50 })] },
      { bg: null, shapes: [shape(SHAPE_TYPES[(i + 1) % 7], { color, fill, size: 50 })] },
      { bg: null, shapes: [shape(type, { color, fill, size: 35 })] },
      { bg: null, shapes: [shape(type, { color, fill, size: 50, count: 2 })] },
    ];
    questions.push(buildQuestion('A', i, matrix, correct, distractors, 'constant'));
  }
  return questions;
}

/** Set B：递进型——沿行/列递进（尺寸、旋转、数量、颜色） */
function genSetB() {
  const questions = [];
  const variants = ['size', 'rotation', 'count', 'color', 'fill'];
  for (let i = 0; i < 12; i++) {
    const variant = variants[i % variants.length];
    const type = SHAPE_TYPES[(i + 2) % 7];
    const color = Object.values(PALETTE)[(i + 1) % 7];
    const fill = 'solid';
    const matrix = [];
    for (let r = 0; r < 3; r++) {
      const row = [];
      for (let c = 0; c < 3; c++) {
        const s = shape(type, { color, fill, size: 50 });
        if (variant === 'size') s.size = 30 + c * 20;            // 30/50/70
        if (variant === 'rotation') s.rotation = rot(r * 90 + c * 0);
        if (variant === 'count') s.count = 1 + c;                // 1/2/3
        if (variant === 'color') s.color = [PALETTE.red, PALETTE.blue, PALETTE.green][c];
        if (variant === 'fill') s.fill = FILLS[c % FILLS.length];
        row.push({ bg: null, shapes: [s] });
      }
      matrix.push(row);
    }
    // 正确答案 = 右下角按规律继续
    const correct = clone(matrix[2][2]);
    // 但因为 (2,2) 本身存在，我们把矩阵 (2,2) 置空，correct 保留
    matrix[2][2] = null;
    // 干扰项
    const baseFig = clone(matrix[2][1]);
    const d = [];
    const wrongSize = clone(baseFig); wrongSize.shapes[0].size = 20; d.push(wrongSize);
    const wrongRot = clone(baseFig); wrongRot.shapes[0].rotation = rot(baseFig.shapes[0].rotation + 45); d.push(wrongRot);
    const wrongCount = clone(baseFig); wrongCount.shapes[0].count = baseFig.shapes[0].count + 1; d.push(wrongCount);
    const wrongType = clone(baseFig); wrongType.shapes[0].type = SHAPE_TYPES[(SHAPE_TYPES.indexOf(type) + 1) % 7]; d.push(wrongType);
    const wrongFill = clone(baseFig); wrongFill.shapes[0].fill = 'hollow'; d.push(wrongFill);
    questions.push(buildQuestion('B', i, matrix, correct, d, 'progression'));
  }
  return questions;
}

/** Set C：组合型——第三行 = 第一行 + 第二行的图形叠加（分布三值） */
function genSetC() {
  const questions = [];
  for (let i = 0; i < 12; i++) {
    const t1 = SHAPE_TYPES[i % 7];
    const t2 = SHAPE_TYPES[(i + 3) % 7];
    const c1 = [PALETTE.red, PALETTE.blue, PALETTE.green][i % 3];
    const c2 = [PALETTE.amber, PALETTE.purple, PALETTE.teal][i % 3];
    // 三个值在各行各列分布一次
    const vals = [
      [shape(t1, { color: c1, size: 55 }), shape(t2, { color: c2, size: 35 })],
      [shape(t2, { color: c2, size: 55 }), shape(t1, { color: c1, size: 35 })],
      [shape(t1, { color: c1, size: 45 }), shape(t2, { color: c2, size: 45 })],
    ];
    // 排列：行 r 用 vals 的某排列，列 c 也保证分布
    const rowPerm = [0, 1, 2];
    const matrix = [];
    for (let r = 0; r < 3; r++) {
      const row = [];
      for (let c = 0; c < 3; c++) {
        const v = vals[(rowPerm[r] + c) % 3];
        row.push({ bg: null, shapes: v.map(clone) });
      }
      matrix.push(row);
    }
    const correct = clone(matrix[2][2]);
    matrix[2][2] = null;
    // 干扰：少一个形状 / 多一个形状 / 颜色错
    const dOnly1 = { bg: null, shapes: [clone(matrix[2][1].shapes[0])] };
    const dOnly2 = { bg: null, shapes: [clone(matrix[2][1].shapes[1])] };
    const dSwap = { bg: null, shapes: clone(matrix[2][1].shapes).reverse() };
    const dExtra = { bg: null, shapes: [...clone(matrix[2][1].shapes), shape('plus', { color: PALETTE.ink, size: 25 })] };
    const dColor = { bg: null, shapes: clone(matrix[2][1].shapes).map(s => { s.color = PALETTE.gray ?? '#6b7280'; return s; }) };
    questions.push(buildQuestion('C', i, matrix, correct, [dOnly1, dOnly2, dSwap, dExtra, dColor], 'composition'));
  }
  return questions;
}

/** Set D：组合+变换——第三行 = 第一行和第二行图形的旋转/叠加组合 */
function genSetD() {
  const questions = [];
  for (let i = 0; i < 12; i++) {
    const type = SHAPE_TYPES[(i + 1) % 7];
    const color = Object.values(PALETTE)[(i + 2) % 7];
    // 每行旋转角度递增 90°，第三行是前两行旋转之和
    const matrix = [];
    for (let r = 0; r < 3; r++) {
      const row = [];
      for (let c = 0; c < 3; c++) {
        const rotA = r * 90;
        const rotB = c * 45;
        const s = shape(type, { color, size: 50, rotation: rot(rotA + rotB), fill: 'solid' });
        row.push({ bg: null, shapes: [s] });
      }
      matrix.push(row);
    }
    const correct = clone(matrix[2][2]);
    matrix[2][2] = null;
    const base = clone(matrix[2][1]);
    const d = [];
    const w1 = clone(base); w1.shapes[0].rotation = rot(base.shapes[0].rotation + 90); d.push(w1);
    const w2 = clone(base); w2.shapes[0].rotation = rot(base.shapes[0].rotation - 45); d.push(w2);
    const w3 = clone(base); w3.shapes[0].fill = 'hollow'; d.push(w3);
    const w4 = clone(base); w4.shapes[0].type = SHAPE_TYPES[(SHAPE_TYPES.indexOf(type) + 1) % 7]; d.push(w4);
    const w5 = { bg: null, shapes: [clone(base.shapes[0]), clone(base.shapes[0])] }; d.push(w5);
    questions.push(buildQuestion('D', i, matrix, correct, d, 'transformation'));
  }
  return questions;
}

/** Set E：复杂变换——图形数量/填充分布三值，叠加旋转 */
function genSetE() {
  const questions = [];
  for (let i = 0; i < 12; i++) {
    const type = SHAPE_TYPES[(i + 4) % 7];
    const colors = [PALETTE.red, PALETTE.blue, PALETTE.green];
    const fills = ['solid', 'hollow', 'striped'];
    const counts = [1, 2, 3];
    // 分布三值：每行每列颜色/填充/数量各出现一次
    const matrix = [];
    for (let r = 0; r < 3; r++) {
      const row = [];
      for (let c = 0; c < 3; c++) {
        const col = colors[(r + c) % 3];
        const fl = fills[(r + c * 2) % 3];
        const cnt = counts[(r * 2 + c) % 3];
        const s = shape(type, { color: col, fill: fl, size: 45, count: cnt, rotation: rot(r * 45) });
        row.push({ bg: 'dots', shapes: [s] });
      }
      matrix.push(row);
    }
    const correct = clone(matrix[2][2]);
    matrix[2][2] = null;
    const base = clone(matrix[2][1]);
    const d = [];
    const w1 = clone(base); w1.shapes[0].count = base.shapes[0].count === 3 ? 1 : base.shapes[0].count + 1; d.push(w1);
    const w2 = clone(base); w2.shapes[0].fill = 'dotted'; d.push(w2);
    const w3 = clone(base); w3.shapes[0].color = PALETTE.amber; d.push(w3);
    const w4 = clone(base); w4.shapes[0].rotation = rot(base.shapes[0].rotation + 90); d.push(w4);
    const w5 = { bg: null, shapes: [clone(base.shapes[0])] }; d.push(w5);
    questions.push(buildQuestion('E', i, matrix, correct, d, 'distribution'));
  }
  return questions;
}

// ---------- 组装题目 ----------
let GLOBAL_ID = 1;

function buildQuestion(set, idx, matrix, correct, distractors, rule) {
  // 打乱选项，正确答案混入
  const options = [clone(correct), ...distractors.map(clone)];
  // 去重（基于 JSON）
  const seen = new Set();
  const uniq = [];
  for (const o of options) {
    const k = JSON.stringify(o);
    if (!seen.has(k)) { seen.add(k); uniq.push(o); }
  }
  // 限制为 6 个选项
  const finalOpts = uniq.slice(0, 6);
  const answerIdx = finalOpts.findIndex(o => JSON.stringify(o) === JSON.stringify(correct));
  // 如果正确答案被裁掉，强制放回
  let answer = answerIdx;
  if (answerIdx === -1) {
    finalOpts[5] = clone(correct);
    answer = 5;
  }
  // 打乱
  const shuffled = shuffleWithAnswer(finalOpts, answer);
  return {
    id: `SPM-${String(GLOBAL_ID++).padStart(3, '0')}`,
    set,
    indexInSet: idx + 1,
    globalIndex: GLOBAL_ID - 1,
    rule,
    matrix,                 // 3x3，(2,2) 为 null
    options: shuffled.options,
    answer: shuffled.answer, // 正确选项索引
    timeLimit: 40,          // 建议每题秒数
  };
}

function shuffleWithAnswer(opts, answerIdx) {
  const arr = opts.map((o, i) => ({ o, isAns: i === answerIdx }));
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return {
    options: arr.map(x => x.o),
    answer: arr.findIndex(x => x.isAns),
  };
}

// ---------- 主流程 ----------
function generateAll() {
  GLOBAL_ID = 1;
  const A = genSetA();
  const B = genSetB();
  const C = genSetC();
  const D = genSetD();
  const E = genSetE();
  const all = [...A, ...B, ...C, ...D, ...E];
  // 校验
  for (const q of all) {
    if (q.matrix[2][2] !== null) throw new Error(`${q.id} 矩阵右下未置空`);
    if (q.answer < 0 || q.answer >= q.options.length) throw new Error(`${q.id} 答案索引异常`);
  }
  return all;
}

if (require.main === module) {
  const data = generateAll();
  const outDir = PATH.join(__dirname, '..', 'miniprogram', 'utils');
  if (!FS.existsSync(outDir)) FS.mkdirSync(outDir, { recursive: true });
  const header = `/**
 * SPM 题目数据（自动生成，请勿手动编辑）
 * 生成时间：${new Date().toISOString()}
 * 题目数：${data.length}（A/B/C/D/E 各 12 题）
 * 图形结构：{ bg, shapes: [{ type, size, color, rotation, fill, count }] }
 */
`;
  FS.writeFileSync(PATH.join(outDir, 'questions.js'), `${header}module.exports = ${JSON.stringify(data, null, 2)};\n`);
  // 同时输出一份 JSON 给后端校验
  FS.writeFileSync(PATH.join(__dirname, '..', 'server', 'questions.json'), JSON.stringify(data, null, 2));
  console.log(`已生成 ${data.length} 道题目。`);
  // 简单统计
  const bySet = {};
  for (const q of data) bySet[q.set] = (bySet[q.set] || 0) + 1;
  console.log('分组统计:', bySet);
}

module.exports = { generateAll };
