import apiClient from './apiClient';
import type {ApiResponse} from '../types/auth';

// 标签接口
export interface Tag {
    id: number;
    name: string;
    status?: number;
}

// 标签服务
const tagService = {
    /**
     * 获取激活状态的标签
     * @returns 激活状态的标签列表
     */
    getActiveTags: async (): Promise<ApiResponse<Tag[]>> => {
        return await apiClient.get('/front/tag/active');
    },

};

export default tagService;