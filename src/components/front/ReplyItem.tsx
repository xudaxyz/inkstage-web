import React, { useState } from 'react';
import { Avatar, Dropdown } from 'antd';
import { LikeOutlined, DislikeOutlined, MessageOutlined, FlagOutlined, EllipsisOutlined } from '@ant-design/icons';
import type { ArticleComment } from '../../services/commentService';
import CommentInput from './CommentInput';
import useCommentStore from '../../store/CommentStore';

interface ReplyItemProps {
  reply: ArticleComment;
  articleId: number;
  currentUserId?: number;
  currentUserNickname?: string;
  currentUserAvatar?: string;
}

const ReplyItem: React.FC<ReplyItemProps> = ({
  reply,
  articleId,
  currentUserId,
  currentUserNickname,
  currentUserAvatar
}) => {
  const [showReplyForm, setShowReplyForm] = useState(false);
  
  const { toggleLike, toggleDislike, refreshComments } = useCommentStore();

  const handleReply = () => {
    setShowReplyForm(!showReplyForm);
  };

  return (
    <div key={`reply-${reply.id}`} className="pb-4 border-b border-gray-50 relative group">
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
          <div className="flex items-center gap-3 text-xs text-gray-500 relative">
            <span>{reply.createTime}</span>
            <button
              className={`flex items-center min-w-8 gap-1 ${reply.isLiked ? 'text-red-500' : 'text-gray-500'}`}
              onClick={() => toggleLike(reply.id)}
            >
              <LikeOutlined/>
              <span className="min-h-1">
                {reply.likeCount > 0 ? reply.likeCount : ''}
              </span>
            </button>
            <button
              className={`flex items-center min-w-8 gap-1 ${reply.isDisliked ? 'text-yellow-500' : 'text-gray-500'}`}
              onClick={() => toggleDislike(reply.id)}
            >
              <DislikeOutlined/>
              <span className="min-h-1">
                {reply.dislikeCount > 0 ? reply.dislikeCount : ''}
              </span>
            </button>
            <button
              className="flex items-center gap-1 text-gray-500 hover:text-blue-600"
              onClick={handleReply}
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
                    }
                  ]
                }}
                placement="bottomRight"
              >
                <button className="flex items-center min-w-6 text-gray-500 hover:text-gray-700">
                  <EllipsisOutlined/>
                </button>
              </Dropdown>
            </div>
          </div>

          {/* 回复输入框 */}
          {showReplyForm && (
            <div className="mt-3 ml-8">
              <CommentInput
                articleId={articleId}
                parentId={reply.id}
                currentUserId={currentUserId}
                currentUserNickname={currentUserNickname}
                currentUserAvatar={currentUserAvatar}
                onSubmitSuccess={() => {
                  setShowReplyForm(false);
                  void refreshComments(articleId);
                }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReplyItem;