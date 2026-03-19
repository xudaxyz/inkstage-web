import { apiClient, API_ENDPOINTS } from '../api';
import type {
  SendCodeResponse,
  RegisterParams,
  LoginParams,
  TokenResponse,
  UserInfo
} from '../types/auth';
import type { ApiResponse } from '../types/common';
import { AuthOperationTypeEnum } from '../types/enums/AuthOperationTypeEnum.ts';

// 参数验证函数
const validateAccount = (account: string, authType?: 'password' | 'code'): boolean => {
  if (!account || account.trim().length === 0) {
    throw new Error('账号不能为空');
  }
  // 邮箱或手机号验证
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const phoneRegex = /^1[3-9]\d{9}$/;
  if (authType === 'code' && !emailRegex.test(account) && !phoneRegex.test(account)) {
    throw new Error('请输入有效的邮箱或手机号');
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

const validateSendCodeParams = (params: {
  account: string;
  type: 'email' | 'phone';
  purpose: string
}): boolean => {
  if (!params || typeof params !== 'object') {
    throw new Error('参数必须是对象');
  }
  if (params.type === 'email' || params.type === 'phone') {
    validateAccount(params.account);
  }
  if (!params.purpose) {
    throw new Error('用途不能为空');
  }
  return true;
};

const validateLoginParams = (params: LoginParams): boolean => {
  if (!params || typeof params !== 'object') {
    throw new Error('参数必须是对象');
  }
  if (params.authType === 'code') {
    validateAccount(params.account);
  }
  if (!params.authType || !['password', 'code'].includes(params.authType)) {
    throw new Error('认证类型必须是password或code');
  }
  if (params.authType === 'password' && !params.password) {
    throw new Error('密码不能为空');
  }
  if (params.authType === 'password') {
    if (!params.password) {
      throw new Error('密码不能为空');
    }
    validatePassword(params.password);
  }
  if (params.authType === 'code' && !params.code) {
    throw new Error('验证码不能为空');
  }
  return true;
};

const validateRegisterParams = (params: RegisterParams): boolean => {
    console.log('params', params);
  if (!params || typeof params !== 'object') {
    throw new Error('参数必须是对象');
  }
  validateAccount(params.account);
  if (!params.authType || !['password', 'code'].includes(params.authType)) {
    throw new Error('认证类型必须是password或code');
  }
  if (params.authType === 'password') {
    if (!params.password) {
      throw new Error('密码不能为空');
    }
    validatePassword(params.password);
    if (!params.confirmPassword) {
      throw new Error('确认密码不能为空');
    }
    if (params.password !== params.confirmPassword) {
      throw new Error('两次输入的密码不一致');
    }
  }
  if (params.authType === 'code' && !params.code) {
    throw new Error('验证码不能为空');
  }
  if (!params.agreeTerms) {
    throw new Error('请同意用户协议');
  }
  return true;
};

const validateRefreshTokenParams = ( refresh_token: string ): boolean => {
  if (!refresh_token) {
    throw new Error('刷新令牌不能为空');
  }
  return true;
};

const validateUserInfoParams = (params: Partial<UserInfo>): boolean => {
  if (!params || typeof params !== 'object') {
    throw new Error('参数必须是对象');
  }
  if (params.email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(params.email)) {
      throw new Error('请输入有效的邮箱');
    }
  }
  if (params.nickname && params.nickname.length > 20) {
    throw new Error('昵称长度不能超过20个字符');
  }
  if (params.signature && params.signature.length > 100) {
    throw new Error('签名长度不能超过100个字符');
  }
  return true;
};

const validateFile = (file: File): boolean => {
  if (!file) {
    throw new Error('文件不能为空');
  }
  if (file.size > 5 * 1024 * 1024) {
    throw new Error('文件大小不能超过5MB');
  }
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
  if (!allowedTypes.includes(file.type)) {
    throw new Error('只支持JPG、PNG、GIF格式的图片');
  }
  return true;
};

const validateUploadFileParams = (file: File, expiry?: number): boolean => {
  validateFile(file);
  if (expiry &&  expiry < 0) {
    throw new Error('过期时间必须是大于等于0的数字');
  }
  return true;
};

/**
 * 认证服务
 */
const authService = {
  /**
   * 发送验证码
   */
  sendCode: async (params: {
      account: string;
      type: 'email' | 'phone';
      purpose: string
  }): Promise<ApiResponse<SendCodeResponse>> => {
    validateSendCodeParams(params);
    return apiClient.post(API_ENDPOINTS.FRONT.AUTH.SEND_CODE, params);
  },

  /**
   * 用户注册
   */
  register: async (params: RegisterParams): Promise<ApiResponse<TokenResponse>> => {
    validateRegisterParams(params);
    const authParams = {
      operationType: AuthOperationTypeEnum.REGISTER,
      account: params.account,
      authType: params.authType,
      password: params.password || '',
      code: params.code || '',
      agreeTerms: params.agreeTerms,
      clientId: import.meta.env.VITE_CLIENT_ID,
      clientSecret: import.meta.env.VITE_CLIENT_SECRET,
      scope: 'read write'
    };

    return apiClient.post(API_ENDPOINTS.FRONT.AUTH.REGISTER, authParams);
  },

  /**
   * 用户登录
   */
  login: async (params: LoginParams): Promise<ApiResponse<TokenResponse>> => {
    validateLoginParams(params);
    const authParams = {
      operationType: AuthOperationTypeEnum.LOGIN,
      account: params.account,
      authType: params.authType,
      password: params.password || '',
      code: params.code || '',
      clientId: import.meta.env.VITE_CLIENT_ID,
      clientSecret: import.meta.env.VITE_CLIENT_SECRET,
      scope: 'read write',
      rememberMe: params.remember || false
    };

    return apiClient.post(API_ENDPOINTS.FRONT.AUTH.LOGIN, authParams);
  },

  /**
     * 刷新令牌
     */
    refreshToken: async (refreshToken: string ): Promise<ApiResponse<TokenResponse>> => {
        console.log('开始刷新令牌，参数:', refreshToken);
        validateRefreshTokenParams(refreshToken);
        console.log('发送刷新令牌请求，URL:', '/front/auth/refresh-token');
        return await apiClient.post('/front/auth/refresh-token', null, { params: { refreshToken } });
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
    validateUserInfoParams(params);
    return apiClient.put(API_ENDPOINTS.FRONT.USER.PROFILE, params);
  },

  /**
   * 上传头像
   */
  uploadAvatar: async (file: File, expiry?: number): Promise<ApiResponse<string>> => {
    validateUploadFileParams(file, expiry);
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
    validateUploadFileParams(file, expiry);
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
  }
};

export default authService;
