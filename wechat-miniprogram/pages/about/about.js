const { getMetaList, TYPE_LABELS } = require('../../utils/registry')
const methodsData = require('../../utils/methods-data')
const gameReg = require('../../utils/game-registry')
const { openPrivacyContract } = require('../../utils/privacy')
const { useTheme } = require('../../utils/theme-store')

Page({
  data: {
    sources: [
      { name: 'IPIP 国际人格项目库', desc: '大五人格（IPIP-50）、16PF（IPIP 版）等公开领域题库' },
      { name: 'EPQ-RSC 艾森克人格问卷', desc: '简式中文版，含 E / N / P / L 四量表' },
      { name: 'RIASEC 霍兰德职业兴趣', desc: '现实/研究/艺术/社会/企业/常规六型理论' },
      { name: 'Hendrick & Hendrick 爱情态度量表', desc: 'LAS，浪漫/好友/游戏/占有/实用/奉献六型' },
      { name: 'MBTI 类型指标', desc: '迈尔斯-布里格斯，公开题库整理（EI/SN/TF/JP）' },
      { name: 'GAD-7 / DASS-21', desc: '广泛性焦虑量表、抑郁-焦虑-压力量表' },
      { name: 'Zung 自评量表', desc: 'SAS 焦虑自评、SDS 抑郁自评（Zung 原版条目）' },
      { name: 'Rosenberg 自尊量表', desc: 'SES，10 题自尊测量' },
      { name: '瑞文 / 韦氏（图形题）', desc: 'SPM 矩阵推理、WAIS 分测验图形题为原创生成，仅作能力练习，非标准化常模' },
    ],
    moduleCount: 0,
    typeCount: 0,
    methodCount: 0,
    practiceCount: 0,
    gameCount: 0,
    dimCount: 0,
  },
  onLoad() {
    useTheme(this)
    const allModules = getMetaList()
    const typeCount = Object.keys(TYPE_LABELS).filter((t) => allModules.some((m) => m.type === t)).length
    const games = gameReg.getMetaList()
    this.setData({
      moduleCount: allModules.length,
      typeCount,
      methodCount: methodsData.METHODS.length,
      practiceCount: methodsData.METHODS.filter((m) => m.interactive).length,
      gameCount: games.length,
      dimCount: Object.keys(gameReg.DIM_LABELS).length,
    })
  },
  goHome() {
    wx.reLaunch({ url: '/pages/index/index' })
  },
  openPrivacy() {
    openPrivacyContract()
  },
  onShareAppMessage() {
    return {
      title: '关于心智探索局 - 数据来源、隐私与致谢',
      path: '/pages/about/about',
    }
  },
  onShareTimeline() {
    return {
      title: '关于心智探索局 - 数据来源、隐私与致谢',
    }
  },
})
