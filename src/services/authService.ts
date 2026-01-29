import apiClient from './apiClient';
import type {
  SendCodeResponse,
  RegisterParams,
  LoginParams,
  TokenResponse,
  ApiResponse,
  UserInfo,
} from '../types/auth';

/**
 * 认证服务
 */
const authService = {
  /**
   * 发送验证码
   */
  sendCode: async (params: {
      account: string;
      type: "email" | "phone";
      purpose: string
  }): Promise<ApiResponse<SendCodeResponse>> => {
    return apiClient.post('/front/auth/send-code', params);
  },

  /**
   * 用户注册
   */
  register: async (params: RegisterParams): Promise<ApiResponse<TokenResponse>> => {
    const authParams = {
      operationType: 'REGISTER',
      account: params.account,
      authType: params.authType,
      password: params.password || '',
      code: params.code || '',
      agreeTerms: params.agreeTerms,
      clientId: import.meta.env.VITE_CLIENT_ID,
      clientSecret: import.meta.env.VITE_CLIENT_SECRET,
      scope: 'read write',
    };

    return apiClient.post('/front/auth/register', authParams);
  },

  /**
   * 用户登录
   */
  login: async (params: LoginParams): Promise<ApiResponse<TokenResponse>> => {
    const authParams = {
      operationType: 'LOGIN',
      account: params.account,
      authType: params.authType,
      password: params.password || '',
      code: params.code || '',
      clientId: import.meta.env.VITE_CLIENT_ID,
      clientSecret: import.meta.env.VITE_CLIENT_SECRET,
      scope: 'read write',
    };

    return apiClient.post('/front/auth/login', authParams);
  },

  /**
   * 刷新令牌
   */
  refreshToken: async (params: { refresh_token: string }): Promise<ApiResponse<TokenResponse>> => {
    const oauthParams = {
      grant_type: 'refresh_token',
      refresh_token: params.refresh_token,
      client_id: import.meta.env.VITE_CLIENT_ID,
      client_secret: import.meta.env.VITE_CLIENT_SECRET,
      scope: 'read write',
    };

    return apiClient.post('/auth/token', oauthParams);
  },

  /**
   * 获取个人资料
   */
  getProfile: async (): Promise<ApiResponse<UserInfo>> => {
    return apiClient.get('/front/user/profile');
  },

  /**
   * 更新个人资料
   */
  updateProfile: async (params: Partial<UserInfo>): Promise<ApiResponse<UserInfo>> => {
    return apiClient.put('/front/user/profile', params);
  },
};

export default authService;