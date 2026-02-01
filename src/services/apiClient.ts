import axios from 'axios';
import type {AxiosInstance} from 'axios';
import errorHandler from './errorHandler';
import {API_ENDPOINTS, PUBLIC_ENDPOINTS} from './apiEndpoints';

// 创建axios实例
const apiClient: AxiosInstance = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// 防重入标志
let isRefreshing = false;
// 存储等待刷新令牌的请求队列
let refreshSubscribers: ((token: string) => void)[] = [];

// 请求拦截器
apiClient.interceptors.request.use(
    (config) => {
        // 对于刷新令牌端点，不添加访问令牌，因为这是用于刷新令牌的公开端点
        if (config.url !== API_ENDPOINTS.AUTH.TOKEN) {
            const token = localStorage.getItem('access_token');
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
        const originalRequest = error.config;

        // 处理401错误
        if (error.response?.status === 401) {
            // 检查是否是刷新令牌请求本身失败
            if (originalRequest.url === API_ENDPOINTS.AUTH.TOKEN) {
                // 刷新令牌请求失败，清理本地存储并跳转到登录页面
                localStorage.removeItem('access_token');
                localStorage.removeItem('refresh_token');
                errorHandler.handleAuthError('登录已过期，请重新登录');
                // 1秒后跳转到登录页面
                setTimeout(() => {
                    window.location.href = '/login';
                }, 1000);
                // 终止Promise链，避免无限循环
                return new Promise(() => {new Error("用户未登录")});
            }

            // 检查是否已经在处理刷新令牌
            if (!isRefreshing) {
                isRefreshing = true;

                const refreshToken = localStorage.getItem('refresh_token');
                if (refreshToken) {
                    try {
                        const response = await apiClient.post(API_ENDPOINTS.AUTH.TOKEN, {
                            grant_type: 'refresh_token',
                            refresh_token: refreshToken,
                            client_id: import.meta.env.VITE_CLIENT_ID,
                            client_secret: import.meta.env.VITE_CLIENT_SECRET,
                        }) as {
                            access_token: string;
                            refresh_token: string;
                        };

                        localStorage.setItem('access_token', response.access_token);
                        localStorage.setItem('refresh_token', response.refresh_token);

                        // 处理等待刷新令牌的请求队列
                        refreshSubscribers.forEach(callback => callback(response.access_token));
                        refreshSubscribers = [];

                        originalRequest.headers.Authorization = `Bearer ${response.access_token}`;
                        isRefreshing = false;
                        return apiClient(originalRequest);
                    } catch (refreshError: unknown) {
                        // 刷新令牌失败，清理本地存储并跳转到登录页面
                        localStorage.removeItem('access_token');
                        localStorage.removeItem('refresh_token');
                        if (refreshError instanceof Error) {
                            errorHandler.handleAuthError(refreshError.message);
                        } else {
                            errorHandler.handleAuthError('登录已过期，请重新登录');
                        }
                        // 检查是否是公开端点
                        const isPublicEndpoint = PUBLIC_ENDPOINTS.some(endpoint =>
                            originalRequest.url.includes(endpoint)
                        );

                        if (!isPublicEndpoint) {
                            // 非公开端点，跳转到登录页面
                            setTimeout(() => {
                                window.location.href = '/login';
                            }, 1000);
                        }

                        // 终止Promise链
                        isRefreshing = false;
                        refreshSubscribers = [];
                        return new Promise(() => {new Error("用户未登录")});
                    }
                } else {
                    // 没有刷新令牌，清理本地存储并判断跳转到首页还是登录页面
                    localStorage.removeItem('access_token');
                    localStorage.removeItem('refresh_token');

                    // 检查是否是公开端点
                    const isPublicEndpoint = PUBLIC_ENDPOINTS.some((endpoint: string) =>
                        originalRequest.url.includes(endpoint)
                    );

                    if (!isPublicEndpoint) {
                        // 非公开端点，跳转到登录页面
                        errorHandler.handleAuthError('登录状态无效，请重新登录');
                        setTimeout(() => {
                            window.location.href = '/login';
                        }, 1000);

                    }
                    // 终止Promise链
                    isRefreshing = false;
                    return new Promise(() => {new Error("用户未登录")});
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