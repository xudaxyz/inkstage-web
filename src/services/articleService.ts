import apiClient from './apiClient';
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
    deleteArticle: async (id: string): Promise<void> => {
        await apiClient.delete(`/article/${id}`);
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
    }
};

export default articleService;