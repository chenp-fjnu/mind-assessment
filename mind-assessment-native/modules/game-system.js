/**
 * 游戏系统 - 统一注册和管理认知训练游戏
 *
 * 统一接口规范——每个游戏模块需导出：
 * {
 *   id:          'schulte'
 *   name:        '舒尔特方格',
 *   desc:        '专注力训练',
 *   icon:        '🎯',
 *   color:       '#1e3a8a',
 *   path:        '/pages/games/schulte/schulte',
 *   category:    'attention' | 'memory' | 'speed' | 'inhibition' | 'reasoning' | 'spatial',
 * }
 *
 * P2-14: 启动时自动校验每个游戏对象的字段完整性
 */

const GAMES = [
  { id: 'schulte', name: '舒尔特方格', desc: '专注力训练', icon: '🎯', color: '#1e3a8a', path: '/pages/games/schulte/schulte', category: 'attention' },
  { id: 'stroop', name: '斯特鲁普', desc: '抑制控制', icon: '🎨', color: '#dc2626', path: '/pages/games/stroop/stroop', category: 'inhibition' },
  { id: 'span', name: '数字广度', desc: '短期记忆', icon: '🔢', color: '#7c3aed', path: '/pages/games/span/span', category: 'memory' },
  { id: 'nback', name: 'N回溯', desc: '工作记忆', icon: '🧠', color: '#0d9488', path: '/pages/games/nback/nback', category: 'memory' },
  { id: 'reaction', name: '反应速度', desc: '处理速度', icon: '⚡', color: '#d97706', path: '/pages/games/reaction/reaction', category: 'speed' },
  { id: 'memory', name: '图形记忆', desc: '记忆图形位置', icon: '🃏', color: '#be185d', path: '/pages/games/memory/memory', category: 'memory' },
  { id: 'sequence', name: '数字序列', desc: '找出数字规律', icon: '🔢', color: '#2563eb', path: '/pages/games/sequence/sequence', category: 'reasoning' },
  { id: 'rotation', name: '空间旋转', desc: '判断旋转方向', icon: '🔄', color: '#16a34a', path: '/pages/games/rotation/rotation', category: 'spatial' },
];

const CATEGORY_LABELS = {
  attention: '注意力',
  memory: '记忆力',
  speed: '反应速度',
  inhibition: '抑制控制',
  reasoning: '推理能力',
  spatial: '空间思维',
};

// P2-14: 游戏对象必需字段
const REQUIRED_GAME_FIELDS = ['id', 'name', 'desc', 'icon', 'color', 'path', 'category'];
// P2-14: 合法的 category 值
const VALID_CATEGORIES = Object.keys(CATEGORY_LABELS);

/**
 * P2-14: 运行时校验游戏对象字段完整性
 */
function validateGame(game) {
  const missing = REQUIRED_GAME_FIELDS.filter((f) => !game[f]);
  if (missing.length) {
    console.warn(`[game-system] 游戏 "${game.id || '未知'}" 缺少必需字段: ${missing.join(', ')}`);
  }
  if (game.category && !VALID_CATEGORIES.includes(game.category)) {
    console.warn(`[game-system] 游戏 "${game.id}" 的 category "${game.category}" 不在已知分类中`);
  }
  if (game.path && typeof game.path !== 'string') {
    console.warn(`[game-system] 游戏 "${game.id}" 的 path 必须为字符串`);
  }
}

// P2-14: 启动时校验所有游戏
GAMES.forEach(validateGame);

/** 按 id 查找游戏 */
function getGame(id) {
  return GAMES.find((g) => g.id === id);
}

/** 获取全部游戏 */
function listAll() {
  return GAMES.slice();
}

/** 按分类筛选 */
function listByCategory(category) {
  return GAMES.filter((g) => g.category === category);
}

/** 获取所有分类 */
function getCategories() {
  return [...new Set(GAMES.map((g) => g.category))];
}

/** 获取分类名称 */
function getCategoryLabel(category) {
  return CATEGORY_LABELS[category] || category;
}

/** 按分类分组返回游戏列表 */
function listGrouped() {
  const groups = {};
  for (const g of GAMES) {
    if (!groups[g.category]) groups[g.category] = [];
    groups[g.category].push(g);
  }
  return groups;
}

module.exports = {
  GAMES,
  getGame,
  listAll,
  listByCategory,
  getCategories,
  getCategoryLabel,
  listGrouped,
};
