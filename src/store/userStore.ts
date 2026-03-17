import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import authService from '../services/authService';
import type { UserInfo as AuthUserInfo, TokenResponse } from '../types/auth';
import type { ApiResponse } from '../types/common';
import type { GenderEnum } from '../types/enums';

// 用户状态接口
export interface UserState {
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
        role?: string;
    };
    isLoggedIn: boolean;
    isLoading: boolean;
    accessTokenExpiresAt: number | null;
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
        role?: string;
    }, accessToken?: string, refreshToken?: string, expiresIn?: number) => void;
    logout: () => void;
    updateUser: (userData: Partial<UserState['user']>) => void;
    login: (params: {
        account: string;
        authType: 'password' | 'code';
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
                role?: string;
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
                role?: string;
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
    getProfile: () => Promise<void>;
    checkTokenExpiry: () => boolean;
    refreshToken: () => Promise<void>;
}

// 辅助函数：标准化用户数据
const normalizeUserData = (userInfo: AuthUserInfo): UserState['user'] => {
  const normalizedGender = userInfo.gender;

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
    role: userInfo.role
  };
};

// 辅助函数：处理认证响应
const handleAuthResponse = (get: () => UserState, response: ApiResponse<TokenResponse>): ApiResponse<TokenResponse> => {
  if (response.code !== 200) {
    return response;
  }

  const userInfo = response.data.userInfo;
  const normalizedUser = normalizeUserData(userInfo);

  // 更新用户状态
  get().setUser(
    normalizedUser,
    response.data.access_token,
    response.data.refresh_token,
    response.data.expires_in
  );

  return response;
};

// 创建用户状态 Store
export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      user: {
        id: null,
        username: null,
        email: null
      },
      isLoggedIn: false,
      isLoading: false,
      accessTokenExpiresAt: null,

      setUser: (userData: { id: number | null; username: string | null; email: string | null; avatar?: string; nickname?: string; coverImage?: string; signature?: string; gender?: GenderEnum; birthDate?: string; location?: string; role?: string; }, accessToken: string = '', refreshToken: string = '', expiresIn: number = 3600): void => {
        const expiresAt = Date.now() + expiresIn * 1000;
        set({
          user: userData,
          isLoggedIn: true,
          accessTokenExpiresAt: expiresAt
        });
        if (accessToken) {
          localStorage.setItem('access_token', accessToken);
        }
        if (refreshToken) {
          localStorage.setItem('refresh_token', refreshToken);
        }
        localStorage.setItem('access_token_expires_at', expiresAt.toString());
      },

      logout: (): void => {
        set({
          user: { id: null, username: null, email: null },
          isLoggedIn: false,
          accessTokenExpiresAt: null
        });
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('access_token_expires_at');
      },

      updateUser: (userData: Partial<UserState['user']>) : unknown => set((state) => ({
        user: { ...state.user, ...userData }
      })),

      // 登录方法
      login: async (params: { account: string; authType: 'password' | 'code'; password?: string; code?: string; remember?: boolean; }): Promise<{ code: number; message: string; data: { access_token: string; refresh_token: string; expires_in: number; userInfo: { id: number; username: string; email: string; avatar?: string; nickname?: string; coverImage?: string; signature?: string; gender?: GenderEnum; birthDate?: string; location?: string; role?: string; }; }; }> => {
        set({ isLoading: true });
        try {
          const response = await authService.login(params);
          return handleAuthResponse(get, response);
        } finally {
          set({ isLoading: false });
        }
      },

      // 注册方法
      register: async (params: { account: string; authType: 'password' | 'code'; password?: string; confirmPassword?: string; code?: string; agreeTerms: boolean; }): Promise<{ code: number; message: string; data: { access_token: string; refresh_token: string; expires_in: number; userInfo: { id: number; username: string; email: string; avatar?: string; nickname?: string; coverImage?: string; signature?: string; gender?: GenderEnum; birthDate?: string; location?: string; role?: string; }; }; }> => {
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
      checkTokenExpiry: (): boolean => {
        const expiresAt = get().accessTokenExpiresAt;
        if (!expiresAt) return true;
        const now = Date.now();
        // 提前5分钟检查过期
        return expiresAt - now < 5 * 60 * 1000;
      },

      // 刷新令牌
      refreshToken: async (): Promise<void> => {
        const refreshToken = localStorage.getItem('refresh_token');
        if (!refreshToken || !get().isLoggedIn) {
          get().logout();
          return;
        }

        try {
          set({ isLoading: true });
          const response = await authService.refreshToken({ refresh_token: refreshToken });
          if (response.code === 200) {
            const userInfo = response.data.userInfo;
            const normalizedUser = normalizeUserData(userInfo);

            get().setUser(
              normalizedUser,
              response.data.access_token,
              response.data.refresh_token,
              response.data.expires_in
            );
          } else {
            // 不返回response
            console.error('令牌刷新失败:', response.message);
          }

        } catch (error) {
          console.error('令牌刷新失败:', error);
          get().logout();
        } finally {
          set({ isLoading: false });
        }
      },

      // 获取个人资料
      getProfile: async (): Promise<void> => {
        if (!get().isLoggedIn) {
          return;
        }

        try {
          set({ isLoading: true });
          const response = await authService.getProfile();
          if (response.code === 200 && response.data) {
            const userInfo = response.data;
            // 标准化用户数据
            const normalizedUser = normalizeUserData(userInfo);

            set((state) => ({
              user: {
                ...state.user,
                ...normalizedUser
              }
            }));
          }
        } catch (error) {
          console.error('获取个人资料失败:', error);
        } finally {
          set({ isLoading: false });
        }
      }
    }),
    {
      name: 'user-storage',
      partialize: (state) => ({
        user: state.user,
        isLoggedIn: state.isLoggedIn,
        accessTokenExpiresAt: state.accessTokenExpiresAt
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
