import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTheme } from '../../../store';
import { Button, Card, Input, message, Modal, Popover, Space, Tag } from 'antd';
import { Helmet } from 'react-helmet-async';
import InfiniteScrollContainer from '../../../components/common/InfiniteScrollContainer';
import { useInfiniteScroll } from '../../../hooks/useInfiniteScroll';
import {
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
  LikeOutlined,
  MessageOutlined,
  MoreOutlined,
  SearchOutlined,
  ShareAltOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import articleService from '../../../services/articleService';
import { type MyArticleList } from '../../../types/article';
import { ROUTES } from '../../../constants/routes';
import {
  ArticleOriginalEnum,
  ArticleOriginalMap,
  ArticleReviewStatusEnum,
  ArticleReviewStatusMap,
  ArticleStatusEnum,
  ArticleStatusMap,
  ArticleVisibleEnum,
  ArticleVisibleMap
} from '../../../types/enums';
import { formatDateTimeShort } from '../../../utils';
import type { ApiPageResponse } from '../../../types/common';

// 文章类型定义
interface Article {
  id: number;
  title: string;
  summary: string;
  publishTime: string;
  original: ArticleOriginalEnum;
  visible: ArticleVisibleEnum;
  articleStatus: ArticleStatusEnum;
  reviewStatus: ArticleReviewStatusEnum;
  readCount: number;
  likeCount: number;
  commentCount: number;
}

const MyCreations: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isDarkMode = theme === 'dark';
  // 状态管理
  const [searchText, setSearchText] = useState('');
  const [debouncedSearchText, setDebouncedSearchText] = useState('');
  const [currentStatus, setCurrentStatus] = useState<ArticleStatusEnum>(ArticleStatusEnum.ALL);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [deleteArticleId, setDeleteArticleId] = useState<number>();
  const [deleteArticleStatus, setDeleteArticleStatus] = useState<ArticleStatusEnum>();
  const [total, setTotal] = useState(0);
  const statusRef = useRef(currentStatus);
  const searchRef = useRef(debouncedSearchText);
  // 无限滚动配置
  const pageSize = 10;
  // 文章列表获取函数
  const fetcher = useCallback(async (pageNum: number, pageSize: number): Promise<ApiPageResponse<Article>> => {
    const response = await articleService.getMyArticles({
      articleStatus: statusRef.current,
      keyword: searchRef.current,
      pageNum: pageNum,
      pageSize: pageSize
    });
    if (response.code === 200 && response.data) {
      // 转换后端数据格式
      const formattedArticles: Article[] = response.data.record.map((item: MyArticleList) => ({
        id: item.id,
        title: item.title,
        summary: item.summary,
        publishTime: item.publishTime,
        original: (item.original as ArticleOriginalEnum) || ArticleOriginalEnum.OTHER,
        visible: (item.visible as ArticleVisibleEnum) || ArticleVisibleEnum.PUBLIC,
        articleStatus: item.articleStatus as ArticleStatusEnum,
        reviewStatus: item.reviewStatus as ArticleReviewStatusEnum,
        readCount: item.readCount || 0,
        likeCount: item.likeCount || 0,
        commentCount: item.commentCount || 0
      }));
      setTotal(response.data.total);
      return {
        record: formattedArticles,
        total: response.data.total,
        pageNum: pageNum,
        pageSize: pageSize,
        pages: Math.ceil(response.data.total / pageSize),
        isFirstPage: pageNum === 1,
        isLastPage: pageNum * pageSize >= response.data.total,
        prePage: pageNum > 1 ? pageNum - 1 : 1,
        nextPage: pageNum * pageSize < response.data.total ? pageNum + 1 : pageNum
      };
    } else {
      throw new Error(response.message || '获取文章列表失败');
    }
  }, []);
  // 使用无限滚动hook
  const infiniteScroll = useInfiniteScroll<Article>(fetcher, {
    pageSize
  });
  const { refresh } = infiniteScroll;
  // 搜索防抖
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchText(searchText);
    }, 300);
    return (): void => clearTimeout(timer);
  }, [searchText]);
  // 创作统计数据
  const stats = useMemo(
    () => ({
      totalArticles: total
    }),
    [total]
  );
  // 当状态或搜索词变化时更新ref并刷新数据
  useEffect(() => {
    statusRef.current = currentStatus;
    searchRef.current = debouncedSearchText;
    refresh();
  }, [currentStatus, debouncedSearchText, refresh]);
  // 分享文章
  const handleShare = (articleId: number): void => {
    // 实现分享逻辑
    void message.success('分享功能已触发');
    // 可以添加复制链接到剪贴板的功能
    const shareUrl = `${window.location.origin}${ROUTES.ARTICLE_DETAIL(articleId)}`;
    navigator.clipboard
      .writeText(shareUrl)
      .then(() => {
        void message.success('链接已复制到剪贴板');
      })
      .catch(() => {
        console.error('复制失败');
      });
  };
  // 编辑文章
  const handleEdit = (articleId: number): void => {
    navigate(ROUTES.EDIT_ARTICLE(articleId));
  };
  // 打开删除确认对话框
  const showDeleteConfirm = (articleId: number, articleStatus: ArticleStatusEnum): void => {
    setDeleteArticleId(articleId);
    setDeleteArticleStatus(articleStatus);
    setDeleteModalVisible(true);
  };
  // 关闭删除确认对话框
  const handleDeleteCancel = (): void => {
    setDeleteModalVisible(false);
  };
  // 删除文章
  const handleDelete = async (articleStatus: ArticleStatusEnum): Promise<void> => {
    if (!deleteArticleId) return;
    try {
      let response;
      // 回收站的文章调用彻底删除文章的方法
      if (articleStatus === ArticleStatusEnum.RECYCLE) {
        response = await articleService.permanentDeleteArticle(deleteArticleId);
      } else {
        response = await articleService.deleteArticle(Number(deleteArticleId));
      }
      if (response.code !== 200) {
        message.error(response.message);
      }
      message.success(response.message || '文章已删除');
      setDeleteModalVisible(false);
      // 重新加载文章列表
      refresh();
    } catch (error) {
      message.error('删除失败，请重试');
      console.error('删除文章失败:', error);
    }
  };
  // 状态变化时刷新数据
  const handleStatusChange = (articleStatus: ArticleStatusEnum): void => {
    setCurrentStatus(articleStatus);
  };
  // 获取状态文本
  const getStatusText = (status: string): string => {
    switch (status) {
      case 'PUBLISHED':
        return '已发布';
      case 'DRAFT':
        return '草稿';
      case 'PENDING_PUBLISH':
        return '待发布';
      case 'DELETED':
        return '已删除';
      default:
        return '未知';
    }
  };
  return (
    <>
      <Helmet>
        <title>我的创作 - InkStage</title>
      </Helmet>
      <div className="mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
            我的创作 <span className="text-gray-500 dark:text-gray-300 text-lg">({stats.totalArticles})</span>
          </h1>
        </div>

        {/* 状态标签和搜索区域 */}
        <div className="border-b border-b-gray-200 dark:border-b-gray-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4">
          {/* 状态标签 */}
          <div className="flex flex-wrap gap-2 md:gap-4 mb-2 sm:mb-0">
            {/* 全部文章 - 移动端单独一行 */}
            <div className="w-full sm:w-auto">
              <Button
                color={currentStatus === ArticleStatusEnum.ALL ? 'cyan' : 'default'}
                variant={currentStatus === ArticleStatusEnum.ALL ? 'solid' : 'text'}
                size="large"
                onClick={() => handleStatusChange(ArticleStatusEnum.ALL)}
                className="sm:inline-block w-full sm:w-auto"
              >
                全部文章
              </Button>
            </div>

            {/* 其他状态 */}
            <Button
              color={currentStatus === ArticleStatusEnum.PUBLISHED ? 'cyan' : 'default'}
              variant={currentStatus === ArticleStatusEnum.PUBLISHED ? 'solid' : 'text'}
              size="large"
              onClick={() => handleStatusChange(ArticleStatusEnum.PUBLISHED)}
            >
              已发布
            </Button>
            <Button
              color={currentStatus === ArticleStatusEnum.DRAFT ? 'cyan' : 'default'}
              variant={currentStatus === ArticleStatusEnum.DRAFT ? 'solid' : 'text'}
              size="large"
              onClick={() => handleStatusChange(ArticleStatusEnum.DRAFT)}
            >
              草稿
            </Button>
            <Button
              color={currentStatus === ArticleStatusEnum.PENDING_PUBLISH ? 'cyan' : 'default'}
              variant={currentStatus === ArticleStatusEnum.PENDING_PUBLISH ? 'solid' : 'text'}
              size="large"
              onClick={() => handleStatusChange(ArticleStatusEnum.PENDING_PUBLISH)}
            >
              待发布
            </Button>
            <Button
              color={currentStatus === ArticleStatusEnum.RECYCLE ? 'cyan' : 'default'}
              variant={currentStatus === ArticleStatusEnum.RECYCLE ? 'solid' : 'text'}
              size="large"
              onClick={() => handleStatusChange(ArticleStatusEnum.RECYCLE)}
            >
              回收站
            </Button>
          </div>

          {/* 搜索框 */}
          <Input
            placeholder={`搜索${currentStatus === ArticleStatusEnum.ALL ? '' : getStatusText(currentStatus)}文章`}
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: '100%', maxWidth: 300 }}
          />
        </div>

        {/* 文章列表 */}
        <InfiniteScrollContainer
          infiniteScroll={infiniteScroll}
          renderItem={(article) => (
            <Card
              key={article.id}
              variant="borderless"
              styles={{
                body: {
                  padding: '24px 12px',
                  borderBottom: `1px solid ${isDarkMode ? '#6a7282' : '#e8e8e8'}`,
                  borderRadius: 0,
                  backgroundColor: `${isDarkMode ? '#1e2939' : 'transparent'}`
                }
              }}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-start">
                  <a
                    href={ROUTES.ARTICLE_DETAIL(article.id)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-base md:text-xl font-semibold no-underline text-gray-900 dark:text-white transition-colors duration-200 hover:text-primary-600 line-clamp-1"
                    style={{
                      textDecoration: 'none',
                      fontFamily: 'sans-serif',
                      letterSpacing: '-0.02em'
                    }}
                  >
                    {article.title}
                  </a>
                  <div className="ml-1">
                    <Tag variant="outlined" color={article.visible === ArticleVisibleEnum.PUBLIC ? 'green' : 'default'}>
                      {ArticleVisibleMap[article.visible]}
                    </Tag>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Tag
                    variant="filled"
                    className="text-xs px-2 py-0.5"
                    color={article.articleStatus === ArticleStatusEnum.PUBLISHED ? 'cyan' : 'warning'}
                  >
                    {ArticleStatusMap[article.articleStatus]}
                  </Tag>
                  {article.reviewStatus && article.reviewStatus != ArticleReviewStatusEnum.APPROVED && (
                    <Tag
                      variant="filled"
                      color={article.reviewStatus === ArticleReviewStatusEnum.REJECTED ? 'red' : 'blue'}
                    >
                      {ArticleReviewStatusMap[article.reviewStatus]}
                    </Tag>
                  )}
                </div>
              </div>

              <div className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-2">{article.summary}</div>

              <div className="flex flex-wrap items-center justify-between gap-x-2 md:gap-x-4 gap-y-2">
                <div className="flex flex-wrap items-center gap-x-2 md:gap-x-4 gap-y-2 text-xs md:text-sm text-gray-500 dark:text-gray-400">
                  <Tag variant="solid" color={article.original === ArticleOriginalEnum.ORIGINAL ? 'gold' : 'green'}>
                    {ArticleOriginalMap[article.original] || ArticleOriginalEnum.OTHER}
                  </Tag>
                  <span>{article.publishTime ? formatDateTimeShort(article.publishTime) : ''}</span>
                  <Space size={4}>
                    <EyeOutlined /> {article.readCount}
                  </Space>
                  <Space size={4}>
                    <LikeOutlined /> {article.likeCount}
                  </Space>
                  <Space size={4}>
                    <MessageOutlined /> {article.commentCount}
                  </Space>
                </div>

                <div className="flex items-center space-x-2">
                  <Popover
                    placement="bottom"
                    content={
                      <Space orientation="vertical">
                        <Button icon={<EditOutlined />} size="small" type="text" onClick={() => handleEdit(article.id)}>
                          编辑
                        </Button>
                        <Button
                          icon={<ShareAltOutlined />}
                          size="small"
                          type="text"
                          onClick={() => handleShare(article.id)}
                        >
                          分享
                        </Button>
                        <Button
                          icon={<DeleteOutlined />}
                          size="small"
                          type="text"
                          danger
                          onClick={() => showDeleteConfirm(article.id, article.articleStatus)}
                        >
                          {article.articleStatus === ArticleStatusEnum.RECYCLE ? '彻底删除' : '删除'}
                        </Button>
                      </Space>
                    }
                    trigger="click"
                  >
                    <Button icon={<MoreOutlined />} size="small" type="text" />
                  </Popover>
                </div>
              </div>
            </Card>
          )}
          emptyContent={
            <div className="py-12 text-center dark:text-gray-200">
              <p>暂无文章</p>
            </div>
          }
        />

        {/* 删除确认对话框 */}
        <Modal
          title={deleteArticleStatus === ArticleStatusEnum.RECYCLE ? '彻底删除' : '确认删除'}
          open={deleteModalVisible}
          onOk={() => handleDelete(deleteArticleStatus as ArticleStatusEnum)}
          onCancel={handleDeleteCancel}
          okText={deleteArticleStatus === ArticleStatusEnum.RECYCLE ? '彻底删除' : '确认删除'}
          okButtonProps={{
            type: 'primary',
            danger: true
          }}
          cancelText="取消"
        >
          <p>
            {deleteArticleStatus === ArticleStatusEnum.RECYCLE
              ? '确定要彻底删除这篇文章吗？此操作不可撤销，将永久删除该文章。'
              : '确定要删除这篇文章吗？此操作不可撤销。'}
          </p>
        </Modal>
      </div>
    </>
  );
};
export default MyCreations;
