/**
 * 认证错误类型常量
 */
export const AuthErrorType = {
    // 令牌相关错误
    TOKEN_INVALID: 'TOKEN_INVALID',
    TOKEN_EXPIRED: 'TOKEN_EXPIRED',
    TOKEN_REVOKED: 'TOKEN_REVOKED',
    TOKEN_REFRESH_FAILED: 'TOKEN_REFRESH_FAILED',
    // 刷新令牌相关错误
    REFRESH_TOKEN_INVALID: 'REFRESH_TOKEN_INVALID',
    REFRESH_TOKEN_NOT_FOUND: 'REFRESH_TOKEN_NOT_FOUND',
    // 其他认证错误
    INVALID_AUDIENCE: 'INVALID_AUDIENCE',
    USER_NOT_FOUND: 'USER_NOT_FOUND',
    UNAUTHORIZED: 'UNAUTHORIZED'
} as const;
export type AuthErrorType = typeof AuthErrorType[keyof typeof AuthErrorType];
/**
 * 认证错误信息映射
 */
export const authErrorMessages: Record<AuthErrorType, string> = {
    [AuthErrorType.TOKEN_INVALID]: '令牌无效',
    [AuthErrorType.TOKEN_EXPIRED]: '令牌已过期',
    [AuthErrorType.TOKEN_REVOKED]: '令牌已被撤销，可能在其他设备登录',
    [AuthErrorType.TOKEN_REFRESH_FAILED]: '令牌刷新失败',
    [AuthErrorType.REFRESH_TOKEN_INVALID]: '刷新令牌无效',
    [AuthErrorType.REFRESH_TOKEN_NOT_FOUND]: '刷新令牌已过期或被撤销',
    [AuthErrorType.INVALID_AUDIENCE]: '令牌缺少客户端信息',
    [AuthErrorType.USER_NOT_FOUND]: '用户不存在',
    [AuthErrorType.UNAUTHORIZED]: '未授权访问'
};

/**
 * 获取认证错误信息
 */
export function getAuthErrorMessage (errorType: string): string {
    return authErrorMessages[errorType as AuthErrorType] || '认证失败';
}

/**
 * 检查是否是认证错误
 */
export function isAuthError (errorMessage: string): boolean {
    return Object.values(AuthErrorType).includes(errorMessage as AuthErrorType);
}
