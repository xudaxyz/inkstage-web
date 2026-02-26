import React, { useState, useEffect } from 'react';
import { Card, List, Avatar, Typography, Tag, Spin, Alert } from 'antd';
import { EyeOutlined, LikeOutlined, MessageOutlined, UserOutlined, BarChartOutlined, CalendarOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/common/Header.tsx';
import Footer from '../../components/common/Footer.tsx';
import rankingService, { type HotArticle, type HotUser } from '../../services/rankingService.ts';

const { Text } = Typography;

// 类型定义


const Rankings: React.FC = () => {
  // 状态管理
  const [timeRange, setTimeRange] = useState<string>('week');
  const [hotArticles, setHotArticles] = useState<HotArticle[]>([]);
  const [hotAuthors, setHotAuthors] = useState<HotUser[]>([]);
  const [latestArticles, setLatestArticles] = useState<HotArticle[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // 路由导航
  const navigate = useNavigate();

  // 从后端加载数据
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);
      try {
        // 并行请求数据
        const [hotArticlesData, hotUsersData, latestArticlesData] = await Promise.all([
          rankingService.getHotArticles(20, timeRange),
          rankingService.getHotUsers(10),
          rankingService.getLatestArticles(5)
        ]);
        setHotArticles(hotArticlesData);
        setHotAuthors(hotUsersData);
        setLatestArticles(latestArticlesData);
      } catch (err) {
        console.error('加载数据失败:', err);
        setError('加载数据失败，请稍后重试');
      } finally {
        setLoading(false);
      }
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

          {/* 加载状态 */}
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <Spin size="large" tip="加载中..." />
            </div>
          ) : error ? (
            <div className="py-10">
              <Alert title={error} type="error" showIcon />
            </div>
          ) : (
            /* 左右分栏布局 */
            <div className="flex flex-col lg:flex-row gap-8 lg:gap-16">
              {/* 左侧：热门文章榜单 */}
              <div className="lg:w-[75%]">
                <Card
                  variant="borderless"
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
                            <a href={`/article/${article.id}`}
                               target="_blank"
                               rel="noopener noreferrer"
                               className="text-black font-semibold text-xl mb-2 block line-clamp-2 transition-colors duration-200 leading-tight tracking-tight  cursor-pointer hover:text-blue-600">
                              {article.title}
                            </a>

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
                  variant="borderless"
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
                          <Avatar size={40} src={author.avatar} alt={author.nickname} className="mr-3 hover:scale-105 transition-transform duration-200" />

                          {/* 用户信息 */}
                          <div className="flex-1 min-w-0">
                            {/* 姓名 */}
                            <span className="text-gray-800 hover:text-blue-600 font-medium text-sm mb-1 block transition-colors duration-200 cursor-pointer" onClick={() => navigate(`/author/${author.id}`)}>
                              {author.nickname}
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
                  variant="borderless"
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
                          {/* 文章信息 */}
                          <div className="flex-1 min-w-0">
                            {/* 标题 */}
                            <a href={`/article/${article.id}`}
                               target="_blank"
                               rel="noopener noreferrer"
                               className="text-black font-bold text-base mb-2 block line-clamp-2 transition-colors duration-200 leading-tight tracking-tight drop-shadow-sm cursor-pointer hover:text-blue-600">
                              {article.title}
                            </a>

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
          )}
        </div>
      </main>

      {/* 页脚信息 */}
      <Footer />
    </div>
  );
};

export default Rankings;