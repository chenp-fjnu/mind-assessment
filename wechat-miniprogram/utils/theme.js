/**
 * 统一设计系统色调 - 单一事实来源
 * 所有页面、组件必须从此文件导入颜色变量
 * 禁止在各页面 wxss 中硬编码颜色值
 */

// ============================================
// 核心色板 - 单一事实来源
// ============================================
const PALETTE = {
  // 主品牌色 - Indigo 600
  brand: {
    50: '#eef2ff',
    100: '#e0e7ff',
    200: '#c7d2fe',
    300: '#a5b4fc',
    400: '#818cf8',
    500: '#6366f1',
    600: '#4f46e5',
    700: '#4338ca',
    800: '#3730a3',
    900: '#312e81',
    950: '#1e1b4b',
  },

  // 功能色 - 统一饱和度、明度
  assess: {
    light: '#f5f3ff',
    DEFAULT: '#8b5cf6',
    dark: '#7c3aed',
    darker: '#6d28d9',
  },
  method: {
    light: '#f0fdfa',
    DEFAULT: '#06b6d4',
    dark: '#0891b2',
    darker: '#0e7490',
  },
  train: {
    light: '#fffbeb',
    DEFAULT: '#f59e0b',
    dark: '#d97706',
    darker: '#b45309',
  },

  // 中性色 - 完整阶梯
  neutral: {
    0: '#ffffff',
    50: '#fafafa',
    100: '#f4f4f5',
    200: '#e4e4e7',
    300: '#d4d4d8',
    400: '#a1a1aa',
    500: '#71717a',
    600: '#52525b',
    700: '#3f3f46',
    800: '#27272a',
    900: '#18181b',
    950: '#09090b',
  },

  // 语义色
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#3b82f6',
};

// ============================================
// 语义化色彩映射 - 所有页面必须使用这些语义名
// ============================================
const SEMANTIC = {
  // 背景层级
  bg: {
    primary: 'neutral.0',           // #ffffff - 页面主背景
    secondary: 'neutral.50',        // #fafafa - 区块背景
    tertiary: 'neutral.100',        // #f4f4f5 - 卡片悬浮/悬停
    inverted: 'neutral.900',        // #18181b - 深色背景
    brand: 'brand.50',              // #eef2ff - 品牌浅色背景
    brandStrong: 'brand.100',       // #e0e7ff - 品牌强背景
  },

  // 文字层级
  text: {
    primary: 'neutral.900',         // #18181b - 主标题
    secondary: 'neutral.600',       // #52525b - 副标题/正文
    tertiary: 'neutral.500',        // #71717a - 辅助文字
    muted: 'neutral.400',           // #a1a1aa - 占位/禁用
    inverse: 'neutral.0',           // #ffffff - 深色背景上
    brand: 'brand.600',             // #4f46e5 - 品牌色文字
    link: 'brand.500',              // #6366f1 - 链接
  },

  // 边框/分割线
  border: {
    light: 'neutral.200',           // #e4e4e7 - 默认边框
    medium: 'neutral.300',          // #d4d4d8 - 强调边框
    dark: 'neutral.400',            // #a1a1aa - 重边框
    focus: 'brand.400',             // #818cf8 - 聚焦态
  },

  // 交互状态
  interactive: {
    hover: 'neutral.50',            // #fafafa
    active: 'neutral.100',          // #f4f4f5
    disabled: 'neutral.200',        // #e4e4e7
    focusRing: 'brand.300',         // #a5b4fc
  },

  // 阴影
  shadow: {
    sm: '0 2rpx 8rpx rgba(15, 23, 42, 0.05)',
    md: '0 8rpx 24rpx rgba(15, 23, 42, 0.07)',
    lg: '0 16rpx 40rpx rgba(15, 23, 42, 0.09)',
    xl: '0 24rpx 56rpx rgba(15, 23, 42, 0.11)',
    glow: '0 0 40rpx rgba(99, 102, 241, 0.12)',
    glowAssess: '0 0 40rpx rgba(139, 92, 246, 0.15)',
    glowMethod: '0 0 40rpx rgba(6, 182, 212, 0.15)',
    glowTrain: '0 0 40rpx rgba(245, 158, 11, 0.15)',
  },

  // 圆角
  radius: {
    sm: '8rpx',
    md: '12rpx',
    lg: '16rpx',
    xl: '20rpx',
    xxl: '24rpx',
    full: '999rpx',
  },

  // 间距
  spacing: {
    xs: '8rpx',
    sm: '12rpx',
    md: '16rpx',
    lg: '20rpx',
    xl: '24rpx',
    xxl: '32rpx',
    xxxl: '40rpx',
  },
};

