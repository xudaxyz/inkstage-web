import { API_ENDPOINTS, apiClient } from '../api';
import type { ApiResponse } from '../types/common';
import type {
  AdminNotificationTemplate,
  AdminNotificationTemplateResponse,
  ManualNotification,
  NotificationTemplate,
  TemplatePreview
} from '../types/notificationTemplate';
import type { NotificationType, StatusEnum } from '../types/enums';
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

const validateTemplateCode = (code: string): void => {
  if (!code || code.trim() === '') {
    throw new Error('模板编码不能为空');
  }
};

// 通知模板服务
const notificationTemplateService = {
  // 创建通知模板
  createTemplate: async (template: NotificationTemplate): Promise<ApiResponse<number>> => {
    return await apiClient.post(API_ENDPOINTS.ADMIN.NOTIFICATION_TEMPLATE.CREATE, template);
  },

  // 更新通知模板
  updateTemplate: async (id: number, template: NotificationTemplate): Promise<ApiResponse<boolean>> => {
    validateIdParam(id);
    return await apiClient.put(API_ENDPOINTS.ADMIN.NOTIFICATION_TEMPLATE.UPDATE(id), template);
  },

  // 删除通知模板
  deleteTemplate: async (id: number): Promise<ApiResponse<boolean>> => {
    validateIdParam(id);
    return await apiClient.delete(API_ENDPOINTS.ADMIN.NOTIFICATION_TEMPLATE.DELETE(id));
  },

  // 获取模板详情
  getTemplateById: async (id: number): Promise<ApiResponse<AdminNotificationTemplate>> => {
    validateIdParam(id);
    return await apiClient.get(API_ENDPOINTS.ADMIN.NOTIFICATION_TEMPLATE.DETAIL(id));
  },

  // 根据编码获取模板
  getTemplateByCode: async (code: string): Promise<ApiResponse<AdminNotificationTemplate>> => {
    validateTemplateCode(code);
    return await apiClient.get(API_ENDPOINTS.ADMIN.NOTIFICATION_TEMPLATE.DETAIL_BY_CODE(code));
  },

  // 分页查询模板列表
  getTemplatePage: async (
    pageNum: number = 1,
    pageSize: number = 10,
    notificationType?: NotificationType,
    status?: StatusEnum,
    keyword?: string
  ): Promise<ApiResponse<AdminNotificationTemplateResponse>> => {
    validatePageParams(pageNum, pageSize);
    const params = { pageNum, pageSize, notificationType, status, keyword };
    return await apiClient.get(API_ENDPOINTS.ADMIN.NOTIFICATION_TEMPLATE.LIST, { params });
  },

  // 获取所有模板
  getAllTemplates: async (): Promise<ApiResponse<AdminNotificationTemplate[]>> => {
    return await apiClient.get(API_ENDPOINTS.ADMIN.NOTIFICATION_TEMPLATE.ALL);
  },

  // 启用模板
  enableTemplate: async (id: number): Promise<ApiResponse<boolean>> => {
    validateIdParam(id);
    return await apiClient.put(API_ENDPOINTS.ADMIN.NOTIFICATION_TEMPLATE.ENABLE(id));
  },

  // 禁用模板
  disableTemplate: async (id: number): Promise<ApiResponse<boolean>> => {
    validateIdParam(id);
    return await apiClient.put(API_ENDPOINTS.ADMIN.NOTIFICATION_TEMPLATE.DISABLE(id));
  },

  // 检查编码是否存在
  checkCodeExists: async (code: string): Promise<ApiResponse<boolean>> => {
    validateTemplateCode(code);
    return await apiClient.get(API_ENDPOINTS.ADMIN.NOTIFICATION_TEMPLATE.CHECK_CODE, { params: { code } });
  },

  // 预览模板渲染效果
  previewTemplate: async (code: string, variables: Record<string, object>): Promise<ApiResponse<TemplatePreview>> => {
    validateTemplateCode(code);
    return await apiClient.post(API_ENDPOINTS.ADMIN.NOTIFICATION_TEMPLATE.PREVIEW(code), variables);
  },

  // 手动发送通知
  sendNotification: async (data: ManualNotification): Promise<ApiResponse<number>> => {
    return await apiClient.post(API_ENDPOINTS.ADMIN.NOTIFICATION_TEMPLATE.SEND, data);
  }
};

export default notificationTemplateService;
