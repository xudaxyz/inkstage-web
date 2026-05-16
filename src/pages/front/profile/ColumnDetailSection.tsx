import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Button, Dropdown, message, Modal, Spin } from 'antd';
import {
  BookOutlined,
  CalendarOutlined,
  CheckOutlined,
  CloseOutlined,
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
  LikeOutlined,
  MessageOutlined,
  MoreOutlined,
  PlusOutlined,
  StarOutlined,
  SwapOutlined,
  UnorderedListOutlined,
  DoubleRightOutlined
} from '@ant-design/icons';
import LazyImage from '../../../components/common/LazyImage';
import InfiniteScrollContainer from '../../../components/common/InfiniteScrollContainer';
import { getRelativeTime } from '../../../utils';
import type { MyColumnVO } from '../../../types/column';
import type { ColumnArticleListVO } from '../../../types/article';
import type { InfiniteScrollResult } from '../../../types/infiniteScroll';
import { VisibleStatus } from '../../../types/enums';
import columnService from '../../../services/columnService';

interface ColumnDetailSectionProps {
  column: MyColumnVO;
  articlesInfiniteScroll: InfiniteScrollResult<ColumnArticleListVO>;
  allColumns: MyColumnVO[];
  onEditColumn: () => void;
  onCreateArticle: () => void;
  onViewArticle: (articleId: string) => void;
  onEditArticle: (articleId: string) => void;
  onRemoveArticleFromColumn: (articleId: string) => Promise<void>;
  onDeleteArticle: (articleId: string) => Promise<void>;
  onMoveArticleToColumn: (articleId: string, targetColumnId: string) => Promise<void>;
  onToggleVisibility: (visible: VisibleStatus) => Promise<void>;
}

