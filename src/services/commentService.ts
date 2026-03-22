import { apiClient, API_ENDPOINTS } from '../api';
import type { ApiResponse } from '../types/common';
import type { CommentStatusEnum, CommentTopStatus } from '../types/enums';
import type {
    CommentQueryParams,
    CommentCreateParams,
    CommentUpdateParams,
    FrontArticleCommentResponse,
    AdminArticleCommentResponse
} from '../types/comment';
// 参数验证函数
const validateCommentQueryParams = (params: CommentQueryParams): void => {
    if (params.articleId == null || params.articleId <= 0) {
        throw new Error('文章ID必须是正整数');
    }
    if (params.pageNum != null && params.pageNum <= 0) {
        throw new Error('页码必须是正整数');
    }
    if (params.pageSize != null && params.pageSize <= 0) {
        throw new Error('每页数量必须是正整数');
    }
    if (params.offset != null && params.offset < 0) {
        throw new Error('偏移量必须是非负整数');
    }
    if (params.sortBy != null && !['hot', 'new'].includes(params.sortBy)) {
        throw new Error('排序方式必须是hot或new');
    }
};
const validateCommentCreateParams = (params: CommentCreateParams): void => {
    if (params.articleId == null || params.articleId <= 0) {
        throw new Error('文章ID必须是正整数');
    }
    if (params.parentId != null && params.parentId <= 0) {
        throw new Error('父评论ID必须是正整数');
    }
    if (!params.content || params.content.trim().length === 0) {
        throw new Error('评论内容不能为空');
    }
};
const validateCommentUpdateParams = (params: CommentUpdateParams): void => {
    if (params.id == null || params.id <= 0) {
        throw new Error('评论ID必须是正整数');
    }
    if (!params.content || params.content.trim().length === 0) {
        throw new Error('评论内容不能为空');
    }
};
const validateIdParam = (id: number): void => {
    if (id == null || id <= 0) {
        throw new Error('ID必须是正整数');
    }
};
// 获取评论列表
export const getComments = async (params: CommentQueryParams): Promise<ApiResponse<FrontArticleCommentResponse>> => {
    validateCommentQueryParams(params);
    return await apiClient.get(API_ENDPOINTS.FRONT.COMMENT.LIST, { params });
};
// 创建评论
export const createComment = async (params: CommentCreateParams): Promise<ApiResponse<number>> => {
    validateCommentCreateParams(params);
    return await apiClient.post(API_ENDPOINTS.FRONT.COMMENT.CREATE, params);
};
// 更新评论
export const updateComment = async (params: CommentUpdateParams): Promise<ApiResponse<boolean>> => {
    validateCommentUpdateParams(params);
    return await apiClient.put(API_ENDPOINTS.FRONT.COMMENT.UPDATE, params);
};
// 删除评论
export const deleteComment = async (id: number): Promise<ApiResponse<boolean>> => {
    validateIdParam(id);
    return await apiClient.delete(API_ENDPOINTS.FRONT.COMMENT.DELETE(id));
};
// 点赞评论
export const likeComment = async (id: number): Promise<ApiResponse<boolean>> => {
    validateIdParam(id);
    return await apiClient.post(API_ENDPOINTS.FRONT.COMMENT.LIKE(id));
};
// 点踩评论
export const dislikeComment = async (id: number): Promise<ApiResponse<boolean>> => {
    validateIdParam(id);
    return await apiClient.post(API_ENDPOINTS.FRONT.COMMENT.DISLIKE(id));
};
const commentService = {
    getComments,
    createComment,
    updateComment,
    deleteComment,
    likeComment,
    dislikeComment,
    // 管理员相关方法
    admin: {
        // 分页获取评论列表
        getCommentsByPage: async (params: {
            pageNum?: number;
            pageSize?: number;
            keyword?: string;
            articleId?: number;
            userId?: number;
            status?: CommentStatusEnum;
        } = {}): Promise<ApiResponse<AdminArticleCommentResponse>> => {
            if (params.pageNum != null && params.pageNum <= 0) {
                throw new Error('页码必须是正整数');
            }
            if (params.pageSize != null && params.pageSize <= 0) {
                throw new Error('每页数量必须是正整数');
            }
            if (params.articleId != null && params.articleId <= 0) {
                throw new Error('文章ID必须是正整数');
            }
            if (params.userId != null && params.userId <= 0) {
                throw new Error('用户ID必须是正整数');
            }
            return await apiClient.post(API_ENDPOINTS.ADMIN.COMMENT.LIST_PAGE, params);
        },
        // 更新评论状态
        updateCommentStatus: async (id: number, reviewStatus: CommentStatusEnum, reviewReason?: string): Promise<ApiResponse<boolean>> => {
            validateIdParam(id);
            return await apiClient.put(API_ENDPOINTS.ADMIN.COMMENT.UPDATE_STATUS(id), null, {
                params: {
                    reviewStatus,
                    reviewReason
                }
            });
        },
        // 更新评论置顶状态
        updateCommentTop: async (id: number, top: CommentTopStatus): Promise<ApiResponse<boolean>> => {
            validateIdParam(id);
            return await apiClient.put(API_ENDPOINTS.ADMIN.COMMENT.UPDATE_TOP(id), null, { params: { top } });
        },
        // 更新评论信息
        updateComment: async (id: number, content?: string, top?: CommentTopStatus, reviewStatus?: CommentStatusEnum, reviewReason?: string): Promise<ApiResponse<boolean>> => {
            validateIdParam(id);
            return await apiClient.put(API_ENDPOINTS.ADMIN.COMMENT.UPDATE(id), null, {
                params: {
                    content,
                    top,
                    reviewStatus,
                    reviewReason
                }
            });
        },
        // 删除评论
        deleteComment: async (id: number): Promise<ApiResponse<boolean>> => {
            validateIdParam(id);
            return await apiClient.delete(API_ENDPOINTS.ADMIN.COMMENT.DELETE(id));
        }
    }
};
export default commentService;
