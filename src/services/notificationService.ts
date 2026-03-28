import { apiClient, API_ENDPOINTS } from '../api';
import type { ApiResponse } from '../types/common';
import { NotificationType } from '../types/enums';
import type {
  NotificationSetting,
  NotificationListResponse
} from '../types/notification';

// 参数验证函数
const validateIdParam = (id: number): void => {
  if (id == null || id <= 0) {
    throw new Error('ID必须是正整数');
  }
};

const validatePageParams = (pageNum: number, pageSize: number): void => {
  if (pageNum <= 0) {
    throw new Error('页码必须是正整数');
  }
  if (pageSize <= 0) {
    throw new Error('每页数量必须是正整数');
  }
};

const validateNotificationSetting = (setting: NotificationSetting): void => {
  if (setting.userId == null || setting.userId <= 0) {
    throw new Error('用户ID必须是正整数');
  }
  // 验证布尔类型字段
  const booleanFields = [
    'articlePublish', 'articleLike', 'articleCollection', 'articleComment',
    'commentReply', 'commentLike', 'follow', 'message', 'report',
    'feedback', 'system', 'emailNotification', 'siteNotification'
  ];
  booleanFields.forEach(field => {
    if (typeof setting[field as keyof NotificationSetting] !== 'boolean') {
      throw new Error(`${field}必须是布尔值`);
    }
  });
};

// 通知服务
const notificationService = {
  // 获取通知列表（支持分页）
  getNotificationList: async (notificationType: NotificationType | undefined, pageNum: number = 1, pageSize: number = 10): Promise<ApiResponse<NotificationListResponse>> => {
    validatePageParams(pageNum, pageSize);
    const params = notificationType ? { notificationType, pageNum, pageSize } : { pageNum, pageSize };
    return await apiClient.get(API_ENDPOINTS.FRONT.NOTIFICATION.LIST, { params });
  },

  // 标记通知为已读
  markAsRead: async (id: number): Promise<ApiResponse<boolean>> => {
    validateIdParam(id);
    return await apiClient.put(API_ENDPOINTS.FRONT.NOTIFICATION.MARK_READ(id));
  },

  // 标记所有通知为已读
  markAllAsRead: async (): Promise<ApiResponse<boolean>> => {
    return await apiClient.put(API_ENDPOINTS.FRONT.NOTIFICATION.MARK_ALL_READ);
  },

  // 删除通知
  deleteNotification: async (id: number): Promise<ApiResponse<boolean>> => {
    validateIdParam(id);
    return await apiClient.delete(API_ENDPOINTS.FRONT.NOTIFICATION.DELETE(id));
  },

  // 获取未读通知数量
  getUnreadCount: async (): Promise<ApiResponse<number>> => {
    return await apiClient.get(API_ENDPOINTS.FRONT.NOTIFICATION.UNREAD_COUNT);
  },

  // 同步未读通知数量
  syncUnreadCount: async (): Promise<ApiResponse<void>> => {
    return await apiClient.post(API_ENDPOINTS.FRONT.NOTIFICATION.SYNC_UNREAD);
  },

  // 分页获取通知列表
  getNotificationListWithPage: async (notificationType?: NotificationType, pageNum: number = 1, pageSize: number = 10): Promise<ApiResponse<NotificationListResponse>> => {
    validatePageParams(pageNum, pageSize);
    const params = notificationType ? { notificationType, pageNum, pageSize } : { pageNum, pageSize };
    return await apiClient.get(API_ENDPOINTS.FRONT.NOTIFICATION.LIST_PAGE, { params });
  },

  // 获取通知设置
  getNotificationSetting: async (): Promise<ApiResponse<NotificationSetting>> => {
    return await apiClient.get(API_ENDPOINTS.FRONT.NOTIFICATION.SETTING.GET);
  },

  // 保存通知设置
  saveNotificationSetting: async (setting: NotificationSetting): Promise<ApiResponse<boolean>> => {
    validateNotificationSetting(setting);
    return await apiClient.put(API_ENDPOINTS.FRONT.NOTIFICATION.SETTING.SAVE, setting);
  },

  // 恢复默认通知设置
  resetNotificationSetting: async (): Promise<ApiResponse<boolean>> => {
    return await apiClient.put(API_ENDPOINTS.FRONT.NOTIFICATION.SETTING.RESET);
  }
};

export default notificationService;
