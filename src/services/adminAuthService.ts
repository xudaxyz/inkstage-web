import { API_ENDPOINTS, apiClient } from '../api';
import type { TokenResponse, UserInfo } from '../types/auth';
import type { ApiResponse } from '../types/common';
import type { AuthTypeEnum } from '../types/enums'; // 参数验证函数
// 参数验证函数
const validateAccount = (account: string): boolean => {
  if (!account || account.trim().length === 0) {
    throw new Error('账号不能为空');
  }
  return true;
};

const validatePassword = (password: string): boolean => {
  if (!password || password.length < 6) {
    throw new Error('密码长度不能少于6位');
  }
  if (password.length > 20) {
    throw new Error('密码长度不能超过20位');
  }
  return true;
};

const validateLoginParams = (params: { account: string; password: string; remember?: boolean }): boolean => {
  if (!params || typeof params !== 'object') {
    throw new Error('参数必须是对象');
  }
  validateAccount(params.account);
  validatePassword(params.password);
  return true;
};

const validateRefreshTokenParams = (refreshToken: string): boolean => {
  if (!refreshToken) {
    throw new Error('刷新令牌不能为空');
  }
  return true;
};

/**
 * 管理员认证服务
 */
const adminAuthService = {
  /**
   * 管理员登录
   */
  adminLogin: async (params: {
    account: string;
    password: string;
    authType: AuthTypeEnum;
    remember?: boolean;
  }): Promise<ApiResponse<TokenResponse>> => {
    validateLoginParams(params);
    const authParams = {
      account: params.account,
      password: params.password,
      authType: params.authType,
      rememberMe: params.remember || false,
      clientId: import.meta.env.VITE_CLIENT_ID,
      clientSecret: import.meta.env.VITE_CLIENT_SECRET
    };

    return apiClient.post(API_ENDPOINTS.ADMIN.AUTH.LOGIN, authParams);
  },

  /**
   * 刷新令牌
   */
  refreshToken: async (refreshToken: string): Promise<ApiResponse<TokenResponse>> => {
    validateRefreshTokenParams(refreshToken);
    return await apiClient.post(API_ENDPOINTS.ADMIN.AUTH.REFRESH_TOKEN, null, { params: { refreshToken } });
  },

  /**
   * 获取管理员个人资料
   */
  getProfile: async (): Promise<ApiResponse<UserInfo>> => {
    return apiClient.get(API_ENDPOINTS.ADMIN.USER.PROFILE);
  }
};

export default adminAuthService;
