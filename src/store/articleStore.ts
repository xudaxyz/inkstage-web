import { create } from 'zustand';
import articleService from '../services/articleService';
import type { ArticleDetailInfo } from '../types/article';

// 文章状态接口
export interface ArticleState {
    article: ArticleDetailInfo | null;
    loading: boolean;
    error: string | null;
    relatedArticles: Array<{ id: number; title: string; publishTime: string }>;
    relatedArticlesLoading: boolean;
    likeLoading: boolean;
    collectLoading: boolean;

    // 操作方法
    fetchArticleDetail: (id: number) => Promise<void>;
    fetchRelatedArticles: (userId: number, articleId: number) => Promise<void>;
    incrementReadCount: (articleId: number) => Promise<void>;
    likeArticle: (articleId: number) => Promise<void>;
    unLikeArticle: (articleId: number) => Promise<void>;
    collectArticle: (articleId: number) => Promise<void>;
    unCollectArticle: (articleId: number) => Promise<void>;
    updateCommentCount: (count: number) => void;
    reset: () => void;
}

// 创建文章状态 Store
export const useArticleStore = create<ArticleState>((set, get) => ({
  article: null,
  loading: false,
  error: null,
  relatedArticles: [],
  relatedArticlesLoading: false,
  likeLoading: false,
  collectLoading: false,

  // 获取文章详情
  fetchArticleDetail: async (id: number): Promise<void> => {
    set({ loading: true, error: null });
    try {
      const response = await articleService.getArticleDetail(id);
      if (response.code !== 200) {
        set({ error: response.message || '文章详情加载失败', loading: false });
        return;
      }
      set({ article: response.data, loading: false });
    } catch (error) {
      set({ error: '文章详情加载失败', loading: false });
      console.error('获取文章详情失败:', error);
    }
  },

  // 获取作者相关文章
  fetchRelatedArticles: async (userId: number, articleId: number): Promise<void> => {
    set({ relatedArticlesLoading: true });
    try {
      const response = await articleService.getUserRelatedArticles(userId, articleId);
      if (response.code === 200 && response.data) {
        set({
          relatedArticles: response.data.map((item) => ({
            id: item.id,
            title: item.title,
            publishTime: item.publishTime
          })),
          relatedArticlesLoading: false
        });
      }
    } catch (error) {
      console.error('获取作者相关文章失败:', error);
      set({ relatedArticlesLoading: false });
    }
  },

  // 增加文章阅读量
  incrementReadCount: async (articleId: number): Promise<void> => {
    try {
      await articleService.incrementReadCount(articleId);
    } catch (error) {
      console.error('增加阅读量失败:', error);
    }
  },

  // 点赞文章
  likeArticle: async (articleId: number): Promise<void> => {
    const article = get().article;
    if (!article) return;

    // 乐观更新
    set({ likeLoading: true });
    set((state) => ({
      article: state.article ? {
        ...state.article,
        isLiked: true,
        likeCount: (state.article.likeCount || 0) + 1
      } : null
    }));

    try {
      const response = await articleService.likeArticle(articleId);
      if (response.code !== 200) {
        // 请求失败，回滚状态
        set((state) => ({
          article: state.article ? {
            ...state.article,
            isLiked: false,
            likeCount: Math.max(0, (state.article.likeCount || 0) - 1)
          } : null
        }));
      }
    } catch (error) {
      // 错误处理，回滚状态
      set((state) => ({
        article: state.article ? {
          ...state.article,
          isLiked: false,
          likeCount: Math.max(0, (state.article.likeCount || 0) - 1)
        } : null
      }));
      console.error('点赞操作失败:', error);
    } finally {
      set({ likeLoading: false });
    }
  },

  // 取消点赞
  unLikeArticle: async (articleId: number): Promise<void> => {
    const article = get().article;
    if (!article) return;

    // 乐观更新
    set({ likeLoading: true });
    set((state) => ({
      article: state.article ? {
        ...state.article,
        isLiked: false,
        likeCount: Math.max(0, (state.article.likeCount || 0) - 1)
      } : null
    }));

    try {
      const response = await articleService.unlikeArticle(articleId);
      if (response.code !== 200) {
        // 请求失败，回滚状态
        set((state) => ({
          article: state.article ? {
            ...state.article,
            isLiked: true,
            likeCount: (state.article.likeCount || 0) + 1
          } : null
        }));
      }
    } catch (error) {
      // 错误处理，回滚状态
      set((state) => ({
        article: state.article ? {
          ...state.article,
          isLiked: true,
          likeCount: (state.article.likeCount || 0) + 1
        } : null
      }));
      console.error('取消点赞操作失败:', error);
    } finally {
      set({ likeLoading: false });
    }
  },

  // 收藏文章
  collectArticle: async (articleId: number): Promise<void> => {
    const article = get().article;
    if (!article) return;

    // 乐观更新
    set({ collectLoading: true });
    set((state) => ({
      article: state.article ? {
        ...state.article,
        isCollected: true,
        collectionCount: (state.article.collectionCount || 0) + 1
      } : null
    }));

    try {
      const response = await articleService.collectArticle({ articleId });
      if (response.code !== 200) {
        // 请求失败，回滚状态
        set((state) => ({
          article: state.article ? {
            ...state.article,
            isCollected: false,
            collectionCount: Math.max(0, (state.article.collectionCount || 0) - 1)
          } : null
        }));
      }
    } catch (error) {
      // 错误处理，回滚状态
      set((state) => ({
        article: state.article ? {
          ...state.article,
          isCollected: false,
          collectionCount: Math.max(0, (state.article.collectionCount || 0) - 1)
        } : null
      }));
      console.error('收藏操作失败:', error);
    } finally {
      set({ collectLoading: false });
    }
  },

  // 取消收藏
  unCollectArticle: async (articleId: number): Promise<void> => {
    const article = get().article;
    if (!article) return;

    // 乐观更新
    set({ collectLoading: true });
    set((state) => ({
      article: state.article ? {
        ...state.article,
        isCollected: false,
        collectionCount: Math.max(0, (state.article.collectionCount || 0) - 1)
      } : null
    }));

    try {
      const response = await articleService.unCollectArticle(articleId);
      if (response.code !== 200) {
        // 请求失败，回滚状态
        set((state) => ({
          article: state.article ? {
            ...state.article,
            isCollected: true,
            collectionCount: (state.article.collectionCount || 0) + 1
          } : null
        }));
      }
    } catch (error) {
      // 错误处理，回滚状态
      set((state) => ({
        article: state.article ? {
          ...state.article,
          isCollected: true,
          collectionCount: (state.article.collectionCount || 0) + 1
        } : null
      }));
      console.error('取消收藏操作失败:', error);
    } finally {
      set({ collectLoading: false });
    }
  },

  // 更新评论数
  updateCommentCount: (count: number): void => {
    set((state) => ({
      article: state.article ? {
        ...state.article,
        commentCount: count
      } : null
    }));
  },

  // 重置状态
  reset: (): void => {
    set({
      article: null,
      loading: false,
      error: null,
      relatedArticles: [],
      relatedArticlesLoading: false,
      likeLoading: false,
      collectLoading: false
    });
  }
}));

