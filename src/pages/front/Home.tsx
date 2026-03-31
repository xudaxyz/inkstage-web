import React, { useCallback, useEffect, useState } from 'react';
import { Alert, Spin } from 'antd';
import { useSearchParams } from 'react-router-dom';
import Header from '../../components/common/Header';
import Footer from '../../components/common/Footer';
import Banner from '../../components/front/Banner';
import Categories from '../../components/front/Categories';
import ArticleCard from '../../components/front/ArticleCard';
import LatestArticles from '../../components/front/LatestArticles';
import HotTags from '../../components/front/HotTags';
import InfiniteScrollContainer from '../../components/common/InfiniteScrollContainer';
import { useInfiniteScroll } from '../../hooks/useInfiniteScroll';
import type { BannerArticle, IndexArticleList, LatestArticle } from '../../types/article';
import type { FrontTag } from '../../types/tag';
import type { IndexArticleListResponse } from '../../services/articleService';
import articleService from '../../services/articleService';
import type { FrontendCategory } from '../../types/category';
import categoryService from '../../services/categoryService';
import tagService from '../../services/tagService';
import searchService from '../../services/searchService';
import { BANNER, LATEST } from '../../constants/home';
import type { ApiPageResponse } from '../../types/common';
import { useQuery, type UseQueryResult } from '@tanstack/react-query';
// 无限滚动每页条数
const INFINITE_SCROLL_PAGE_SIZE = 15;
// 轮播图查询
const useBannerArticles = (): UseQueryResult<BannerArticle[], Error> => {
  return useQuery({
    queryKey: ['banner'],
    queryFn: async (): Promise<BannerArticle[]> => {
      const response = await articleService.getBannerArticles(BANNER.ARTICLES_COUNT);
      if (response.code !== 200) {
        throw new Error(response.message || '获取轮播图文章失败');
      }
      return response.data;
    },
    staleTime: 60000, // 1分钟
    refetchOnWindowFocus: false
  });
};
// 最新文章查询
const useLatestArticles = (): UseQueryResult<LatestArticle[], Error> => {
  return useQuery({
    queryKey: ['latest'],
    queryFn: async (): Promise<LatestArticle[]> => {
      const response = await articleService.getLatestArticles(LATEST.ARTICLES_COUNT);
      if (response.code !== 200) {
        throw new Error(response.message || '获取最新文章失败');
      }
      return response.data;
    },
    staleTime: 60000, // 1分钟
    refetchOnWindowFocus: false
  });
};
// 分类查询
const useCategories = (): UseQueryResult<FrontendCategory[], Error> => {
  return useQuery({
    queryKey: ['categories'],
    queryFn: async (): Promise<FrontendCategory[]> => {
      const response = await categoryService.getActiveCategories();
      if (response.code !== 200) {
        throw new Error(response.message || '获取分类列表失败');
      }
      return response.data;
    },
    staleTime: 300000, // 5分钟
    refetchOnWindowFocus: false
  });
};
// 标签查询
const useTags = (): UseQueryResult<FrontTag[], Error> => {
  return useQuery({
    queryKey: ['tags'],
    queryFn: async (): Promise<FrontTag[]> => {
      const response = await tagService.getActiveTags();
      if (response.code !== 200) {
        throw new Error(response.message || '获取标签列表失败');
      }
      return response.data;
    },
    staleTime: 300000, // 5分钟
    refetchOnWindowFocus: false
  });
};
const Home: React.FC = () => {
  // 状态管理
  const [selectedCategory, setSelectedCategory] = useState<number | undefined>(undefined);
  const [selectedTag, setSelectedTag] = useState<number | undefined>(undefined);
  // 搜索参数
  const [searchParams, setSearchParams] = useSearchParams();
  const keyword = searchParams.get('keyword') || '';
  // React Query 数据获取
  const { data: bannerArticles, error: bannerError, isLoading: bannerLoading } = useBannerArticles();
  const { data: latestArticles, error: latestError, isLoading: latestLoading } = useLatestArticles();
  const { data: frontendCategory, error: categoriesError, isLoading: categoriesLoading } = useCategories();
  const { data: frontTag, error: tagsError, isLoading: tagsLoading } = useTags();
  // 文章列表无限滚动fetcher
  const articlesFetcher = useCallback(
    async (pageNum: number, pageSize: number): Promise<ApiPageResponse<IndexArticleList>> => {
      let response;
      if (keyword) {
        response = await searchService.searchArticles({
          keyword: keyword,
          pageNum: pageNum,
          pageSize: pageSize,
          sortBy: 'relevance'
        });
      } else {
        response = await articleService.getArticles({
          pageNum: pageNum,
          pageSize: pageSize,
          categoryId: selectedCategory,
          tagId: selectedTag,
          sortBy: 'publishTime',
          sortOrder: 'desc'
        });
      }
      if (response.code !== 200) {
        throw new Error(response.message || '文章列表加载失败');
      }
      // 转换为PageData格式
      const data: IndexArticleListResponse = response.data;
      return {
        record: data.record,
        total: data.total,
        pageNum: data.pageNum,
        pageSize: data.pageSize,
        pages: data.pages,
        isFirstPage: data.isFirstPage,
        isLastPage: data.isLastPage,
        prePage: data.prePage,
        nextPage: data.nextPage
      };
    },
    [keyword, selectedCategory, selectedTag]
  );
  // 使用无限滚动hook
  const {
    data: articles,
    isLoading: articlesLoading,
    isLoadingMore,
    isError: articlesIsError,
    error: articlesError,
    hasMore,
    loadMoreRef,
    refresh: refreshArticles,
    setData: setArticles
  } = useInfiniteScroll<IndexArticleList>(articlesFetcher, {
    pageSize: INFINITE_SCROLL_PAGE_SIZE,
    threshold: 0.1
  });
  // 当搜索关键词、分类或标签变化时刷新文章列表
  useEffect(() => {
    refreshArticles();
  }, [keyword, selectedCategory, selectedTag, refreshArticles]);
  // 处理分类选择
  const handleCategorySelect = (category: FrontendCategory | '全部'): void => {
    if (category === '全部') {
      setSelectedCategory(0);
    } else {
      setSelectedCategory(category.id);
    }
    // 重置标签选择
    setSelectedTag(undefined);
    // 移除URL中的搜索参数
    setSearchParams({});
  };

  // 处理标签选择
  const handleTagSelect = (tag: FrontTag): void => {
    setSelectedTag(tag.id);
    // 重置分类选择
    setSelectedCategory(undefined);
    // 移除URL中的搜索参数
    setSearchParams({});
  };
  // 渲染单个组件的错误状态
  const renderError = (error: Error | undefined): React.ReactNode => {
    if (error) {
      return (
        <Alert title={'加载失败'} description={error.message || '未知错误'} type="error" showIcon className="my-4" />
      );
    }
    return null;
  };
  // 自定义加载中内容
  const articlesLoadingContent = (
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
  );
  // 自定义加载更多内容
  const articlesLoadingMoreContent = (
    <div className="py-6 flex justify-center">
      <Spin size="small" tip="加载更多文章..." />
    </div>
  );
  // 渲染文章项
  const renderArticleItem = (article: IndexArticleList, index: number): React.ReactNode => (
    <ArticleCard key={`${article.id}-${index}`} article={article} />
  );
  return (
    <div className="flex min-h-screen flex-col bg-white dark:bg-gray-800 font-sans">
      {/* 顶部导航栏 */}
      <Header />

      {/* 主体内容 */}
      <main className="flex-1 py-6 px-[5%] bg-white dark:bg-gray-800">
        <div className="flex flex-col md:flex-row gap-12">
          {/* 左侧内容 */}
          <div className="md:w-3/4">
            {/* 轮播图 */}
            {bannerLoading ? (
              <div className="h-64 bg-gray-100 rounded-lg mb-6 flex items-center justify-center">
                <Spin size="large" />
              </div>
            ) : bannerError ? (
              <div className="h-64 bg-gray-100 rounded-lg mb-6 flex items-center justify-center">
                {renderError(bannerError)}
              </div>
            ) : (
              <Banner articles={bannerArticles || []} />
            )}

            {/* 文章分类 */}
            {categoriesLoading ? (
              <div className="h-16 bg-gray-100 rounded-lg mb-6 flex items-center justify-center">
                <Spin size="small" />
              </div>
            ) : categoriesError ? (
              renderError(categoriesError)
            ) : (
              <Categories
                categories={frontendCategory || []}
                onSelect={handleCategorySelect}
                selectedId={selectedCategory}
              />
            )}

            {/* 文章列表 - 无限滚动 */}
            <div className="mt-6">
              <InfiniteScrollContainer
                infiniteScroll={{
                  data: articles,
                  isLoading: articlesLoading,
                  isLoadingMore,
                  isError: articlesIsError,
                  error: articlesError,
                  hasMore,
                  loadMoreRef,
                  refresh: refreshArticles,
                  total: 0,
                  pageSize: 0,
                  setPageSize: async () => {},
                  setData: setArticles
                }}
                renderItem={renderArticleItem}
                loadingContent={articlesLoadingContent}
                loadingMoreContent={articlesLoadingMoreContent}
                emptyContent={
                  <div className="text-center py-12">
                    <p className="text-gray-500">暂无文章</p>
                    {keyword && <p className="text-gray-400 text-sm mt-2">没有找到与 "{keyword}" 相关的文章</p>}
                  </div>
                }
                noMoreText="已经到底了，没有更多文章了"
                itemGap="16px"
              />
            </div>
          </div>

          {/* 右侧内容 */}
          <div className="md:w-1/4">
            {/* 最新文章 */}
            <div className="mb-8">
              {latestLoading ? (
                <div className="bg-gray-100 rounded-lg p-4">
                  <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
                  {[...Array(5)].map((_, index) => (
                    <div key={index} className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                  ))}
                </div>
              ) : latestError ? (
                renderError(latestError)
              ) : (
                <LatestArticles articles={latestArticles || []} />
              )}
            </div>

            {/* 热门标签 */}
            <div>
              {tagsLoading ? (
                <div className="bg-gray-100 rounded-lg p-4">
                  <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
                  <div className="flex flex-wrap gap-2">
                    {[...Array(8)].map((_, index) => (
                      <div key={index} className="h-8 bg-gray-200 rounded-full px-3"></div>
                    ))}
                  </div>
                </div>
              ) : tagsError ? (
                renderError(tagsError)
              ) : (
                <HotTags tags={frontTag || []} onSelect={handleTagSelect} />
              )}
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
