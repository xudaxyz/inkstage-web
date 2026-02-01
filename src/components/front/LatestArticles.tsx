import React from 'react';
import { Card } from 'antd';
import type { LatestArticle } from '../../services/articleService.ts';

interface LatestArticlesProps {
  articles?: LatestArticle[];
}

const LatestArticles: React.FC<LatestArticlesProps> = ({ 
  articles = [
    { id: 1, title: 'React 19 新特性详解', publishTime: '2026-01-25' },
    { id: 2, title: 'TypeScript 5.9 实用技巧', publishTime: '2026-01-24' },
    { id: 3, title: 'Next.js 15 性能优化指南', publishTime: '2026-01-23' },
    { id: 4, title: 'Tailwind CSS 4 最佳实践', publishTime: '2026-01-22' },
    { id: 5, title: 'Node.js 20 新 API 介绍', publishTime: '2026-01-21' }
  ] 
}) => {
  return (
    <Card 
      title="最新文章" 
      className="border-none shadow-sm"
    >
      <div className="latest-articles-list">
        {articles.map((article) => (
          <div 
            key={article.id} 
            className="flex items-start justify-between py-2 rounded-lg hover:bg-blue-50 transition-all duration-300"
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <a
                  href={`/article/${article.id}`} 
                  className="text-[#696868] hover:text-blue-500 text-sm font-medium transition-colors truncate no-underline"
                  style={{ color: '#696868', textDecoration: 'none' }}
                >
                  {article.title}
                </a>
              </div>
            </div>
            <span className="text-xs text-gray-500 ml-3 whitespace-nowrap shrink-0 mt-1">
              {article.publishTime}
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default LatestArticles;