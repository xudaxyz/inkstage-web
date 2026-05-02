import React, { useState } from 'react';
import { Button, Dropdown, Input, message } from 'antd';
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
  StarOutlined,
  ClockCircleOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import useInfiniteScroll from '../../../hooks/useInfiniteScroll';
import { ROUTES } from '../../../constants/routes';
import type { Column, ColumnArticle } from '../../../types/column';

type ViewMode = 'list' | 'detail';

const mockColumns: Column[] = [
  {
    id: 1,
    name: 'React源码解析',
    description:
      '深入解析React源码，带你理解React的核心原理,虚拟DOM是React的核心概念，本文将带你深入理解虚拟DOM的工作原理和优势。通过对比直接操作DOM和虚拟DOM的性能差异，帮助你更好地理解React的渲染机制。',
    coverImage: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=640',
    author: {
      id: 1,
      nickname: '前端极客',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=64',
      followersCount: 5200
    },
    articleCount: 5,
    subscriberCount: 580,
    createdAt: '2024-01-15',
    updatedAt: '2024-03-20',
    tags: ['React', '源码']
  },
  {
    id: 2,
    name: 'TypeScript进阶指南',
    description: '从基础到高级，全面掌握TypeScript',
    coverImage: 'https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=640',
    author: {
      id: 1,
      nickname: '前端极客',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=64',
      followersCount: 5200
    },
    articleCount: 8,
    subscriberCount: 410,
    createdAt: '2024-02-10',
    updatedAt: '2024-04-05',
    tags: ['TypeScript', '前端']
  },
  {
    id: 3,
    name: '7天突击面试',
    description: '面试必备，7天搞定前端面试',
    coverImage: '',
    author: {
      id: 1,
      nickname: '前端极客',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=64',
      followersCount: 5200
    },
    articleCount: 7,
    subscriberCount: 250,
    createdAt: '2024-03-01',
    updatedAt: '2024-03-15',
    tags: ['面试', '前端']
  },
  {
    id: 4,
    name: '道德经81章精读',
    description:
      '逐章解读老子道德经，领悟东方智慧,虚拟DOM是React的核心概念，本文将带你深入理解虚拟DOM的工作原理和优势。通过对比直接操作DOM和虚拟DOM的性能差异，帮助你更好地理解React的渲染机制。，虚拟DOM是React的核心概念，本文将带你深入理解虚拟DOM的工作原理和优势。通过对比直接操作DOM和虚拟DOM的性能差异，帮助你更好地理解React的渲染机制。',
    coverImage: 'https://images.unsplash.com/photo-1497032205916-ac775f0c9ae4?w=640',
    author: {
      id: 1,
      nickname: '前端极客',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=64',
      followersCount: 5200
    },
    articleCount: 12,
    subscriberCount: 1200,
    createdAt: '2023-12-01',
    updatedAt: '2024-04-20',
    tags: ['国学', '道德经']
  },
  {
    id: 5,
    name: '前端性能优化实战',
    description: '从网络请求到渲染优化，全面提升网站性能',
    coverImage: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=640',
    author: {
      id: 1,
      nickname: '前端极客',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=64',
      followersCount: 5200
    },
    articleCount: 15,
    subscriberCount: 680,
    createdAt: '2024-01-20',
    updatedAt: '2024-04-10',
    tags: ['前端', '性能']
  },
  {
    id: 6,
    name: 'Node.js后端开发',
    description: '使用Node.js构建高性能后端服务',
    coverImage: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=640',
    author: {
      id: 1,
      nickname: '前端极客',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=64',
      followersCount: 5200
    },
    articleCount: 22,
    subscriberCount: 340,
    createdAt: '2024-02-20',
    updatedAt: '2024-04-15',
    tags: ['Node.js', '后端']
  }
];

