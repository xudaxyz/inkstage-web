/**
 * 通知参数类型定义
 * 与后端 NotificationParam 子类一一对应
 */

import { NotificationType } from './enums';

// ==================== 模板变量定义 ====================

export interface TemplateVariable {
  key: string;
  description: string;
}

// ==================== 可关闭的通知参数 ====================

// [文章互动]
export interface ArticlePublishParam {
  username: string;
  articleTitle: string;
  articleId: string;
  articleUrl: string;
}

export const ArticlePublishParam = {
  USERNAME: 'username',
  ARTICLE_TITLE: 'articleTitle',
  ARTICLE_ID: 'articleId',
  ARTICLE_URL: 'articleUrl'
} as const;

export interface ArticleLikeParam {
  username: string;
  articleTitle: string;
  articleId: string;
  articleUrl: string;
}

export const ArticleLikeParam = {
  USERNAME: 'username',
  ARTICLE_TITLE: 'articleTitle',
  ARTICLE_ID: 'articleId',
  ARTICLE_URL: 'articleUrl'
} as const;

export interface ArticleCollectionParam {
  collectorName: string;
  articleTitle: string;
  articleId: string;
  articleUrl: string;
}

export const ArticleCollectionParam = {
  COLLECTOR_NAME: 'collectorName',
  ARTICLE_TITLE: 'articleTitle',
  ARTICLE_ID: 'articleId',
  ARTICLE_URL: 'articleUrl'
} as const;

export interface ArticleCommentParam {
  username: string;
  articleTitle: string;
  commentContent: string;
  articleId: string;
  articleUrl: string;
}

export const ArticleCommentParam = {
  USERNAME: 'username',
  ARTICLE_TITLE: 'articleTitle',
  COMMENT_CONTENT: 'commentContent',
  ARTICLE_ID: 'articleId',
  ARTICLE_URL: 'articleUrl'
} as const;

// [评论互动]
export interface CommentReplyParam {
  username: string;
  commentContent: string;
  articleId: string;
  articleUrl: string;
}

export const CommentReplyParam = {
  USERNAME: 'username',
  COMMENT_CONTENT: 'commentContent',
  ARTICLE_ID: 'articleId',
  ARTICLE_URL: 'articleUrl'
} as const;

export interface CommentLikeParam {
  username: string;
  articleId: string;
  articleUrl: string;
}

export const CommentLikeParam = {
  USERNAME: 'username',
  ARTICLE_ID: 'articleId',
  ARTICLE_URL: 'articleUrl'
} as const;

// [社交互动]
export interface FollowParam {
  username: string;
}

export const FollowParam = {
  USERNAME: 'username',
  FOLLOWER_ID: 'followerId'
} as const;

export interface MessageParam {
  messageContent: string;
}

export const MessageParam = {
  MESSAGE_CONTENT: 'messageContent'
} as const;

// [系统通知]
export interface ReportParam {
  reportedContent: string;
  relatedId: string;
}

export const ReportParam = {
  REPORTED_CONTENT: 'reportedContent',
  RELATED_ID: 'relatedId'
} as const;

export interface ReportResultParam {
  handleResult: string;
  relatedId: string;
}

export const ReportResultParam = {
  HANDLE_RESULT: 'handleResult',
  RELATED_ID: 'relatedId'
} as const;

export interface FeedbackParam {
  handleResult: string;
}

export const FeedbackParam = {
  HANDLE_RESULT: 'handleResult'
} as const;

export interface SystemNotificationParam {
  messageContent: string;
  systemTime: string;
}

export const SystemNotificationParam = {
  MESSAGE_CONTENT: 'messageContent',
  SYSTEM_TIME: 'systemTime'
} as const;

export interface AllNotificationParam {
  messageContent: string;
  systemTime: string;
}

export const AllNotificationParam = {
  MESSAGE_CONTENT: 'messageContent',
  SYSTEM_TIME: 'systemTime'
} as const;

// ==================== 不可关闭的通知参数 ====================

// [用户状态]
export interface UserStatusChangeParam {
  reason: string;
}

export const UserStatusChangeParam = {
  REASON: 'reason'
} as const;

// [文章审核]
export interface ArticleReviewApproveParam {
  articleTitle: string;
  articleId: string;
  articleUrl: string;
}

