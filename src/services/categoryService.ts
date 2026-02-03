import apiClient from './apiClient';
import type {ApiResponse} from '../types/auth';

// 分类接口
export interface Category {
    id: number;
    name: string;
    status?: number;
}

// 分类服务
const categoryService = {
    /**
     * 获取所有分类
     * @returns 分类列表
     */
    getAllCategories: async (): Promise<ApiResponse<Category[]>> => {
        return await apiClient.get('/front/category');
    },

    /**
     * 获取激活状态的分类
     * @returns 激活状态的分类列表
     */
    getActiveCategories: async (): Promise<ApiResponse<Category[]>> => {
        return await apiClient.get('/front/category/active');
    },

    /**
     * 根据ID获取分类
     * @param id 分类ID
     * @returns 分类信息
     */
    getCategoryById: async (id: number): Promise<ApiResponse<Category>> => {
        return await apiClient.get(`/front/category/${id}`);
    },

};

export default categoryService;