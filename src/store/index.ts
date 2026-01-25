import { create } from 'zustand';

// 用户状态接口
interface UserState {
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

// 应用状态接口
interface AppState {
  theme: 'light' | 'dark';
  isLoading: boolean;
  toggleTheme: () => void;
  setLoading: (loading: boolean) => void;
}

// 组合所有状态的根状态类型
type RootState = UserState & AppState;

// 创建 Zustand Store
export const useStore = create<RootState>((set) => ({
  // 用户状态
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

  // 应用状态
  theme: 'light',
  isLoading: false,
  toggleTheme: () => set((state) => ({
    theme: state.theme === 'light' ? 'dark' : 'light',
  })),
  setLoading: (loading) => set({ isLoading: loading }),
}));

// 导出选择器，方便组件使用
export const useUser = () => useStore((state) => ({
  user: state.user,
  isLoggedIn: state.isLoggedIn,
  login: state.login,
  logout: state.logout,
  updateUser: state.updateUser,
}));

export const useApp = () => useStore((state) => ({
  theme: state.theme,
  isLoading: state.isLoading,
  toggleTheme: state.toggleTheme,
  setLoading: state.setLoading,
}));