export const ArticleReviewApproveParam = {
  ARTICLE_TITLE: 'articleTitle',
  ARTICLE_ID: 'articleId',
  ARTICLE_URL: 'articleUrl'
} as const;

export interface ArticleReviewRejectParam {
  articleTitle: string;
  reason: string;
  articleId: string;
}

export const ArticleReviewRejectParam = {
  ARTICLE_TITLE: 'articleTitle',
  REASON: 'reason',
  ARTICLE_ID: 'articleId'
} as const;

export interface ArticleReviewReprocessParam {
  articleTitle: string;
  articleId: string;
}

export const ArticleReviewReprocessParam = {
  ARTICLE_TITLE: 'articleTitle',
  ARTICLE_ID: 'articleId'
} as const;

export interface ArticleOfflineParam {
  articleTitle: string;
  reason: string;
  articleId: string;
}

export const ArticleOfflineParam = {
  ARTICLE_TITLE: 'articleTitle',
  REASON: 'reason',
  ARTICLE_ID: 'articleId'
} as const;

export interface ArticleOnlineParam {
  articleTitle: string;
  articleId: string;
  articleUrl: string;
}

export const ArticleOnlineParam = {
  ARTICLE_TITLE: 'articleTitle',
  ARTICLE_ID: 'articleId',
  ARTICLE_URL: 'articleUrl'
} as const;

export interface ArticleTopParam {
  articleTitle: string;
  articleId: string;
  articleUrl: string;
}

export const ArticleTopParam = {
  ARTICLE_TITLE: 'articleTitle',
  ARTICLE_ID: 'articleId',
  ARTICLE_URL: 'articleUrl'
} as const;

export interface ArticleRecommendParam {
  articleTitle: string;
  articleId: string;
  articleUrl: string;
}

export const ArticleRecommendParam = {
  ARTICLE_TITLE: 'articleTitle',
  ARTICLE_ID: 'articleId',
  ARTICLE_URL: 'articleUrl'
} as const;

export interface ArticleDeleteParam {
  articleTitle: string;
  articleId: string;
  reason: string;
}

export const ArticleDeleteParam = {
  ARTICLE_TITLE: 'articleTitle',
  ARTICLE_ID: 'articleId',
  REASON: 'reason'
} as const;

// [评论审核]
export interface CommentReviewRejectParam {
  reason: string;
  articleId: string;
}

export const CommentReviewRejectParam = {
  REASON: 'reason',
  ARTICLE_ID: 'articleId'
} as const;

export interface CommentTopParam {
  articleId: string;
  articleUrl: string;
}

export const CommentTopParam = {
  ARTICLE_ID: 'articleId',
  ARTICLE_URL: 'articleUrl'
} as const;

// [专栏管理]
export interface ColumnSubscriptionParam {
  columnId: string;
  columnName: string;
  subscriberId: string;
  subscriberName: string;
  actionUrl: string;
}

export const ColumnSubscriptionParam = {
  COLUMN_ID: 'columnId',
  COLUMN_NAME: 'columnName',
  SUBSCRIBER_ID: 'subscriberId',
  SUBSCRIBER_NAME: 'subscriberName',
  ACTION_URL: 'actionUrl'
} as const;

export interface ColumnArticlePublishParam {
  columnId: string;
  columnName: string;
  articleTitle: string;
  articleId: string;
  articleUrl: string;
}

export const ColumnArticlePublishParam = {
  COLUMN_ID: 'columnId',
  COLUMN_NAME: 'columnName',
  ARTICLE_TITLE: 'articleTitle',
  ARTICLE_ID: 'articleId',
  ARTICLE_URL: 'articleUrl'
} as const;

export interface ColumnDisabledParam {
  columnId: string;
  columnName: string;
  reason: string;
}

export const ColumnDisabledParam = {
  COLUMN_ID: 'columnId',
  COLUMN_NAME: 'columnName',
  REASON: 'reason'
} as const;

export interface ColumnRestoredParam {
  columnId: string;
  columnName: string;
  actionUrl: string;
}

export const ColumnRestoredParam = {
  COLUMN_ID: 'columnId',
  COLUMN_NAME: 'columnName',
  ACTION_URL: 'actionUrl'
} as const;

// [系统管理]
export interface TagDeleteParam {
  tagName: string;
  tagId: string;
}

export const TagDeleteParam = {
  TAG_NAME: 'tagName',
  TAG_ID: 'tagId'
} as const;

