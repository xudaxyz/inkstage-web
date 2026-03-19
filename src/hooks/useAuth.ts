import { useNavigate } from 'react-router-dom';
import { useUserStore } from '../store';

/**
 * 认证相关的自定义Hook
 */
export const useAuth = () => {
  const navigate = useNavigate();
  const {
    user,
    adminUser,
    isLoggedIn,
    isAdminLoggedIn,
    isLoading,
    login,
    logout,
    register,
    sendCode,
    getProfile,
    refreshToken
  } = useUserStore();

  /**
   * 检查用户是否登录
   * @returns 是否登录
   */
  const checkAuth = (): boolean => {
    return isLoggedIn;
  };

  /**
   * 检查管理员是否登录
   * @returns 是否登录
   */
  const checkAdminAuth = (): boolean => {
    return isAdminLoggedIn;
  };

  /**
   * 处理登录
   * @param params 登录参数
   * @returns 登录结果
   */
  const handleLogin = async (params: {
    account: string;
    authType: 'password' | 'code';
    password?: string;
    code?: string;
    remember?: boolean;
    isAdmin?: boolean;
  }) => {
      const result = await login(params);
      if (result.code === 200) {
        // 登录成功后处理重定向
        const redirectPath = localStorage.getItem('redirect_after_login');
        if (redirectPath) {
          localStorage.removeItem('redirect_after_login');
          navigate(redirectPath);
        } else {
          // 默认重定向到首页
          navigate('/');
        }
      }
      return result;
  };

  /**
   * 处理登出
   * @param isAdmin 是否是管理员登出
   */
  const handleLogout = (isAdmin: boolean = false) : void => {
    logout(isAdmin);
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
    return requiredRoles.some(role => user.role === role);
  };

  /**
   * 检查管理员权限
   * @param requiredRoles 所需角色列表
   * @returns 是否有权限
   */
  const checkAdminPermission = (requiredRoles: string[]): boolean => {
    if (!isAdminLoggedIn) return false;
    return requiredRoles.some(role => adminUser.role === role);
  };

  return {
    user,
    adminUser,
    isLoggedIn,
    isAdminLoggedIn,
    isLoading,
    checkAuth,
    checkAdminAuth,
    handleLogin,
    handleLogout,
    register,
    sendCode,
    getProfile,
    refreshToken,
    checkPermission,
    checkAdminPermission
  };
};
