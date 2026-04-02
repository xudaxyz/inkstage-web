import { useNavigate } from 'react-router-dom';
import { useUserStore } from '../store';
import type { AuthTypeEnum } from '../types/enums';

/**
 * 前台认证相关的自定义Hook
 */
export const useAuth = () => {
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
  }) => {
    const result = await login(params);
    if (result.code === 200) {
      // 登录成功后处理重定向
      const redirectPath = localStorage.getItem('redirect_after_login');
      if (redirectPath) {
        localStorage.removeItem('redirect_after_login');
        // 确保 redirectPath 是一个正确的路径，以 / 开头
        const normalizedPath = redirectPath.startsWith('/') ? redirectPath : `/${redirectPath}`;
        // 移除可能的完整 URL 部分
        const cleanPath = normalizedPath.split('localhost:3000')[1] || normalizedPath;
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
