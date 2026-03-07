import apiClient from './apiClient';
import {API_ENDPOINTS} from './apiEndpoints';
import type {ApiResponse} from '../types/auth.ts';

// 阅读历史类型定义
export interface ReadingHistory {
    id: string;
    articleId: string;
    title: string;
    summary: string;
    coverImage?: string;
    userId: string;
    authorName: string;
    avatar: string;
    progress: number;
    duration: number;
    lastReadTime: string;
    scrollPosition: number;
    readTime: string;
    readDate: string;
}

// 阅读历史请求参数类型
export interface ReadingHistoryRequest {
    articleId: number;
    progress: number;
    duration: number;
    scrollPosition: number;
}

// 阅读历史响应类型
export interface ReadingHistoryResponse {
    record: ReadingHistory[];
    total: number;
    size: number;
    current: number;
    pages: number;
};

// 阅读历史 API 服务
const readingHistoryService = {
    // 保存或更新阅读历史
    saveReadingHistory: async (data: ReadingHistoryRequest): Promise<ApiResponse<boolean>> => {
        return await apiClient.post(API_ENDPOINTS.READING_HISTORY.SAVE, data);
    },

    // 获取阅读历史列表
    getReadingHistoryList: async (page: number = 1, size: number = 10): Promise<ApiResponse<ReadingHistoryResponse>> => {
        return await apiClient.get(API_ENDPOINTS.READING_HISTORY.LIST, {params: {page, size}});
    },

    // 删除单条阅读历史
    deleteReadingHistory: async (articleId: number): Promise<ApiResponse<boolean>> => {
        return await apiClient.delete(API_ENDPOINTS.READING_HISTORY.DELETE(articleId));
    },

    // 清空阅读历史
    clearReadingHistory: async (): Promise<ApiResponse<boolean>> => {
        return await apiClient.delete(API_ENDPOINTS.READING_HISTORY.CLEAR);
    },

    // 获取单篇文章的阅读历史
    getReadingHistoryByArticleId: async (articleId: number): Promise<ApiResponse<ReadingHistory>> => {
        return await apiClient.get(API_ENDPOINTS.READING_HISTORY.DETAIL(articleId));
    },

    // 批量获取阅读历史
    getReadingHistoriesByArticleIds: async (articleIds: number[]): Promise<ApiResponse<ReadingHistory[]>> => {
        return await apiClient.post(API_ENDPOINTS.READING_HISTORY.BATCH, articleIds);
    },
};

export default readingHistoryService;