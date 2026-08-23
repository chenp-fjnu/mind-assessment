/**
 * 主题状态管理 - 支持跟随系统/浅色/深色 三种模式切换
 */

const THEME_KEY = 'user-theme-preference';
const THEME_MODES = {
  AUTO: 'auto',
  LIGHT: 'light',
  DARK: 'dark',
};

function getSystemTheme() {
  try {
    const systemInfo = wx.getSystemInfoSync();
    return systemInfo.theme === 'dark' ? THEME_MODES.DARK : THEME_MODES.LIGHT;
  } catch {
    return THEME_MODES.LIGHT;
  }
}

function getStoredTheme() {
  try {
    return wx.getStorageSync(THEME_KEY) || THEME_MODES.AUTO;
  } catch {
    return THEME_MODES.AUTO;
  }
}

function setStoredTheme(theme) {
  try {
    wx.setStorageSync(THEME_KEY, theme);
  } catch (e) {
    console.warn('Failed to store theme preference', e);
  }
}

function applyTheme(theme) {
  const page = getCurrentPages()[getCurrentPages().length - 1];
  if (!page) return;

  const effectiveTheme = theme === THEME_MODES.AUTO ? getSystemTheme() : theme;
  const root = page.getOpenerEventChannel ? page : null;

  // 在页面根节点设置 data-theme 属性
  // 通过 setData 触发 wxml 更新，或直接操作 DOM (小程序不支持)
  // 这里使用 wx.setStorage 同步，页面通过 onShow 读取并 setData
  wx.setStorageSync('current-effective-theme', effectiveTheme);
}

function getEffectiveTheme() {
  const stored = getStoredTheme();
  if (stored === THEME_MODES.AUTO) {
    return getSystemTheme();
  }
  return stored;
}

// 监听系统主题变化
let systemThemeListener = null;

function initThemeListener() {
  if (systemThemeListener) return;

  try {
    wx.onThemeChange((result) => {
      const stored = getStoredTheme();
      if (stored === THEME_MODES.AUTO) {
        const newTheme = result.theme === 'dark' ? THEME_MODES.DARK : THEME_MODES.LIGHT;
        wx.setStorageSync('current-effective-theme', newTheme);
        // 通知所有页面更新
        const pages = getCurrentPages();
        pages.forEach(page => {
          if (page.onThemeChange) {
            page.onThemeChange(newTheme);
          }
        });
      }
    });
    systemThemeListener = true;
  } catch (e) {
    console.warn('onThemeChange not supported', e);
  }
}

// 页面混入：自动应用主题
// 使用方式：在页面 onLoad 中调用 useTheme(this)，在 wxml 根节点添加 <view class="theme-wrapper {{themeClass}}"> 包裹内容
function useTheme(pageInstance) {
  const updateTheme = () => {
    const effectiveTheme = getEffectiveTheme();
    const storedTheme = getStoredTheme();
    const themeClass = `theme-${effectiveTheme}`;
    pageInstance.setData({ 
      currentTheme: effectiveTheme,
      themeMode: storedTheme,
      themeClass: themeClass,
    });
  };

  // 初始化
  updateTheme();
  initThemeListener();

  // 页面显示时同步（处理从设置页返回）
  const originalOnShow = pageInstance.onShow;
  pageInstance.onShow = function(...args) {
    updateTheme();
    if (originalOnShow) originalOnShow.apply(this, args);
  };

  // 提供手动切换方法
  pageInstance.setThemeMode = (mode) => {
    setStoredTheme(mode);
    updateTheme();
  };

  pageInstance.onThemeChange = (theme) => {
    pageInstance.setData({ 
      currentTheme: theme,
      themeMode: getStoredTheme(),
      themeClass: `theme-${theme}`,
    });
  };

  return {
    currentTheme: getEffectiveTheme(),
    themeMode: getStoredTheme(),
    themeClass: `theme-${getEffectiveTheme()}`,
    setThemeMode: pageInstance.setThemeMode,
  };
}

module.exports = {
  THEME_MODES,
  THEME_KEY,
  getSystemTheme,
  getStoredTheme,
  setStoredTheme,
  getEffectiveTheme,
  applyTheme,
  initThemeListener,
  useTheme,
};