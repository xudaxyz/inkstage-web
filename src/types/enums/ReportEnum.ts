// 举报对象类型枚举
export const ReportTargetTypeEnum = {
  ARTICLE: 'ARTICLE',
  COMMENT: 'COMMENT',
  USER: 'USER',
  OTHER: 'OTHER'
} as const;

// 举报类型枚举
export const ReportTypeEnum = {
  PORNOGRAPHY: 'PORNOGRAPHY',
  VIOLENCE: 'VIOLENCE',
  POLITICAL: 'POLITICAL',
  ADVERTISING: 'ADVERTISING',
  PLAGIARISM: 'PLAGIARISM',
  SPAM: 'SPAM',
  ABUSE: 'ABUSE',
  FRAUD: 'FRAUD',
  ILLEGAL: 'ILLEGAL',
  OTHER: 'OTHER'
} as const;

// 举报状态枚举
export const ReportStatusEnum = {
  PENDING: 'PENDING',
  IN_PROGRESS: 'IN_PROGRESS',
  ACCEPTED: 'ACCEPTED',
  REJECTED: 'REJECTED',
  CLOSED: 'CLOSED'
} as const;

// 举报处理结果枚举
export const HandleReportResultEnum = {
  WARNING: 'WARNING',
  DELETE_CONTENT: 'DELETE_CONTENT',
  BAN_USER: 'BAN_USER',
  OTHER: 'OTHER'
} as const;

// 导出类型
export type ReportTargetTypeEnum = (typeof ReportTargetTypeEnum)[keyof typeof ReportTargetTypeEnum];
export type ReportTypeEnum = (typeof ReportTypeEnum)[keyof typeof ReportTypeEnum];
export type ReportStatusEnum = (typeof ReportStatusEnum)[keyof typeof ReportStatusEnum];
export type HandleReportResultEnum = (typeof HandleReportResultEnum)[keyof typeof HandleReportResultEnum];

// 枚举映射（用于UI显示）
export const ReportTargetTypeMap = {
  [ReportTargetTypeEnum.ARTICLE]: '文章',
  [ReportTargetTypeEnum.COMMENT]: '评论',
  [ReportTargetTypeEnum.USER]: '用户',
  [ReportTargetTypeEnum.OTHER]: '其他'
};

export const ReportTypeMap = {
  [ReportTypeEnum.PORNOGRAPHY]: '色情低俗',
  [ReportTypeEnum.VIOLENCE]: '暴力恐怖',
  [ReportTypeEnum.POLITICAL]: '政治敏感',
  [ReportTypeEnum.ADVERTISING]: '广告营销',
  [ReportTypeEnum.PLAGIARISM]: '抄袭侵权',
  [ReportTypeEnum.SPAM]: '垃圾内容',
  [ReportTypeEnum.ABUSE]: '骚扰辱骂',
  [ReportTypeEnum.FRAUD]: '欺诈虚假',
  [ReportTypeEnum.ILLEGAL]: '违法内容',
  [ReportTypeEnum.OTHER]: '其他'
};

export const ReportStatusMap = {
  [ReportStatusEnum.PENDING]: '待处理',
  [ReportStatusEnum.IN_PROGRESS]: '处理中',
  [ReportStatusEnum.ACCEPTED]: '已受理',
  [ReportStatusEnum.REJECTED]: '已驳回',
  [ReportStatusEnum.CLOSED]: '已关闭'
};

export const HandleReportResultMap = {
  [HandleReportResultEnum.WARNING]: '警告',
  [HandleReportResultEnum.DELETE_CONTENT]: '删除内容',
  [HandleReportResultEnum.BAN_USER]: '封禁账号',
  [HandleReportResultEnum.OTHER]: '其他'
};