// ============================================
// 渐变预设
// ============================================
const GRADIENTS = {
  // Hero 主渐变 - 统一品牌识别
  hero: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #06b6d4 100%)',

  // 页面级渐变 - 柔和版本
  assessPage: 'linear-gradient(135deg, #8b5cf6 0%, #a855f7 100%)',
  methodPage: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
  trainPage: 'linear-gradient(135deg, #f59e0b 0%, #f97316 100%)',

  // 卡片级渐变 - 更柔和
  assessCard: 'linear-gradient(135deg, rgba(139,92,246,0.9) 0%, rgba(168,85,247,0.9) 100%)',
  methodCard: 'linear-gradient(135deg, rgba(6,182,212,0.9) 0%, rgba(8,145,178,0.9) 100%)',
  trainCard: 'linear-gradient(135deg, rgba(245,158,11,0.9) 0%, rgba(249,115,22,0.9) 100%)',

  // 入口卡片渐变
  assessEntry: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
  methodEntry: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
  trainEntry: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',

  // 分隔线
  divider: 'linear-gradient(90deg, transparent, var(--border-light, #e4e4e7), transparent)',
};

// ============================================
// 功能色语义映射
// ============================================
const FUNCTIONAL = {
  assess: {
    bg: 'assess.light',
    text: 'assess.darker',
    border: 'assess.DEFAULT',
    badgeBg: 'assess.light',
    badgeText: 'assess.dark',
    iconBg: 'assess.light',
    iconColor: 'assess.dark',
    gradient: 'assessCard',
    entryGradient: 'assessEntry',
  },
  method: {
    bg: 'method.light',
    text: 'method.darker',
    border: 'method.DEFAULT',
    badgeBg: 'method.light',
    badgeText: 'method.dark',
    iconBg: 'method.light',
    iconColor: 'method.dark',
    gradient: 'methodCard',
    entryGradient: 'methodEntry',
  },
  train: {
    bg: 'train.light',
    text: 'train.darker',
    border: 'train.DEFAULT',
    badgeBg: 'train.light',
    badgeText: 'train.dark',
    iconBg: 'train.light',
    iconColor: 'train.dark',
    gradient: 'trainCard',
    entryGradient: 'trainEntry',
  },
};

// ============================================
// 导出工具函数
// ============================================
function resolve(path) {
  const keys = path.split('.');
  let obj = { ...PALETTE, ...SEMANTIC, ...GRADIENTS, ...FUNCTIONAL };
  for (const key of keys) {
    if (obj[key] === undefined) return path;
    obj = obj[key];
  }
  return obj;
}

// 供 wxss 使用的 CSS 变量注入（在 app.wxss 中调用）
function generateCSSVariables() {
  const vars = [];
  // 这里可以生成 :root { --color-brand: #6366f1; ... }
  return vars.join('\n');
}

// 判断当前是否深色模式
function isDark() {
  try {
    const systemInfo = wx.getSystemInfoSync();
    return systemInfo.theme === 'dark';
  } catch {
    return false;
  }
}

module.exports = {
  PALETTE,
  SEMANTIC,
  GRADIENTS,
  FUNCTIONAL,
  resolve,
  generateCSSVariables,
  isDark,
};

// 为了兼容现有代码，导出常用值
module.exports.brand = PALETTE.brand[500];
module.exports.assess = PALETTE.assess.DEFAULT;
module.exports.method = PALETTE.method.DEFAULT;
module.exports.train = PALETTE.train.DEFAULT;