// ==================== 通知类型与参数类型的映射 ====================

export type NotificationParamMap = {
  // 可关闭 - 文章互动
  [NotificationType.ARTICLE_PUBLISH]: ArticlePublishParam;
  [NotificationType.ARTICLE_LIKE]: ArticleLikeParam;
  [NotificationType.ARTICLE_COLLECTION]: ArticleCollectionParam;
  [NotificationType.ARTICLE_COMMENT]: ArticleCommentParam;

  // 可关闭 - 评论互动
  [NotificationType.COMMENT_REPLY]: CommentReplyParam;
  [NotificationType.COMMENT_LIKE]: CommentLikeParam;

  // 可关闭 - 社交互动
  [NotificationType.FOLLOW]: FollowParam;
  [NotificationType.MESSAGE]: MessageParam;

  // 可关闭 - 系统通知
  [NotificationType.REPORT]: ReportParam;
  [NotificationType.REPORT_RESULT]: ReportResultParam;
  [NotificationType.FEEDBACK]: FeedbackParam;
  [NotificationType.SYSTEM]: SystemNotificationParam;
  [NotificationType.ALL]: AllNotificationParam;

  // 不可关闭 - 用户状态
  [NotificationType.USER_STATUS_CHANGE]: UserStatusChangeParam;

  // 不可关闭 - 文章审核
  [NotificationType.ARTICLE_REVIEW_APPROVE]: ArticleReviewApproveParam;
  [NotificationType.ARTICLE_REVIEW_REJECT]: ArticleReviewRejectParam;
  [NotificationType.ARTICLE_REVIEW_REPROCESS]: ArticleReviewReprocessParam;
  [NotificationType.ARTICLE_OFFLINE]: ArticleOfflineParam;
  [NotificationType.ARTICLE_ONLINE]: ArticleOnlineParam;
  [NotificationType.ARTICLE_TOP]: ArticleTopParam;
  [NotificationType.ARTICLE_RECOMMEND]: ArticleRecommendParam;
  [NotificationType.ARTICLE_DELETE]: ArticleDeleteParam;

  // 不可关闭 - 评论审核
  [NotificationType.COMMENT_REVIEW_REJECT]: CommentReviewRejectParam;
  [NotificationType.COMMENT_TOP]: CommentTopParam;

  // 不可关闭 - 专栏管理
  [NotificationType.COLUMN_SUBSCRIPTION]: ColumnSubscriptionParam;
  [NotificationType.COLUMN_ARTICLE_PUBLISH]: ColumnArticlePublishParam;
  [NotificationType.COLUMN_DISABLED]: ColumnDisabledParam;
  [NotificationType.COLUMN_RESTORED]: ColumnRestoredParam;

  // 不可关闭 - 系统管理
  [NotificationType.TAG_DELETE]: TagDeleteParam;
};

// 获取某个通知类型的参数类型
export type GetNotificationParam<T extends NotificationType> = NotificationParamMap[T];

// 所有通知参数的联合类型
export type NotificationParam =
  | ArticlePublishParam
  | ArticleLikeParam
  | ArticleCollectionParam
  | ArticleCommentParam
  | CommentReplyParam
  | CommentLikeParam
  | FollowParam
  | MessageParam
  | ReportParam
  | ReportResultParam
  | FeedbackParam
  | SystemNotificationParam
  | AllNotificationParam
  | UserStatusChangeParam
  | ArticleReviewApproveParam
  | ArticleReviewRejectParam
  | ArticleReviewReprocessParam
  | ArticleOfflineParam
  | ArticleOnlineParam
  | ArticleTopParam
  | ArticleRecommendParam
  | ArticleDeleteParam
  | CommentReviewRejectParam
  | CommentTopParam
  | ColumnSubscriptionParam
  | ColumnArticlePublishParam
  | ColumnDisabledParam
  | ColumnRestoredParam
  | TagDeleteParam;

// ==================== 通知类型完整配置 ====================

export interface NotificationTypeConfig {
  /** 通知类型 */
  type: NotificationType;
  /** 显示名称 */
  name: string;
  /** 简要描述 */
  description: string;
  /** 可用变量 */
  variables: TemplateVariable[];
  /** 默认标题模板 */
  defaultTitleTemplate: string;
  /** 默认内容模板 */
  defaultContentTemplate: string;
  /** 默认操作URL模板 */
  defaultActionUrlTemplate: string;
}

