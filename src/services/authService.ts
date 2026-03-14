import apiClient from './apiClient';
import {API_ENDPOINTS} from './apiEndpoints';
import type {
  SendCodeResponse,
  RegisterParams,
  LoginParams,
  TokenResponse,
  ApiResponse,
  UserInfo,
} from '../types/auth';
import {AuthOperationTypeEnum} from "../types/enums/AuthOperationTypeEnum.ts";

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
    return apiClient.post(API_ENDPOINTS.FRONT.AUTH.SEND_CODE, params);
  },

  /**
   * 用户注册
   */
  register: async (params: RegisterParams): Promise<ApiResponse<TokenResponse>> => {
    const authParams = {
      operationType: AuthOperationTypeEnum.REGISTER,
      account: params.account,
      authType: params.authType,
      password: params.password || '',
      code: params.code || '',
      agreeTerms: params.agreeTerms,
      clientId: import.meta.env.VITE_CLIENT_ID,
      clientSecret: import.meta.env.VITE_CLIENT_SECRET,
      scope: 'read write',
    };

    return apiClient.post(API_ENDPOINTS.FRONT.AUTH.REGISTER, authParams);
  },

  /**
   * 用户登录
   */
  login: async (params: LoginParams): Promise<ApiResponse<TokenResponse>> => {
    const authParams = {
      operationType: AuthOperationTypeEnum.LOGIN,
      account: params.account,
      authType: params.authType,
      password: params.password || '',
      code: params.code || '',
      clientId: import.meta.env.VITE_CLIENT_ID,
      clientSecret: import.meta.env.VITE_CLIENT_SECRET,
      scope: 'read write',
    };
    console.log("authParams", authParams)

    return apiClient.post(API_ENDPOINTS.FRONT.AUTH.LOGIN, authParams);
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

    return apiClient.post(API_ENDPOINTS.COMMON.AUTH.REFRESH_TOKEN, oauthParams);
  },

  /**
   * 获取个人资料
   */
  getProfile: async (): Promise<ApiResponse<UserInfo>> => {
    return apiClient.get(API_ENDPOINTS.FRONT.USER.PROFILE);
  },

  /**
   * 更新个人资料
   */
  updateProfile: async (params: Partial<UserInfo>): Promise<ApiResponse<UserInfo>> => {
    return apiClient.put(API_ENDPOINTS.FRONT.USER.PROFILE, params);
  },

  /**
   * 上传头像
   */
  uploadAvatar: async (file: File, expiry?: number): Promise<ApiResponse<string>> => {
    const formData = new FormData();
    formData.append('avatar', file as File);
    if (expiry) {
      formData.append('expiry', expiry.toString());
    }

    return await apiClient.post(API_ENDPOINTS.COMMON.UPLOAD.AVATAR, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },

  /**
   * 上传封面图
   */
  uploadCoverImage: async (file: File, expiry?: number): Promise<ApiResponse<string>> => {
    const formData = new FormData();
    formData.append('image', file as File);
    if (expiry) {
      formData.append('expiry', expiry.toString());
    }

    return await apiClient.post(API_ENDPOINTS.COMMON.UPLOAD.COVER, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },
};

export default authService;