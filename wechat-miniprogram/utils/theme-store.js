/**
 * 主题状态管理 - 支持跟随系统/浅色/深色 三种模式切换
 */

const THEME_KEY = 'user-theme-preference';
const THEME_MODES = {
  AUTO: 'auto',
  LIGHT: 'light',
  DARK: 'dark',
};

// 浅色模式 tabBar 配置
const LIGHT_TAB_BAR = {
  color: '#64748b',
  selectedColor: '#7c3aed',
  backgroundColor: '#ffffff',
  borderStyle: 'black',
};

// 深色模式 tabBar 配置
const DARK_TAB_BAR = {
  color: '#888888',
  selectedColor: '#a8acf0',
  backgroundColor: '#141416',
  borderStyle: 'white',
};

// 浅色模式导航栏配置
const LIGHT_NAV_BAR = {
  frontColor: '#ffffff',
  backgroundColor: '#1e293b',
  animation: { duration: 300, timingFunc: 'easeInOut' },
};

// 深色模式导航栏配置
const DARK_NAV_BAR = {
  frontColor: '#ffffff',
  backgroundColor: '#0a0a0c',
  animation: { duration: 300, timingFunc: 'easeInOut' },
};

function updateTabBar(theme) {
  const config = theme === THEME_MODES.DARK ? DARK_TAB_BAR : LIGHT_TAB_BAR;
  try {
    wx.setTabBarStyle(config);
    // 更新各 tab 项的图标 (如果需要)
    // wx.setTabBarItem({ index, iconPath, selectedIconPath })
  } catch (e) {
    console.warn('setTabBarStyle failed', e);
  }
}

function updateNavBar(theme) {
  const config = theme === THEME_MODES.DARK ? DARK_NAV_BAR : LIGHT_NAV_BAR;
  try {
    wx.setNavigationBarColor(config);
  } catch (e) {
    console.warn('setNavigationBarColor failed', e);
  }
}

function updateNativeUI(theme) {
  updateTabBar(theme);
  updateNavBar(theme);
}

function getSystemTheme() {
  try {
    if (wx.getWindowInfo) {
      const windowInfo = wx.getWindowInfo()
      if (windowInfo.theme) {
        return windowInfo.theme === 'dark' ? THEME_MODES.DARK : THEME_MODES.LIGHT
      }
    }
    if (wx.getDeviceInfo) {
      const deviceInfo = wx.getDeviceInfo()
      if (deviceInfo.theme) {
        return deviceInfo.theme === 'dark' ? THEME_MODES.DARK : THEME_MODES.LIGHT
      }
    }
    return THEME_MODES.LIGHT
  } catch {
    return THEME_MODES.LIGHT
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

  wx.setStorageSync('current-effective-theme', effectiveTheme);
}

function getEffectiveTheme() {
  const stored = getStoredTheme();
  if (stored === THEME_MODES.AUTO) {
    return getSystemTheme();
  }
  return stored;
}

let systemThemeListener = null;

function initThemeListener() {
  if (systemThemeListener) return;

  try {
    wx.onThemeChange((result) => {
      const stored = getStoredTheme();
      if (stored === THEME_MODES.AUTO) {
        const newTheme = result.theme === 'dark' ? THEME_MODES.DARK : THEME_MODES.LIGHT;
        wx.setStorageSync('current-effective-theme', newTheme);
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

  updateTheme();
  initThemeListener();

  const originalOnShow = pageInstance.onShow;
  pageInstance.onShow = function(...args) {
    updateTheme();
    if (originalOnShow) originalOnShow.apply(this, args);
  };

  pageInstance.setThemeMode = (mode) => {
    setStoredTheme(mode);
    updateTheme();
    updateNativeUI(getEffectiveTheme());
  };

  pageInstance.forceThemeUpdate = () => {
    const effectiveTheme = getEffectiveTheme();
    const themeClass = `theme-${effectiveTheme}`;
    pageInstance.setData({ themeClass });
  };

  pageInstance.onThemeChange = (theme) => {
    pageInstance.setData({ 
      currentTheme: theme,
      themeMode: getStoredTheme(),
      themeClass: `theme-${theme}`,
    });
    updateNativeUI(theme);
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
  updateNativeUI,
};