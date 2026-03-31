// 优先级枚举
export const PriorityEnum = {
  VERY_LOW: 'VERY_LOW', // 非常低
  LOW: 'LOW', // 低
  NORMAL: 'NORMAL', // 中
  HIGH_NORMAL: 'HIGH_NORMAL', // 较高
  HIGH: 'HIGH', // 高
  URGENT: 'URGENT' // 紧急
} as const;

export type PriorityEnum = (typeof PriorityEnum)[keyof typeof PriorityEnum];

// 优先级描述映射
export const PriorityMap: Record<PriorityEnum, string> = {
  [PriorityEnum.VERY_LOW]: '非常低',
  [PriorityEnum.LOW]: '低',
  [PriorityEnum.NORMAL]: '中',
  [PriorityEnum.HIGH_NORMAL]: '较高',
  [PriorityEnum.HIGH]: '高',
  [PriorityEnum.URGENT]: '紧急'
};
