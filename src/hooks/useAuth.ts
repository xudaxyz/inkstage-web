import { useNavigate } from 'react-router-dom';
import { useUserStore } from '../store';
import type { AuthTypeEnum, GenderEnum, UserRoleEnum } from '../types/enums';

/**
 * 前台认证相关的自定义Hook
 */
export const useAuth = (): {
  user: {
    id: number | null;
    username: string | null;
    email: string | null;
    avatar?: string;
    nickname?: string;
    coverImage?: string;
    signature?: string;
    gender?: GenderEnum;
    birthDate?: string;
    location?: string;
    role?: UserRoleEnum;
  };
  isLoggedIn: boolean;
  isLoading: boolean;
  checkAuth: () => boolean;
  handleLogin: (params: {
    account: string;
    authType: AuthTypeEnum;
    password?: string;
    code?: string;
    remember?: boolean;
  }) => Promise<{
    code: number;
    message: string;
    data: {
      access_token: string;
      refresh_token: string;
      expires_in: number;
      userInfo: {
        id: number;
        username: string;
        email: string;
        avatar?: string;
        nickname?: string;
        coverImage?: string;
        signature?: string;
        gender?: GenderEnum;
        birthDate?: string;
        location?: string;
        role?: UserRoleEnum;
      };
    };
  }>;
  handleLogout: () => void;
  register: (params: {
    account: string;
    authType: import('../types/enums').AuthTypeEnum;
    password?: string;
    confirmPassword?: string;
    code?: string;
    agreeTerms: boolean;
  }) => Promise<{
    code: number;
    message: string;
    data: {
      access_token: string;
      refresh_token: string;
      expires_in: number;
      userInfo: {
        id: number;
        username: string;
        email: string;
        avatar?: string;
        nickname?: string;
        coverImage?: string;
        signature?: string;
        gender?: import('../types/enums').GenderEnum;
        birthDate?: string;
        location?: string;
        role?: import('../types/enums').UserRoleEnum;
      };
    };
  }>;
  sendCode: (params: { account: string; type: 'email' | 'phone'; purpose: string }) => Promise<{
    code: number;
    message: string;
    data: {
      expireTime: number;
    };
  }>;
  getProfile: () => Promise<void>;
  refreshToken: () => Promise<void>;
  checkPermission: (requiredRoles: string[]) => boolean;
} => {
  const navigate = useNavigate();
  const { user, isLoggedIn, isLoading, login, logout, register, sendCode, getProfile, refreshToken } = useUserStore();

  /**
   * 检查用户是否登录
   * @returns 是否登录
   */
  const checkAuth = (): boolean => {
    return isLoggedIn;
  };

  /**
   * 处理登录
   * @param params 登录参数
   * @returns 登录结果
   */
  const handleLogin = async (params: {
    account: string;
    authType: AuthTypeEnum;
    password?: string;
    code?: string;
    remember?: boolean;
  }): Promise<{
    code: number;
    message: string;
    data: {
      access_token: string;
      refresh_token: string;
      expires_in: number;
      userInfo: {
        id: number;
        username: string;
        email: string;
        avatar?: string;
        nickname?: string;
        coverImage?: string;
        signature?: string;
        gender?: GenderEnum;
        birthDate?: string;
        location?: string;
        role?: UserRoleEnum;
      };
    };
  }> => {
    const result = await login(params);
    if (result.code === 200) {
      // 登录成功后处理重定向
      const redirectPath = localStorage.getItem('redirect_after_login');
      if (redirectPath) {
        localStorage.removeItem('redirect_after_login');
        // 确保 redirectPath 是一个正确的路径，以 / 开头
        const normalizedPath = redirectPath.startsWith('/') ? redirectPath : `/${redirectPath}`;
        // 移除可能的完整 URL 部分
        const baseUrl = import.meta.env.VITE_API_FRONT_URL;
        const cleanPath = normalizedPath.split(baseUrl)[1] || normalizedPath;
        // 检查是否是后台路径
        if (cleanPath.startsWith('/admin')) {
          // 普通用户不能访问后台，重定向到首页
          navigate('/');
        } else {
          navigate(cleanPath);
        }
      } else {
        // 普通用户登录，默认重定向到前台首页
        navigate('/');
      }
    }
    return result;
  };

  /**
   * 处理登出
   */
  const handleLogout = (): void => {
    logout();
    // 登出后重定向到首页
    navigate('/');
  };

  /**
   * 检查权限
   * @param requiredRoles 所需角色列表
   * @returns 是否有权限
   */
  const checkPermission = (requiredRoles: string[]): boolean => {
    if (!isLoggedIn) return false;
    return requiredRoles.some((role) => user.role === role);
  };

  return {
    user,
    isLoggedIn,
    isLoading,
    checkAuth,
    handleLogin,
    handleLogout,
    register,
    sendCode,
    getProfile,
    refreshToken,
    checkPermission
  };
};
