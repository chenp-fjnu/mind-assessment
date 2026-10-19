const { getModule } = require('../../utils/registry')
const { drawCell } = require('../../utils/figure')
const { readableTextColor } = require('../../utils/color')
const { useTheme } = require('../../utils/theme-store')
const { getUserId } = require('../../utils/user')
const { getDpr } = require('../../utils/device')
const SK = require('../../utils/storage-keys')
const { SCHEMA_VERSION } = require('../../utils/constants')

// 历史记录硬上限：超出后仅保留最近 N 条，并对用户可见提示
const HISTORY_LIMIT = 30

// 整卷倒计时 mm:ss 展示
function fmtClock(sec) {
  const s = Math.max(0, Math.floor(sec))
  const m = Math.floor(s / 60)
  const r = s % 60
  return (m < 10 ? '0' : '') + m + ':' + (r < 10 ? '0' : '') + r
}

// 多选图形行的选项徽标（A/B/C…）：置于每格顶部预留条内，图案区下移，编号不覆盖图案
function multiBadgeR(w, h) {
  return Math.max(7, Math.min(9, Math.min(w, h) * 0.13))
}

function drawMultiBadge(ctx, x, y, w, h, idx) {
  const r = multiBadgeR(w, h)
  const cx = x + r + 6
  const cy = y + r + 6
  ctx.save()
  ctx.fillStyle = 'rgba(15,23,42,0.85)'
  ctx.beginPath()
  ctx.arc(cx, cy, r, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = '#ffffff'
  ctx.font = 'bold ' + Math.round(r * 1.1) + 'px sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(String.fromCharCode(65 + idx), cx, cy)
  ctx.restore()
}

// 类比题目标图：上行 A→B，下行 C→？（箭头与问号自绘，规则不直接写进题面）
function drawAnalogy(ctx, W, H, a) {
  const s = Math.min(W * 0.34, H * 0.4)
  const gap = W * 0.16
  const leftX = (W - (s * 2 + gap)) / 2
  const rightX = leftX + s + gap
  const row1Y = Math.max(4, H * 0.04)
  const row2Y = row1Y + s + Math.max(10, H * 0.06)
  drawCell(ctx, a.a, leftX, row1Y, s)
  drawCell(ctx, a.b, rightX, row1Y, s)
  drawCell(ctx, a.c, leftX, row2Y, s)
  ctx.save()
  ctx.fillStyle = '#64748b'
  ctx.font = 'bold ' + Math.round(s * 0.4) + 'px sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText('→', leftX + s + gap / 2, row1Y + s / 2)
  ctx.fillText('→', leftX + s + gap / 2, row2Y + s / 2)
  // 答案槽：虚线框 + 问号
  ctx.strokeStyle = '#94a3b8'
  ctx.lineWidth = 2
  if (typeof ctx.setLineDash === 'function') ctx.setLineDash([6, 5])
  ctx.strokeRect(rightX, row2Y, s, s)
  if (typeof ctx.setLineDash === 'function') ctx.setLineDash([])
  ctx.fillStyle = '#94a3b8'
  ctx.font = 'bold ' + Math.round(s * 0.42) + 'px sans-serif'
  ctx.fillText('?', rightX + s / 2, row2Y + s / 2)
  ctx.restore()
}

Page({
  data: {
    meta: {},
    questions: [],
    answers: [],
    current: 0,
    total: 0,
    progress: 0,
    q: null,
    qType: 'scale',
    answeredCount: 0,
    optStyle: 'width:23%;',
    groupLabel: '',
    hasTimeLimit: false,
    timeLeft: 0,
    // multi 题型：图形多选网格与选中态（WXML 无法调用数组方法，这里预计算布尔数组）
    multiFigures: false,
    multiCols: 4,
    multiFigHeight: 0,
    multiSel: [],
    // 整卷倒计时（模块定义 totalTimeLimit 时启用）
    hasTotalTime: false,
    totalTimeText: '',
  },

  onLoad(query) {
    useTheme(this)
    const mod = getModule(query.id)
    if (!mod) {
      wx.showToast({ title: '未找到测评', icon: 'none' })
      return
    }
    const questions = mod.getQuestions()
    this.dpr = getDpr()
    this.mod = mod
    this._timer = null
    this._finished = false // 是否已交卷；onUnload/onHide 据此决定是否兜底保存进度
    // 整卷倒计时：模块定义 totalTimeLimit（秒）时启用，超时直接交卷
    this._totalLimit = mod.totalTimeLimit || 0
    this._timer3 = null
    const setMeta = {}
    questions.forEach((qq, i) => {
      if (!qq.set) return
      if (!setMeta[qq.set]) setMeta[qq.set] = { total: 0, start: null }
      setMeta[qq.set].total++
      if (setMeta[qq.set].start === null) setMeta[qq.set].start = i
    })
    this._setMeta = setMeta
    const meta = { id: mod.id, name: mod.name, icon: mod.icon, color: mod.color, colorText: readableTextColor(mod.color) }
    const answers = questions.map(() => null)
    this._timings = questions.map(() => 0)
    this._qStart = Date.now()

    this.setData(
      {
        meta,
        questions,
        answers,
        total: questions.length,
        current: 0,
        answeredCount: 0,
      },
      () => {
        const key = SK.PROGRESS_PREFIX + mod.id
        const saved = wx.getStorageSync(key)
        const qn = questions.length
        const hasProgress = saved && saved.answers && saved.answers.length === qn && saved.answers.some((a) => a !== null)
        // 整卷计时起点：续答沿用上次起点（剩余时间随流逝扣减），否则重新计时
        this._startedAt = (hasProgress && saved.startedAt) || Date.now()
        const done = () => {
          this.renderCurrent()
          this.beginTotalTimer()
        }
        if (hasProgress) {
          wx.showModal({
            title: '继续测评',
            content: '发现未完成的「' + mod.name + '」，是否继续上次的进度？',
            confirmText: '继续',
            cancelText: '重新开始',
            success: (r) => {
              if (r.confirm) {
                this.setData(
                  {
                    answers: saved.answers,
                    current: saved.current || 0,
                    answeredCount: saved.answers.filter((a) => a !== null).length,
                  },
                  () => done()
                )
              } else {
                wx.removeStorageSync(key)
                this._startedAt = Date.now()
                done()
              }
            },
            fail: () => done(),
          })
        } else {
          wx.removeStorageSync(key)
          done()
        }
      }
    )
    wx.setNavigationBarTitle({ title: mod.name })
  },

  renderCurrent() {
    this._qStart = Date.now()
    // 切题时旧画布签名全部失效，下一帧重绘；选中态切换则保留 memo 只重绘变化项
    this._figKeys = {}
    this.stopCountdown()
    const i = this.data.current
    const q = this.data.questions[i]
    this.startCountdown(q)
    const n = (q.options || []).length
    let cols = 4
    if (n <= 2) cols = 2
    else if (n === 3) cols = 3
    else if (n === 6) cols = 3
    else if (n === 8) cols = 4
    const optStyle = 'width:' + (96 / cols).toFixed(2) + '%;'
    const needCanvas = q.type === 'matrix' || !!q.matrix || !!(q.candidates && q.candidates.length)
    let groupLabel = ''
    const gs = q.set
    if (gs && this._setMeta[gs]) {
      const gm = this._setMeta[gs]
      groupLabel = '第 ' + gs + ' 组 ' + (i - gm.start + 1) + '/' + gm.total
    }
    let showFigureOptions = false
    let figureOptions = []
    let targetMatrix = null
    const cand = q.candidates
    const blockTarget = cand && cand.length ? cand[q.answer] : q.matrix
    if (q.type === 'choice' && blockTarget && q.answer != null && cand && cand.length) {
      targetMatrix = blockTarget
      showFigureOptions = true
      figureOptions = cand
    }
    // multi 多选题：图形网格布局 + 选中态预计算（WXML 无法调用数组方法）
    let multiFigures = false
    let multiCols = 4
    let multiFigHeight = 0
    let multiSel = []
    if (q.type === 'multi') {
      const list = cand || []
      multiFigures = list.length > 0
      const optCount = multiFigures ? list.length : (q.options || []).length
      const selArr = Array.isArray(this.data.answers[i]) ? this.data.answers[i] : []
      multiSel = new Array(optCount)
      for (let k = 0; k < optCount; k++) multiSel[k] = selArr.indexOf(k) >= 0
      if (multiFigures) {
        multiCols = q.cols || (list.length <= 6 ? 3 : list.length <= 12 ? 4 : 6)
        multiFigHeight = Math.ceil(list.length / multiCols) * 160
      }
      // 目标图（找相同/类比题）：交由 drawFigures 绘制到 targetCanvas
      if (q.matrix || q.analogy) targetMatrix = q.matrix
    }
    this.setData(
      {
        q,
        qType: q.type,
        progress: Math.round(((i + 1) / this.data.total) * 100),
        optStyle,
        groupLabel,
        showFigureOptions,
        figureOptions,
        targetMatrix,
        multiFigures,
        multiCols,
        multiFigHeight,
        multiSel,
      },
      () => {
        if (needCanvas) this.drawFigures()
      }
    )
  },

  ensureCanvas(id, cb, tries = 0) {
    const MAX_TRIES = 30
    wx.createSelectorQuery()
      .select('#' + id)
      .fields({ node: true, size: true })
      .exec((res) => {
        if (!res[0]) {
          if (tries >= MAX_TRIES) return
          setTimeout(() => this.ensureCanvas(id, cb, tries + 1), 60)
          return
        }
        const canvas = res[0].node
        const ctx = canvas.getContext('2d')
        const W = res[0].width
        const H = res[0].height
        if (!W || !H) {
          if (tries >= MAX_TRIES) return
          setTimeout(() => this.ensureCanvas(id, cb, tries + 1), 60)
          return
        }
        canvas.width = W * this.dpr
        canvas.height = H * this.dpr
        ctx.scale(this.dpr, this.dpr)
        cb(ctx, W, H)
      })
  },

  drawFigures() {
    const q = this.data.q
    const sel = this.data.answers[this.data.current]
    const self = this

    // 轻量 memo：按画布 id + 签名跳过未发生变化的整帧重绘。
    // 矩阵图随题号变化、候选图随选中项变化，避免每次选中都重画整张矩阵。
    const shouldDraw = (id, sig) => {
      this._figKeys = this._figKeys || {}
      if (this._figKeys[id] === sig) return false
      this._figKeys[id] = sig
      return true
    }

    if (q.type === 'matrix') {
      if (shouldDraw('matrixCanvas', 'm:' + this.data.current)) {
      this.ensureCanvas('matrixCanvas', (ctx, W, H) => {
        ctx.clearRect(0, 0, W, H)
        const N = q.matrix.length
        const side = Math.min(W, H)
        const cell = side / N
        const offX = (W - side) / 2
        const offY = (H - side) / 2
        q.matrix.forEach((row, r) => {
          row.forEach((c, col) => drawCell(ctx, c, offX + col * cell, offY + r * cell, cell))
        })
        ctx.strokeStyle = '#e2e8f0'
        ctx.lineWidth = 1
        for (let i = 1; i < N; i++) {
          ctx.beginPath()
          ctx.moveTo(offX + i * cell, offY)
          ctx.lineTo(offX + i * cell, offY + side)
          ctx.stroke()
          ctx.beginPath()
          ctx.moveTo(offX, offY + i * cell)
          ctx.lineTo(offX + side, offY + i * cell)
          ctx.stroke()
        }
      })
      }
      q.options.forEach((opt, idx) => {
        if (shouldDraw('opt' + idx, 'o:' + this.data.current + ':' + idx + ':' + sel)) {
        this.ensureCanvas('opt' + idx, (ctx, W, H) => {
          ctx.clearRect(0, 0, W, H)
          const s = Math.min(W, H)
          drawCell(ctx, opt, (W - s) / 2, (H - s) / 2, s)
          // 字母徽标移出画布（WXML .opt-key-label 显示在图案下方），不遮挡图案
          if (sel === idx) {
            ctx.strokeStyle = '#2563eb'
            ctx.lineWidth = 4
            ctx.strokeRect(2, 2, W - 4, H - 4)
          }
        })
        }
      })
    }

    const tm = this.data.targetMatrix
    if (this.data.showFigureOptions && tm) {
      const isTri808 = tm.length && Array.isArray(tm[0]) && tm[0][0] && tm[0][0].edges
      if (shouldDraw('targetCanvas', 't:' + this.data.current)) {
      this.ensureCanvas('targetCanvas', (ctx, W, H) => {
        ctx.clearRect(0, 0, W, H)
        const rows = tm.length
        const cols = tm[0].length
        const cw = W / cols
        const ch = H / rows
        if (isTri808) {
          // tri808 图形：使用 layout 几何绘制边、符号与中心圆
          tm.forEach((row, r) => {
            row.forEach((c, col) => {
              const cellSize = Math.min(cw, ch)
              const l = require('../../utils/tri808').layout(c, cellSize)
              // 边
              l.edges.forEach(e => {
                ctx.beginPath()
                ctx.moveTo(col * cw + e.x1, r * ch + e.y1)
                ctx.lineTo(col * cw + e.x2, r * ch + e.y2)
                ctx.strokeStyle = e.color
                ctx.lineWidth = e.th
                ctx.stroke()
              })
              // 符号
              l.syms.forEach(s => {
                if (s.hidden) return
                ctx.save()
                ctx.fillStyle = s.color
                ctx.font = 'bold ' + Math.round(s.size * 0.95) + 'px sans-serif'
                ctx.textAlign = 'center'
                ctx.textBaseline = 'middle'
                ctx.translate(col * cw + s.left + s.size / 2, r * ch + s.top + s.size / 2)
                ctx.rotate((s.rotate * Math.PI) / 180)
                ctx.fillText(s.glyph, 0, 0)
                ctx.restore()
              })
              // 中心圆
              const cir = l.circle
              if (!cir.hidden) {
                ctx.beginPath()
                ctx.arc(col * cw + cir.left + cir.d / 2, r * ch + cir.top + cir.d / 2, cir.d / 2, 0, Math.PI * 2)
                ctx.fillStyle = cir.color
                ctx.fill()
              }
            })
          })
        } else {
          tm.forEach((row, r) => {
            row.forEach((c, col) => drawCell(ctx, c, col * cw, r * ch, Math.min(cw, ch)))
          })
        }
      })
      }
    }

    if (this.data.showFigureOptions) {
      this.data.figureOptions.forEach((m, idx) => {
        if (shouldDraw('figopt' + idx, 'f:' + this.data.current + ':' + idx + ':' + sel)) {
        this.ensureCanvas('figopt' + idx, (ctx, W, H) => {
          ctx.clearRect(0, 0, W, H)
          const rows = m.length
          const cols = m[0].length
          const cw = W / cols
          const ch = H / rows
          m.forEach((row, r) => {
            row.forEach((c, col) => drawCell(ctx, c, col * cw, r * ch, Math.min(cw, ch)))
          })
          // 序号徽标移出画布（WXML .figopt-key 显示在图案下方），不遮挡图案
          if (sel === idx) {
            ctx.strokeStyle = '#2563eb'
            ctx.lineWidth = 4
            ctx.strokeRect(2, 2, W - 4, H - 4)
          }
        })
        }
      })
    }

    // multi 图形多选：整块网格画在单个 canvas 上，选中态由透明覆盖层（WXML）负责，
    // 因此签名不含选中状态——每题只画一次，切换选中不触发重绘
    if (q.type === 'multi' && this.data.multiFigures) {
      if (shouldDraw('multiCanvas', 'mc:' + this.data.current)) {
        this.ensureCanvas('multiCanvas', (ctx, W, H) => {
          ctx.clearRect(0, 0, W, H)
          const list = q.candidates || []
          const cols = this.data.multiCols || 4
          const cw = W / cols
          const rows = Math.ceil(list.length / cols)
          const ch = H / rows
          list.forEach((cellData, idx) => {
            const c = idx % cols
            const r = Math.floor(idx / cols)
            const x = c * cw
            const y = r * ch
            // 每格固定边框：未选中也容易区分，选中态由覆盖层叠加品牌色描边
            ctx.save()
            ctx.strokeStyle = '#94a3b8'
            ctx.lineWidth = 1.5
            ctx.strokeRect(x + 2, y + 2, cw - 4, ch - 4)
            ctx.restore()
            // 顶部预留编号条，图案画在条下方，编号不覆盖图案
            const br = multiBadgeR(cw, ch)
            const hh = br * 2 + 10
            const fw = cw - 16
            const fh = ch - hh - 12
            const s = Math.max(8, Math.min(fw, fh))
            // 若为 tri808 图形则用 layout 绘制，否则回退 drawCell
            if (cellData && cellData.edges) {
              const cellSize = Math.min(cw, ch)
              const l = require('../../utils/tri808').layout(cellData, cellSize)
              // 边
              l.edges.forEach(e => {
                ctx.beginPath()
                ctx.moveTo(x + 8 + (fw - s) / 2 + e.x1, y + 2 + hh + (fh - s) / 2 + e.y1)
                ctx.lineTo(x + 8 + (fw - s) / 2 + e.x2, y + 2 + hh + (fh - s) / 2 + e.y2)
                ctx.strokeStyle = e.color
                ctx.lineWidth = e.th
                ctx.stroke()
              })
              // 符号
              l.syms.forEach(s => {
                if (s.hidden) return
                ctx.save()
                ctx.fillStyle = s.color
                ctx.font = 'bold ' + Math.round(s.size * 0.95) + 'px sans-serif'
                ctx.textAlign = 'center'
                ctx.textBaseline = 'middle'
                ctx.translate(x + 8 + (fw - s) / 2 + s.left + s.size / 2, y + 2 + hh + (fh - s) / 2 + s.top + s.size / 2)
                ctx.rotate((s.rotate * Math.PI) / 180)
                ctx.fillText(s.glyph, 0, 0)
                ctx.restore()
              })
              // 中心圆
              const cir = l.circle
              if (!cir.hidden) {
                const cx = x + 8 + (fw - s) / 2 + cir.left + cir.d / 2
                const cy = y + 2 + hh + (fh - s) / 2 + cir.top + cir.d / 2
                ctx.beginPath()
                ctx.arc(cx, cy, cir.d / 2, 0, Math.PI * 2)
                ctx.fillStyle = cir.color
                ctx.fill()
              }
            } else {
              const c = cellData || {}
              drawCell(ctx, c, x + 8 + (fw - s) / 2, y + 2 + hh + (fh - s) / 2, s)
            }
            drawMultiBadge(ctx, x, y, cw, ch, idx)
          })
        })
      }
    }

    // multi 目标图：类比题自绘 A→B / C→?，找相同题绘制 1×1 目标矩阵
    if (q.type === 'multi' && (q.analogy || (this.data.targetMatrix && !this.data.showFigureOptions))) {
      if (shouldDraw('targetCanvas', 't:' + this.data.current)) {
        this.ensureCanvas('targetCanvas', (ctx, W, H) => {
          ctx.clearRect(0, 0, W, H)
          if (q.analogy) {
            drawAnalogy(ctx, W, H, q.analogy)
            return
          }
          const tm2 = this.data.targetMatrix
          const rows = tm2.length
          const cols = tm2[0].length
          const cw = W / cols
          const ch = H / rows
          tm2.forEach((row, r) => {
            row.forEach((c, col) => drawCell(ctx, c, col * cw, r * ch, Math.min(cw, ch)))
          })
        })
      }
    }
  },

  selectAnswer(e) {
    const idx = e.currentTarget.dataset.index
    const answers = this.data.answers.slice()
    answers[this.data.current] = idx
    const answeredCount = answers.filter((a) => a !== null).length
    this.setData({ answers, answeredCount }, () => {
      if (this.data.qType === 'matrix') this.drawFigures()
      this.stopCountdown()
      this.saveProgress()
      // 图形/矩阵题给用户更长时间观察，普通测评表题快速跳入下一题
      const delay = this.data.showFigureOptions || this.data.qType === 'matrix' ? 900 : 350
      this.scheduleNext(delay)
    })
  },

  // multi 多选：点击切换选中，不自动跳题（由底部「下一题/提交」确认）；
  // 全部取消时回落为 null，保持与其它题型一致的「未作答」语义
  toggleMulti(e) {
    const idx = e.currentTarget.dataset.idx
    const answers = this.data.answers.slice()
    const cur = answers[this.data.current]
    const arr = Array.isArray(cur) ? cur.slice() : []
    const p = arr.indexOf(idx)
    if (p >= 0) arr.splice(p, 1)
    else arr.push(idx)
    arr.sort((a, b) => a - b)
    answers[this.data.current] = arr.length ? arr : null
    const answeredCount = answers.filter((a) => a !== null).length
    const q = this.data.q
    const optCount = this.data.multiFigures ? (q.candidates || []).length : (q.options || []).length
    const selArr = answers[this.data.current] || []
    const multiSel = new Array(optCount)
    for (let k = 0; k < optCount; k++) multiSel[k] = selArr.indexOf(k) >= 0
    this.setData({ answers, answeredCount, multiSel }, () => this.saveProgress())
  },

  scheduleNext(delay) {
    if (this._timer) clearTimeout(this._timer)
    this._timer = setTimeout(() => {
      if (this.data.current < this.data.total - 1) this.next()
      else this.submit()
    }, delay || 350)
  },

  markTime() {
    const i = this.data.current
    const now = Date.now()
    this._timings[i] = (this._timings[i] || 0) + (now - (this._qStart || now))
    this._qStart = now
  },

  stopCountdown() {
    if (this._timer2) {
      clearInterval(this._timer2)
      this._timer2 = null
    }
  },

  startCountdown(q) {
    this.stopCountdown()
    if (!q || !q.timeLimit) {
      this.setData({ hasTimeLimit: false, timeLeft: 0 })
      return
    }
    this.setData({ hasTimeLimit: true, timeLeft: q.timeLimit })
    this._qDeadline = Date.now() + q.timeLimit * 1000
    this._timer2 = setInterval(() => {
      const left = Math.max(0, Math.round((this._qDeadline - Date.now()) / 1000))
      this.setData({ timeLeft: left })
      if (left <= 0) {
        this.stopCountdown()
        if (this.data.current < this.data.total - 1) this.next()
        else this.submit()
      }
    }, 250)
  },

  stopTotalTimer() {
    if (this._timer3) {
      clearInterval(this._timer3)
      this._timer3 = null
    }
  },

  // 整卷倒计时：模块定义 totalTimeLimit（秒）时启用。计时起点存入进度（startedAt），
  // 断点续答按已流逝时间扣减；到点弹窗提示后直接交卷（跳过逐题确认）
  beginTotalTimer() {
    this.stopTotalTimer()
    if (!this._totalLimit) return
    const elapsed = Math.floor((Date.now() - (this._startedAt || Date.now())) / 1000)
    const left = this._totalLimit - elapsed
    if (left <= 0) {
      this.finishByTimeout()
      return
    }
    this.setData({ hasTotalTime: true, totalTimeText: fmtClock(left) })
    this._timer3 = setInterval(() => {
      const l = this._totalLimit - Math.floor((Date.now() - (this._startedAt || Date.now())) / 1000)
      if (l <= 0) {
        this.stopTotalTimer()
        this.finishByTimeout()
        return
      }
      this.setData({ totalTimeText: fmtClock(l) })
    }, 500)
  },

  finishByTimeout() {
    if (this._submitting) return
    wx.showModal({
      title: '答题时间到',
      content: '整卷时间已用完，将按当前作答自动交卷。',
      showCancel: false,
      confirmText: '查看结果',
      success: () => this.doSubmit(),
      fail: () => this.doSubmit(),
    })
  },

  prev() {
    if (this._timer) clearTimeout(this._timer)
    if (this.data.current === 0) return
    this.stopCountdown()
    this.markTime()
    this.setData({ current: this.data.current - 1 }, () => this.renderCurrent())
  },

  next() {
    if (this._timer) clearTimeout(this._timer)
    this.stopCountdown()
    this.markTime()
    const cur = this.data.current
    if (cur >= this.data.total - 1) {
      this.submit()
      return
    }
    const nxt = cur + 1
    const curSet = this.data.questions[cur].set
    const nxtSet = this.data.questions[nxt].set
    this.setData({ current: nxt }, () => this.renderCurrent())
    if (curSet && nxtSet && curSet !== nxtSet) this.showGroupSummary(curSet)
  },

  showGroupSummary(set, cb) {
    const m = this._setMeta[set]
    if (!m) {
      cb && cb()
      return
    }
    let correct = 0
    for (let i = m.start; i < m.start + m.total; i++) {
      const a = this.data.answers[i]
      const b = this.data.questions[i].answer
      // 多选题答案为数组，需按结构比较；单选保持严格相等
      const same = Array.isArray(a) || Array.isArray(b) ? JSON.stringify(a) === JSON.stringify(b) : a === b
      if (a != null && same) correct++
    }
    wx.showModal({
      title: set + ' 组完成',
      content: '本组答对 ' + correct + ' / ' + m.total,
      showCancel: false,
      success: () => cb && cb(),
    })
  },

  // 实际写盘：节流与强制落盘共用
  writeProgress() {
    if (!this.data.meta || !this.data.meta.id) return
    wx.setStorageSync(SK.PROGRESS_PREFIX + this.data.meta.id, {
      answers: this.data.answers,
      current: this.data.current,
      startedAt: this._startedAt || Date.now(),
    })
  },

  saveProgress() {
    const now = Date.now()
    // 节流：最多每 2 秒写一次，降低低端机 Storage IO 压力
    if (this._lastSave && now - this._lastSave < 2000) return
    this._lastSave = now
    this.writeProgress()
  },

  // 绕过节流的强制落盘：用于 onUnload/onHide，避免 2 秒内连续答题后退出丢进度
  saveProgressForce() {
    if (this._finished) return // 已交卷：doSubmit 已清除进度，不可再写回
    this._lastSave = Date.now()
    this.writeProgress()
  },

  submit() {
    if (this._timer) clearTimeout(this._timer)
    this.stopCountdown()
    // 确认弹窗期间暂停整卷计时，避免超时弹窗与确认弹窗叠加；取消则恢复
    this.stopTotalTimer()
    this.markTime()
    const resume = () => this.beginTotalTimer()
    const isLast = this.data.current === this.data.total - 1
    const curSet = this.data.questions[this.data.current] && this.data.questions[this.data.current].set
    const unanswered = this.data.answers.filter((a) => a === null).length
    const proceed = () => {
      if (isLast && curSet) this.showGroupSummary(curSet, () => this.doSubmit())
      else this.doSubmit()
    }
    if (unanswered > 0) {
      wx.showModal({
        title: '还有题目未作答',
        content: `剩余 ${unanswered} 题未作答，未答题目将按测评表默认分值计入，确定提交？`,
        success: (r) => {
          if (r.confirm) proceed()
          else resume()
        },
        fail: resume,
      })
      return
    }
    wx.showModal({
      title: '提交测评',
      content: `已完成全部 ${this.data.total} 题，确认提交并查看结果？`,
      success: (r) => {
        if (r.confirm) proceed()
        else resume()
      },
      fail: resume,
    })
  },

  doSubmit() {
    if (this._submitting) return
    this._submitting = true
    this._finished = true // 交卷后 onUnload/onHide 不再兜底保存进度（doSubmit 已清进度）
    if (this._timer) clearTimeout(this._timer)
    this.stopCountdown()
    this.stopTotalTimer()
    this.markTime()
    wx.removeStorageSync(SK.PROGRESS_PREFIX + this.data.meta.id)
    const layout = this.mod.resultLayout || {}
    const r = this.mod.computeResult(this.data.answers, this.data.questions, { timings: this._timings })
    const pv = r[layout.primaryField || 'score']
    const hist = wx.getStorageSync(SK.HISTORY) || []
    const record = {
      rid: Date.now() + '_' + Math.random().toString(36).slice(2, 8),
      id: this.data.meta.id,
      name: this.data.meta.name,
      icon: this.data.meta.icon,
      time: Date.now(),
      answers: this.data.answers,
      qcount: this.data.total,
      summary: pv == null ? '' : String(pv),
      level: r.level || '',
      totalTime: typeof r.totalTime === 'number' ? r.totalTime : 0,
      schemaVersion: SCHEMA_VERSION,
      userId: getUserId(),
    }
    hist.unshift(record)
    // 超出上限时仅保留最近 N 条，并提示用户（避免静默丢数据）
    const dropped = Math.max(0, hist.length - HISTORY_LIMIT)
    const trimmed = hist.slice(0, HISTORY_LIMIT)
    if (dropped > 0) {
      wx.showToast({ title: '仅保留最近 ' + HISTORY_LIMIT + ' 条记录', icon: 'none' })
    }
    // 配额兜底：写入失败时 progressively 丢弃最旧记录直至成功
    for (let guard = 0; guard < trimmed.length; guard++) {
      try {
        wx.setStorageSync(SK.HISTORY, trimmed)
        break
      } catch (e) {
        trimmed = trimmed.slice(0, trimmed.length - 1)
      }
    }

    const app = getApp()
    app.globalData.lastResult = { id: this.data.meta.id, answers: this.data.answers, totalTime: record.totalTime }
    wx.reLaunch({ url: `/pages/result/result?id=${this.data.meta.id}` })
  },

  // 切后台（home 键/被其它页覆盖）时兜底落盘，避免节流窗口内进度丢失
  onHide() {
    this.saveProgressForce()
  },

  onUnload() {
    this.saveProgressForce()
    this._submitting = false
    this.stopCountdown()
    this.stopTotalTimer()
  },

  onShareAppMessage() {
    return {
      title: this.data.meta.name + ' - 心智探索局',
      path: '/pages/detail/detail?id=' + this.data.meta.id,
    }
  },
  onShareTimeline() {
    return {
      title: this.data.meta.name + ' - 心智探索局',
    }
  },
})
