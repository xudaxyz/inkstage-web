import React, { useCallback, useMemo } from 'react';
import { Button, Dropdown, message, Modal } from 'antd';
import {
  BookOutlined,
  CalendarOutlined,
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
  LikeOutlined,
  MessageOutlined,
  MoreOutlined,
  PlusOutlined, StarOutlined,
  SwapOutlined
} from '@ant-design/icons';
import LazyImage from '../../../components/common/LazyImage';
import { getRelativeTime } from '../../../utils';
import type { MyColumnVO } from '../../../types/column';
import type { ColumnArticleListVO } from '../../../types/article';
import { VisibleStatus } from '../../../types/enums';

interface ColumnDetailSectionProps {
  column: MyColumnVO;
  articles: ColumnArticleListVO[];
  allColumns: MyColumnVO[];
  onEditColumn: () => void;
  onCreateArticle: () => void;
  onViewArticle: (articleId: number) => void;
  onEditArticle: (articleId: number) => void;
  onRemoveArticleFromColumn: (articleId: number) => Promise<void>;
  onMoveArticleToColumn: (articleId: number, targetColumnId: number) => Promise<void>;
  onToggleVisibility: (visible: VisibleStatus) => Promise<void>;
  onRefresh: () => void;
}

const ColumnDetailSection: React.FC<ColumnDetailSectionProps> = ({
                                                                   column,
                                                                   articles,
                                                                   allColumns,
                                                                   onEditColumn,
                                                                   onCreateArticle,
                                                                   onViewArticle,
                                                                   onEditArticle,
                                                                   onRemoveArticleFromColumn,
                                                                   onMoveArticleToColumn,
                                                                   onToggleVisibility,
                                                                   onRefresh
                                                                 }) => {
  const otherColumns = useMemo(() => {
    return allColumns.filter(col => col.id !== column.id);
  }, [allColumns, column.id]);

  const handleToggleVisibility = useCallback((visible: VisibleStatus): void => {
    const actionText = visible === VisibleStatus.PRIVATE ? '设为私有' : visible === VisibleStatus.PUBLIC ? '设为公开' : '设为仅粉丝可见';
    Modal.confirm({
      title: `确认${actionText}`,
      content: `确定要将专栏「${column.name}」${actionText}吗？`,
      okText: '确认',
      cancelText: '取消',
      onOk: async () => {
        try {
          await onToggleVisibility(visible);
          message.success(`${actionText}成功`);
        } catch {
          message.error(`${actionText}失败`);
        }
      }
    });
  }, [column.name, onToggleVisibility]);

  const handleRemoveArticle = useCallback((articleId: number, articleTitle: string): void => {
    Modal.confirm({
      title: '确认移出文章',
      content: (
        <>
          <p>确定要将文章「{articleTitle}」从专栏「{column.name}」中移出吗？</p>
          <p className="text-gray-500 mt-2">文章不会被删除，只是从本专栏移除。</p>
        </>
      ),
      okText: '确认',
      cancelText: '取消',
      onOk: async () => {
        try {
          await onRemoveArticleFromColumn(articleId);
          message.success('文章已移出专栏');
          onRefresh();
        } catch {
          message.error('移出文章失败');
        }
      }
    });
  }, [column.name, onRemoveArticleFromColumn, onRefresh]);

  const handleMoveArticle = useCallback((articleId: number, targetColumnId: number, articleTitle: string): void => {
    const targetColumn = allColumns.find(col => col.id === targetColumnId);
    if (!targetColumn) return;

    Modal.confirm({
      title: '确认移动文章',
      content: (
        <>
          <p>确定要将文章「{articleTitle}」移动到专栏「{targetColumn.name}」吗？</p>
        </>
      ),
      okText: '确认',
      cancelText: '取消',
      onOk: async () => {
        try {
          await onMoveArticleToColumn(articleId, targetColumnId);
          message.success('文章已移动到「' + targetColumn.name + '」');
          onRefresh();
        } catch {
          message.error('移动文章失败');
        }
      }
    });
  }, [allColumns, onMoveArticleToColumn, onRefresh]);

  const renderVisibilityMenu = useCallback(() => {
    const items = [
      {
        key: 'public',
        label: '设为公开',
        icon: <EyeOutlined/>,
        onClick: (): void => handleToggleVisibility(VisibleStatus.PUBLIC)
      },
      {
        key: 'private',
        label: '设为私有',
        icon: <EyeOutlined style={{ opacity: 0.5 }}/>,
        onClick: (): void => handleToggleVisibility(VisibleStatus.PRIVATE)
      },
      {
        key: 'followers',
        label: '仅粉丝可见',
        icon: <BookOutlined/>,
        onClick: (): void => handleToggleVisibility(VisibleStatus.FOLLOWERS_ONLY)
      }
    ];
    return { items };
  }, [handleToggleVisibility]);

  const getArticleActionsMenu = useCallback((article: ColumnArticleListVO) => {
    const moveMenuItems = otherColumns.length > 0
      ? otherColumns.map(col => ({
        key: `move-to-${col.id}`,
        label: col.name,
        icon: <BookOutlined/>,
        onClick: (): void => handleMoveArticle(article.id, col.id, article.title)
      }))
      : [
        {
          key: 'no-columns',
          label: '暂无其他专栏',
          disabled: true
        }
      ];

    return {
      items: [
        {
          key: 'view',
          label: '查看',
          icon: <EyeOutlined/>,
          onClick: (): void => onViewArticle(article.id)
        },
        {
          key: 'edit',
          label: '编辑',
          icon: <EditOutlined/>,
          onClick: (): void => onEditArticle(article.id)
        },
        { type: 'divider' as const },
        {
          key: 'move',
          label: '移动到',
          icon: <SwapOutlined/>,
          children: moveMenuItems
        },
        {
          key: 'remove',
          label: '从专栏移出',
          icon: <DeleteOutlined/>,
          danger: true,
          onClick: (): void => handleRemoveArticle(article.id, article.title)
        }
      ]
    };
  }, [otherColumns, onViewArticle, onEditArticle, handleMoveArticle, handleRemoveArticle]);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg">
      {/* 封面图区域 */}
      {column.coverImage && (
        <div className="relative">
          <div className="h-48 md:h-64 lg:h-72 overflow-hidden rounded-t-lg">
            <LazyImage src={column.coverImage} alt={column.name} className="w-full h-full object-cover"/>
          </div>
        </div>
      )}

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
                <StarOutlined/>
                {column.subscriptionCount}
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
                menu={renderVisibilityMenu()}
                trigger={['click']}
              >
                <Button type={'text'} icon={<MoreOutlined/>}></Button>
              </Dropdown>
            </div>
          </div>
        </div>

        {/* 文章列表 */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
          <div className="flex items-center border-b border-gray-100 justify-between pb-6">
            <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200">专栏文章 ({articles.length})</h3>
            <Button variant="outlined" color="blue" icon={<PlusOutlined/>} onClick={onCreateArticle}>
              新建专栏文章
            </Button>
          </div>

          <div className="space-y-0">
            {articles.map((article) => (
              <div
                key={article.id}
                className="relative pl-8 pb-6 group cursor-pointer"
              >
                {/* 时间轴圆点 */}
                <div
                  className="absolute left-0 top-0 w-4 h-4 bg-gray-300 dark:bg-gray-600 rounded-full -translate-x-2 group-hover:bg-purple-500 group-hover:scale-125 transition-all duration-300 shadow-sm"/>
                {/* 时间轴线 */}
                <div
                  className="absolute left-0 top-4 w-0.5 h-full bg-gray-300 dark:bg-gray-600 group-hover:bg-purple-500 dark:group-hover:bg-purple-500 transition-colors duration-300"/>

                <div
                  className="flex items-start justify-between gap-4 group-hover:-translate-x-1 transition-transform duration-300">
                  <div className="flex-1 min-w-0">
                    {/* 标题 */}
                    <h3
                      className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2 line-clamp-2 group-hover:text-purple-500 dark:group-hover:text-purple-400 transition-colors duration-300 cursor-pointer"
                      onClick={() => onViewArticle(article.id)}
                    >
                      {article.title}
                    </h3>

                    {/* 简介 */}
                    {article.summary && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-3">
                        {article.summary}
                      </p>
                    )}

                    {/* 元数据 */}
                    <div className="flex items-center gap-5 text-xs text-gray-400">
                      <span
                        className="flex items-center gap-1 group-hover:text-purple-500 transition-colors duration-300">
                        <EyeOutlined size={14}/>
                        {article.readCount}
                      </span>
                      <span
                        className="flex items-center gap-1 group-hover:text-purple-500 transition-colors duration-300">
                        <MessageOutlined size={14}/>
                        {article.commentCount}
                      </span>
                      <span
                        className="flex items-center gap-1 group-hover:text-purple-500 transition-colors duration-300">
                        <LikeOutlined size={14}/>
                        {article.likeCount}
                      </span>
                      <span className="flex items-center gap-1">
                        <CalendarOutlined size={14}/>
                        {getRelativeTime(article.publishTime)}
                      </span>
                    </div>
                  </div>

                  {/* 右侧：封面图和操作按钮 */}
                  <div className="flex items-center gap-3">
                    {/* 封面图 */}
                    {article.coverImage && (
                      <div
                        className="w-40 h-24 rounded-lg overflow-hidden shrink-0 hidden sm:block group-hover:shadow-[0_4px_15px_rgba(139,92,246,0.3)] transition-shadow duration-300 cursor-pointer"
                        onClick={() => onViewArticle(article.id)}
                      >
                        <LazyImage
                          src={article.coverImage}
                          alt={article.title}
                          className="w-full h-full object-cover group-hover:scale-110 group-hover:brightness-95 transition-all duration-500"
                        />
                      </div>
                    )}

                    {/* 操作按钮 */}
                    <div className="self-end">
                    <Dropdown
                      key="more"
                      menu={getArticleActionsMenu(article)}
                      trigger={['click']}
                    >
                      <Button
                        icon={<MoreOutlined/>}
                        size="small"
                        type="text"
                      />
                    </Dropdown>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* 空状态 */}
            {articles.length === 0 && (
              <div className="text-center py-10">
                <p className="text-gray-500 dark:text-gray-400">暂无文章，试试新建一篇吧</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ColumnDetailSection;
