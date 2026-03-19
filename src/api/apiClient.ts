import type { AxiosInstance } from 'axios';
import axios from 'axios';
import errorHandler from '../utils/errorHandler.ts';
import { API_ENDPOINTS, PUBLIC_ENDPOINTS } from './apiEndpoints';
import { ROUTES } from '../constants/routes';

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
        ? localStorage.getItem('admin_access_token')
        : localStorage.getItem('access_token');
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

// 响应拦截器
  apiClient.interceptors.response.use(
    (response) => {
      return response.data;
    },
    async (error) => {
      console.log('API请求错误:', error);
      const originalRequest = error.config;

      // 处理401错误
      if (error.response?.status === 401) {
        console.log('收到401错误，开始处理');
        // 根据当前路径判断是前台还是后台
        const isAdminPath = window.location.pathname.startsWith('/admin');
        const tokenKey = isAdminPath ? 'admin_access_token' : 'access_token';
        const refreshTokenKey = isAdminPath ? 'admin_refresh_token' : 'refresh_token';
        const expiresAtKey = isAdminPath ? 'admin_access_token_expires_at' : 'access_token_expires_at';
        const rememberMeKey = isAdminPath ? 'admin_remember_me' : 'remember_me';

        console.log('当前路径:', window.location.pathname, 'isAdminPath:', isAdminPath);
        console.log('localStorage中的令牌:', {
          [tokenKey]: localStorage.getItem(tokenKey),
          [refreshTokenKey]: localStorage.getItem(refreshTokenKey)
        });

        // 检查是否是刷新令牌请求本身失败
        if (originalRequest.url === API_ENDPOINTS.COMMON.AUTH.TOKEN) {
          console.log('刷新令牌请求本身失败，清理本地存储');
          // 刷新令牌请求失败，清理本地存储
          localStorage.removeItem(tokenKey);
          localStorage.removeItem(refreshTokenKey);
          localStorage.removeItem(expiresAtKey);
          localStorage.removeItem(rememberMeKey);

          // 检查是否是公开端点
          const isPublicEndpoint = PUBLIC_ENDPOINTS.some(endpoint =>
            window.location.pathname.includes(endpoint)
          );

          if (!isPublicEndpoint) {
            // 非公开端点，跳转到登录页面
            errorHandler.handleAuthError('登录已过期，请重新登录', window.location.pathname);
            // 1秒后跳转到相应的登录页面
            setTimeout(() => {
              const currentPath = window.location.pathname;
              window.location.href = currentPath.startsWith('/admin') ? ROUTES.ADMIN_LOGIN : ROUTES.LOGIN;
            }, 1000);
          } else {
            // 公开端点，只显示错误信息，不跳转
            errorHandler.handleAuthError('登录已过期，但您仍可以浏览公开内容');
          }

          // 终止Promise链，避免无限循环
          return new Promise(() => {new Error('用户未登录');});
        }

        // 检查是否已经在处理刷新令牌
        if (!isRefreshing) {
          console.log('开始处理刷新令牌');
          isRefreshing = true;

          const refreshToken = localStorage.getItem(refreshTokenKey);
          console.log('获取到的refreshToken:', refreshToken);
          if (refreshToken) {
            try {
              console.log('发送刷新令牌请求');
              const response = await apiClient.post(API_ENDPOINTS.COMMON.AUTH.TOKEN, {
                grant_type: 'refresh_token',
                refresh_token: refreshToken,
                client_id: import.meta.env.VITE_CLIENT_ID,
                client_secret: import.meta.env.VITE_CLIENT_SECRET
              }) as {
                              access_token: string;
                              refresh_token: string;
                          };

              console.log('刷新令牌成功，响应:', response);
              localStorage.setItem(tokenKey, response.access_token);
              localStorage.setItem(refreshTokenKey, response.refresh_token);

              // 处理等待刷新令牌的请求队列
              refreshSubscribers.forEach(callback => callback(response.access_token));
              refreshSubscribers = [];

              originalRequest.headers.Authorization = `Bearer ${response.access_token}`;
              isRefreshing = false;
              return apiClient(originalRequest);
            } catch (refreshError: unknown) {
              console.log('刷新令牌失败:', refreshError);
              // 刷新令牌失败，清理本地存储
              localStorage.removeItem(tokenKey);
              localStorage.removeItem(refreshTokenKey);
              localStorage.removeItem(expiresAtKey);
              localStorage.removeItem(rememberMeKey);

              // 检查是否是公开端点
              const isPublicEndpoint = PUBLIC_ENDPOINTS.some(endpoint =>
                originalRequest.url.includes(endpoint)
              );

              if (!isPublicEndpoint) {
                // 非公开端点，跳转到登录页面
                if (refreshError instanceof Error) {
                  errorHandler.handleAuthError(refreshError.message, originalRequest.url);
                } else {
                  errorHandler.handleAuthError('登录已过期，请重新登录', originalRequest.url);
                }
                setTimeout(() => {
                  const currentPath = window.location.pathname;
                  window.location.href = currentPath.startsWith('/admin') ? ROUTES.ADMIN_LOGIN : ROUTES.LOGIN;
                }, 1000);
              } else {
                // 公开端点，只显示错误信息，不跳转
                if (refreshError instanceof Error) {
                  errorHandler.handleAuthError('登录已过期，但您仍可以浏览公开内容');
                } else {
                  errorHandler.handleAuthError('登录已过期，但您仍可以浏览公开内容');
                }
              }

              // 终止Promise链
              isRefreshing = false;
              refreshSubscribers = [];
              return new Promise(() => {new Error('用户未登录');});
            }
          } else {
            console.log('没有刷新令牌，清理本地存储');
            // 没有刷新令牌，清理本地存储
            localStorage.removeItem(tokenKey);
            localStorage.removeItem(refreshTokenKey);
            localStorage.removeItem(expiresAtKey);
            localStorage.removeItem(rememberMeKey);

            // 检查是否是公开端点
            const isPublicEndpoint = PUBLIC_ENDPOINTS.some((endpoint: string) =>
              originalRequest.url.includes(endpoint)
            );

            if (!isPublicEndpoint) {
              // 非公开端点，跳转到登录页面
              errorHandler.handleAuthError('登录状态无效，请重新登录', originalRequest.url);
              setTimeout(() => {
                const currentPath = window.location.pathname;
                window.location.href = currentPath.startsWith('/admin') ? ROUTES.ADMIN_LOGIN : ROUTES.LOGIN;
              }, 1000);

            } else {
              // 公开端点，只显示错误信息，不跳转
              errorHandler.handleAuthError('登录状态无效，但您仍可以浏览公开内容');
            }
            // 终止Promise链
            isRefreshing = false;
            return new Promise(() => {new Error('用户未登录');});
          }
        } else {
          console.log('已经在处理刷新令牌，将请求加入队列');
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
