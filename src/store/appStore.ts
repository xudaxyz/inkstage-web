import { create } from 'zustand';

// 应用状态接口
export interface AppState {
  theme: 'light' | 'dark';
  isLoading: boolean;
  toggleTheme: () => void;
  setLoading: (loading: boolean) => void;
}

// 创建应用状态 Store
export const useAppStore = create<AppState>((set) => ({
  theme: 'light',
  isLoading: false,
  toggleTheme: () => set((state) => ({
    theme: state.theme === 'light' ? 'dark' : 'light'
  })),
  setLoading: (loading) => set({ isLoading: loading })
}));

// 导出应用状态选择器
export const useApp = () => {
  const store = useAppStore();
  return {
    theme: store.theme,
    isLoading: store.isLoading,
    toggleTheme: store.toggleTheme,
    setLoading: store.setLoading
  };
};
