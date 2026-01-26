import apiClient from './apiClient';
import type {
  SendCodeParams,
  SendCodeResponse,
  RegisterParams,
  TokenResponse,
  ApiResponse,
} from '../types/auth';

/**
 * 认证服务
 */
const authService = {
  /**
   * 发送验证码
   */
  sendCode: async (params: SendCodeParams): Promise<ApiResponse<SendCodeResponse>> => {
    return apiClient.post('/v1/front/auth/send-code', params);
  },

  /**
   * 用户注册
   */
  register: async (params: RegisterParams): Promise<ApiResponse<TokenResponse>> => {
    // 构造符合OAuth2规范的请求
    const oauthParams = {
      grant_type: 'password',
      username: params.account,
      password: params.password || '',
      client_id: import.meta.env.VITE_CLIENT_ID,
      client_secret: import.meta.env.VITE_CLIENT_SECRET,
      scope: 'read write',
      register_type: params.registerType,
      agree_terms: params.agreeTerms,
    };

    // 验证码注册时，将code作为password传递（后端处理逻辑）
    if (params.registerType === 'code' && params.code) {
      oauthParams.password = params.code;
    }

    return apiClient.post('/api/v1/front/auth/register', oauthParams);
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

    return apiClient.post('/v1/front/auth/token', oauthParams);
  },
};

export default authService;