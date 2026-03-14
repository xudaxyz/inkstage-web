import { apiClient, API_ENDPOINTS } from '../api';
import { type UserRoleEnum, type UserStatusEnum } from '../types/enums';
import type { ApiResponse } from '../types/common';
import type {
  UserInfo,
  AdminUser,
  AdminUserQuery,
  PageResult
} from '../types/user';

// 参数验证函数
const validateIdParam = (id: number): void => {
  if (id == null || id <= 0) {
    throw new Error('ID必须是正整数');
  }
};

const validateAdminUserQuery = (params: AdminUserQuery): void => {
  if (params.pageNum == null || params.pageNum <= 0) {
    throw new Error('页码必须是正整数');
  }
  if (params.pageSize == null || params.pageSize <= 0) {
    throw new Error('每页数量必须是正整数');
  }
};

// 获取用户公开资料
export const getUserPublicProfile = async (userId: number): Promise<UserInfo> => {
  validateIdParam(userId);
  return await apiClient.get(API_ENDPOINTS.FRONT.USER.PUBLIC_PROFILE(userId));
};

// 获取当前用户资料
export const getCurrentUserProfile = async (): Promise<UserInfo> => {
  return await apiClient.get(API_ENDPOINTS.FRONT.USER.PROFILE);
};

// 更新用户资料
export const updateUserProfile = async (userData: Partial<UserInfo>): Promise<UserInfo> => {
  return await apiClient.put(API_ENDPOINTS.FRONT.USER.PROFILE, userData);
};

// 后台用户管理相关方法
const admin = {
  // 分页获取用户列表
  getUsersByPage: async (params: AdminUserQuery): Promise<ApiResponse<PageResult<AdminUser>>> => {
    validateAdminUserQuery(params);
    return await apiClient.post(API_ENDPOINTS.ADMIN.USER.LIST, params);
  },

  // 根据ID获取用户
  getUserById: async (id: number): Promise<ApiResponse<AdminUser>> => {
    validateIdParam(id);
    return await apiClient.get(API_ENDPOINTS.ADMIN.USER.DETAIL(id));
  },

  // 删除用户
  deleteUser: async (id: number): Promise<ApiResponse<void>> => {
    validateIdParam(id);
    return await apiClient.delete(API_ENDPOINTS.ADMIN.USER.DELETE(id));
  },

  // 更新用户信息
  updateUser: async (id: number, userData: Partial<AdminUser>): Promise<ApiResponse<AdminUser>> => {
    validateIdParam(id);
    return await apiClient.put(API_ENDPOINTS.ADMIN.USER.UPDATE(id), userData);
  },

  // 更新用户状态
  updateUserStatus: async (id: number, userStatus: UserStatusEnum): Promise<ApiResponse<AdminUser>> => {
    validateIdParam(id);
    return await apiClient.put(API_ENDPOINTS.ADMIN.USER.UPDATE_STATUS(id), userStatus);
  },

  // 更新用户角色
  updateUserRole: async (id: number, userRole: UserRoleEnum): Promise<ApiResponse<AdminUser>> => {
    validateIdParam(id);
    return await apiClient.put(API_ENDPOINTS.ADMIN.USER.UPDATE_ROLE(id), userRole);
  }
};

export default {
  getUserPublicProfile,
  getCurrentUserProfile,
  updateUserProfile,
  admin
};
