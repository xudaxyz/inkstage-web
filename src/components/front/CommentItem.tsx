import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { Avatar, Popconfirm, Dropdown, Spin, Pagination } from 'antd';
import {
    LikeOutlined,
    DislikeOutlined,
    MessageOutlined,
    EditOutlined,
    DeleteOutlined,
    FlagOutlined,
    EllipsisOutlined,
    DownOutlined,
    UpOutlined
} from '@ant-design/icons';
import type { FrontArticleCommentList } from '../../types/comment';
import { CommentTopStatus } from '../../types/enums';
import ReplyItem from './ReplyItem';
import CommentInput from './CommentInput';
import useCommentStore from '../../store/CommentStore';
import commentService from '../../services/commentService';
import { getRelativeTime } from '../../utils';

interface CommentItemProps {
    comment: FrontArticleCommentList;
    articleId: number;
    currentUserId?: number;
    currentUserNickname?: string;
    currentUserAvatar?: string;
}

// 子评论每页条数
const REPLIES_PAGE_SIZE = 10;
// 默认显示的子评论数量
const DEFAULT_VISIBLE_REPLIES = 3;
const CommentItem: React.FC<CommentItemProps> = ({
                                                     comment,
                                                     articleId,
                                                     currentUserId,
                                                     currentUserNickname,
                                                     currentUserAvatar
                                                 }) => {
    const [showReplyForm, setShowReplyForm] = useState<{ [key: number]: boolean }>({});
    const [isExpanded, setIsExpanded] = useState(true);
    const [isRepliesExpanded, setIsRepliesExpanded] = useState(false);
    const [isLoadingReplies, setIsLoadingReplies] = useState(false);
    const [repliesCurrentPage, setRepliesCurrentPage] = useState(1);
    const [replies, setReplies] = useState<FrontArticleCommentList[]>([]);
    const [totalRepliesCount, setTotalRepliesCount] = useState(0);
    const [needsRepliesRefresh, setNeedsRepliesRefresh] = useState(false);
    const isLoadingRepliesRef = useRef(isLoadingReplies);
    const needsRepliesRefreshRef = useRef(needsRepliesRefresh);
    // 同步ref和state
    useEffect(() => {
        isLoadingRepliesRef.current = isLoadingReplies;
    }, [isLoadingReplies]);
    useEffect(() => {
        needsRepliesRefreshRef.current = needsRepliesRefresh;
    }, [needsRepliesRefresh]);
    const { toggleLike, toggleDislike, deleteComment, refreshComments } = useCommentStore();
    const handleReply = (commentId: number): void => {
        setShowReplyForm(prev => ({
            ...prev,
            [commentId]: !prev[commentId]
        }));
    };
    const handleDelete = async (commentId: number): Promise<void> => {
        const success = await deleteComment(commentId);
        if (success) {
            await refreshComments(articleId);
        }
    };
    const toggleExpand = (): void => {
        setIsExpanded(!isExpanded);
    };
    // 获取子评论列表
    const fetchReplies = useCallback(async (pageNum: number = 1, isRefresh: boolean = false): Promise<void> => {
        if (isLoadingRepliesRef.current) return;
        setIsLoadingReplies(true);
        try {
            const response = await commentService.getReplies(comment.id, pageNum, REPLIES_PAGE_SIZE, 'hot');
            if (response.code === 200 && response.data) {
                if (isRefresh) {
                    setReplies(response.data.record);
                } else {
                    setReplies(prev => [...prev, ...response.data.record]);
                }
                setTotalRepliesCount(response.data.total || 0);
            }
        } catch (error) {
            console.error('获取子评论失败:', error);
        } finally {
            setIsLoadingReplies(false);
        }
    }, [comment.id]);
    const toggleReplies = async (): Promise<void> => {
        if (!isRepliesExpanded) {
            // 首次展开时获取子评论
            await fetchReplies(1, true);
        }
        setIsRepliesExpanded(!isRepliesExpanded);
        // 切换时重置到第一页
        setRepliesCurrentPage(1);
    };
    const handleRepliesPageChange = useCallback(async (page: number): Promise<void> => {
        setRepliesCurrentPage(page);
        // 无论页码是多少，都重新获取对应页的数据
        await fetchReplies(page, true);
    }, [fetchReplies]);
    // 当评论更新或需要刷新时，重新获取子评论
    useEffect(() => {
        if (needsRepliesRefreshRef.current || comment.replies) {
            void fetchReplies(repliesCurrentPage, true);
            // 重置刷新标志
            setNeedsRepliesRefresh(false);
        }
    }, [comment.replies, repliesCurrentPage, fetchReplies, needsRepliesRefresh]);
    const isLongComment = comment.content.length > 300;
    const displayContent = isLongComment && !isExpanded ? `${comment.content.substring(0, 300)}...` : comment.content;
    // 处理子评论：默认显示点赞最多的3条
    const topReplies = useMemo(() => {
        if (!comment.replies || comment.replies.length === 0) {
            return [];
        }
        return [...comment.replies]
            .sort((a, b) => b.likeCount - a.likeCount)
            .slice(0, DEFAULT_VISIBLE_REPLIES);
    }, [comment.replies]);
    // 分页后的子评论
    const paginatedReplies = useMemo(() => {
        if (!isRepliesExpanded) {
            return topReplies;
        }
        return replies;
    }, [isRepliesExpanded, topReplies, replies]);
    // 子评论总数
    const totalReplies = isRepliesExpanded ? totalRepliesCount : (comment.replyCount || 0);
    // 是否需要分页
    const needPagination = isRepliesExpanded && totalReplies > REPLIES_PAGE_SIZE;
    // 是否需要展开按钮
    const needExpandButton = totalReplies > DEFAULT_VISIBLE_REPLIES;
    return (
        <div key={comment.id} className="border-b border-gray-50 dark:border-b dark:border-gray-700 pb-6 group">
            {/* 用户信息 */}
            <div className="flex items-center gap-2 mb-2">
                <Avatar
                    src={comment.avatar || undefined}
                    alt={comment.nickname}
                    className="w-8 h-8 shrink-0"
                />
                {comment.userId ? (
                    <a 
                        href={`/user/${comment.userId}`} 
                        className="font-bold text-[#373A40] dark:text-gray-200 ml-2 hover:text-blue-600 transition-colors"
                    >
                        {comment.nickname}
                    </a>
                ) : (
                    <span className="font-bold text-[#373A40] dark:text-gray-200 ml-2">{comment.nickname}</span>
                )}
                {comment.top === CommentTopStatus.TOP && (
                    <span
                        className="inline-flex items-end text-xs bg-red-100 text-red-600 px-2 py-1 rounded">置顶</span>
                )}
            </div>

            {/* 评论内容 */}
            <div className="ml-11 mb-3 text-gray-700 dark:text-gray-300 font-medium text-base leading-relaxed">
                {displayContent}
                {isLongComment && (
                    <button
                        onClick={toggleExpand}
                        className="text-blue-600 text-sm ml-2"
                    >
                        {isExpanded ? '收起' : '展开'}
                    </button>
                )}
            </div>

            {/* 评论操作 */}
            <div className="ml-12 flex items-center gap-4 text-sm text-gray-500 relative">
        <span className="flex items-center gap-1">
          {comment.createTime ? getRelativeTime(comment.createTime) : ''}
        </span>
                <button
                    className={`flex items-center min-w-7 ${comment.isLiked ? 'text-red-500' : 'text-gray-500'}`}
                    onClick={() => toggleLike(comment.id)}
                >
                    <LikeOutlined/>
                    <span className="min-h-1 ml-1">
            {comment.likeCount > 0 ? comment.likeCount : ''}
          </span>
                </button>
                <button
                    className={`flex items-center min-w-7 ${comment.isDisliked ? 'text-yellow-500' : 'text-gray-500'}`}
                    onClick={() => toggleDislike(comment.id)}
                >
                    <DislikeOutlined/>
                    <span className="min-h-1 ml-1">
            {comment.dislikeCount > 0 ? comment.dislikeCount : ''}
          </span>
                </button>
                <button
                    className="flex items-center min-w-10 mr-1 gap-1 text-gray-500 hover:text-blue-600"
                    onClick={() => handleReply(comment.id)}
                >
                    <MessageOutlined/>
                    回复
                </button>
                {/* 更多操作按钮 */}
                <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
                    <Dropdown
                        menu={{
                            items: [
                                {
                                    key: 'report',
                                    label: (
                                        <button
                                            className="flex items-center gap-1 text-gray-500 hover:text-blue-600 w-full text-left px-2 py-1">
                                            <FlagOutlined/>
                                            举报
                                        </button>
                                    )
                                },
                                ...(currentUserId === comment.userId ? [
                                    {
                                        key: 'edit',
                                        label: (
                                            <button
                                                className="flex items-center gap-1 text-gray-500 hover:text-blue-600 w-full text-left px-2 py-1">
                                                <EditOutlined/>
                                                编辑
                                            </button>
                                        )
                                    },
                                    {
                                        key: 'delete',
                                        label: (
                                            <Popconfirm
                                                title="确定要删除这条评论吗？"
                                                onConfirm={() => handleDelete(comment.id)}
                                                okText="确定"
                                                cancelText="取消"
                                            >
                                                <button
                                                    className="flex items-center gap-1 text-gray-500 hover:text-red-600 w-full text-left px-2 py-1">
                                                    <DeleteOutlined/>
                                                    删除
                                                </button>
                                            </Popconfirm>
                                        )
                                    }
                                ] : [])
                            ]
                        }}
                        placement="bottomRight"
                    >
                        <button className="flex items-center min-w-7 text-gray-500 hover:text-gray-700">
                            <EllipsisOutlined/>
                        </button>
                    </Dropdown>
                </div>
            </div>

            {/* 回复输入框 */}
            {showReplyForm[comment.id] && (
                <div className="ml-11 mt-3">
                    <CommentInput
                        articleId={articleId}
                        parentId={comment.id}
                        currentUserId={currentUserId}
                        currentUserNickname={currentUserNickname}
                        currentUserAvatar={currentUserAvatar}
                        onSubmitSuccess={() => {
                            setShowReplyForm(prev => ({ ...prev, [comment.id]: false }));
                            void refreshComments(articleId);
                            setNeedsRepliesRefresh(true);
                        }}
                    />
                </div>
            )}

            {/* 回复列表 */}
            {totalReplies > 0 && (
                <div className="ml-11 mt-4">
                    {/* 显示的回复 */}
                    <div className="space-y-4">
                        {paginatedReplies.map((reply) => (
                            <ReplyItem
                                key={`reply-${reply.id}`}
                                reply={reply}
                                articleId={articleId}
                                currentUserId={currentUserId}
                                currentUserNickname={currentUserNickname}
                                currentUserAvatar={currentUserAvatar}
                                topCommentId={comment.id}
                            />
                        ))}
                    </div>

                    {/* 展开/收起按钮和分页组件 */}
                    {needExpandButton && (
                        <div className="mt-3 flex flex-wrap items-center justify-start">
                            <button
                                onClick={toggleReplies}
                                className="flex items-center gap-1 text-sm text-gray-500 hover:text-blue-600"
                                disabled={isLoadingReplies}
                            >
                                {isLoadingReplies ? (
                                    <>
                                        <Spin size="small"/>
                                        <span>加载中...</span>
                                    </>
                                ) : isRepliesExpanded ? (
                                    <>
                                        <span>收起回复</span>
                                        <UpOutlined/>
                                    </>
                                ) : (
                                    <>
                                        <span>查看全部 {totalReplies} 条回复</span>
                                        <DownOutlined/>
                                    </>
                                )}
                            </button>

                            {/* 分页组件 */}
                            {isRepliesExpanded && needPagination && (
                                <div className="ml-6 flex items-center gap-2">
                                    <span
                                        className="text-sm text-gray-500">共 {Math.ceil(totalReplies / REPLIES_PAGE_SIZE)} 页</span>
                                    <Pagination
                                        current={repliesCurrentPage}
                                        pageSize={REPLIES_PAGE_SIZE}
                                        total={totalReplies}
                                        onChange={handleRepliesPageChange}
                                        size="small"
                                        showSizeChanger={false}
                                        showQuickJumper={false}
                                    />
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
export default CommentItem;
