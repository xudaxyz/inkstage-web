import React from 'react';
import {Card, Tag} from 'antd';

interface HotTagsProps {
    tags?: { name: string; count: number }[];
}


const HotTags: React.FC<HotTagsProps> = ({
                                             tags = [
                                                 {name: 'React', count: 128},
                                                 {name: 'TypeScript', count: 96},
                                                 {name: 'Node.js', count: 84},
                                                 {name: 'Next.js', count: 72},
                                                 {name: 'Tailwind CSS', count: 64},
                                                 {name: 'Ant Design', count: 56},
                                                 {name: '前端', count: 144},
                                                 {name: '后端', count: 112},
                                                 {name: '大数据', count: 88},
                                                 {name: '人工智能', count: 92}
                                             ]
                                         }) => {
    return (
        <Card
            title="热门标签"
            className="border-none shadow-sm"
        >
            <div className="flex flex-wrap gap-4">
                {tags.map((tag, index) => (
                    <Tag
                        key={index}
                        className="cursor-pointer transition-all duration-200 hover:scale-105 hover:shadow-sm"
                    >
                        <a href="#" className="text-sm font-medium">
                            {tag.name}
                        </a>
                    </Tag>
                ))}
            </div>
        </Card>
    );
};

export default HotTags;