// 导出文章状态的具体选择器，减少不必要的重渲染
export const useArticle = () : ArticleDetailInfo | null => useArticleStore((state) => state.article);
export const useArticleLoading = () : boolean => useArticleStore((state) => state.loading);
export const useArticleError = () : string | null => useArticleStore((state) => state.error);
export const useRelatedArticles = (): ArticleState['relatedArticles'] => useArticleStore((state) => state.relatedArticles);
export const useRelatedArticlesLoading = () : boolean => useArticleStore((state) => state.relatedArticlesLoading);
export const useLikeLoading = () : boolean => useArticleStore((state) => state.likeLoading);
export const useCollectLoading = () : boolean => useArticleStore((state) => state.collectLoading);
export const useArticleId = () : number | undefined => useArticleStore((state) => state.article?.id);
export const useArticleTitle = () : string | undefined => useArticleStore((state) => state.article?.title);
export const useArticleContent = () : string | undefined => useArticleStore((state) => state.article?.content);
export const useArticleStats = (): { likeCount: number; commentCount: number; collectionCount: number; readCount: number; isLiked: boolean; isCollected: boolean } => useArticleStore((state) => ({
  likeCount: state.article?.likeCount || 0,
  commentCount: state.article?.commentCount || 0,
  collectionCount: state.article?.collectionCount || 0,
  readCount: state.article?.readCount || 0,
  isLiked: state.article?.isLiked || false,
  isCollected: state.article?.isCollected || false
}));

// 导出store实例，用于在非React组件中访问
export const articleStore = useArticleStore;
