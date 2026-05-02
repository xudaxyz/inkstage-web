import React from 'react';
import { Button, Tag, Dropdown, Popover, Space, message } from 'antd';
import {
  BookOutlined,
  StarOutlined,
  CalendarOutlined,
  EyeOutlined,
  LikeOutlined,
  MessageOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ArrowLeftOutlined,
  MoreOutlined,
  EyeOutlined as ViewIcon
} from '@ant-design/icons';
import LazyImage from '../../../components/common/LazyImage';
import type { Column, ColumnArticle } from '../../../types/column';

interface ColumnDetailSectionProps {
  column: Column;
  articles: ColumnArticle[];
  totalColumns: number;
  totalArticles: number;
  totalSubscribers: number;
  onBack: () => void;
  onEditColumn: () => void;
  onCreateArticle: () => void;
  onViewArticle: (articleId: number) => void;
  onEditArticle: (articleId: number) => void;
  onDeleteArticle: (articleId: number) => void;
  onCreateColumn: () => void;
}

const ColumnDetailSection: React.FC<ColumnDetailSectionProps> = ({
  column,
  articles,
  totalColumns,
  totalArticles,
  totalSubscribers,
  onBack,
  onEditColumn,
  onCreateArticle,
  onViewArticle,
  onEditArticle,
  onDeleteArticle
}) => {
  const handleDeleteColumn = (): void => {
    void message.success('删除专栏功能开发中');
  };

  const handleSetInvisible = (): void => {
    void message.success('设置不可见功能开发中');
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg">
      {/* 统计信息和操作区域 */}
      <div className="flex sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-2 mb-6">
        <div className="flex items-center gap-1 sm:gap-2">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white">
            我的专栏 <span className="text-gray-500 dark:text-gray-300 text-base sm:text-lg">({totalColumns})</span>
          </h1>
          <div className="flex items-end gap-2 sm:gap-1 text-sm sm:text-base">
            <div className="flex items-end gap-1 px-2 py-0.5 sm:px-2 sm:py-1 bg-green-50 text-green-600 rounded-full dark:bg-green-900/30 dark:text-green-400">
              <span className="flex items-end">共</span>
              <span className="font-bold">{totalArticles}</span>
              <span>篇</span>
            </div>
            <div className="flex items-center gap-1 sm:gap-1 px-2 py-0.5 sm:px-1 sm:py-1 bg-purple-50 text-purple-600 rounded-full dark:bg-purple-900/30 dark:text-purple-400">
              <span className="font-bold">{totalSubscribers}</span>
              <span>订阅</span>
            </div>
          </div>
        </div>
        <Button
          type="default"
          icon={<ArrowLeftOutlined />}
          onClick={onBack}
          className="text-gray-600 dark:text-gray-400 w-fit"
        >
          返回
        </Button>
      </div>

      {/* 封面图区域 */}
      <div className="relative">
        <div className="h-48 md:h-64 lg:h-72 overflow-hidden rounded-t-lg">
          <LazyImage src={column.coverImage} alt={column.name} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent" />
        </div>
      </div>

      {/* 信息卡片 */}
      <div className="mx-auto relative ">
        <div className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-none dark:border-gray-700 rounded-b-lg shadow-lg p-6 mb-4">
          {/* 标题 */}
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-gray-200 mb-3">{column.name}</h2>

          {/* 简介 */}
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">{column.description}</p>

          {/* 标签 */}
          {column.tags && column.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {column.tags.map((tag) => (
                <Tag key={tag} color="blue">
                  {tag}
                </Tag>
              ))}
            </div>
          )}

          {/* 第四层：左侧元数据，右侧操作按钮 */}
          <div className="flex flex-wrap items-center gap-4 pt-4 border-t border-gray-100 dark:border-gray-700">
            {/* 左侧：元数据 */}
            <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
              <span className="flex items-center gap-1">
                <BookOutlined />
                {column.articleCount}
              </span>
              <span className="flex items-center gap-1">
                <StarOutlined />
                {column.subscriberCount}
              </span>
              <span className="flex items-center gap-1">
                <CalendarOutlined />
                <span className="hidden sm:inline">{column.createdAt}</span>
                <span className="sm:hidden">{column.createdAt.slice(0, 7)}</span>
              </span>
            </div>

            {/* 右侧：操作按钮 */}
            <div className="flex items-center gap-3 ml-auto">
              <Button type="primary" icon={<EditOutlined />} onClick={onEditColumn}>
                编辑
              </Button>
              <Dropdown
                menu={{
                  items: [
                    {
                      key: 'delete',
                      label: '删除专栏',
                      icon: <DeleteOutlined />,
                      danger: true,
                      onClick: handleDeleteColumn
                    },
                    {
                      key: 'invisible',
                      label: '设置不可见',
                      icon: <EyeOutlined />,
                      onClick: handleSetInvisible
                    }
                  ]
                }}
                trigger={['click']}
              >
                <Button type={'text'} icon={<MoreOutlined />}></Button>
              </Dropdown>
            </div>
          </div>
        </div>

        {/* 文章列表 */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-base font-medium text-gray-800 dark:text-gray-200">专栏文章 ({articles.length})</h3>
            <Button type="primary" icon={<PlusOutlined />} onClick={onCreateArticle}>
              新建文章
            </Button>
          </div>

          <div className="space-y-6">
            {articles.map((article) => (
              <div
                key={article.id}
                className="border-b border-gray-200 dark:border-gray-700 last:border-0 pb-6 last:pb-0"
              >
                <div className="flex gap-4">
                  {article.coverImage && (
                    <div
                      className="w-48 h-32 rounded-md overflow-hidden shrink-0 hidden sm:block cursor-pointer"
                      onClick={() => onViewArticle(article.id)}
                    >
                      <LazyImage
                        src={article.coverImage}
                        alt={article.title}
                        className="w-full h-full object-cover hover:opacity-90 transition-opacity"
                      />
                    </div>
                  )}
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    {/* 上半部分：标题 + 简介 */}
                    <div>
                      <h4
                        className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2 line-clamp-1 cursor-pointer hover:text-blue-600 dark:hover:text-blue-400"
                        onClick={() => onViewArticle(article.id)}
                      >
                        {article.title}
                      </h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">{article.summary}</p>
                    </div>

                    {/* 下半部分：元数据 + 操作按钮 */}
                    <div className="flex items-center justify-between gap-4 mt-3">
                      <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                        <span className="flex items-center gap-1">
                          <EyeOutlined />
                          {article.readCount}
                        </span>
                        <span className="flex items-center gap-1">
                          <LikeOutlined />
                          {article.likeCount}
                        </span>
                        <span className="flex items-center gap-1">
                          <MessageOutlined />
                          {article.commentCount}
                        </span>
                        <span className="flex items-center gap-1">
                          <CalendarOutlined />
                          {article.publishTime}
                        </span>
                      </div>
                      <Popover
                        placement="bottom"
                        content={
                          <Space orientation="vertical">
                            <Button
                              icon={<ViewIcon />}
                              size="small"
                              type="text"
                              onClick={() => onViewArticle(article.id)}
                            >
                              查看
                            </Button>
                            <Button
                              icon={<EditOutlined />}
                              size="small"
                              type="text"
                              onClick={() => onEditArticle(article.id)}
                            >
                              编辑
                            </Button>
                            <Button
                              icon={<DeleteOutlined />}
                              size="small"
                              type="text"
                              danger
                              onClick={() => onDeleteArticle(article.id)}
                            >
                              删除
                            </Button>
                          </Space>
                        }
                        trigger="click"
                      >
                        <Button icon={<MoreOutlined />} size="small" type="text" />
                      </Popover>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {articles.length === 0 && (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">暂无文章，试试新建一篇吧</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default React.memo(ColumnDetailSection);
