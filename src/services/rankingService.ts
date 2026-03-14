import { apiClient, API_ENDPOINTS } from '../api';
import type { ApiResponse } from '../types/common';
import type { HotArticle } from '../types/article';
import type { HotUser } from '../types/user';

// 参数验证函数
const validateLimitParam = (limit: number): void => {
  if (limit <= 0) {
    throw new Error('限制数量必须是正整数');
  }
};

const validateTimeRangeParam = (timeRange: string): void => {
  if (!['day', 'week', 'month'].includes(timeRange)) {
    throw new Error('时间范围必须是day、week或month');
  }
};

// 服务方法
export const rankingService = {
  /**
   * 获取热门文章
   * @param limit 限制数量
   * @param timeRange 时间范围：day, week, month
   * @returns 热门文章列表
   */
  getHotArticles: async (limit: number = 20, timeRange: string = 'week'): Promise<ApiResponse<HotArticle[]>> => {
    validateLimitParam(limit);
    validateTimeRangeParam(timeRange);
    return await apiClient.get(API_ENDPOINTS.FRONT.INDEX.HOT_ARTICLES, {
      params: { limit, timeRange }
    });
  },

  /**
   * 获取最新文章
   * @param limit 限制数量
   * @returns 最新文章列表
   */
  getLatestArticles: async (limit: number = 5): Promise<ApiResponse<HotArticle[]>> => {
    validateLimitParam(limit);
    return await apiClient.get(API_ENDPOINTS.FRONT.INDEX.LATEST_ARTICLES, {
      params: { limit }
    });
  },

  /**
   * 获取热门用户
   * @param limit 限制数量
   * @returns 热门用户列表
   */
  getHotUsers: async (limit: number = 10): Promise<ApiResponse<HotUser[]>> => {
    validateLimitParam(limit);
    return await apiClient.get(API_ENDPOINTS.FRONT.INDEX.HOT_USERS, {
      params: { limit }
    });
  }
};

export default rankingService;
