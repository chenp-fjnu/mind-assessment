/**
 * 存储适配器工厂
 * 根据 STORE_ADAPTER 环境变量选择适配器
 *
 * 可用适配器：
 *   - memory（默认）：内存存储，重启丢失
 *   - redis（计划中）：Redis 持久化
 *   - mysql（计划中）：MySQL 持久化
 *
 * P1-9: 生产环境遇到未知适配器时抛错而非静默回退，避免数据丢失风险
 */

const SUPPORTED_ADAPTERS = ['memory'];

function createAdapter() {
  const type = process.env.STORE_ADAPTER || 'memory';

  if (!SUPPORTED_ADAPTERS.includes(type)) {
    const msg = `不支持的存储适配器: ${type}，支持的类型: ${SUPPORTED_ADAPTERS.join(', ')}`;
    if (process.env.NODE_ENV === 'production') {
      // P1-9: 生产环境直接抛错，阻止服务以错误配置启动
      throw new Error(msg);
    }
    // 开发环境给出警告并回退到内存存储
    console.warn(`[adapters] ${msg}，回退到内存存储`);
    return require('./memory-adapter');
  }

  switch (type) {
    case 'memory':
      return require('./memory-adapter');
    // case 'redis':
    //   return require('./redis-adapter');
    // case 'mysql':
    //   return require('./mysql-adapter');
    default:
      // 理论上不会到达这里（已在 SUPPORTED_ADAPTERS 检查中过滤）
      return require('./memory-adapter');
  }
}

module.exports = createAdapter();
