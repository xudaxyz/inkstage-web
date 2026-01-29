import axios from 'axios';
import type {AxiosInstance} from 'axios';
import errorHandler from './errorHandler';

// 创建axios实例
const apiClient: AxiosInstance = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// 请求拦截器
apiClient.interceptors.request.use(
    (config) => {
        // 对于 /auth/token 端点，不添加访问令牌，因为这是用于刷新令牌的公开端点
        if (config.url !== '/auth/token') {
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
        // 处理401错误，刷新令牌
        const originalRequest = error.config;
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            const refreshToken = localStorage.getItem('refresh_token');
            if (refreshToken) {
                try {
                    const response = await apiClient.post('/auth/token', {
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

                    originalRequest.headers.Authorization = `Bearer ${response.access_token}`;
                    return apiClient(originalRequest);
                } catch (refreshError: unknown) {
                    if (refreshError instanceof Error) {
                        errorHandler.handleAuthError(refreshError.message);
                    } else {
                        // 刷新令牌失败，使用全局错误处理
                        errorHandler.handleAuthError('登录已过期，请重新登录');
                    }
                    // 不再返回错误，避免重复处理
                    return new Promise(() => {});
                }
            } else {
                // 没有刷新令牌，使用全局错误处理
                errorHandler.handleAuthError('登录状态无效，请重新登录');
                // 不再返回错误，避免重复处理
                return new Promise(() => {});
            }
        }

        // 处理其他错误，使用全局错误处理服务
        const errorMessage = error.response?.data?.message || error.message || '网络请求失败';
        errorHandler.handleApiError(errorMessage);
        return Promise.reject(new Error(errorMessage));
    }
);

export default apiClient;