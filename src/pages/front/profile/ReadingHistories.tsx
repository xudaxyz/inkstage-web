import React, { useCallback, useMemo, useState } from 'react';
import { Alert, Button, Card, Divider, Empty, Input, message, Popover, Space, Spin, Tag } from 'antd';
import { Helmet } from 'react-helmet-async';
import { useInfiniteScroll } from '../../../hooks/useInfiniteScroll';
import { ClockCircleOutlined, DeleteOutlined, EyeOutlined, MoreOutlined, SearchOutlined } from '@ant-design/icons';
import { ROUTES } from '../../../constants/routes';
import readingHistoryService from '../../../services/readingHistoryService';
import { type ReadingHistory } from '../../../types/readingHistory';
import { formatDateOnly, formatTimeShort } from '../../../utils';
import { useTheme } from '../../../store';

const ReadingHistories: React.FC = () => {
  // 状态管理
  const theme = useTheme();
  const isDarkMode = theme === 'dark';
  const [searchText, setSearchText] = useState('');
  const [total, setTotal] = useState(0);
  // 无限滚动配置
  const pageSize = 10;
  // 阅读历史列表获取函数
  const fetcher = useCallback(async (pageNum: number, pageSize: number) => {
    const response = await readingHistoryService.getReadingHistoryList(pageNum, pageSize);
    if (response.code === 200 && response.data) {
      setTotal(response.data.total);
      return {
        record: response.data.record,
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
      throw new Error(response.message || '获取阅读历史失败');
    }
  }, []);
  // 使用无限滚动hook
  const {
    data: histories,
    isLoading: loading,
    isError: error,
    loadMoreRef: loadMore,
    hasMore,
    refresh
  } = useInfiniteScroll<ReadingHistory>(fetcher, {
    pageSize
  });
  // 按日期分组
  const groupedHistories = useMemo(() => {
    const filteredHistories = histories.filter(
      (history) =>
        history.title.toLowerCase().includes(searchText.toLowerCase()) ||
        history.nickname.toLowerCase().includes(searchText.toLowerCase())
    );
    return filteredHistories.reduce((groups: Record<string, ReadingHistory[]>, history) => {
      const date = history.readDate ? formatDateOnly(history.readDate) : '';
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(history);
      return groups;
    }, {});
  }, [histories, searchText]);
  // 清空所有历史
  const handleClearAll = async (): Promise<void> => {
    try {
      const response = await readingHistoryService.clearReadingHistory();
      if (response.code === 200) {
        message.success('已清空所有阅读历史');
        refresh();
      } else {
        message.error(response.message || '清空阅读历史失败');
      }
    } catch (error) {
      console.error('清空阅读历史失败:', error);
      message.error('网络错误，请稍后重试');
    }
  };
  // 删除单个历史
  const handleDeleteSingle = async (articleId: number): Promise<void> => {
    try {
      const response = await readingHistoryService.deleteReadingHistory(Number(articleId));
      if (response.code === 200) {
        message.success('已删除阅读历史');
        // 重新加载数据
        refresh();
      } else {
        message.error(response.message || '删除阅读历史失败');
      }
    } catch (error) {
      console.error('删除阅读历史失败:', error);
      message.error('网络错误，请稍后重试');
    }
  };
  // 继续阅读
  const handleContinueReading = (articleId: number): void => {
    // 跳转到文章详情页
    window.open(ROUTES.ARTICLE_DETAIL(articleId), '_blank');
  };
  return (
    <>
      <Helmet>
        <title>阅读历史 - InkStage</title>
      </Helmet>
      <div className="mx-auto">
        {/* 页面标题 */}
        <div className="flex items-center gap-2 mb-6">
          <h1 className="text-2xl font-bold text-secondary-800 dark:text-white">阅读历史</h1>
          <div className="text-gray-500 dark:text-gray-400">({total})</div>
        </div>

        {/* 搜索和操作区域 */}
        <div className="border-b border-gray-200 dark:border-gray-700 flex flex-wrap justify-between items-center pb-4 mb-6">
          {/* 搜索框 */}
          <div className="flex items-center gap-24 mb-2 md:mb-0">
            <Input
              placeholder="搜索阅读历史"
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={{ width: 300 }}
            />
          </div>

          {/* 操作按钮 */}
          <Button danger icon={<DeleteOutlined />} onClick={handleClearAll} disabled={total === 0}>
            清空历史
          </Button>
        </div>

        {/* 阅读历史列表 */}
        {loading ? (
          <div className="py-12 flex justify-center">
            <Spin size="large" tip="加载中..." />
          </div>
        ) : error ? (
          <div className="py-12">
            <Alert
              title="加载失败"
              description={'请稍后重试'}
              type="error"
              showIcon
              action={
                <Button size="small" type="primary" onClick={refresh}>
                  重试
                </Button>
              }
            />
          </div>
        ) : histories.length > 0 ? (
          <div className="space-y-6">
            {Object.entries(groupedHistories).map(([date, items]) => (
              <div key={date} className="mb-6">
                {/* 日期标题 */}
                <h2 className="text-lg font-semibold text-secondary-700 dark:text-white mb-4 flex items-center">
                  <ClockCircleOutlined className="mr-2" />
                  {date}
                </h2>

                {/* 当日阅读历史 */}
                <div className="space-y-4">
                  {items.map((history) => (
                    <Card
                      key={history.id}
                      variant="borderless"
                      styles={{
                        body: {
                          padding: '20px 12px',
                          borderBottom: `1px solid ${isDarkMode ? '#6a7282' : '#e8e8e8'}`,
                          borderRadius: 0,
                          backgroundColor: `${isDarkMode ? '#1e2939' : 'transparent'}`
                        }
                      }}
                    >
                      <div className="flex items-start gap-4">
                        {/* 文章内容 */}
                        <div className="flex-1">
                          {/* 第一行：文章标题 */}
                          <div className="flex items-center mb-2">
                            <h3 className="text-xl font-semibold text-secondary-800 dark:text-white hover:text-primary-600 transition-colors duration-200 flex-1">
                              <a
                                href={ROUTES.ARTICLE_DETAIL(history.articleId)}
                                className="hover:underline"
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                {history.title}
                              </a>
                            </h3>
                          </div>

                          {/* 第二行：简介 */}
                          <div className="text-sm text-secondary-500 dark:text-gray-300 mb-4 line-clamp-2">
                            {history.summary}
                          </div>

                          {/* 第三行：阅读信息、作者信息、统计数据 */}
                          <div className="flex flex-wrap items-center justify-between">
                            <div className="flex items-center gap-3 justify-between text-sm text-secondary-500 dark:text-gray-400">
                              {/* 作者信息 */}
                              <div className="flex items-center">
                                <img
                                  src={history.avatar}
                                  alt={history.nickname}
                                  className="w-7 h-7 rounded-full object-cover mr-2"
                                />
                                <span>{history.nickname}</span>
                                <Divider
                                  orientation="vertical"
                                  className="bg-gray-300"
                                  style={{ height: '16px', margin: '0 12px' }}
                                />
                              </div>

                              <div className="flex items-center gap-4">
                                {/* 阅读时间 */}
                                <Space size={4}>
                                  <ClockCircleOutlined />
                                  <span>{history.readTime ? formatTimeShort(history.readTime) : ''}</span>
                                </Space>

                                {/* 阅读时长 */}
                                <Space size={4}>
                                  <ClockCircleOutlined />
                                  <span>{history.duration} 分钟</span>
                                </Space>
                              </div>
                            </div>

                            {/* 操作按钮 */}
                            <div className="flex items-center space-x-2">
                              {/* 阅读进度 */}
                              <div className="flex items-center gap-2 mr-4">
                                <Tag variant="outlined" color={history.progress === 100 ? 'green' : 'blue'}>
                                  {history.progress}%
                                </Tag>
                                <div className="w-24 bg-gray-200 rounded-full h-1.5">
                                  <div
                                    className={`h-1.5 rounded-full transition-all duration-300 ${
                                      history.progress === 100 ? 'bg-green-500' : 'bg-blue-500'
                                    }`}
                                    style={{ width: `${history.progress}%` }}
                                  ></div>
                                </div>
                              </div>

                              <Popover
                                placement="bottom"
                                content={
                                  <Space orientation="vertical">
                                    <Button
                                      icon={<EyeOutlined />}
                                      size="small"
                                      type="text"
                                      onClick={() => handleContinueReading(history.articleId)}
                                    >
                                      继续阅读
                                    </Button>
                                    <Button
                                      icon={<DeleteOutlined />}
                                      size="small"
                                      type="text"
                                      danger
                                      onClick={() => handleDeleteSingle(history.articleId)}
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

                        {/* 文章封面图 */}
                        {history.coverImage && (
                          <div className="shrink-0">
                            <img
                              src={history.coverImage}
                              alt={history.title}
                              className="w-48 h-28 object-cover rounded-lg"
                            />
                          </div>
                        )}
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            ))}

            {/* 加载更多 */}
            {hasMore && (
              <div className="py-6 flex justify-center" ref={loadMore}>
                <Spin size="small" tip="加载更多..." />
              </div>
            )}

            {!hasMore && histories.length > 0 && (
              <div className="py-4 text-center text-gray-400 text-sm">没有更多数据了</div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl shadow-sm">
            <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="暂无阅读历史" className="py-8" />
          </div>
        )}
      </div>
    </>
  );
};
export default ReadingHistories;
