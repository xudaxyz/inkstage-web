import apiClient from './apiClient';
import {API_ENDPOINTS} from './apiEndpoints';
import type {ApiResponse} from "../types/auth.ts";
import type {CommentStatusEnum, CommentTopStatus} from "../types/enums/CommentEnum.ts";

// 评论查询参数
export interface CommentQueryParams {
    articleId: number;
    pageNum?: number;
    pageSize?: number;
    offset?: number;
    sortBy?: 'hot' | 'new';
}

// 评论创建参数
export interface CommentCreateParams {
    articleId: number;
    parentId?: number;
    content: string;
}

// 评论更新参数
export interface CommentUpdateParams {
    id: number;
    content: string;
}

// 评论删除参数
export interface CommentDeleteParams {
    id: number;
}

// ArticleCommentVO
export interface ArticleComment {
    id: number;
    parentId: number;
    content: string;
    floor: string;
    likeCount: number;
    replyCount: number;
    status: CommentStatusEnum;
    top: CommentTopStatus;
    topOrder: number;
    createTime: string;
    updateTime: string;
    articleId: number;
    userId: number;
    nickname: string;
    avatar: string;
    gender: number;
    userStatus: number;
    dislikeCount: number;
    isLiked: boolean;
    isDisliked: boolean;
    replies: ArticleComment[];
}

// 文章列表响应类型
export interface ArticleCommentResponse {
    record: ArticleComment[];
    total: number;
    size: number;
    current: number;
    pages: number;
}

// 获取评论列表
export const getComments = async (params: CommentQueryParams): Promise<ApiResponse<ArticleCommentResponse>> => {
    return await apiClient.get(API_ENDPOINTS.FRONT.COMMENT.LIST, {params});
};

// 创建评论
export const createComment = async (params: CommentCreateParams): Promise<ApiResponse<number>> => {
    return await apiClient.post(API_ENDPOINTS.FRONT.COMMENT.CREATE, params);
};

// 更新评论
export const updateComment = async (params: CommentUpdateParams): Promise<ApiResponse<boolean>> => {
    return await apiClient.put(API_ENDPOINTS.FRONT.COMMENT.UPDATE, params);
};

// 删除评论
export const deleteComment = async (id: number): Promise<ApiResponse<boolean>> => {
    return await apiClient.delete(API_ENDPOINTS.FRONT.COMMENT.DELETE(id));
};

const commentService = {
    getComments,
    createComment,
    updateComment,
    deleteComment,

    // 管理员相关方法
    admin: {
        // 分页获取评论列表
        getCommentsByPage: async (params: {
            page?: number;
            pageSize?: number;
            keyword?: string;
            articleId?: number;
            userId?: number;
            status?: CommentStatusEnum;
        } = {}): Promise<ApiResponse<ArticleCommentResponse>> => {
            return await apiClient.get(API_ENDPOINTS.ADMIN.COMMENT.LIST_PAGE, { params });
        },

        // 更新评论状态
        updateCommentStatus: async (id: number, status: CommentStatusEnum, reviewReason?: string): Promise<ApiResponse<boolean>> => {
            return await apiClient.put(API_ENDPOINTS.ADMIN.COMMENT.UPDATE_STATUS(id), { status, reviewReason });
        },

        // 更新评论置顶状态
        updateCommentTop: async (id: number, top: CommentTopStatus, topOrder?: number): Promise<ApiResponse<boolean>> => {
            return await apiClient.put(API_ENDPOINTS.ADMIN.COMMENT.UPDATE_TOP(id), { top, topOrder });
        },

        // 删除评论
        deleteComment: async (id: number): Promise<ApiResponse<boolean>> => {
            return await apiClient.delete(API_ENDPOINTS.ADMIN.COMMENT.DELETE(id));
        }
    }
};

export default commentService;
