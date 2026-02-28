// 从各模块导入状态管理
import {useUserStore, useUser} from './userStore';
import type {UserState} from './userStore';
import {useAppStore, useApp} from './appStore';
import type {AppState} from './appStore';
import useCommentStore from './CommentStore';
import {useArticleStore, useArticle} from './articleStore';
import type {ArticleState} from './articleStore';

// 组合所有状态的根状态类型
export type RootState = UserState & AppState & ArticleState;

// 导出所有状态管理相关内容
export {useUserStore, useUser, useAppStore, useApp, useCommentStore, useArticleStore, useArticle};

// 保持向后兼容性，导出一个组合的 useStore（可选）
export const useStore = {
    ...useUserStore,
    ...useAppStore,
    ...useCommentStore,
    ...useArticleStore,
};
