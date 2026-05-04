// 通知类型枚举（与后端保持一致）
export const NotificationType = {
  ALL: 'ALL', // 所有通知
  SYSTEM: 'SYSTEM', // 系统通知
  ARTICLE_PUBLISH: 'ARTICLE_PUBLISH', // 文章发布通知
  COLUMN_ARTICLE_PUBLISH: 'COLUMN_ARTICLE_PUBLISH', // 专栏文章发布通知
  COLUMN_DISABLED: 'COLUMN_DISABLED', // 专栏下线通知
  COLUMN_RESTORED: 'COLUMN_RESTORED', // 专栏恢复通知
  ARTICLE_LIKE: 'ARTICLE_LIKE', // 文章点赞通知
  ARTICLE_COLLECTION: 'ARTICLE_COLLECTION', // 文章收藏通知
  ARTICLE_COMMENT: 'ARTICLE_COMMENT', // 文章评论通知
  COMMENT_REPLY: 'COMMENT_REPLY', // 评论回复通知
  COMMENT_LIKE: 'COMMENT_LIKE', // 评论点赞通知
  FOLLOW: 'FOLLOW', // 关注通知
  MESSAGE: 'MESSAGE', // 私信通知
  REPORT: 'REPORT', // 举报通知
  REPORT_RESULT: 'REPORT_RESULT', // 举报处理通知
  FEEDBACK: 'FEEDBACK' // 反馈处理通知
} as const;
export type NotificationType = (typeof NotificationType)[keyof typeof NotificationType];
// 通知类型描述映射
export const NotificationTypeMap: Record<NotificationType, string> = {
  [NotificationType.ALL]: '所有通知',
  [NotificationType.SYSTEM]: '系统通知',
  [NotificationType.ARTICLE_PUBLISH]: '文章发布通知',
  [NotificationType.COLUMN_ARTICLE_PUBLISH]: '专栏文章发布通知',
  [NotificationType.COLUMN_DISABLED]: '专栏下线通知',
  [NotificationType.COLUMN_RESTORED]: '专栏恢复通知',
  [NotificationType.ARTICLE_LIKE]: '文章点赞通知',
  [NotificationType.ARTICLE_COLLECTION]: '文章收藏通知',
  [NotificationType.ARTICLE_COMMENT]: '文章评论通知',
  [NotificationType.COMMENT_REPLY]: '评论回复通知',
  [NotificationType.COMMENT_LIKE]: '评论点赞通知',
  [NotificationType.FOLLOW]: '关注通知',
  [NotificationType.MESSAGE]: '私信通知',
  [NotificationType.REPORT]: '举报通知',
  [NotificationType.REPORT_RESULT]: '举报处理通知',
  [NotificationType.FEEDBACK]: '反馈处理通知'
};
// 已读状态枚举
export const ReadStatus = {
  UNREAD: 'UNREAD', // 未读
  READ: 'READ' // 已读
} as const;
export type ReadStatus = (typeof ReadStatus)[keyof typeof ReadStatus];
// 已读状态描述映射
export const ReadStatusMap: Record<ReadStatus, string> = {
  [ReadStatus.UNREAD]: '未读',
  [ReadStatus.READ]: '已读'
};
