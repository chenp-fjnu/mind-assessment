/**
 * 跨平台存储封装
 * MP 使用 uni.getStorageSync，H5 使用 localStorage
 */

export function get(key: string): any {
  // #ifdef MP-WEIXIN
  try {
    return uni.getStorageSync(key);
  } catch (e) {
    return null;
  }
  // #endif

  // #ifdef H5
  try {
    const val = localStorage.getItem(key);
    if (val === null) return null;
    try {
      return JSON.parse(val as string);
    } catch {
      return val;
    }
  } catch (e) {
    return null;
  }
  // #endif
}

export function set(key: string, value: any): void {
  // #ifdef MP-WEIXIN
  try {
    uni.setStorageSync(key, value);
  } catch (e) {
    console.error('storage set error', e);
  }
  // #endif

  // #ifdef H5
  try {
    if (typeof value === 'object') {
      localStorage.setItem(key, JSON.stringify(value));
    } else {
      localStorage.setItem(key, String(value));
    }
  } catch (e) {
    console.error('storage set error', e);
  }
  // #endif
}

export function remove(key: string): void {
  // #ifdef MP-WEIXIN
  try {
    uni.removeStorageSync(key);
  } catch (e) {
    console.error('storage remove error', e);
  }
  // #endif

  // #ifdef H5
  try {
    localStorage.removeItem(key);
  } catch (e) {
    console.error('storage remove error', e);
  }
  // #endif
}

export function clear(): void {
  // #ifdef MP-WEIXIN
  try {
    uni.clearStorageSync();
  } catch (e) {
    console.error('storage clear error', e);
  }
  // #endif

  // #ifdef H5
  try {
    localStorage.clear();
  } catch (e) {
    console.error('storage clear error', e);
  }
  // #endif
}
