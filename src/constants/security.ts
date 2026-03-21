/**
 * 安全相关常量
 */

// 存储键
export const SECURE_STORAGE_KEYS = {
  // 前台用户
  ACCESS_TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
  ACCESS_TOKEN_EXPIRES_AT: 'access_token_expires_at',
  REMEMBER_ME: 'remember_me',

  // 后台用户
  ADMIN_ACCESS_TOKEN: 'admin_access_token',
  ADMIN_REFRESH_TOKEN: 'admin_refresh_token',
  ADMIN_ACCESS_TOKEN_EXPIRES_AT: 'admin_access_token_expires_at',
  ADMIN_REMEMBER_ME: 'admin_remember_me',

  // 第三方登录状态
  OAUTH_STATE: 'oauth_state',
  OAUTH_REDIRECT_URI: 'oauth_redirect_uri'
};

// 认证错误码
export const AUTH_ERROR_CODES = {
  TOKEN_EXPIRED: 401,
  TOKEN_INVALID: 401,
  PERMISSION_DENIED: 403,
  USER_NOT_FOUND: 404,
  INVALID_CREDENTIALS: 401,
  ACCOUNT_LOCKED: 423,
  ACCOUNT_DISABLED: 403
};

// 令牌过期时间（秒）
export const TOKEN_EXPIRY = {
  ACCESS_TOKEN: 3600, // 1小时
  REFRESH_TOKEN: 86400, // 1天
  REFRESH_TOKEN_REMEMBER: 604800 // 7天
};

// 密码强度要求
export const PASSWORD_REQUIREMENTS = {
  MIN_LENGTH: 6,
  REQUIRE_UPPERCASE: false,
  REQUIRE_LOWERCASE: false,
  REQUIRE_NUMBERS: true,
  REQUIRE_SPECIAL: false
};

// 验证码配置
export const VERIFICATION_CODE = {
  LENGTH: 6,
  EXPIRY: 10 * 60, // 10分钟
  RESEND_COOLDOWN: 60 // 60秒
};

// 安全头配置
export const SECURITY_HEADERS = {
  CONTENT_SECURITY_POLICY: 'default-src \'self\'; script-src \'self\'; style-src \'self\' https://fonts.googleapis.com; img-src \'self\' data: https://*; font-src \'self\' https://fonts.gstatic.com; connect-src \'self\' https://*',
  X_CONTENT_TYPE_OPTIONS: 'nosniff',
  X_FRAME_OPTIONS: 'DENY',
  X_XSS_PROTECTION: '1; mode=block',
  STRICT_TRANSPORT_SECURITY: 'max-age=31536000; includeSubDomains'
};

// API路径前缀
export const API_PREFIX = {
  AUTH: '/auth',
  ADMIN: '/admin',
  USER: '/user',
  PUBLIC: '/public'
};

// 公开端点列表
export const PUBLIC_ENDPOINTS = [
  '/auth/login',
  '/auth/register',
  '/auth/send-code',
  '/auth/refresh-token',
  '/public/*',
  '/article/*',
  '/category/*',
  '/tag/*',
  '/search/*',
  '/recommend/*'
];

// 需要管理员权限的端点列表
export const ADMIN_ENDPOINTS = [
  '/admin/*',
  '/api/admin/*'
];

// 会话超时时间（毫秒）
export const SESSION_TIMEOUT = 30 * 60 * 1000; // 30分钟

// 最大登录尝试次数
export const MAX_LOGIN_ATTEMPTS = 5;

// 登录锁定时间（分钟）
export const LOGIN_LOCKOUT_TIME = 15;
