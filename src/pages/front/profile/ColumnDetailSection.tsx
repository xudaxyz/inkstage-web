import React from 'react';
import { Button, Dropdown, message, Popover, Space } from 'antd';
import {
  BookOutlined,
  CalendarOutlined,
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
  EyeOutlined as ViewIcon,
  LikeOutlined,
  MessageOutlined,
  MoreOutlined,
  PlusOutlined
} from '@ant-design/icons';
import LazyImage from '../../../components/common/LazyImage';
import { getRelativeTime } from '../../../utils';
import type { MyColumnVO } from '../../../types/column';
import type { ColumnArticleListVO } from '../../../types/article';

interface ColumnDetailSectionProps {
  column: MyColumnVO;
  articles: ColumnArticleListVO[];
  onEditColumn: () => void;
  onCreateArticle: () => void;
  onViewArticle: (articleId: number) => void;
  onEditArticle: (articleId: number) => void;
  onDeleteArticle: (articleId: number) => void;
}

const ColumnDetailSection: React.FC<ColumnDetailSectionProps> = ({
                                                                   column,
                                                                   articles,
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
      {/* 封面图区域 */}
      <div className="relative">
        <div className="h-48 md:h-64 lg:h-72 overflow-hidden rounded-t-lg">
          <LazyImage src={column.coverImage} alt={column.name} className="w-full h-full object-cover"/>
          <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent"/>
        </div>
      </div>

      {/* 信息卡片 */}
      <div className="mx-auto relative ">
        <div
          className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-none dark:border-gray-700 rounded-b-lg shadow-lg p-6 mb-4">
          {/* 标题 */}
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-gray-200 mb-3">{column.name}</h2>

          {/* 简介 */}
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">{column.description}</p>

          {/* 第四层：左侧元数据，右侧操作按钮 */}
          <div className="flex flex-wrap items-center gap-4 pt-4 border-t border-gray-100 dark:border-gray-700">
            {/* 左侧：元数据 */}
            <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
              <span className="flex items-center gap-1">
                <BookOutlined/>
                {column.articleCount}
              </span>
              <span className="flex items-center gap-1">
                <EyeOutlined/>
                {column.readCount}
              </span>
              <span className="flex items-center gap-1">
                <CalendarOutlined/>
                <span className="hidden sm:inline">{getRelativeTime(column.createTime)}</span>
                <span className="sm:hidden">{column.createTime.slice(0, 7)}</span>
              </span>
            </div>

            {/* 右侧：操作按钮 */}
            <div className="flex items-center gap-3 ml-auto">
              <Button variant="solid" color="cyan" icon={<EditOutlined/>} onClick={onEditColumn}>
                编辑
              </Button>
              <Dropdown
                menu={{
                  items: [
                    {
                      key: 'delete',
                      label: '删除专栏',
                      icon: <DeleteOutlined/>,
                      danger: true,
                      onClick: handleDeleteColumn
                    },
                    {
                      key: 'invisible',
                      label: '设置不可见',
                      icon: <EyeOutlined/>,
                      onClick: handleSetInvisible
                    }
                  ]
                }}
                trigger={['click']}
              >
                <Button type={'text'} icon={<MoreOutlined/>}></Button>
              </Dropdown>
            </div>
          </div>
        </div>

        {/* 文章列表 */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-base font-medium text-gray-800 dark:text-gray-200">专栏文章 ({articles.length})</h3>
            <Button variant="outlined" color="blue" icon={<PlusOutlined/>} onClick={onCreateArticle}>
              新建专栏文章
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
                          <EyeOutlined/>
                          {article.readCount}
                        </span>
                        <span className="flex items-center gap-1">
                          <LikeOutlined/>
                          {article.likeCount}
                        </span>
                        <span className="flex items-center gap-1">
                          <MessageOutlined/>
                          {article.commentCount}
                        </span>
                        <span className="flex items-center gap-1">
                          <CalendarOutlined/>
                          {getRelativeTime(article.publishTime)}
                        </span>
                      </div>
                      <Popover
                        placement="bottom"
                        content={
                          <Space orientation="vertical">
                            <Button
                              icon={<ViewIcon/>}
                              size="small"
                              type="text"
                              onClick={() => onViewArticle(article.id)}
                            >
                              查看
                            </Button>
                            <Button
                              icon={<EditOutlined/>}
                              size="small"
                              type="text"
                              onClick={() => onEditArticle(article.id)}
                            >
                              编辑
                            </Button>
                            <Button
                              icon={<DeleteOutlined/>}
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
                        <Button icon={<MoreOutlined/>} size="small" type="text"/>
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
