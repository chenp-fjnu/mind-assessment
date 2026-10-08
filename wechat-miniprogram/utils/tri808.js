/**
 * 808 基本图形（八少八素「808 神测」三边色三角形）几何、生成与判定规则。
 *
 * 真题特征（题源见 README「题源与免责声明」）：
 *   1. 三角形三条边各为红 / 蓝 / 绿，三种颜色各出现一次（一个排列）；
 *   2. 三个角各有一个符号，颜色也是红蓝绿各一个；符号形状为 + 号、÷ 号、竖除号，
 *      三种形状各出现一次（也是一个排列）——三者形近，正是出题人设置的识别难度；
 *   3. 中间有一个圆圈，多数卷里不起作用，在 B1 / D 卷里是判断
 *      「写一位还是两位」「错在哪一处」的唯一依据。
 *
 * 关键推论：因为边色、符号色、符号形都是 3 元排列，两两逐位比较得到的
 * 「相同个数」只可能是 0、1、3，永远不可能是 2 —— 这正是 B1 / B2 卷
 * 档位只有 0/1/3、且没有 2 的原因。
 *
 * 本文件只做纯几何与规则计算（不依赖 wx API），供 modules/n808 与 games/tri-match 共用。
 */

// 红 / 蓝 / 绿
const COLORS = ['r', 'b', 'g']
const COLOR_HEX = { r: '#dc2626', b: '#2563eb', g: '#16a34a' }
const COLOR_NAME = { r: '红', b: '蓝', g: '绿' }

// 三个角上的符号形状：0 = + 号，1 = ÷ 号，2 = 竖除号（÷ 竖置，与 ÷ 形近易混）
const SYM_TYPES = [0, 1, 2]
const SYM_NAME = ['+ 号', '÷ 号', '竖除号']
const SYM_GLYPH = ['+', '÷', '÷']
const SYM_GLYPH_ROTATE = [0, 0, 90]

// 中心圆颜色 ↔「三条边与其对角符号颜色相同」的组数（B1 / D 卷的判定依据）
const COUNT_TO_COLOR = { 0: 'b', 1: 'g', 3: 'r' }
const COLOR_TO_COUNT = { b: 0, g: 1, r: 3 }

// B1 卷可选答案（按 0 同 / 1 同 / 3 同 三行排列）
const B1_OPTIONS = ['3', '03', '2', '02', '1', '01']
// B2 / C 卷两行的可选档位
const COUNT_OPTIONS = ['0', '1', '3']
// D 卷两行：错误位置 / 正确颜色
const D_WHERE = ['中间的圆', '某一条边', '某一个符号']
const D_COLORS = ['b', 'g', 'r']

// 边 i 位于顶点 i 的对边
const EDGE_VERTS = [
  [1, 2],
  [2, 0],
  [0, 1],
]

// 符号中心 = 三角形中心向顶点方向移动的比例（中点处，既贴近角又不压边）
const SYM_SHIFT = 0.5
// 中心圆半径 = 外接圆半径 × 该系数
const CIRCLE_R = 0.2
// 符号方框边长 = 图形边长 × 该系数
const SYM_BOX = 0.15
// 三角形外接圆半径 = 图形边长 × 该系数
const TRI_R = 0.42

/** 以 (cx, cy) 为中心、外接圆半径 r 的三个顶点：V0 上、V1 右下、V2 左下 */
function vertices(cx, cy, r) {
  return [
    { x: cx, y: cy - r },
    { x: cx + r * 0.8660254, y: cy + r * 0.5 },
    { x: cx - r * 0.8660254, y: cy + r * 0.5 },
  ]
}

/** 顶点 i 处符号的中心（位于「图形中心 → 顶点」连线的中点） */
function symPos(cx, cy, r, i) {
  const v = vertices(cx, cy, r)[i]
  const k = SYM_SHIFT
  return { x: cx + (v.x - cx) * k, y: cy + (v.y - cy) * k }
}

/** 中心圆半径（绝对值） */
function circleR(r) {
  return r * CIRCLE_R
}

// ---------- 确定性随机辅助（rng 由调用方注入，便于题面复现与单测） ----------

