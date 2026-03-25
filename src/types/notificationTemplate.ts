import { NotificationType, NotificationChannel, PriorityEnum, StatusEnum } from './enums';
import type { ApiPageResponse } from './common.ts';

// 通知模板类型定义
export interface AdminNotificationTemplate {
  id: number;
  code: string;
  name: string;
  titleTemplate: string;
  contentTemplate: string;
  type: NotificationType;
  channel: NotificationChannel;
  actionUrlTemplate: string;
  variables: string;
  description: string;
  priority: PriorityEnum;
  status: StatusEnum;
  createUserId: number;
  updateUserId: number;
  createTime: string;
  updateTime: string;
}

// 通知模板创建/更新相关字段
export interface NotificationTemplate {
  code: string;
  name: string;
  titleTemplate: string;
  contentTemplate: string;
  type: NotificationType;
  channel: NotificationChannel;
  actionUrlTemplate: string;
  variables: string;
  description: string;
  priority: PriorityEnum;
  status: StatusEnum;
}

// 通知模板查询相关字段
export interface NotificationTemplateQuery {
  pageNum: number;
  pageSize: number;
  type?: NotificationType;
  status?: StatusEnum;
  keyword?: string;
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
  title: string;
  content: string;
  type: NotificationType;
  actionUrl: string;
}

export type AdminNotificationTemplateResponse = ApiPageResponse<AdminNotificationTemplate>;
