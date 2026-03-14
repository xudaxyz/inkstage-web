import React, {useCallback, useEffect, useRef, useState} from 'react';
import {List, message, Pagination} from 'antd';
import {useSearchParams} from 'react-router-dom';
import Header from '../../components/common/Header.tsx';
import Footer from '../../components/common/Footer.tsx';
import Banner from '../../components/front/Banner.tsx';
import Categories from '../../components/front/Categories.tsx';
import ArticleCard from '../../components/front/ArticleCard.tsx';
import LatestArticles from '../../components/front/LatestArticles.tsx';
import HotTags from '../../components/front/HotTags.tsx';
import type {IndexArticleList, BannerArticle, LatestArticle} from '../../services/articleService.ts';
import articleService from '../../services/articleService.ts';
import type {FrontendCategory as Category} from '../../services/categoryService.ts';
import categoryService from '../../services/categoryService.ts';
import type {Tag} from '../../services/tagService.ts';
import tagService from '../../services/tagService.ts';
import searchService from '../../services/searchService.ts';

const Home: React.FC = () => {
    // 状态管理
    const [articles, setArticles] = useState<IndexArticleList[]>([]);
    const [bannerArticles, setBannerArticles] = useState<BannerArticle[]>([]);
    const [latestArticles, setLatestArticles] = useState<LatestArticle[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [tags, setTags] = useState<Tag[]>([]);



    // 加载状态
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState<number | undefined>(undefined);
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const [error, setError] = useState<string | null>(null);

    // 搜索参数
    const [searchParams, setSearchParams] = useSearchParams();

    // 引用
    const listRef = useRef<HTMLDivElement>(null);

    // 获取文章列表
    const fetchArticles = useCallback(async (currentPage: number, searchKeywordParam?: string) => {
        try {
            setLoading(true);
            
            let response;
            // 从参数或URL中获取搜索关键词
            const keyword = searchKeywordParam || searchParams.get('keyword') || '';
            
            if (keyword) {
                // 搜索模式
                response = await searchService.searchArticles({
                    keyword: keyword,
                    page: currentPage,
                    size: 10,
                    sortBy: 'relevance'
                });
            } else {
                // 普通模式
                response = await articleService.getArticles({
                    page: currentPage,
                    pageSize: 10,
                    categoryId: selectedCategory,
                    sortBy: 'publishTime',
                    sortOrder: 'desc'
                });
            }
            
            if (response.code !== 200) {
                message.error(response.message || '文章列表加载失败');
                return;
            }

            // 直接使用响应数据，因为现在搜索结果已经与文章列表结构一致
            setArticles(response.data.record);
            setTotal(response.data.total || 0);
        } catch (err) {
            console.error('获取文章列表失败:', err);
            setError('文章列表加载失败');
        } finally {
            setLoading(false);
        }
    }, [selectedCategory, searchParams]);

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

            // 直接调用fetchArticles，它会从URL获取搜索关键词
            await fetchArticles(1);

            // 独立执行其他数据获取方法
            await fetchBannerArticles();
            await fetchLatestArticles();
            await fetchCategories();
            await fetchTags();
        };
        void loadData();
    }, [selectedCategory, fetchArticles]);

    // 监听搜索参数变化
    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            setError(null);
            setPage(1);

            // 直接调用fetchArticles，它会从URL获取搜索关键词
            await fetchArticles(1);
        };
        void loadData();
    }, [searchParams, fetchArticles]);

    // 处理分页变化
    const handlePageChange = (current: number) => {
        setPage(current);
        void fetchArticles(current);
    };

    // 处理分类选择
    const handleCategorySelect = (category: Category | '全部') => {
        if (category === '全部') {
            setSelectedCategory(0);
        } else {
            setSelectedCategory(category.id);
        }
        // 移除URL中的搜索参数
        setSearchParams({});
    };

    // 渲染加载状态
    if (loading) {
        return (
            <div className="flex min-h-screen flex-col bg-white font-sans">
                <Header/>
                <main className="flex-1 py-6 px-[5%]">
                    <div className="flex flex-col md:flex-row gap-12">
                        <div className="md:w-3/4">
                            {/* 轮播图占位 */}
                            <div className="h-64 bg-gray-100 rounded-lg mb-6 flex items-center justify-center">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
                            </div>
                            {/* 分类占位 */}
                            <div className="h-16 bg-gray-100 rounded-lg mb-6"></div>
                            {/* 文章列表占位 */}
                            <div className="space-y-4">
                                {[...Array(5)].map((_, index) => (
                                    <div key={index} className="bg-gray-100 rounded-lg p-4">
                                        <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                                        <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                                        <div className="h-4 bg-gray-200 rounded w-2/3 mb-4"></div>
                                        <div className="flex justify-between items-center">
                                            <div className="h-8 w-8 bg-gray-200 rounded-full"></div>
                                            <div className="h-4 bg-gray-200 rounded w-16"></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="md:w-1/4">
                            {/* 最新文章占位 */}
                            <div className="bg-gray-100 rounded-lg p-4 mb-8">
                                <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
                                {[...Array(5)].map((_, index) => (
                                    <div key={index} className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                                ))}
                            </div>
                            {/* 热门标签占位 */}
                            <div className="bg-gray-100 rounded-lg p-4">
                                <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
                                <div className="flex flex-wrap gap-2">
                                    {[...Array(8)].map((_, index) => (
                                        <div key={index} className="h-8 bg-gray-200 rounded-full px-3"></div>
                                    ))}
                                </div>
                            </div>
                        </div>
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

                            {/* 分页组件 */}
                            <div className="mt-8 flex justify-center">
                                <Pagination
                                    current={page}
                                    pageSize={10}
                                    total={total}
                                    onChange={handlePageChange}
                                    showSizeChanger={false}
                                    showQuickJumper
                                    showTotal={(total) => `共 ${total} 篇文章`}
                                />
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