function ri(rng, n) {
  return Math.floor(rng() * n)
}

function shuffle(arr, rng) {
  const a = arr.slice()
  for (let i = a.length - 1; i > 0; i--) {
    const j = ri(rng, i + 1)
    const t = a[i]
    a[i] = a[j]
    a[j] = t
  }
  return a
}

function others(arr, cur) {
  return arr.filter((x) => x !== cur)
}

function clone(o) {
  return JSON.parse(JSON.stringify(o))
}

function sameFig(a, b) {
  return JSON.stringify(a) === JSON.stringify(b)
}

// ---------- 图形构造 ----------

/**
 * 构造一个合法的 808 基本图形：边色 / 符号色 / 符号形 三者都是各自集合的排列。
 * opt.k     指定「边与其对角符号颜色相同」的组数（0 / 1 / 3），省略则随机
 * opt.circle 指定中心圆颜色，省略时：给了 k 就按规则取色，否则随机
 */
function makeFig(rng, opt) {
  opt = opt || {}
  const edges = shuffle(COLORS, rng)
  const types = shuffle(SYM_TYPES, rng)
  let symColors
  if (opt.k == null) {
    symColors = shuffle(COLORS, rng)
  } else if (opt.k === 3) {
    symColors = edges.slice()
  } else if (opt.k === 1) {
    const fixed = ri(rng, 3)
    symColors = edges.slice()
    const rest = [0, 1, 2].filter((i) => i !== fixed)
    symColors[rest[0]] = edges[rest[1]]
    symColors[rest[1]] = edges[rest[0]]
  } else {
    // 三轮换：与 edges 逐位比较无一相同
    symColors = [edges[2], edges[0], edges[1]]
  }
  const circle = opt.circle != null ? opt.circle : opt.k != null ? COUNT_TO_COLOR[opt.k] : shuffle(COLORS, rng)[0]
  return {
    edges,
    syms: [0, 1, 2].map((i) => ({ t: types[i], c: symColors[i] })),
    circle,
    missEdge: null,
    missSym: null,
  }
}

/** 边 i 与其对角（顶点 i）符号颜色相同的组数 —— B1 / D 卷的「组数」 */
function matchCount(fig) {
  let n = 0
  for (let i = 0; i < 3; i++) if (fig.edges[i] === fig.syms[i].c) n++
  return n
}

/** 两个排列逐位相同的个数（3 元排列的结果只可能是 0 / 1 / 3） */
function fixedPoints(a, b) {
  let n = 0
  for (let i = 0; i < 3; i++) if (a[i] === b[i]) n++
  return n
}

/** 图形整体旋转 120°×k（真题规则：旋转后相同的图形视为不同） */
function rotateFig(fig, k) {
  const s = ((k % 3) + 3) % 3
  if (!s) return clone(fig)
  const shift = (arr) => arr.slice(3 - s).concat(arr.slice(0, 3 - s))
  const out = clone(fig)
  out.edges = shift(fig.edges)
  out.syms = shift(fig.syms)
  return out
}

/** 一个颜色集合是否仍是红蓝绿各出现一次的排列 */
function isPermutation(arr) {
  if (!arr || arr.length !== 3) return false
  return arr[0] !== arr[1] && arr[1] !== arr[2] && arr[0] !== arr[2]
}

// ---------- 各卷作答规则 ----------

/** B1：组数 k + 中心圆颜色 → 应填的一位 / 两位答案（下标对齐 B1_OPTIONS） */
function b1Answer(fig) {
  const k = matchCount(fig)
  const base = k === 0 ? '3' : k === 1 ? '2' : '1'
  const digits = fig.circle === COUNT_TO_COLOR[k] ? base : '0' + base
  return B1_OPTIONS.indexOf(digits)
}

/** B2 / C：相邻两图 → [边颜色相同档, 符号形状相同档]（下标对齐 COUNT_OPTIONS） */
function b2Answer(a, b) {
  return [
    COUNT_OPTIONS.indexOf(String(fixedPoints(a.edges, b.edges))),
    COUNT_OPTIONS.indexOf(String(fixedPoints(a.syms.map((s) => s.t), b.syms.map((s) => s.t)))),
  ]
}

