import React, { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Avatar, Button, message, Select, Spin } from 'antd';
import {
  BookOutlined,
  CalendarOutlined,
  EyeOutlined,
  LikeOutlined,
  MessageOutlined,
  PlusOutlined,
  ShareAltOutlined,
  StarOutlined,
  UserOutlined
} from '@ant-design/icons';
import { Helmet } from 'react-helmet-async';
import Header from '../../components/common/Header';
import Footer from '../../components/common/Footer';
import LazyImage from '../../components/common/LazyImage';
import ColumnCard from '../../components/front/ColumnCard';
import { ROUTES } from '../../constants/routes';
import type { ColumnDetailVO, ColumnListVO } from '../../types/column';
import type { ColumnArticleListVO } from '../../types/article';
import columnService from '../../services/columnService';
import { getRelativeTime } from '../../utils';
import { useUserStore } from '../../store';

const ColumnDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useUserStore();
  const [columnDetail, setColumnDetail] = useState<ColumnDetailVO | null>(null);
  const [articles, setArticles] = useState<ColumnArticleListVO[]>([]);
  const [hotColumns, setHotColumns] = useState<ColumnListVO[]>([]);
  const [loading, setLoading] = useState(false);
  const [sortType, setSortType] = useState<'latest' | 'earliest' | 'hottest' | 'title'>('latest');
  const [isSubscribed, setIsSubscribed] = useState(false);

  const navigate = useNavigate();

  // 加载专栏详情
  const loadColumnDetail = useCallback(async (): Promise<void> => {
    if (!id) return;
    try {
      setLoading(true);
      const response = await columnService.getColumnDetail(Number(id));
      if (response.code === 200 && response.data) {
        setColumnDetail(response.data);
        setArticles(response.data.articles || []);
      } else {
        message.error(response.message || '获取专栏详情失败');
      }
    } catch (error) {
      console.error('获取专栏详情失败:', error);
      message.error('获取专栏详情失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  }, [id]);

  // 加载热门专栏
  const loadHotColumns = useCallback(async (): Promise<void> => {
    try {
      const response = await columnService.getHotColumns(3);
      if (response.code === 200 && response.data) {
        setHotColumns(response.data);
      }
    } catch (error) {
      console.error('获取热门专栏失败:', error);
    }
  }, []);

  // 组件加载时调用
  useEffect(() => {
    if (id) {
      loadColumnDetail().then();
      loadHotColumns().then();
    }
  }, [id, loadColumnDetail, loadHotColumns]);

  // 排序文章
  const sortedArticles = [...articles].sort((a, b) => {
    switch (sortType) {
      case 'latest':
        return new Date(b.publishTime).getTime() - new Date(a.publishTime).getTime();
      case 'earliest':
        return new Date(a.publishTime).getTime() - new Date(b.publishTime).getTime();
      case 'hottest':
        return b.readCount - a.readCount;
      case 'title':
        return a.title.localeCompare(b.title, 'zh-CN');
      default:
        return 0;
    }
  });

  const handleSubscribe = (): void => {
    setIsSubscribed(!isSubscribed);
    message.success(isSubscribed ? '已取消订阅' : '订阅成功').then();
  };

  const handleShare = (): void => {
    message.success('分享链接已复制').then();
  };

  const handleCreateArticle = (): void => {
    navigate(ROUTES.CREATE_ARTICLE);
  };

  const isColumnOwner = user?.id === columnDetail?.userId;

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-white dark:bg-gray-800">
        <Spin size="large"/>
      </div>
    );
  }

  if (!columnDetail) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-white dark:bg-gray-800">
        <p className="text-gray-500 dark:text-gray-400">专栏不存在</p>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{columnDetail.name} - InkStage</title>
      </Helmet>
      <div className="flex min-h-screen flex-col bg-white dark:bg-gray-800 font-sans">
        <Header/>

        <main className="flex-1 bg-white dark:bg-gray-800">
          <div className="relative">
            <div className="h-48 md:h-64 lg:h-80 overflow-hidden">
              {columnDetail.coverImage ? (
                <LazyImage src={columnDetail.coverImage} alt={columnDetail.name}
                           className="w-full h-full object-cover"/>
              ) : (
                <div
                  className="w-full h-full bg-linear-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800"/>
              )}
              <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent"/>
            </div>
          </div>

          <div className="mx-auto px-[10%] -mt-32 relative z-10">
            <div className="flex flex-col lg:flex-row gap-10 w-full">
              <div className="w-full lg:w-3/4">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
                  <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-gray-200 mb-3">
                    {columnDetail.name}
                  </h1>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">{columnDetail.description}</p>
                  <div className="flex flex-wrap items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Avatar src={columnDetail.avatar} size={48} icon={<UserOutlined/>}/>
                      <div>
                        <Link
                          to={ROUTES.USER_PROFILE(columnDetail.userId)}
                          className="font-medium text-gray-800 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400"
                        >
                          {columnDetail.nickname}
                        </Link>
                        {columnDetail.signature && (
                          <p className="text-xs text-gray-500 dark:text-gray-400">{columnDetail.signature}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 ml-auto">
                      <span className="flex items-center gap-1">
                        <BookOutlined/>
                        {columnDetail.articleCount}篇
                      </span>
                      <span className="flex items-center gap-1">
                        <EyeOutlined/>
                        {columnDetail.readCount}阅读
                      </span>
                    </div>
                  </div>
                  <div
                    className="flex justify-between items-center gap-3 mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                    <div className="flex gap-3">
                      <Button
                        type={isSubscribed ? 'default' : 'primary'}
                        icon={<StarOutlined/>}
                        onClick={handleSubscribe}
                      >
                        {isSubscribed ? '已订阅' : '订阅专栏'}
                      </Button>
                      <Button icon={<ShareAltOutlined/>} onClick={handleShare}>
                        分享
                      </Button>
                    </div>
                    {isColumnOwner && (
                      <Button variant="outlined" color="blue" icon={<PlusOutlined/>} onClick={handleCreateArticle}>
                        新建专栏文章
                      </Button>
                    )}
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                    <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                      专栏文章 ({columnDetail.articleCount})
                    </h2>
                    <Select
                      value={sortType}
                      onChange={setSortType}
                      className="w-28"
                      options={[
                        { value: 'latest', label: '最新' },
                        { value: 'earliest', label: '最早' },
                        { value: 'hottest', label: '最热' },
                        { value: 'title', label: '标题' }
                      ]}
                    />
                  </div>

                  {sortedArticles.length === 0 ? (
                    <div className="text-center py-10">
                      <p className="text-gray-500 dark:text-gray-400">暂无文章</p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {sortedArticles.map((article) => (
                        <div
                          key={article.id}
                          className="border-b border-gray-200 dark:border-gray-700 last:border-0 pb-4 last:pb-0"
                        >
                          <div className="flex gap-4">
                            {article.coverImage && (
                              <div className="w-48 h-32 rounded-md overflow-hidden shrink-0 hidden sm:block">
                                <a href={ROUTES.ARTICLE_DETAIL(article.id)} target="_blank" rel="noopener noreferrer">
                                  <LazyImage
                                    src={article.coverImage}
                                    alt={article.title}
                                    className="w-full h-full object-cover hover:opacity-90 transition-opacity"
                                  />
                                </a>
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4 line-clamp-2">
                                <a
                                  href={ROUTES.ARTICLE_DETAIL(article.id)}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                                >
                                  {article.title}
                                </a>
                              </h3>
                              <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-4">
                                {article.summary}
                              </p>
                              <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                                <span className="flex items-center gap-1">
                                  <LikeOutlined/>
                                  {article.likeCount}
                                </span>
                                <span className="flex items-center gap-1">
                                  <EyeOutlined/>
                                  {article.readCount}
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
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="w-full lg:w-1/4">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6 lg:top-20">
                  <h3 className="text-base font-semibold text-gray-800 dark:text-gray-200 mb-4">关于作者</h3>
                  <div className="flex items-center gap-3 mb-4">
                    <Avatar src={columnDetail.avatar} size={56} icon={<UserOutlined/>}/>
                    <div>
                      <Link
                        to={ROUTES.USER_PROFILE(columnDetail.userId)}
                        className="font-medium text-gray-800 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400"
                      >
                        {columnDetail.nickname}
                      </Link>
                    </div>
                  </div>
                  {columnDetail.signature && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{columnDetail.signature}</p>
                  )}
                  <Button type="default" className="w-full"
                          onClick={() => navigate(ROUTES.USER_PROFILE(columnDetail.userId))}>
                    查看主页
                  </Button>
                </div>

                {hotColumns.length > 0 && (
                  <div className="bg-white border border-gray-200 dark:bg-gray-800 rounded-lg shadow-lg p-4">
                    <h3 className="text-base font-semibold text-gray-800 dark:text-gray-200 mb-4">热门专栏</h3>
                    <div className="flex flex-col gap-4">
                      {hotColumns.map((relatedColumn) => (
                        <ColumnCard key={relatedColumn.id} column={relatedColumn} layout="horizontal"/>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>

        <Footer/>
      </div>
    </>
  );
};

export default ColumnDetailPage;
