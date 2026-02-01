import apiClient from './apiClient';
import { API_ENDPOINTS } from './apiEndpoints';
import type {ApiResponse} from "../types/auth.ts";
import {ArticleStatusEnum, ArticleOriginalEnum, ArticleVisibleEnum, AllowStatusEnum} from '../types/enums';

// 文章类型定义
export interface Article {
    id?: string;
    title: string;
    content: string;
    categoryId: number;
    tagIds: number[];
    coverImage?: string;
    status: ArticleStatusEnum;
    visible: ArticleVisibleEnum;
    allowComment: AllowStatusEnum;
    allowForward: AllowStatusEnum;
    original: ArticleOriginalEnum | unknown;
    createdTime?: string;
    updatedTime?: string;
}

// 文章列表项类型
export interface IndexArticleList {
    id: number;
    title: string;
    summary: string;
    coverImage: string;
    avatar: string;
    authorName: string;
    readCount: number;
    likeCount: number;
    commentCount: number;
    publishTime: string;
}

// 轮播图文章类型
export interface BannerArticle {
    id: number;
    title: string;
    summary: string;
    coverImage: string;
}

// 最新文章类型
export interface LatestArticle {
    id: number;
    title: string;
    publishTime: string;
}

// 文章列表响应类型
export interface ArticleListResponse {
    record: IndexArticleList[];
    total: number;
    size: number;
    current: number;
    pages: number;
}

// 文章 API 服务
const articleService = {
    // 创建文章
    createArticle: async (article: Omit<Article, 'id' | 'createdTime' | 'updatedTime'>): Promise<ApiResponse<Article>> => {
        return await apiClient.post('/article', article);
    },

    // 更新文章
    updateArticle: async (id: string, article: Partial<Article>): Promise<ApiResponse<Article>> => {
        return await apiClient.put(`/article/${id}`, article);
    },

    // 保存草稿
    saveDraft: async (article: Omit<Article, 'createdTime' | 'updatedTime'>): Promise<ApiResponse<Article>> => {
        const draftArticle = {
            ...article,
            status: ArticleStatusEnum.DRAFT
        };

        if (article.id) {
            return await articleService.updateArticle(article.id, draftArticle);
        } else {
            // 创建新文章时，移除可能存在的 id 属性
            const {...newArticle} = draftArticle;
            return await articleService.createArticle(newArticle);
        }
    },

    // 删除文章
    deleteArticle: async (id: string): Promise<ApiResponse<void>> => {
        return await apiClient.delete(`/article/${id}`);
    },

    // 上传图片
    uploadImage: async (file: File): Promise<ApiResponse<string>> => {
        const formData = new FormData();
        formData.append('file', file as File);

        return await apiClient.post('/upload/article/cover-image', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
    },

    // 获取文章列表
    getArticles: async (query: { page?: number; pageSize?: number; categoryId?: number; keyword?: string; sortBy?: string; sortOrder?: string } = {}): Promise<ApiResponse<ArticleListResponse>> => {
        const queryDTO = {
            page: query.page || 1,
            pageSize: query.pageSize || 10,
            offset: ((query.page || 1) - 1) * (query.pageSize || 10),
            categoryId: query.categoryId,
            keyword: query.keyword,
            sortBy: query.sortBy || 'publishTime',
            sortOrder: query.sortOrder || 'desc'
        };
        return await apiClient.post(API_ENDPOINTS.ARTICLE.LIST, queryDTO);
    },

    // 获取轮播图文章
    getBannerArticles: async (limit: number = 3): Promise<ApiResponse<BannerArticle[]>> => {
        return await apiClient.get(API_ENDPOINTS.ARTICLE.BANNER, { params: { limit } });
    },

    // 获取最新文章
    getLatestArticles: async (limit: number = 5): Promise<ApiResponse<LatestArticle[]>> => {
        return await apiClient.get(API_ENDPOINTS.ARTICLE.LATEST, { params: { limit } });
    }
};

export default articleService;