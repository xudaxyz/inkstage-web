// API响应基础类型
export interface ApiResponse<T = any> {
  code: number;
  message: string;
  data: T;
}

// 验证码请求参数
export interface SendCodeParams {
  target: string; // 邮箱或手机号
  type: 'email' | 'phone';
  purpose: 'register';
}

// 验证码响应
export interface SendCodeResponse {
  expireTime: number; // 有效期（秒）
}

// 注册请求参数
export interface RegisterParams {
  account: string;
  password?: string;
  confirmPassword?: string;
  code?: string;
  agreeTerms: boolean;
  registerType: 'password' | 'code';
}

// 刷新令牌请求参数
export interface RefreshTokenParams {
  refresh_token: string;
}

// 用户信息响应
export interface UserInfo {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

// OAuth2令牌响应
export interface TokenResponse {
  access_token: string;
  token_type: string;
  refresh_token: string;
  expires_in: number;
  scope: string;
  userInfo: UserInfo;
}