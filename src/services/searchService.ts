import apiClient from './apiClient';
import {API_ENDPOINTS} from './apiEndpoints';
import type {ApiResponse} from '../types/auth';
import type {IndexArticleList} from './articleService';

// 搜索文章的请求参数接口
export interface SearchArticlesParams {
    keyword: string;
    page?: number;
    size?: number;
    sortBy?: 'relevance' | 'publishTime' | 'readCount';
}

// 搜索文章的数据接口
export interface SearchArticlesData {
    record: IndexArticleList[];
    total: number;
    size: number;
    current: number;
    pages: number;
}

// 热门搜索词的数据接口
export type HotWordsData = Array<{
    id: number;
    word: string;
    count: number;
}>;

// 搜索历史的数据接口
export type SearchHistoryData = Array<{
    id: number;
    keyword: string;
    searchTime: string;
}>

// 搜索 API 服务
const searchService = {
    // 搜索文章
    searchArticles: async (params: SearchArticlesParams): Promise<ApiResponse<SearchArticlesData>> => {
        const queryDTO = {
            keyword: params.keyword,
            page: params.page || 1,
            size: params.size || 10,
            sortBy: params.sortBy || 'relevance'
        };
        return await apiClient.get(API_ENDPOINTS.FRONT.SEARCH.ARTICLES, {
            params: queryDTO,
        });
    },

    // 获取热门搜索词
    getHotWords: async (): Promise<ApiResponse<HotWordsData>> => {
        return await apiClient.get(API_ENDPOINTS.FRONT.SEARCH.HOT_WORDS);
    },

    // 获取搜索历史
    getSearchHistory: async (): Promise<ApiResponse<SearchHistoryData>> => {
        return await apiClient.get(API_ENDPOINTS.FRONT.SEARCH.HISTORY.LIST);
    },

    // 删除搜索历史
    deleteSearchHistory: async (id: number): Promise<ApiResponse<void>> => {
        return await apiClient.delete(
            API_ENDPOINTS.FRONT.SEARCH.HISTORY.DELETE(id)
        );
    },

    // 清空搜索历史
    clearSearchHistory: async (): Promise<ApiResponse<void>> => {
        return await apiClient.delete(
            API_ENDPOINTS.FRONT.SEARCH.HISTORY.CLEAR
        );
    },
};

export default searchService;