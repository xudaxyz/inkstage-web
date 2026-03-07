import { API_ENDPOINTS } from './apiEndpoints';
import apiClient from './apiClient';
import type { ApiResponse } from '../types/auth';
import { NotificationType, ReadStatus } from '../types/enums';

// 通知类型定义
export interface Notification {
  id: number;
  type: NotificationType;
  title: string;
  content: string;
  relatedId: number;
  actionUrl: string;
  readStatus: ReadStatus;
  createTime: string;
}

// 通知设置类型定义
export interface NotificationSetting {
  userId: number;
  articlePublish: boolean;
  articleLike: boolean;
  articleCollection: boolean;
  articleComment: boolean;
  commentReply: boolean;
  commentLike: boolean;
  follow: boolean;
  message: boolean;
  report: boolean;
  feedback: boolean;
  system: boolean;
  emailNotification: boolean;
  siteNotification: boolean;
}

// 通知列表响应类型
export interface NotificationListResponse {
  record: Notification[];
  total: number;
  size: number;
  current: number;
  pages: number;
}

// 通知服务
const notificationService = {
  // 获取通知列表（支持分页）
  getNotificationList: async (type: NotificationType | undefined, pageNum: number = 1, pageSize: number = 10): Promise<ApiResponse<NotificationListResponse>> => {
    const params = type ? { type, pageNum, pageSize } : { pageNum, pageSize };
    return await apiClient.get(API_ENDPOINTS.NOTIFICATION.LIST, { params });
  },

  // 标记通知为已读
  markAsRead: async (id: number): Promise<ApiResponse<boolean>> => {
    return await apiClient.put(API_ENDPOINTS.NOTIFICATION.MARK_READ(id));
  },

  // 标记所有通知为已读
  markAllAsRead: async (): Promise<ApiResponse<boolean>> => {
    return await apiClient.put(API_ENDPOINTS.NOTIFICATION.MARK_ALL_READ);
  },

  // 删除通知
  deleteNotification: async (id: number): Promise<ApiResponse<boolean>> => {
    return await apiClient.delete(API_ENDPOINTS.NOTIFICATION.DELETE(id));
  },

  // 获取未读通知数量
  getUnreadCount: async (): Promise<ApiResponse<number>> => {
    return await apiClient.get(API_ENDPOINTS.NOTIFICATION.UNREAD_COUNT);
  },

  // 同步未读通知数量
  syncUnreadCount: async (): Promise<ApiResponse<void>> => {
    return await apiClient.post(API_ENDPOINTS.NOTIFICATION.SYNC_UNREAD);
  },

  // 分页获取通知列表
  getNotificationListWithPage: async (type?: NotificationType, pageNum: number = 1, pageSize: number = 10): Promise<ApiResponse<NotificationListResponse>> => {
    const params = type ? { type, pageNum, pageSize } : { pageNum, pageSize };
    return await apiClient.get(API_ENDPOINTS.NOTIFICATION.LIST_PAGE, { params });
  },

  // 获取通知设置
  getNotificationSetting: async (): Promise<ApiResponse<NotificationSetting>> => {
    return await apiClient.get(API_ENDPOINTS.NOTIFICATION.SETTING.GET);
  },

  // 保存通知设置
  saveNotificationSetting: async (setting: NotificationSetting): Promise<ApiResponse<boolean>> => {
    return await apiClient.put(API_ENDPOINTS.NOTIFICATION.SETTING.SAVE, setting);
  },

  // 恢复默认通知设置
  resetNotificationSetting: async (): Promise<ApiResponse<boolean>> => {
    return await apiClient.put(API_ENDPOINTS.NOTIFICATION.SETTING.RESET);
  },
};

export default notificationService;
