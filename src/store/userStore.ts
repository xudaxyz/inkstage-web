import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import authService from '../services/authService';
import TokenService from '../services/tokenService';
import { ROUTES } from '../constants/routes';
import { SECURE_STORAGE_KEYS } from '../constants/security';
import type { TokenResponse, UserInfo as AuthUserInfo } from '../types/auth';
import type { ApiResponse } from '../types/common';
import { AuthTypeEnum, GenderEnum, UserRoleEnum } from '../types/enums';

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
    }, accessToken?: string, refreshToken?: string, expiresIn?: number, rememberMe?: boolean) => void;
    logout: () => void;
    updateUser: (userData: Partial<UserState['user']>) => void;
    login: (params: {
        account: string;
        authType: AuthTypeEnum;
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
                role?: UserRoleEnum;
            };
        };
    }>;
    register: (params: {
        account: string;
        authType: AuthTypeEnum;
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
    getProfile: () => Promise<void>;
    checkTokenExpiry: () => boolean;
    refreshToken: () => Promise<void>;
    initAuth: () => Promise<void>;
    startTokenExpiryCheck: () => void;
    stopTokenExpiryCheck: () => void;
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
const handleAuthResponse = (get: () => UserState, response: ApiResponse<TokenResponse>): ApiResponse<TokenResponse> => {
    if (response.code !== 200) {
        return response;
    }
    const userInfo = response.data.userInfo;
    const normalizedUser = normalizeUserData(userInfo);
    // 获取 rememberMe 状态
    const rememberMe = localStorage.getItem('remember_me') === 'true';
    // 更新用户状态
    get().setUser(
        normalizedUser,
        response.data.access_token,
        response.data.refresh_token,
        response.data.expires_in,
        rememberMe
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
            // 设置用户状态方法
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
            }, accessToken: string = '', refreshToken: string = '', expiresIn: number = 3600, rememberMe: boolean = false): void => {
                const expiresAt = Date.now() + expiresIn * 1000;
                set({
                    user: userData,
                    isLoggedIn: true,
                    accessTokenExpiresAt: expiresAt,
                    rememberMe: rememberMe
                });
                if (accessToken) {
                    TokenService.setToken(SECURE_STORAGE_KEYS.ACCESS_TOKEN, accessToken);
                }
                if (refreshToken) {
                    TokenService.setToken(SECURE_STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
                }
                TokenService.setToken(SECURE_STORAGE_KEYS.ACCESS_TOKEN_EXPIRES_AT, expiresAt.toString());
                TokenService.setToken(SECURE_STORAGE_KEYS.REMEMBER_ME, rememberMe.toString());
            },
            // 登出方法
            logout: (): void => {
                // 停止令牌过期检查
                get().stopTokenExpiryCheck();
                set({
                    user: { id: null, username: null, email: null },
                    isLoggedIn: false,
                    accessTokenExpiresAt: null,
                    rememberMe: false
                });
                TokenService.removeToken(SECURE_STORAGE_KEYS.ACCESS_TOKEN);
                TokenService.removeToken(SECURE_STORAGE_KEYS.REFRESH_TOKEN);
                TokenService.removeToken(SECURE_STORAGE_KEYS.ACCESS_TOKEN_EXPIRES_AT);
                TokenService.removeToken(SECURE_STORAGE_KEYS.REMEMBER_ME);
            },
            // 更新用户信息方法
            updateUser: (userData: Partial<UserState['user']>): unknown => {
                return set((state) => ({
                    user: { ...state.user, ...userData }
                }));
            },
            // 登录方法
            login: async (params: {
                account: string;
                authType: AuthTypeEnum;
                password?: string;
                code?: string;
                remember?: boolean;
            }): Promise<{
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
            }> => {
                set({ isLoading: true });
                try {
                    const response = await authService.login(params);
                    // 保存 remember 状态
                    if (response.code === 200) {
                        const rememberMe = params.remember || false;
                        localStorage.setItem('remember_me', rememberMe.toString());
                        // 启动令牌过期检查
                        get().startTokenExpiryCheck();
                    }
                    return handleAuthResponse(get, response);
                } catch (error) {
                    throw new Error((error as Error)?.message);
                } finally {
                    set({ isLoading: false });
                }
            },
            // 注册方法
            register: async (params: {
                account: string;
                authType: AuthTypeEnum;
                password?: string;
                confirmPassword?: string;
                code?: string;
                agreeTerms: boolean;
            }): Promise<{
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
            }> => {
                set({ isLoading: true });
                try {
                    const response = await authService.register(params);
                    if (response.code === 200) {
                        // 启动令牌过期检查
                        get().startTokenExpiryCheck();
                    }
                    return handleAuthResponse(get, response);
                } finally {
                    set({ isLoading: false });
                }
            },
            // 发送验证码方法
            sendCode: async (params: { account: string; type: 'email' | 'phone'; purpose: string; }): Promise<{
                code: number;
                message: string;
                data: { expireTime: number; };
            }> => {
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
                return TokenService.isTokenExpiring(expiresAt);
            },
            // 刷新令牌
            refreshToken: async (): Promise<void> => {
                const refreshToken = TokenService.getToken(SECURE_STORAGE_KEYS.REFRESH_TOKEN);
                if (!refreshToken) {
                    get().logout();
                    return;
                }
                try {
                    set({ isLoading: true });
                    const response = await authService.refreshToken(refreshToken);
                    if (response.code === 200) {
                        const userInfo = response.data.userInfo;
                        const normalizedUser = normalizeUserData(userInfo);
                        get().setUser(
                            normalizedUser,
                            response.data.access_token,
                            response.data.refresh_token,
                            response.data.expires_in,
                            get().rememberMe
                        );
                    } else {
                        // 不返回response
                        console.error('前台令牌刷新失败, 准备退出:', response.message);
                        get().logout();
                    }
                } catch (error) {
                    console.error('前台令牌刷新失败:', error);
                    get().logout();
                } finally {
                    set({ isLoading: false });
                }
            },
            // 获取个人资料
            getProfile: async (): Promise<void> => {
                try {
                    set({ isLoading: true });
                    const response = await authService.getProfile(false);
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
                    console.error('获取前台个人资料失败:', error);
                } finally {
                    set({ isLoading: false });
                }
            },
            // 初始化登录状态
            initAuth: async (): Promise<void> => {
                // 检查当前是否在登录页面，如果是，则不进行初始化
                const currentPath = window.location.pathname;
                if (currentPath === ROUTES.LOGIN) {
                    return;
                }
                // 检查是否是后台路径，如果是，不初始化前台状态
                const isAdminPath = currentPath.startsWith('/admin');
                if (isAdminPath) {
                    return;
                }
                // 初始化前台用户状态
                const accessToken = TokenService.getToken(SECURE_STORAGE_KEYS.ACCESS_TOKEN);
                const refreshToken = TokenService.getToken(SECURE_STORAGE_KEYS.REFRESH_TOKEN);
                const expiresAtStr = TokenService.getToken(SECURE_STORAGE_KEYS.ACCESS_TOKEN_EXPIRES_AT);
                const rememberMe = TokenService.getToken(SECURE_STORAGE_KEYS.REMEMBER_ME) === 'true';
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
                        await get().getProfile();
                        // 启动令牌过期检查
                        get().startTokenExpiryCheck();
                    } else if (rememberMe) {
                        // 令牌过期但用户选择了记住我，尝试刷新令牌
                        await get().refreshToken();
                        // 启动令牌过期检查
                        get().startTokenExpiryCheck();
                    }
                } else {
                    // 没有令牌，确保登录状态为false
                    set({
                        isLoggedIn: false,
                        accessTokenExpiresAt: null,
                        rememberMe: false
                    });
                }
            },
            // 启动令牌过期检查
    startTokenExpiryCheck: (): void => {
        // 清除之前的定时器
        if ((window as Window & { tokenExpiryCheckTimer?: number }).tokenExpiryCheckTimer) {
            clearInterval((window as Window & { tokenExpiryCheckTimer?: number }).tokenExpiryCheckTimer);
        }

        // 每30秒检查一次令牌是否即将过期
        (window as Window & { tokenExpiryCheckTimer?: number }).tokenExpiryCheckTimer = window.setInterval(() => {
            const isExpiring = get().checkTokenExpiry();
            if (isExpiring && get().isLoggedIn) {
                // 自动刷新令牌
                get().refreshToken().catch((error) => {
                    console.error('自动刷新令牌失败:', error);
                });
            }
        }, 30000); // 30秒检查一次
    },

    // 停止令牌过期检查
    stopTokenExpiryCheck: (): void => {
        if ((window as Window & { tokenExpiryCheckTimer?: number }).tokenExpiryCheckTimer) {
            clearInterval((window as Window & { tokenExpiryCheckTimer?: number }).tokenExpiryCheckTimer);
            (window as Window & { tokenExpiryCheckTimer?: number }).tokenExpiryCheckTimer = undefined;
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
                rememberMe: state.rememberMe
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
export const useUserInfo = (): {
    id: number | null;
    username: string | null;
    email: string | null;
    avatar?: string;
    nickname?: string;
    role?: string
} => useUserStore((state) => ({
    id: state.user.id,
    username: state.user.username,
    email: state.user.email,
    avatar: state.user.avatar,
    nickname: state.user.nickname,
    role: state.user.role
}));
// 导出store实例，用于在非React组件中访问
export const userStore = useUserStore;
