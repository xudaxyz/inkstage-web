import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Button, Dropdown, Input, message, Modal, Spin } from 'antd';
import { Helmet } from 'react-helmet-async';
import LazyImage from '../../../components/common/LazyImage';
import ColumnDetailSection from './ColumnDetailSection';
import InfiniteScrollContainer from '../../../components/common/InfiniteScrollContainer';
import { useInfiniteScroll } from '../../../hooks/useInfiniteScroll';
import {
  DeleteOutlined,
  EditOutlined,
  EllipsisOutlined,
  EyeOutlined,
  BookOutlined,
  StarOutlined,
  PlusOutlined,
  SearchOutlined,
  ArrowLeftOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../../constants/routes';
import columnService from '../../../services/columnService';
import type { MyColumnVO, ColumnDetailVO } from '../../../types/column';
import type { ColumnArticleListVO } from '../../../types/article';
import type { VisibleStatus } from '../../../types/enums';
import type { ApiPageResponse } from '../../../types/common';

const MyColumns: React.FC = () => {
  const navigate = useNavigate();
  const [searchText, setSearchText] = useState('');
  const [selectedColumn, setSelectedColumn] = useState<MyColumnVO | null>(null);
  const [columnArticles, setColumnArticles] = useState<ColumnArticleListVO[]>([]);
  const [detailLoading, setDetailLoading] = useState(false);
  const [searchArticleText, setSearchArticleText] = useState('');
  const [operationLoading, setOperationLoading] = useState(false);
  const [, setColumnDetail] = useState<ColumnDetailVO | null>(null);

  const searchRef = useRef(searchText);
  const columnIdRef = useRef<number | null>(null);

  useEffect(() => {
    searchRef.current = searchText;
  }, [searchText]);

  useEffect(() => {
    if (selectedColumn) {
      columnIdRef.current = selectedColumn.id;
    } else {
      columnIdRef.current = null;
    }
  }, [selectedColumn]);

  const columnsPageSize = 20;
  const articlesPageSize = 10;

  const columnsFetcher = useCallback(async (pageNum: number, pageSize: number): Promise<ApiPageResponse<MyColumnVO>> => {
    const response = await columnService.getMyColumns(searchRef.current, pageNum, pageSize);
    if (response.code === 200) {
      const data = response.data;
      return {
        record: data.record || [],
        total: data.total || 0,
        pageNum: data.pageNum || pageNum,
        pageSize: data.pageSize || pageSize,
        pages: data.pages || Math.ceil((data.total || 0) / pageSize),
        isFirstPage: data.isFirstPage ?? (data.pageNum === 1),
        isLastPage: data.isLastPage ?? ((data.pageNum || 1) >= (data.pages || 1)),
        prePage: data.prePage || 1,
        nextPage: data.nextPage || ((data.pageNum || 1) + 1)
      };
    }
    throw new Error(response.message || '获取专栏列表失败');
  }, []);

  const columnsInfiniteScroll = useInfiniteScroll<MyColumnVO>(columnsFetcher, {
    pageSize: columnsPageSize,
    threshold: 0.1
  });

  const articlesFetcher = useCallback(async (pageNum: number, pageSize: number): Promise<ApiPageResponse<ColumnArticleListVO>> => {
    if (!columnIdRef.current) {
      return {
        record: [],
        total: 0,
        pageNum: 1,
        pageSize,
        pages: 0,
        isFirstPage: true,
        isLastPage: true,
        prePage: 1,
        nextPage: 1
      };
    }

    const response = await columnService.getColumnArticles(columnIdRef.current, pageNum, pageSize);
    if (response.code === 200) {
      const data = response.data;
      return {
        total: data.total || 0,
        record: data.record || [],
        pages: data.pages || Math.ceil((data.total || 0) / pageSize),
        pageNum: data.pageNum || pageNum,
        pageSize: data.pageSize || pageSize,
        isFirstPage: data.isFirstPage ?? (data.pageNum === 1),
        isLastPage: data.isLastPage ?? ((data.pageNum || 1) >= (data.pages || 1)),
        prePage: data.prePage || 1,
        nextPage: data.nextPage || ((data.pageNum || 1) + 1)
      };
    }
    throw new Error(response.message || '获取我的专栏文章失败');
  }, []);

  const articlesInfiniteScroll = useInfiniteScroll<ColumnArticleListVO>(articlesFetcher, {
    pageSize: articlesPageSize,
    threshold: 0.1
  });

  const columnsScrollRef = useRef(columnsInfiniteScroll);
  const articlesScrollRef = useRef(articlesInfiniteScroll);

  useEffect(() => {
    columnsScrollRef.current = columnsInfiniteScroll;
  }, [columnsInfiniteScroll]);

  useEffect(() => {
    articlesScrollRef.current = articlesInfiniteScroll;
  }, [articlesInfiniteScroll]);

  const refreshCurrentColumn = useCallback(async (): Promise<void> => {
    articlesScrollRef.current.refresh();
  }, []);

  useEffect(() => {
    columnsScrollRef.current.refresh();
  }, [searchText]);

  useEffect(() => {
    if (selectedColumn) {
      articlesScrollRef.current.refresh();
      const fetchDetail = async (): Promise<void> => {
        setDetailLoading(true);
        try {
          const response = await columnService.getColumnDetail(selectedColumn.id);
          if (response.code === 200 && response.data) {
            setColumnDetail(response.data);
          }
        } catch (error) {
          console.error('获取专栏详情失败:', error);
        } finally {
          setDetailLoading(false);
        }
      };
      fetchDetail().then();
    } else {
      setColumnDetail(null);
      setColumnArticles([]);
    }
  }, [selectedColumn]);

  useEffect(() => {
    setColumnArticles(articlesInfiniteScroll.data);
  }, [articlesInfiniteScroll.data]);

  const totalArticles = columnsInfiniteScroll.data.reduce((sum, col) => sum + (col.articleCount || 0), 0);
  const totalSubscriptions = columnsInfiniteScroll.data.reduce((sum, col) => sum + (col.subscriptionCount || 0), 0);

  const handleViewColumn = useCallback((column: MyColumnVO): void => {
    setSelectedColumn(column);
  }, []);

  const handleBackToColumns = useCallback((): void => {
    setSelectedColumn(null);
    setColumnArticles([]);
    articlesInfiniteScroll.refresh();
  }, [articlesInfiniteScroll]);

  const handleEditColumn = useCallback((columnId: number): void => {
    navigate(`${ROUTES.EDIT_COLUMN(columnId)}?from=my`);
  }, [navigate]);

  const handleCreateArticle = useCallback((): void => {
    navigate(ROUTES.CREATE_ARTICLE);
  }, [navigate]);

  const handleViewArticle = useCallback((articleId: number): void => {
    navigate(ROUTES.ARTICLE_DETAIL(articleId));
  }, [navigate]);

  const handleEditArticle = useCallback((articleId: number): void => {
    navigate(ROUTES.EDIT_ARTICLE(articleId));
  }, [navigate]);

  const handleRemoveArticleFromColumn = useCallback(async (articleId: number): Promise<void> => {
    if (!selectedColumn) return;
    setOperationLoading(true);
    try {
      const response = await columnService.removeArticleFromColumn(selectedColumn.id, articleId);
      if (response.code !== 200 || !response.data) {
        throw new Error(response.message || '移出文章失败');
      }
      await refreshCurrentColumn();
    } finally {
      setOperationLoading(false);
    }
  }, [selectedColumn, refreshCurrentColumn]);

  const handleMoveArticleToColumn = useCallback(async (articleId: number, targetColumnId: number): Promise<void> => {
    setOperationLoading(true);
    try {
      const response = await columnService.moveArticleToColumn(articleId, targetColumnId);
      if (response.code !== 200 || !response.data) {
        throw new Error(response.message || '移动文章失败');
      }
      await refreshCurrentColumn();
    } finally {
      setOperationLoading(false);
    }
  }, [refreshCurrentColumn]);

  const handleToggleVisibility = useCallback(async (visible: VisibleStatus): Promise<void> => {
    if (!selectedColumn) return;
    setOperationLoading(true);
    try {
      const response = await columnService.updateColumnVisible(selectedColumn.id, visible);
      if (response.code !== 200 || !response.data) {
        throw new Error(response.message || '更新可见性失败');
      }
      columnsInfiniteScroll.refresh();
    } finally {
      setOperationLoading(false);
    }
  }, [selectedColumn, columnsInfiniteScroll]);

  const doDeleteColumn = useCallback(async (columnId: number): Promise<void> => {
    try {
      const response = await columnService.deleteColumn(columnId);
      if (response.code === 200 && response.data) {
        message.success('专栏删除成功！');
        columnsInfiniteScroll.refresh();
        if (selectedColumn?.id === columnId) {
          handleBackToColumns();
        }
      } else {
        message.error(response.message || '删除专栏失败');
      }
    } catch {
      message.error('删除专栏失败，请重试');
    }
  }, [columnsInfiniteScroll, selectedColumn, handleBackToColumns]);

  const handleDeleteColumn = useCallback(async (columnId: number): Promise<void> => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除这个专栏吗？删除后将无法恢复！',
      okText: '确认',
      cancelText: '取消',
      onOk: async () => {
        await doDeleteColumn(columnId);
      }
    });
  }, [doDeleteColumn]);

  const filteredArticles = columnArticles.filter((article) => {
    if (!searchArticleText) return true;
    return (
      article.title.includes(searchArticleText) ||
      (article.summary && article.summary.includes(searchArticleText))
    );
  });

  return (
    <>
      <Helmet>
        <title>我的专栏 - InkStage</title>
      </Helmet>
      <div className="mx-auto px-[5%] py-6">
        <div
          className="flex flex-col md:flex-row w-full justify-between items-start md:items-center gap-2 md:gap-4 mb-8">
          <div className="flex flex-nowrap items-center gap-2 md:gap-4 sm:gap-2 shrink-0">
            {selectedColumn ? (
              <>
                <h1 className="text-xl md:text-2xl font-bold text-gray-800 dark:text-white whitespace-nowrap">
                  我的专栏 - {selectedColumn.name}
                </h1>
                <div className="flex items-center gap-1 md:gap-3 text-sm md:text-base">
                  <div
                    className="flex items-center gap-1 px-2 py-0.5 md:px-3 md:py-1 bg-green-50 text-green-600 rounded-full dark:bg-green-900/30 dark:text-green-400 whitespace-nowrap">
                    <span>共</span>
                    <span className="font-bold">{selectedColumn.articleCount}</span>
                    <span>篇</span>
                  </div>
                  <div
                    className="flex items-center gap-1 px-2 py-0.5 md:px-3 md:py-1 bg-purple-50 text-purple-600 rounded-full dark:bg-purple-900/30 dark:text-purple-400 whitespace-nowrap">
                    <span className="font-bold">{selectedColumn.subscriptionCount}</span>
                    <span>订阅</span>
                  </div>
                </div>
              </>
            ) : (
              <>
                <h1 className="text-xl md:text-2xl font-bold text-gray-800 dark:text-white whitespace-nowrap">
                  我的专栏
                  <span className="text-gray-500 dark:text-gray-300 text-base md:text-lg ml-2">
                    ({columnsInfiniteScroll.data.length})
                  </span>
                </h1>
                <div className="flex items-center gap-1 md:gap-3 text-sm md:text-base">
                  <div
                    className="flex items-center gap-1 px-2 py-0.5 md:px-3 md:py-1 bg-green-50 text-green-600 rounded-full dark:bg-green-900/30 dark:text-green-400 whitespace-nowrap">
                    <span>共</span>
                    <span className="font-bold">{totalArticles}</span>
                    <span>篇</span>
                  </div>
                  <div
                    className="flex items-center gap-1 px-2 py-0.5 md:px-3 md:py-1 bg-purple-50 text-purple-600 rounded-full dark:bg-purple-900/30 dark:text-purple-400 whitespace-nowrap">
                    <span className="font-bold">{totalSubscriptions}</span>
                    <span>订阅</span>
                  </div>
                </div>
              </>
            )}
          </div>
          <div className="flex items-center gap-2 md:gap-4 sm:gap-2 flex-nowrap">
            {selectedColumn ? (
              <>
                <Input
                  placeholder="搜索文章..."
                  prefix={<SearchOutlined/>}
                  value={searchArticleText}
                  onChange={(e) => setSearchArticleText(e.target.value)}
                  className="flex md:flex-initial"
                  style={{ maxWidth: '180px', width: '150px' }}
                />
                <Button
                  variant="solid"
                  color="gold"
                  icon={<ArrowLeftOutlined/>}
                  onClick={handleBackToColumns}
                  className="shrink-0"
                >
                  返回
                </Button>
              </>
            ) : (
              <>
                <Input
                  placeholder="搜索专栏..."
                  prefix={<SearchOutlined/>}
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  className="flex md:flex-initial"
                  style={{ maxWidth: '180px', width: '150px' }}
                />
                <Button
                  type="primary"
                  icon={<PlusOutlined/>}
                  onClick={() => navigate(`${ROUTES.CREATE_COLUMN}?from=my`)}
                  className="shrink-0"
                >
                  创建专栏
                </Button>
              </>
            )}
          </div>
        </div>

        {selectedColumn ? (
          detailLoading || operationLoading ? (
            <div className="flex justify-center items-center py-20">
              <Spin size="large"/>
            </div>
          ) : (
            <ColumnDetailSection
              column={selectedColumn}
              articles={filteredArticles}
              allColumns={columnsInfiniteScroll.data}
              onEditColumn={() => handleEditColumn(selectedColumn.id)}
              onCreateArticle={handleCreateArticle}
              onViewArticle={handleViewArticle}
              onEditArticle={handleEditArticle}
              onRemoveArticleFromColumn={handleRemoveArticleFromColumn}
              onMoveArticleToColumn={handleMoveArticleToColumn}
              onToggleVisibility={handleToggleVisibility}
              onRefresh={refreshCurrentColumn}
            />
          )
        ) : (
          columnsInfiniteScroll.isLoading ? (
            <div className="flex justify-center items-center py-20">
              <Spin size="large"/>
            </div>
          ) : columnsInfiniteScroll.data.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-gray-500 dark:text-gray-400 text-lg">
                {searchText ? '没有找到相关专栏' : '还没有创建专栏'}
              </p>
              {!searchText && (
                <Button type="primary" icon={<PlusOutlined/>} className="mt-4"
                        onClick={() => navigate(`${ROUTES.CREATE_COLUMN}?from=my`)}>
                  创建第一个专栏
                </Button>
              )}
            </div>
          ) : (
            <InfiniteScrollContainer
              infiniteScroll={columnsInfiniteScroll}
              renderItem={(column) => (
                <div
                  key={column.id}
                  className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                >
                  <div className="aspect-video overflow-hidden cursor-pointer"
                       onClick={() => handleViewColumn(column)}>
                    {column.coverImage ? (
                      <LazyImage
                        src={column.coverImage}
                        alt={column.name}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div
                        className="w-full h-full bg-linear-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center">
                        <span className="text-white text-4xl font-bold px-4 text-center">{column.name}</span>
                      </div>
                    )}
                  </div>

                  <div className="p-4">
                    <h3
                      className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2 line-clamp-1 cursor-pointer hover:text-blue-600 dark:hover:text-blue-400"
                      onClick={() => handleViewColumn(column)}
                    >
                      {column.name}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 line-clamp-2 leading-relaxed">
                      {column.description}
                    </p>

                    <div className="flex items-center justify-between">
                      <div
                        className="flex items-center gap-2 md:gap-3 text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap overflow-hidden">
                        <span className="flex items-center gap-1">
                          <BookOutlined className="w-3 h-3"/>
                          {column.articleCount}
                        </span>
                        <span className="flex items-center gap-1">
                          <StarOutlined className="w-3 h-3"/>
                          {column.subscriptionCount}
                        </span>
                      </div>

                      <Dropdown
                        menu={{
                          items: [
                            {
                              key: 'view',
                              label: '查看',
                              icon: <EyeOutlined/>,
                              onClick: () => handleViewColumn(column)
                            },
                            {
                              key: 'edit',
                              label: '编辑',
                              icon: <EditOutlined/>,
                              onClick: () => handleEditColumn(column.id)
                            },
                            {
                              key: 'delete',
                              label: '删除',
                              icon: <DeleteOutlined/>,
                              danger: true,
                              onClick: () => handleDeleteColumn(column.id)
                            }
                          ]
                        }}
                        trigger={['click']}
                      >
                        <Button type="text" icon={<EllipsisOutlined/>} className="p-1"/>
                      </Dropdown>
                    </div>
                  </div>
                </div>
              )}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
              itemGap="0"
            />
          )
        )}
      </div>
    </>
  );
};

export default MyColumns;
