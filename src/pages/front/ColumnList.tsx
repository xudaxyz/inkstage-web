import React, { useState } from 'react';
import { Select, Spin, Input } from 'antd';
import { SearchOutlined, CloseOutlined } from '@ant-design/icons';
import { Helmet } from 'react-helmet-async';
import Header from '../../components/common/Header';
import Footer from '../../components/common/Footer';
import ColumnCard from '../../components/front/ColumnCard';
import type { Column } from '../../types/column';

const mockColumns: Column[] = [
  {
    id: 1,
    name: '7天突击面试系列',
    description: '系统梳理前端面试核心知识点，从JavaScript基础到框架原理，7天带你攻克面试难关。',
    coverImage: 'https://picsum.photos/seed/column1/800/450',
    author: { id: 1, nickname: '前端小明', avatar: 'https://picsum.photos/seed/avatar1/100/100', followersCount: 5200 },
    articleCount: 7,
    subscriberCount: 1250,
    createdAt: '2024-01-15',
    updatedAt: '2024-01-22',
    tags: ['面试', '前端']
  },
  {
    id: 2,
    name: '道德经81章精读',
    description: '逐章解读道德经，原文+释义+个人感悟，探寻道家智慧在现代生活中的应用。',
    coverImage: 'https://picsum.photos/seed/column2/800/450',
    author: { id: 2, nickname: '道玄居士', avatar: 'https://picsum.photos/seed/avatar2/100/100', followersCount: 8900 },
    articleCount: 15,
    subscriberCount: 3200,
    createdAt: '2023-06-01',
    updatedAt: '2024-01-20',
    tags: ['国学', '道德经']
  },
  {
    id: 3,
    name: 'React源码解析',
    description: '深入React源码，从核心算法到实现原理，打造顶尖React开发能力。',
    coverImage: 'https://picsum.photos/seed/column3/800/450',
    author: {
      id: 3,
      nickname: 'React极客',
      avatar: 'https://picsum.photos/seed/avatar3/100/100',
      followersCount: 12000
    },
    articleCount: 24,
    subscriberCount: 5800,
    createdAt: '2023-03-10',
    updatedAt: '2024-01-18',
    tags: ['React', '源码']
  },
  {
    id: 4,
    name: 'TypeScript进阶指南',
    description: '从类型基础到高级技巧，全面掌握TypeScript，写出更健壮的代码。',
    coverImage: 'https://picsum.photos/seed/column4/800/450',
    author: { id: 4, nickname: '类型大师', avatar: 'https://picsum.photos/seed/avatar4/100/100', followersCount: 7800 },
    articleCount: 18,
    subscriberCount: 4100,
    createdAt: '2023-08-05',
    updatedAt: '2024-01-15',
    tags: ['TypeScript', '前端']
  },
  {
    id: 5,
    name: '唐诗300首精讲',
    description: '精选唐诗三百首，逐首进行深度赏析，品味中华诗词之美。',
    coverImage: 'https://picsum.photos/seed/column5/800/450',
    author: { id: 5, nickname: '诗韵江南', avatar: 'https://picsum.photos/seed/avatar5/100/100', followersCount: 6500 },
    articleCount: 45,
    subscriberCount: 2800,
    createdAt: '2022-11-20',
    updatedAt: '2024-01-21',
    tags: ['诗词', '国学']
  },
  {
    id: 6,
    name: '前端性能优化实战',
    description: '真实案例分析，从加载、渲染、交互多维度提升Web应用性能。',
    coverImage: 'https://picsum.photos/seed/column6/800/450',
    author: { id: 6, nickname: '性能侠', avatar: 'https://picsum.photos/seed/avatar6/100/100', followersCount: 4300 },
    articleCount: 12,
    subscriberCount: 1950,
    createdAt: '2023-10-12',
    updatedAt: '2024-01-10',
    tags: ['性能', '前端']
  },
  {
    id: 7,
    name: 'Node.js最佳实践',
    description: '从架构设计到线上运维，分享企业级Node.js开发的实战经验。',
    coverImage: 'https://picsum.photos/seed/column7/800/450',
    author: { id: 7, nickname: 'Node全栈', avatar: 'https://picsum.photos/seed/avatar7/100/100', followersCount: 5600 },
    articleCount: 20,
    subscriberCount: 2300,
    createdAt: '2023-05-18',
    updatedAt: '2024-01-12',
    tags: ['Node.js', '后端']
  },
  {
    id: 8,
    name: 'CSS奇技淫巧',
    description: '探索CSS的无限可能，用最优雅的方式实现炫酷视觉效果。',
    coverImage: 'https://picsum.photos/seed/column8/800/450',
    author: {
      id: 8,
      nickname: 'CSS魔法师',
      avatar: 'https://picsum.photos/seed/avatar8/100/100',
      followersCount: 3800
    },
    articleCount: 16,
    subscriberCount: 1600,
    createdAt: '2023-09-22',
    updatedAt: '2024-01-08',
    tags: ['CSS', '前端']
  }
];

