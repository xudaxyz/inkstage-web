// 通知类型枚举
export const NotificationType = {
  // ==================== 可关闭的通知（用户可自主设置开关） ====================
  // 【文章互动】
  ARTICLE_PUBLISH: 'ARTICLE_PUBLISH', // 文章发布通知
  ARTICLE_LIKE: 'ARTICLE_LIKE', // 文章点赞通知
  ARTICLE_COLLECTION: 'ARTICLE_COLLECTION', // 文章收藏通知
  ARTICLE_COMMENT: 'ARTICLE_COMMENT', // 文章评论通知

  // 【评论互动】
  COMMENT_REPLY: 'COMMENT_REPLY', // 评论回复通知
  COMMENT_LIKE: 'COMMENT_LIKE', // 评论点赞通知

  // 【社交互动】
  FOLLOW: 'FOLLOW', // 关注通知
  MESSAGE: 'MESSAGE', // 私信通知

  // 【系统通知】
  REPORT: 'REPORT', // 举报通知
  REPORT_RESULT: 'REPORT_RESULT', // 举报处理通知
  FEEDBACK: 'FEEDBACK', // 反馈处理通知
  SYSTEM: 'SYSTEM', // 系统通知
  ALL: 'ALL', // 所有通知

  // ==================== 不可关闭的通知（系统强制发送） ====================
  // 【用户状态】
  USER_STATUS_CHANGE: 'USER_STATUS_CHANGE', // 用户状态变更通知

  // 【文章审核】
  ARTICLE_REVIEW_APPROVE: 'ARTICLE_REVIEW_APPROVE', // 文章审核通过通知
  ARTICLE_REVIEW_REJECT: 'ARTICLE_REVIEW_REJECT', // 文章审核拒绝通知
  ARTICLE_REVIEW_REPROCESS: 'ARTICLE_REVIEW_REPROCESS', // 文章重新审核通知
  ARTICLE_OFFLINE: 'ARTICLE_OFFLINE', // 文章下架通知
  ARTICLE_ONLINE: 'ARTICLE_ONLINE', // 文章重新上架通知
  ARTICLE_TOP: 'ARTICLE_TOP', // 文章置顶通知
  ARTICLE_RECOMMEND: 'ARTICLE_RECOMMEND', // 文章推荐通知
  ARTICLE_DELETE: 'ARTICLE_DELETE', // 文章删除通知

  // 【评论审核】
  COMMENT_REVIEW_REJECT: 'COMMENT_REVIEW_REJECT', // 评论审核拒绝通知
  COMMENT_TOP: 'COMMENT_TOP', // 评论置顶通知

  // 【专栏管理】
  COLUMN_SUBSCRIPTION: 'COLUMN_SUBSCRIPTION', // 专栏订阅通知
  COLUMN_ARTICLE_PUBLISH: 'COLUMN_ARTICLE_PUBLISH', // 专栏文章发布通知
  COLUMN_DISABLED: 'COLUMN_DISABLED', // 专栏下线通知
  COLUMN_RESTORED: 'COLUMN_RESTORED', // 专栏恢复通知

  // 【系统管理】
  TAG_DELETE: 'TAG_DELETE' // 标签删除通知
} as const;

export type NotificationType = (typeof NotificationType)[keyof typeof NotificationType];

