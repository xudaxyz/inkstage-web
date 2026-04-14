// 默认状态枚举, 与后端 DefaultStatus 枚举对应
export const DefaultStatusEnum = {
  YES: 'YES',
  NO: 'NO'
} as const;

// 是否已验证枚举
export const VerificationStatusEnum = {
  UNVERIFIED: 'UNVERIFIED',
  VERIFIED: 'VERIFIED'
} as const;

export type DefaultStatusEnum = (typeof DefaultStatusEnum)[keyof typeof DefaultStatusEnum];
export type VerificationStatusEnum = (typeof VerificationStatusEnum)[keyof typeof VerificationStatusEnum];

// 默认状态描述映射
export const DefaultStatusMap = {
  [DefaultStatusEnum.YES]: '是',
  [DefaultStatusEnum.NO]: '否'
};

// 是否已验证枚举描述映射
export const VerificationStatusMap = {
  [VerificationStatusEnum.UNVERIFIED]: '未验证',
  [VerificationStatusEnum.VERIFIED]: '已验证'
};

// 获取默认状态描述
export function getDefaultStatusText(status: DefaultStatusEnum): string {
  return DefaultStatusMap[status] || '未知';
}
