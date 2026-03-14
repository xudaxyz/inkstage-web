import { GenderEnum } from './enums';

// 验证码请求参数
export interface SendCodeParams {
    account: string; // 邮箱或手机号
    type: 'email' | 'phone';
    purpose: 'register';
}

// 验证码响应
export interface SendCodeResponse {
    expireTime: number; // 有效期（秒）
}

// 登录请求参数
export interface LoginParams {
    account: string;
    authType: 'password' | 'code'; // 密码登录或验证码登录
    password?: string;
    code?: string;
    remember?: boolean;
}

// 注册请求参数
export interface RegisterParams {
    account: string;
    authType: 'password' | 'code'; // 密码登录或验证码登录
    password?: string;
    confirmPassword?: string;
    code?: string;
    agreeTerms: boolean;
}

// 刷新令牌请求参数
export interface RefreshTokenParams {
    refresh_token: string;
}

// 用户信息响应
export interface UserInfo {
    id: number;
    name: string;
    email: string;
    avatar?: string;
    nickname: string,
    coverImage: string,
    signature: string,
    gender: GenderEnum | undefined,
    birthDate: string,
    location: string,
    role?: string;
}

// 文件上传参数
export interface UploadFileParams {
    file: File;
    expiry?: number;
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
