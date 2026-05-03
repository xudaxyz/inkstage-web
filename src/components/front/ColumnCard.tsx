import React from 'react';
import { Avatar } from 'antd';
import { BookOutlined, EyeOutlined, UserOutlined, StarOutlined } from '@ant-design/icons';
import LazyImage from '../common/LazyImage';
import { ROUTES } from '../../constants/routes';
import type { ColumnListVO } from '../../types/column';

interface ColumnCardProps {
  column: ColumnListVO;
  layout?: 'vertical' | 'horizontal';
}

const ColumnCard: React.FC<ColumnCardProps> = ({ column, layout = 'vertical' }) => {
  const { id, name, description, coverImage, articleCount, nickname, avatar, readCount } = column;

  if (layout === 'horizontal') {
    return (
      <div
        className="flex gap-3 p-2 bg-white dark:bg-gray-800 rounded-lg border-b border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
        <div className="w-20 h-12 aspect-auto rounded-md overflow-hidden">
          <a href={ROUTES.COLUMN_DETAIL(id)} target="_blank" rel="noopener noreferrer">
            {coverImage ? (
              <LazyImage
                src={coverImage}
                alt={name}
                className="w-full h-full object-cover hover:opacity-90 transition-opacity"
              />
            ) : (
              <div
                className="w-full h-full text-xl bg-linear-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center">
                <span className="text-white text-xl font-bold px-2 text-center truncate">{name}</span>
              </div>
            )}
          </a>
        </div>
        <div className="flex-1 min-w-0 flex flex-col justify-between">
          <h3
            className="text-sm font-semibold text-gray-800 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 line-clamp-1 mb-2">
            <a
              href={ROUTES.COLUMN_DETAIL(id)}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              {name}
            </a>
          </h3>
          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 flex-wrap">
            <Avatar src={avatar} size={14} icon={<UserOutlined/>} className="shrink-0"/>
            <span className="truncate max-w-15 shrink-0">{nickname}</span>
            <span className="flex items-center gap-1 shrink-0">
              <BookOutlined/>
              {articleCount}
            </span>
            {readCount > 0 && (
              <span className="flex items-center gap-1 shrink-0">
                <EyeOutlined/>
                {readCount}
              </span>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
      <div className="aspect-video overflow-hidden">
        <a href={ROUTES.COLUMN_DETAIL(id)} target="_blank" rel="noopener noreferrer">
          {coverImage ? (
            <LazyImage
              src={coverImage}
              alt={name}
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div
              className="w-full h-full bg-linear-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center">
              <span className="text-white text-4xl font-bold px-4 text-center">{name}</span>
            </div>
          )}
        </a>
      </div>
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2 line-clamp-1">
          <a
            href={ROUTES.COLUMN_DETAIL(id)}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          >
            {name}
          </a>
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 line-clamp-2 leading-relaxed">{description}</p>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Avatar src={avatar} size={32} icon={<UserOutlined/>}/>
            <div className="flex flex-col">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{nickname}</span>
            </div>
          </div>
        </div>
        <div
          className="flex items-center gap-4 mt-3 pt-3 border-t border-gray-100 dark:border-gray-700 text-xs text-gray-500 dark:text-gray-400">
          <span className="flex items-center gap-1">
            <BookOutlined/>
            {articleCount}篇
          </span>
          <span className="flex items-center gap-1">
              <EyeOutlined/>
            {readCount}阅读
          </span>
          <span className="flex items-center gap-1">
            <StarOutlined/>
            {readCount}订阅
          </span>
        </div>
      </div>
    </div>
  );
};

export default React.memo(ColumnCard);
