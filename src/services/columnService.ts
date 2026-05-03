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
  ArticleColumn
} from '../types/column';
import type { ApiResponse } from '../types/common';
import type { PageResult } from '../types/user';

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
   * 获取热门专栏
   */
  async getHotColumns(limit: number = 10): Promise<ApiResponse<ColumnListVO[]>> {
    return await apiClient.get(API_ENDPOINTS.FRONT.COLUMN.HOT, { params: { limit } });
  },

  /**
   * 获取我的专栏
   */
  async getMyColumns(): Promise<ApiResponse<MyColumnVO[]>> {
    return await apiClient.get(API_ENDPOINTS.FRONT.COLUMN.MY);
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
   * 更新专栏中文章的排序
   */
  async updateArticleSort(data: UpdateColumnArticleSortDTO): Promise<ApiResponse<boolean>> {
    return await apiClient.put(API_ENDPOINTS.FRONT.COLUMN.ARTICLE_SORT, data);
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
  }
};

export default columnService;
