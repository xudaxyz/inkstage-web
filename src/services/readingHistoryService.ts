import { apiClient, API_ENDPOINTS } from '../api';
import type { ApiResponse } from '../types/common';
import type {
  ReadingHistory,
  ReadingHistoryRequest,
  ReadingHistoryResponse
} from '../types/readingHistory';

// 参数验证函数
const validateIdParam = (id: number): void => {
  if (id == null || id <= 0) {
    throw new Error('ID必须是正整数');
  }
};

const validatePageParams = (page: number, size: number): void => {
  if (page <= 0) {
    throw new Error('页码必须是正整数');
  }
  if (size <= 0) {
    throw new Error('每页数量必须是正整数');
  }
};

const validateReadingHistoryRequest = (data: ReadingHistoryRequest): void => {
  validateIdParam(data.articleId);
  if (data.progress < 0 || data.progress > 100) {
    throw new Error('阅读进度必须是0-100之间的数字');
  }
  if (data.duration < 0) {
    throw new Error('阅读时长必须是非负整数');
  }
  if (data.scrollPosition < 0) {
    throw new Error('滚动位置必须是非负整数');
  }
};

const validateArticleIdsParam = (articleIds: number[]): void => {
  if (!Array.isArray(articleIds)) {
    throw new Error('文章ID必须是数组');
  }
  articleIds.forEach(id => validateIdParam(id));
};

// 阅读历史 API 服务
const readingHistoryService = {
  // 保存或更新阅读历史
  saveReadingHistory: async (data: ReadingHistoryRequest): Promise<ApiResponse<boolean>> => {
    validateReadingHistoryRequest(data);
    return await apiClient.post(API_ENDPOINTS.FRONT.READING_HISTORY.SAVE, data);
  },

  // 获取阅读历史列表
  getReadingHistoryList: async (page: number = 1, size: number = 10): Promise<ApiResponse<ReadingHistoryResponse>> => {
    validatePageParams(page, size);
    return await apiClient.get(API_ENDPOINTS.FRONT.READING_HISTORY.LIST, { params: { page, size } });
  },

  // 删除单条阅读历史
  deleteReadingHistory: async (articleId: number): Promise<ApiResponse<boolean>> => {
    validateIdParam(articleId);
    return await apiClient.delete(API_ENDPOINTS.FRONT.READING_HISTORY.DELETE(articleId));
  },

  // 清空阅读历史
  clearReadingHistory: async (): Promise<ApiResponse<boolean>> => {
    return await apiClient.delete(API_ENDPOINTS.FRONT.READING_HISTORY.CLEAR);
  },

  // 获取单篇文章的阅读历史
  getReadingHistoryByArticleId: async (articleId: number): Promise<ApiResponse<ReadingHistory>> => {
    validateIdParam(articleId);
    return await apiClient.get(API_ENDPOINTS.FRONT.READING_HISTORY.DETAIL(articleId));
  },

  // 批量获取阅读历史
  getReadingHistoriesByArticleIds: async (articleIds: number[]): Promise<ApiResponse<ReadingHistory[]>> => {
    validateArticleIdsParam(articleIds);
    return await apiClient.post(API_ENDPOINTS.FRONT.READING_HISTORY.BATCH, articleIds);
  }
};

export default readingHistoryService;
