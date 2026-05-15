import type {
  DefaultStatusEnum,
  HandleReportResultEnum,
  ReportStatusEnum,
  ReportTargetTypeEnum,
  ReportTypeEnum
} from './enums';
import type { ApiPageResponse } from './common';

// 举报创建DTO
export interface ReportCreateDTO {
  reportedType: ReportTargetTypeEnum; // 被举报对象类型
  reportedId: string;
  reportedName: string;
  relatedId: string;
  reportedContent: string;
  reportType: ReportTypeEnum;
  reason: string;
  evidence?: string; // 举报证据(JSON格式, 包含图片、视频等链接)
  anonymous?: DefaultStatusEnum; // 是否匿名举报(0:否,1:是)
}

// 举报列表项
export interface FrontReport {
  id: string;
  reportedType: ReportTargetTypeEnum;
  reportedId: string;
  reportedName: string;
  relatedId: string;
  reportedContent: string; // 被举报内容
  reportType: ReportTypeEnum; // 举报类型
  reason: string; // 举报理由
  evidence: string; // 举报证据
  anonymous: DefaultStatusEnum; // 是否匿名举报
  reportStatus: ReportStatusEnum;
  createTime: string;
  handleTime?: string;
  handlerName?: string;
  handleResult?: HandleReportResultEnum;
}

export interface AdminReportVO {
  id: string;
  reporterId: string;
  reporterName: string;
  reportedType: ReportTargetTypeEnum;
  reportedId: string;
  reportedName: string;
  relatedId: string;
  reportedContent: string;
  reportType: ReportTypeEnum;
  reason: string;
  evidence: string;
  anonymous: DefaultStatusEnum;
  reportStatus: ReportStatusEnum;
  handleResult: HandleReportResultEnum;
  handleReason: string;
  handlerId: string | null;
  handlerName: string;
  handleTime: string;
  createTime: string;
  updateTime: string;
}

export type AdminReportResponse = ApiPageResponse<AdminReportVO>;
