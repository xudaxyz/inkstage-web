import { apiClient, API_ENDPOINTS } from '../api';
import type { ApiResponse } from '../types/common';
import { StatusEnum } from '../types/enums';
import type {
  Tag,
  AdminTag,
  TagCreateUpdateParams,
  TagPageResponse
} from '../types/tag';

// 参数验证函数
const validateIdParam = (id: number): void => {
  if (id == null || id <= 0) {
    throw new Error('ID必须是正整数');
  }
};

const validatePageParams = (pageNum: number, pageSize: number): void => {
  if (pageNum <= 0) {
    throw new Error('页码必须是正整数');
  }
  if (pageSize <= 0) {
    throw new Error('每页数量必须是正整数');
  }
};

const validateTagParams = (tag: TagCreateUpdateParams): void => {
  if (!tag.name || tag.name.trim().length === 0) {
    throw new Error('标签名称不能为空');
  }
  if (!tag.slug || tag.slug.trim().length === 0) {
    throw new Error('标签slug不能为空');
  }
  if (!Object.values(StatusEnum).includes(tag.status)) {
    throw new Error('标签状态无效');
  }
};

// 标签服务
const tagService = {
  /**
     * 获取所有标签
     * @returns 标签列表
     */
  getAllTags: async (): Promise<ApiResponse<Tag[]>> => {
    return await apiClient.get(API_ENDPOINTS.FRONT.TAG.ALL);
  },

  /**
     * 获取激活状态的标签
     * @returns 激活状态的标签列表
     */
  getActiveTags: async (): Promise<ApiResponse<Tag[]>> => {
    return await apiClient.get(API_ENDPOINTS.FRONT.TAG.ACTIVE);
  },

  /**
     * 根据ID获取标签
     * @param id 标签ID
     * @returns 标签信息
     */
  getTagById: async (id: number): Promise<ApiResponse<Tag>> => {
    validateIdParam(id);
    return await apiClient.get(API_ENDPOINTS.FRONT.TAG.DETAIL(id));
  },

  /**
     * 根据文章ID获取标签
     * @param articleId 文章ID
     * @returns 标签列表
     */
  getTagsByArticleId: async (articleId: number): Promise<ApiResponse<Tag[]>> => {
    validateIdParam(articleId);
    return await apiClient.get(API_ENDPOINTS.FRONT.TAG.BY_ARTICLE(articleId));
  },

  // 管理员相关方法
  /**
     * 分页获取标签（管理员）
     * @param keyword 关键字
     * @param pageNum 页码
     * @param pageSize 每页大小
     * @returns 分页结果
     */
  adminGetTagsByPage: async (keyword: string, pageNum: number, pageSize: number): Promise<ApiResponse<TagPageResponse>> => {
    validatePageParams(pageNum, pageSize);
    return await apiClient.get(API_ENDPOINTS.ADMIN.TAG.LIST, {
      params: { keyword, pageNum, pageSize }
    });
  },

  /**
     * 添加标签
     * @param tag 标签信息
     * @returns 添加后的标签信息
     */
  adminAddTag: async (tag: TagCreateUpdateParams): Promise<ApiResponse<AdminTag>> => {
    validateTagParams(tag);
    return await apiClient.post(API_ENDPOINTS.ADMIN.TAG.CREATE, tag);
  },

  /**
     * 更新标签
     * @param id 标签ID
     * @param tag 标签信息
     * @returns 更新后的标签信息
     */
  adminUpdateTag: async (id: number, tag: TagCreateUpdateParams): Promise<ApiResponse<AdminTag>> => {
    validateIdParam(id);
    validateTagParams(tag);
    return await apiClient.put(API_ENDPOINTS.ADMIN.TAG.UPDATE(id), tag);
  },

  /**
     * 删除标签
     * @param id 标签ID
     * @returns 响应结果
     */
  adminDeleteTag: async (id: number): Promise<ApiResponse<void>> => {
    validateIdParam(id);
    return await apiClient.delete(API_ENDPOINTS.ADMIN.TAG.DELETE(id));
  },

  /**
     * 更新标签状态
     * @param id 标签ID
     * @param status 状态
     * @returns 更新后的标签信息
     */
  adminUpdateTagStatus: async (id: number, status: StatusEnum): Promise<ApiResponse<AdminTag>> => {
    validateIdParam(id);
    if (!Object.values(StatusEnum).includes(status)) {
      throw new Error('标签状态无效');
    }
    return await apiClient.put(API_ENDPOINTS.ADMIN.TAG.UPDATE_STATUS(id), null, {
      params: { status }
    });
  }

};

export default tagService;
