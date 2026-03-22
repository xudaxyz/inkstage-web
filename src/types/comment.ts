import type { CommentStatusEnum, CommentTopStatus, UserStatusEnum } from './enums';
import type { ApiPageResponse } from './common';

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

// 前台评论更新参数
export interface CommentUpdateParams {
    id: number;
    content: string;
}

// 前台评论列表
export interface FrontArticleCommentList {
    id: number;
    parentId: number;
    content: string;
    floor: string;
    likeCount: number;
    dislikeCount: number;
    replyCount: number;
    reviewStatus: CommentStatusEnum;
    top: CommentTopStatus;
    topOrder: number;
    createTime: string;
    updateTime: string;
    articleId: number;
    articleTitle: string;
    userId: number;
    nickname: string;
    avatar?: string;
    gender?: number;
    isLiked: boolean;
    isDisliked: boolean;
    userStatus?: UserStatusEnum;
    replies?: FrontArticleCommentList[];
}

// 后台评论管理
export interface AdminArticleCommentList {
    id: number;
    parentId: number;
    content: string;
    floor: string;
    likeCount: number;
    replyCount: number;
    reviewStatus: CommentStatusEnum;
    top: CommentTopStatus;
    topOrder: number;
    createTime: string;
    updateTime: string;
    articleId: number;
    articleTitle: string;
    userId: number;
    nickname: string;
    avatar?: string;
    gender?: number;
    userStatus?: UserStatusEnum;
    replies?: AdminArticleCommentList[];
}

// 文章列表响应类型
export type FrontArticleCommentResponse = ApiPageResponse<FrontArticleCommentList>;
export type AdminArticleCommentResponse = ApiPageResponse<AdminArticleCommentList>;
