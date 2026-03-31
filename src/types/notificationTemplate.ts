import { NotificationChannel, NotificationType, PriorityEnum, StatusEnum } from './enums';
import type { ApiPageResponse } from './common.ts';

// 通知模板类型定义
export interface AdminNotificationTemplate {
  id: number;
  code: string;
  templateName: string;
  notificationType: NotificationType;
  notificationChannel: NotificationChannel;
  titleTemplate: string;
  contentTemplate: string;
  actionUrlTemplate: string;
  description: string;
  priority: PriorityEnum;
  status: StatusEnum;
  createUsername: string;
  updateUsername: string;
  createTime: string;
  updateTime: string;
}

// 通知模板创建/更新相关字段
export interface NotificationTemplate {
  code: string;
  templateName: string;
  notificationType: NotificationType;
  notificationChannel: NotificationChannel;
  titleTemplate: string;
  contentTemplate: string;
  actionUrlTemplate: string;
  description: string;
  priority: PriorityEnum;
  status: StatusEnum;
}

// 手动通知
export interface ManualNotification {
  templateCode: string;
  variables: Record<string, object>;
  userType: 'all' | 'specific' | 'role';
  userIds?: number[];
  roleCode?: string;
  relatedId?: number;
  senderId?: number;
}

// 模板预览
export interface TemplatePreview {
  notificationType: NotificationType;
  title: string;
  content: string;
  actionUrl: string;
}

export type AdminNotificationTemplateResponse = ApiPageResponse<AdminNotificationTemplate>;
