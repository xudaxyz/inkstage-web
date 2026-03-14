import { apiClient, API_ENDPOINTS } from '../api';
import type { ApiResponse } from '../types/common';
import type {
  SearchArticlesParams,
  SearchArticlesData,
  HotWordsData,
  SearchHistoryData
} from '../types/search';

// 参数验证函数
const validateIdParam = (id: number): void => {
  if (id == null || id <= 0) {
    throw new Error('ID必须是正整数');
  }
};

const validateSearchParams = (params: SearchArticlesParams): void => {
  if (!params.keyword || params.keyword.trim().length === 0) {
    throw new Error('搜索关键词不能为空');
  }
  if (params.page != null && params.page <= 0) {
    throw new Error('页码必须是正整数');
  }
  if (params.size != null && params.size <= 0) {
    throw new Error('每页数量必须是正整数');
  }
  if (params.sortBy != null && !['relevance', 'publishTime', 'readCount'].includes(params.sortBy)) {
    throw new Error('排序方式必须是relevance、publishTime或readCount');
  }
};

// 搜索 API 服务
const searchService = {
  // 搜索文章
  searchArticles: async (params: SearchArticlesParams): Promise<ApiResponse<SearchArticlesData>> => {
    validateSearchParams(params);
    const queryDTO = {
      keyword: params.keyword,
      page: params.page || 1,
      size: params.size || 10,
      sortBy: params.sortBy || 'relevance'
    };
    return await apiClient.get(API_ENDPOINTS.FRONT.SEARCH.ARTICLES, {
      params: queryDTO
    });
  },

  // 获取热门搜索词
  getHotWords: async (): Promise<ApiResponse<HotWordsData>> => {
    return await apiClient.get(API_ENDPOINTS.FRONT.SEARCH.HOT_WORDS);
  },

  // 获取搜索历史
  getSearchHistory: async (): Promise<ApiResponse<SearchHistoryData>> => {
    return await apiClient.get(API_ENDPOINTS.FRONT.SEARCH.HISTORY.LIST);
  },

  // 删除搜索历史
  deleteSearchHistory: async (id: number): Promise<ApiResponse<void>> => {
    validateIdParam(id);
    return await apiClient.delete(
      API_ENDPOINTS.FRONT.SEARCH.HISTORY.DELETE(id)
    );
  },

  // 清空搜索历史
  clearSearchHistory: async (): Promise<ApiResponse<void>> => {
    return await apiClient.delete(
      API_ENDPOINTS.FRONT.SEARCH.HISTORY.CLEAR
    );
  }
};

export default searchService;
