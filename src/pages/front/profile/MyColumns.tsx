import React, { useState, useEffect } from 'react';
import { Button, Dropdown, Input, message, Modal, Spin } from 'antd';
import { Helmet } from 'react-helmet-async';
import LazyImage from '../../../components/common/LazyImage';
import ColumnDetailSection from './ColumnDetailSection';
import {
  DeleteOutlined,
  EditOutlined,
  EllipsisOutlined,
  EyeOutlined,
  BookOutlined,
  PlusOutlined,
  SearchOutlined,
  ArrowLeftOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../../constants/routes';
import columnService from '../../../services/columnService';
import type { MyColumnVO } from '../../../types/column';
import type { ColumnArticleListVO } from '../../../types/article';

const MyColumns: React.FC = () => {
  const navigate = useNavigate();
  const [columns, setColumns] = useState<MyColumnVO[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [selectedColumn, setSelectedColumn] = useState<MyColumnVO | null>(null);
  const [columnArticles, setColumnArticles] = useState<ColumnArticleListVO[]>([]);
  const [detailLoading, setDetailLoading] = useState(false);
  const [searchArticleText, setSearchArticleText] = useState('');

  const loadColumns = async (): Promise<void> => {
    try {
      setLoading(true);
      const response = await columnService.getMyColumns();
      if (response.code === 200 && response.data) {
        setColumns(response.data);
      } else {
        message.error(response.message || '获取专栏列表失败');
      }
    } catch (error) {
      console.error('获取专栏列表失败:', error);
      message.error('获取专栏列表失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  const loadColumnDetail = async (column: MyColumnVO): Promise<void> => {
    try {
      setDetailLoading(true);
      setSelectedColumn(column);
      const response = await columnService.getColumnDetail(column.id);
      if (response.code === 200 && response.data) {
        // 使用返回的文章列表
        setColumnArticles(response.data.articles || []);
      } else {
        setColumnArticles([]);
      }
    } catch (error) {
      console.error('获取专栏详情失败:', error);
      message.error('获取专栏详情失败，请重试');
      setColumnArticles([]);
    } finally {
      setDetailLoading(false);
    }
  };

  useEffect(() => {
    loadColumns().then();
  }, []);

  const filteredColumns = columns.filter((column) => {
    if (!searchText) return true;
    return (
      column.name.includes(searchText) ||
      (column.description && column.description.includes(searchText))
    );
  });

  const totalArticles = columns.reduce((sum, col) => sum + (col.articleCount || 0), 0);

  const handleViewColumn = (column: MyColumnVO): void => {
    loadColumnDetail(column).then();
  };

  const handleBackToColumns = (): void => {
    setSelectedColumn(null);
    setColumnArticles([]);
  };

  const handleEditColumn = (columnId: number): void => {
    navigate(`${ROUTES.EDIT_COLUMN(columnId)}?from=my`);
  };

  const handleCreateArticle = (): void => {
    // 可以跳转到创建文章页面，并预选择专栏
    navigate(ROUTES.CREATE_ARTICLE);
  };

  const handleViewArticle = (articleId: number): void => {
    navigate(ROUTES.ARTICLE_DETAIL(articleId));
  };

  const handleEditArticle = (articleId: number): void => {
    navigate(ROUTES.EDIT_ARTICLE(articleId));
  };

  const handleDeleteArticle = (articleId: number): void => {
    console.log(articleId);
    message.success('删除文章功能开发中').then();
  };

  const doDeleteColumn = async (columnId: number): Promise<void> => {
    try {
      const response = await columnService.deleteColumn(columnId);
      if (response.code === 200 && response.data) {
        message.success('专栏删除成功！');
        await loadColumns();
      } else {
        message.error(response.message || '删除专栏失败');
      }
    } catch {
      message.error('删除专栏失败，请重试');
    }
  };

  const handleDeleteColumn = async (columnId: number): Promise<void> => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除这个专栏吗？删除后将无法恢复！',
      okText: '确认',
      cancelText: '取消',
      onOk: async () => {
        await doDeleteColumn(columnId);
      }
    });
  };

  const handleDeleteColumnDirect = async (columnId: number): Promise<void> => {
    await doDeleteColumn(columnId);
    setSelectedColumn(null);
  };

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
                    <span className="font-bold">0</span>
                    <span>订阅</span>
                  </div>
                </div>
              </>
            ) : (
              <>
                <h1 className="text-xl md:text-2xl font-bold text-gray-800 dark:text-white whitespace-nowrap">
                  我的专栏
                  <span className="text-gray-500 dark:text-gray-300 text-base md:text-lg ml-2">
                    ({columns.length})
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
                    <span className="font-bold">0</span>
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
          // 显示专栏详情
          detailLoading ? (
            <div className="flex justify-center items-center py-20">
              <Spin size="large"/>
            </div>
          ) : (
            <ColumnDetailSection
              column={selectedColumn}
              articles={columnArticles.filter((article) => {
                if (!searchArticleText) return true;
                return (
                  article.title.includes(searchArticleText) ||
                  (article.summary && article.summary.includes(searchArticleText))
                );
              })}
              onEditColumn={() => handleEditColumn(selectedColumn.id)}
              onCreateArticle={handleCreateArticle}
              onDeleteColumn={() => handleDeleteColumnDirect(selectedColumn.id)}
              onViewArticle={handleViewArticle}
              onEditArticle={handleEditArticle}
              onDeleteArticle={handleDeleteArticle}
            />
          )
        ) : (
          // 显示专栏列表
          loading ? (
            <div className="flex justify-center items-center py-20">
              <Spin size="large"/>
            </div>
          ) : filteredColumns.length === 0 ? (
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredColumns.map((column) => (
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
              ))}
            </div>
          )
        )}
      </div>
    </>
  );
};

export default MyColumns;
