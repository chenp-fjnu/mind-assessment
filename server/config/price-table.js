/**
 * 测评价格表（单位：分）
 * 服务端为准，客户端不可修改
 * 
 * 添加新付费测评时在此注册价格
 */
const PRICE_TABLE = {
  spm: 990,
  wechsler: 1290,
  pf16: 990,
};

/**
 * 检查模块是否为付费模块
 */
function isPaidModule(moduleId) {
  return PRICE_TABLE.hasOwnProperty(moduleId);
}

/**
 * 获取模块价格（分），免费模块返回 0
 */
function getPrice(moduleId) {
  return PRICE_TABLE[moduleId] || 0;
}

module.exports = { PRICE_TABLE, isPaidModule, getPrice };
