import apiClient from '../api/apiClient';
import { API_ENDPOINTS } from '../api';
import type {
  ColumnListVO,
  ColumnDetailVO,
  MyColumnVO,
  ColumnCreateDTO,
  ColumnQueryDTO,
  AddArticleToColumnDTO,
  UpdateColumnArticleSortDTO,
  ArticleColumn,
  ColumnNeighborVO,
  MyColumnSubscriptionPageResponse
} from '../types/column';
import type { ColumnArticleListVO } from '../types/article';
import type { ApiResponse } from '../types/common';
import type { PageResult } from '../types/user';
import type { VisibleStatus } from '../types/enums';

// 专栏服务类
const columnService = {
  /**
   * 创建专栏
   */
  async createColumn(data: ColumnCreateDTO): Promise<ApiResponse<number>> {
    return await apiClient.post(API_ENDPOINTS.FRONT.COLUMN.CREATE, data);
  },

  /**
   * 更新专栏
   */
  async updateColumn(id: number, data: ColumnCreateDTO): Promise<ApiResponse<boolean>> {
    return await apiClient.put(API_ENDPOINTS.FRONT.COLUMN.UPDATE(id), data);
  },

  /**
   * 删除专栏
   */
  async deleteColumn(id: number): Promise<ApiResponse<boolean>> {
    return await apiClient.delete(API_ENDPOINTS.FRONT.COLUMN.DELETE(id));
  },

  /**
   * 获取专栏列表（分页）
   */
  async getColumns(params?: ColumnQueryDTO): Promise<ApiResponse<PageResult<ColumnListVO>>> {
    return await apiClient.get(API_ENDPOINTS.FRONT.COLUMN.LIST, { params });
  },

  /**
   * 获取专栏详情
   */
  async getColumnDetail(id: number): Promise<ApiResponse<ColumnDetailVO>> {
    return await apiClient.get(API_ENDPOINTS.FRONT.COLUMN.DETAIL(id));
  },

  /**
   * 获取专栏文章分页列表
   * @param id 专栏ID
   * @param pageNum 页码
   * @param pageSize 每页数量
   * @param sortBy 排序方式：ASC/DESC
   */
  async getColumnArticles(id: number, pageNum: number, pageSize: number, sortBy?: string): Promise<ApiResponse<PageResult<ColumnArticleListVO>>> {
    return await apiClient.get(API_ENDPOINTS.FRONT.COLUMN.DETAIL_ARTICLES(id), {
      params: { pageNum, pageSize, sortBy: sortBy || 'ASC' }
    });
  },

  /**
   * 搜索专栏内的文章
   * @param id 专栏ID
   * @param keyword 搜索关键词
   * @param pageNum 页码
   * @param pageSize 每页数量
   */
  async searchColumnArticles(id: number, keyword: string, pageNum: number, pageSize: number): Promise<ApiResponse<PageResult<ColumnArticleListVO>>> {
    return await apiClient.get(API_ENDPOINTS.FRONT.COLUMN.ARTICLE_SEARCH(id), {
      params: { keyword, pageNum, pageSize }
    });
  },

  /**
   * 获取热门专栏
   */
  async getHotColumns(limit: number = 10): Promise<ApiResponse<ColumnListVO[]>> {
    return await apiClient.get(API_ENDPOINTS.FRONT.COLUMN.HOT, { params: { limit } });
  },

  /**
   * 获取我的专栏（分页）
   * @param keyword 搜索关键词（可选）
   * @param pageNum 页码（默认1）
   * @param pageSize 每页数量（默认10）
   */
  async getMyColumns(keyword?: string, pageNum?: number, pageSize?: number): Promise<ApiResponse<PageResult<MyColumnVO>>> {
    return await apiClient.get(API_ENDPOINTS.FRONT.COLUMN.MY, {
      params: { keyword, pageNum: pageNum || 1, pageSize: pageSize || 10 }
    });
  },

  /**
   * 获取当前用户的专栏选项（仅ID和名称）
   * 用于创建文章时选择专栏
   */
  async getMyColumnOptions(): Promise<ApiResponse<{ id: number; name: string }[]>> {
    return await apiClient.get(API_ENDPOINTS.FRONT.COLUMN.MY_OPTIONS);
  },

  /**
   * 添加文章到专栏
   */
  async addArticleToColumn(data: AddArticleToColumnDTO): Promise<ApiResponse<boolean>> {
    return await apiClient.post(API_ENDPOINTS.FRONT.COLUMN.ARTICLE_ADD, data);
  },

  /**
   * 从专栏移除文章
   */
  async removeArticleFromColumn(columnId: number, articleId: number): Promise<ApiResponse<boolean>> {
    return await apiClient.delete(API_ENDPOINTS.FRONT.COLUMN.ARTICLE_REMOVE, { params: { columnId, articleId } });
  },

  /**
   * 删除专栏中的文章(移除并将文章移至回收站)
   */
  async deleteArticle(columnId: number, articleId: number): Promise<ApiResponse<boolean>> {
    return await apiClient.delete(API_ENDPOINTS.FRONT.COLUMN.ARTICLE_DELETE, { params: { columnId, articleId } });
  },

  /**
   * 更新专栏中文章的排序
   */
  async updateArticleSort(data: UpdateColumnArticleSortDTO): Promise<ApiResponse<boolean>> {
    return await apiClient.put(API_ENDPOINTS.FRONT.COLUMN.ARTICLE_SORT, data);
  },

  /**
   * 移动文章到另一个专栏
   */
  async moveArticleToColumn(articleId: number, newColumnId: number, sortOrder?: number): Promise<ApiResponse<boolean>> {
    return await apiClient.put(API_ENDPOINTS.FRONT.COLUMN.ARTICLE_MOVE, null, {
      params: { articleId, newColumnId, sortOrder }
    });
  },

  /**
   * 更新专栏可见性
   */
  async updateColumnVisible(id: number, visible: VisibleStatus): Promise<ApiResponse<boolean>> {
    return await apiClient.put(API_ENDPOINTS.FRONT.COLUMN.UPDATE_VISIBLE(id), null, {
      params: { visible }
    });
  },

  /**
   * 检查文章是否在指定专栏中
   */
  async checkArticleInColumn(columnId: number, articleId: number): Promise<ApiResponse<boolean>> {
    return await apiClient.get(API_ENDPOINTS.FRONT.COLUMN.ARTICLE_CHECK, { params: { columnId, articleId } });
  },

  /**
   * 获取文章所属的专栏信息
   */
  async getArticleColumn(articleId: number): Promise<ApiResponse<ArticleColumn>> {
    return await apiClient.get(API_ENDPOINTS.FRONT.COLUMN.ARTICLE_INFO, { params: { articleId } });
  },

  /**
   * 获取文章在专栏中的上下篇文章信息
   * @param articleId 文章ID
   */
  async getColumnNeighborArticles(articleId: number): Promise<ApiResponse<ColumnNeighborVO | null>> {
    return await apiClient.get(API_ENDPOINTS.FRONT.COLUMN.ARTICLE_NEIGHBOR, { params: { articleId } });
  },

  /**
   * 批量更新专栏文章排序
   * @param columnId 专栏ID
   * @param articleIds 按新顺序排列的文章ID列表
   */
  async batchUpdateColumnArticleSort(columnId: number, articleIds: number[]): Promise<ApiResponse<boolean>> {
    return await apiClient.put(API_ENDPOINTS.FRONT.COLUMN.ARTICLE_SORT_BATCH, articleIds, { params: { columnId } });
  },

  /**
   * 上传专栏封面图片
   */
  async uploadColumnCoverImage(file: File): Promise<ApiResponse<string>> {
    const formData = new FormData();
    formData.append('file', file as File);
    return await apiClient.post(API_ENDPOINTS.COMMON.UPLOAD.COLUMN_COVER_IMG, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },

  /**
   * 增加专栏阅读量
   */
  async incrementColumnReadCount(id: number): Promise<void> {
    await apiClient.post(API_ENDPOINTS.FRONT.COLUMN.DETAIL(id));
  },

  /**
   * 订阅专栏
   */
  async subscribeColumn(id: number): Promise<ApiResponse<boolean>> {
    return await apiClient.post(API_ENDPOINTS.FRONT.COLUMN.SUBSCRIBE(id));
  },

  /**
   * 取消订阅专栏
   */
  async unsubscribeColumn(id: number): Promise<ApiResponse<boolean>> {
    return await apiClient.delete(API_ENDPOINTS.FRONT.COLUMN.UNSUBSCRIBE(id));
  },

  /**
   * 检查订阅状态
   */
  async checkSubscribeStatus(id: number): Promise<ApiResponse<boolean>> {
    return await apiClient.get(API_ENDPOINTS.FRONT.COLUMN.SUBSCRIBE_STATUS(id));
  },

  /**
   * 获取我的订阅专栏列表（分页+搜索）
   * @param pageNum 页码（默认1）
   * @param pageSize 每页数量（默认20）
   * @param keyword 搜索关键词（可选）
   */
  async getMySubscriptions(pageNum?: number, pageSize?: number, keyword?: string): Promise<ApiResponse<MyColumnSubscriptionPageResponse>> {
    return await apiClient.get(API_ENDPOINTS.FRONT.COLUMN.MY_SUBSCRIPTIONS, {
      params: { pageNum: pageNum || 1, pageSize: pageSize || 20, keyword }
    });
  },

  /**
   * 获取专栏订阅数
   */
  async getSubscriberCount(id: number): Promise<ApiResponse<number>> {
    return await apiClient.get(API_ENDPOINTS.FRONT.COLUMN.SUBSCRIBER_COUNT(id));
  }
};

export default columnService;
