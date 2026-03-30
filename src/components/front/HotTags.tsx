import React from 'react';
import { Card, Tag } from 'antd';

import type { FrontTag } from '../../types/tag';

interface HotTagsProps {
    tags?: FrontTag[];
}


const HotTags: React.FC<HotTagsProps> = ({
  tags = [
    { id: 1, name: 'React', slug: 'react', description: '', status: 1 },
    { id: 2, name: 'TypeScript', slug: 'typescript', description: '', status: 1 },
    { id: 3, name: 'Node.js', slug: 'node-js', description: '', status: 1 },
    { id: 4, name: 'Next.js', slug: 'next-js', description: '', status: 1 },
    { id: 5, name: 'Tailwind CSS', slug: 'tailwind-css', description: '', status: 1 },
    { id: 6, name: 'Ant Design', slug: 'ant-design', description: '', status: 1 },
    { id: 7, name: '前端', slug: 'frontend', description: '', status: 1 },
    { id: 8, name: '后端', slug: 'backend', description: '', status: 1 },
    { id: 9, name: '大数据', slug: 'big-data', description: '', status: 1 },
    { id: 10, name: '人工智能', slug: 'ai', description: '', status: 1 }
  ]
}) => {
  return (
    <Card
      title="热门标签"
      className="border-none shadow-sm bg-white dark:bg-gray-800"
    >
      <div className="flex flex-wrap gap-4">
        {tags.map((tag, index) => (
          <Tag
            key={index}
            className="cursor-pointer transition-all duration-200 hover:scale-105 hover:shadow-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
          >
            <a href={`/tag/${tag.name}`} className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-500">
              {tag.name}
            </a>
          </Tag>
        ))}
      </div>
    </Card>
  );
};

export default HotTags;
