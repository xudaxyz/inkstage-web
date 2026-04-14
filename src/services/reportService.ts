import { API_ENDPOINTS, apiClient } from '../api';
import type { ApiResponse } from '../types/common.ts';
import type { FrontReport, ReportCreateDTO } from '../types/report.ts';
// 参数验证函数
const validateReportParams = (report: ReportCreateDTO): boolean => {
  if (!report.reportedType) {
    throw new Error('被举报对象类型不能为空');
  }
  if (!report.reportedId || report.reportedId <= 0) {
    throw new Error('被举报对象ID不能为空');
  }
  if (!report.reportType) {
    throw new Error('举报类型不能为空');
  }
  if (!report.reason || report.reason.trim().length === 0) {
    throw new Error('举报理由不能为空');
  }
  return true;
};

const validateIdParam = (id: number): boolean => {
  if (id <= 0) {
    throw new Error('ID必须是大于0的数字');
  }
  return true;
};

// 举报 API 服务
const reportService = {
  // 创建举报
  createReport: async (report: ReportCreateDTO): Promise<ApiResponse<number>> => {
    validateReportParams(report);
    return await apiClient.post(API_ENDPOINTS.FRONT.REPORT.CREATE, report);
  },

  // 获取举报详情
  getReportById: async (id: number): Promise<ApiResponse<FrontReport>> => {
    validateIdParam(id);
    return await apiClient.get(API_ENDPOINTS.FRONT.REPORT.DETAIL(id));
  },

  // 获取用户的举报列表
  getMyReportList: async (params: {
    reportStatus: string;
    pageNum?: number;
    pageSize?: number;
  }): Promise<ApiResponse<FrontReport>> => {
    if (!params.reportStatus) {
      throw new Error('举报状态不能为空');
    }
    if (params.pageNum && params.pageNum < 1) {
      throw new Error('页码必须是大于0的数字');
    }
    if (params.pageSize && (params.pageSize < 1 || params.pageSize > 100)) {
      throw new Error('每页大小必须是1-100之间的数字');
    }
    return await apiClient.get(API_ENDPOINTS.FRONT.REPORT.MY_REPORT, { params });
  }
};

export default reportService;
