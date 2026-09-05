const mod = require('./index')

Component({
  properties: {
    level: {
      type: Number,
      value: 3,
      observer() {
        this.reset()
      },
    },
    boardWidth: {
      type: Number,
      value: 705,
      observer() {
        this.applySizing()
      },
    },
    boardHeight: {
      type: Number,
      value: 0,
      observer() {
        this.applySizing()
      },
    },
  },
  data: {
    disks: 3,
    pegs: [[], [], []],
    goal: 2,
    optimal: 7,
    selected: -1,
    moves: 0,
    phase: 'idle',
    pegHeight: 380,
    diskH: 42,
    diskGap: 6,
    diskW0: 60,
    diskWStep: 64,
  },
  lifetimes: {
    attached() {
      this.reset()
    },
  },
  methods: {
    reset() {
      const seed = mod.generate(this.data.level)
      this.setData({
        disks: seed.disks,
        pegs: seed.pegs.map((p) => p.slice()),
        goal: seed.goal,
        optimal: seed.optimal,
        selected: -1,
        moves: 0,
        phase: 'idle',
      })
      this.computeSizing()
    },
    applySizing() {
      this.computeSizing()
    },
    computeSizing() {
      const disks = this.data.disks || 3
      const cols = 3
      const sideGap = 8
      const pegGap = 14
      const bw = this.data.boardWidth || 705
      const pegW = Math.floor((bw - sideGap * 2 - pegGap * (cols - 1)) / cols)

      // 默认（非全屏）尺寸
      let pegHeight = 380
      let diskH = 42
      let diskGap = 6

      // 全屏时受屏幕高度约束：扣除顶部信息行与底部提示，剩余高度用于柱+盘
      const bh = this.data.boardHeight
      if (bh > 0) {
        const topInfo = 70
        const bottomTip = 60
        const avail = Math.max(220, bh - topInfo - bottomTip)
        const padV = 18
        pegHeight = avail
        diskGap = 4
        diskH = Math.max(20, Math.floor((avail - padV - (disks - 1) * diskGap) / disks))
      }

      // 使用固定宽度比例，避免全屏时圆盘拉伸过大
      // 最小盘宽度为pegW的30%，最大盘宽度为pegW的70%，中间等距分布
      // 但不再随disks数量自动扩缩，改为最多5级有限的分布
      const maxDisks = 5
      // 盘宽比例系数
      const minDiskW = Math.floor(pegW * 0.3)
      const maxDiskW = Math.floor(pegW * 0.7)
      let diskWStep = 0
      let diskW0 = minDiskW
      if (disks <= maxDisks && disks > 1) {
        diskWStep = Math.floor((maxDiskW - minDiskW) / (disks - 1))
        diskW0 = Math.max(20, minDiskW - diskWStep)
      } else if (disks > maxDisks) {
        // 超过5级时，前5级用固定步长，其余最小宽度
        diskWStep = Math.floor((maxDiskW - minDiskW) / (maxDisks - 1))
        diskW0 = Math.max(20, minDiskW - diskWStep)
      }

      this.setData({ pegHeight, diskH, diskGap, diskW0, diskWStep })
    },
    start() {
      if (this.data.phase !== 'idle' && this.data.phase !== 'done') return
      this.setData({ phase: 'play', moves: 0, selected: -1 })
    },
    onPeg(e) {
      if (this.data.phase !== 'play') {
        this.start()
        return
      }
      const idx = parseInt(e.currentTarget.dataset.idx, 10)
      if (this.data.selected === -1) {
        if (this.data.pegs[idx].length === 0) return
        this.setData({ selected: idx })
        return
      }
      if (idx === this.data.selected) {
        this.setData({ selected: -1 })
        return
      }
      const from = this.data.pegs[this.data.selected]
      const to = this.data.pegs[idx]
      const disk = from[from.length - 1]
      const top = to[to.length - 1]
      if (top !== undefined && top < disk) {
        // 非法：大压小
        this.setData({ selected: -1 })
        return
      }
      const pegs = this.data.pegs.map((p) => p.slice())
      pegs[idx].push(pegs[this.data.selected].pop())
      const moves = this.data.moves + 1
      const selected = -1
      if (pegs[this.data.goal].length === this.data.disks) {
        const result = mod.score({ moves, optimal: this.data.optimal })
        this.setData({ pegs, moves, selected, phase: 'done' })
        this.triggerEvent('finish', result)
      } else {
        this.setData({ pegs, moves, selected })
      }
    },
  },
})
