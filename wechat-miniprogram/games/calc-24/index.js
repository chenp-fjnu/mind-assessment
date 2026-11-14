// 算24点（Twenty-Four）—— 纯逻辑 + 元数据（可单测）
// 给 4 个 1~13 的数字，用 + - * / 与括号各用一次凑出 24，训练心算与逻辑推理。
// 求解器 / 表达式求值器均为纯函数，便于单测与组件复用。

const OPS = ['+', '-', '*', '/']

// 取 4 个数的所有排列（含重复数字去重后的稳定排列）
function permutations(a) {
  if (a.length <= 1) return [a.slice()]
  const seen = new Set()
  const out = []
  a.forEach((x, i) => {
    if (seen.has(x)) return
    seen.add(x)
    const rest = a.slice(0, i).concat(a.slice(i + 1))
    permutations(rest).forEach((p) => out.push([x].concat(p)))
  })
  return out
}

function is24(v) {
  return v !== null && isFinite(v) && Math.abs(v - 24) < 1e-9
}

// 枚举 3 个运算符 × 5 种括号结构；返回第一个凑成 24 的算式字符串，无解返回 null
function solve24(nums) {
  const perms = permutations(nums)
  for (const p of perms) {
    const [a, b, c, d] = p
    for (const o1 of OPS) {
      for (const o2 of OPS) {
        for (const o3 of OPS) {
          const candidates = [
            build1(a, b, c, d, o1, o2, o3),
            build2(a, b, c, d, o1, o2, o3),
            build3(a, b, c, d, o1, o2, o3),
            build4(a, b, c, d, o1, o2, o3),
            build5(a, b, c, d, o1, o2, o3),
          ]
          for (const cand of candidates) {
            if (cand && is24(cand.val)) return cand.expr
          }
        }
      }
    }
  }
  return null
}

// 每种括号结构返回 { val, expr }，中间出现除零则返回 null
function apply(op, x, y) {
  if (op === '+') return x + y
  if (op === '-') return x - y
  if (op === '*') return x * y
  if (y === 0) return null
  return x / y
}

function build1(a, b, c, d, o1, o2, o3) {
  const t1 = apply(o1, a, b)
  if (t1 === null) return null
  const t2 = apply(o2, t1, c)
  if (t2 === null) return null
  const t3 = apply(o3, t2, d)
  if (t3 === null) return null
  // ((a o1 b) o2 c) o3 d
  return {
    val: t3,
    expr: '((' + a + ' ' + o1 + ' ' + b + ') ' + o2 + ' ' + c + ') ' + o3 + ' ' + d,
  }
}
function build2(a, b, c, d, o1, o2, o3) {
  const t1 = apply(o2, b, c)
  if (t1 === null) return null
  const t2 = apply(o1, a, t1)
  if (t2 === null) return null
  const t3 = apply(o3, t2, d)
  if (t3 === null) return null
  // (a o1 (b o2 c)) o3 d
  return {
    val: t3,
    expr: '(' + a + ' ' + o1 + ' (' + b + ' ' + o2 + ' ' + c + ')) ' + o3 + ' ' + d,
  }
}
function build3(a, b, c, d, o1, o2, o3) {
  const t1 = apply(o1, a, b)
  if (t1 === null) return null
  const t2 = apply(o3, c, d)
  if (t2 === null) return null
  const t3 = apply(o2, t1, t2)
  if (t3 === null) return null
  // (a o1 b) o2 (c o3 d)
  return {
    val: t3,
    expr: '(' + a + ' ' + o1 + ' ' + b + ') ' + o2 + ' (' + c + ' ' + o3 + ' ' + d + ')',
  }
}
function build4(a, b, c, d, o1, o2, o3) {
  const t1 = apply(o2, b, c)
  if (t1 === null) return null
  const t2 = apply(o3, t1, d)
  if (t2 === null) return null
  const t3 = apply(o1, a, t2)
  if (t3 === null) return null
  // a o1 ((b o2 c) o3 d)
  return {
    val: t3,
    expr: '(' + a + ' ' + o1 + ' ((' + b + ' ' + o2 + ' ' + c + ') ' + o3 + ' ' + d + '))',
  }
}
function build5(a, b, c, d, o1, o2, o3) {
  const t1 = apply(o3, c, d)
  if (t1 === null) return null
  const t2 = apply(o2, b, t1)
  if (t2 === null) return null
  const t3 = apply(o1, a, t2)
  if (t3 === null) return null
  // a o1 (b o2 (c o3 d))
  return {
    val: t3,
    expr: '(' + a + ' ' + o1 + ' (' + b + ' ' + o2 + ' (' + c + ' ' + o3 + ' ' + d + ')))',
  }
}

