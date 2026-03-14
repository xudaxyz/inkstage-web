import React, { useEffect, useState } from 'react';
import { Spin, Pagination } from 'antd';
import useCommentStore from '../../store/CommentStore';
import CommentItem from './CommentItem';
import CommentInput from './CommentInput';

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
    comments,
    commentCount,
    sortBy,
    loading,
    setSortBy,
    fetchComments
  } = useCommentStore();

  const [currentPage, setCurrentPage] = useState(1);

  // 初始化数据
  useEffect(() => {
    const loadData = async () => {
      await fetchComments(articleId, 1);
    };
    void loadData();
  }, [articleId, fetchComments]);

  // 排序变化时刷新数据
  useEffect(() => {
    const loadData = async () => {
      await fetchComments(articleId, 1);
      setCurrentPage(1);
    };
    void loadData();
  }, [articleId, sortBy, fetchComments]);

  // 评论数变化时通知父组件
  useEffect(() => {
    if (onCommentCountChange) {
      onCommentCountChange(commentCount);
    }
  }, [commentCount, onCommentCountChange]);

  // 处理分页变化
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    void fetchComments(articleId, page);
  };

  // 评论发布后的滚动效果
  const handleCommentSubmitSuccess = () => {
    // 评论发布成功后刷新第一页数据
    void fetchComments(articleId, 1);
    setCurrentPage(1);
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
            <div className="mb-2"><Spin size="large" /></div>
            <div className="text-gray-500">加载中...</div>
          </div>
        ) : comments.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-gray-500">暂无评论，快来抢沙发吧！</p>
          </div>
        ) : (
          <div className="space-y-6">
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

        {/* 分页组件 */}
        {comments.length > 0 && (
          <div className="mt-8 flex justify-center">
            <Pagination
              current={currentPage}
              pageSize={10}
              total={commentCount}
              onChange={handlePageChange}
              showSizeChanger={false}
              showQuickJumper
              showTotal={(total) => `共 ${total} 条评论`}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default CommentSection;
