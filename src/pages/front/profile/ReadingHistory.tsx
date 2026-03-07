import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Button, Card, Input, Empty, Space, Popover, Tag, Divider, Spin, message, Pagination } from 'antd';
import {
  DeleteOutlined,
  EyeOutlined,
  SearchOutlined,
  MoreOutlined,
  ClockCircleOutlined
} from '@ant-design/icons';
import { ROUTES } from '../../../routes/constants';
import readingHistoryService, { type ReadingHistory } from '../../../services/readingHistoryService';
import {formatDateOnly, formatTimeShort} from '../../../utils/dateUtils';

const ReadingHistory: React.FC = () => {
  // 状态管理
  const [histories, setHistories] = useState<ReadingHistory[]>([]);
  const [searchText, setSearchText] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(3);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);

  // 获取阅读历史列表
  const fetchReadingHistory = useCallback(async () => {
    setLoading(true);
    try {
      const response = await readingHistoryService.getReadingHistoryList(currentPage, pageSize);
      if (response.code === 200 && response.data) {
        setHistories(response.data.record);
        setTotal(response.data.total);
      } else {
        message.error(response.message || '获取阅读历史失败');
      }
    } catch (error) {
      console.error('获取阅读历史失败:', error);
      message.error('网络错误，请稍后重试');
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize]);

  // 初始加载和分页变化时获取数据
  useEffect(() => {
    fetchReadingHistory();
  }, [fetchReadingHistory]);

  // 按日期分组
  const groupedHistories = useMemo(() => {
    const filteredHistories = histories.filter(history => 
      history.title.toLowerCase().includes(searchText.toLowerCase()) ||
      history.authorName.toLowerCase().includes(searchText.toLowerCase())
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

  // 分页处理
  const paginatedGroups = useMemo(() => {
    const allItems = Object.entries(groupedHistories).flatMap(([date, items]) => 
      items.map(item => ({ ...item, date }))
    );
    
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedItems = allItems.slice(startIndex, endIndex);
    
    // 重新分组
    return paginatedItems.reduce((groups: Record<string, ReadingHistory[]>, item) => {
      const date = item.date;
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(item);
      return groups;
    }, {});
  }, [groupedHistories, currentPage, pageSize]);

  // 清空所有历史
  const handleClearAll = async () => {
    try {
      const response = await readingHistoryService.clearReadingHistory();
      if (response.code === 200) {
        message.success('已清空所有阅读历史');
        setHistories([]);
        setTotal(0);
      } else {
        message.error(response.message || '清空阅读历史失败');
      }
    } catch (error) {
      console.error('清空阅读历史失败:', error);
      message.error('网络错误，请稍后重试');
    }
  };

  // 删除单个历史
  const handleDeleteSingle = async (articleId: string) => {
    try {
      const response = await readingHistoryService.deleteReadingHistory(Number(articleId));
      if (response.code === 200) {
        message.success('已删除阅读历史');
        // 重新加载数据
        fetchReadingHistory();
      } else {
        message.error(response.message || '删除阅读历史失败');
      }
    } catch (error) {
      console.error('删除阅读历史失败:', error);
      message.error('网络错误，请稍后重试');
    }
  };

  // 继续阅读
  const handleContinueReading = (articleId: string) => {
    // 跳转到文章详情页
    window.open(ROUTES.ARTICLE_DETAIL(articleId), '_blank');
  };

  return (
    <div className="mx-auto">
      {/* 页面标题 */}
      <div className="flex items-center gap-2 mb-6">
        <h1 className="text-2xl font-bold text-secondary-800">阅读历史</h1>
        <div>({total})</div>
      </div>

      {/* 搜索和操作区域 */}
      <div className="border-b border-gray-200 flex flex-wrap justify-between items-center pb-4 mb-6">
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
        <Button
          danger
          icon={<DeleteOutlined />}
          onClick={handleClearAll}
          disabled={total === 0}
        >
          清空历史
        </Button>
      </div>

      {/* 阅读历史列表 */}
      {loading ? (
        <div className="py-12 flex justify-center">
          <Spin size="large" tip="加载中..." />
        </div>
      ) : total > 0 ? (
        <div className="space-y-6">
          {Object.entries(paginatedGroups).map(([date, items]) => (
            <div key={date} className="mb-6">
              {/* 日期标题 */}
              <h2 className="text-lg font-semibold text-secondary-700 mb-4 flex items-center">
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
                        borderBottom: '1px solid #e8e8e8',
                        borderRadius: 0
                      }
                    }}
                  >
                    <div className="flex items-start gap-4">
                      {/* 文章内容 */}
                      <div className="flex-1">
                        {/* 第一行：文章标题 */}
                        <div className="flex items-center mb-2">
                          <h3 className="text-xl font-semibold text-secondary-800 hover:text-primary-600 transition-colors duration-200 flex-1">
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
                        <div className="text-sm text-secondary-500 mb-4 line-clamp-2">
                          {history.summary}
                        </div>

                        {/* 第三行：阅读信息、作者信息、统计数据 */}
                        <div className="flex flex-wrap items-center justify-between">
                          <div className="flex items-center gap-3 justify-between text-sm text-secondary-500">
                            {/* 作者信息 */}
                            <div className="flex items-center">
                              <img
                                src={history.avatar}
                                alt={history.authorName}
                                className="w-7 h-7 rounded-full object-cover mr-2"
                              />
                              <span>{history.authorName}</span>
                              <Divider orientation="vertical" className="bg-gray-300" style={{ height: '16px', margin: '0 12px' }} />
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

          {/* 分页 */}
          <div className="mt-6 flex justify-center">
            <Pagination
              current={currentPage}
              pageSize={pageSize}
              total={total}
              onChange={(page) => setCurrentPage(page)}
              onShowSizeChange={(_, size) => setPageSize(size)}
              showSizeChanger
              showTotal={(total) => `共 ${total} 条阅读历史`}
            />
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl shadow-sm">
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="暂无阅读历史"
            className="py-8"
          />
        </div>
      )}
    </div>
  );
};

export default ReadingHistory;