import apiClient from './apiClient';
import {API_ENDPOINTS} from './apiEndpoints';
import type {ApiResponse} from '../types/auth';
import {StatusEnum} from '../types/enums';

// 前台分类接口
export interface FrontendCategory {
    id: number;
    name: string;
    slug?: string;
    description?: string;
    articleCount?: number;
    status?: StatusEnum;
}

// 后台分类接口
export interface AdminCategory {
    id: number;
    name: string;
    slug: string;
    parentId?: number;
    sortOrder?: number;
    description: string;
    articleCount: number;
    status: StatusEnum;
    createTime?: string;
    updateTime?: string;
}

// 分类服务
const categoryService = {
    /**
     * 获取所有分类
     * @returns 分类列表
     */
    getAllCategories: async (): Promise<ApiResponse<FrontendCategory[]>> => {
        return await apiClient.get(API_ENDPOINTS.FRONT.CATEGORY.ALL);
    },

    /**
     * 获取激活状态的分类
     * @returns 激活状态的分类列表
     */
    getActiveCategories: async (): Promise<ApiResponse<FrontendCategory[]>> => {
        return await apiClient.get(API_ENDPOINTS.FRONT.CATEGORY.ACTIVE);
    },

    /**
     * 根据ID获取分类
     * @param id 分类ID
     * @returns 分类信息
     */
    getCategoryById: async (id: number): Promise<ApiResponse<FrontendCategory>> => {
        return await apiClient.get(API_ENDPOINTS.FRONT.CATEGORY.DETAIL(id));
    },

    // 管理员相关方法
    /**
     * 分页获取分类（管理员）
     * @param keyword 关键字
     * @param pageNum 页码
     * @param pageSize 每页大小
     * @returns 分页结果
     */
    adminGetCategoriesByPage: async (keyword: string, pageNum: number, pageSize: number): Promise<ApiResponse<{
        record: AdminCategory[];
        total: number;
        pageNum: number;
        pageSize: number;
        pages: number;
    }>> => {
        return await apiClient.get(API_ENDPOINTS.ADMIN.CATEGORY.LIST, {
            params: { keyword, pageNum, pageSize }
        });
    },

    /**
     * 添加分类
     * @param category 分类信息
     * @returns 添加后的分类信息
     */
    adminAddCategory: async (category: Omit<AdminCategory, 'id' | 'articleCount' | 'createTime' | 'updateTime'>): Promise<ApiResponse<AdminCategory>> => {
        return await apiClient.post(API_ENDPOINTS.ADMIN.CATEGORY.CREATE, category);
    },

    /**
     * 更新分类
     * @param id 分类ID
     * @param category 分类信息
     * @returns 更新后的分类信息
     */
    adminUpdateCategory: async (id: number, category: Omit<AdminCategory, 'id' | 'articleCount' | 'createTime' | 'updateTime'>): Promise<ApiResponse<AdminCategory>> => {
        return await apiClient.put(API_ENDPOINTS.ADMIN.CATEGORY.UPDATE(id), category);
    },

    /**
     * 删除分类
     * @param id 分类ID
     * @returns 响应结果
     */
    adminDeleteCategory: async (id: number): Promise<ApiResponse<void>> => {
        return await apiClient.delete(API_ENDPOINTS.ADMIN.CATEGORY.DELETE(id));
    },

    /**
     * 更新分类状态
     * @param id 分类ID
     * @param status 状态
     * @returns 更新后的分类信息
     */
    adminUpdateCategoryStatus: async (id: number, status: StatusEnum): Promise<ApiResponse<AdminCategory>> => {
        return await apiClient.put(API_ENDPOINTS.ADMIN.CATEGORY.UPDATE_STATUS(id), null, {
            params: {status}
        });
    },

};

export default categoryService;