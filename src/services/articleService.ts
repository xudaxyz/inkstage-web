import apiClient from './apiClient';
import {API_ENDPOINTS} from './apiEndpoints';
import type {ApiResponse} from "../types/auth.ts";
import type {Tag} from "./tagService.ts";
import {
    ArticleStatusEnum,
    ArticleReviewStatusEnum,
    ArticleOriginalEnum,
    ArticleVisibleEnum,
    AllowStatusEnum,
    GenderEnum,
    ArticleCollectionStatusEnum,
    DefaultStatusEnum
} from '../types/enums';

// 文章类型定义
export interface Article {
    id?: string;
    title: string;
    content: string;
    categoryId: number;
    tagIds: number[];
    coverImage?: string;
    status: ArticleStatusEnum;
    reviewStatus?: ArticleReviewStatusEnum;
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
    userId: number;
    readCount: number;
    likeCount: number;
    commentCount: number;
    publishTime: string;
}

// 我的文章列表项类型
export interface MyArticleList {
    id: number;
    title: string;
    summary: string;
    userId: number;
    readCount: number;
    likeCount: number;
    commentCount: number;
    publishTime: string;
    articleStatus: ArticleStatusEnum;
    reviewStatus: ArticleReviewStatusEnum;
    visible: ArticleVisibleEnum;
    original: ArticleOriginalEnum;
}

