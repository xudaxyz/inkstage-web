import React from 'react';
import Header from '../common/Header.tsx';
import Footer from '../common/Footer.tsx';
import Banner from './Banner.tsx';
import Categories from './Categories.tsx';
import ArticleCard from './ArticleCard.tsx';
import LatestArticles from './LatestArticles.tsx';
import HotTags from './HotTags.tsx';

// 模拟文章数据
const mockArticles = [
  {
    id: 1,
    title: 'React 19 新特性详解：并发渲染与服务器组件',
    summary: '本文详细介绍了 React 19 的核心新特性，包括并发渲染、服务器组件、自动批处理等，帮助开发者快速上手最新版本。',
    coverImage: 'https://picsum.photos/id/1/800/400',
    user: {
      avatar: 'https://picsum.photos/id/1005/100/100',
      name: '前端开发工程师'
    },
    stats: {
      likes: 128,
      views: 2560,
      comments: 42
    },
    publishTime: '2026-01-25 14:30'
  },
  {
    id: 2,
    title: 'TypeScript 5.9 实用技巧：提升代码质量与开发效率',
    summary: '探索 TypeScript 5.9 的最新特性和实用技巧，包括更严格的类型检查、改进的错误信息、新的装饰器语法等。',
    coverImage: 'https://picsum.photos/id/20/800/400',
    user: {
      avatar: 'https://picsum.photos/id/1012/100/100',
      name: 'TypeScript 专家'
    },
    stats: {
      likes: 96,
      views: 1840,
      comments: 28
    },
    publishTime: '2026-01-24 16:45'
  },
  {
    id: 3,
    title: 'Next.js 15 性能优化指南：从代码到部署',
    summary: '从代码优化、构建配置到部署策略，全面讲解 Next.js 15 应用的性能优化方法，帮助你构建更快的 Web 应用。',
    coverImage: 'https://picsum.photos/id/30/800/400',
    user: {
      avatar: 'https://picsum.photos/id/1025/100/100',
      name: '全栈开发者'
    },
    stats: {
      likes: 156,
      views: 3200,
      comments: 58
    },
    publishTime: '2026-01-23 09:15'
  },
  {
    id: 4,
    title: 'Tailwind CSS 4 最佳实践：原子化 CSS 的高效使用',
    summary: '深入探讨 Tailwind CSS 4 的最佳实践，包括自定义配置、组件化设计、响应式布局等，帮助你编写更简洁、可维护的 CSS。Tailwind CSS 通过扫描所有 HTML 文件、JavaScript 组件以及其他模板中的类名来工作，生成相应的样式，然后将其写入静态 CSS 文件。',
    user: {
      avatar: 'https://picsum.photos/id/1035/100/100',
      name: 'UI/UX 设计师'
    },
    stats: {
      likes: 88,
      views: 1620,
      comments: 22
    },
    publishTime: '2026-01-22 11:20'
  },
  {
    id: 5,
    title: 'Node.js 20 新 API 介绍：提升后端开发体验',
    summary: '介绍 Node.js 20 引入的新 API 和特性，包括 Web Streams、Promise-based APIs、改进的性能等，帮助后端开发者提升开发效率。',
    coverImage: 'https://picsum.photos/id/40/800/400',
    user: {
      avatar: 'https://picsum.photos/id/1040/100/100',
      name: '后端架构师'
    },
    stats: {
      likes: 112,
      views: 2180,
      comments: 36
    },
    publishTime: '2026-01-21 15:50'
  }
];

const Home: React.FC = () => {
  return (
    <div className="flex min-h-screen flex-col bg-white font-sans">
      {/* 顶部导航栏 */}
      <Header />
      
      {/* 主体内容 */}
      <main className="flex-1 py-6 px-[5%]">
        <div className="flex flex-col md:flex-row gap-12">
          {/* 左侧内容 */}
          <div className="md:w-3/4">
            {/* 轮播图 */}
            <Banner />
            
            {/* 文章分类 */}
            <Categories />
            
            {/* 文章列表 */}
            <div className="space-y-4">
              {mockArticles.map((article) => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </div>
          </div>
          
          {/* 右侧内容 */}
          <div className="md:w-1/4">
            {/* 最新文章 */}
            <div className="mb-8">
              <LatestArticles />
            </div>
            
            {/* 热门标签 */}
            <div>
              <HotTags />
            </div>
          </div>
        </div>
      </main>
      
      {/* 页脚信息 */}
      <Footer />
    </div>
  );
};

export default Home;