import apiClient from './apiClient';
import { API_ENDPOINTS } from './apiEndpoints';

// 类型定义
export interface HotArticle {
  id: string;
  title: string;
  authorName: string;
  authorId: string;
  avatar: string;
  readCount: number;
  likeCount: number;
  commentCount: number;
  publishTime: string;
  categoryName: string;
  summary: string;
  coverImage?: string;
}

export interface HotUser {
  id: string;
  nickname: string;
  avatar: string;
  articleCount: number;
  followerCount: number;
  likeCount: number;
}

// 服务方法
export const rankingService = {
  /**
   * 获取热门文章
   * @param limit 限制数量
   * @param timeRange 时间范围：day, week, month
   * @returns 热门文章列表
   */
  getHotArticles: async (limit: number = 20, timeRange: string = 'week') => {
    try {
      const response = await apiClient.get<HotArticle[]>(API_ENDPOINTS.INDEX.HOT_ARTICLES, {
        params: { limit, timeRange }
      });
      return response.data;
    } catch (error) {
      console.error('获取热门文章失败:', error);
      throw error;
    }
  },

  /**
   * 获取最新文章
   * @param limit 限制数量
   * @returns 最新文章列表
   */
  getLatestArticles: async (limit: number = 5) => {
    try {
      const response = await apiClient.get<HotArticle[]>(API_ENDPOINTS.INDEX.LATEST_ARTICLES, {
        params: { limit }
      });
      return response.data;
    } catch (error) {
      console.error('获取最新文章失败:', error);
      throw error;
    }
  },

  /**
   * 获取热门用户
   * @param limit 限制数量
   * @returns 热门用户列表
   */
  getHotUsers: async (limit: number = 10) => {
    try {
      const response = await apiClient.get<HotUser[]>(API_ENDPOINTS.INDEX.HOT_USERS, {
        params: { limit }
      });
      return response.data;
    } catch (error) {
      console.error('获取热门用户失败:', error);
      throw error;
    }
  }
};

export default rankingService;