const ColumnDetailSection: React.FC<ColumnDetailSectionProps> = ({
                                                                    column,
                                                                    articlesInfiniteScroll,
                                                                    allColumns,
                                                                    onEditColumn,
                                                                    onCreateArticle,
                                                                    onViewArticle,
                                                                    onEditArticle,
                                                                    onRemoveArticleFromColumn,
                                                                    onDeleteArticle,
                                                                    onMoveArticleToColumn,
                                                                    onToggleVisibility
                                                                  }) => {
  const [isSortMode, setIsSortMode] = useState(false);
  const [sortArticlesLoading, setSortArticlesLoading] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [localArticles, setLocalArticles] = useState<ColumnArticleListVO[]>([]);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const originalArticlesRef = useRef<ColumnArticleListVO[]>([]);
  const refreshRef = useRef(articlesInfiniteScroll.refresh);
  refreshRef.current = articlesInfiniteScroll.refresh;

  const articleTotal = articlesInfiniteScroll.total;

  const handleEnterSortMode = useCallback(async () => {
    setSortArticlesLoading(true);
    try {
      const response = await columnService.getColumnArticles(column.id, 1, 9999, 'ASC');
      if (response.code === 200 && response.data) {
        const allArticles = response.data.record || [];
        originalArticlesRef.current = [...allArticles];
        setLocalArticles([...allArticles]);
        setIsSortMode(true);
      } else {
        message.error('加载文章数据失败');
      }
    } catch {
      message.error('加载文章数据失败');
    } finally {
      setSortArticlesLoading(false);
    }
  }, [column.id]);

  const handleCancelSort = useCallback(() => {
    setLocalArticles([...originalArticlesRef.current]);
    setIsSortMode(false);
    setDraggedIndex(null);
    setDragOverIndex(null);
  }, []);

  const handleConfirmSort = useCallback(async () => {
    setIsSaving(true);
    try {
      const articleIds = localArticles.map(a => a.id);
      const response = await columnService.batchUpdateColumnArticleSort(column.id, articleIds);
      if (response.code === 200 && response.data) {
        message.success('排序已保存');
        setIsSortMode(false);
        refreshRef.current();
      } else {
        message.error('排序保存失败');
      }
    } catch {
      message.error('排序保存失败');
    } finally {
      setIsSaving(false);
    }
  }, [localArticles, column.id]);

  const handleDragStart = useCallback((e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', String(index));
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (draggedIndex !== null && draggedIndex !== index) {
      setDragOverIndex(index);
    }
  }, [draggedIndex]);

  const handleDragLeave = useCallback(() => {
    setDragOverIndex(null);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === targetIndex) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }

    const newArticles = [...localArticles];
    const [draggedItem] = newArticles.splice(draggedIndex, 1);
    newArticles.splice(targetIndex, 0, draggedItem);
    setLocalArticles(newArticles);

    setDraggedIndex(null);
    setDragOverIndex(null);
  }, [draggedIndex, localArticles]);

  useEffect(() => {
    if (!isSortMode) {
      setLocalArticles([]);
      originalArticlesRef.current = [];
    }
  }, [isSortMode]);

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

  const handleRemoveArticle = useCallback((articleId: string, articleTitle: string): void => {
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
          refreshRef.current();
        } catch {
          message.error('移出文章失败');
        }
      }
    });
  }, [column.name, onRemoveArticleFromColumn]);

  const handleDeleteArticle = useCallback((articleId: string): void => {
    Modal.confirm({
      title: '删除该文章？',
      content: (
        <>
          <p>确定要将该文章移至回收站吗？</p>
        </>
      ),
      okText: '确认',
      cancelText: '取消',
      onOk: async () => {
        try {
          await onDeleteArticle(articleId);
          message.success('文章已移至回收站');
          refreshRef.current();
        } catch {
          message.error('删除文章失败');
        }
      }
    });
  }, [onDeleteArticle]);

  const handleMoveArticle = useCallback((articleId: string, targetColumnId: string, articleTitle: string): void => {
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
          refreshRef.current();
        } catch {
          message.error('移动文章失败');
        }
      }
    });
  }, [allColumns, onMoveArticleToColumn]);

  const renderVisibilityMenu = useCallback(() => {
    const items = [
      {
        key: 'sort',
        label: '文章排序',
        icon: <UnorderedListOutlined/>,
        onClick: (): void => { handleEnterSortMode().then(); }
      },
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
  }, [handleToggleVisibility, handleEnterSortMode]);

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
          label: '移至专栏',
          icon: <SwapOutlined/>,
          children: moveMenuItems
        },
        {
          key: 'remove',
          label: '移出专栏',
          icon: <DoubleRightOutlined />,
          onClick: (): void => handleRemoveArticle(article.id, article.title)
        },
        {
          key: 'delete',
          label: '删除',
          icon: <DeleteOutlined color="red"/>,
          danger: true,
          onClick: (): void => handleDeleteArticle(article.id)
        }
      ]
    };
  }, [otherColumns, onViewArticle, onEditArticle, handleMoveArticle, handleRemoveArticle, handleDeleteArticle]);

  const renderArticleItem = useCallback((article: ColumnArticleListVO) => (
    <div
      key={article.id}
      className="relative pl-8 pb-6 group cursor-pointer"
    >
      <div
        className="absolute left-0 top-0 w-4 h-4 bg-gray-300 dark:bg-gray-600 rounded-full -translate-x-2 group-hover:bg-purple-500 group-hover:scale-125 transition-all duration-300 shadow-sm"/>
      <div
        className="absolute left-0 top-4 w-0.5 h-full bg-gray-300 dark:bg-gray-600 group-hover:bg-purple-500 dark:group-hover:bg-purple-500 transition-colors duration-300"/>

      <div
        className="flex items-start justify-between gap-4 group-hover:-translate-x-1 transition-transform duration-300">
        <div className="flex-1 min-w-0">
          <h3
            className="text-lg font-semibold text-gray-800 dark:text-gray-200 line-clamp-2 group-hover:text-purple-500 dark:group-hover:text-purple-400 transition-colors duration-300 cursor-pointer"
            onClick={() => onViewArticle(article.id)}
          >
            {article.title}
          </h3>

          {article.summary && (
            <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-3">
              {article.summary}
            </p>
          )}

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

        <div className="flex items-center gap-3">
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
  ), [onViewArticle, getArticleActionsMenu]);

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

          {/* 左侧元数据，右侧操作按钮 */}
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

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
          <div className="flex items-center border-b border-gray-100 justify-between pb-6">
            <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
              {isSortMode ? '拖拽排序中' : `专栏文章 (${articleTotal})`}
            </h3>
            {isSortMode ? (
              <div className="flex items-center gap-3">
                <Button
                  variant="outlined"
                  color="default"
                  icon={<CloseOutlined/>}
                  onClick={handleCancelSort}
                  disabled={isSaving}
                >
                  取消
                </Button>
                <Button
                  variant="solid"
                  color="cyan"
                  icon={<CheckOutlined/>}
                  onClick={handleConfirmSort}
                  loading={isSaving}
                >
                  确认
                </Button>
              </div>
            ) : (
              <Button variant="outlined" color="blue" icon={<PlusOutlined/>} onClick={onCreateArticle}>
                新建专栏文章
              </Button>
            )}
          </div>

          {isSortMode ? (
            sortArticlesLoading ? (
              <div className="flex justify-center items-center py-20">
                <Spin size="large" tip="加载文章数据中..."/>
              </div>
            ) : (
              <div className="space-y-0">
                {localArticles.map((article, index) => (
                  <div
                    key={article.id}
                    className={`relative pb-6 group transition-all duration-300 pl-8 cursor-grab active:cursor-grabbing ${
                      draggedIndex === index ? 'opacity-50 scale-95' : ''
                    } ${dragOverIndex === index ? 'border-t-5 border-red-500 -mt-4 pt-4' : ''}`}
                    draggable
                    onDragStart={(e): void => handleDragStart(e, index)}
                    onDragOver={(e): void => handleDragOver(e, index)}
                    onDragLeave={handleDragLeave}
                    onDrop={(e): void => handleDrop(e, index)}
                  >
                    <div
                      className="absolute left-0 top-0 w-4 h-4 bg-purple-500 rounded-full -translate-x-2 transition-all duration-300 shadow-sm"/>
                    <div
                      className="absolute left-0 top-4 w-0.5 h-full bg-purple-500 transition-colors duration-300"/>

                    <div
                      className="flex items-start justify-between gap-4 group-hover:-translate-x-1 transition-transform duration-300">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <UnorderedListOutlined className="text-gray-400 text-lg cursor-grab shrink-0"/>
                          <h3
                            className="text-lg font-semibold text-gray-800 dark:text-gray-200 line-clamp-2 group-hover:text-purple-500 dark:group-hover:text-purple-400 transition-colors duration-300 cursor-pointer"
                            onClick={() => onViewArticle(article.id)}
                          >
                            {article.title}
                          </h3>
                        </div>

                        {article.summary && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-3">
                            {article.summary}
                          </p>
                        )}

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

                      <div className="flex items-center gap-3">
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

                {localArticles.length === 0 && (
                  <div className="text-center py-10">
                    <p className="text-gray-500 dark:text-gray-400">暂无文章，试试新建一篇吧</p>
                  </div>
                )}
              </div>
            )
          ) : (
            <InfiniteScrollContainer
              infiniteScroll={articlesInfiniteScroll}
              renderItem={renderArticleItem}
              emptyContent={
                <div className="text-center py-10">
                  <p className="text-gray-500 dark:text-gray-400">暂无文章，试试新建一篇吧</p>
                </div>
              }
              loadingContent={
                <div className="flex justify-center items-center py-10">
                  <Spin size="default"/>
                </div>
              }
              itemGap="0"
              noMoreText="已经到底啦 ~"
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default ColumnDetailSection;
