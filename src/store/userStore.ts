import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import authService from '../services/authService';
import { ROUTES } from '../constants/routes';
import type { UserInfo as AuthUserInfo, TokenResponse } from '../types/auth';
import type { ApiResponse } from '../types/common';
import { GenderEnum, UserRoleEnum } from '../types/enums';

// 用户状态接口
export interface UserState {
    // 前台用户状态
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
    accessTokenExpiresAt: number | null;
    rememberMe: boolean;

    // 后台用户状态
    adminUser: {
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
    isAdminLoggedIn: boolean;
    adminAccessTokenExpiresAt: number | null;
    adminRememberMe: boolean;

    // 方法
    setUser: (userData: {
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
    }, accessToken?: string, refreshToken?: string, expiresIn?: number, rememberMe?: boolean, isAdmin?: boolean) => void;
    logout: (isAdmin?: boolean) => void;
    updateUser: (userData: Partial<UserState['user']>, isAdmin?: boolean) => void;
    login: (params: {
        account: string;
        authType: 'password' | 'code';
        password?: string;
        code?: string;
        remember?: boolean;
        isAdmin?: boolean;
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
    register: (params: {
        account: string;
        authType: 'password' | 'code';
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
                gender?: GenderEnum;
                birthDate?: string;
                location?: string;
                role?: UserRoleEnum;
            };
        };
    }>;
    sendCode: (params: {
        account: string;
        type: 'email' | 'phone';
        purpose: string;
    }) => Promise<{
        code: number;
        message: string;
        data: {
            expireTime: number;
        };
    }>;
    getProfile: (isAdmin?: boolean) => Promise<void>;
    checkTokenExpiry: (isAdmin?: boolean) => boolean;
    refreshToken: (isAdmin?: boolean) => Promise<void>;
    initAuth: () => Promise<void>;
}

// 辅助函数：标准化用户数据
const normalizeUserData = (userInfo: AuthUserInfo): UserState['user'] => {
  const normalizedGender = userInfo.gender;
  const normalizedRole = userInfo.role;

  return {
    id: userInfo.id,
    username: userInfo.username,
    email: userInfo.email,
    avatar: userInfo.avatar,
    nickname: userInfo.nickname,
    coverImage: userInfo.coverImage,
    signature: userInfo.signature,
    gender: normalizedGender,
    birthDate: userInfo.birthDate,
    location: userInfo.location,
    role: normalizedRole
  };
};

// 辅助函数：处理认证响应
const handleAuthResponse = (get: () => UserState, response: ApiResponse<TokenResponse>, isAdmin: boolean = false): ApiResponse<TokenResponse> => {
  if (response.code !== 200) {
    return response;
  }

  const userInfo = response.data.userInfo;
  const normalizedUser = normalizeUserData(userInfo);
  // 获取 rememberMe 状态
  const rememberMe = isAdmin
    ? localStorage.getItem('admin_remember_me') === 'true'
    : localStorage.getItem('remember_me') === 'true';

  // 更新用户状态
  get().setUser(
    normalizedUser,
    response.data.access_token,
    response.data.refresh_token,
    response.data.expires_in,
    rememberMe,
    isAdmin
  );

  return response;
};

// 创建用户状态 Store
export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      // 前台用户状态
      user: {
        id: null,
        username: null,
        email: null
      },
      isLoggedIn: false,
      isLoading: false,
      accessTokenExpiresAt: null,
      rememberMe: false,

      // 后台用户状态
      adminUser: {
        id: null,
        username: null,
        email: null
      },
      isAdminLoggedIn: false,
      adminAccessTokenExpiresAt: null,
      adminRememberMe: false,

      setUser: (userData: { id: number | null; username: string | null; email: string | null; avatar?: string; nickname?: string; coverImage?: string; signature?: string; gender?: GenderEnum; birthDate?: string; location?: string; role?: UserRoleEnum; }, accessToken: string = '', refreshToken: string = '', expiresIn: number = 3600, rememberMe: boolean = false, isAdmin: boolean = false): void => {
        const expiresAt = Date.now() + expiresIn * 1000;

        if (isAdmin) {
          set({
            adminUser: userData,
            isAdminLoggedIn: true,
            adminAccessTokenExpiresAt: expiresAt,
            adminRememberMe: rememberMe
          });
          if (accessToken) {
            localStorage.setItem('admin_access_token', accessToken);
          }
          if (refreshToken) {
            localStorage.setItem('admin_refresh_token', refreshToken);
          }
          localStorage.setItem('admin_access_token_expires_at', expiresAt.toString());
          localStorage.setItem('admin_remember_me', rememberMe.toString());
        } else {
          set({
            user: userData,
            isLoggedIn: true,
            accessTokenExpiresAt: expiresAt,
            rememberMe: rememberMe
          });
          if (accessToken) {
            localStorage.setItem('access_token', accessToken);
          }
          if (refreshToken) {
            localStorage.setItem('refresh_token', refreshToken);
          }
          localStorage.setItem('access_token_expires_at', expiresAt.toString());
          localStorage.setItem('remember_me', rememberMe.toString());
        }
      },

      logout: (isAdmin: boolean = false): void => {
        if (isAdmin) {
          set({
            adminUser: { id: null, username: null, email: null },
            isAdminLoggedIn: false,
            adminAccessTokenExpiresAt: null,
            adminRememberMe: false
          });
          localStorage.removeItem('admin_access_token');
          localStorage.removeItem('admin_refresh_token');
          localStorage.removeItem('admin_access_token_expires_at');
          localStorage.removeItem('admin_remember_me');
        } else {
          set({
            user: { id: null, username: null, email: null },
            isLoggedIn: false,
            accessTokenExpiresAt: null,
            rememberMe: false
          });
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          localStorage.removeItem('access_token_expires_at');
          localStorage.removeItem('remember_me');
        }
      },

      updateUser: (userData: Partial<UserState['user']>, isAdmin: boolean = false) : unknown => {
        if (isAdmin) {
          return set((state) => ({
            adminUser: { ...state.adminUser, ...userData }
          }));
        } else {
          return set((state) => ({
            user: { ...state.user, ...userData }
          }));
        }
      },

      // 登录方法
  login: async (params: { account: string; authType: 'password' | 'code'; password?: string; code?: string; remember?: boolean; isAdmin?: boolean; }): Promise<{ code: number; message: string; data: { access_token: string; refresh_token: string; expires_in: number; userInfo: { id: number; username: string; email: string; avatar?: string; nickname?: string; coverImage?: string; signature?: string; gender?: GenderEnum; birthDate?: string; location?: string; role?: UserRoleEnum; }; }; }> => {
    set({ isLoading: true });
    try {
      console.log('开始登录，参数:', params);
      const response = await authService.login(params);
      console.log('登录响应:', response);
      // 保存 remember 状态
      if (response.code === 200) {
        const rememberMe = params.remember || false;
        const isAdmin = params.isAdmin || false;
        if (isAdmin) {
          localStorage.setItem('admin_remember_me', rememberMe.toString());
          console.log('保存 admin_remember_me 到 localStorage:', rememberMe);
        } else {
          localStorage.setItem('remember_me', rememberMe.toString());
        }
      }
      const result = handleAuthResponse(get, response, params.isAdmin || false);
      console.log('登录处理完成，结果:', result);
      console.log('localStorage 中的 admin_access_token:', localStorage.getItem('admin_access_token'));
      console.log('localStorage 中的 admin_refresh_token:', localStorage.getItem('admin_refresh_token'));
      return result;
    } catch (error) {
      console.error('登录错误:', error);
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

      // 注册方法
      register: async (params: { account: string; authType: 'password' | 'code'; password?: string; confirmPassword?: string; code?: string; agreeTerms: boolean; }): Promise<{ code: number; message: string; data: { access_token: string; refresh_token: string; expires_in: number; userInfo: { id: number; username: string; email: string; avatar?: string; nickname?: string; coverImage?: string; signature?: string; gender?: GenderEnum; birthDate?: string; location?: string; role?: UserRoleEnum; }; }; }> => {
        set({ isLoading: true });
        try {
          const response = await authService.register(params);
          return handleAuthResponse(get, response);
        } finally {
          set({ isLoading: false });
        }
      },

      // 发送验证码方法
      sendCode: async (params: { account: string; type: 'email' | 'phone'; purpose: string; }): Promise<{ code: number; message: string; data: { expireTime: number; }; }> => {
        set({ isLoading: true });
        try {
          return await authService.sendCode(params);
        } finally {
          set({ isLoading: false });
        }
      },

      // 检查令牌是否即将过期（提前5分钟）
      checkTokenExpiry: (isAdmin: boolean = false): boolean => {
        const expiresAt = isAdmin ? get().adminAccessTokenExpiresAt : get().accessTokenExpiresAt;
        if (!expiresAt) return true;
        const now = Date.now();
        // 提前5分钟检查过期
        return expiresAt - now < 5 * 60 * 1000;
      },

      // 刷新令牌
  refreshToken: async (isAdmin: boolean = false): Promise<void> => {
    console.log('开始刷新令牌，isAdmin:', isAdmin);
    const refreshToken = isAdmin
      ? localStorage.getItem('admin_refresh_token')
      : localStorage.getItem('refresh_token');
    console.log('获取到的 refreshToken:', refreshToken);

    if (!refreshToken || (isAdmin ? !get().isAdminLoggedIn : !get().isLoggedIn)) {
      console.log('没有刷新令牌或用户未登录，执行 logout');
      get().logout(isAdmin);
      return;
    }

    try {
      set({ isLoading: true });
      console.log('发送刷新令牌请求');
      const response = await authService.refreshToken( refreshToken );
      console.log('刷新令牌响应:', response);
      if (response.code === 200) {
        const userInfo = response.data.userInfo;
        const normalizedUser = normalizeUserData(userInfo);

        get().setUser(
          normalizedUser,
          response.data.access_token,
          response.data.refresh_token,
          response.data.expires_in,
          isAdmin ? get().adminRememberMe : get().rememberMe,
          isAdmin
        );
        console.log('令牌刷新成功');
      } else {
        // 不返回response
        console.error('令牌刷新失败:', response.message);
      }

    } catch (error) {
      console.error('令牌刷新失败:', error);
      get().logout(isAdmin);
    } finally {
      set({ isLoading: false });
    }
  },

      // 获取个人资料
      getProfile: async (isAdmin: boolean = false): Promise<void> => {
        if (isAdmin ? !get().isAdminLoggedIn : !get().isLoggedIn) {
          return;
        }

        try {
          set({ isLoading: true });
          const response = await authService.getProfile(isAdmin);
          if (response.code === 200 && response.data) {
            const userInfo = response.data;
            // 标准化用户数据
            const normalizedUser = normalizeUserData(userInfo);

            if (isAdmin) {
              set((state) => ({
                adminUser: {
                  ...state.adminUser,
                  ...normalizedUser
                }
              }));
            } else {
              set((state) => ({
                user: {
                  ...state.user,
                  ...normalizedUser
                }
              }));
            }
          }
        } catch (error) {
          console.error('获取个人资料失败:', error);
        } finally {
          set({ isLoading: false });
        }
      },

      // 初始化登录状态
      initAuth: async (): Promise<void> => {
        // 检查当前是否在登录页面，如果是，则不进行初始化
        const currentPath = window.location.pathname;
        if (currentPath === ROUTES.LOGIN || currentPath === ROUTES.ADMIN_LOGIN) {
          return;
        }

        // 初始化前台用户状态
        const accessToken = localStorage.getItem('access_token');
        const refreshToken = localStorage.getItem('refresh_token');
        const expiresAtStr = localStorage.getItem('access_token_expires_at');
        const rememberMe = localStorage.getItem('remember_me') === 'true';

        if (accessToken && refreshToken && expiresAtStr) {
          const expiresAt = parseInt(expiresAtStr, 10);
          const now = Date.now();

          // 检查令牌是否过期
          if (expiresAt > now) {
            // 令牌有效，设置登录状态
            set({
              isLoggedIn: true,
              accessTokenExpiresAt: expiresAt,
              rememberMe: rememberMe
            });
            // 尝试获取用户信息
            await get().getProfile(false);
          } else if (rememberMe) {
            // 令牌过期但用户选择了记住我，尝试刷新令牌
            await get().refreshToken(false);
          }
        } else {
          // 没有令牌，确保登录状态为false
          set({
            isLoggedIn: false,
            accessTokenExpiresAt: null,
            rememberMe: false
          });
        }

        // 只有在当前路径是后台路径时才初始化后台用户状态
        if (currentPath.startsWith('/admin')) {
          // 初始化后台用户状态
          const adminAccessToken = localStorage.getItem('admin_access_token');
          const adminRefreshToken = localStorage.getItem('admin_refresh_token');
          const adminExpiresAtStr = localStorage.getItem('admin_access_token_expires_at');
          const adminRememberMe = localStorage.getItem('admin_remember_me') === 'true';

          if (adminAccessToken && adminRefreshToken && adminExpiresAtStr) {
            const adminExpiresAt = parseInt(adminExpiresAtStr, 10);
            const now = Date.now();

            // 检查令牌是否过期
            if (adminExpiresAt > now) {
              // 令牌有效，设置登录状态
              set({
                isAdminLoggedIn: true,
                adminAccessTokenExpiresAt: adminExpiresAt,
                adminRememberMe: adminRememberMe
              });
              // 尝试获取用户信息
              await get().getProfile(true);
            } else if (adminRememberMe) {
              // 令牌过期但用户选择了记住我，尝试刷新令牌
              await get().refreshToken(true);
            }
          } else {
            // 没有令牌，确保登录状态为false
            set({
              isAdminLoggedIn: false,
              adminAccessTokenExpiresAt: null,
              adminRememberMe: false
            });
          }
        }
      }
    }),
    {
      name: 'user-storage',
      partialize: (state) => ({
        // 前台用户状态
        user: state.user,
        isLoggedIn: state.isLoggedIn,
        accessTokenExpiresAt: state.accessTokenExpiresAt,
        rememberMe: state.rememberMe,
        // 后台用户状态
        adminUser: state.adminUser,
        isAdminLoggedIn: state.isAdminLoggedIn,
        adminAccessTokenExpiresAt: state.adminAccessTokenExpiresAt,
        adminRememberMe: state.adminRememberMe
      })
    }
  )
);

// 导出用户状态的具体选择器，减少不必要的重渲染
// 选择器 Hooks
export const useUser = (): UserState['user'] => useUserStore((state) => state.user);
export const useIsLoggedIn = (): boolean => useUserStore((state) => state.isLoggedIn);
export const useIsLoading = (): boolean => useUserStore((state) => state.isLoading);
export const useAccessTokenExpiresAt = (): number | null => useUserStore((state) => state.accessTokenExpiresAt);
export const useUserId = (): number | null => useUserStore((state) => state.user.id);
export const useUserRole = (): string | undefined => useUserStore((state) => state.user.role);
export const useUserInfo = (): { id: number | null; username: string | null; email: string | null; avatar?: string; nickname?: string; role?: string } => useUserStore((state) => ({
  id: state.user.id,
  username: state.user.username,
  email: state.user.email,
  avatar: state.user.avatar,
  nickname: state.user.nickname,
  role: state.user.role
}));

// 导出store实例，用于在非React组件中访问
export const userStore = useUserStore;
