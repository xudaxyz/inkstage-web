import React, {useCallback, useEffect, useRef, useState} from 'react';
import {Avatar, Button, Input, message, Modal, Popconfirm} from 'antd';
import {LikeOutlined, DislikeOutlined, MessageOutlined, EditOutlined, DeleteOutlined} from '@ant-design/icons';
import commentService from '../../services/commentService';
import type {
    CommentQueryParams,
    ArticleComment,
    CommentCreateParams,
    CommentUpdateParams
} from '../../services/commentService';
import {CommentTopStatus} from '../../types/enums/CommentEnum.ts';

// 评论组件属性接口
interface CommentSectionProps {
    articleId: number;
    currentUserId?: number;
    currentUserNickname?: string;
    currentUserAvatar?: string;
}

const {TextArea} = Input;

const CommentSection: React.FC<CommentSectionProps> = ({
                                                           articleId,
                                                           currentUserId,
                                                           currentUserNickname,
                                                           currentUserAvatar
                                                       }) => {
    // 状态管理
    const [comments, setComments] = useState<ArticleComment[]>([]);
    const [commentCount, setCommentCount] = useState(0);
    const [sortBy, setSortBy] = useState<'hot' | 'new'>('hot');
    const [commentContent, setCommentContent] = useState('');
    const [loading, setLoading] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [replyingToCommentId, setReplyingToCommentId] = useState<number | null>(null);
    const [replyingToUser, setReplyingToUser] = useState<string>('');
    const [replyContents, setReplyContents] = useState<{ [key: number]: string }>({});
    const [showReplyForm, setShowReplyForm] = useState<{ [key: number]: boolean }>({});
    const [isEditing, setIsEditing] = useState(false);
    const [editingComment, setEditingComment] = useState<ArticleComment | null>(null);
    const [editContent, setEditContent] = useState('');

    // 引用
    const pageRef = useRef(page);
    const loadingMoreRef = useRef(loadingMore);
    const hasMoreRef = useRef(hasMore);
    const observerRef = useRef<HTMLDivElement>(null);
    const intersectionObserverRef = useRef<IntersectionObserver | null>(null);

    useEffect(() => {
        pageRef.current = page;
    }, [page]);

    useEffect(() => {
        loadingMoreRef.current = loadingMore;
    }, [loadingMore]);

    useEffect(() => {
        hasMoreRef.current = hasMore;
    }, [hasMore]);

    // 获取评论列表
    const fetchComments = useCallback(async (isRefresh = false) => {
        try {
            const currentPage = isRefresh ? 1 : pageRef.current;
            // 构建查询参数
            const params: CommentQueryParams = {
                articleId,
                pageNum: currentPage,
                pageSize: 10,
                sortBy
            };

            const response = await commentService.getComments(params);
            console.log(response);
            if (response.code === 200 && response.data) {
                const formattedComments = response.data.record || [];

                if (isRefresh) {
                    setComments(formattedComments);
                    setPage(2);
                    setCommentCount(response.data.total || 0);
                } else {
                    setComments(prevComments => {
                        const existingIds = new Set(prevComments.map(comment => comment.id));
                        const newComments = formattedComments.filter(comment => !existingIds.has(comment.id));

                        if (newComments.length > 0) {
                            setPage(prev => prev + 1);
                            return [...prevComments, ...newComments];
                        }
                        return prevComments;
                    });
                }
                // 更新是否有更多
                setHasMore(currentPage < response.data.pages);
            }
        } catch {
            setLoading(false);
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    }, [articleId, sortBy]);

    // 提交评论
    const submitComment = async () => {
        if (!commentContent.trim()) {
            message.warning('请输入评论内容');
            return;
        }

        if (!currentUserId) {
            message.warning('您还没有登录，请先登录！');
            return;
        }

        try {
            setIsSubmitting(true);

            // 构建评论参数
            const params: CommentCreateParams = {
                articleId,
                parentId: replyingToCommentId || undefined,
                content: commentContent
            };

            // 调用真实API
            const response = await commentService.createComment(params);

            if (response.code === 200) {
                // 评论创建成功，刷新评论列表
                await fetchComments(true);
                setCommentContent('');
                setReplyingToCommentId(null)
                setReplyingToUser('')
                message.success(response.message || '评论发布成功');
            } else {
                message.error(response.message || '评论发布失败');
            }
        } catch {
            setIsSubmitting(false);
        } finally {
            setIsSubmitting(false);
        }
    };

    // 打开编辑弹窗
    const handleEdit = (comment: ArticleComment) => {
        setEditingComment(comment);
        setEditContent(comment.content);
        setIsEditing(true);
    };

    // 保存编辑
    const handleSaveEdit = async () => {
        if (!editContent.trim() || !editingComment) {
            message.warning('请输入评论内容');
            return;
        }

        try {
            setIsSubmitting(true);
            // 构建更新参数
            const params: CommentUpdateParams = {
                id: editingComment.id,
                content: editContent
            };

            // 调用真实API
            const response = await commentService.updateComment(params);

            if (response.code === 200) {
                // 编辑成功，刷新评论列表
                await fetchComments(true);
                setIsEditing(false);
                setEditingComment(null);
                setEditContent('');
                message.success('评论编辑成功');
            } else {
                message.error(response.message || '评论编辑失败');
            }
        } catch {
            message.error('评论编辑失败');
        } finally {
            setIsSubmitting(false);
        }
    };

    // 删除评论
    const handleDelete = async (commentId: number) => {
        try {
            setIsSubmitting(true);

            // 调用真实API
            const response = await commentService.deleteComment(commentId);

            if (response.code === 200) {
                // 删除成功，刷新评论列表
                await fetchComments(true);
                message.success('评论删除成功');
            } else {
                message.error(response.message || '评论删除失败');
            }
        } catch {
            message.error('评论删除失败');
        } finally {
            setIsSubmitting(false);
        }
    };

    // 递归更新评论或回复的状态
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

    // 点赞评论
    const handleLike = async (commentId: number) => {
        try {

            // 模拟延迟
            await new Promise(resolve => setTimeout(resolve, 200));

            // 更新本地状态
            setComments(prev => updateCommentStatus(prev, commentId, comment => ({
                ...comment,
                likeCount: comment.isLiked ? comment.likeCount - 1 : comment.likeCount + 1,
                isLiked: !comment.isLiked,
                isDisliked: false
            })));
        } catch {
            message.error('操作失败');
        }
    };

    // 点踩评论
    const handleDislike = async (commentId: number) => {
        try {
            // 模拟 API 请求
            // 实际项目中替换为真实的 API 调用
            // const response = await commentService.dislikeComment(commentId);

            // 模拟延迟
            await new Promise(resolve => setTimeout(resolve, 200));

            // 更新本地状态
            setComments(prev => updateCommentStatus(prev, commentId, comment => ({
                ...comment,
                dislikeCount: comment.isDisliked ? comment.dislikeCount - 1 : comment.dislikeCount + 1,
                isDisliked: !comment.isDisliked,
                isLiked: false
            })));
        } catch {
            message.error('操作失败');
        }
    };

    // 回复评论
    const handleReply = (commentId: number, nickname: string) => {
        // 切换回复表单显示状态
        setShowReplyForm(prev => ({
            ...prev,
            [commentId]: !prev[commentId]
        }));
        // 如果是显示回复表单，初始化内容
        if (!showReplyForm[commentId]) {
            setReplyContents(prev => ({
                ...prev,
                [commentId]: `@${nickname} `
            }));
            setReplyingToCommentId(commentId);
            setReplyingToUser(nickname);
        } else {
            // 隐藏回复表单时重置状态
            setReplyingToCommentId(null);
            setReplyingToUser('');
        }
        console.log('回复评论:', commentId, nickname);
    };

    // 提交回复
    const submitReply = async (commentId: number) => {
        const replyContent = replyContents[commentId] || '';

        if (!replyContent.trim()) {
            message.warning('请输入回复内容');
            return;
        }

        if (!currentUserId) {
            message.warning('您还没有登录，请先登录！');
            return;
        }

        try {
            setIsSubmitting(true);

            // 构建评论参数
            const params: CommentCreateParams = {
                articleId,
                parentId: commentId,
                content: replyContent
            };

            // 调用真实API
            const response = await commentService.createComment(params);

            if (response.code === 200) {
                // 评论创建成功，刷新评论列表
                await fetchComments(true);
                // 隐藏回复表单并重置状态
                setShowReplyForm(prev => ({
                    ...prev,
                    [commentId]: false
                }));
                setReplyContents(prev => ({
                    ...prev,
                    [commentId]: ''
                }));
                setReplyingToCommentId(null);
                setReplyingToUser('');
                message.success(response.message || '回复发布成功');
            } else {
                message.error(response.message || '回复发布失败');
            }
        } catch (error) {
            console.error('回复提交失败:', error);
            message.error('回复发布失败');
        } finally {
            setIsSubmitting(false);
        }
    };

    // 初始化数据
    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            await fetchComments(true);
        };
        void loadData();
    }, [articleId, sortBy, fetchComments]);

    // 设置无限滚动
    useEffect(() => {
        if (observerRef.current) {
            // 清除之前的观察器
            if (intersectionObserverRef.current) {
                intersectionObserverRef.current.disconnect();
            }

            // 创建新的观察器
            intersectionObserverRef.current = new IntersectionObserver(
                (entries) => {
                    const entry = entries[0];
                    if (entry.isIntersecting && hasMoreRef.current && !loadingMoreRef.current) {
                        setLoadingMore(true);
                        void fetchComments(false);
                    }
                },
                {
                    threshold: 0.1
                }
            );

            // 开始观察
            intersectionObserverRef.current.observe(observerRef.current);
        }

        // 清理函数
        return () => {
            if (intersectionObserverRef.current) {
                intersectionObserverRef.current.disconnect();
            }
        };
    }, [fetchComments]);

    return (
        <div className="mt-10">
            {/* 评论标题和排序 */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                    <h3 className="text-xl font-semibold text-gray-800">评论</h3>
                    <span className="text-gray-600 text-sm">{commentCount}</span>
                </div>
                <div className="flex items-center gap-1">
                    <button
                        className={`text-sm ${sortBy === 'hot' ? 'text-blue-600 font-medium' : 'text-gray-500'}`}
                        onClick={() => setSortBy('hot')}
                    >
                        最热
                    </button>
                    <span className="text-gray-300">|</span>
                    <button
                        className={`text-sm ${sortBy === 'new' ? 'text-blue-600 font-medium' : 'text-gray-500'}`}
                        onClick={() => setSortBy('new')}
                    >
                        最新
                    </button>
                </div>
            </div>

            {/* 评论输入框 */}
            <div className="flex gap-4 mb-8">
                <Avatar
                    src={currentUserAvatar || undefined}
                    alt={currentUserNickname}
                    className="w-10 h-10 shrink-0"
                />
                <div className="flex-1">
                    {/* 回复提示 */}
                    {replyingToUser && (
                        <div className="flex items-center justify-between mb-2 text-sm">
                            <button
                                onClick={() => {
                                    setReplyingToCommentId(null);
                                    setReplyingToUser('');
                                    setCommentContent('');
                                }}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                取消
                            </button>
                        </div>
                    )}
                    <TextArea
                        rows={3}
                        placeholder={currentUserId ? "写下你的评论..." : "请登录后评论"}
                        value={commentContent}
                        onChange={(e) => setCommentContent(e.target.value)}
                        className="border rounded-lg focus:border-blue-400 focus:ring-1 focus:ring-blue-400"
                    />
                    <div className="flex justify-end mt-2">
                        {currentUserId ? (
                            <Button
                                type="primary"
                                onClick={submitComment}
                                loading={isSubmitting}
                                className={`${commentContent.trim() ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-300'} text-white`}
                            >
                                发布
                            </Button>
                        ) : (
                            <div className="flex items-center gap-2">
                                <Button
                                    type="primary"
                                    onClick={() => message.warning('您还没有登录，请先登录！')}
                                    className="bg-gray-300 text-white"
                                >
                                    发布
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* 评论列表 */}
            <div className="space-y-6">
                {loading ? (
                    <div className="text-center py-10">
                        <p className="text-gray-500">加载中...</p>
                    </div>
                ) : comments.length === 0 ? (
                    <div className="text-center py-10">
                        <p className="text-gray-500">暂无评论，快来抢沙发吧！</p>
                    </div>
                ) : (
                    comments.map((comment) => (
                        <div key={comment.id} className="border-b border-gray-50 pb-6">
                            {/* 用户信息 */}
                            <div className="flex items-center gap-2 mb-2">
                                <Avatar
                                    src={comment.avatar || undefined}
                                    alt={comment.nickname}
                                    className="w-8 h-8 shrink-0"
                                />
                                <span className="font-bold text-[#373A40] ml-2">{comment.nickname}</span>
                                {comment.top === CommentTopStatus.TOP && (
                                    <span
                                        className="inline-flex items-end text-xs bg-red-100 text-red-600 px-2 py-1 rounded">置顶</span>
                                )}
                            </div>

                            {/* 评论内容 */}
                            <div className="ml-11 mb-3 text-gray-700 leading-relaxed">
                                {comment.content}
                            </div>

                            {/* 评论操作 */}
                            <div className="ml-12 flex items-center gap-4 text-sm text-gray-500">
                                <span className="flex items-center gap-1">
                                    {comment.createTime}
                                </span>
                                <button
                                    className={`flex items-center min-w-7 ${comment.isLiked ? 'text-red-500' : 'text-gray-500'}`}
                                    onClick={() => handleLike(comment.id)}
                                >
                                    <LikeOutlined/>
                                    <span className="min-h-1 ml-1">
                                        {comment.likeCount > 0 ? comment.likeCount : ''}
                                    </span>
                                </button>
                                <button
                                    className={`flex items-center min-w-7 ${comment.isDisliked ? 'text-yellow-500' : 'text-gray-500'}`}
                                    onClick={() => handleDislike(comment.id)}
                                >
                                    <DislikeOutlined/>
                                    <span className="min-h-1 ml-1">
                                        {comment.dislikeCount > 0 ? comment.dislikeCount : ''}
                                    </span>
                                </button>
                                <button
                                    className="flex items-center min-w-10 mr-1 gap-1 text-gray-500 hover:text-blue-600"
                                    onClick={() => handleReply(comment.id, comment.nickname)}
                                >
                                    <MessageOutlined/>
                                    回复
                                </button>
                                {/* 编辑和删除按钮，只有评论作者才能看到 */}
                                {currentUserId === comment.userId && (
                                    <>
                                        <button
                                            className="flex items-center min-w-10 mr-1 gap-1 text-gray-500 hover:text-blue-600"
                                            onClick={() => handleEdit(comment)}
                                        >
                                            <EditOutlined/>
                                            编辑
                                        </button>
                                        <Popconfirm
                                            title="确定要删除这条评论吗？"
                                            onConfirm={() => handleDelete(comment.id)}
                                            okText="确定"
                                            cancelText="取消"
                                        >
                                            <button
                                                className="flex items-center min-w-10 mr-1 gap-1 text-gray-500 hover:text-red-600">
                                                <DeleteOutlined/>
                                                删除
                                            </button>
                                        </Popconfirm>
                                    </>
                                )}
                            </div>

                            {/* 回复输入框 */}
                            {showReplyForm[comment.id] && (
                                <div className="ml-11 mt-3 flex gap-3">
                                    <Avatar
                                        src={currentUserAvatar || undefined}
                                        alt={currentUserNickname}
                                        className="w-8 h-8 shrink-0"
                                    />
                                    <div className="flex-1">
                                        <TextArea
                                            rows={2}
                                            placeholder="写下你的回复..."
                                            value={replyContents[comment.id] || ''}
                                            onChange={(e) => setReplyContents(prev => ({
                                                ...prev,
                                                [comment.id]: e.target.value
                                            }))}
                                            className="border rounded-lg focus:border-blue-400 focus:ring-1 focus:ring-blue-400"
                                        />
                                        <div className="flex justify-end mt-2 gap-2">
                                            <Button
                                                onClick={() => {
                                                    setShowReplyForm(prev => ({
                                                        ...prev,
                                                        [comment.id]: false
                                                    }));
                                                    setReplyingToCommentId(null);
                                                    setReplyingToUser('');
                                                }}
                                                className="text-gray-500"
                                            >
                                                取消
                                            </Button>
                                            <Button
                                                type="primary"
                                                onClick={() => submitReply(comment.id)}
                                                loading={isSubmitting}
                                                className={`${(replyContents[comment.id] || '').trim() ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-300'} text-white`}
                                            >
                                                回复
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* 回复列表 */}
                            {comment.replies && comment.replies.length > 0 && (
                                <div className="ml-11 mt-4 space-y-4">
                                    {comment.replies.map((reply) => (
                                        <div key={`reply-${reply.id}`} className="pb-4 border-b border-gray-50">
                                            <div className="flex items-start gap-3">
                                                <Avatar
                                                    src={reply.avatar || undefined}
                                                    alt={reply.nickname}
                                                    className="w-6 h-6 shrink-0 mt-0.5"
                                                />
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-3 mb-1">
                                                        <span
                                                            className="font-bold text-[#373A40] text-sm">{reply.nickname}
                                                        </span>
                                                    </div>
                                                    <div className="mb-2 text-gray-600 text-sm leading-relaxed">
                                                        {reply.content}
                                                    </div>
                                                    <div className="flex items-center gap-3 text-xs text-gray-500">
                                                        <span>{reply.createTime}</span>
                                                        <button
                                                            className={`flex items-center min-w-8 gap-1 ${reply.isLiked ? 'text-red-500' : 'text-gray-500'}`}
                                                            onClick={() => handleLike(reply.id)}
                                                        >
                                                            <LikeOutlined/>
                                                            <span className="min-h-1">
                                                                {reply.likeCount > 0 ? reply.likeCount : ''}
                                                            </span>
                                                        </button>
                                                        <button
                                                            className={`flex items-center min-w-8 gap-1 ${reply.isDisliked ? 'text-yellow-500' : 'text-gray-500'}`}
                                                            onClick={() => handleDislike(reply.id)}
                                                        >
                                                            <DislikeOutlined/>
                                                            <span className="min-h-1">
                                                                {reply.dislikeCount > 0 ? reply.dislikeCount : ''}
                                                            </span>
                                                        </button>
                                                        <button
                                                            className="flex items-center gap-1 text-gray-500 hover:text-blue-600"
                                                            onClick={() => handleReply(reply.id, reply.nickname)}
                                                        >
                                                            <MessageOutlined/>
                                                            回复
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* 回复的回复输入框 */}
                                            {showReplyForm[reply.id] && (
                                                <div className="ml-8 mt-3 flex gap-3">
                                                    <Avatar
                                                        src={currentUserAvatar || undefined}
                                                        alt={currentUserNickname}
                                                        className="w-6 h-6 shrink-0"
                                                    />
                                                    <div className="flex-1">
                                                        <TextArea
                                                            rows={2}
                                                            placeholder="写下你的回复..."
                                                            value={replyContents[reply.id] || ''}
                                                            onChange={(e) => setReplyContents(prev => ({
                                                                ...prev,
                                                                [reply.id]: e.target.value
                                                            }))}
                                                            className="border rounded-lg focus:border-blue-400 focus:ring-1 focus:ring-blue-400"
                                                        />
                                                        <div className="flex justify-end mt-2 gap-2">
                                                            <Button
                                                                size="small"
                                                                onClick={() => {
                                                                    setShowReplyForm(prev => ({
                                                                        ...prev,
                                                                        [reply.id]: false
                                                                    }));
                                                                    setReplyingToCommentId(null);
                                                                    setReplyingToUser('');
                                                                }}
                                                                className="text-gray-500"
                                                            >
                                                                取消
                                                            </Button>
                                                            <Button
                                                                size="small"
                                                                type="primary"
                                                                onClick={() => submitReply(reply.id)}
                                                                loading={isSubmitting}
                                                                className={`${(replyContents[reply.id] || '').trim() ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-300'} text-white`}
                                                            >
                                                                回复
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))
                )}

                {/* 加载更多指示器 */}
                <div ref={observerRef} style={{textAlign: 'center', padding: '20px 0'}}>
                    {loadingMore && <p className="text-gray-500">加载中...</p>}
                    {!hasMore && comments.length > 0 && <p className="text-gray-500">没有更多评论了</p>}
                </div>
            </div>

            {/* 编辑评论弹窗 */}
            <Modal
                title="编辑评论"
                open={isEditing}
                onOk={handleSaveEdit}
                onCancel={() => {
                    setIsEditing(false);
                    setEditingComment(null);
                    setEditContent('');
                }}
                confirmLoading={isSubmitting}
                okText="保存"
                cancelText="取消"
            >
                <TextArea
                    rows={4}
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    placeholder="请输入评论内容"
                    className="w-full"
                />
            </Modal>
        </div>
    );
};

export default CommentSection;