// 我的文章收藏列表项类型
export interface MyArticleCollectionList {
    collectionId: number; // 收藏id
    articleId: number; // 文章id
    title: string;
    summary: string;
    coverImage: string;
    userId: number;
    authorName: string;
    avatar: string; // 作者头像
    categoryName: string;
    articleStatus: ArticleStatusEnum;
    originalStatus: ArticleOriginalEnum;
    publishTime: string;
    collectTime: string; // 收藏时间
    readCount: number;
    likeCount: number;
    commentCount: number;
    collectionStatus: ArticleCollectionStatusEnum;
    folderId: number;
    folderName: string;
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
export interface ArticleListResponse<T = IndexArticleList> {
    record: T[];
    total: number;
    size: number;
    current: number;
    pages: number;
}

// 文章详情类型
export interface ArticleDetailInfo {
    id: number;
    title: string;
    content: string;
    contentHtml: string;
    summary: string;
    coverImage: string;
    allowComment: AllowStatusEnum;
    allowForward: AllowStatusEnum;
    visible: ArticleVisibleEnum;
    original: ArticleOriginalEnum;
    originalUrl: string;
    publishTime: string;
    lastEditTime: string;
    readCount: number;
    likeCount: number;
    commentCount: number;
    collectionCount: number;
    shareCount: number;
    isLiked: boolean;
    isCollected: boolean;
    userId: number;
    authorName: string;
    avatar: string;
    signature: string;
    gender: GenderEnum;
    articleCount: number;
    followerCount: number;
    categoryId: number;
    categoryName: string;
    tags: Tag[]
}

// 文章 API 服务
const articleService = {
    // 创建文章
    createArticle: async (article: Omit<Article, 'createdTime' | 'updatedTime'>): Promise<ApiResponse<Article>> => {
        return await apiClient.post(API_ENDPOINTS.ARTICLE.CREATE, article);
    },

    // 更新文章
    updateArticle: async (id: number, article: Partial<Article>): Promise<ApiResponse<Article>> => {
        return await apiClient.put(API_ENDPOINTS.ARTICLE.UPDATE(id), article);
    },

    // 保存草稿
    saveDraft: async (article: Omit<Article, 'createdTime' | 'updatedTime'>): Promise<ApiResponse<Article>> => {
        const draftArticle = {
            ...article,
            status: ArticleStatusEnum.DRAFT
        };

        if (article.id) {
            return await apiClient.put(API_ENDPOINTS.ARTICLE.SAVE_DRAFT(Number(article.id)), draftArticle);
        } else {
            // 创建新文章时，移除可能存在的 id 属性
            const {...newArticle} = draftArticle;
            return await articleService.createArticle(newArticle);
        }
    },

    // 删除文章
    deleteArticle: async (id: number): Promise<ApiResponse<void>> => {
        return await apiClient.post(API_ENDPOINTS.ARTICLE.DELETE(id));
    },

    // 上传图片
    uploadImage: async (file: File): Promise<ApiResponse<string>> => {
        const formData = new FormData();
        formData.append('file', file as File);

        return await apiClient.post(API_ENDPOINTS.UPLOAD.ARTICLE_COVER_IMG, formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
    },

    // 获取文章列表
    getArticles: async (query: {
        page?: number;
        pageSize?: number;
        categoryId?: number;
        keyword?: string;
        sortBy?: string;
        sortOrder?: string
    } = {}): Promise<ApiResponse<ArticleListResponse>> => {
        const queryDTO = {
            page: query.page || 1,
            pageSize: query.pageSize || 10,
            offset: ((query.page || 1) - 1) * (query.pageSize || 10),
            categoryId: query.categoryId,
            keyword: query.keyword,
            sortBy: query.sortBy || 'publishTime',
            sortOrder: query.sortOrder || 'desc'
        };
        return await apiClient.post(API_ENDPOINTS.INDEX.LIST, queryDTO);
    },

    // 获取轮播图文章
    getBannerArticles: async (limit: number = 3): Promise<ApiResponse<BannerArticle[]>> => {
        return await apiClient.get(API_ENDPOINTS.INDEX.BANNER, {params: {limit}});
    },

    // 获取最新文章
    getLatestArticles: async (limit: number = 5): Promise<ApiResponse<LatestArticle[]>> => {
        return await apiClient.get(API_ENDPOINTS.INDEX.LATEST_ARTICLES, {params: {limit}});
    },

    // 获取文章详情
    getArticleDetail: async (id: number): Promise<ApiResponse<ArticleDetailInfo>> => {
        return await apiClient.get(`${API_ENDPOINTS.ARTICLE.DETAIL}/${id}`);
    },

    // 获取用户文章列表
    getUserArticles: async (userId: number, page: number = 1, size: number = 10): Promise<ApiResponse<ArticleListResponse>> => {
        return await apiClient.get(API_ENDPOINTS.ARTICLE.USER_ARTICLES(userId), {params: {page, size}});
    },

    // 获取作者相关文章
    getAuthorRelatedArticles: async (userId: number, excludeArticleId: number, limit: number = 3): Promise<ApiResponse<IndexArticleList[]>> => {
        return await apiClient.get(API_ENDPOINTS.ARTICLE.AUTHOR_RELATED, {params: {userId, excludeArticleId, limit}});
    },

    // 点赞文章
    likeArticle: async (articleId: number): Promise<ApiResponse<boolean>> => {
        return await apiClient.post(API_ENDPOINTS.ARTICLE.LIKE(articleId));
    },

    // 取消点赞
    unlikeArticle: async (articleId: number): Promise<ApiResponse<boolean>> => {
        return await apiClient.delete(API_ENDPOINTS.ARTICLE.UNLIKE(articleId));
    },

    // 检查点赞状态
    checkLikeStatus: async (articleId: number): Promise<ApiResponse<boolean>> => {
        return await apiClient.get(API_ENDPOINTS.ARTICLE.LIKE_STATUS(articleId));
    },

    // 收藏文章
    collectArticle: async (params: { articleId: number; folderId?: number; folderName?: string; folderDescription?: string }): Promise<ApiResponse<boolean>> => {
        return await apiClient.post(API_ENDPOINTS.ARTICLE.COLLECT, params);
    },

    // 取消收藏
    unCollectArticle: async (articleId: number): Promise<ApiResponse<boolean>> => {
        return await apiClient.post(API_ENDPOINTS.ARTICLE.UN_COLLECT(articleId));
    },

    // 检查收藏状态
    checkCollectStatus: async (articleId: number): Promise<ApiResponse<boolean>> => {
        return await apiClient.get(API_ENDPOINTS.ARTICLE.COLLECT_STATUS(articleId));
    },

    // 增加文章阅读量
    incrementReadCount: async (articleId: number): Promise<ApiResponse<number>> => {
        return await apiClient.post(API_ENDPOINTS.ARTICLE.INCREMENT_READ(articleId));
    },

    // 获取当前用户文章列表
    getMyArticles: async (params: {
        articleStatus: ArticleStatusEnum;
        keyword?: string;
        page?: number;
        size?: number;
    }): Promise<ApiResponse<ArticleListResponse<MyArticleList>>> => {
        return await apiClient.get(API_ENDPOINTS.USER.MY_ARTICLES, {params});
    },

    // 获取当前用户收藏文章列表
    getMyCollections: async (params: {
        folderId?: number;
        keyword?: string;
        page?: number;
        size?: number;
        sortBy?: string;
        sortOrder?: string;
    }): Promise<ApiResponse<ArticleListResponse<MyArticleCollectionList>>> => {
        return await apiClient.get('/front/article/collections', {params});
    },

    // 获取用户的收藏文件夹列表
    getCollectionFolders: async (): Promise<ApiResponse<Array<{
        id: number;
        name: string;
        articleCount: number;
        defaultFolder: DefaultStatusEnum | string;
    }>>> => {
        return await apiClient.get('/front/article/collections/folders');
    },

    // 获取用户的总收藏数
    getTotalCollectionCount: async (): Promise<ApiResponse<number>> => {
        return await apiClient.get('/front/article/collections/total');
    },

    // 移动收藏文章到其他文件夹
    moveCollectionArticle: async (articleId: number, targetFolderId: number): Promise<ApiResponse<boolean>> => {
        return await apiClient.put('/front/article/collections/move', { articleId, folderId: targetFolderId });
    },
    
    // 创建收藏文件夹
    createCollectionFolder: async (params: { folderName: string; folderDescription?: string }): Promise<ApiResponse<number>> => {
        return await apiClient.post('/front/article/collections/folders', params);
    }
};

export default articleService;