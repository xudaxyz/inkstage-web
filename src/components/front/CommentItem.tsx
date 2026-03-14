import React, { useState } from 'react';
import { Avatar, Popconfirm, Dropdown } from 'antd';
import { LikeOutlined, DislikeOutlined, MessageOutlined, EditOutlined, DeleteOutlined, FlagOutlined, EllipsisOutlined } from '@ant-design/icons';
import type { ArticleComment } from '../../services/commentService';
import { CommentTopStatus } from '../../types/enums/CommentEnum.ts';
import ReplyItem from './ReplyItem';
import CommentInput from './CommentInput';
import useCommentStore from '../../store/CommentStore';
import { formatDateTimeShort } from '../../utils/date';

interface CommentItemProps {
  comment: ArticleComment;
  articleId: number;
  currentUserId?: number;
  currentUserNickname?: string;
  currentUserAvatar?: string;
}

const CommentItem: React.FC<CommentItemProps> = ({
  comment,
  articleId,
  currentUserId,
  currentUserNickname,
  currentUserAvatar
}) => {
  const [showReplyForm, setShowReplyForm] = useState<{ [key: number]: boolean }>({});
  const [isExpanded, setIsExpanded] = useState(true);

  const { toggleLike, toggleDislike, deleteComment, refreshComments } = useCommentStore();

  const handleReply = (commentId: number) => {
    setShowReplyForm(prev => ({
      ...prev,
      [commentId]: !prev[commentId]
    }));
  };

  const handleDelete = async (commentId: number) => {
    const success = await deleteComment(commentId);
    if (success) {
      await refreshComments(articleId);
    }
  };

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  const isLongComment = comment.content.length > 300;
  const displayContent = isLongComment && !isExpanded ? `${comment.content.substring(0, 300)}...` : comment.content;

  return (
    <div key={comment.id} className="border-b border-gray-50 pb-6 group">
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
          {comment.createTime ? formatDateTimeShort(comment.createTime) : ''}
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
                    <button className="flex items-center gap-1 text-gray-500 hover:text-blue-600 w-full text-left px-2 py-1">
                      <FlagOutlined/>
                      举报
                    </button>
                  )
                },
                ...(currentUserId === comment.userId ? [
                  {
                    key: 'edit',
                    label: (
                      <button className="flex items-center gap-1 text-gray-500 hover:text-blue-600 w-full text-left px-2 py-1">
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
                        <button className="flex items-center gap-1 text-gray-500 hover:text-red-600 w-full text-left px-2 py-1">
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
            }}
          />
        </div>
      )}

      {/* 回复列表 */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="ml-11 mt-4 space-y-4">
          {comment.replies.map((reply) => (
            <ReplyItem
              key={`reply-${reply.id}`}
              reply={reply}
              articleId={articleId}
              currentUserId={currentUserId}
              currentUserNickname={currentUserNickname}
              currentUserAvatar={currentUserAvatar}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default CommentItem;
