// 状态枚举，对应后端 StatusEnum

export const StatusEnum = {
  DISABLED: 0,
  ENABLED: 1,
} as const;

export type StatusEnum = typeof StatusEnum[keyof typeof StatusEnum];

// 状态枚举描述映射
export const StatusEnumLabel: Record<StatusEnum, string> = {
  [StatusEnum.DISABLED]: '禁用',
  [StatusEnum.ENABLED]: '启用',
};

// 从代码获取状态枚举
export function getStatusEnumByCode(code: number): StatusEnum | undefined {
  return Object.values(StatusEnum).find((value) => value === code) as StatusEnum | undefined;
}

// 获取状态枚举的显示文本
export function getStatusEnumLabel(status: StatusEnum): string {
  return StatusEnumLabel[status] || '未知';
}