// 通知类型描述映射
export const NotificationTypeMap: Record<NotificationType, string> = {
  // 可关闭 - 文章互动
  [NotificationType.ARTICLE_PUBLISH]: '文章发布通知',
  [NotificationType.ARTICLE_LIKE]: '文章点赞通知',
  [NotificationType.ARTICLE_COLLECTION]: '文章收藏通知',
  [NotificationType.ARTICLE_COMMENT]: '文章评论通知',

  // 可关闭 - 评论互动
  [NotificationType.COMMENT_REPLY]: '评论回复通知',
  [NotificationType.COMMENT_LIKE]: '评论点赞通知',

  // 可关闭 - 社交互动
  [NotificationType.FOLLOW]: '关注通知',
  [NotificationType.MESSAGE]: '私信通知',

  // 可关闭 - 系统通知
  [NotificationType.REPORT]: '举报通知',
  [NotificationType.REPORT_RESULT]: '举报处理通知',
  [NotificationType.FEEDBACK]: '反馈处理通知',
  [NotificationType.SYSTEM]: '系统通知',
  [NotificationType.ALL]: '所有通知',

  // 不可关闭 - 用户状态
  [NotificationType.USER_STATUS_CHANGE]: '用户状态变更通知',

  // 不可关闭 - 文章审核
  [NotificationType.ARTICLE_REVIEW_APPROVE]: '文章审核通过通知',
  [NotificationType.ARTICLE_REVIEW_REJECT]: '文章审核拒绝通知',
  [NotificationType.ARTICLE_REVIEW_REPROCESS]: '文章重新审核通知',
  [NotificationType.ARTICLE_OFFLINE]: '文章下架通知',
  [NotificationType.ARTICLE_ONLINE]: '文章重新上架通知',
  [NotificationType.ARTICLE_TOP]: '文章置顶通知',
  [NotificationType.ARTICLE_RECOMMEND]: '文章推荐通知',
  [NotificationType.ARTICLE_DELETE]: '文章删除通知',

  // 不可关闭 - 评论审核
  [NotificationType.COMMENT_REVIEW_REJECT]: '评论审核拒绝通知',
  [NotificationType.COMMENT_TOP]: '评论置顶通知',

  // 不可关闭 - 专栏管理
  [NotificationType.COLUMN_SUBSCRIPTION]: '专栏订阅通知',
  [NotificationType.COLUMN_ARTICLE_PUBLISH]: '专栏文章发布通知',
  [NotificationType.COLUMN_DISABLED]: '专栏下线通知',
  [NotificationType.COLUMN_RESTORED]: '专栏恢复通知',

  // 不可关闭 - 系统管理
  [NotificationType.TAG_DELETE]: '标签删除通知'
};

// 通知类型分类（用于前端分组展示）
export const NotificationTypeCategory = {
  // 可关闭 - 文章互动
  ARTICLE_INTERACTION: [
    NotificationType.ARTICLE_PUBLISH,
    NotificationType.ARTICLE_LIKE,
    NotificationType.ARTICLE_COLLECTION,
    NotificationType.ARTICLE_COMMENT
  ],

  // 可关闭 - 评论互动
  COMMENT_INTERACTION: [NotificationType.COMMENT_REPLY, NotificationType.COMMENT_LIKE],

  // 可关闭 - 社交互动
  SOCIAL_INTERACTION: [NotificationType.FOLLOW, NotificationType.MESSAGE],

  // 可关闭 - 系统通知
  SYSTEM_NOTIFICATION: [NotificationType.REPORT, NotificationType.REPORT_RESULT, NotificationType.FEEDBACK, NotificationType.SYSTEM],

  // 不可关闭 - 用户状态
  USER_STATUS: [NotificationType.USER_STATUS_CHANGE],

  // 不可关闭 - 文章审核
  ARTICLE_AUDIT: [
    NotificationType.ARTICLE_REVIEW_APPROVE,
    NotificationType.ARTICLE_REVIEW_REJECT,
    NotificationType.ARTICLE_REVIEW_REPROCESS,
    NotificationType.ARTICLE_OFFLINE,
    NotificationType.ARTICLE_ONLINE,
    NotificationType.ARTICLE_TOP,
    NotificationType.ARTICLE_RECOMMEND,
    NotificationType.ARTICLE_DELETE
  ],

  // 不可关闭 - 评论审核
  COMMENT_AUDIT: [NotificationType.COMMENT_REVIEW_REJECT, NotificationType.COMMENT_TOP],

  // 不可关闭 - 专栏管理
  COLUMN_MANAGEMENT: [NotificationType.COLUMN_SUBSCRIPTION, NotificationType.COLUMN_ARTICLE_PUBLISH, NotificationType.COLUMN_DISABLED, NotificationType.COLUMN_RESTORED],

  // 不可关闭 - 系统管理
  SYSTEM_MANAGEMENT: [NotificationType.TAG_DELETE]
} as const;

// 分类名称映射
export const NotificationCategoryName: Record<keyof typeof NotificationTypeCategory, string> = {
  ARTICLE_INTERACTION: '文章互动',
  COMMENT_INTERACTION: '评论互动',
  SOCIAL_INTERACTION: '社交互动',
  SYSTEM_NOTIFICATION: '系统通知',
  USER_STATUS: '用户状态',
  ARTICLE_AUDIT: '文章审核',
  COMMENT_AUDIT: '评论审核',
  COLUMN_MANAGEMENT: '专栏管理',
  SYSTEM_MANAGEMENT: '系统管理'
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