/**
 * D 卷：图中恰有一个元素画错。返回 [错误位置下标, 正确颜色下标]。
 *   错误位置 0 = 中心圆、1 = 某条边、2 = 某个符号；正确颜色下标对齐 D_COLORS（蓝/绿/红）。
 * 判定链路：中心圆颜色 → 应有组数；实际组数 = 逐位比对结果；
 *   边色与符号色都仍是完整排列 → 只可能是圆错；
 *   边色出现重复 → 边错（错在唯一比对不上的那一位）；符号色重复 → 符号错。
 */
function dAnswer(fig) {
  const k = matchCount(fig)
  const edgeOk = isPermutation(fig.edges)
  if (edgeOk && isPermutation(fig.syms.map((s) => s.c))) {
    return [0, D_COLORS.indexOf(COUNT_TO_COLOR[k])]
  }
  const broken = edgeOk ? fig.syms.map((s) => s.c) : fig.edges
  const dup = COLORS.filter((c) => broken.indexOf(c) !== broken.lastIndexOf(c))[0]
  let idx = -1
  for (let i = 0; i < 3; i++) {
    if (broken[i] === dup && fig.edges[i] !== fig.syms[i].c) { idx = i; break }
  }
  if (idx < 0) {
    for (let i = 0; i < 3; i++) if (fig.edges[i] !== fig.syms[i].c) { idx = i; break }
  }
  // 边是坏的那一套 → 边错，正确颜色取符号一侧；否则符号错，正确颜色取边一侧
  const where = edgeOk ? 2 : 1
  const correct = edgeOk ? fig.edges[idx] : fig.syms[idx].c
  return [where, D_COLORS.indexOf(correct)]
}

/**
 * D 卷出题：构造一个带确定错误的图形。
 *   kind：'circle' | 'edge' | 'sym'
 * 边 / 符号出错时基图必须是「三组全同」（k=3），否则错误位无法唯一定位。
 */
function makeDErrors(rng, kind) {
  const k = kind === 'circle' ? shuffle([0, 1, 3], rng)[0] : 3
  const fig = makeFig(rng, { k })
  if (kind === 'circle') {
    fig.circle = others(COLORS, fig.circle)[ri(rng, 2)]
    return fig
  }
  const j = ri(rng, 3)
  const donor = (j + 1 + ri(rng, 2)) % 3
  if (kind === 'edge') fig.edges[j] = fig.edges[donor]
  else fig.syms[j].c = fig.syms[donor].c
  return fig
}

/** C 卷：抹掉一条边与一个符号（红蓝绿各一次，缺失项可由另外两个唯一推出） */
function makeIncomplete(fig, rng) {
  const out = clone(fig)
  out.missEdge = ri(rng, 3)
  out.missSym = ri(rng, 3)
  return out
}

// ---------- A 卷扰动候选（全部仍是合法 808 图形，且互不相同） ----------

/**
 * 生成一批与 base 不同、且彼此互不相同的 808 图形，供 A 卷做候选项。
 * 依次使用：旋转（真题规则：旋转后相同视为不同）→ 两两换位（边 / 符号色 / 符号形）→ 中心圆换色。
 * 全部改动都保持「三色各一次」的排列性质，使干扰项与真图一样像真题图形。
 */
function distinctFigs(base, count, rng) {
  const pool = []
  const seen = {}
  const push = (f) => {
    if (sameFig(f, base)) return
    const key = JSON.stringify(f)
    if (seen[key]) return
    seen[key] = 1
    pool.push(f)
  }
  push(rotateFig(base, 1))
  push(rotateFig(base, 2))
  const pairs = [
    [0, 1],
    [1, 2],
    [0, 2],
  ]
  pairs.forEach((p) => {
    const i = p[0]
    const j = p[1]
    let f = clone(base)
    let t = f.edges[i]; f.edges[i] = f.edges[j]; f.edges[j] = t
    push(f)
    f = clone(base)
    t = f.syms[i].c; f.syms[i].c = f.syms[j].c; f.syms[j].c = t
    push(f)
    f = clone(base)
    t = f.syms[i].t; f.syms[i].t = f.syms[j].t; f.syms[j].t = t
    push(f)
  })
  others(COLORS, base.circle).forEach((c) => {
    const f = clone(base)
    f.circle = c
    push(f)
  })
  if (pool.length < count) {
    // 兜底：单点换色（会破坏排列，但肉眼差异明确），理论不会走到
    for (let i = 0; i < 3 && pool.length < count; i++) {
      others(COLORS, base.edges[i]).forEach((c) => {
        const f = clone(base)
        f.edges[i] = c
        push(f)
      })
    }
  }
  return shuffle(pool, rng).slice(0, count)
}

