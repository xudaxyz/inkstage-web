import { NotificationType, ReadStatus } from './enums';
import type { ApiPageResponse } from './common';

// 通知类型定义
export interface Notification {
  id: number;
  notificationType: NotificationType;
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
export type NotificationListResponse = ApiPageResponse<Notification>;
