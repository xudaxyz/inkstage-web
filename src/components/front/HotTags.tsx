import React from 'react';
import { Card, Tag } from 'antd';
import type { FrontTag } from '../../types/tag';
import { useTheme } from '../../store';
import { getTagColor } from '../../utils';

interface HotTagsProps {
  tags?: FrontTag[];
  onSelect?: (tag: FrontTag) => void;
}

const HotTags: React.FC<HotTagsProps> = ({ tags = [], onSelect }) => {
  const theme = useTheme();
  const isDarkMode = theme === 'dark';

  const handleTagClick = (e: React.MouseEvent, tag: FrontTag): void => {
    e.preventDefault();
    if (onSelect) {
      onSelect(tag);
    }
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
