import type { AxiosInstance } from 'axios';
import axios from 'axios';
import errorHandler from '../utils/errorHandler.ts';
import { API_ENDPOINTS, PUBLIC_ENDPOINTS } from './apiEndpoints';
import { ROUTES, isPublicPage, isAdminPage } from '../constants/navigation';
import { userStore } from '../store/userStore';

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

  // 后台接口默认是非公开的
  if (actualPath.startsWith('/admin') || actualPath.includes('/admin/')) {
    return false;
  }

  // 检查是否在公开端点列表中
  const isPublic = PUBLIC_ENDPOINTS.some(endpoint => {
    // 如果是字符串，直接检查包含关系
    if (typeof endpoint === 'string') {
      return actualPath.startsWith(endpoint);
    }
    return false;
  });

  console.log('检查公开端点:', { url, actualPath, isPublic });
  return isPublic;
};


// 响应拦截器
apiClient.interceptors.response.use(
  (response) => {
    console.log('API请求成功:', { url: response.config.url, status: response.status });
    return response.data;
  },
  async (error) => {
    console.log('API请求错误:', { error, url: error.config?.url, status: error.response?.status });
    const originalRequest = error.config;

    // 处理401错误
    if (error.response?.status === 401) {
      console.log('收到401错误，开始处理');
      // 根据当前路径判断是前台还是后台
      const isAdminPath = isAdminPage(window.location.pathname);
      const tokenKey = isAdminPath ? 'admin_access_token' : 'access_token';
      const refreshTokenKey = isAdminPath ? 'admin_refresh_token' : 'refresh_token';

      console.log('当前路径:', window.location.pathname, 'isAdminPath:', isAdminPath);
      console.log('localStorage中的令牌:', {
        [tokenKey]: localStorage.getItem(tokenKey),
        [refreshTokenKey]: localStorage.getItem(refreshTokenKey)
      });

      // 检查是否是刷新令牌请求本身失败
      if (originalRequest.url === API_ENDPOINTS.COMMON.AUTH.TOKEN) {
        console.log('刷新令牌请求本身失败，清理本地存储');
        // 刷新令牌请求失败，清理用户状态
        userStore.getState().logout(isAdminPath);

        // 对于刷新令牌请求失败，我们应该检查当前页面是否是公开页面
        // 因为刷新令牌请求是由其他API请求触发的，我们无法直接获取原始API请求的URL
        const currentPath = window.location.pathname;
        const isCurrentPagePublic = isPublicPage(currentPath);

        console.log('检查当前页面是否公开:', { currentPath, isCurrentPagePublic });

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

      console.log('检查请求API是否公开:', { apiUrl, isPublicApi });

      // 如果是公开API，直接返回错误，不进行令牌刷新
      if (isPublicApi) {
        console.log('公开API，直接返回错误');
        errorHandler.handleAuthError('登录状态无效，但您仍可以浏览公开内容');
        return Promise.reject(new Error('用户未登录'));
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
            // 刷新令牌失败，清理用户状态
            userStore.getState().logout(isAdminPath);

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
          console.log('没有刷新令牌，清理本地存储');
          // 没有刷新令牌，清理用户状态
          userStore.getState().logout(isAdminPath);

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
