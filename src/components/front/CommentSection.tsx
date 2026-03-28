import React, { useEffect, useCallback } from 'react';
import { Spin } from 'antd';
import useCommentStore from '../../store/CommentStore';
import { getComments } from '../../services/commentService';
import CommentItem from './CommentItem';
import CommentInput from './CommentInput';
import InfiniteScrollContainer from '../common/InfiniteScrollContainer';
import { useInfiniteScroll } from '../../hooks';
import type { FrontArticleCommentList } from '../../types/comment';
import type { ApiPageResponse } from '../../types/common';
import { sortComments } from '../../utils';

// 评论组件属性接口
interface CommentSectionProps {
    articleId: number;
    currentUserId?: number;
    currentUserNickname?: string;
    currentUserAvatar?: string;
    onCommentCountChange?: (newCount: number) => void;
}

const CommentSection: React.FC<CommentSectionProps> = ({
                                                           articleId,
                                                           currentUserId,
                                                           currentUserNickname,
                                                           currentUserAvatar,
                                                           onCommentCountChange
                                                       }) => {
    const {
        commentCount,
        sortBy,
        setSortBy
    } = useCommentStore();
    // 评论列表无限滚动fetcher
    const commentsFetcher = useCallback(async (pageNum: number, pageSize: number): Promise<ApiPageResponse<FrontArticleCommentList>> => {
        const response = await getComments({
            articleId,
            pageNum: pageNum,
            pageSize: pageSize,
            sortBy
        });
        if (response.code !== 200) {
            throw new Error(response.message || '评论加载失败');
        }
        console.log('getComments response', response);
        // 处理评论排序，确保置顶评论始终显示在最上面
        const comments = response.data === null ? [] : response.data.record;
        const formattedComments = sortComments(comments, sortBy);
        return {
            record: formattedComments,
            total: response.data?.total || 0,
            pageNum: response.data?.pageNum || pageNum,
            pageSize: response.data?.pageSize || pageSize,
            pages: response.data?.pages || 0,
            isFirstPage: response.data?.isFirstPage || pageNum === 1,
            isLastPage: response.data?.isLastPage || false,
            prePage: response.data?.prePage || pageNum - 1,
            nextPage: response.data?.nextPage || pageNum + 1
        };
    }, [articleId, sortBy]);

    // 使用无限滚动hook
    const {
        data: comments,
        isLoading,
        isLoadingMore,
        isError,
        error,
        hasMore,
        loadMoreRef,
        refresh: refreshCommentsList,
        total
    } = useInfiniteScroll<FrontArticleCommentList>(commentsFetcher, {
        pageSize: 10,
        threshold: 0.1
    });
    // 当排序变化时刷新评论列表
    useEffect(() => {
        refreshCommentsList();
    }, [sortBy, refreshCommentsList]);
    // 当评论总数变化时更新CommentStore
    useEffect(() => {
        if (total > 0) {
            useCommentStore.getState().setCommentCount(total);
        }
    }, [total]);
    // 评论数变化时通知父组件
    useEffect(() => {
        if (onCommentCountChange) {
            onCommentCountChange(commentCount);
        }
    }, [commentCount, onCommentCountChange]);
    // 评论发布后的滚动效果
    const handleCommentSubmitSuccess = (): void => {
        // 评论发布成功后刷新第一页数据
        refreshCommentsList();
    };
    // 渲染评论项
    const renderCommentItem = (comment: FrontArticleCommentList): React.ReactNode => (
        <CommentItem
            key={comment.id}
            comment={comment}
            articleId={articleId}
            currentUserId={currentUserId}
            currentUserNickname={currentUserNickname}
            currentUserAvatar={currentUserAvatar}
        />
    );
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

            {/* 评论列表 - 无限滚动 */}
            <div className="space-y-6">
                <InfiniteScrollContainer
                    infiniteScroll={{
                        data: comments,
                        isLoading,
                        isLoadingMore,
                        isError,
                        error,
                        hasMore,
                        loadMoreRef,
                        refresh: refreshCommentsList,
                        total: total,
                        pageSize: 0,
                        setPageSize: async () => {
                        }
                    }}
                    renderItem={renderCommentItem}
                    loadingContent={
                        <div className="text-center py-10">
                            <div className="mb-2"><Spin size="large"/></div>
                            <div className="text-gray-500">加载中...</div>
                        </div>
                    }
                    emptyContent={
                        <div className="text-center py-10">
                            <p className="text-gray-500">暂无评论，快来抢沙发吧！</p>
                        </div>
                    }
                    noMoreText="已经到底了，没有更多评论了"
                    itemGap="24px"
                />
            </div>
        </div>
    );
};
export default CommentSection;
