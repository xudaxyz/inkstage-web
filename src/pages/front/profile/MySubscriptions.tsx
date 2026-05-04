import React, { useState, useEffect } from 'react';
import { Button, Input, message, Spin } from 'antd';
import { Helmet } from 'react-helmet-async';
import LazyImage from '../../../components/common/LazyImage';
import {
  SearchOutlined,
  BookOutlined,
  EyeOutlined,
  CalendarOutlined,
  ArrowLeftOutlined,
  UserOutlined,
  StarOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../../constants/routes';
import columnService from '../../../services/columnService';
import type { MyColumnSubscriptionVO } from '../../../types/column';
import { getRelativeTime } from '../../../utils';

const MySubscriptions: React.FC = () => {
  const navigate = useNavigate();
  const [subscriptions, setSubscriptions] = useState<MyColumnSubscriptionVO[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');

  const loadSubscriptions = async (): Promise<void> => {
    setLoading(true);
    try {
      const response = await columnService.getMySubscriptions(0, 100);
      if (response.code === 200 && response.data) {
        setSubscriptions(response.data);
      } else {
        message.error(response.message || '获取订阅列表失败');
      }
    } catch {
      message.error('获取订阅列表失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSubscriptions().then();
  }, []);

  const filteredSubscriptions = subscriptions.filter((sub) => {
    if (!searchText) return true;
    return (
      sub.name.includes(searchText) ||
      (sub.description && sub.description.includes(searchText)) ||
      (sub.nickname && sub.nickname.includes(searchText))
    );
  });

  const handleViewColumn = (columnId: number): void => {
    navigate(ROUTES.COLUMN_DETAIL(columnId));
  };

  const handleUnsubscribe = async (columnId: number, e: React.MouseEvent): Promise<void> => {
    e.stopPropagation();
    const response = await columnService.unsubscribeColumn(columnId);
    if (response.code === 200 && response.data) {
      message.success('已取消订阅');
      await loadSubscriptions();
    } else {
      message.error(response.message || '取消订阅失败');
    }
  };

  return (
    <>
      <Helmet>
        <title>我的订阅 - InkStage</title>
      </Helmet>
      <div className="mx-auto px-[5%] py-6">
        <div
          className="flex flex-col md:flex-row w-full justify-between items-start md:items-center gap-2 md:gap-4 mb-8">
          <div className="flex flex-nowrap items-center gap-2 md:gap-4 sm:gap-2 shrink-0">
            <h1 className="text-xl md:text-2xl font-bold text-gray-800 dark:text-white whitespace-nowrap">
              我的订阅
              <span className="text-gray-500 dark:text-gray-300 text-base md:text-lg ml-2">
                ({subscriptions.length})
              </span>
            </h1>
          </div>
          <div className="flex items-center gap-2 md:gap-4 sm:gap-2 flex-nowrap">
            <Input
              placeholder="搜索订阅..."
              prefix={<SearchOutlined/>}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="flex md:flex-initial"
              style={{ maxWidth: '180px', width: '150px' }}
            />
            <Button
              variant="solid"
              color="gold"
              icon={<ArrowLeftOutlined/>}
              onClick={() => navigate(ROUTES.PROFILE)}
              className="shrink-0"
            >
              返回
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Spin size="large"/>
          </div>
        ) : filteredSubscriptions.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-500 dark:text-gray-400 text-lg">
              {searchText ? '没有找到相关订阅' : '还没有订阅任何专栏'}
            </p>
            {!searchText && (
              <Button type="primary" className="mt-4" onClick={() => navigate(ROUTES.MY_COLUMNS)}>
                浏览专栏
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredSubscriptions.map((sub) => (
              <div
                key={sub.id}
                className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
              >
                <div className="aspect-video overflow-hidden cursor-pointer"
                     onClick={() => handleViewColumn(sub.id)}>
                  {sub.coverImage ? (
                    <LazyImage
                      src={sub.coverImage}
                      alt={sub.name}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div
                      className="w-full h-full bg-linear-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center">
                      <span className="text-white text-4xl font-bold px-4 text-center">{sub.name}</span>
                    </div>
                  )}
                </div>

                <div className="p-4">
                  <h3
                    className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2 line-clamp-1 cursor-pointer hover:text-blue-600 dark:hover:text-blue-400"
                    onClick={() => handleViewColumn(sub.id)}
                  >
                    {sub.name}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 line-clamp-2 leading-relaxed">
                    {sub.description}
                  </p>

                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                      <span className="flex items-center gap-1">
                        <UserOutlined className="w-3 h-3"/>
                        <span className="truncate">{sub.nickname}</span>
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                      <CalendarOutlined className="w-3 h-3"/>
                      {getRelativeTime(sub.subscriptionTime)}
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-3">
                    <div
                      className="flex items-center gap-2 md:gap-3 text-xs text-gray-500 dark:text-gray-400">
                      <span className="flex items-center gap-1">
                        <BookOutlined className="w-3 h-3"/>
                        {sub.articleCount}篇
                      </span>
                      <span className="flex items-center gap-1">
                        <EyeOutlined className="w-3 h-3"/>
                        {sub.readCount}
                      </span>
                      <span className="flex items-center gap-1">
                        <StarOutlined className="w-3 h-3"/>
                        {sub.subscriptionCount}
                      </span>
                    </div>
                    <Button
                      type="text"
                      danger
                      onClick={(e) => handleUnsubscribe(sub.id, e)}
                      className="p-1 text-sm"
                    >
                      取消订阅
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default MySubscriptions;
