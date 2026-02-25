import React, { useState, useEffect } from 'react';
import { Card, List, Avatar, Typography, Tag } from 'antd';
import { EyeOutlined, LikeOutlined, MessageOutlined, UserOutlined, BarChartOutlined, CalendarOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/common/Header.tsx';
import Footer from '../../components/common/Footer.tsx';

const { Text } = Typography;

// 类型定义
interface HotArticle {
  id: string;
  title: string;
  authorName: string;
  authorId: string;
  avatar: string;
  readCount: number;
  likeCount: number;
  commentCount: number;
  publishTime: string;
  categoryName: string;
  summary: string;
  coverImage?: string;
}

interface HotAuthor {
  id: string;
  name: string;
  avatar: string;
  articleCount: number;
  followerCount: number;
  likeCount: number;
}

// 模拟数据
const mockHotArticles: HotArticle[] = [
  {
    id: '1',
    title: 'React 19 新特性详解',
    authorName: '张三',
    authorId: '101',
    avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
    readCount: 2500,
    likeCount: 156,
    commentCount: 45,
    publishTime: '2026-01-20',
    categoryName: '前端',
    summary: '本文详细介绍了 React 19 的新特性，包括自动批处理、并发特性、新的 Hooks 等，帮助开发者快速掌握最新版本的核心功能。',
    coverImage: 'https://picsum.photos/id/1/600/400'
  },
  {
    id: '2',
    title: 'TypeScript 类型系统深入理解',
    authorName: '李四',
    authorId: '102',
    avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
    readCount: 1800,
    likeCount: 120,
    commentCount: 32,
    publishTime: '2026-01-15',
    categoryName: '前端',
    summary: '深入探讨 TypeScript 的类型系统原理，从基础类型到高级类型，帮助你写出更安全、更可维护的代码。',
    coverImage: 'https://picsum.photos/id/2/600/400'
  },
  {
    id: '3',
    title: '前端性能优化最佳实践',
    authorName: '王五',
    authorId: '103',
    avatar: 'https://randomuser.me/api/portraits/men/67.jpg',
    readCount: 3200,
    likeCount: 210,
    commentCount: 58,
    publishTime: '2026-01-10',
    categoryName: '前端',
    summary: '总结了前端性能优化的最佳实践，包括网络优化、渲染优化、资源优化等多个方面，提升你的网站性能。',
    coverImage: 'https://picsum.photos/id/3/600/400'
  },
  {
    id: '4',
    title: '如何提高写作技巧：实用指南',
    authorName: '赵六',
    authorId: '104',
    avatar: 'https://randomuser.me/api/portraits/women/22.jpg',
    readCount: 1200,
    likeCount: 89,
    commentCount: 23,
    publishTime: '2026-01-25',
    categoryName: '写作',
    summary: '',
    coverImage: 'https://picsum.photos/id/4/600/400'
  },
  {
    id: '5',
    title: 'Vue 4.0 核心原理分析',
    authorName: '张三',
    authorId: '101',
    avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
    readCount: 1900,
    likeCount: 145,
    commentCount: 37,
    publishTime: '2026-01-18',
    categoryName: '前端',
    summary: '深入分析 Vue 4.0 的核心原理，包括响应式系统、虚拟 DOM、组件系统等，帮助你更好地理解和使用 Vue。'
  },
  {
    id: '6',
    title: 'JavaScript 异步编程详解',
    authorName: '李四',
    authorId: '102',
    avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
    readCount: 1500,
    likeCount: 98,
    commentCount: 28,
    publishTime: '2026-01-22',
    categoryName: '前端',
    summary: '详细介绍 JavaScript 的异步编程方式，从回调函数到 Promise，再到 async/await，帮助你掌握异步编程技巧。本文将深入探讨异步编程的基本概念，包括事件循环、任务队列、微任务和宏任务的区别，以及如何使用这些概念来优化你的代码性能。我们还将通过实际案例分析，展示如何处理复杂的异步流程，避免回调地狱，以及如何使用现代的异步编程工具和库来提高开发效率。此外，我们还将讨论异步编程中的常见陷阱和最佳实践，帮助你写出更加健壮和可维护的异步代码。',
    coverImage: 'https://picsum.photos/id/6/600/400'
  },
  {
    id: '7',
    title: 'CSS Grid 布局完全指南：从基础概念到高级技巧，全面掌握现代网页布局技术，打造响应式设计的最佳实践',
    authorName: '王五',
    authorId: '103',
    avatar: 'https://randomuser.me/api/portraits/men/67.jpg',
    readCount: 1300,
    likeCount: 87,
    commentCount: 21,
    publishTime: '2026-01-16',
    categoryName: '前端',
    summary: '全面介绍 CSS Grid 布局的使用方法和技巧，帮助你快速掌握现代网页布局技术。',
    coverImage: 'https://picsum.photos/id/7/600/400'
  },
  {
    id: '8',
    title: 'Node.js 性能优化策略',
    authorName: '赵六',
    authorId: '104',
    avatar: 'https://randomuser.me/api/portraits/women/22.jpg',
    readCount: 1100,
    likeCount: 76,
    commentCount: 19,
    publishTime: '2026-01-24',
    categoryName: '后端',
    summary: '分享了 Node.js 应用的性能优化策略，包括内存管理、异步处理、缓存等方面的最佳实践。',
    coverImage: 'https://picsum.photos/id/8/600/400'
  },
  {
    id: '9',
    title: 'React Native 开发实战',
    authorName: '张三',
    authorId: '101',
    avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
    readCount: 1400,
    likeCount: 92,
    commentCount: 25,
    publishTime: '2026-01-19',
    categoryName: '移动开发',
    summary: '通过实际项目介绍 React Native 的开发流程和技巧，帮助你快速上手跨平台移动应用开发。'
  },
  {
    id: '10',
    title: '算法入门到精通',
    authorName: '李四',
    authorId: '102',
    avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
    readCount: 1600,
    likeCount: 105,
    commentCount: 31,
    publishTime: '2026-01-14',
    categoryName: '算法',
    summary: '从基础算法到高级算法，详细讲解算法的原理和实现，帮助你提高编程能力和解决问题的能力。'
  },
  {
    id: '11',
    title: 'Git 版本控制最佳实践',
    authorName: '王五',
    authorId: '103',
    avatar: 'https://randomuser.me/api/portraits/men/67.jpg',
    readCount: 950,
    likeCount: 68,
    commentCount: 17,
    publishTime: '2026-01-23',
    categoryName: '工具',
    summary: '',
    coverImage: ''
  },
  {
    id: '12',
    title: '前端安全防护措施',
    authorName: '赵六',
    authorId: '104',
    avatar: 'https://randomuser.me/api/portraits/women/22.jpg',
    readCount: 1250,
    likeCount: 83,
    commentCount: 22,
    publishTime: '2026-01-17',
    categoryName: '安全',
    summary: '',
    coverImage: 'https://picsum.photos/id/12/600/400'
  },
  {
    id: '13',
    title: 'TypeScript 项目实战',
    authorName: '张三',
    authorId: '101',
    avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
    readCount: 1150,
    likeCount: 79,
    commentCount: 20,
    publishTime: '2026-01-21',
    categoryName: '前端',
    summary: '通过实际项目介绍 TypeScript 的使用方法和技巧，帮助你在项目中更好地应用 TypeScript。',
    coverImage: 'https://picsum.photos/id/13/600/400'
  },
  {
    id: '14',
    title: '响应式设计最佳实践',
    authorName: '李四',
    authorId: '102',
    avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
    readCount: 1050,
    likeCount: 72,
    commentCount: 18,
    publishTime: '2026-01-13',
    categoryName: '前端',
    summary: '介绍响应式设计的最佳实践，包括媒体查询、弹性布局、图片优化等，确保网站在不同设备上都有良好的显示效果。',
    coverImage: 'https://picsum.photos/id/14/600/400'
  },
  {
    id: '15',
    title: 'GraphQL 入门教程',
    authorName: '王五',
    authorId: '103',
    avatar: 'https://randomuser.me/api/portraits/men/67.jpg',
    readCount: 980,
    likeCount: 69,
    commentCount: 16,
    publishTime: '2026-01-26',
    categoryName: 'API',
    summary: '详细介绍 GraphQL 的基本概念和使用方法，帮助你了解和使用这种现代的 API 查询语言。详细介绍 GraphQL 的基本概念和使用方法，帮助你了解和使用这种现代的 API 查询语言详细介绍 GraphQL 的基本概念和使用方法，帮助你了解和使用这种现代的 API 查询语言',
  },
  {
    id: '16',
    title: 'Docker 容器化部署实战',
    authorName: '赵六',
    authorId: '104',
    avatar: 'https://randomuser.me/api/portraits/women/22.jpg',
    readCount: 1350,
    likeCount: 88,
    commentCount: 24,
    publishTime: '2026-01-12',
    categoryName: 'DevOps',
    summary: '通过实际案例介绍 Docker 的容器化部署流程和技巧，帮助你快速掌握容器技术。',
    coverImage: 'https://picsum.photos/id/16/600/400'
  },
  {
    id: '17',
    title: '前端工程化实践',
    authorName: '张三',
    authorId: '101',
    avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
    readCount: 1450,
    likeCount: 95,
    commentCount: 26,
    publishTime: '2026-01-11',
    categoryName: '前端',
    summary: '分享了前端工程化的实践经验，包括构建工具、代码规范、自动化测试等，提高开发效率和代码质量。',
    coverImage: 'https://picsum.photos/id/17/600/400'
  },
  {
    id: '18',
    title: 'React 状态管理方案对比',
    authorName: '李四',
    authorId: '102',
    avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
    readCount: 1200,
    likeCount: 84,
    commentCount: 23,
    publishTime: '2026-01-10',
    categoryName: '前端',
    summary: '对比了不同的 React 状态管理方案，包括 Context API、Redux、MobX 等，帮助你选择适合的方案。',
    coverImage: 'https://picsum.photos/id/18/600/400'
  },
  {
    id: '19',
    title: '前端测试策略',
    authorName: '王五',
    authorId: '103',
    avatar: 'https://randomuser.me/api/portraits/men/67.jpg',
    readCount: 1000,
    likeCount: 71,
    commentCount: 19,
    publishTime: '2026-01-09',
    categoryName: '测试',
    summary: '介绍了前端测试的策略和方法，包括单元测试、集成测试、端到端测试等，提高代码质量和可靠性。',
    coverImage: 'https://picsum.photos/id/19/600/400'
  },
  {
    id: '20',
    title: 'WebAssembly 入门指南',
    authorName: '赵六',
    authorId: '104',
    avatar: 'https://randomuser.me/api/portraits/women/22.jpg',
    readCount: 900,
    likeCount: 65,
    commentCount: 15,
    publishTime: '2026-01-08',
    categoryName: '前端',
    summary: '详细介绍 WebAssembly 的基本概念和使用方法，帮助你了解这种新兴的 Web 技术。',
    coverImage: 'https://picsum.photos/id/20/600/400'
  }
];

const mockHotAuthors: HotAuthor[] = [
  {
    id: '101',
    name: '张三',
    avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
    articleCount: 15,
    followerCount: 2580,
    likeCount: 3240
  },
  {
    id: '103',
    name: '王五',
    avatar: 'https://randomuser.me/api/portraits/men/67.jpg',
    articleCount: 12,
    followerCount: 1890,
    likeCount: 2870
  },
  {
    id: '102',
    name: '李四',
    avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
    articleCount: 10,
    followerCount: 1650,
    likeCount: 2150
  },
  {
    id: '104',
    name: '赵六',
    avatar: 'https://randomuser.me/api/portraits/women/22.jpg',
    articleCount: 8,
    followerCount: 1230,
    likeCount: 1890
  },
  {
    id: '105',
    name: '钱七',
    avatar: 'https://randomuser.me/api/portraits/men/45.jpg',
    articleCount: 6,
    followerCount: 980,
    likeCount: 1450
  },
  {
    id: '106',
    name: '孙八',
    avatar: 'https://randomuser.me/api/portraits/women/33.jpg',
    articleCount: 14,
    followerCount: 2100,
    likeCount: 2980
  },
  {
    id: '107',
    name: '周九',
    avatar: 'https://randomuser.me/api/portraits/men/56.jpg',
    articleCount: 9,
    followerCount: 1450,
    likeCount: 1980
  },
  {
    id: '108',
    name: '吴十',
    avatar: 'https://randomuser.me/api/portraits/women/55.jpg',
    articleCount: 7,
    followerCount: 1120,
    likeCount: 1650
  },
  {
    id: '109',
    name: '郑一',
    avatar: 'https://randomuser.me/api/portraits/men/78.jpg',
    articleCount: 5,
    followerCount: 890,
    likeCount: 1320
  },
  {
    id: '110',
    name: '王二',
    avatar: 'https://randomuser.me/api/portraits/women/66.jpg',
    articleCount: 4,
    followerCount: 750,
    likeCount: 1050
  }
];

// 最新文章数据
const mockLatestArticles: HotArticle[] = [
  {
    id: '21',
    title: '2026年前端开发趋势预测',
    authorName: '张三',
    authorId: '101',
    avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
    readCount: 850,
    likeCount: 56,
    commentCount: 14,
    publishTime: '2026-02-01',
    categoryName: '前端',
    summary: '预测2026年前端开发的主要趋势，包括新技术、新框架和最佳实践。',
    coverImage: 'https://picsum.photos/id/21/600/400'
  },
  {
    id: '22',
    title: '如何构建高性能React应用',
    authorName: '李四',
    authorId: '102',
    avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
    readCount: 720,
    likeCount: 48,
    commentCount: 12,
    publishTime: '2026-01-31',
    categoryName: '前端',
    summary: '分享构建高性能React应用的技巧和方法，提升应用的运行速度和用户体验。',
    coverImage: 'https://picsum.photos/id/22/600/400'
  },
  {
    id: '23',
    title: 'TypeScript 5.0 新特性详解',
    authorName: '王五',
    authorId: '103',
    avatar: 'https://randomuser.me/api/portraits/men/67.jpg',
    readCount: 680,
    likeCount: 42,
    commentCount: 10,
    publishTime: '2026-01-30',
    categoryName: '前端',
    summary: '详细介绍TypeScript 5.0的新特性和改进，帮助开发者更好地使用新版本。',
    coverImage: 'https://picsum.photos/id/23/600/400'
  },
  {
    id: '24',
    title: 'Web3.0 开发入门指南',
    authorName: '赵六',
    authorId: '104',
    avatar: 'https://randomuser.me/api/portraits/women/22.jpg',
    readCount: 920,
    likeCount: 63,
    commentCount: 18,
    publishTime: '2026-01-29',
    categoryName: '区块链',
    summary: '介绍Web3.0开发的基础知识和技术栈，帮助开发者进入区块链开发领域。',
    coverImage: 'https://picsum.photos/id/24/600/400'
  },
  {
    id: '25',
    title: 'AI辅助编程工具使用指南',
    authorName: '孙八',
    authorId: '106',
    avatar: 'https://randomuser.me/api/portraits/women/33.jpg',
    readCount: 1050,
    likeCount: 71,
    commentCount: 21,
    publishTime: '2026-01-28',
    categoryName: '工具',
    summary: '分享AI辅助编程工具的使用方法和技巧，提高开发效率和代码质量。',
    coverImage: 'https://picsum.photos/id/25/600/400'
  }
];

const Rankings: React.FC = () => {
  // 状态管理
  const [timeRange, setTimeRange] = useState<string>('week');
  const [hotArticles, setHotArticles] = useState<HotArticle[]>([]);
  const [hotAuthors, setHotAuthors] = useState<HotAuthor[]>([]);
  const [latestArticles, setLatestArticles] = useState<HotArticle[]>([]);
  
  // 路由导航
  const navigate = useNavigate();

  // 模拟数据加载
  useEffect(() => {
    const loadData = async () => {
      // 模拟 API 调用延迟
      await new Promise(resolve => setTimeout(resolve, 500));
      setHotArticles(mockHotArticles);
      setHotAuthors(mockHotAuthors);
      setLatestArticles(mockLatestArticles);
    };

    void loadData();
  }, [timeRange]);

  // 处理时间范围变化
  const handleTimeRangeChange = (value: string) => {
    setTimeRange(value);
  };

  return (
    <div className="flex min-h-screen flex-col bg-gray-50 font-sans">
      {/* 顶部导航栏 */}
      <Header />

      {/* 主体内容 */}
      <main className="flex-1 py-6 px-4 sm:px-6 lg:px-[5%]">
        <div className="mx-auto">
          {/* 热门选项 - 参考B站热门样式 */}
          <div className=" rounded-lg mb-8 flex items-center justify-start overflow-x-auto gap-8">
            <div 
              className={`flex font-extrabold items-center gap-2 px-6 py-3 rounded-lg cursor-pointer transition-all duration-200 ${timeRange === 'day' ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'}`}
              onClick={() => handleTimeRangeChange('day')}
            >
              <BarChartOutlined />
              <span>综合热门</span>
            </div>
            <div 
              className={`flex font-extrabold items-center gap-2 px-6 py-3 rounded-lg cursor-pointer transition-all duration-200 ${timeRange === 'week' ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'}`}
              onClick={() => handleTimeRangeChange('week')}
            >
              <CalendarOutlined />
              <span>本周热门</span>
            </div>
          </div>

          {/* 左右分栏布局 */}
          <div className="flex flex-col lg:flex-row gap-8 lg:gap-16">
            {/* 左侧：热门文章榜单 */}
            <div className="lg:w-[75%]">
              <Card
                bordered={false}
                className="shadow-sm rounded-lg overflow-hidden hover:shadow-md transition-shadow duration-300"
              >
                <List
                  itemLayout="horizontal"
                  dataSource={hotArticles}
                  renderItem={(article, index) => (
                    <List.Item
                      key={article.id}
                      className={`py-4 sm:py-5 border-b border-gray-100 last:border-b-0 ${index < 3 ? 'rounded-lg' : ''} hover:bg-gray-50 transition-colors duration-200`}
                    >
                      <div className="flex flex-col sm:flex-row items-start w-full gap-4">
                        {/* 排名序号 */}
                        <span className={`text-2xl font-bold w-8 text-center ${index < 3 ? 'text-blue-600' : 'text-gray-400'}`}>
                          {index + 1}
                        </span>

                        {/* 文章内容 */}
                        <div className="flex-1 min-w-0">
                          {/* 标题 */}
                          <div className="text-black font-semibold text-xl mb-2 block line-clamp-2 transition-colors duration-200 leading-tight tracking-tight  cursor-pointer" onClick={() => navigate(`/article/${article.id}`)}>
                            {article.title}
                          </div>

                          {/* 简介 */}
                          <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                            {article.summary}
                          </p>

                          {/* 作者信息 */}
                          <div className="flex items-center text-gray-500 text-sm mb-3 flex-wrap gap-2">
                            <Avatar size={20} src={article.avatar} alt={article.authorName} className="mr-2" />
                            <span className="hover:text-blue-600 transition-colors duration-200 cursor-pointer" onClick={() => navigate(`/author/${article.authorId}`)}>
                              {article.authorName}
                            </span>
                            <Tag  color="blue" className="whitespace-nowrap">
                              {article.categoryName}
                            </Tag>
                          </div>

                          {/* 统计数据 */}
                          <div className="flex items-center text-gray-400 text-xs flex-wrap gap-4">
                            <div className="flex items-center">
                              <EyeOutlined className="mr-1" />
                              <Text>{article.readCount}</Text>
                            </div>
                            <div className="flex items-center">
                              <LikeOutlined className="mr-1" />
                              <Text>{article.likeCount}</Text>
                            </div>
                            <div className="flex items-center">
                              <MessageOutlined className="mr-1" />
                              <Text>{article.commentCount}</Text>
                            </div>
                            <Text>{article.publishTime}</Text>
                          </div>
                        </div>

                        {/* 封面图 */}
                        {article.coverImage && (
                          <div className="flex-shrink-0 w-48 sm:w-48 h-32 sm:h-32 rounded-lg overflow-hidden">
                            <img 
                              src={article.coverImage} 
                              alt={article.title} 
                              className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                            />
                          </div>
                        )}
                      </div>
                    </List.Item>
                  )}
                />
              </Card>
            </div>

            {/* 右侧：热门用户 + 最新文章 */}
            <div className="lg:w-[25%]">
              {/* 热门用户 */}
              <Card
                bordered={false}
                className="shadow-sm rounded-lg overflow-hidden mb-6 hover:shadow-md transition-shadow duration-300"
                title={
                  <div className="flex items-center">
                    <UserOutlined className="mr-2 text-blue-600" />
                    <span className="font-bold">热门用户</span>
                  </div>
                }
              >
                <List
                  itemLayout="horizontal"
                  dataSource={hotAuthors}
                  renderItem={(author, index) => (
                    <List.Item
                      key={author.id}
                      className={`py-3 border-b border-gray-100 last:border-b-0 ${index < 3 ? 'bg-blue-50 rounded-lg' : ''} hover:bg-gray-50 transition-colors duration-200`}
                    >
                      <div className="flex items-center w-full gap-3">
                        {/* 排名序号 */}
                        <span className={`text-lg font-bold w-6 text-center ${index < 3 ? 'text-blue-600' : 'text-gray-400'}`}>
                          {index + 1}
                        </span>

                        {/* 头像 */}
                        <Avatar size={40} src={author.avatar} alt={author.name} className="mr-3 hover:scale-105 transition-transform duration-200" />

                        {/* 用户信息 */}
                        <div className="flex-1 min-w-0">
                          {/* 姓名 */}
                          <span className="text-gray-800 hover:text-blue-600 font-medium text-sm mb-1 block transition-colors duration-200 cursor-pointer" onClick={() => navigate(`/author/${author.id}`)}>
                            {author.name}
                          </span>

                          {/* 统计数据 */}
                          <div className="flex items-center text-gray-500 text-xs gap-2 sm:gap-3 flex-wrap">
                            <span>{author.followerCount} 粉丝</span>
                            <span>{author.articleCount} 文章</span>
                            <span>{author.likeCount} 获赞</span>
                          </div>
                        </div>
                      </div>
                    </List.Item>
                  )}
                />
              </Card>

              {/* 最新文章 */}
              <Card
                bordered={false}
                className="shadow-sm rounded-lg overflow-hidden hover:shadow-md transition-shadow duration-300"
                title={
                  <div className="flex items-center">
                    <BarChartOutlined className="mr-2 text-blue-600" />
                    <span className="font-bold">最新文章</span>
                  </div>
                }
              >
                <List
                  itemLayout="vertical"
                  dataSource={latestArticles}
                  renderItem={(article) => (
                    <List.Item
                      key={article.id}
                      className="py-3 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors duration-200"
                    >
                      <div className="flex flex-col sm:flex-row items-start gap-3">
                        {/* 封面图 */}
                        {article.coverImage && (
                          <div className="flex-shrink-0 w-20 h-16 rounded-lg overflow-hidden sm:mt-1">
                            <img 
                              src={article.coverImage} 
                              alt={article.title} 
                              className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                            />
                          </div>
                        )}

                        {/* 文章信息 */}
                        <div className="flex-1 min-w-0">
                          {/* 标题 */}
                          <div className="text-black font-bold text-base mb-2 block line-clamp-2 transition-colors duration-200 leading-tight tracking-tight drop-shadow-sm cursor-pointer hover:text-blue-600" onClick={() => navigate(`/article/${article.id}`)}>
                            {article.title}
                          </div>

                          {/* 作者信息 */}
                          <div className="flex items-center text-gray-500 text-xs mb-1">
                            <Avatar size={16} src={article.avatar} alt={article.authorName} className="mr-1" />
                            <span className="hover:text-blue-600 transition-colors duration-200 cursor-pointer" onClick={() => navigate(`/author/${article.authorId}`)}>
                              {article.authorName}
                            </span>
                          </div>

                          {/* 发布时间和阅读量 */}
                          <div className="flex items-center text-gray-400 text-xs gap-3 flex-wrap">
                            <span>{article.publishTime}</span>
                            <span>
                              <EyeOutlined className="mr-1" />
                              {article.readCount}
                            </span>
                          </div>
                        </div>
                      </div>
                    </List.Item>
                  )}
                />
              </Card>
            </div>
          </div>
        </div>
      </main>

      {/* 页脚信息 */}
      <Footer />
    </div>
  );
};

export default Rankings;