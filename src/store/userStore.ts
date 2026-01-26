import {create} from 'zustand';
import {persist} from 'zustand/middleware';
import authService from '../services/authService';

// 用户状态接口
export interface UserState {
  user: {
    id: string | null;
    name: string | null;
    email: string | null;
    avatar?: string;
  };
  isLoggedIn: boolean;
  isLoading: boolean;
  accessTokenExpiresAt: number | null;
  login: (userData: { id: string; name: string; email: string; avatar?: string }, accessToken?: string, refreshToken?: string, expiresIn?: number) => void;
  logout: () => void;
  updateUser: (userData: Partial<UserState['user']>) => void;
  register: (params: any) => Promise<any>;
  sendCode: (params: any) => Promise<any>;
  checkTokenExpiry: () => boolean;
  refreshToken: () => Promise<void>;
}

// 创建用户状态 Store
export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      user: {
        id: null,
        name: null,
        email: null,
      },
      isLoggedIn: false,
      isLoading: false,
      accessTokenExpiresAt: null,
      
      login: (userData, accessToken = '', refreshToken = '', expiresIn = 3600) => {
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
      
      logout: () => {
        set({ 
          user: { id: null, name: null, email: null }, 
          isLoggedIn: false,
          accessTokenExpiresAt: null
        });
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('access_token_expires_at');
      },
      
      updateUser: (userData) => set((state) => ({
        user: { ...state.user, ...userData },
      })),
      
      // 注册方法
      register: async (params) => {
        set({ isLoading: true });
        try {
          const response = await authService.register(params);
          
          // 更新用户状态
          get().login(
            {
              id: response.data.userInfo.id,
              name: response.data.userInfo.name,
              email: response.data.userInfo.email,
              avatar: response.data.userInfo.avatar,
            },
            response.data.access_token,
            response.data.refresh_token,
            response.data.expires_in
          );
          
          return response;
        } finally {
          set({ isLoading: false });
        }
      },
      
      // 发送验证码方法
      sendCode: async (params) => {
        set({ isLoading: true });
        try {
            return await authService.sendCode(params);
        } finally {
          set({ isLoading: false });
        }
      },
      
      // 检查令牌是否即将过期（提前5分钟）
      checkTokenExpiry: () => {
        const expiresAt = get().accessTokenExpiresAt;
        if (!expiresAt) return true;
        const now = Date.now();
        // 提前5分钟检查过期
        return expiresAt - now < 5 * 60 * 1000;
      },
      
      // 刷新令牌
      refreshToken: async () => {
        const refreshToken = localStorage.getItem('refresh_token');
        if (!refreshToken || !get().isLoggedIn) {
          get().logout();
          return;
        }
        
        try {
          set({ isLoading: true });
          const response = await authService.refreshToken({ refresh_token: refreshToken });
          get().login(
            {
              id: response.data.userInfo.id,
              name: response.data.userInfo.name,
              email: response.data.userInfo.email,
              avatar: response.data.userInfo.avatar,
            },
            response.data.access_token,
            response.data.refresh_token,
            response.data.expires_in
          );
        } catch (error) {
          console.error('令牌刷新失败:', error);
          get().logout();
        } finally {
          set({ isLoading: false });
        }
      },
    }),
    {
      name: 'user-storage',
      partialize: (state) => ({
        user: state.user,
        isLoggedIn: state.isLoggedIn,
        accessTokenExpiresAt: state.accessTokenExpiresAt,
      }),
    }
  )
);

// 导出用户状态选择器
export const useUser = () => {
  const store = useUserStore();
  return {
    user: store.user,
    isLoggedIn: store.isLoggedIn,
    isLoading: store.isLoading,
    accessTokenExpiresAt: store.accessTokenExpiresAt,
    login: store.login,
    logout: store.logout,
    updateUser: store.updateUser,
    register: store.register,
    sendCode: store.sendCode,
    checkTokenExpiry: store.checkTokenExpiry,
    refreshToken: store.refreshToken,
  };
};