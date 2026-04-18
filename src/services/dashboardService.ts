import { API_ENDPOINTS, apiClient } from '../api';
import type { DashboardStatsVO } from '../types/admin';
import type { ApiResponse } from '../types/common';

/**
 * 仪表盘服务
 * 处理仪表盘相关的API调用
 */
export const dashboardService = {
  /**
   * 获取仪表盘统计数据
   * @returns 仪表盘统计数据
   */
  getDashboardStats: async (days: number = 7): Promise<ApiResponse<DashboardStatsVO>> => {
    return await apiClient.get(API_ENDPOINTS.ADMIN.DASHBOARD.STATS, { params: { days } });
  },

  /**
   * 刷新仪表盘统计数据
   * @returns 是否刷新成功
   */
  refreshDashboardStats: async (): Promise<ApiResponse<boolean>> => {
    return await apiClient.post(API_ENDPOINTS.ADMIN.DASHBOARD.REFRESH);
  }
};
