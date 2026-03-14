// 状态枚举，对应后端 StatusEnum

export const StatusEnum = {
  DISABLED: 'DISABLED',
  ENABLED: 'ENABLED'
} as const;

export type StatusEnum = typeof StatusEnum[keyof typeof StatusEnum];

// 状态枚举描述映射
export const StatusEnumLabel: Record<StatusEnum, string> = {
  [StatusEnum.DISABLED]: '禁用',
  [StatusEnum.ENABLED]: '启用'
};
