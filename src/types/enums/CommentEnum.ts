export const CommentStatusEnum = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  APPEALING: 'APPEALING',
  DISABLED: 'DISABLED'
} as const;

export const CommentTopStatus = {
  NOT_TOP: 'NOT_TOP',
  TOP: 'TOP'
} as const;

export type CommentStatusEnum = typeof CommentStatusEnum[keyof typeof CommentStatusEnum];
export type CommentTopStatus = typeof CommentTopStatus[keyof typeof CommentTopStatus];

// 枚举映射（用于UI显示）
export const CommentStatusMap = {
  [CommentStatusEnum.PENDING]: '待审核',
  [CommentStatusEnum.APPROVED]: '已通过',
  [CommentStatusEnum.REJECTED]: '已驳回',
  [CommentStatusEnum.APPEALING]: '申诉中',
  [CommentStatusEnum.DISABLED]: '禁用'
};

export const CommentTopMap = {
  [CommentTopStatus.NOT_TOP]: '未置顶',
  [CommentTopStatus.TOP]: '置顶'
};