// ---------- CSS 版布局（games/tri-match 用，返回 rpx 数值） ----------

/**
 * 把图形转换成可直接绑定样式的绝对定位元素。
 * size 为容器边长（rpx），返回的坐标单位同为 rpx：
 *   边 = 旋转细条（left/top/width/deg/th，旋转原点 0 50%），
 *   符号 = 文字字形（glyph + rotate，÷ 竖置即竖除号），
 *   圆 = 圆点。
 * 另附 x1/y1/x2/y2 中线端点，供 canvas 渲染复用同一套几何。
 */
function layout(fig, size) {
  const cx = size / 2
  const cy = size / 2
  const r = size * TRI_R
  const vs = vertices(cx, cy, r)
  const th = Math.max(3, +(size * 0.045).toFixed(2))
  const edges = EDGE_VERTS.map((pair, i) => {
    const a = vs[pair[0]]
    const b = vs[pair[1]]
    const dx = b.x - a.x
    const dy = b.y - a.y
    const len = Math.hypot(dx, dy)
    return {
      i,
      color: COLOR_HEX[fig.edges[i]],
      hidden: fig.missEdge === i,
      x1: +a.x.toFixed(2),
      y1: +a.y.toFixed(2),
      x2: +b.x.toFixed(2),
      y2: +b.y.toFixed(2),
      // CSS：条块左上角，配合 transform-origin: 0 50% 后中线正好落在边上
      left: +a.x.toFixed(2),
      top: +(a.y - th / 2).toFixed(2),
      width: +len.toFixed(2),
      deg: +((Math.atan2(dy, dx) * 180) / Math.PI).toFixed(2),
      th,
    }
  })
  const box = +(size * SYM_BOX).toFixed(2)
  const syms = [0, 1, 2].map((i) => {
    const p = symPos(cx, cy, r, i)
    return {
      i,
      hidden: fig.missSym === i,
      kind: fig.syms[i].t,
      glyph: SYM_GLYPH[fig.syms[i].t],
      rotate: SYM_GLYPH_ROTATE[fig.syms[i].t],
      color: COLOR_HEX[fig.syms[i].c],
      left: +(p.x - box / 2).toFixed(2),
      top: +(p.y - box / 2).toFixed(2),
      size: box,
    }
  })
  const cd = +(circleR(r) * 2).toFixed(2)
  return {
    size,
    edges,
    syms,
    circle: {
      color: COLOR_HEX[fig.circle] || '#cbd5e1',
      left: +(cx - cd / 2).toFixed(2),
      top: +(cy - cd / 2).toFixed(2),
      d: cd,
    },
  }
}

module.exports = {
  COLORS,
  COLOR_HEX,
  COLOR_NAME,
  SYM_TYPES,
  SYM_NAME,
  SYM_GLYPH,
  SYM_GLYPH_ROTATE,
  COUNT_TO_COLOR,
  COLOR_TO_COUNT,
  B1_OPTIONS,
  COUNT_OPTIONS,
  D_WHERE,
  D_COLORS,
  EDGE_VERTS,
  SYM_SHIFT,
  CIRCLE_R,
  SYM_BOX,
  TRI_R,
  vertices,
  symPos,
  circleR,
  shuffle,
  makeFig,
  makeDErrors,
  makeIncomplete,
  rotateFig,
  clone,
  sameFig,
  matchCount,
  fixedPoints,
  isPermutation,
  b1Answer,
  b2Answer,
  dAnswer,
  distinctFigs,
  layout,
}
