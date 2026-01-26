import { create } from 'zustand';

// 用户状态接口
export interface UserState {
  user: {
    id: string | null;
    name: string | null;
    email: string | null;
  };
  isLoggedIn: boolean;
  login: (userData: { id: string; name: string; email: string }) => void;
  logout: () => void;
  updateUser: (userData: Partial<UserState['user']>) => void;
}

// 创建用户状态 Store
export const useUserStore = create<UserState>((set) => ({
  user: {
    id: null,
    name: null,
    email: null,
  },
  isLoggedIn: false,
  login: (userData) => set({ user: userData, isLoggedIn: true }),
  logout: () => set({ user: { id: null, name: null, email: null }, isLoggedIn: false }),
  updateUser: (userData) => set((state) => ({
    user: { ...state.user, ...userData },
  })),
}));

// 导出用户状态选择器
export const useUser = () => {
  const store = useUserStore();
  return {
    user: store.user,
    isLoggedIn: store.isLoggedIn,
    login: store.login,
    logout: store.logout,
    updateUser: store.updateUser,
  };
};