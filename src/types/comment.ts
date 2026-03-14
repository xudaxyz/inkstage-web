import type { CommentStatusEnum, CommentTopStatus } from './enums/CommentEnum';
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
export type ArticleCommentResponse = ApiPageResponse<ArticleComment>;
