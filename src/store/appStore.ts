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
  toggleTheme: (): void => set((state) => ({
    theme: state.theme === 'light' ? 'dark' : 'light'
  })),
  setLoading: (loading: boolean): void => set({ isLoading: loading })
}));

// 导出应用状态选择器
export const useApp = (): AppState => {
  const store = useAppStore();
  return {
    theme: store.theme,
    isLoading: store.isLoading,
    toggleTheme: store.toggleTheme,
    setLoading: store.setLoading
  };
};

// 导出应用状态的具体选择器，减少不必要的重渲染
export const useTheme = () => useAppStore((state) => state.theme);
export const useAppLoading = () => useAppStore((state) => state.isLoading);
