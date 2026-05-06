import React, { useEffect, useState, useEffectEvent, useCallback, useMemo } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Avatar, Button, Dropdown, message, Select, Spin } from 'antd';
import { AnimatePresence, motion } from 'framer-motion';
import {
  BookOutlined,
  ClockCircleOutlined,
  CopyOutlined,
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
import InfiniteScrollContainer from '../../components/common/InfiniteScrollContainer';
import { useInfiniteScroll } from '../../hooks/useInfiniteScroll';
import { ROUTES } from '../../constants/routes';
import type { ColumnDetailVO, ColumnListVO } from '../../types/column';
import type { ColumnArticleListVO } from '../../types/article';
import type { ApiPageResponse } from '../../types/common';
import columnService from '../../services/columnService';
import { getRelativeTime } from '../../utils';
import { useUserStore } from '../../store';

const ColumnDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useUserStore();
  const [columnDetail, setColumnDetail] = useState<ColumnDetailVO | null>(null);
  const [hotColumns, setHotColumns] = useState<ColumnListVO[]>([]);
  const [loading, setLoading] = useState(false);
  const [sortType, setSortType] = useState<'ASC' | 'DESC'>('ASC');
  const [isSubscribed, setIsSubscribed] = useState(false);

  const navigate = useNavigate();

  const articlesPageSize = 10;

  const articlesFetcher = useCallback(async (pageNum: number, pageSize: number): Promise<ApiPageResponse<ColumnArticleListVO>> => {
    if (!id) {
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

    const response = await columnService.getColumnArticles(Number(id), pageNum, pageSize, sortType);
    if (response.code === 200 && response.data) {
      const data = response.data;
      return {
        total: data.total || 0,
        record: data.record || [],
        pageNum: data.pageNum || pageNum,
        pageSize: data.pageSize || pageSize,
        pages: data.pages || Math.ceil((data.total || 0) / pageSize),
        isFirstPage: data.isFirstPage ?? (data.pageNum === 1),
        isLastPage: data.isLastPage ?? ((data.pageNum || 1) >= (data.pages || 1)),
        prePage: data.prePage || 1,
        nextPage: data.nextPage || ((data.pageNum || 1) + 1)
      };
    }
    throw new Error(response.message || '获取专栏文章失败');
  }, [id, sortType]);

  const articlesInfiniteScroll = useInfiniteScroll<ColumnArticleListVO>(articlesFetcher, {
    pageSize: articlesPageSize,
    threshold: 0.1
  });

  const onRefreshArticles = useEffectEvent(() => {
    articlesInfiniteScroll.refresh();
  });

  useEffect(() => {
    if (!id) return;

    setLoading(true);

    Promise.all([
      columnService.getColumnDetail(Number(id)),
      columnService.getHotColumns(3)
    ]).then(([detailRes, hotRes]) => {
      if (detailRes.code === 200 && detailRes.data) {
        setColumnDetail(detailRes.data);
      } else {
        message.error(detailRes.message || '获取专栏详情失败').then();
      }
      if (hotRes.code === 200 && hotRes.data) {
        setHotColumns(hotRes.data);
      }
    }).catch(() => {
      message.error('加载数据失败，请稍后重试').then();
    }).finally(() => {
      setLoading(false);
    });

  }, [id]);

  useEffect(() => {
    if (!id) return;

    if (user) {
      columnService.checkSubscribeStatus(Number(id)).then((response) => {
        if (response.code === 200 && response.data !== undefined) {
          setIsSubscribed(response.data);
        }
      });
    } else {
      setIsSubscribed(false);
    }

  }, [id, user]);

  useEffect(() => {
    if (id) {
      onRefreshArticles();
    }
  }, [id, sortType]);

  const handleSubscribe = async (): Promise<void> => {
    if (!id) return;
    try {
      const response = isSubscribed
        ? await columnService.unsubscribeColumn(Number(id))
        : await columnService.subscribeColumn(Number(id));
      if (response.code === 200) {
        setIsSubscribed(!isSubscribed);
        message.success(isSubscribed ? '已取消订阅' : '订阅成功');
      } else {
        message.error(response.message || (isSubscribed ? '取消订阅失败' : '订阅失败'));
      }
    } catch {
      message.error('操作失败，请稍后重试');
    }
  };

  const columnUrl = useMemo(() => {
    return columnDetail ? `${window.location.origin}/column/${columnDetail.id}` : '';
  }, [columnDetail]);

  const handleCopyLink = useCallback(async (): Promise<void> => {
    try {
      await navigator.clipboard.writeText(columnUrl);
      message.success('分享链接已复制到剪贴板');
    } catch {
      message.error('复制失败，请手动复制');
    }
  }, [columnUrl]);

  const shareMenuItems = useMemo(() => [
    {
      key: 'copy',
      label: '复制链接',
      icon: <CopyOutlined/>,
      onClick: handleCopyLink
    }
  ], [handleCopyLink]);

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
                        {columnDetail.articleCount}
                        <span>篇</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <EyeOutlined/>
                        {columnDetail.readCount}
                        <span>阅读</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <StarOutlined/>
                        {columnDetail.subscriptionCount}
                        <span>订阅</span>
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
                      <Dropdown menu={{ items: shareMenuItems }} trigger={['click']}>
                        <Button icon={<ShareAltOutlined/>}>
                          分享
                        </Button>
                      </Dropdown>
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
                        { value: 'ASC', label: '正序' },
                        { value: 'DESC', label: '倒序' }
                      ]}
                    />
                  </div>

                  <AnimatePresence mode="wait">
                    <motion.div
                      key={sortType}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.25, ease: 'easeInOut' }}
                    >
                      <InfiniteScrollContainer
                        infiniteScroll={articlesInfiniteScroll}
                        renderItem={(article) => (
                          <div
                            key={article.id}
                            className="relative pl-8 pb-6 group cursor-pointer"
                          >
                            <div className="absolute left-0 top-0 w-4 h-4 bg-gray-300 dark:bg-gray-600 rounded-full -translate-x-2 group-hover:bg-cyan-500 group-hover:scale-125 transition-all duration-300 shadow-sm" />
                            <div className="absolute left-0 top-4 w-0.5 h-full bg-gray-300 dark:bg-gray-600 group-hover:bg-cyan-500 dark:group-hover:bg-cyan-500 transition-colors duration-300" />

                            <div
                              className="flex items-start justify-between gap-4 group-hover:-translate-x-1 transition-transform duration-300">
                              <div className="flex-1 min-w-0">
                                <h3
                                  className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2 line-clamp-2 group-hover:text-cyan-500 dark:group-hover:text-cyan-400 transition-colors duration-300">
                                  <a
                                    href={ROUTES.ARTICLE_DETAIL(article.id)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                  >
                                    {article.title}
                                  </a>
                                </h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-3">
                                  {article.summary}
                                </p>
                                <div className="flex items-center gap-5 text-xs text-gray-400">
                                  <span
                                    className="flex items-center gap-1 group-hover:text-cyan-500 transition-colors duration-300">
                                    <EyeOutlined size={14}/>
                                    {article.readCount}
                                  </span>
                                  <span
                                    className="flex items-center gap-1 group-hover:text-cyan-500 transition-colors duration-300">
                                    <MessageOutlined size={14}/>
                                    {article.commentCount}
                                  </span>
                                  <span
                                    className="flex items-center gap-1 group-hover:text-cyan-500 transition-colors duration-300">
                                    <LikeOutlined size={14}/>
                                    {article.likeCount}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <ClockCircleOutlined size={14}/>
                                    {getRelativeTime(article.publishTime)}
                                  </span>
                                </div>
                              </div>

                              {article.coverImage && (
                                <div
                                  className="w-48 h-24 rounded-lg overflow-hidden shrink-0 hidden sm:block group-hover:shadow-[0_4px_15px_rgba(6,182,212,0.3)] transition-shadow duration-300">
                                  <a href={ROUTES.ARTICLE_DETAIL(article.id)} target="_blank" rel="noopener noreferrer">
                                    <LazyImage
                                      src={article.coverImage}
                                      alt={article.title}
                                      className="w-full h-full object-cover group-hover:scale-110 group-hover:brightness-95 transition-all duration-500"
                                    />
                                  </a>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                        emptyContent={
                          <div className="text-center py-10">
                            <p className="text-gray-500 dark:text-gray-400">暂无文章</p>
                          </div>
                        }
                        loadingContent={
                          <div className="flex justify-center items-center py-10">
                            <Spin size="default"/>
                          </div>
                        }
                        className="space-y-6"
                        itemGap="0"
                        noMoreText="已经到底啦 ~"
                      />
                    </motion.div>
                  </AnimatePresence>
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
