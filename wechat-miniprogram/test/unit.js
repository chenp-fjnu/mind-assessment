const assert = require('assert')
const { readableTextColor } = require('../utils/color')
const { isDark } = require('../utils/theme')

// readableTextColor：按亮度自动选择可读前景色（保留多彩主色）
assert.strictEqual(readableTextColor('#7c3aed'), '#ffffff', '深紫 -> 白字')
assert.strictEqual(readableTextColor('#000000'), '#ffffff', '黑 -> 白字')
assert.strictEqual(readableTextColor('#ffffff'), '#1e293b', '白 -> 深字')
assert.strictEqual(readableTextColor('#f59e0b'), '#1e293b', '琥珀浅色 -> 深字（对比度）')
assert.strictEqual(readableTextColor('#1e293b'), '#ffffff', '深蓝 -> 白字')
assert.strictEqual(readableTextColor(''), '#ffffff', '非法色 -> 白字兜底')

// isDark：无 wx 环境应安全返回 false（被 try/catch 兜住）
assert.strictEqual(isDark(), false, '无 wx -> false')

console.log('unit tests passed ✅')
