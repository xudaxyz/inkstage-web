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
    return await apiClient.get(API_ENDPOINTS.COMMENT.LIST, {params});
};

// 创建评论
export const createComment = async (params: CommentCreateParams): Promise<ApiResponse<number>> => {
    return await apiClient.post(API_ENDPOINTS.COMMENT.CREATE, params);
};

// 更新评论
export const updateComment = async (params: CommentUpdateParams): Promise<ApiResponse<boolean>> => {
    return await apiClient.put(API_ENDPOINTS.COMMENT.UPDATE, params);
};

// 删除评论
export const deleteComment = async (id: number): Promise<ApiResponse<boolean>> => {
    return await apiClient.delete(`${API_ENDPOINTS.COMMENT.DELETE}/${id}`);
};

const commentService = {
    getComments,
    createComment,
    updateComment,
    deleteComment
};

export default commentService;
