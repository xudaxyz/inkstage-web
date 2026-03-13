// 用户角色枚举，对应后端 UserRoleEnum

export const UserRoleEnum = {
  SUPER_ADMIN: "SUPER_ADMIN",
  ADMIN: "ADMIN",
  USER: "USER",
} as const;

export type UserRoleEnum = typeof UserRoleEnum[keyof typeof UserRoleEnum];

// 用户角色枚举描述映射
export const UserRoleEnumLabel: Record<UserRoleEnum, string> = {
  [UserRoleEnum.SUPER_ADMIN]: '超级管理员',
  [UserRoleEnum.ADMIN]: '管理员',
  [UserRoleEnum.USER]: '普通用户',
};

// 从代码获取用户角色枚举
export function getUserRoleEnumByName(name: string): UserRoleEnum {
  return Object.values(UserRoleEnum).find((value) => value === name) as UserRoleEnum || UserRoleEnum.USER;
}

// 获取用户角色枚举的显示文本
export function getUserRoleEnumLabel(role: UserRoleEnum): string {
  return UserRoleEnumLabel[role] || '未知';
}
