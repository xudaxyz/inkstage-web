// 用户状态枚举，对应后端 UserStatus

export const UserStatusEnum = {
  DISABLED: 'DISABLED',
  NORMAL: 'NORMAL',
  PENDING: 'PENDING',
  PENDING_DELETE: 'PENDING_DELETE'
} as const;

export type UserStatusEnum = typeof UserStatusEnum[keyof typeof UserStatusEnum];

// 用户状态枚举描述映射
export const UserStatusEnumLabel: Record<UserStatusEnum, string> = {
  [UserStatusEnum.DISABLED]: '禁用',
  [UserStatusEnum.NORMAL]: '正常',
  [UserStatusEnum.PENDING]: '待审核',
  [UserStatusEnum.PENDING_DELETE]: '待删除'
};

// 从代码获取用户状态枚举
export function getUserStatusEnumByName (name: string): UserStatusEnum {
  return Object.values(UserStatusEnum).find((value) => value === name) as UserStatusEnum || UserStatusEnum.NORMAL;
}

// 获取用户状态枚举的显示文本
export function getUserStatusEnumLabel (status: UserStatusEnum): string {
  return UserStatusEnumLabel[status] || '未知';
}