const allTags = [
  '全部',
  '前端',
  '后端',
  'React',
  'TypeScript',
  'Node.js',
  '国学',
  '诗词',
  '面试',
  '性能',
  '源码',
  'CSS'
];

const ColumnListPage: React.FC = () => {
  const [selectedTag, setSelectedTag] = useState('全部');
  const [isLoading] = useState(false);
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState('');

  const filteredColumns = mockColumns.filter((column) => {
    const matchesTag = selectedTag === '全部' || column.tags?.includes(selectedTag);
    const matchesSearch =
      !searchKeyword || column.name.includes(searchKeyword) || column.description.includes(searchKeyword);
    return matchesTag && matchesSearch;
  });

  const handleTagChange = (value: string): void => {
    setSelectedTag(value);
  };

  const toggleSearch = (): void => {
    setIsSearchVisible(!isSearchVisible);
    if (isSearchVisible) {
      setSearchKeyword('');
    }
  };

  const handleClearSearch = (): void => {
    setSearchKeyword('');
  };

  return (
    <>
      <Helmet>
        <title>专栏中心 - InkStage</title>
      </Helmet>
      <div className="flex min-h-screen flex-col bg-white dark:bg-gray-800 font-sans">
        <Header />

        <main className="flex-1 py-6 px-[5%] bg-white dark:bg-gray-800">
          <div className="mx-auto">
            <div className="flex items-center justify-between gap-4 mb-8">
              <div className="flex items-center gap-4">
                <p className="text-[16px] font-bold text-gray-500 dark:text-gray-400 mr-2">
                  发现优质专栏，开启深度阅读之旅
                </p>
                <span>
                  {isSearchVisible ? (
                    <div className="flex items-center gap-2">
                      <Input
                        placeholder="搜索专栏..."
                        size={'middle'}
                        value={searchKeyword}
                        onChange={(e) => setSearchKeyword(e.target.value)}
                        className="w-48"
                        autoFocus
                        allowClear
                        onClear={handleClearSearch}
                      />
                      <span
                        onClick={toggleSearch}
                        className="cursor-pointer text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                      >
                        <CloseOutlined />
                      </span>
                    </div>
                  ) : (
                    <span
                      onClick={toggleSearch}
                      className="cursor-pointer text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    >
                      <SearchOutlined style={{ fontSize: '15px' }} />
                    </span>
                  )}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <Select
                  value={selectedTag}
                  onChange={handleTagChange}
                  className="w-32"
                  options={allTags.map((tag) => ({ value: tag, label: tag }))}
                />
              </div>
            </div>

            {isLoading ? (
              <div className="flex justify-center items-center py-20">
                <Spin size="large" />
              </div>
            ) : filteredColumns.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-gray-500 dark:text-gray-400 text-lg">暂无相关专栏</p>
                <p className="text-gray-400 dark:text-gray-500 text-sm mt-2">试试其他关键词或分类</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 lg:gap-10">
                {filteredColumns.map((column) => (
                  <ColumnCard key={column.id} column={column} />
                ))}
              </div>
            )}
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default ColumnListPage;
