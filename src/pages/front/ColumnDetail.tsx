import React, { useState } from 'react';
import { Avatar, Button, Tag, Radio, message } from 'antd';
import {
  UserOutlined,
  BookOutlined,
  StarOutlined,
  ShareAltOutlined,
  LikeOutlined,
  MessageOutlined,
  CalendarOutlined,
  EyeOutlined
} from '@ant-design/icons';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import Header from '../../components/common/Header';
import Footer from '../../components/common/Footer';
import LazyImage from '../../components/common/LazyImage';
import ColumnCard from '../../components/front/ColumnCard';
import { ROUTES } from '../../constants/routes';
import type { Column, ColumnArticle } from '../../types/column';

const mockColumn: Column = {
  id: 1,
  name: '7天突击面试系列',
  description:
    '系统梳理前端面试核心知识点，从JavaScript基础到框架原理，7天带你攻克面试难关。适合正在准备春招、秋招或希望提升前端技能的开发者和同学们。',
  coverImage: 'https://picsum.photos/seed/column1/1200/400',
  author: {
    id: 1,
    nickname: '前端小明',
    avatar: 'https://picsum.photos/seed/avatar1/100/100',
    bio: '资深前端工程师，专注前端技术分享多年',
    followersCount: 5200
  },
  articleCount: 7,
  subscriberCount: 1250,
  createdAt: '2024-01-15',
  updatedAt: '2024-01-22',
  tags: ['面试', '前端', 'JavaScript']
};

const mockArticles: ColumnArticle[] = [
  {
    id: 101,
    title: 'Day1：JavaScript基础核心回顾',
    summary: '从变量类型、作用域、闭包开始，夯实JavaScript基础，为后续深入学习打下坚实基础。',
    coverImage: 'https://picsum.photos/seed/article1/600/340',
    authorId: 1,
    authorNickname: '前端小明',
    authorAvatar: 'https://picsum.photos/seed/avatar1/100/100',
    columnId: 1,
    columnName: '7天突击面试系列',
    likeCount: 320,
    readCount: 5600,
    commentCount: 45,
    publishTime: '2024-01-15'
  },
  {
    id: 102,
    title: 'Day2：事件循环与异步编程',
    summary: '深入理解JavaScript事件循环机制，掌握Promise、async/await等异步编程模式。',
    coverImage: 'https://picsum.photos/seed/article2/600/340',
    authorId: 1,
    authorNickname: '前端小明',
    authorAvatar: 'https://picsum.photos/seed/avatar1/100/100',
    columnId: 1,
    columnName: '7天突击面试系列',
    likeCount: 280,
    readCount: 4200,
    commentCount: 38,
    publishTime: '2024-01-16'
  },
  {
    id: 103,
    title: 'Day3：DOM操作与事件委托',
    summary: '全面掌握DOM操作技巧，理解事件委托的原理和应用场景，提升页面交互能力。',
    coverImage: 'https://picsum.photos/seed/article3/600/340',
    authorId: 1,
    authorNickname: '前端小明',
    authorAvatar: 'https://picsum.photos/seed/avatar1/100/100',
    columnId: 1,
    columnName: '7天突击面试系列',
    likeCount: 245,
    readCount: 3800,
    commentCount: 29,
    publishTime: '2024-01-17'
  },
  {
    id: 104,
    title: 'Day4：TypeScript类型系统进阶',
    summary: '深入TypeScript类型世界，从基础类型到高级类型，掌握类型化开发的核心技巧。',
    coverImage: 'https://picsum.photos/seed/article4/600/340',
    authorId: 1,
    authorNickname: '前端小明',
    authorAvatar: 'https://picsum.photos/seed/avatar1/100/100',
    columnId: 1,
    columnName: '7天突击面试系列',
    likeCount: 198,
    readCount: 2900,
    commentCount: 22,
    publishTime: '2024-01-18'
  },
  {
    id: 105,
    title: 'Day5：React核心原理剖析',
    summary: '从虚拟DOM到Fiber架构，深入理解React的运行机制，打造扎实的React内功。',
    coverImage: 'https://picsum.photos/seed/article5/600/340',
    authorId: 1,
    authorNickname: '前端小明',
    authorAvatar: 'https://picsum.photos/seed/avatar1/100/100',
    columnId: 1,
    columnName: '7天突击面试系列',
    likeCount: 356,
    readCount: 5100,
    commentCount: 52,
    publishTime: '2024-01-19'
  },
  {
    id: 106,
    title: 'Day6：Vue3响应式原理探究',
    summary: '深入理解Vue3的响应式系统，从ref到reactive，掌握Vue3的核心设计思想。',
    coverImage: 'https://picsum.photos/seed/article6/600/340',
    authorId: 1,
    authorNickname: '前端小明',
    authorAvatar: 'https://picsum.photos/seed/avatar1/100/100',
    columnId: 1,
    columnName: '7天突击面试系列',
    likeCount: 267,
    readCount: 3600,
    commentCount: 34,
    publishTime: '2024-01-20'
  },
  {
    id: 107,
    title: 'Day7：前端工程化与性能优化',
    summary: '从Webpack到Vite，从代码分割到性能监控，全面提升你的前端工程化能力。',
    coverImage: 'https://picsum.photos/seed/article7/600/340',
    authorId: 1,
    authorNickname: '前端小明',
    authorAvatar: 'https://picsum.photos/seed/avatar1/100/100',
    columnId: 1,
    columnName: '7天突击面试系列',
    likeCount: 412,
    readCount: 6800,
    commentCount: 67,
    publishTime: '2024-01-21'
  }
];

