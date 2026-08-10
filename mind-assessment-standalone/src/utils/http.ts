/**
 * HTTP 请求封装 - 纯本地模式（无后端）
 * 所有方法返回空数据或 reject，不会发起网络请求
 */

export function setBaseURL(_url: string) {
  // no-op
}

export const http = {
  get<T = any>(_url: string): Promise<T> {
    return Promise.reject(new Error('离线模式，不支持网络请求'));
  },
  post<T = any>(_url: string): Promise<T> {
    return Promise.reject(new Error('离线模式，不支持网络请求'));
  },
  put<T = any>(_url: string): Promise<T> {
    return Promise.reject(new Error('离线模式，不支持网络请求'));
  },
  del<T = any>(_url: string): Promise<T> {
    return Promise.reject(new Error('离线模式，不支持网络请求'));
  },
};