const mockArticles: Record<number, ColumnArticle[]> = {
  1: [
    {
      id: 101,
      title: 'React源码解析（一）：深入理解虚拟DOM',
      summary:
        '虚拟DOM是React的核心概念，本文将带你深入理解虚拟DOM的工作原理和优势。通过对比直接操作DOM和虚拟DOM的性能差异，帮助你更好地理解React的渲染机制。虚拟DOM是React的核心概念，本文将带你深入理解虚拟DOM的工作原理和优势。通过对比直接操作DOM和虚拟DOM的性能差异，帮助你更好地理解React的渲染机制。虚拟DOM是React的核心概念，本文将带你深入理解虚拟DOM的工作原理和优势。通过对比直接操作DOM和虚拟DOM的性能差异，帮助你更好地理解React的渲染机制。',
      coverImage: 'https://picsum.photos/seed/article1/400/300',
      authorId: 1,
      authorNickname: '前端极客',
      authorAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=64',
      columnId: 1,
      columnName: 'React源码解析',
      likeCount: 320,
      readCount: 5600,
      commentCount: 45,
      publishTime: '2024-01-15'
    },
    {
      id: 102,
      title:
        'React源码解析（二）：Fiber架构详解 - 深入探索React 16全新的协调引擎，React源码解析（二）：Fiber架构详解 - 深入探索React 16全新的协调引擎React源码解析（二）：Fiber架构详解 - 深入探索React 16全新的协调引擎React源码解析（二）：Fiber架构详解 - 深入探索React 16全新的协调引擎',
      summary:
        'Fiber是React 16引入的新架构，本文深入分析Fiber的工作原理和调度机制，探讨它是如何让React能够实现时间切片和Suspense的。',
      coverImage: undefined,
      authorId: 1,
      authorNickname: '前端极客',
      authorAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=64',
      columnId: 1,
      columnName: 'React源码解析',
      likeCount: 280,
      readCount: 4200,
      commentCount: 38,
      publishTime: '2024-01-20'
    },
    {
      id: 102,
      title:
        'React源码解析（二）：Fiber架构详解 - 深入探索React 16全新的协调引擎，React源码解析（二）：Fiber架构详解 - 深入探索React 16全新的协调引擎React源码解析（二）：Fiber架构详解 - 深入探索React 16全新的协调引擎React源码解析（二）：Fiber架构详解 - 深入探索React 16全新的协调引擎',
      summary:
        'Fiber是React 16引入的新架构，本文深入分析Fiber的工作原理和调度机制，探讨它是如何让React能够实现时间切片和Suspense的。',
      coverImage: undefined,
      authorId: 1,
      authorNickname: '前端极客',
      authorAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=64',
      columnId: 1,
      columnName: 'React源码解析',
      likeCount: 280,
      readCount: 4200,
      commentCount: 38,
      publishTime: '2024-01-20'
    },
    {
      id: 102,
      title:
        'React源码解析（二）：Fiber架构详解 - 深入探索React 16全新的协调引擎，React源码解析（二）：Fiber架构详解 - 深入探索React 16全新的协调引擎React源码解析（二）：Fiber架构详解 - 深入探索React 16全新的协调引擎React源码解析（二）：Fiber架构详解 - 深入探索React 16全新的协调引擎',
      summary:
        'Fiber是React 16引入的新架构，本文深入分析Fiber的工作原理和调度机制，探讨它是如何让React能够实现时间切片和Suspense的。',
      coverImage: undefined,
      authorId: 1,
      authorNickname: '前端极客',
      authorAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=64',
      columnId: 1,
      columnName: 'React源码解析',
      likeCount: 280,
      readCount: 4200,
      commentCount: 38,
      publishTime: '2024-01-20'
    },
    {
      id: 103,
      title: 'Hooks实现原理',
      summary: 'Hooks是React 16.8引入的新特性，本文分析Hooks的实现原理和使用规则。',
      coverImage: 'https://picsum.photos/seed/article3/400/300',
      authorId: 1,
      authorNickname: '前端极客',
      authorAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=64',
      columnId: 1,
      columnName: 'React源码解析',
      likeCount: 245,
      readCount: 3800,
      commentCount: 29,
      publishTime: '2024-01-25'
    },
    {
      id: 102,
      title:
        'React源码解析（二）：Fiber架构详解 - 深入探索React 16全新的协调引擎，React源码解析（二）：Fiber架构详解 - 深入探索React 16全新的协调引擎React源码解析（二）：Fiber架构详解 - 深入探索React 16全新的协调引擎React源码解析（二）：Fiber架构详解 - 深入探索React 16全新的协调引擎',
      summary:
        'Fiber是React 16引入的新架构，本文深入分析Fiber的工作原理和调度机制，探讨它是如何让React能够实现时间切片和Suspense的。',
      coverImage: undefined,
      authorId: 1,
      authorNickname: '前端极客',
      authorAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=64',
      columnId: 1,
      columnName: 'React源码解析',
      likeCount: 280,
      readCount: 4200,
      commentCount: 38,
      publishTime: '2024-01-20'
    },
    {
      id: 102,
      title:
        'React源码解析（二）：Fiber架构详解 - 深入探索React 16全新的协调引擎，React源码解析（二）：Fiber架构详解 - 深入探索React 16全新的协调引擎React源码解析（二）：Fiber架构详解 - 深入探索React 16全新的协调引擎React源码解析（二）：Fiber架构详解 - 深入探索React 16全新的协调引擎',
      summary:
        'Fiber是React 16引入的新架构，本文深入分析Fiber的工作原理和调度机制，探讨它是如何让React能够实现时间切片和Suspense的。',
      coverImage: undefined,
      authorId: 1,
      authorNickname: '前端极客',
      authorAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=64',
      columnId: 1,
      columnName: 'React源码解析',
      likeCount: 280,
      readCount: 4200,
      commentCount: 38,
      publishTime: '2024-01-20'
    },
    {
      id: 102,
      title:
        'React源码解析（二）：Fiber架构详解 - 深入探索React 16全新的协调引擎，React源码解析（二）：Fiber架构详解 - 深入探索React 16全新的协调引擎React源码解析（二）：Fiber架构详解 - 深入探索React 16全新的协调引擎React源码解析（二）：Fiber架构详解 - 深入探索React 16全新的协调引擎',
      summary:
        'Fiber是React 16引入的新架构，本文深入分析Fiber的工作原理和调度机制，探讨它是如何让React能够实现时间切片和Suspense的。',
      coverImage: undefined,
      authorId: 1,
      authorNickname: '前端极客',
      authorAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=64',
      columnId: 1,
      columnName: 'React源码解析',
      likeCount: 280,
      readCount: 4200,
      commentCount: 38,
      publishTime: '2024-01-20'
    },
    {
      id: 103,
      title: 'Hooks实现原理',
      summary: 'Hooks是React 16.8引入的新特性，本文分析Hooks的实现原理和使用规则。',
      coverImage: 'https://picsum.photos/seed/article3/400/300',
      authorId: 1,
      authorNickname: '前端极客',
      authorAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=64',
      columnId: 1,
      columnName: 'React源码解析',
      likeCount: 245,
      readCount: 3800,
      commentCount: 29,
      publishTime: '2024-01-25'
    },
    {
      id: 104,
      title: 'React状态管理机制：从setState到useState的演进之路，以及为什么Redux依然是最佳选择',
      summary: 'React如何管理组件状态？本文深入分析setState和状态提升的原理，对比不同状态管理方案的优缺点。',
      coverImage: undefined,
      authorId: 1,
      authorNickname: '前端极客',
      authorAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=64',
      columnId: 1,
      columnName: 'React源码解析',
      likeCount: 198,
      readCount: 2900,
      commentCount: 22,
      publishTime: '2024-02-01'
    },
    {
      id: 103,
      title: 'Hooks实现原理',
      summary: 'Hooks是React 16.8引入的新特性，本文分析Hooks的实现原理和使用规则。',
      coverImage: 'https://picsum.photos/seed/article3/400/300',
      authorId: 1,
      authorNickname: '前端极客',
      authorAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=64',
      columnId: 1,
      columnName: 'React源码解析',
      likeCount: 245,
      readCount: 3800,
      commentCount: 29,
      publishTime: '2024-01-25'
    },
    {
      id: 103,
      title: 'Hooks实现原理',
      summary: 'Hooks是React 16.8引入的新特性，本文分析Hooks的实现原理和使用规则。',
      coverImage: 'https://picsum.photos/seed/article3/400/300',
      authorId: 1,
      authorNickname: '前端极客',
      authorAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=64',
      columnId: 1,
      columnName: 'React源码解析',
      likeCount: 245,
      readCount: 3800,
      commentCount: 29,
      publishTime: '2024-01-25'
    },
    {
      id: 103,
      title: 'Hooks实现原理',
      summary: 'Hooks是React 16.8引入的新特性，本文分析Hooks的实现原理和使用规则。',
      coverImage: 'https://picsum.photos/seed/article3/400/300',
      authorId: 1,
      authorNickname: '前端极客',
      authorAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=64',
      columnId: 1,
      columnName: 'React源码解析',
      likeCount: 245,
      readCount: 3800,
      commentCount: 29,
      publishTime: '2024-01-25'
    },
    {
      id: 105,
      title: '并发模式展望',
      summary: 'React 18引入了并发模式，本文探讨并发渲染的原理和未来发展方向。',
      coverImage: 'https://picsum.photos/seed/article5/400/300',
      authorId: 1,
      authorNickname: '前端极客',
      authorAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=64',
      columnId: 1,
      columnName: 'React源码解析',
      likeCount: 356,
      readCount: 5100,
      commentCount: 52,
      publishTime: '2024-02-10'
    }
  ],
  2: [
    {
      id: 201,
      title: 'TypeScript入门指南',
      summary: 'TypeScript是JavaScript的超集，本教程带你快速入门TypeScript开发。',
      coverImage: 'https://picsum.photos/seed/ts1/400/300',
      authorId: 1,
      authorNickname: '前端极客',
      authorAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=64',
      columnId: 2,
      columnName: 'TypeScript进阶指南',
      likeCount: 150,
      readCount: 3000,
      commentCount: 20,
      publishTime: '2024-02-10'
    }
  ],
  3: [
    {
      id: 301,
      title: 'Day1：JavaScript基础回顾',
      summary: '从变量类型、作用域、闭包开始，夯实JavaScript基础。',
      coverImage: 'https://picsum.photos/seed/interview1/400/300',
      authorId: 1,
      authorNickname: '前端极客',
      authorAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=64',
      columnId: 3,
      columnName: '7天突击面试',
      likeCount: 200,
      readCount: 4000,
      commentCount: 35,
      publishTime: '2024-03-01'
    }
  ]
};

