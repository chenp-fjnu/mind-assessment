// 通用呼吸训练组件：以「阶段序列」驱动所有放松正念类游戏
// （箱式呼吸 / 4-7-8 / 共振呼吸 / 正念呼吸）。各游戏的差异仅在于
// index.js 中的 PHASES 配置与 generate/score 纯函数，组件逻辑完全通用，
// 避免 4 份几乎相同的游戏组件重复维护。
// 注意：各游戏 index.js 以字面量 require 静态引入，保证微信打包器能分析打包。
const MODS = {
  'box-breathing': require('../../games/box-breathing/index'),
  'breath-478': require('../../games/breath-478/index'),
  resonance: require('../../games/resonance/index'),
  mindfulness: require('../../games/mindfulness/index'),
}

function normalizePhases(raw) {
  return (raw || []).map((p) => ({
    key: p.key || p.label,
    label: p.label,
    sec: p.sec != null ? p.sec : p.dur,
  }))
}

Component({
  properties: {
    gameId: { type: String, value: '' },
    level: { type: Number, value: 5, observer() { this.reset() } },
    color: { type: String, value: '#10b981' },
    tint: { type: String, value: 'rgba(16,185,129,0.12)' },
  },
  data: {
    phases: [],
    target: 5,
    phaseLabel: '',
    phaseKey: '',
    remain: 4,
    progress: 0,
    running: false,
    completed: 0,
  },
  lifetimes: {
    attached() { this.reset() },
    detached() { this.clearTimer() },
  },
  methods: {
    mod() {
      return MODS[this.data.gameId]
    },
    clearTimer() {
      if (this.timer) {
        clearInterval(this.timer)
        this.timer = null
      }
    },
    reset() {
      this.clearTimer()
      const mod = this.mod()
      if (!mod) return
      const seed = mod.generate(this.data.level)
      const phases = normalizePhases(seed.phases)
      const target = seed.rounds != null ? seed.rounds : seed.cycles
      const first = phases[0] || { label: '', sec: 0 }
      this.phaseIdx = 0
      this.setData({
        phases,
        target: target || 0,
        phaseLabel: first.label,
        phaseKey: first.key,
        remain: first.sec,
        progress: 0,
        running: false,
        completed: 0,
        startTs: 0,
      })
    },
    start() {
      if (this.data.running) return
      this.phaseIdx = 0
      this.setData({ running: true, startTs: Date.now(), completed: 0 })
      this.enterPhase(0)
    },
    enterPhase(idx) {
      const phase = this.data.phases[idx]
      this.phaseIdx = idx
      const total = phase.sec || 1
      this.setData({ phaseKey: phase.key, phaseLabel: phase.label, remain: phase.sec, progress: 0 })
      this.clearTimer()
      this.timer = setInterval(() => {
        const remain = this.data.remain - 1
        const progress = 1 - remain / total
        if (remain <= 0) {
          this.clearTimer()
          const nextIdx = this.phaseIdx + 1
          if (nextIdx >= this.data.phases.length) {
            const completed = this.data.completed + 1
            this.setData({ completed })
            if (completed >= this.data.target) {
              this.finish()
              return
            }
            this.enterPhase(0)
          } else {
            this.enterPhase(nextIdx)
          }
        } else {
          this.setData({ remain, progress })
        }
      }, 1000)
    },
    stop() {
      if (!this.data.running) return
      this.finish()
    },
    finish() {
      this.clearTimer()
      const mod = this.mod()
      if (!mod) return
      const duration = this.data.startTs ? (Date.now() - this.data.startTs) / 1000 : 0
      // 兼容各游戏 score 入参（box-breathing 取 rounds/duration，其余取 cycles）
      const result = mod.score({ rounds: this.data.completed, cycles: this.data.completed, duration })
      this.setData({ running: false })
      this.triggerEvent('finish', result)
    },
  },
})
