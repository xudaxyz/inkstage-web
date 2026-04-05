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
  articlePublishNotification: boolean;
  articleLikeNotification: boolean;
  articleCollectionNotification: boolean;
  articleCommentNotification: boolean;
  commentReplyNotification: boolean;
  commentLikeNotification: boolean;
  followNotification: boolean;
  messageNotification: boolean;
  reportNotification: boolean;
  feedbackNotification: boolean;
  systemNotification: boolean;
  emailNotification: boolean;
  siteNotification: boolean;
}

// 通知列表响应类型
export type NotificationListResponse = ApiPageResponse<Notification>;
