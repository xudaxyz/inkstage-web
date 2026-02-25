import {create} from 'zustand';
import commentService, {
    type ArticleComment,
    type CommentCreateParams,
    type CommentUpdateParams
} from '../services/commentService';
import {message} from "antd";

interface CommentState {
    // 状态
    comments: ArticleComment[];
    commentCount: number;
    sortBy: 'hot' | 'new';
    loading: boolean;
    page: number;
    isSubmitting: boolean;

    // 操作
    setComments: (comments: ArticleComment[]) => void;
    setCommentCount: (count: number) => void;
    setSortBy: (sortBy: 'hot' | 'new') => void;
    setLoading: (loading: boolean) => void;
    setPage: (page: number) => void;
    setIsSubmitting: (isSubmitting: boolean) => void;

    // 方法
    fetchComments: (articleId: number, page: number) => Promise<void>;
    createComment: (params: CommentCreateParams) => Promise<boolean>;
    updateComment: (params: CommentUpdateParams) => Promise<boolean>;
    deleteComment: (commentId: number) => Promise<boolean>;
    toggleLike: (commentId: number) => Promise<void>;
    toggleDislike: (commentId: number) => Promise<void>;
    refreshComments: (articleId: number) => Promise<void>;
}

const useCommentStore = create<CommentState>((set, get) => {
    // 递归更新评论状态
    const updateCommentStatus = (comments: ArticleComment[], commentId: number, updateFn: (comment: ArticleComment) => ArticleComment): ArticleComment[] => {
        return comments.map(comment => {
            if (comment.id === commentId) {
                return updateFn(comment);
            }
            if (comment.replies && comment.replies.length > 0) {
                return {
                    ...comment,
                    replies: updateCommentStatus(comment.replies, commentId, updateFn)
                };
            }
            return comment;
        });
    };

    return {
        // 初始状态
        comments: [],
        commentCount: 0,
        sortBy: 'hot',
        loading: false,
        page: 1,
        isSubmitting: false,

        // 状态设置函数
        setComments: (comments) => set({comments}),
        setCommentCount: (commentCount) => set({commentCount}),
        setSortBy: (sortBy) => set({sortBy}),
        setLoading: (loading) => set({loading}),
        setPage: (page) => set({page}),
        setIsSubmitting: (isSubmitting) => set({isSubmitting}),

        // 方法
        fetchComments: async (articleId, page) => {
            const sortBy = get().sortBy;

            try {
                get().setLoading(true);

                const response = await commentService.getComments({
                    articleId,
                    pageNum: page,
                    pageSize: 10,
                    sortBy
                });

                if (response.code === 200 && response.data) {
                    const formattedComments = response.data.record || [];
                    get().setComments(formattedComments);
                    get().setPage(page);
                    get().setCommentCount(response.data.total || 0);
                }
            } catch (error) {
                console.error('获取评论失败:', error);
            } finally {
                get().setLoading(false);
            }
        },

        createComment: async (params) => {
            get().setIsSubmitting(true);
            const response = await commentService.createComment(params);
            if (response.code !== 200) {
                message.error(response.message || '创建评论失败');
            }
            get().setIsSubmitting(false);
            return response.code === 200
        },

        updateComment: async (params) => {
            get().setIsSubmitting(true);
            const response = await commentService.updateComment(params);

            if (response.code !== 200) {
                message.error(response.message || '更新评论失败');
            }
            get().setIsSubmitting(false);
            return response.code === 200;
        },

        deleteComment: async (commentId) => {
            get().setIsSubmitting(true);
            const response = await commentService.deleteComment(commentId);

            if (response.code !== 200) {
                message.error(response.message || '删除评论失败');
                return true;
            }
            get().setIsSubmitting(false);
            return response.code === 200;

        },

        toggleLike: async (commentId) => {
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

                // 这里应该调用真实的API
                // await commentService.likeComment(commentId);
                await new Promise(resolve => setTimeout(resolve, 200));
            } catch (error) {
                console.error('点赞失败:', error);
                // 失败时回滚
                // await get().fetchComments(articleId, true);
            }
        },

        toggleDislike: async (commentId) => {
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

                // 这里应该调用真实的API
                // await commentService.dislikeComment(commentId);
                await new Promise(resolve => setTimeout(resolve, 200));
            } catch (error) {
                console.error('点踩失败:', error);
                // 失败时回滚
                // await get().fetchComments(articleId, true);
            }
        },

        refreshComments: async (articleId) => {
            await get().fetchComments(articleId, 1);
        }
    };
});

export default useCommentStore;