import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import adminAuthService from '../services/adminAuthService';
import TokenService from '../services/tokenService';
import { ROUTES } from '../constants/routes';
import { SECURE_STORAGE_KEYS } from '../constants/security';
import type { UserInfo as AuthUserInfo, TokenResponse } from '../types/auth';
import type { ApiResponse } from '../types/common';
import { type AuthTypeEnum, GenderEnum, UserRoleEnum } from '../types/enums';

// 管理员状态接口
export interface AdminState {
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
    isLoading: boolean;
    adminAccessTokenExpiresAt: number | null;
    adminRememberMe: boolean;

    // 方法
    setAdminUser: (userData: {
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
    updateAdminUser: (userData: Partial<AdminState['adminUser']>) => void;
    login: (params: {
        account: string;
        authType: AuthTypeEnum;
        password: string;
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
    getProfile: () => Promise<void>;
    checkTokenExpiry: () => boolean;
    refreshToken: () => Promise<void>;
    initAuth: () => Promise<void>;
}

// 辅助函数：标准化用户数据
const normalizeUserData = (userInfo: AuthUserInfo): AdminState['adminUser'] => {
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
const handleAuthResponse = (get: () => AdminState, response: ApiResponse<TokenResponse>): ApiResponse<TokenResponse> => {
    if (response.code !== 200) {
        return response;
    }

    const userInfo = response.data.userInfo;
    const normalizedUser = normalizeUserData(userInfo);
    // 获取 rememberMe 状态
    const rememberMe = localStorage.getItem('admin_remember_me') === 'true';

    // 更新用户状态
    get().setAdminUser(
        normalizedUser,
        response.data.access_token,
        response.data.refresh_token,
        response.data.expires_in,
        rememberMe
    );

    return response;
};

// 创建管理员状态 Store
export const useAdminStore = create<AdminState>()(
    persist(
        (set, get) => ({
            // 后台用户状态
            adminUser: {
                id: null,
                username: null,
                email: null
            },
            isAdminLoggedIn: false,
            isLoading: false,
            adminAccessTokenExpiresAt: null,
            adminRememberMe: false,

            // 设置管理员用户状态方法
            setAdminUser: (userData: {
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

                console.log('设置管理员用户状态:', userData);
                console.log('设置 isAdminLoggedIn 为 true');

                // 处理角色为空的情况，默认设置为ADMIN
                const userDataWithRole = {
                    ...userData,
                    role: userData.role || UserRoleEnum.ADMIN
                };

                set({
                    adminUser: userDataWithRole,
                    isAdminLoggedIn: true,
                    adminAccessTokenExpiresAt: expiresAt,
                    adminRememberMe: rememberMe
                });

                if (accessToken) {
                    console.log('存储管理员访问令牌');
                    TokenService.setToken(
                        SECURE_STORAGE_KEYS.ADMIN_ACCESS_TOKEN,
                        accessToken
                    );
                }
                if (refreshToken) {
                    console.log('存储管理员刷新令牌');
                    TokenService.setToken(
                        SECURE_STORAGE_KEYS.ADMIN_REFRESH_TOKEN,
                        refreshToken
                    );
                }
                console.log('存储管理员令牌过期时间:', expiresAt);
                TokenService.setToken(
                    SECURE_STORAGE_KEYS.ADMIN_ACCESS_TOKEN_EXPIRES_AT,
                    expiresAt.toString()
                );
                console.log('存储管理员记住我状态:', rememberMe);
                TokenService.setToken(
                    SECURE_STORAGE_KEYS.ADMIN_REMEMBER_ME,
                    rememberMe.toString()
                );
            },

            // 登出方法
            logout: (): void => {
                set({
                    adminUser: { id: null, username: null, email: null },
                    isAdminLoggedIn: false,
                    adminAccessTokenExpiresAt: null,
                    adminRememberMe: false
                });

                TokenService.removeToken(SECURE_STORAGE_KEYS.ADMIN_ACCESS_TOKEN);
                TokenService.removeToken(SECURE_STORAGE_KEYS.ADMIN_REFRESH_TOKEN);
                TokenService.removeToken(SECURE_STORAGE_KEYS.ADMIN_ACCESS_TOKEN_EXPIRES_AT);
                TokenService.removeToken(SECURE_STORAGE_KEYS.ADMIN_REMEMBER_ME);
            },

            // 更新管理员信息方法
            updateAdminUser: (userData: Partial<AdminState['adminUser']>): unknown => {
                return set((state) => ({
                    adminUser: { ...state.adminUser, ...userData }
                }));
            },

            // 登录方法
            login: async (params: {
                account: string;
                authType: AuthTypeEnum;
                password: string;
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
                    console.log('开始管理员登录，参数:', params);
                    const response = await adminAuthService.login(params);
                    console.log('管理员登录响应:', response);
                    // 保存 remember 状态
                    if (response.code === 200) {
                        const rememberMe = params.remember || false;
                        localStorage.setItem('admin_remember_me', rememberMe.toString());
                        console.log('保存 admin_remember_me 到 localStorage:', rememberMe);
                    }
                    const result = handleAuthResponse(get, response);
                    console.log('管理员登录处理完成，结果:', result);
                    console.log('登录后 isAdminLoggedIn 状态:', get().isAdminLoggedIn);
                    console.log('登录后 adminUser 状态:', get().adminUser);
                    return result;
                } catch (error) {
                    console.error('管理员登录错误:', error);
                    throw error;
                } finally {
                    set({ isLoading: false });
                }
            },

            // 检查令牌是否即将过期（提前5分钟）
            checkTokenExpiry: (): boolean => {
                const expiresAt = get().adminAccessTokenExpiresAt;
                return TokenService.isTokenExpiring(expiresAt);
            },

            // 刷新令牌
            refreshToken: async (): Promise<void> => {
                const refreshToken = TokenService.getToken(SECURE_STORAGE_KEYS.ADMIN_REFRESH_TOKEN);

                if (!refreshToken) {
                    console.log('没有管理员刷新令牌, 执行 logout');
                    get().logout();
                    return;
                }

                try {
                    set({ isLoading: true });
                    console.log('发送管理员刷新令牌请求');
                    const response = await adminAuthService.refreshToken(refreshToken);
                    console.log('管理员刷新令牌响应:', response);
                    if (response.code === 200) {
                        const userInfo = response.data.userInfo;
                        const normalizedUser = normalizeUserData(userInfo);

                        get().setAdminUser(
                            normalizedUser,
                            response.data.access_token,
                            response.data.refresh_token,
                            response.data.expires_in,
                            get().adminRememberMe
                        );
                        console.log('管理员令牌刷新成功');
                    } else {
                        // 不返回response
                        console.error('管理员令牌刷新失败,准备退出:', response.message);
                        get().logout();
                    }

                } catch (error) {
                    console.error('管理员令牌刷新失败:', error);
                    get().logout();
                } finally {
                    set({ isLoading: false });
                }
            },

            // 获取个人资料
            getProfile: async (): Promise<void> => {
                try {
                    set({ isLoading: true });
                    const response = await adminAuthService.getProfile();
                    if (response.code === 200 && response.data) {
                        console.log('管理员个人资料', response);
                        const userInfo = response.data;
                        // 标准化用户数据
                        const normalizedUser = normalizeUserData(userInfo);

                        set((state) => ({
                            adminUser: {
                                ...state.adminUser,
                                ...normalizedUser
                            }
                        }));
                    }
                } catch (error) {
                    console.error('获取管理员个人资料失败:', error);
                } finally {
                    set({ isLoading: false });
                }
            },

            // 初始化登录状态
            initAuth: async (): Promise<void> => {
                // 检查当前是否在登录页面，如果是，则不进行初始化
                const currentPath = window.location.pathname;
                if (currentPath === ROUTES.ADMIN_LOGIN) {
                    return;
                }

                // 检查是否是后台路径
                const isAdminPath = currentPath.startsWith('/admin');

                // 初始化后台用户状态（如果是后台路径）
                if (isAdminPath) {
                    const adminAccessToken = TokenService.getToken(SECURE_STORAGE_KEYS.ADMIN_ACCESS_TOKEN);
                    const adminRefreshToken = TokenService.getToken(SECURE_STORAGE_KEYS.ADMIN_REFRESH_TOKEN);
                    const adminExpiresAtStr = TokenService.getToken(SECURE_STORAGE_KEYS.ADMIN_ACCESS_TOKEN_EXPIRES_AT);
                    const adminRememberMe = TokenService.getToken(SECURE_STORAGE_KEYS.ADMIN_REMEMBER_ME) === 'true';

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
                            await get().getProfile();
                        } else if (adminRememberMe) {
                            // 令牌过期但用户选择了记住我，尝试刷新令牌
                            await get().refreshToken();
                        }
                    }
                    // 移除else分支，保持当前登录状态
                    // 即使没有令牌，如果已经登录，也保持登录状态
                }
            }
        }),
        {
            name: 'admin-storage',
            partialize: (state) => ({
                // 后台用户状态
                adminUser: state.adminUser,
                isAdminLoggedIn: state.isAdminLoggedIn,
                adminAccessTokenExpiresAt: state.adminAccessTokenExpiresAt,
                adminRememberMe: state.adminRememberMe
            })
        }
    )
);

// 选择器 Hooks
export const useAdminUser = (): AdminState['adminUser'] => useAdminStore((state) => state.adminUser);
export const useIsAdminLoggedIn = (): boolean => useAdminStore((state) => state.isAdminLoggedIn);
export const useIsAdminLoading = (): boolean => useAdminStore((state) => state.isLoading);
export const useAdminAccessTokenExpiresAt = (): number | null => useAdminStore((state) => state.adminAccessTokenExpiresAt);
export const useAdminUserId = (): number | null => useAdminStore((state) => state.adminUser.id);
export const useAdminUserRole = (): string | undefined => useAdminStore((state) => state.adminUser.role);
export const useAdminUserInfo = (): {
    id: number | null;
    username: string | null;
    email: string | null;
    avatar?: string;
    nickname?: string;
    role?: string
} => useAdminStore((state) => ({
    id: state.adminUser.id,
    username: state.adminUser.username,
    email: state.adminUser.email,
    avatar: state.adminUser.avatar,
    nickname: state.adminUser.nickname,
    role: state.adminUser.role
}));

// 导出store实例，用于在非React组件中访问
export const adminStore = useAdminStore;
