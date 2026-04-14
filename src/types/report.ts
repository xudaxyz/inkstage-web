import type {
  DefaultStatusEnum,
  HandleReportResultEnum,
  ReportStatusEnum,
  ReportTargetTypeEnum,
  ReportTypeEnum
} from './enums';

// 举报创建DTO
export interface ReportCreateDTO {
  /**
   * 被举报对象类型
   */
  reportedType: ReportTargetTypeEnum;

  /**
   * 被举报对象ID
   */
  reportedId: number;

  /**
   * 关联id
   */
  relatedId: number;

  /**
   * 被举报对象用户名
   */
  reportedName?: string;

  /**
   * 举报类型
   */
  reportType: ReportTypeEnum;

  /**
   * 举报理由
   */
  reason: string;

  /**
   * 举报证据(JSON格式, 包含图片、视频等链接)
   */
  evidence?: string;

  /**
   * 是否匿名举报(0:否,1:是)
   */
  anonymous?: DefaultStatusEnum;
}

// 举报列表项
export interface FrontReport {
  id: number;
  reportedType: ReportTargetTypeEnum;
  relatedId: number; // 关联id
  reportedId: number; // 被举报对象ID
  reportedName: string; // 被举报对象名字
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