export const NOTIFICATION_TYPE_CONFIGS: Record<NotificationType, NotificationTypeConfig> = {
  // ==================== 可关闭的通知 ====================

  // [文章互动]
  [NotificationType.ARTICLE_PUBLISH]: {
    type: NotificationType.ARTICLE_PUBLISH,
    name: '文章发布通知',
    description: '用户发布的文章审核通过后发送',
    variables: [
      { key: ArticlePublishParam.USERNAME, description: '作者' },
      { key: ArticlePublishParam.ARTICLE_TITLE, description: '文章标题' },
      { key: ArticlePublishParam.ARTICLE_ID, description: '文章ID' },
      { key: ArticlePublishParam.ARTICLE_URL, description: '文章链接' }
    ],
    defaultTitleTemplate: '文章发布成功',
    defaultContentTemplate: '您的文章《${articleTitle}》发布成功！',
    defaultActionUrlTemplate: '/article/${articleId}'
  },

  [NotificationType.ARTICLE_LIKE]: {
    type: NotificationType.ARTICLE_LIKE,
    name: '文章点赞通知',
    description: '用户的文章被点赞时发送',
    variables: [
      { key: ArticleLikeParam.USERNAME, description: '点赞者' },
      { key: ArticleLikeParam.ARTICLE_TITLE, description: '文章标题' },
      { key: ArticleLikeParam.ARTICLE_ID, description: '文章ID' },
      { key: ArticleLikeParam.ARTICLE_URL, description: '文章链接' }
    ],
    defaultTitleTemplate: '文章点赞通知',
    defaultContentTemplate: '${username}点赞了您的文章《${articleTitle}》',
    defaultActionUrlTemplate: '/article/${articleId}'
  },

  [NotificationType.ARTICLE_COLLECTION]: {
    type: NotificationType.ARTICLE_COLLECTION,
    name: '文章收藏通知',
    description: '用户的文章被收藏时发送',
    variables: [
      { key: ArticleCollectionParam.COLLECTOR_NAME, description: '收藏者' },
      { key: ArticleCollectionParam.ARTICLE_TITLE, description: '文章标题' },
      { key: ArticleCollectionParam.ARTICLE_ID, description: '文章ID' },
      { key: ArticleCollectionParam.ARTICLE_URL, description: '文章链接' }
    ],
    defaultTitleTemplate: '有人收藏您的文章',
    defaultContentTemplate: '${collectorName}收藏了您的文章《${articleTitle}》',
    defaultActionUrlTemplate: '/article/${articleId}'
  },

  [NotificationType.ARTICLE_COMMENT]: {
    type: NotificationType.ARTICLE_COMMENT,
    name: '文章评论通知',
    description: '用户的文章收到评论时发送',
    variables: [
      { key: ArticleCommentParam.USERNAME, description: '评论者' },
      { key: ArticleCommentParam.ARTICLE_TITLE, description: '文章标题' },
      { key: ArticleCommentParam.COMMENT_CONTENT, description: '评论内容' },
      { key: ArticleCommentParam.ARTICLE_ID, description: '文章ID' },
      { key: ArticleCommentParam.ARTICLE_URL, description: '文章链接' }
    ],
    defaultTitleTemplate: '收到了一条新评论',
    defaultContentTemplate: '${username}评论了您的文章《${articleTitle}》：${commentContent}，快来看看吧！',
    defaultActionUrlTemplate: '/article/${articleId}#comment'
  },

  // [评论互动]
  [NotificationType.COMMENT_REPLY]: {
    type: NotificationType.COMMENT_REPLY,
    name: '评论回复通知',
    description: '用户的评论被回复时发送',
    variables: [
      { key: CommentReplyParam.USERNAME, description: '回复者' },
      { key: CommentReplyParam.COMMENT_CONTENT, description: '评论内容' },
      { key: CommentReplyParam.ARTICLE_ID, description: '文章ID' },
      { key: CommentReplyParam.ARTICLE_URL, description: '文章链接' }
    ],
    defaultTitleTemplate: '收到回复啦',
    defaultContentTemplate: '${username}回复了您的评论：${commentContent}',
    defaultActionUrlTemplate: '/article/${articleId}#comment'
  },

  [NotificationType.COMMENT_LIKE]: {
    type: NotificationType.COMMENT_LIKE,
    name: '评论点赞通知',
    description: '用户的评论被点赞时发送',
    variables: [
      { key: CommentLikeParam.USERNAME, description: '点赞者' },
      { key: CommentLikeParam.ARTICLE_ID, description: '文章ID' },
      { key: CommentLikeParam.ARTICLE_URL, description: '文章链接' }
    ],
    defaultTitleTemplate: '评论点赞通知',
    defaultContentTemplate: '${username}点赞了您的评论，快去看看吧~',
    defaultActionUrlTemplate: '/article/${articleId}#comment'
  },

  // [社交互动]
  [NotificationType.FOLLOW]: {
    type: NotificationType.FOLLOW,
    name: '关注通知',
    description: '用户被关注时发送',
    variables: [{ key: FollowParam.USERNAME, description: '关注者' }, { key: FollowParam.FOLLOWER_ID, description: '关注者id' }],
    defaultTitleTemplate: '新增粉丝',
    defaultContentTemplate: '${username}关注了您，快去看看TA吧~',
    defaultActionUrlTemplate: '/user/${followerId}'
  },

  [NotificationType.MESSAGE]: {
    type: NotificationType.MESSAGE,
    name: '私信通知',
    description: '用户收到私信时发送',
    variables: [{ key: MessageParam.MESSAGE_CONTENT, description: '消息内容' }],
    defaultTitleTemplate: '您有新私信',
    defaultContentTemplate: '${messageContent}',
    defaultActionUrlTemplate: '/message'
  },

  // [系统通知]
  [NotificationType.REPORT]: {
    type: NotificationType.REPORT,
    name: '举报通知',
    description: '用户提交举报后接收回执',
    variables: [
      { key: ReportParam.REPORTED_CONTENT, description: '举报内容' },
      { key: ReportParam.RELATED_ID, description: '关联ID' }
    ],
    defaultTitleTemplate: '举报已提交',
    defaultContentTemplate: '您提交的举报已受理，我们会尽快处理',
    defaultActionUrlTemplate: '/report/detail/${relatedId}'
  },

  [NotificationType.REPORT_RESULT]: {
    type: NotificationType.REPORT_RESULT,
    name: '举报处理通知',
    description: '用户的举报被处理后发送',
    variables: [
      { key: ReportResultParam.HANDLE_RESULT, description: '处理结果' },
      { key: ReportResultParam.RELATED_ID, description: '关联ID' }
    ],
    defaultTitleTemplate: '举报已处理',
    defaultContentTemplate: '您提交的举报已处理，结果：${handleResult}',
    defaultActionUrlTemplate: '/report/detail/${relatedId}'
  },

  [NotificationType.FEEDBACK]: {
    type: NotificationType.FEEDBACK,
    name: '反馈处理通知',
    description: '用户的反馈被处理后发送',
    variables: [{ key: FeedbackParam.HANDLE_RESULT, description: '处理结果' }],
    defaultTitleTemplate: '反馈已处理',
    defaultContentTemplate: '您的反馈已处理，结果：${handleResult}',
    defaultActionUrlTemplate: '/feedback'
  },

  [NotificationType.SYSTEM]: {
    type: NotificationType.SYSTEM,
    name: '系统通知',
    description: '系统公告或重要通知',
    variables: [
      { key: SystemNotificationParam.MESSAGE_CONTENT, description: '消息内容' },
      { key: SystemNotificationParam.SYSTEM_TIME, description: '系统时间' }
    ],
    defaultTitleTemplate: '系统通知',
    defaultContentTemplate: '${messageContent}',
    defaultActionUrlTemplate: ''
  },

  [NotificationType.ALL]: {
    type: NotificationType.ALL,
    name: '所有通知',
    description: '所有通知',
    variables: [
      { key: AllNotificationParam.MESSAGE_CONTENT, description: '消息内容' },
      { key: AllNotificationParam.SYSTEM_TIME, description: '系统时间' }
    ],
    defaultTitleTemplate: '系统通知',
    defaultContentTemplate: '${messageContent}',
    defaultActionUrlTemplate: ''
  },

  // ==================== 不可关闭的通知 ====================

  // [用户状态]
  [NotificationType.USER_STATUS_CHANGE]: {
    type: NotificationType.USER_STATUS_CHANGE,
    name: '用户状态变更通知',
    description: '用户账号状态发生变更时发送（不可关闭）',
    variables: [{ key: UserStatusChangeParam.REASON, description: '变更原因' }],
    defaultTitleTemplate: '账号状态变更',
    defaultContentTemplate: '您的账号状态已变更，原因：${reason}',
    defaultActionUrlTemplate: '/settings/account'
  },

  // [文章审核]
  [NotificationType.ARTICLE_REVIEW_APPROVE]: {
    type: NotificationType.ARTICLE_REVIEW_APPROVE,
    name: '文章审核通过通知',
    description: '用户的文章审核通过时发送（不可关闭）',
    variables: [
      { key: ArticleReviewApproveParam.ARTICLE_TITLE, description: '文章标题' },
      { key: ArticleReviewApproveParam.ARTICLE_ID, description: '文章ID' },
      { key: ArticleReviewApproveParam.ARTICLE_URL, description: '文章链接' }
    ],
    defaultTitleTemplate: '文章审核通过',
    defaultContentTemplate: '您的文章《${articleTitle}》已审核通过，快去看看吧！',
    defaultActionUrlTemplate: '/article/${articleId}'
  },

  [NotificationType.ARTICLE_REVIEW_REJECT]: {
    type: NotificationType.ARTICLE_REVIEW_REJECT,
    name: '文章审核拒绝通知',
    description: '用户的文章审核未通过时发送（不可关闭）',
    variables: [
      { key: ArticleReviewRejectParam.ARTICLE_TITLE, description: '文章标题' },
      { key: ArticleReviewRejectParam.REASON, description: '拒绝原因' },
      { key: ArticleReviewRejectParam.ARTICLE_ID, description: '文章ID' }
    ],
    defaultTitleTemplate: '文章未通过审核',
    defaultContentTemplate: '您的文章《${articleTitle}》未通过审核，原因：${reason}',
    defaultActionUrlTemplate: '/user/article/edit/${articleId}'
  },

  [NotificationType.ARTICLE_REVIEW_REPROCESS]: {
    type: NotificationType.ARTICLE_REVIEW_REPROCESS,
    name: '文章重新审核通知',
    description: '文章需要重新审核时发送（不可关闭）',
    variables: [
      { key: ArticleReviewReprocessParam.ARTICLE_TITLE, description: '文章标题' },
      { key: ArticleReviewReprocessParam.ARTICLE_ID, description: '文章ID' }
    ],
    defaultTitleTemplate: '文章重新审核通知',
    defaultContentTemplate: '您的文章《${articleTitle}》正在重新审核中，请耐心等待审核结果!',
    defaultActionUrlTemplate: ''
  },

  [NotificationType.ARTICLE_OFFLINE]: {
    type: NotificationType.ARTICLE_OFFLINE,
    name: '文章下架通知',
    description: '用户的文章被下架时发送（不可关闭）',
    variables: [
      { key: ArticleOfflineParam.ARTICLE_TITLE, description: '文章标题' },
      { key: ArticleOfflineParam.REASON, description: '下线原因' },
      { key: ArticleOfflineParam.ARTICLE_ID, description: '文章ID' }
    ],
    defaultTitleTemplate: '文章已下线',
    defaultContentTemplate: '您的文章《${articleTitle}》已被下线，原因：${reason}',
    defaultActionUrlTemplate: '/user/article/edit/${articleId}'
  },

  [NotificationType.ARTICLE_ONLINE]: {
    type: NotificationType.ARTICLE_ONLINE,
    name: '文章重新上架通知',
    description: '用户的文章被重新上架时发送（不可关闭）',
    variables: [
      { key: ArticleOnlineParam.ARTICLE_TITLE, description: '文章标题' },
      { key: ArticleOnlineParam.ARTICLE_ID, description: '文章ID' },
      { key: ArticleOnlineParam.ARTICLE_URL, description: '文章链接' }
    ],
    defaultTitleTemplate: '文章重新上架',
    defaultContentTemplate: '您的文章《${articleTitle}》已重新上架，快去看看吧~',
    defaultActionUrlTemplate: '/article/${articleId}'
  },

  [NotificationType.ARTICLE_TOP]: {
    type: NotificationType.ARTICLE_TOP,
    name: '文章置顶通知',
    description: '用户的文章被置顶时发送（不可关闭）',
    variables: [
      { key: ArticleTopParam.ARTICLE_TITLE, description: '文章标题' },
      { key: ArticleTopParam.ARTICLE_ID, description: '文章ID' },
      { key: ArticleTopParam.ARTICLE_URL, description: '文章链接' }
    ],
    defaultTitleTemplate: '文章被置顶',
    defaultContentTemplate: '您的文章《${articleTitle}》已被置顶，获得更多曝光~',
    defaultActionUrlTemplate: '/article/${articleId}'
  },

  [NotificationType.ARTICLE_RECOMMEND]: {
    type: NotificationType.ARTICLE_RECOMMEND,
    name: '文章推荐通知',
    description: '用户的文章被推荐时发送（不可关闭）',
    variables: [
      { key: ArticleRecommendParam.ARTICLE_TITLE, description: '文章标题' },
      { key: ArticleRecommendParam.ARTICLE_ID, description: '文章ID' },
      { key: ArticleRecommendParam.ARTICLE_URL, description: '文章链接' }
    ],
    defaultTitleTemplate: '文章被推荐',
    defaultContentTemplate: '恭喜！您的文章《${articleTitle}》被推荐到首页，快去看看吧~',
    defaultActionUrlTemplate: '/article/${articleId}'
  },

  [NotificationType.ARTICLE_DELETE]: {
    type: NotificationType.ARTICLE_DELETE,
    name: '文章删除通知',
    description: '用户的文章被删除时发送（不可关闭）',
    variables: [
      { key: ArticleDeleteParam.ARTICLE_TITLE, description: '文章标题' },
      { key: ArticleDeleteParam.ARTICLE_ID, description: '文章ID' },
      { key: ArticleDeleteParam.REASON, description: '删除原因' }
    ],
    defaultTitleTemplate: '文章已删除',
    defaultContentTemplate: '您的文章《${articleTitle}》已被删除，原因：${reason}',
    defaultActionUrlTemplate: ''
  },

  // [评论审核]
  [NotificationType.COMMENT_REVIEW_REJECT]: {
    type: NotificationType.COMMENT_REVIEW_REJECT,
    name: '评论审核拒绝通知',
    description: '用户的评论审核未通过时发送（不可关闭）',
    variables: [
      { key: CommentReviewRejectParam.REASON, description: '拒绝原因' },
      { key: CommentReviewRejectParam.ARTICLE_ID, description: '文章ID' }
    ],
    defaultTitleTemplate: '评论未通过审核',
    defaultContentTemplate: '您的评论未通过审核，原因：${reason}',
    defaultActionUrlTemplate: '/article/${articleId}#comment'
  },

  [NotificationType.COMMENT_TOP]: {
    type: NotificationType.COMMENT_TOP,
    name: '评论置顶通知',
    description: '用户的评论被置顶时发送（不可关闭）',
    variables: [
      { key: CommentTopParam.ARTICLE_ID, description: '文章ID' },
      { key: CommentTopParam.ARTICLE_URL, description: '文章链接' }
    ],
    defaultTitleTemplate: '评论被置顶',
    defaultContentTemplate: '您的评论已被置顶，快去看看吧~',
    defaultActionUrlTemplate: '/article/${articleId}#comment'
  },

  // [专栏管理]
  [NotificationType.COLUMN_SUBSCRIPTION]: {
    type: NotificationType.COLUMN_SUBSCRIPTION,
    name: '专栏订阅通知',
    description: '新用户订阅专栏时发送',
    variables: [
      { key: ColumnSubscriptionParam.COLUMN_ID, description: '专栏ID' },
      { key: ColumnSubscriptionParam.COLUMN_NAME, description: '专栏名称' },
      { key: ColumnSubscriptionParam.SUBSCRIBER_ID, description: '订阅者ID' },
      { key: ColumnSubscriptionParam.SUBSCRIBER_NAME, description: '订阅者名称' },
      { key: ColumnSubscriptionParam.ACTION_URL, description: '专栏链接' }
    ],
    defaultTitleTemplate: '专栏订阅通知',
    defaultContentTemplate: '${subscriberName}订阅了您的专栏《${columnName}》 ',
    defaultActionUrlTemplate: '/column/${columnId}'
  },
  [NotificationType.COLUMN_ARTICLE_PUBLISH]: {
    type: NotificationType.COLUMN_ARTICLE_PUBLISH,
    name: '专栏文章发布通知',
    description: '专栏有新文章发布时发送',
    variables: [
      { key: ColumnArticlePublishParam.COLUMN_ID, description: '专栏ID' },
      { key: ColumnArticlePublishParam.COLUMN_NAME, description: '专栏名称' },
      { key: ColumnArticlePublishParam.ARTICLE_TITLE, description: '文章标题' },
      { key: ColumnArticlePublishParam.ARTICLE_ID, description: '文章ID' },
      { key: ColumnArticlePublishParam.ARTICLE_URL, description: '文章链接' }
    ],
    defaultTitleTemplate: '[${columnName}]更新啦',
    defaultContentTemplate: '您订阅的专栏[《${columnName}》]发布了新内容：《${articleTitle}》，快来围观吧~',
    defaultActionUrlTemplate: '/article/${articleId}'
  },

  [NotificationType.COLUMN_DISABLED]: {
    type: NotificationType.COLUMN_DISABLED,
    name: '专栏下线通知',
    description: '专栏被下线时发送（不可关闭）',
    variables: [
      { key: ColumnDisabledParam.COLUMN_ID, description: '专栏ID' },
      { key: ColumnDisabledParam.COLUMN_NAME, description: '专栏名称' },
      { key: ColumnDisabledParam.REASON, description: '禁用原因' }
    ],
    defaultTitleTemplate: '专栏已下线',
    defaultContentTemplate: '您订阅的专栏《${columnName}》已下线，原因：${reason}',
    defaultActionUrlTemplate: ''
  },

  [NotificationType.COLUMN_RESTORED]: {
    type: NotificationType.COLUMN_RESTORED,
    name: '专栏恢复通知',
    description: '专栏被恢复时发送（不可关闭）',
    variables: [
      { key: ColumnRestoredParam.COLUMN_ID, description: '专栏ID' },
      { key: ColumnRestoredParam.COLUMN_NAME, description: '专栏名称' },
      { key: ColumnRestoredParam.ACTION_URL, description: '操作链接' }
    ],
    defaultTitleTemplate: '专栏已恢复',
    defaultContentTemplate: '您关注的专栏《${columnName}》已恢复，快去看看吧~',
    defaultActionUrlTemplate: '/column/${columnId}'
  },

  // [系统管理]
  [NotificationType.TAG_DELETE]: {
    type: NotificationType.TAG_DELETE,
    name: '标签删除通知',
    description: '标签被删除时发送（不可关闭）',
    variables: [
      { key: TagDeleteParam.TAG_NAME, description: '标签名称' },
      { key: TagDeleteParam.TAG_ID, description: '标签ID' }
    ],
    defaultTitleTemplate: '标签已删除',
    defaultContentTemplate: '您使用的标签「${tagName}」已被删除',
    defaultActionUrlTemplate: ''
  }
};