const MyColumns: React.FC = () => {
  const navigate = useNavigate();
  const [searchText, setSearchText] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedColumnId, setSelectedColumnId] = useState<number | null>(null);

  const infiniteScroll = useInfiniteScroll<Column>(
    async (page: number, pageSize: number) => {
      const start = (page - 1) * pageSize;
      const end = start + pageSize;
      const records = mockColumns.slice(start, end);
      return {
        record: records,
        total: mockColumns.length,
        pageNum: page,
        pageSize,
        pages: Math.ceil(mockColumns.length / pageSize),
        isFirstPage: page === 1,
        isLastPage: end >= mockColumns.length,
        prePage: page > 1 ? page - 1 : 1,
        nextPage: end < mockColumns.length ? page + 1 : page
      };
    },
    { pageSize: 5 }
  );

  const selectedColumn = mockColumns.find((col) => col.id === selectedColumnId);
  const selectedArticles = selectedColumnId ? mockArticles[selectedColumnId] || [] : [];

  const totalArticles = mockColumns.reduce((sum, col) => sum + col.articleCount, 0);
  const totalSubscribers = mockColumns.reduce((sum, col) => sum + col.subscriberCount, 0);

  const handleViewColumn = (columnId: number): void => {
    setSelectedColumnId(columnId);
    setViewMode('detail');
  };

  const handleBackToList = (): void => {
    setSelectedColumnId(null);
    setViewMode('list');
  };

  const handleEditColumn = (columnId: number): void => {
    navigate(ROUTES.EDIT_COLUMN(columnId));
  };

  const handleDeleteColumn = async (columnId: number): Promise<void> => {
    console.log(columnId);
    void message.success('删除功能开发中');
  };

  const handleCreateArticle = (columnId: number): void => {
    console.log(columnId);
    navigate(ROUTES.CREATE_ARTICLE);
  };

  const handleViewArticle = (articleId: number): void => {
    window.open(ROUTES.ARTICLE_DETAIL(articleId), '_blank');
  };

  const handleEditArticle = (articleId: number): void => {
    navigate(ROUTES.EDIT_ARTICLE(articleId));
  };

  const handleDeleteArticle = async (articleId: number): Promise<void> => {
    console.log(articleId);
    void message.success('删除功能开发中');
  };

  if (viewMode === 'detail' && selectedColumn) {
    return (
      <>
        <Helmet>
          <title>{selectedColumn.name} - 我的专栏 - InkStage</title>
        </Helmet>
        <div className="mx-auto">
          <ColumnDetailSection
            column={selectedColumn}
            articles={selectedArticles}
            totalColumns={infiniteScroll.total}
            totalArticles={totalArticles}
            totalSubscribers={totalSubscribers}
            onBack={handleBackToList}
            onEditColumn={() => handleEditColumn(selectedColumn.id)}
            onCreateArticle={() => handleCreateArticle(selectedColumn.id)}
            onViewArticle={handleViewArticle}
            onEditArticle={handleEditArticle}
            onDeleteArticle={handleDeleteArticle}
            onCreateColumn={() => navigate(ROUTES.CREATE_COLUMN)}
          />
        </div>
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>我的专栏 - InkStage</title>
      </Helmet>
      <div className="mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div className="flex flex-wrap items-center gap-x-2 md:gap-4">
            <h1 className="text-xl md:text-2xl font-bold text-gray-800 dark:text-white">
              我的专栏
              <span className="text-gray-500 dark:text-gray-300 text-base md:text-lg">({infiniteScroll.total})</span>
            </h1>
            <div className="flex items-center gap-1 md:gap-3 text-sm md:text-base">
              <div className="flex items-center gap-1 px-2 py-0.5 md:px-3 md:py-1 bg-green-50 text-green-600 rounded-full dark:bg-green-900/30 dark:text-green-400">
                <span>共</span>
                <span className="font-bold">{totalArticles}</span>
                <span>篇</span>
              </div>
              <div className="flex items-center gap-1 px-1 py-0.5 md:px-3 md:py-1 bg-purple-50 text-purple-600 rounded-full dark:bg-purple-900/30 dark:text-purple-400">
                <span className="font-bold">{totalSubscribers}</span>
                <span>订阅</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 md:gap-4 w-full md:w-auto">
            <Input
              placeholder="搜索专栏..."
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="flex md:flex-initial"
              style={{ maxWidth: '180px', width: '150px' }}
            />
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => navigate(ROUTES.CREATE_COLUMN)}
              className="shrink-0"
            >
              创建专栏
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {mockColumns.map((column) => (
            <div
              key={column.id}
              className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
            >
              <div className="aspect-video overflow-hidden cursor-pointer" onClick={() => handleViewColumn(column.id)}>
                <LazyImage
                  src={column.coverImage}
                  alt={column.name}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
              </div>

              <div className="p-4">
                <h3
                  className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2 line-clamp-1 cursor-pointer hover:text-blue-600 dark:hover:text-blue-400"
                  onClick={() => handleViewColumn(column.id)}
                >
                  {column.name}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 line-clamp-2 leading-relaxed">
                  {column.description}
                </p>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 md:gap-3 text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap overflow-hidden">
                    <span className="flex items-center gap-1">
                      <BookOutlined className="w-3 h-3" />
                      {column.articleCount}
                    </span>
                    <span className="flex items-center gap-1">
                      <StarOutlined className="w-3 h-3" />
                      {column.subscriberCount}
                    </span>
                    <span className="flex items-center gap-1 lg:hidden">
                      <ClockCircleOutlined className="w-3 h-3" />
                      {column.createdAt}
                    </span>
                  </div>

                  <Dropdown
                    menu={{
                      items: [
                        {
                          key: 'view',
                          label: '查看',
                          icon: <EyeOutlined />,
                          onClick: () => handleViewColumn(column.id)
                        },
                        {
                          key: 'edit',
                          label: '编辑',
                          icon: <EditOutlined />,
                          onClick: () => handleEditColumn(column.id)
                        },
                        {
                          key: 'delete',
                          label: '删除',
                          icon: <DeleteOutlined />,
                          danger: true,
                          onClick: () => handleDeleteColumn(column.id)
                        }
                      ]
                    }}
                    trigger={['click']}
                  >
                    <Button type="text" icon={<EllipsisOutlined />} className="p-1" />
                  </Dropdown>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default MyColumns;
