import { SECURE_STORAGE_KEYS } from '../constants/security';

/**
 * 令牌存储服务
 * 提供安全的令牌存储和获取功能
 */
export class TokenService {
  /**
   * 存储令牌到安全存储
   * @param key 存储键
   * @param value 令牌值
   */
  static setToken ( key: string, value: string ): boolean {
    try {
      if (window.localStorage) {
        // 这里可以实现更安全的存储方式，如加密存储
        localStorage.setItem(key, value);
        console.log('存储令牌到localStorage成功:', key);
        return true;
      }
    } catch (error) {
      console.error('存储令牌到localStorage失败:', error);
      try {
        if (window.sessionStorage) {
          sessionStorage.setItem(key, value);
          console.log('存储令牌到sessionStorage成功:', key);
          return true;
        }
      } catch (sessionError) {
        console.error('存储到 sessionStorage 也失败:', sessionError);
      }
    }
    return false;
  }

  /**
   * 从安全存储获取令牌
   * @param key 存储键
   * @returns 令牌值或null
   */
  static getToken ( key: string ): string | null {
    try {
      if (window.localStorage) {
        // 这里可以实现更安全的获取方式，如解密
        const token = localStorage.getItem(key);
        if (token) {
          return token;
        }
      }
    } catch (error) {
      console.error('从localStorage获取令牌失败:', error);
    }
    
    // 尝试从sessionStorage获取
    try {
      if (window.sessionStorage) {
        const token = sessionStorage.getItem(key);
        if (token) {
          console.log('从sessionStorage获取令牌成功:', key);
          return token;
        }
      }
    } catch (sessionError) {
      console.error('从sessionStorage获取令牌失败:', sessionError);
    }
    
    return null;
  }

  /**
   * 从安全存储移除令牌
   * @param key 存储键
   */
  static removeToken ( key: string ): void {
    try {
      if (window.localStorage) {
        localStorage.removeItem(key);
      }
    } catch (error) {
      console.error('移除令牌失败:', error);
    }
  }

  /**
   * 清除所有认证相关的令牌
   */
  static clearAllTokens (): void {
    try {
      if (window.localStorage) {
        // 清除前台用户令牌
        localStorage.removeItem(SECURE_STORAGE_KEYS.ACCESS_TOKEN);
        localStorage.removeItem(SECURE_STORAGE_KEYS.REFRESH_TOKEN);
        localStorage.removeItem(SECURE_STORAGE_KEYS.ACCESS_TOKEN_EXPIRES_AT);
        localStorage.removeItem(SECURE_STORAGE_KEYS.REMEMBER_ME);

        // 清除后台用户令牌
        localStorage.removeItem(SECURE_STORAGE_KEYS.ADMIN_ACCESS_TOKEN);
        localStorage.removeItem(SECURE_STORAGE_KEYS.ADMIN_REFRESH_TOKEN);
        localStorage.removeItem(SECURE_STORAGE_KEYS.ADMIN_ACCESS_TOKEN_EXPIRES_AT);
        localStorage.removeItem(SECURE_STORAGE_KEYS.ADMIN_REMEMBER_ME);
      }
    } catch (error) {
      console.error('清除令牌失败:', error);
    }
  }

  /**
   * 检查令牌是否即将过期
   * @param expiresAt 过期时间戳
   * @param bufferTime 缓冲时间（毫秒），默认5分钟
   * @returns 是否即将过期
   */
  static isTokenExpiring (expiresAt: number | null, bufferTime: number = 5 * 60 * 1000): boolean {
    if (!expiresAt) return true;
    const now = Date.now();
    return expiresAt - now < bufferTime;
  }

  /**
   * 生成随机的状态参数，用于CSRF保护
   * @returns 随机状态字符串
   */
  static generateState (): string {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }

  /**
   * 验证状态参数，防止CSRF攻击
   * @param state 状态参数
   * @returns 是否有效
   */
  static validateState (state: string): boolean {
    // 这里可以实现更复杂的状态验证逻辑
    return state.length > 10;
  }
}

export default TokenService;