// ==================== 辅助函数 ====================

/**
 * 获取某个通知类型的完整配置
 */
export const getNotificationTypeConfig = (type: NotificationType): NotificationTypeConfig | undefined => {
  return NOTIFICATION_TYPE_CONFIGS[type];
};

/**
 * 获取某个通知类型需要的模板变量列表
 */
export const getNotificationVariables = (type: NotificationType): TemplateVariable[] => {
  const config = NOTIFICATION_TYPE_CONFIGS[type];
  return config ? config.variables : [];
};

/**
 * 验证模板字符串中的变量是否属于指定的通知类型
 */
export const validateTemplateVariablesForType = (
  template: string,
  type: NotificationType
): { valid: boolean; invalidVars: string[] } => {
  const variables = getNotificationVariables(type);
  const allowedKeys = variables.map((v) => v.key);
  const allowedSet = new Set(allowedKeys);
  const regex = /\{\{(\w+)}}|\$\{(\w+)}/g;
  const invalidVars: string[] = [];
  let match;

  while ((match = regex.exec(template)) !== null) {
    const varName = match[1] || match[2];
    if (!allowedSet.has(varName)) {
      invalidVars.push(varName);
    }
  }

  return {
    valid: invalidVars.length === 0,
    invalidVars
  };
};

/**
 * 提取模板中的所有变量
 */
export const extractTemplateVariables = (template: string): string[] => {
  const regex = /\{\{(\w+)}}|\$\{(\w+)}/g;
  const vars: string[] = [];
  let match;

  while ((match = regex.exec(template)) !== null) {
    const varName = match[1] || match[2];
    if (!vars.includes(varName)) {
      vars.push(varName);
    }
  }

  return vars;
};
