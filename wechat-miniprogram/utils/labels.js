// 维度标签工厂：消除各模块重复的 `return MAP[dim] || dim` 写法
function makeLabeler(map) {
  return function (dim) {
    return (map && map[dim]) || dim
  }
}

module.exports = { makeLabeler }
