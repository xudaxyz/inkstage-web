import apiClient from './apiClient';
import {API_ENDPOINTS} from './apiEndpoints';
import {type GenderEnum, type UserRoleEnum, type UserStatusEnum} from "../types/enums";
import type {ApiResponse} from '../types/auth';

// 用户信息类型定义
export interface UserInfo {
    id: number;
    name: string;
    nickname: string;
    email: string;
    avatar: string;
    coverImage: string;
    signature: string;
    gender: GenderEnum;
    birthDate?: string;
    location?: string;
    articleCount: number;
    likeCount: number;
    commentCount: number;
    followerCount: number;
    followCount: number;
    registerTime: string;
}

// 后台用户管理相关类型
export interface AdminUserArticle {
    id: number;
    title: string;
    summary: string;
    articleStatus: string;
    reviewStatus: string;
    publishTime: string;
    readCount: number;
    commentCount: number;
    likeCount: number;
}

export interface AdminUserComment {
    id: number;
    articleId: number;
    articleTitle: string;
    content: string;
    status: string;
    top: string;
    likeCount: number;
    replyCount: number;
    createTime: string;
}

export interface AdminUser {
    id: number;
    username: string;
    nickname: string;
    email: string;
    phone: string;
    role: UserRoleEnum;
    status: UserStatusEnum;
    registerTime: string;
    lastLoginTime: string;
    articleCount?: number;
    commentCount?: number;
    emailVerified?: string;
    phoneVerified?: string;
    avatar?: string;
    signature?: string;
    gender?: string;
    location?: string;
    website?: string;
    followCount?: number;
    followerCount?: number;
    likeCount?: number;
    lastLoginIp?: string;
    registerIp?: string;
    privacy?: string;
    recentArticles?: AdminUserArticle[];
    recentComments?: AdminUserComment[];
}

// 分页请求参数
export interface AdminUserQuery {
    pageNum: number;
    pageSize: number;
    keyword?: string;
    userRole?: UserRoleEnum;
    status?: UserStatusEnum;
    startDate?: string;
    endDate?: string;
}

// 分页响应结果
export interface PageResult<T> {
    record: T[];
    total: number;
    pageSize: number;
    current: number;
}

// 获取用户公开资料
export const getUserPublicProfile = async (userId: number): Promise<UserInfo> => {
    try {
        const response = await apiClient.get(API_ENDPOINTS.USER.PUBLIC_PROFILE(userId));
        return response.data;
    } catch (error) {
        console.error('获取用户资料失败:', error);
        throw error;
    }
};

// 获取当前用户资料
export const getCurrentUserProfile = async (): Promise<UserInfo> => {
    try {
        const response = await apiClient.get(API_ENDPOINTS.USER.PROFILE);
        return response.data;
    } catch (error) {
        console.error('获取当前用户资料失败:', error);
        throw error;
    }
};

// 更新用户资料
export const updateUserProfile = async (userData: Partial<UserInfo>): Promise<UserInfo> => {
    try {
        const response = await apiClient.put(API_ENDPOINTS.USER.PROFILE, userData);
        return response.data;
    } catch (error) {
        console.error('更新用户资料失败:', error);
        throw error;
    }
};

// 后台用户管理相关方法
const admin = {
    // 分页获取用户列表
    getUsersByPage: async (params: AdminUserQuery): Promise<ApiResponse<PageResult<AdminUser>>> => {
        return await apiClient.post(API_ENDPOINTS.ADMIN.USER.LIST, params);
    },

    // 根据ID获取用户
    getUserById: async (id: number): Promise<ApiResponse<AdminUser>> => {
        return await apiClient.get(API_ENDPOINTS.ADMIN.USER.DETAIL(id));
    },

    // 删除用户
    deleteUser: async (id: number): Promise<ApiResponse<void>> => {
        return await apiClient.delete(API_ENDPOINTS.ADMIN.USER.DELETE(id));
    },

    // 更新用户信息
    updateUser: async (id: number, userData: Partial<AdminUser>): Promise<ApiResponse<AdminUser>> => {
            return await apiClient.put(API_ENDPOINTS.ADMIN.USER.UPDATE(id), userData);

    },
    // 更新用户状态
    updateUserStatus: async (id: number, userStatus: UserStatusEnum): Promise<ApiResponse<AdminUser>> => {
        return await apiClient.put(API_ENDPOINTS.ADMIN.USER.UPDATE_STATUS(id), userStatus);
    },

    // 更新用户角色
    updateUserRole: async (id: number, userRole: UserRoleEnum): Promise<ApiResponse<AdminUser>> => {
        return await apiClient.put(API_ENDPOINTS.ADMIN.USER.UPDATE_ROLE(id), userRole);
    }
};

export default {
    getUserPublicProfile,
    getCurrentUserProfile,
    updateUserProfile,
    admin
};
