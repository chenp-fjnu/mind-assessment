/**
 * HTTP 请求封装
 * 基于 uni.request，支持 baseURL、JWT Token 注入、超时 10s、统一错误处理
 */
import * as storage from './storage';

const DEFAULT_TIMEOUT = 10000;

let baseURL = '';

export function setBaseURL(url: string) {
  baseURL = url;
}

function request<T = any>(
  method: string,
  url: string,
  data?: any,
  customHeaders?: Record<string, string>
): Promise<T> {
  const fullURL = url.startsWith('http') ? url : `${baseURL}${url}`;
  const token = storage.get('token') || '';

  return new Promise((resolve, reject) => {
    uni.request({
      url: fullURL,
      method: method as any,
      data,
      timeout: DEFAULT_TIMEOUT,
      header: {
        'Content-Type': 'application/json',
        Authorization: token ? `Bearer ${token}` : '',
        ...customHeaders,
      },
      success: (res) => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(res.data as T);
        } else if (res.statusCode === 401) {
          storage.remove('token');
          uni.showToast({ title: '登录已过期', icon: 'none' });
          reject(new Error('Unauthorized'));
        } else {
          const msg = (res.data as any)?.message || `请求失败: ${res.statusCode}`;
          uni.showToast({ title: msg, icon: 'none' });
          reject(new Error(msg));
        }
      },
      fail: (err) => {
        uni.showToast({ title: '网络错误，请稍后再试', icon: 'none' });
        reject(err);
      },
    });
  });
}

export const http = {
  get<T = any>(url: string, params?: any, headers?: Record<string, string>): Promise<T> {
    let fullUrl = url;
    if (params) {
      const qs = Object.entries(params)
        .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
        .join('&');
      fullUrl += (url.includes('?') ? '&' : '?') + qs;
    }
    return request<T>('GET', fullUrl, undefined, headers);
  },

  post<T = any>(url: string, data?: any, headers?: Record<string, string>): Promise<T> {
    return request<T>('POST', url, data, headers);
  },

  put<T = any>(url: string, data?: any, headers?: Record<string, string>): Promise<T> {
    return request<T>('PUT', url, data, headers);
  },

  del<T = any>(url: string, data?: any, headers?: Record<string, string>): Promise<T> {
    return request<T>('DELETE', url, data, headers);
  },
};
