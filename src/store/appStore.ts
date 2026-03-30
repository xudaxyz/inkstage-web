import { create } from 'zustand';

// 应用状态接口
export interface AppState {
  theme: 'light' | 'dark';
  isLoading: boolean;
  toggleTheme: () => void;
  setLoading: (loading: boolean) => void;
}

// 从 localStorage 读取初始主题
const getInitialTheme = (): 'light' | 'dark' => {
  const savedTheme = localStorage.getItem('theme') as 'light' | 'dark';
  return savedTheme || 'light';
};

// 创建应用状态 Store
export const useAppStore = create<AppState>((set) => ({
  theme: getInitialTheme(),
  isLoading: false,
  toggleTheme: (): void => set((state) => {
    const newTheme = state.theme === 'light' ? 'dark' : 'light';
    localStorage.setItem('theme', newTheme);
    return { theme: newTheme };
  }),
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

// 导出应用状态的具体选择器
export const useTheme = () : string => useAppStore((state) => state.theme);
export const useAppLoading = (): boolean => useAppStore((state) => state.isLoading);
