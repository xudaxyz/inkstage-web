import type { AxiosInstance } from 'axios';
import axios from 'axios';
import errorHandler from '../utils/errorHandler.ts';
import { API_ENDPOINTS } from './apiEndpoints';
import { ROUTES, isPublicPage, isAdminPage } from '../constants/navigation';
import { userStore } from '../store/userStore';
import { adminStore } from '../store/adminStore';
import TokenService from '../services/tokenService';
import { SECURE_STORAGE_KEYS, PUBLIC_ENDPOINTS } from '../constants/security';
import type { UserInfo } from '../types/auth';

// 创建axios实例
const apiClient: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// 防重入标志
let isRefreshing = false;
// 存储等待刷新令牌的请求队列
let refreshSubscribers: ((token: string) => void)[] = [];

// 请求拦截器
apiClient.interceptors.request.use(
  (config) => {
    // 对于刷新令牌端点，不添加访问令牌，因为这是用于刷新令牌的公开端点
    if (config.url !== API_ENDPOINTS.COMMON.AUTH.TOKEN) {
      // 根据当前路径选择使用前台还是后台令牌
      const isAdminPath = window.location.pathname.startsWith('/admin');
      const token = isAdminPath
        ? TokenService.getToken(SECURE_STORAGE_KEYS.ADMIN_ACCESS_TOKEN)
        : TokenService.getToken(SECURE_STORAGE_KEYS.ACCESS_TOKEN);
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 检查是否是公开端点的辅助函数
const isPublicEndpoint = (url: string): boolean => {
  // 提取实际的API路径
  let actualPath = url;

  // 移除完整URL中的域名部分（如果有）
  const urlRegex = /^https?:\/\/[^\\/]+(\/.*)$/;
  const match = actualPath.match(urlRegex);
  if (match) {
    actualPath = match[1];
  }

  // 移除baseURL前缀（如果有）
  const baseUrl = import.meta.env.VITE_API_BASE_URL || '/api';
  if (actualPath.startsWith(baseUrl)) {
    actualPath = actualPath.replace(baseUrl, '');
  }

  // 确保路径以 '/' 开头
  if (!actualPath.startsWith('/')) {
    actualPath = '/' + actualPath;
  }

  // 后台登录和刷新令牌接口是公开的
  if (actualPath === API_ENDPOINTS.ADMIN.AUTH.LOGIN || actualPath === API_ENDPOINTS.ADMIN.AUTH.REFRESH_TOKEN) {
    return true;
  }

  // 后台其他接口默认是非公开的
  if (actualPath.startsWith('/admin') || actualPath.includes('/admin/')) {
    return false;
  }

  // 检查是否在公开端点列表中
  const isPublic = PUBLIC_ENDPOINTS.some(endpoint => {
    // 如果是字符串，直接检查包含关系
    return actualPath.startsWith(endpoint);
  });

  console.log('检查公开端点:', { url, actualPath, isPublic });
  return isPublic;
};


// 响应拦截器
apiClient.interceptors.response.use(
  (response) => {
    return response.data;
  },
  async (error) => {
    const originalRequest = error.config;

    // 处理401错误
    if (error.response?.status === 401) {
      // 根据当前路径判断是前台还是后台
      const isAdminPath = isAdminPage(window.location.pathname);
      const tokenKey = isAdminPath ? SECURE_STORAGE_KEYS.ADMIN_ACCESS_TOKEN : SECURE_STORAGE_KEYS.ACCESS_TOKEN;
      const refreshTokenKey = isAdminPath ? SECURE_STORAGE_KEYS.ADMIN_REFRESH_TOKEN : SECURE_STORAGE_KEYS.REFRESH_TOKEN;
      const refreshTokenEndpoint = isAdminPath ? API_ENDPOINTS.ADMIN.AUTH.REFRESH_TOKEN : API_ENDPOINTS.COMMON.AUTH.TOKEN;

      // 检查是否是刷新令牌请求本身失败
      if (originalRequest.url === refreshTokenEndpoint) {
        // 刷新令牌请求失败，清理用户状态
        if (isAdminPath) {
          adminStore.getState().logout();
        } else {
          userStore.getState().logout();
        }

        // 对于刷新令牌请求失败，我们应该检查当前页面是否是公开页面
        // 因为刷新令牌请求是由其他API请求触发的，我们无法直接获取原始API请求的URL
        const currentPath = window.location.pathname;
        const isCurrentPagePublic = isPublicPage(currentPath);


        if (!isCurrentPagePublic) {
          // 非公开页面，跳转到登录页面
          errorHandler.handleAuthError('登录已过期，请重新登录', currentPath);
          // 1秒后跳转到相应的登录页面
          setTimeout(() => {
            window.location.href = isAdminPath ? ROUTES.ADMIN_LOGIN : ROUTES.LOGIN;
          }, 1000);
        } else {
          // 公开页面，只显示错误信息，不跳转
          errorHandler.handleAuthError('登录已过期，但您仍可以浏览公开内容');
        }

        // 终止Promise链，避免无限循环
        return Promise.reject(new Error('用户未登录'));
      }

      // 检查请求的API是否是公开端点
      const apiUrl = originalRequest.url;
      const isPublicApi = isPublicEndpoint(apiUrl);


      // 如果是公开API，直接返回错误，不进行令牌刷新
      if (isPublicApi) {
        errorHandler.handleAuthError('登录状态无效，但您仍可以浏览公开内容');
        return Promise.reject(new Error('用户未登录'));
      }

      // 检查是否已经在处理刷新令牌
      if (!isRefreshing) {
        isRefreshing = true;

        const refreshToken = TokenService.getToken(refreshTokenKey);
        if (refreshToken) {
          try {
            const response = await apiClient.post(refreshTokenEndpoint, null, { params: { refreshToken } }) as {
                            code: number;
                            message: string;
                            data: {
                                access_token: string;
                                refresh_token: string;
                                userInfo: UserInfo;
                            };
                        };

            if (response.code === 200) {
                TokenService.setToken(tokenKey, response.data.access_token);
                TokenService.setToken(refreshTokenKey, response.data.refresh_token);

                // 处理等待刷新令牌的请求队列
                refreshSubscribers.forEach(callback => callback(response.data.access_token));
                refreshSubscribers = [];

                originalRequest.headers.Authorization = `Bearer ${response.data.access_token}`;
                isRefreshing = false;
                return apiClient(originalRequest);
            } else {
                new Error(response.message || '刷新令牌失败');
            }
          } catch (refreshError: unknown) {
            // 刷新令牌失败，清理用户状态
            if (isAdminPath) {
              adminStore.getState().logout();
            } else {
              userStore.getState().logout();
            }

            // 非公开API，跳转到登录页面
            if (refreshError instanceof Error) {
              errorHandler.handleAuthError(refreshError.message, apiUrl);
            } else {
              errorHandler.handleAuthError('登录已过期，请重新登录', apiUrl);
            }
            setTimeout(() => {
              window.location.href = isAdminPath ? ROUTES.ADMIN_LOGIN : ROUTES.LOGIN;
            }, 1000);

            // 终止Promise链
            isRefreshing = false;
            refreshSubscribers = [];
            return Promise.reject(new Error('用户未登录'));
          }
        } else {
          // 没有刷新令牌，清理用户状态
          if (isAdminPath) {
            adminStore.getState().logout();
          } else {
            userStore.getState().logout();
          }

          // 非公开API，跳转到登录页面
          errorHandler.handleAuthError('登录状态无效，请重新登录', apiUrl);
          setTimeout(() => {
            window.location.href = isAdminPath ? ROUTES.ADMIN_LOGIN : ROUTES.LOGIN;
          }, 1000);
          // 终止Promise链
          isRefreshing = false;
          return Promise.reject(new Error('用户未登录'));
        }
      } else {
        // 已经在处理刷新令牌，将当前请求加入队列
        return new Promise((resolve) => {
          refreshSubscribers.push((token: string) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            resolve(apiClient(originalRequest));
          });
        });
      }
    }

    // 处理其他错误，使用全局错误处理服务
    const errorMessage = error.response?.data?.message || error.message || '网络请求失败';
    errorHandler.handleApiError(errorMessage);
    return Promise.reject(new Error(errorMessage));
  }
);

export default apiClient;
