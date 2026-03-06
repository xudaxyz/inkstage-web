import {create} from 'zustand';
import articleService from '../services/articleService';
import type {ArticleDetailInfo} from '../services/articleService';

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
    fetchArticleDetail: async (id) => {
        set({loading: true, error: null});
        try {
            const response = await articleService.getArticleDetail(id);
            if (response.code !== 200) {
                set({error: response.message || '文章详情加载失败', loading: false});
                return;
            }
            set({article: response.data, loading: false});
        } catch (error) {
            set({error: '文章详情加载失败', loading: false});
            console.error('获取文章详情失败:', error);
        }
    },

    // 获取作者相关文章
    fetchRelatedArticles: async (userId, articleId) => {
        set({relatedArticlesLoading: true});
        try {
            const response = await articleService.getAuthorRelatedArticles(userId, articleId);
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
            set({relatedArticlesLoading: false});
        }
    },

    // 增加文章阅读量
    incrementReadCount: async (articleId) => {
        try {
            await articleService.incrementReadCount(articleId);
        } catch (error) {
            console.error('增加阅读量失败:', error);
        }
    },

    // 点赞文章
    likeArticle: async (articleId) => {
        const article = get().article;
        if (!article) return;

        // 乐观更新
        set({likeLoading: true});
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
            set({likeLoading: false});
        }
    },

    // 取消点赞
    unLikeArticle: async (articleId) => {
        const article = get().article;
        if (!article) return;

        // 乐观更新
        set({likeLoading: true});
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
            set({likeLoading: false});
        }
    },

    // 收藏文章
    collectArticle: async (articleId) => {
        const article = get().article;
        if (!article) return;

        // 乐观更新
        set({collectLoading: true});
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
            set({collectLoading: false});
        }
    },

    // 取消收藏
    unCollectArticle: async (articleId) => {
        const article = get().article;
        if (!article) return;

        // 乐观更新
        set({collectLoading: true});
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
            set({collectLoading: false});
        }
    },

    // 更新评论数
    updateCommentCount: (count) => {
        set((state) => ({
            article: state.article ? {
                ...state.article,
                commentCount: count
            } : null
        }));
    },

    // 重置状态
    reset: () => {
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

// 导出文章状态选择器
export const useArticle = () => {
    const store = useArticleStore();
    return {
        article: store.article,
        loading: store.loading,
        error: store.error,
        relatedArticles: store.relatedArticles,
        relatedArticlesLoading: store.relatedArticlesLoading,
        likeLoading: store.likeLoading,
        collectLoading: store.collectLoading,
        fetchArticleDetail: store.fetchArticleDetail,
        fetchRelatedArticles: store.fetchRelatedArticles,
        incrementReadCount: store.incrementReadCount,
        likeArticle: store.likeArticle,
        unLikeArticle: store.unLikeArticle,
        collectArticle: store.collectArticle,
        unCollectArticle: store.unCollectArticle,
        updateCommentCount: store.updateCommentCount,
        reset: store.reset
    };
};

// 导出store实例，用于在非React组件中访问
export const articleStore = useArticleStore;