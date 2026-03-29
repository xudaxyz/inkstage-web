import { create } from 'zustand';

interface AuthErrorState {
    error: {
        message: string;
        showActions: boolean;
        redirectToLogin: boolean;
    } | null;
    showError: (message: string, options?: {
        showActions?: boolean;
        redirectToLogin?: boolean;
    }) => void;
    hideError: () => void;
}

export const useAuthErrorStore = create<AuthErrorState>((set) => ({
    error: null,
    showError: (message, options = {}): void => set({
        error: {
            message,
            showActions: options.showActions ?? true,
            redirectToLogin: options.redirectToLogin ?? true
        }
    }),
    hideError: (): void => set({ error: null })
}));
export const authErrorStore = useAuthErrorStore;
