import React, {useCallback, useEffect, useRef, useState} from 'react';
import {List, message} from 'antd';
import Header from '../../components/common/Header.tsx';
import Footer from '../../components/common/Footer.tsx';
import Banner from '../../components/front/Banner.tsx';
import Categories from '../../components/front/Categories.tsx';
import ArticleCard from '../../components/front/ArticleCard.tsx';
import LatestArticles from '../../components/front/LatestArticles.tsx';
import HotTags from '../../components/front/HotTags.tsx';
import type {IndexArticleList, BannerArticle, LatestArticle} from '../../services/articleService.ts';
import articleService from '../../services/articleService.ts';
import type {Category} from '../../services/categoryService.ts';
import categoryService from '../../services/categoryService.ts';
import type {Tag} from '../../services/tagService.ts';
import tagService from '../../services/tagService.ts';

const Home: React.FC = () => {
    // 状态管理
    const [articles, setArticles] = useState<IndexArticleList[]>([]);
    const [bannerArticles, setBannerArticles] = useState<BannerArticle[]>([]);
    const [latestArticles, setLatestArticles] = useState<LatestArticle[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [tags, setTags] = useState<Tag[]>([]);

    // 加载状态
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<number | undefined>(undefined);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // 引用
    const pageRef = useRef(page);
    const listRef = useRef<HTMLDivElement>(null);
    const observerRef = useRef<HTMLDivElement>(null);
    const intersectionObserverRef = useRef<IntersectionObserver | null>(null);

    useEffect(() => {
        pageRef.current = page;
    }, [page]);

    // 获取文章列表
    const fetchArticles = useCallback(async (isRefresh = false) => {
        try {
            const currentPage = isRefresh ? 1 : pageRef.current;
            const response = await articleService.getArticles({
                page: currentPage,
                pageSize: 10,
                categoryId: selectedCategory,
                sortBy: 'publishTime',
                sortOrder: 'desc'
            });
            if (response.code !== 200) {
                message.error(response.message || '文章列表加载失败');
                return;
            }

            // 转换数据格式
            const formattedArticles = (response.data.record || []).map((item: IndexArticleList) => ({
                id: item.id,
                title: item.title,
                summary: item.summary,
                coverImage: item.coverImage,
                avatar: item.avatar || "",
                authorName: item.authorName,
                likeCount: item.likeCount,
                readCount: item.readCount,
                commentCount: item.commentCount,
                publishTime: item.publishTime ? new Date(item.publishTime).toLocaleString('zh-CN') : ''
            }));

            if (isRefresh) {
                setArticles(formattedArticles);
                setPage(2);
            } else {
                setArticles(prev => [...prev, ...formattedArticles]);
                setPage(prev => prev + 1);
            }

            // 更新是否有更多
            setHasMore(formattedArticles.length >= 10);
        } catch {
            if (isRefresh) {
                setError('加载更多文章列表失败');
            }
        } finally {
            if (isRefresh) {
                setLoading(false);
            }
            setLoadingMore(false);
        }
    }, [selectedCategory, pageRef]);

    // 获取轮播图文章
    const fetchBannerArticles = async () => {
        const response = await articleService.getBannerArticles(3);
        if (response.code === 200) {
            setBannerArticles(response.data);
        } else {
            message.error(response.message || "获取轮播图文章失败");
        }
    };

    // 获取最新文章
    const fetchLatestArticles = async () => {
        const response = await articleService.getLatestArticles(5);
        if (response.code === 200) {
            setLatestArticles(response.data);
        } else {
            message.error(response.message || "获取最新文章失败");
        }
    };

    // 获取分类
    const fetchCategories = async () => {
        const response = await categoryService.getActiveCategories();
        if (response.code === 200) {
            setCategories(response.data);
        } else {
            message.error(response.message || "获取分类列表失败");
        }
    };

    // 获取标签
    const fetchTags = async () => {
        const response = await tagService.getActiveTags();
        if (response.code === 200) {
            setTags(response.data);
        } else {
            message.error(response.message || "获取标签列表失败");
        }
    };

    // 初始化数据
    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            setError(null);
            setPage(1);
            setHasMore(true);

            // 独立执行所有数据获取方法
            await fetchArticles(true);
            await fetchBannerArticles();
            await fetchLatestArticles();
            await fetchCategories();
            await fetchTags();
        };
        void loadData();
    }, [selectedCategory, fetchArticles]);

    // 设置无限滚动
    useEffect(() => {
        if (observerRef.current) {
            // 清除之前的观察器
            if (intersectionObserverRef.current) {
                intersectionObserverRef.current.disconnect();
            }

            // 创建新的观察器
            intersectionObserverRef.current = new IntersectionObserver(
                (entries) => {
                    const entry = entries[0];
                    if (entry.isIntersecting && hasMore && !loadingMore) {
                        setLoadingMore(true);
                        void fetchArticles(false);
                    }
                },
                {
                    threshold: 0.1
                }
            );

            // 开始观察
            intersectionObserverRef.current.observe(observerRef.current);
        }

        // 清理函数
        return () => {
            if (intersectionObserverRef.current) {
                intersectionObserverRef.current.disconnect();
            }
        };
    }, [hasMore, loadingMore, page, selectedCategory, fetchArticles]);

    // 处理分类选择
    const handleCategorySelect = (category: Category | '全部') => {
        if (category === '全部') {
            setSelectedCategory(0);
        } else {
            setSelectedCategory(category.id);
        }
    };

    // 渲染加载状态
    if (loading) {
        return (
            <div className="flex min-h-screen flex-col bg-white font-sans">
                <Header/>
                <main className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
                        <p className="mt-4 text-gray-600">加载中...</p>
                    </div>
                </main>
                <Footer/>
            </div>
        );
    }

    // 渲染错误状态
    if (error) {
        return (
            <div className="flex min-h-screen flex-col bg-white font-sans">
                <Header/>
                <main className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                        <p className="text-red-600 mb-4">{error}</p>
                    </div>
                </main>
                <Footer/>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen flex-col bg-white font-sans">
            {/* 顶部导航栏 */}
            <Header/>

            {/* 主体内容 */}
            <main className="flex-1 py-6 px-[5%]">
                <div className="flex flex-col md:flex-row gap-12">
                    {/* 左侧内容 */}
                    <div className="md:w-3/4">
                        {/* 轮播图 */}
                        <Banner articles={bannerArticles}/>
                        {/* 文章分类 */}
                        <Categories
                            categories={categories}
                            onSelect={handleCategorySelect}
                            selectedId={selectedCategory}
                        />

                        {/* 文章列表 */}
                        <div className="mt-6" ref={listRef}>
                            <List
                                dataSource={articles}
                                renderItem={(article) => (
                                    <List.Item key={article.id}>
                                        <ArticleCard article={article}/>
                                    </List.Item>
                                )}
                                locale={{emptyText: '暂无文章'}}
                                split={false}
                            />

                            {/* 加载更多指示器 */}
                            <div ref={observerRef} style={{textAlign: 'center', padding: '20px 0'}}>
                                {!hasMore && articles.length > 0 && <p className="text-gray-500">没有更多文章了</p>}
                            </div>
                        </div>
                    </div>

                    {/* 右侧内容 */}
                    <div className="md:w-1/4">
                        {/* 最新文章 */}
                        <div className="mb-8">
                            <LatestArticles articles={latestArticles}/>
                        </div>

                        {/* 热门标签 */}
                        <div>
                            <HotTags tags={tags.map(tag => ({name: tag.name, count: 0}))}/>
                        </div>
                    </div>
                </div>
            </main>

            {/* 页脚信息 */}
            <Footer/>
        </div>
    );
};

export default Home;