// 表达式求值器：支持 + - * / 与括号，标准优先级；返回 { ok, value, numbers }
// 用于校验玩家拼出的算式（数字须恰好为给定的 4 个）。
function evalExpr(expr) {
  if (typeof expr !== 'string' || !expr.trim()) return { ok: false, reason: '表达式为空' }
  const toks = []
  const numbers = []
  let i = 0
  while (i < expr.length) {
    const c = expr[i]
    if (c === ' ' || c === '\t' || c === '\n') {
      i++
      continue
    }
    if (c >= '0' && c <= '9') {
      let j = i
      while (j < expr.length && expr[j] >= '0' && expr[j] <= '9') j++
      toks.push({ t: 'num', v: parseInt(expr.slice(i, j), 10) })
      i = j
    } else if (c === '+' || c === '-' || c === '*' || c === '/') {
      toks.push({ t: c })
      i++
    } else if (c === '(') {
      toks.push({ t: '(' })
      i++
    } else if (c === ')') {
      toks.push({ t: ')' })
      i++
    } else {
      return { ok: false, reason: '含非法字符' }
    }
  }
  let p = 0
  let divByZero = false
  const peek = () => toks[p]
  function parseExpr() {
    let v = parseTerm()
    if (v === 'ERR') return 'ERR'
    while (peek() && (peek().t === '+' || peek().t === '-')) {
      const op = toks[p].t
      p++
      const r = parseTerm()
      if (r === 'ERR') return 'ERR'
      v = op === '+' ? v + r : v - r
    }
    return v
  }
  function parseTerm() {
    let v = parseFactor()
    if (v === 'ERR') return 'ERR'
    while (peek() && (peek().t === '*' || peek().t === '/')) {
      const op = toks[p].t
      p++
      const r = parseFactor()
      if (r === 'ERR') return 'ERR'
      if (op === '*') v = v * r
      else {
        if (r === 0) {
          divByZero = true
          return 'ERR'
        }
        v = v / r
      }
    }
    return v
  }
  function parseFactor() {
    const tk = peek()
    if (!tk) return 'ERR'
    if (tk.t === '(') {
      p++
      const v = parseExpr()
      if (v === 'ERR') return 'ERR'
      if (!peek() || peek().t !== ')') return 'ERR'
      p++
      return v
    }
    if (tk.t === 'num') {
      p++
      numbers.push(tk.v)
      return tk.v
    }
    if (tk.t === '-') {
      p++
      const v = parseFactor()
      return v === 'ERR' ? 'ERR' : -v
    }
    return 'ERR'
  }
  const value = parseExpr()
  if (value === 'ERR' || p !== toks.length) {
    return { ok: false, reason: divByZero ? '不能除以 0' : '表达式不完整' }
  }
  if (!isFinite(value)) return { ok: false, reason: '无法计算（除零？）' }
  return { ok: true, value, numbers }
}

// 校验玩家算式：语法合法 + 恰好使用 4 个给定数字各一次 + 结果==24
function check24(expr, nums) {
  const r = evalExpr(expr)
  if (!r.ok) return { ok: false, reason: r.reason }
  const need = (nums || []).slice().sort((a, b) => a - b)
  const got = r.numbers.slice().sort((a, b) => a - b)
  if (need.length !== got.length) return { ok: false, reason: '须使用全部 4 个数字' }
  for (let k = 0; k < need.length; k++) {
    if (need[k] !== got[k]) return { ok: false, reason: '每个数字只能使用一次' }
  }
  if (!is24(r.value))
    return { ok: false, reason: '结果是 ' + r.value + '，目标 24', value: r.value }
  return { ok: true, value: r.value }
}

const DIFF = {
  1: { range: 6, problems: 4, label: '入门' },
  2: { range: 9, problems: 6, label: '进阶' },
  3: { range: 13, problems: 8, label: '挑战' },
}

function randNum(max) {
  return 1 + Math.floor(Math.random() * max)
}

// 生成一道有解的 24 点：{ nums, target, answer }
function genOne(level) {
  const cfg = DIFF[level] || DIFF[2]
  const nums = [randNum(cfg.range), randNum(cfg.range), randNum(cfg.range), randNum(cfg.range)]
  let guard = 0
  let answer = solve24(nums)
  while (!answer && guard < 300) {
    nums[Math.floor(Math.random() * 4)] = randNum(cfg.range)
    answer = solve24(nums)
    guard++
  }
  return { nums, target: 24, answer }
}

// level → { nums, target, answer, problems }；保证当前 4 个数有解
function generate(level) {
  const cfg = DIFF[level] || DIFF[2]
  const one = genOne(level)
  return { nums: one.nums, target: 24, answer: one.answer, problems: cfg.problems }
}

// state: { time(秒), correct, total, errors } —— 用时越低越好
function score(state) {
  const time = state.time || 0
  const correct = state.correct || 0
  const total = state.total || 0
  const errors = state.errors || 0
  const accuracy = total ? correct / total : 0
  const base = Math.round(accuracy * 700)
  const speedBonus = Math.max(0, Math.round(300 - time))
  const penalty = errors * 15
  return { time, correct, total, errors, accuracy, score: Math.max(0, base + speedBonus - penalty) }
}

module.exports = {
  id: 'calc-24',
  name: '算24点',
  dim: 'logic',
  dimLabel: '逻辑计算',
  icon: '🧮',
  color: '#0891b2',
  desc: '用 4 个数字与加减乘除各组合一次凑出 24，训练心算与逻辑推理。',
  reference: '经典「24点」数字游戏（4 数各用一次求 24）',
  hot: true,
  showStartButton: true,
  levels: [
    { value: 1, label: '入门 · 4 题' },
    { value: 2, label: '进阶 · 6 题' },
    { value: 3, label: '挑战 · 8 题' },
  ],
  metric: { key: 'time', label: '用时', unit: 's', better: 'lower' },
  generate,
  genOne,
  score,
  solve24,
  evalExpr,
  check24,
}
