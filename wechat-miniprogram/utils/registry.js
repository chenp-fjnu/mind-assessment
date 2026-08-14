const mbti = require('../modules/mbti/index')
const big5 = require('../modules/big5/index')
const epq = require('../modules/epq/index')
const disc = require('../modules/disc/index')
const pf16 = require('../modules/pf16/index')
const sds = require('../modules/sds/index')
const sas = require('../modules/sas/index')
const gad7 = require('../modules/gad7/index')
const dass21 = require('../modules/dass21/index')
const ses = require('../modules/ses/index')
const las = require('../modules/las/index')
const holland = require('../modules/holland/index')
const spm = require('../modules/spm/index')
const wechsler = require('../modules/wechsler/index')

const MODULES = [mbti, big5, epq, disc, pf16, sds, sas, gad7, dass21, ses, las, holland, spm, wechsler]

const TYPE_LABELS = {
  personality: '人格性格',
  mood: '情绪筛查',
  intelligence: '智力推理',
  career: '职业兴趣',
  self: '自我认知',
}

function getModule(id) {
  return MODULES.find((m) => m.id === id)
}

function modulesByType() {
  const map = {}
  MODULES.forEach((m) => {
    if (!map[m.type]) map[m.type] = []
    map[m.type].push(m)
  })
  return map
}

module.exports = { MODULES, TYPE_LABELS, getModule, modulesByType }
