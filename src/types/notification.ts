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
  // [文章互动]
  articlePublishNotification: boolean;
  articleLikeNotification: boolean;
  articleCollectionNotification: boolean;
  articleCommentNotification: boolean;
  // [评论互动]
  commentReplyNotification: boolean;
  commentLikeNotification: boolean;
  // [社交互动]
  followNotification: boolean;
  messageNotification: boolean;
  // [系统通知]
  reportNotification: boolean;
  reportResultNotification: boolean;
  feedbackNotification: boolean;
  systemNotification: boolean;
  // [通知渠道]
  emailNotification: boolean;
  siteNotification: boolean;
}

// 通知列表响应类型
export type NotificationListResponse = ApiPageResponse<Notification>;
