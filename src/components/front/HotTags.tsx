import React from 'react';
import { Card, Tag } from 'antd';
import type { FrontTag } from '../../types/tag';
import { useTheme } from '../../store';

interface HotTagsProps {
    tags?: FrontTag[];
}

const HotTags: React.FC<HotTagsProps> = ({
                                             tags = []
                                         }) => {
    const theme = useTheme();
    const isDarkMode = theme === 'dark';
    return (
        <Card
            title="热门标签"
            style={{
                width: '100%',
                backgroundColor: `${isDarkMode ? '#1e2939' : 'white'}`
            }}
        >
            <div className="flex flex-wrap gap-4">
                {tags.map((tag, index) => (
                    <Tag
                        key={index}
                        className="cursor-pointer transition-all duration-200 hover:scale-105 hover:shadow-sm bg-gray-100 dark:bg-gray-200 text-gray-700 dark:text-gray-300"
                    >
                        <a href={`/tag/${tag.name}`}
                           className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-500">
                            {tag.name}
                        </a>
                    </Tag>
                ))}
            </div>
        </Card>
    );
};
export default HotTags;
