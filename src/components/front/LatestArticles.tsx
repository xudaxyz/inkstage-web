import React from 'react';
import { Card, Typography  } from 'antd';
import type { LatestArticle } from '../../types/article';
import { formatDateTimeShort } from '../../utils';
import { useTheme } from '../../store';

interface LatestArticlesProps {
    articles?: LatestArticle[];
}

const Link = Typography.Link;

const LatestArticles: React.FC<LatestArticlesProps> = ({
  articles = []
}) => {
  const theme = useTheme();
  const isDarkMode = theme === 'dark';
  return (
    <Card
      title="最新文章"
      className="border-none shadow-sm bg-white dark:bg-gray-800"
    >
      <div className="latest-articles-list">
        {articles.map((article) => (
          <div
            key={article.id}
            className="flex items-start justify-between py-2 rounded-lg hover:bg-blue-50 dark:hover:bg-gray-700 transition-all duration-300"
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <Link
                  href={`/article/${article.id}`}
                  target="_blank"
                  className="text-sm font-medium transition-colors no-underline truncate"
                  style={{
                    color: isDarkMode ? '#e5e7eb' : '#1f2937',
                    '&:hover': {
                      color: '#0ea5e9'
                    }
                  } as React.CSSProperties}
                >
                  {article.title}
                </Link>
              </div>
            </div>
            <span className="text-xs flex items-center text-gray-500 dark:text-gray-400 ml-3 whitespace-nowrap shrink-0 mt-1">
              {article.publishTime ? formatDateTimeShort(article.publishTime) : ''}
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default LatestArticles;
