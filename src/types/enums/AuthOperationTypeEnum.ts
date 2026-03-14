export const AuthOperationTypeEnum = {
  LOGIN: 'LOGIN', // 登录
  REGISTER: 'REGISTER' // 注册
} as const;

export type AuthOperationTypeEnum = typeof AuthOperationTypeEnum[keyof typeof AuthOperationTypeEnum];

// 状态枚举描述映射
export const AuthOperationTypeEnumLabel: Record<AuthOperationTypeEnum, string> = {
  [AuthOperationTypeEnum.LOGIN]: '登录',
  [AuthOperationTypeEnum.REGISTER]: '注册'
};
