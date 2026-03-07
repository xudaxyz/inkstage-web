// 通知类型枚举（与后端保持一致）
export const NotificationType = {
  SYSTEM: 100,          // 系统通知
  ARTICLE_PUBLISH: 200,  // 文章发布通知
  ARTICLE_LIKE: 201,     // 文章点赞通知
  ARTICLE_COLLECTION: 202, // 文章收藏通知
  ARTICLE_COMMENT: 203,  // 文章评论通知
  COMMENT_REPLY: 300,    // 评论回复通知
  COMMENT_LIKE: 301,     // 评论点赞通知
  FOLLOW: 400,           // 关注通知
  MESSAGE: 500,          // 私信通知
  REPORT: 600,           // 举报处理通知
  FEEDBACK: 700,         // 反馈处理通知
} as const;

export type NotificationType = typeof NotificationType[keyof typeof NotificationType];

// 通知类型描述映射
export const NotificationTypeMap: Record<NotificationType, string> = {
  [NotificationType.SYSTEM]: '系统通知',
  [NotificationType.ARTICLE_PUBLISH]: '文章发布通知',
  [NotificationType.ARTICLE_LIKE]: '文章点赞通知',
  [NotificationType.ARTICLE_COLLECTION]: '文章收藏通知',
  [NotificationType.ARTICLE_COMMENT]: '文章评论通知',
  [NotificationType.COMMENT_REPLY]: '评论回复通知',
  [NotificationType.COMMENT_LIKE]: '评论点赞通知',
  [NotificationType.FOLLOW]: '关注通知',
  [NotificationType.MESSAGE]: '私信通知',
  [NotificationType.REPORT]: '举报处理通知',
  [NotificationType.FEEDBACK]: '反馈处理通知',
};

// 已读状态枚举
export const ReadStatus = {
  UNREAD: 0,  // 未读
  READ: 1,    // 已读
} as const;

export type ReadStatus = typeof ReadStatus[keyof typeof ReadStatus];

// 已读状态描述映射
export const ReadStatusMap: Record<ReadStatus, string> = {
  [ReadStatus.UNREAD]: '未读',
  [ReadStatus.READ]: '已读',
};
