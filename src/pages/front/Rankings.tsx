import React, { useState, useEffect } from 'react';
import { Card, List, Avatar, Typography, Tag, Spin, Alert } from 'antd';
import {
    EyeOutlined,
    LikeOutlined,
    MessageOutlined,
    UserOutlined,
    BarChartOutlined,
    CalendarOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/common/Header';
import Footer from '../../components/common/Footer';
import rankingService from '../../services/rankingService';
import type { HotArticle } from '../../types/article';
import type { HotUser } from '../../types/user';
import { formatDateTimeShort } from '../../utils';
import { useTheme } from '../../store';

const { Text } = Typography;
// 类型定义
const Rankings: React.FC = () => {
    // 状态管理
    const theme = useTheme();
    const isDarkMode = theme === 'dark';
    const [timeRange, setTimeRange] = useState<string>('week');
    const [hotArticles, setHotArticles] = useState<HotArticle[]>([]);
    const [hotUsers, setHotUsers] = useState<HotUser[]>([]);
    const [latestArticles, setLatestArticles] = useState<HotArticle[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    // 路由导航
    const navigate = useNavigate();
    // 从后端加载数据
    useEffect(() => {
        const loadData = async (): Promise<void> => {
            setLoading(true);
            setError(null);
            try {
                // 并行请求数据
                const [hotArticlesResponse, hotUsersResponse, latestArticlesResponse] = await Promise.all([
                    rankingService.getHotArticles(20, timeRange),
                    rankingService.getHotUsers(10),
                    rankingService.getLatestArticles(5)
                ]);
                // 提取数据
                setHotArticles(hotArticlesResponse.data);
                setHotUsers(hotUsersResponse.data);
                setLatestArticles(latestArticlesResponse.data);
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
    const handleTimeRangeChange = (value: string): void => {
        setTimeRange(value);
    };
    return (
        <div className="flex min-h-screen flex-col bg-gray-50 dark:bg-gray-800 font-sans">
            {/* 顶部导航栏 */}
            <Header/>

            {/* 主体内容 */}
            <main className="flex-1 py-6 px-4 sm:px-6 lg:px-[5%] bg-gray-50 dark:bg-gray-800">
                <div className="mx-auto">
                    {/* 热门选项 */}
                    <div className=" rounded-lg mb-8 flex items-center justify-start overflow-x-auto gap-8">
                        <div
                            className={`flex font-extrabold items-center gap-2 px-6 py-3 rounded-lg cursor-pointer transition-all duration-200 ${timeRange === 'day' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-400' : 'hover:bg-gray-100 dark:hover:bg-gray-600 text-blue-800'}`}
                            onClick={() => handleTimeRangeChange('day')}
                        >
                            <BarChartOutlined/>
                            <span>综合热门</span>
                        </div>
                        <div
                            className={`flex font-extrabold items-center gap-2 px-6 py-3 rounded-lg cursor-pointer transition-all duration-200 ${timeRange === 'week' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-white' : 'hover:bg-gray-100 dark:text-white/30 dark:hover:bg-gray-800'}`}
                            onClick={() => handleTimeRangeChange('week')}
                        >
                            <CalendarOutlined/>
                            <span>本周热门</span>
                        </div>
                    </div>

                    {/* 加载状态 */}
                    {loading ? (
                        <div className="flex justify-center items-center py-20">
                            <Spin size="large" tip="加载中..."/>
                        </div>
                    ) : error ? (
                        <div className="py-10">
                            <Alert title={error} type="error" showIcon/>
                        </div>
                    ) : (
                        /* 左右分栏布局 */
                        <div className="flex flex-col lg:flex-row gap-8 lg:gap-16">
                            {/* 左侧：热门文章榜单 */}
                            <div className="lg:w-[75%]">
                                <Card
                                    variant="borderless"
                                    style={{
                                        backgroundColor: `${isDarkMode ? '#1e2939' : 'transparent'}`
                                    }}
                                    className="shadow-sm rounded-lg overflow-hidden hover:shadow-md transition-shadow duration-300 bg-white dark:bg-gray-800"
                                >
                                    <List
                                        itemLayout="horizontal"
                                        dataSource={hotArticles}
                                        renderItem={(article, index) => (
                                            <List.Item
                                                key={article.id}
                                                className={`py-4 sm:py-5 border-b border-gray-100 dark:border-gray-700 last:border-b-0 ${index < 3 ? 'rounded-lg' : ''} hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200`}
                                            >
                                                <div className="flex flex-col sm:flex-row items-start w-full gap-4">
                                                    {/* 排名序号 */}
                                                    <span
                                                        className={`text-2xl font-bold w-8 text-center ${index < 3 ? 'text-blue-600' : 'text-gray-400 dark:text-gray-500'}`}>
                            {index + 1}
                          </span>

                                                    {/* 文章内容 */}
                                                    <div className="flex-1 min-w-0">
                                                        {/* 标题 */}
                                                        <a href={`/article/${article.id}`}
                                                           target="_blank"
                                                           rel="noopener noreferrer"
                                                           className="text-black dark:text-white font-semibold text-xl mb-2 block line-clamp-2 transition-colors duration-200 leading-tight tracking-tight  cursor-pointer hover:text-blue-600">
                                                            {article.title}
                                                        </a>

                                                        {/* 简介 */}
                                                        <p className="text-gray-600 dark:text-gray-400 text-sm mb-3 line-clamp-2">
                                                            {article.summary}
                                                        </p>

                                                        {/* 作者信息 */}
                                                        <div
                                                            className="flex items-center text-gray-500 dark:text-gray-400 text-sm mb-3 flex-wrap gap-2">
                                                            <Avatar size={20} src={article.avatar}
                                                                    alt={article.nickname} className="mr-2"/>
                                                            <span
                                                                className="hover:text-blue-600 transition-colors duration-200 cursor-pointer dark:text-gray-300"
                                                                onClick={() => navigate(`/user/${article.userId}`)}>
                                                                {article.nickname || '未知用户'}
                                                            </span>
                                                            <Tag color="blue" className="whitespace-nowrap">
                                                                {article.categoryName}
                                                            </Tag>
                                                            {/* 统计数据 */}
                                                            <div
                                                                className="flex items-center text-gray-400 dark:text-gray-500 text-xs flex-wrap gap-4">
                                                                <div className="flex items-center">
                                                                    <EyeOutlined className="mr-1"/>
                                                                    <Text
                                                                        className="dark:text-gray-400">{article.readCount}</Text>
                                                                </div>
                                                                <div className="flex items-center">
                                                                    <LikeOutlined className="mr-1"/>
                                                                    <Text
                                                                        className="dark:text-gray-400">{article.likeCount}</Text>
                                                                </div>
                                                                <div className="flex items-center">
                                                                    <MessageOutlined className="mr-1"/>
                                                                    <Text
                                                                        className="dark:text-gray-400">{article.commentCount}</Text>
                                                                </div>
                                                                <Text
                                                                    className="dark:text-gray-400">{article.publishTime ? formatDateTimeShort(article.publishTime) : ''}</Text>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* 封面图 */}
                                                    {article.coverImage && (
                                                        <div
                                                            className="flex-shrink-0 w-48 sm:w-48 h-32 sm:h-32 rounded-lg overflow-hidden">
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
                                    style={{
                                        marginBottom: '36px',
                                        backgroundColor: `${isDarkMode ? '#4a5565' : 'transparent'}`
                                    }}
                                    title={
                                        <div className="flex items-center">
                                            <UserOutlined className="mr-2 text-blue-600"/>
                                            <span className="font-bold dark:text-white">热门用户</span>
                                        </div>
                                    }
                                >
                                    <List
                                        itemLayout="horizontal"
                                        dataSource={hotUsers}
                                        renderItem={(user, index) => (
                                            <List.Item
                                                key={user.id}
                                                className={`py-3 border-b border-gray-100 dark:border-gray-700 last:border-b-0 ${index < 3 ? 'bg-blue-50 dark:bg-blue-800/20 rounded-lg' : ''} hover:bg-gray-50 dark:hover:bg-gray-500 transition-colors duration-200`}
                                            >
                                                <div className="flex items-center w-full gap-3">
                                                    {/* 排名序号 */}
                                                    <span
                                                        className={`text-lg font-bold w-6 text-center ${index < 3 ? 'text-blue-600' : 'text-gray-400 dark:text-gray-500'}`}>
                            {index + 1}
                          </span>

                                                    {/* 头像 */}
                                                    <Avatar size={40} src={user.avatar} alt={user.nickname}
                                                            className="mr-3 hover:scale-105 transition-transform duration-200"/>

                                                    {/* 用户信息 */}
                                                    <div className="flex-1 min-w-0">
                                                        {/* 姓名 */}
                                                        <span
                                                            className="text-gray-800 dark:text-gray-200 hover:text-blue-600 font-medium text-sm mb-1 block transition-colors duration-200 cursor-pointer"
                                                            onClick={() => navigate(`/user/${user.id}`)}>
                              {user.nickname}
                            </span>

                                                        {/* 统计数据 */}
                                                        <div
                                                            className="flex items-center text-gray-500 dark:text-gray-400 text-xs gap-2 sm:gap-3 flex-wrap">
                                                            <span>{user.followerCount} 粉丝</span>
                                                            <span>{user.articleCount} 文章</span>
                                                            <span>{user.likeCount} 获赞</span>
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
                                    style={{
                                        backgroundColor: `${isDarkMode ? '#4a5565' : 'transparent'}`
                                    }}
                                    title={
                                        <div className="flex items-center">
                                            <BarChartOutlined className="mr-2 text-blue-600"/>
                                            <span className="font-bold dark:text-white">最新文章</span>
                                        </div>
                                    }
                                >
                                    <List
                                        itemLayout="vertical"
                                        dataSource={latestArticles}
                                        renderItem={(article) => (
                                            <List.Item
                                                key={article.id}
                                                className="py-3 border-b border-gray-100 dark:border-gray-700 last:border-b-0 transition-colors duration-200"
                                            >
                                                <div
                                                    className="flex flex-col rounded-lg px-3 sm:flex-row items-start gap-3">
                                                    {/* 文章信息 */}
                                                    <div className="flex-1 min-w-0">
                                                        {/* 标题 */}
                                                        <a href={`/article/${article.id}`}
                                                           target="_blank"
                                                           rel="noopener noreferrer"
                                                           className="text-black dark:text-white font-bold text-base mb-2 block line-clamp-2 transition-colors duration-200 leading-tight tracking-tight drop-shadow-sm cursor-pointer hover:text-blue-600">
                                                            {article.title}
                                                        </a>

                                                        <div
                                                            className="flex items-start text-gray-500 dark:text-gray-400 text-xs mb-1">
                                                            {/* 作者信息 */}
                                                            <div
                                                                className="flex items-center text-gray-400 dark:text-gray-500 text-xs gap-1 flex-wrap mr-5">
                                                                <Avatar size={18} src={article.avatar}
                                                                        alt={article.nickname} className="mr-1"/>
                                                                <span
                                                                    className="hover:text-blue-600 transition-colors duration-200 cursor-pointer dark:text-gray-300"
                                                                    onClick={() => navigate(`/user/${article.userId}`)}>
                                {article.nickname}
                              </span>
                                                            </div>
                                                            {/* 发布时间和阅读量 */}
                                                            <div
                                                                className="flex items-center text-gray-400 dark:text-gray-500 text-xs gap-5 flex-wrap">
                                                                <span className="dark:text-gray-400"><EyeOutlined
                                                                    className="mr-1"/>{article.readCount}</span>
                                                                <span className="dark:text-gray-400"><CalendarOutlined
                                                                    className="mr-1"/>{article.publishTime ? formatDateTimeShort(article.publishTime) : ''}</span>
                                                            </div>
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
            <Footer/>
        </div>
    );
};
export default Rankings;
