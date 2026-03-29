// 从各模块导入状态管理
import { useUserStore, useUser, useIsLoggedIn, useIsLoading, useAccessTokenExpiresAt, useUserId, useUserRole, useUserInfo } from './userStore';
import type { UserState } from './userStore';
import { useAppStore, useTheme, useAppLoading } from './appStore';
import type { AppState } from './appStore';
import useCommentStore, { useComments, useCommentCount, useSortBy, useCommentLoading, useCommentPage, useIsSubmitting } from './CommentStore';
import { useArticleStore, useArticle, useArticleLoading, useArticleError, useRelatedArticles, useRelatedArticlesLoading, useLikeLoading, useCollectLoading, useArticleId, useArticleTitle, useArticleContent, useArticleStats } from './articleStore';
import type { ArticleState } from './articleStore';
import { useNotificationStore, useUnreadCount, useNotifications, useNotificationLoading, useNotificationError, useMarkAsRead, useMarkAllAsRead, useDeleteNotification, useSetUnreadCount, useSetNotifications, useFetchUnreadCount } from './notificationStore';
import type { NotificationState } from './notificationStore';

// 组合所有状态的根状态类型
export type RootState = UserState & AppState & ArticleState & NotificationState;

// 导出所有状态管理相关内容
export {
  useUserStore, useUser, useIsLoggedIn, useIsLoading, useAccessTokenExpiresAt, useUserId, useUserRole, useUserInfo,
  useAppStore, useTheme, useAppLoading,
  useCommentStore, useComments, useCommentCount, useSortBy, useCommentLoading, useCommentPage, useIsSubmitting,
  useArticleStore, useArticle, useArticleLoading, useArticleError, useRelatedArticles, useRelatedArticlesLoading, useLikeLoading, useCollectLoading, useArticleId, useArticleTitle, useArticleContent, useArticleStats,
  useNotificationStore, useUnreadCount, useNotifications, useNotificationLoading, useNotificationError, useMarkAsRead, useMarkAllAsRead, useDeleteNotification, useSetUnreadCount, useSetNotifications, useFetchUnreadCount
};

// 保持向后兼容性，导出一个组合的 useStore（可选）
export const useStore = {
  ...useUserStore,
  ...useAppStore,
  ...useCommentStore,
  ...useArticleStore,
  ...useNotificationStore
};
