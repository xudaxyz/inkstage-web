import { apiClient, API_ENDPOINTS } from '../api';
import type { ApiResponse } from '../types/common';
import type {
  FrontendCategory,
  AdminCategory,
  CategoryPageResponse
} from '../types/category';
import { StatusEnum } from '../types/enums';

// 参数验证函数
const validateIdParam = (id: number): boolean => {
  if (id <= 0) {
    throw new Error('ID必须是大于0的数字');
  }
  return true;
};

const validatePageParams = (pageNum: number, pageSize: number): boolean => {
  if (pageNum < 1) {
    throw new Error('页码必须是大于0的数字');
  }
  if (pageSize < 1 || pageSize > 100) {
    throw new Error('每页大小必须是1-100之间的数字');
  }
  return true;
};

const validateCategoryParams = (category: Omit<AdminCategory, 'id' | 'articleCount' | 'createTime' | 'updateTime'>): boolean => {
  if (!category || typeof category !== 'object') {
    throw new Error('参数必须是对象');
  }
  if (!category.name || category.name.trim().length === 0) {
    throw new Error('分类名称不能为空');
  }
  if (category.name.length > 50) {
    throw new Error('分类名称不能超过50个字符');
  }
  if (!category.slug || category.slug.trim().length === 0) {
    throw new Error('分类别名不能为空');
  }
  if (category.slug.length > 30) {
    throw new Error('分类别名不能超过30个字符');
  }
  if (category.description && category.description.length > 200) {
    throw new Error('分类描述不能超过200个字符');
  }
  if (category.parentId && category.parentId <= 0) {
    throw new Error('父分类ID必须是大于0的数字');
  }
  if (category.sortOrder && category.sortOrder < 0) {
    throw new Error('排序必须是大于等于0的数字');
  }
  if (!category.status || !Object.values(StatusEnum).includes(category.status)) {
    throw new Error('状态必须是有效的枚举值');
  }
  return true;
};

const validateStatusParam = (status: StatusEnum): boolean => {
  if (!status || !Object.values(StatusEnum).includes(status)) {
    throw new Error('状态必须是有效的枚举值');
  }
  return true;
};

// 分类服务
const categoryService = {
  /**
     * 获取所有分类
     * @returns 分类列表
     */
  getAllCategories: async (): Promise<ApiResponse<FrontendCategory[]>> => {
    return await apiClient.get(API_ENDPOINTS.FRONT.CATEGORY.ALL);
  },

  /**
     * 获取激活状态的分类
     * @returns 激活状态的分类列表
     */
  getActiveCategories: async (): Promise<ApiResponse<FrontendCategory[]>> => {
    return await apiClient.get(API_ENDPOINTS.FRONT.CATEGORY.ACTIVE);
  },

  /**
     * 根据ID获取分类
     * @param id 分类ID
     * @returns 分类信息
     */
  getCategoryById: async (id: number): Promise<ApiResponse<FrontendCategory>> => {
    validateIdParam(id);
    return await apiClient.get(API_ENDPOINTS.FRONT.CATEGORY.DETAIL(id));
  },

  // 管理员相关方法
  /**
     * 分页获取分类（管理员）
     * @param keyword 关键字
     * @param pageNum 页码
     * @param pageSize 每页大小
     * @returns 分页结果
     */
  adminGetCategoriesByPage: async (keyword: string, pageNum: number, pageSize: number): Promise<ApiResponse<CategoryPageResponse>> => {
    validatePageParams(pageNum, pageSize);
    return await apiClient.get(API_ENDPOINTS.ADMIN.CATEGORY.LIST, {
      params: { keyword, pageNum, pageSize }
    });
  },

  /**
     * 添加分类
     * @param category 分类信息
     * @returns 添加后的分类信息
     */
  adminAddCategory: async (category: Omit<AdminCategory, 'id' | 'articleCount' | 'createTime' | 'updateTime'>): Promise<ApiResponse<AdminCategory>> => {
    validateCategoryParams(category);
    return await apiClient.post(API_ENDPOINTS.ADMIN.CATEGORY.CREATE, category);
  },

  /**
     * 更新分类
     * @param id 分类ID
     * @param category 分类信息
     * @returns 更新后的分类信息
     */
  adminUpdateCategory: async (id: number, category: Omit<AdminCategory, 'id' | 'articleCount' | 'createTime' | 'updateTime'>): Promise<ApiResponse<AdminCategory>> => {
    validateIdParam(id);
    validateCategoryParams(category);
    return await apiClient.put(API_ENDPOINTS.ADMIN.CATEGORY.UPDATE(id), category);
  },

  /**
     * 删除分类
     * @param id 分类ID
     * @returns 响应结果
     */
  adminDeleteCategory: async (id: number): Promise<ApiResponse<void>> => {
    validateIdParam(id);
    return await apiClient.delete(API_ENDPOINTS.ADMIN.CATEGORY.DELETE(id));
  },

  /**
     * 更新分类状态
     * @param id 分类ID
     * @param status 状态
     * @returns 更新后的分类信息
     */
  adminUpdateCategoryStatus: async (id: number, status: StatusEnum): Promise<ApiResponse<AdminCategory>> => {
    validateIdParam(id);
    validateStatusParam(status);
    return await apiClient.put(API_ENDPOINTS.ADMIN.CATEGORY.UPDATE_STATUS(id), null, {
      params: { status }
    });
  }

};

export default categoryService;
