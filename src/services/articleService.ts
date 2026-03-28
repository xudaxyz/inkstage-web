import { apiClient,  API_ENDPOINTS } from '../api';
import type { ApiResponse, ApiPageResponse } from '../types/common.ts';
import type {
    Article,
    IndexArticleList,
    MyArticleList,
    MyArticleCollectionList,
    BannerArticle,
    LatestArticle,
    ArticleDetailInfo,
    AdminArticleList,
    AdminArticleDetail,
    UpdatedAdminArticleFields
} from '../types/article.ts';
import {
  ArticleStatusEnum,
  DefaultStatusEnum
} from '../types/enums';

// 前台首页文章列表响应类型
export type IndexArticleListResponse<T = IndexArticleList> = ApiPageResponse<T>;

// 后台文章列表响应类型
export type AdminArticleListResponse<T = AdminArticleList> = ApiPageResponse<T>;

// 参数验证函数
const validateArticleParams = (article: Partial<Article>): boolean => {
  if (!article.title || article.title.trim().length === 0) {
    throw new Error('文章标题不能为空');
  }
  if (article.title.length > 100) {
    throw new Error('文章标题不能超过100个字符');
  }
  if (!article.content || article.content.trim().length === 0) {
    throw new Error('文章内容不能为空');
  }
  if (!article.categoryId || article.categoryId <= 0) {
    throw new Error('请选择文章分类');
  }
  return true;
};

const validatePageParams = (params: { pageNum?: number; pageSize?: number }): boolean => {
  if (params.pageNum &&  params.pageNum < 1) {
    throw new Error('页码必须是大于0的数字');
  }
  if (params.pageSize && (params.pageSize < 1 || params.pageSize > 100)) {
    throw new Error('每页大小必须是1-100之间的数字');
  }
  return true;
};

const validateIdParam = (id: number): boolean => {
  if (id <= 0) {
    throw new Error('ID必须是大于0的数字');
  }
  return true;
};