const mockRelatedColumns: Column[] = [
  {
    id: 3,
    name: 'React源码解析',
    description: '深入React源码，从核心算法到实现原理。',
    coverImage: 'https://picsum.photos/seed/column3/400/225',
    author: {
      id: 3,
      nickname: 'React极客',
      avatar: 'https://picsum.photos/seed/avatar3/100/100',
      followersCount: 12000
    },
    articleCount: 24,
    subscriberCount: 5800,
    createdAt: '2023-03-10',
    updatedAt: '2024-01-18'
  },
  {
    id: 4,
    name: 'TypeScript进阶指南',
    description: '从类型基础到高级技巧，全面掌握TypeScript。',
    coverImage: 'https://picsum.photos/seed/column4/400/225',
    author: { id: 4, nickname: '类型大师', avatar: 'https://picsum.photos/seed/avatar4/100/100', followersCount: 7800 },
    articleCount: 18,
    subscriberCount: 4100,
    createdAt: '2023-08-05',
    updatedAt: '2024-01-15'
  }
];

const ColumnDetailPage: React.FC = () => {
  const [sortType, setSortType] = useState<'latest' | 'hottest'>('latest');
  const [isSubscribed, setIsSubscribed] = useState(false);

  const column = mockColumn;
  const articles =
    sortType === 'latest'
      ? [...mockArticles].sort((a, b) => new Date(b.publishTime).getTime() - new Date(a.publishTime).getTime())
      : [...mockArticles].sort((a, b) => b.readCount - a.readCount);

  const handleSubscribe = (): void => {
    setIsSubscribed(!isSubscribed);
    message.success(isSubscribed ? '已取消订阅' : '订阅成功').then();
  };

  const handleShare = (): void => {
    message.success('分享链接已复制').then();
  };

  return (
    <>
      <Helmet>
        <title>{column.name} - InkStage</title>
      </Helmet>
      <div className="flex min-h-screen flex-col bg-white dark:bg-gray-800 font-sans">
        <Header />

        <main className="flex-1 bg-white dark:bg-gray-800">
          <div className="relative">
            <div className="h-48 md:h-64 lg:h-80 overflow-hidden">
              <LazyImage src={column.coverImage} alt={column.name} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent" />
            </div>
          </div>

          <div className="mx-auto px-[10%] -mt-32 relative z-10">
            <div className="flex flex-col lg:flex-row gap-10 w-full">
              <div className="w-full lg:w-3/4">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
                  <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-gray-200 mb-3">
                    {column.name}
                  </h1>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">{column.description}</p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {column.tags?.map((tag) => (
                      <Tag key={tag} color="blue">
                        {tag}
                      </Tag>
                    ))}
                  </div>
                  <div className="flex flex-wrap items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Avatar src={column.author.avatar} size={48} icon={<UserOutlined />} />
                      <div>
                        <Link
                          to={ROUTES.USER_PROFILE(column.author.id)}
                          className="font-medium text-gray-800 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400"
                        >
                          {column.author.nickname}
                        </Link>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{column.author.followersCount} 粉丝</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 ml-auto">
                      <span className="flex items-center gap-1">
                        <BookOutlined />
                        {column.articleCount}篇
                      </span>
                      <span className="flex items-center gap-1">
                        <StarOutlined />
                        {column.subscriberCount}订阅
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-3 mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                    <Button
                      type={isSubscribed ? 'default' : 'primary'}
                      icon={<StarOutlined />}
                      onClick={handleSubscribe}
                    >
                      {isSubscribed ? '已订阅' : '订阅专栏'}
                    </Button>
                    <Button icon={<ShareAltOutlined />} onClick={handleShare}>
                      分享
                    </Button>
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                    <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                      专栏文章 ({column.articleCount})
                    </h2>
                    <Radio.Group value={sortType} onChange={(e) => setSortType(e.target.value)}>
                      <Radio.Button value="latest">最新文章</Radio.Button>
                      <Radio.Button value="hottest">最热文章</Radio.Button>
                    </Radio.Group>
                  </div>

                  <div className="space-y-6">
                    {articles.map((article) => (
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
                                <LikeOutlined />
                                {article.likeCount}
                              </span>
                              <span className="flex items-center gap-1">
                                <EyeOutlined />
                                {article.readCount}
                              </span>
                              <span className="flex items-center gap-1">
                                <MessageOutlined />
                                {article.commentCount}
                              </span>
                              <span className="flex items-center gap-1">
                                <CalendarOutlined />
                                {article.publishTime}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="w-full lg:w-1/4">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6 lg:top-20">
                  <h3 className="text-base font-semibold text-gray-800 dark:text-gray-200 mb-4">关于作者</h3>
                  <div className="flex items-center gap-3 mb-4">
                    <Avatar src={column.author.avatar} size={56} icon={<UserOutlined />} />
                    <div>
                      <Link
                        to={ROUTES.USER_PROFILE(column.author.id)}
                        className="font-medium text-gray-800 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400"
                      >
                        {column.author.nickname}
                      </Link>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{column.author.followersCount} 粉丝</p>
                    </div>
                  </div>
                  {column.author.bio && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{column.author.bio}</p>
                  )}
                  <Button type="default" className="w-full">
                    查看主页
                  </Button>
                </div>

                <div className="bg-white border border-gray-200 dark:bg-gray-800 rounded-lg shadow-lg p-4">
                  <h3 className="text-base font-semibold text-gray-800 dark:text-gray-200 mb-4">相关专栏</h3>
                  <div className="flex flex-col gap-4">
                    {mockRelatedColumns.map((relatedColumn) => (
                      <ColumnCard key={relatedColumn.id} column={relatedColumn} layout="horizontal" />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default ColumnDetailPage;
