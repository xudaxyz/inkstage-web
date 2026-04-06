import React from 'react';
import { Card, Tag } from 'antd';
import type { FrontTag } from '../../types/tag';
import { useTheme } from '../../store';

interface HotTagsProps {
  tags?: FrontTag[];
  onSelect?: (tag: FrontTag) => void;
}

const HotTags: React.FC<HotTagsProps> = ({ tags = [], onSelect }) => {
  const theme = useTheme();
  const isDarkMode = theme === 'dark';

  // 预设标签颜色
  const tagColors = ['magenta', 'red', 'volcano', 'orange', 'gold', 'lime', 'green', 'cyan', 'blue', 'purple'];

  const handleTagClick = (e: React.MouseEvent, tag: FrontTag): void => {
    e.preventDefault();
    if (onSelect) {
      onSelect(tag);
    }
  };

  const getTagColor = (tag: FrontTag): string => {
    // 基于标签名称生成一个固定的哈希值
    let hash = 0;
    for (let i = 0; i < tag.name.length; i++) {
      const char = tag.name.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // 转换为32位整数
    }
    // 使用哈希值获取颜色索引，确保每个标签都有固定的颜色
    const colorIndex = Math.abs(hash) % tagColors.length;
    return tagColors[colorIndex];
  };

  return (
    <Card
      title="热门标签"
      style={{
        width: '100%',
        backgroundColor: `${isDarkMode ? '#1e2939' : 'white'}`
      }}
    >
      <div className="flex flex-wrap gap-4">
        {tags.map((tag) => (
          <Tag
            variant="solid"
            color={getTagColor(tag)}
            className="cursor-pointer transition-all duration-200 hover:scale-105 hover:shadow-sm"
          >
            <a
              href={`/tag/${tag.name}`}
              className="text-xs font-normal"
              onClick={(e) => handleTagClick(e, tag)}
              style={{ color: 'inherit' }}
            >
              {tag.name}
            </a>
          </Tag>
        ))}
      </div>
    </Card>
  );
};

export default HotTags;
