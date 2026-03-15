import React, { useRef, useState } from 'react';
import { List, Pagination, Spin, Alert } from 'antd';
import { useSearchParams } from 'react-router-dom';
import useSWR from 'swr';
import Header from '../../components/common/Header';
import Footer from '../../components/common/Footer';
import Banner from '../../components/front/Banner';
import Categories from '../../components/front/Categories';
import ArticleCard from '../../components/front/ArticleCard';
import LatestArticles from '../../components/front/LatestArticles';
import HotTags from '../../components/front/HotTags';
import type { BannerArticle, LatestArticle } from '../../types/article';
import type { FrontTag } from '../../types/tag';
import articleService from '../../services/articleService';
import type { IndexArticleListResponse } from '../../services/articleService';
import type { FrontendCategory } from '../../types/category';
import categoryService from '../../services/categoryService';
import tagService from '../../services/tagService';
import searchService from '../../services/searchService';
import { PAGINATION, BANNER, LATEST } from '../../constants/home';

// 独立的fetcher函数
const articlesFetcher = async (params: { page: number; keyword: string; categoryId?: number | undefined }): Promise<IndexArticleListResponse> => {
  const { page, keyword, categoryId } = params;
  let response;

  if (keyword) {
    response = await searchService.searchArticles({
      keyword: keyword,
      page: page,
      size: PAGINATION.PAGE_SIZE,
      sortBy: 'relevance'
    });
  } else {
    response = await articleService.getArticles({
      page: page,
      pageSize: PAGINATION.PAGE_SIZE,
      categoryId: categoryId,
      sortBy: 'publishTime',
      sortOrder: 'desc'
    });
  }

  if (response.code !== 200) {
    throw new Error(response.message || '文章列表加载失败');
  }
  return response.data;
};

const bannerFetcher = async (): Promise<BannerArticle[]> => {
  const response = await articleService.getBannerArticles(BANNER.ARTICLES_COUNT);
  if (response.code !== 200) {
    throw new Error(response.message || '获取轮播图文章失败');
  }
  return response.data;
};

const latestFetcher = async (): Promise<LatestArticle[]> => {
  const response = await articleService.getLatestArticles(LATEST.ARTICLES_COUNT);
  if (response.code !== 200) {
    throw new Error(response.message || '获取最新文章失败');
  }
  return response.data;
};

const categoriesFetcher = async (): Promise<FrontendCategory[]> => {
  const response = await categoryService.getActiveCategories();
  if (response.code !== 200) {
    throw new Error(response.message || '获取分类列表失败');
  }
  return response.data;
};

const tagsFetcher = async (): Promise<FrontTag[]> => {
  const response = await tagService.getActiveTags();
  if (response.code !== 200) {
    throw new Error(response.message || '获取标签列表失败');
  }
  return response.data;
};

const Home: React.FC = () => {
  // 状态管理
  const [selectedCategory, setSelectedCategory] = useState<number | undefined>(undefined);
  const [page, setPage] = useState(1);

  // 搜索参数
  const [searchParams, setSearchParams] = useSearchParams();

  // 引用
  const listRef = useRef<HTMLDivElement>(null);

  // SWR 数据获取
  const keyword = searchParams.get('keyword') || '';
  const { data: articlesData, error: articlesError, isLoading: articlesLoading, mutate: mutateArticles } = useSWR(
    ['articles', page, keyword, selectedCategory],
    () => articlesFetcher({ page, keyword, categoryId: selectedCategory }),
    { revalidateOnFocus: false, dedupingInterval: 5000 }
  );

  const { data: bannerArticles, error: bannerError, isLoading: bannerLoading } = useSWR(
    'banner',
    bannerFetcher,
    { revalidateOnFocus: false, dedupingInterval: 60000 }
  );

  const { data: latestArticles, error: latestError, isLoading: latestLoading } = useSWR(
    'latest',
    latestFetcher,
    { revalidateOnFocus: false, dedupingInterval: 60000 }
  );

  const { data: frontendCategory, error: categoriesError, isLoading: categoriesLoading } = useSWR(
    'categories',
    categoriesFetcher,
    { revalidateOnFocus: false, dedupingInterval: 300000 }
  );

  const { data: frontTag, error: tagsError, isLoading: tagsLoading } = useSWR(
    'tags',
    tagsFetcher,
    { revalidateOnFocus: false, dedupingInterval: 300000 }
  );

  // 获取文章总数
  const total = articlesData?.total || 0;
  // 获取文章列表
  const articles = articlesData?.record || [];

  // 处理分页变化
  const handlePageChange = (current: number): void => {
    setPage(current);
  };

  // 处理分类选择
  const handleCategorySelect = (category: FrontendCategory | '全部'): void => {
    if (category === '全部') {
      setSelectedCategory(0);
    } else {
      setSelectedCategory(category.id);
    }
    // 重置页码
    setPage(1);
    // 移除URL中的搜索参数
    setSearchParams({});
  };

  // 渲染单个组件的错误状态
  const renderError = (error: Error | undefined): React.ReactNode => {
    if (error) {
      return (
        <Alert
          title="加载失败"
          description={error.message || '未知错误'}
          type="error"
          showIcon
          className="my-4"
        />
      );
    }
    return null;
  };

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
            {bannerLoading ? (
              <div className="h-64 bg-gray-100 rounded-lg mb-6 flex items-center justify-center">
                <Spin size="large" />
              </div>
            ) : bannerError ? (
              <div className="h-64 bg-gray-100 rounded-lg mb-6 flex items-center justify-center">
                {renderError(bannerError)}
              </div>
            ) : (
              <Banner articles={bannerArticles || []}/>
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

            {/* 文章列表 */}
            <div className="mt-6" ref={listRef}>
              {articlesLoading ? (
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
              ) : articlesError ? (
                <div className="text-center py-12">
                  {renderError(articlesError)}
                  <button className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                    onClick={() => mutateArticles()}
                  >
                    重试
                  </button>
                </div>
              ) : (
                <>
                  <List
                    dataSource={articles}
                    renderItem={(article) => (
                      <List.Item key={article.id}>
                        <ArticleCard article={article}/>
                      </List.Item>
                    )}
                    locale={{ emptyText: '暂无文章' }}
                    split={false}
                  />

                  {/* 分页组件 */}
                  <div className="mt-8 flex justify-center">
                    <Pagination
                      current={page}
                      pageSize={PAGINATION.PAGE_SIZE}
                      total={total}
                      onChange={handlePageChange}
                      showSizeChanger={false}
                      showQuickJumper
                      showTotal={(total) => `共 ${total} 篇文章`}
                    />
                  </div>
                </>
              )}
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
                <LatestArticles articles={latestArticles || []}/>
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
                <HotTags tags={frontTag || []}/>
              )}
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
