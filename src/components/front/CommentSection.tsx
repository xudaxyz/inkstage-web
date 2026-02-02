import React, { useEffect, useRef } from 'react';
import { Spin } from 'antd';
import useCommentStore from '../../store/CommentStore';
import CommentItem from './CommentItem';
import CommentInput from './CommentInput';

// 评论组件属性接口
interface CommentSectionProps {
    articleId: number;
    currentUserId?: number;
    currentUserNickname?: string;
    currentUserAvatar?: string;
}

const CommentSection: React.FC<CommentSectionProps> = ({
                                                           articleId,
                                                           currentUserId,
                                                           currentUserNickname,
                                                           currentUserAvatar
                                                       }) => {
    const { 
        comments, 
        commentCount, 
        sortBy, 
        loading, 
        loadingMore, 
        hasMore,
        setSortBy,
        fetchComments
    } = useCommentStore();

    const listRef = useRef<HTMLDivElement>(null);

    // 初始化数据
    useEffect(() => {
        const loadData = async () => {
            await fetchComments(articleId, true);
        };
        void loadData();
    }, [articleId, fetchComments]);

    // 排序变化时刷新数据
    useEffect(() => {
        const loadData = async () => {
            await fetchComments(articleId, true);
        };
        void loadData();
    }, [articleId, sortBy, fetchComments]);

    // 处理滚动加载更多
    useEffect(() => {
        const handleScroll = () => {
            if (listRef.current) {
                const { scrollTop, clientHeight, scrollHeight } = listRef.current;
                if (scrollHeight - scrollTop - clientHeight < 200 && !loadingMore && hasMore) {
                    void fetchComments(articleId, false);
                }
            }
        };

        const currentListRef = listRef.current;
        if (currentListRef) {
            currentListRef.addEventListener('scroll', handleScroll);
        }

        return () => {
            if (currentListRef) {
                currentListRef.removeEventListener('scroll', handleScroll);
            }
        };
    }, [articleId, loadingMore, hasMore, fetchComments]);

    // 评论发布后的滚动效果
    const handleCommentSubmitSuccess = () => {
        // 滚动到评论列表顶部
        if (listRef.current) {
            listRef.current.scrollTop = 0;
        }
    };

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
            <div className="mb-8">
                <CommentInput
                    articleId={articleId}
                    currentUserId={currentUserId}
                    currentUserNickname={currentUserNickname}
                    currentUserAvatar={currentUserAvatar}
                    onSubmitSuccess={handleCommentSubmitSuccess}
                />
            </div>

            {/* 评论列表 */}
            <div className="space-y-6">
                {loading ? (
                    <div className="text-center py-10">
                        <Spin size="large" tip="加载中..." />
                    </div>
                ) : comments.length === 0 ? (
                    <div className="text-center py-10">
                        <p className="text-gray-500">暂无评论，快来抢沙发吧！</p>
                    </div>
                ) : (
                    <div 
                        ref={listRef}
                        className="overflow-y-auto space-y-6"
                        style={{ maxHeight: '800px' }}
                    >
                        {comments.map((comment) => (
                            <CommentItem
                                key={comment.id}
                                comment={comment}
                                articleId={articleId}
                                currentUserId={currentUserId}
                                currentUserNickname={currentUserNickname}
                                currentUserAvatar={currentUserAvatar}
                            />
                        ))}
                    </div>
                )}

                {/* 加载更多指示器 */}
                <div style={{ textAlign: 'center', padding: '20px 0' }}>
                    {loadingMore && <Spin tip="加载中..." />}
                    {!hasMore && comments.length > 0 && <p className="text-gray-500">没有更多评论了</p>}
                </div>
            </div>
        </div>
    );
};

export default CommentSection;