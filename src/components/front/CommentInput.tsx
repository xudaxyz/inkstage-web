import React, { useState } from 'react';
import { Avatar, Button, Input, Popover, message } from 'antd';
import { SmileOutlined } from '@ant-design/icons';
import useCommentStore from '../../store/CommentStore';

const { TextArea } = Input;

interface CommentInputProps {
    articleId: number;
    parentId?: number;
    currentUserId?: number;
    currentUserNickname?: string;
    currentUserAvatar?: string;
    onSubmitSuccess?: () => void;
}

const CommentInput: React.FC<CommentInputProps> = ({
  articleId,
  parentId,
  currentUserId,
  currentUserNickname,
  currentUserAvatar,
  onSubmitSuccess
}) => {
  const [content, setContent] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const { createComment, isSubmitting } = useCommentStore();

  const MAX_LENGTH = 500;

  // 常用表情
  const emojis = [
    '😊', '😂', '❤️', '👍', '👎', '🔥', '🎉', '👏',
    '🤔', '😮', '😢', '😡', '😍', '🤣', '🤩', '🤗'
  ];

  const handleEmojiClick = (emoji: string) => {
    setContent(prev => prev + emoji);
  };

  const handleSubmit = async () => {
    if (!currentUserId) {
      message.warning('您还没有登录，请先登录！');
      return;
    }

    if (!content.trim()) {
      message.warning('请输入评论内容');
      return;
    }

    if (content.length > MAX_LENGTH) {
      message.warning(`评论内容不能超过${MAX_LENGTH}字`);
      return;
    }

    const result = await createComment({
      articleId,
      parentId,
      content
    });

    if (result) {
      setContent('');
      message.success('评论发布成功');
      if (onSubmitSuccess) {
        onSubmitSuccess();
      }
    } else {
      message.error('评论发布失败');
    }
  };

  const emojiPicker = (
    <div className="grid grid-cols-8 gap-2 p-2">
      {emojis.map((emoji, index) => (
        <button
          key={index}
          className="text-2xl cursor-pointer hover:bg-gray-100 rounded p-1"
          onClick={() => handleEmojiClick(emoji)}
        >
          {emoji}
        </button>
      ))}
    </div>
  );

  return (
    <div className="flex gap-3">
      <Avatar
        src={currentUserAvatar || undefined}
        alt={currentUserNickname}
        className="w-8 h-8 shrink-0"
      />
      <div className="flex-1">
        <div className="relative">
          <TextArea
            rows={2}
            placeholder="写下你的评论..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="border rounded-lg focus:border-blue-400 focus:ring-1 focus:ring-blue-400"
            maxLength={MAX_LENGTH}
          />
          <div className="absolute bottom-2 right-2 flex items-center gap-2">
            <Popover
              content={emojiPicker}
              title="选择表情"
              trigger="click"
              open={showEmojiPicker}
              onOpenChange={setShowEmojiPicker}
            >
              <Button
                icon={<SmileOutlined/>}
                size="small"
                className="text-gray-500"
              />
            </Popover>
            <span
              className={`text-xs ${content.length > MAX_LENGTH * 0.8 ? 'text-red-500' : 'text-gray-400'}`}>
              {content.length}/{MAX_LENGTH}
            </span>
          </div>
        </div>
        <div className="flex justify-end mt-2 gap-2">
          <Button
            onClick={() => {
              setContent('');
              setShowEmojiPicker(false);
            }}
            className="text-gray-500"
          >
                        取消
          </Button>
          <Button
            type="primary"
            onClick={handleSubmit}
            loading={isSubmitting}
            className={`${content.trim() ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-300'} text-white`}
          >
                        发布
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CommentInput;
