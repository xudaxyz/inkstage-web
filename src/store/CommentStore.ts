import { create } from 'zustand';
import commentService from '../services/commentService';
import {
    type FrontArticleCommentList,
    type CommentCreateParams,
    type CommentUpdateParams
} from '../types/comment';
import { message } from 'antd';
import { sortComments, updateCommentStatus } from '../utils/commentUtils';

interface CommentState {
    // 状态
    comments: FrontArticleCommentList[];
    commentCount: number;
    sortBy: 'hot' | 'new';
    loading: boolean;
    pageNum: number;
    isSubmitting: boolean;

    // 操作
    setComments: (comments: FrontArticleCommentList[]) => void;
    setCommentCount: (count: number) => void;
    setSortBy: (sortBy: 'hot' | 'new') => void;
    setLoading: (loading: boolean) => void;
    setPageNum: (pageNum: number) => void;
    setIsSubmitting: (isSubmitting: boolean) => void;

    // 方法
    fetchComments: (articleId: number, pageNum: number) => Promise<void>;
    createComment: (params: CommentCreateParams) => Promise<boolean>;
    updateComment: (params: CommentUpdateParams) => Promise<boolean>;
    deleteComment: (commentId: number) => Promise<boolean>;
    toggleLike: (commentId: number) => Promise<void>;
    toggleDislike: (commentId: number) => Promise<void>;
    refreshComments: (articleId: number) => Promise<void>;
}

const useCommentStore = create<CommentState>((set, get) => {

    return {
        // 初始状态
        comments: [],
        commentCount: 0,
        sortBy: 'hot',
        loading: false,
        pageNum: 1,
        isSubmitting: false,

        // 状态设置函数
        setComments: (comments: FrontArticleCommentList[]): void => set({ comments }),
        setCommentCount: (commentCount: number): void => set({ commentCount }),
        setSortBy: (sortBy: 'hot' | 'new'): void => set({ sortBy }),
        setLoading: (loading: boolean): void => set({ loading }),
        setPageNum: (pageNum: number): void => set({ pageNum }),
        setIsSubmitting: (isSubmitting: boolean): void => set({ isSubmitting }),

        fetchComments: async (articleId: number, pageNum: number): Promise<void> => {
            const sortBy = get().sortBy;

            try {
                get().setLoading(true);

                const response = await commentService.getComments({
                    articleId,
                    pageNum: pageNum,
                    pageSize: 10,
                    sortBy
                });
                console.log('getComments response', response);
                if (response.code === 200 && response.data) {
                    const comments = response.data.record || [];
                    const formattedComments = sortComments(comments, sortBy);

                    get().setComments(formattedComments);
                    get().setPageNum(pageNum);
                    get().setCommentCount(response.data.total);
                }
            } catch (error) {
                console.error('获取评论失败:', error);
            } finally {
                get().setLoading(false);
            }
        },

        createComment: async (params: CommentCreateParams): Promise<boolean> => {
            get().setIsSubmitting(true);
            const response = await commentService.createComment(params);
            if (response.code !== 200) {
                message.error(response.message || '创建评论失败');
            }
            get().setIsSubmitting(false);
            return response.code === 200;
        },

        updateComment: async (params: CommentUpdateParams): Promise<boolean> => {
            get().setIsSubmitting(true);
            const response = await commentService.updateComment(params);

            if (response.code !== 200) {
                message.error(response.message || '更新评论失败');
            }
            get().setIsSubmitting(false);
            return response.code === 200;
        },

        deleteComment: async (commentId: number): Promise<boolean> => {
            get().setIsSubmitting(true);
            const response = await commentService.deleteComment(commentId);

            if (response.code !== 200) {
                message.error(response.message || '删除评论失败');
                return true;
            }
            get().setIsSubmitting(false);
            return response.code === 200;

        },

        toggleLike: async (commentId: number): Promise<void> => {
            try {
                // 乐观更新
                const currentComments = get().comments;
                const updatedComments = updateCommentStatus(currentComments, commentId, comment => ({
                    ...comment,
                    likeCount: comment.isLiked ? comment.likeCount - 1 : comment.likeCount + 1,
                    isLiked: !comment.isLiked,
                    isDisliked: false
                }));
                get().setComments(updatedComments);

                // 调用真实的API
                await commentService.likeComment(commentId);
            } catch (error) {
                console.error('点赞失败:', error);
                // 失败时回滚
                // 这里可以重新获取评论列表来恢复状态
            }
        },

        toggleDislike: async (commentId: number): Promise<void> => {
            try {
                // 乐观更新
                const currentComments = get().comments;
                const updatedComments = updateCommentStatus(currentComments, commentId, comment => ({
                    ...comment,
                    dislikeCount: comment.isDisliked ? comment.dislikeCount - 1 : comment.dislikeCount + 1,
                    isDisliked: !comment.isDisliked,
                    isLiked: false
                }));
                get().setComments(updatedComments);

                // 调用真实的API
                await commentService.dislikeComment(commentId);
            } catch (error) {
                console.error('点踩失败:', error);
                // 失败时回滚
                // 这里可以重新获取评论列表来恢复状态
            }
        },

        refreshComments: async (articleId: number): Promise<void> => {
            await get().fetchComments(articleId, 1);
        }
    };
});

// 导出评论状态的具体选择器，减少不必要的重渲染
export const useComments = () : FrontArticleCommentList[] => useCommentStore((state) => state.comments);
export const useCommentCount = () : number => useCommentStore((state) => state.commentCount);
export const useSortBy = () : string | undefined => useCommentStore((state) => state.sortBy);
export const useCommentLoading = () : boolean => useCommentStore((state) => state.loading);
export const useCommentPage = () : number => useCommentStore((state) => state.pageNum);
export const useIsSubmitting = () : boolean => useCommentStore((state) => state.isSubmitting);

export default useCommentStore;