// 文章 API 服务
const articleService = {
  // 创建文章
  createArticle: async (article: Omit<Article, 'createdTime' | 'updatedTime'>): Promise<ApiResponse<Article>> => {
    validateArticleParams(article);
    return await apiClient.post(API_ENDPOINTS.FRONT.ARTICLE.CREATE, article);
  },

  // 更新文章
  updateArticle: async (id: number, article: Partial<Article>): Promise<ApiResponse<Article>> => {
    validateIdParam(id);
    if (article.title || article.content || article.categoryId) {
      validateArticleParams(article);
    }
    return await apiClient.put(API_ENDPOINTS.FRONT.ARTICLE.UPDATE(id), article);
  },

  // 保存草稿
  saveDraft: async (article: Omit<Article, 'createdTime' | 'updatedTime'>): Promise<ApiResponse<Article>> => {
    validateArticleParams(article);
    const draftArticle = {
      ...article,
      status: ArticleStatusEnum.DRAFT
    };

    if (article.id) {
      validateIdParam(Number(article.id));
      return await apiClient.put(API_ENDPOINTS.FRONT.ARTICLE.SAVE_DRAFT(Number(article.id)), draftArticle);
    } else {
      // 创建新文章时，移除可能存在的 id 属性
      const { ...newArticle } = draftArticle;
      return await articleService.createArticle(newArticle);
    }
  },

  // 删除文章
  deleteArticle: async (id: number): Promise<ApiResponse<void>> => {
    validateIdParam(id);
    return await apiClient.post(API_ENDPOINTS.FRONT.ARTICLE.DELETE(id));
  },

  // 上传图片
  uploadImage: async (file: File): Promise<ApiResponse<string>> => {
    const formData = new FormData();
    formData.append('file', file as File);

    return await apiClient.post(API_ENDPOINTS.COMMON.UPLOAD.ARTICLE_COVER_IMG, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },

  // 获取文章列表
  getArticles: async (query: {
        pageNum?: number;
        pageSize?: number;
        categoryId?: number;
        keyword?: string;
        sortBy?: string;
        sortOrder?: string
    } = {}): Promise<ApiResponse<IndexArticleListResponse>> => {
    validatePageParams(query);
    const queryDTO = {
      pageNum: query.pageNum || 1,
      pageSize: query.pageSize || 10,
      offset: ((query.pageNum || 1) - 1) * (query.pageSize || 10),
      categoryId: query.categoryId,
      keyword: query.keyword,
      sortBy: query.sortBy || 'publishTime',
      sortOrder: query.sortOrder || 'desc'
    };
    return await apiClient.post(API_ENDPOINTS.FRONT.INDEX.LIST, queryDTO);
  },

  // 获取轮播图文章
  getBannerArticles: async (limit: number = 3): Promise<ApiResponse<BannerArticle[]>> => {
    if (limit < 1 || limit > 10) {
      throw new Error('limit必须是1-10之间的数字');
    }
    return await apiClient.get(API_ENDPOINTS.FRONT.INDEX.BANNER, { params: { limit } });
  },

  // 获取最新文章
  getLatestArticles: async (limit: number = 5): Promise<ApiResponse<LatestArticle[]>> => {
    if (limit < 1 || limit > 20) {
      throw new Error('limit必须是1-20之间的数字');
    }
    return await apiClient.get(API_ENDPOINTS.FRONT.INDEX.LATEST_ARTICLES, { params: { limit } });
  },

  // 获取文章详情
  getArticleDetail: async (id: number): Promise<ApiResponse<ArticleDetailInfo>> => {
    validateIdParam(id);
    return await apiClient.get(API_ENDPOINTS.FRONT.ARTICLE.DETAIL(id));
  },

  // 获取用户文章列表
  getUserArticles: async (userId: number, pageNum: number = 1, pageSize: number = 10): Promise<ApiResponse<IndexArticleListResponse>> => {
    validateIdParam(userId);
    validatePageParams({ pageNum: pageNum, pageSize: pageSize });
    return await apiClient.get(API_ENDPOINTS.FRONT.ARTICLE.USER_ARTICLES(userId), { params: { pageNum, pageSize } });
  },

  // 获取作者相关文章
  getUserRelatedArticles: async (userId: number, excludeArticleId: number, limit: number = 3): Promise<ApiResponse<IndexArticleList[]>> => {
    validateIdParam(userId);
    validateIdParam(excludeArticleId);
    if (limit < 1 || limit > 10) {
      throw new Error('limit必须是1-10之间的数字');
    }
    return await apiClient.get(API_ENDPOINTS.FRONT.ARTICLE.USER_RELATED, { params: { userId, excludeArticleId, limit } });
  },

  // 点赞文章
  likeArticle: async (articleId: number): Promise<ApiResponse<boolean>> => {
    validateIdParam(articleId);
    return await apiClient.post(API_ENDPOINTS.FRONT.ARTICLE.LIKE(articleId));
  },

  // 取消点赞
  unlikeArticle: async (articleId: number): Promise<ApiResponse<boolean>> => {
    validateIdParam(articleId);
    return await apiClient.delete(API_ENDPOINTS.FRONT.ARTICLE.UNLIKE(articleId));
  },

  // 检查点赞状态
  checkLikeStatus: async (articleId: number): Promise<ApiResponse<boolean>> => {
    validateIdParam(articleId);
    return await apiClient.get(API_ENDPOINTS.FRONT.ARTICLE.LIKE_STATUS(articleId));
  },

  // 收藏文章
  collectArticle: async (params: { articleId: number; folderId?: number; folderName?: string; folderDescription?: string }): Promise<ApiResponse<boolean>> => {
    if (!params || typeof params !== 'object') {
      throw new Error('参数必须是对象');
    }
    validateIdParam(params.articleId);
    if (params.folderId) {
      validateIdParam(params.folderId);
    }
    if (params.folderName && params.folderName.length > 50) {
      throw new Error('文件夹名称不能超过50个字符');
    }
    return await apiClient.post(API_ENDPOINTS.FRONT.ARTICLE.COLLECT, params);
  },

  // 取消收藏
  unCollectArticle: async (articleId: number): Promise<ApiResponse<boolean>> => {
    validateIdParam(articleId);
    return await apiClient.post(API_ENDPOINTS.FRONT.ARTICLE.UN_COLLECT(articleId));
  },

  // 检查收藏状态
  checkCollectStatus: async (articleId: number): Promise<ApiResponse<boolean>> => {
    validateIdParam(articleId);
    return await apiClient.get(API_ENDPOINTS.FRONT.ARTICLE.COLLECT_STATUS(articleId));
  },

  // 增加文章阅读量
  incrementReadCount: async (articleId: number): Promise<ApiResponse<number>> => {
    validateIdParam(articleId);
    return await apiClient.post(API_ENDPOINTS.FRONT.ARTICLE.INCREMENT_READ(articleId));
  },

  // 获取当前用户文章列表
  getMyArticles: async (params: {
        articleStatus: ArticleStatusEnum;
        keyword?: string;
        pageNum?: number;
        pageSize?: number;
    }): Promise<ApiResponse<IndexArticleListResponse<MyArticleList>>> => {
    if (!params || typeof params !== 'object') {
      throw new Error('参数必须是对象');
    }
    if (!params.articleStatus) {
      throw new Error('文章状态不能为空');
    }
    validatePageParams({ pageNum: params.pageNum, pageSize: params.pageSize });
    return await apiClient.get(API_ENDPOINTS.FRONT.ARTICLE.MY_ARTICLES, { params });
  },

  // 获取当前用户收藏文章列表
  getMyCollections: async (params: {
        folderId?: number;
        keyword?: string;
        pageNum?: number;
        pageSize?: number;
        sortBy?: string;
        sortOrder?: string;
    }): Promise<ApiResponse<IndexArticleListResponse<MyArticleCollectionList>>> => {
    validatePageParams({ pageNum: params.pageNum, pageSize: params.pageSize });
    if (params.folderId) {
      validateIdParam(params.folderId);
    }
    return await apiClient.get(API_ENDPOINTS.FRONT.ARTICLE.COLLECTIONS.LIST, { params });
  },

  // 获取用户的收藏文件夹列表
  getCollectionFolders: async (): Promise<ApiResponse<Array<{
        id: number;
        name: string;
        articleCount: number;
        defaultFolder: DefaultStatusEnum | string;
    }>>> => {
    return await apiClient.get(API_ENDPOINTS.FRONT.ARTICLE.COLLECTIONS.FOLDERS);
  },

  // 获取用户的总收藏数
  getTotalCollectionCount: async (): Promise<ApiResponse<number>> => {
    return await apiClient.get(API_ENDPOINTS.FRONT.ARTICLE.COLLECTIONS.TOTAL);
  },

  // 移动收藏文章到其他文件夹
  moveCollectionArticle: async (articleId: number, targetFolderId: number): Promise<ApiResponse<boolean>> => {
    validateIdParam(articleId);
    validateIdParam(targetFolderId);
    return await apiClient.put(API_ENDPOINTS.FRONT.ARTICLE.COLLECTIONS.MOVE, { articleId, folderId: targetFolderId });
  },

  // 创建收藏文件夹
  createCollectionFolder: async (params: { folderName: string; folderDescription?: string }): Promise<ApiResponse<number>> => {
    if (!params || typeof params !== 'object') {
      throw new Error('参数必须是对象');
    }
    if (!params.folderName || params.folderName.trim().length === 0) {
      throw new Error('文件夹名称不能为空');
    }
    if (params.folderName.length > 50) {
      throw new Error('文件夹名称不能超过50个字符');
    }
    if (params.folderDescription && params.folderDescription.length > 200) {
      throw new Error('文件夹描述不能超过200个字符');
    }
    return await apiClient.post(API_ENDPOINTS.FRONT.ARTICLE.COLLECTIONS.CREATE_FOLDER, params);
  },

  // 更新收藏文件夹
  updateCollectionFolder: async (folderId: number, name: string, description?: string): Promise<ApiResponse<boolean>> => {
    validateIdParam(folderId);
    if (!name || name.trim().length === 0) {
      throw new Error('文件夹名称不能为空');
    }
    if (name.length > 50) {
      throw new Error('文件夹名称不能超过50个字符');
    }
    if (description && description.length > 200) {
      throw new Error('文件夹描述不能超过200个字符');
    }
    return await apiClient.put(API_ENDPOINTS.FRONT.ARTICLE.COLLECTIONS.UPDATE_FOLDER(folderId), { name, description });
  },

  // 删除收藏文件夹
  deleteCollectionFolder: async (folderId: number): Promise<ApiResponse<boolean>> => {
    validateIdParam(folderId);
    return await apiClient.delete(API_ENDPOINTS.FRONT.ARTICLE.COLLECTIONS.DELETE_FOLDER(folderId));
  },

  // 彻底删除文章
  permanentDeleteArticle: async (id: number): Promise<ApiResponse<boolean>> => {
    validateIdParam(id);
    return await apiClient.delete(API_ENDPOINTS.FRONT.ARTICLE.PERMANENT_DELETE(id));
  },

  // 管理员相关方法
    admin: {
      // 分页获取文章列表
      getArticlesByPage: async (params: {
              pageNum?: number;
              pageSize?: number;
              keyword?: string;
              categoryId?: number;
              articleStatus?: ArticleStatusEnum | null;
          } = {}): Promise<ApiResponse<AdminArticleListResponse>> => {
        validatePageParams(params);
        if (params.categoryId) {
          validateIdParam(params.categoryId);
        }
        const requestBody = {
          pageNum: params.pageNum || 1,
          pageSize: params.pageSize || 10,
          keyword: params.keyword || '',
          categoryId: params.categoryId || 0,
          articleStatus: params.articleStatus || null
        };
        return await apiClient.post(API_ENDPOINTS.ADMIN.ARTICLE.LIST_PAGE, requestBody);
      },

    // 获取文章详情
    getArticleById: async (id: number): Promise<ApiResponse<AdminArticleDetail>> => {
      validateIdParam(id);
      return await apiClient.get(API_ENDPOINTS.ADMIN.ARTICLE.GET(id));
    },

    // 删除文章
    deleteArticle: async (id: number): Promise<ApiResponse<boolean>> => {
      validateIdParam(id);
      return await apiClient.delete(API_ENDPOINTS.ADMIN.ARTICLE.DELETE(id));
    },

    // 更新文章状态
    updateArticleStatus: async (id: number, articleStatus: ArticleStatusEnum): Promise<ApiResponse<Article>> => {
      validateIdParam(id);
      return await apiClient.put(API_ENDPOINTS.ADMIN.ARTICLE.UPDATE_STATUS(id), null, { params: { articleStatus } });
    },

    // 审核通过文章
    approveArticle: async (id: number): Promise<ApiResponse<boolean>> => {
      validateIdParam(id);
      return await apiClient.put(API_ENDPOINTS.ADMIN.ARTICLE.APPROVE(id));
    },

    // 审核拒绝文章
    rejectArticle: async (id: number, reason: string): Promise<ApiResponse<boolean>> => {
      validateIdParam(id);
      if (!reason || reason.trim().length === 0) {
        throw new Error('拒绝原因不能为空');
      }
      return await apiClient.put(API_ENDPOINTS.ADMIN.ARTICLE.REJECT(id), { reason });
    },

    // 重新审核文章
    reprocessArticle: async (id: number): Promise<ApiResponse<boolean>> => {
      validateIdParam(id);
      return await apiClient.put(API_ENDPOINTS.ADMIN.ARTICLE.REPROCESS(id));
    },

    // 置顶文章
    topArticle: async (id: number): Promise<ApiResponse<boolean>> => {
      validateIdParam(id);
      return await apiClient.put(API_ENDPOINTS.ADMIN.ARTICLE.TOP(id));
    },

    // 取消置顶文章
    cancelTopArticle: async (id: number): Promise<ApiResponse<boolean>> => {
      validateIdParam(id);
      return await apiClient.put(API_ENDPOINTS.ADMIN.ARTICLE.CANCEL_TOP(id));
    },

    // 推荐文章
    recommendArticle: async (id: number): Promise<ApiResponse<boolean>> => {
      validateIdParam(id);
      return await apiClient.put(API_ENDPOINTS.ADMIN.ARTICLE.RECOMMEND(id));
    },

    // 取消推荐文章
    cancelRecommendArticle: async (id: number): Promise<ApiResponse<boolean>> => {
      validateIdParam(id);
      return await apiClient.put(API_ENDPOINTS.ADMIN.ARTICLE.CANCEL_RECOMMEND(id));
    },

    // 更新文章
    updateArticle: async (id: number, article: UpdatedAdminArticleFields): Promise<ApiResponse<boolean>> => {
      validateIdParam(id);
      return await apiClient.put(API_ENDPOINTS.ADMIN.ARTICLE.UPDATE(id), article);
    }
  }
};

export default articleService;
