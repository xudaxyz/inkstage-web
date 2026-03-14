// 性别枚举，对应后端 GenderEnum

export const GenderEnum = {
  UNKNOWN: 'UNKNOWN',
  MALE: 'MALE',
  FEMALE: 'FEMALE',
  SECRET: 'SECRET'
} as const;

export type GenderEnum = typeof GenderEnum[keyof typeof GenderEnum];

// 性别枚举名称映射（对应后端序列化值）
export const GenderName: Record<GenderEnum, string> = {
  [GenderEnum.UNKNOWN]: 'UNKNOWN',
  [GenderEnum.MALE]: 'MALE',
  [GenderEnum.FEMALE]: 'FEMALE',
  [GenderEnum.SECRET]: 'SECRET'
};

// 性别枚举显示文本映射
export const GenderLabel: Record<GenderEnum, string> = {
  [GenderEnum.UNKNOWN]: '未知',
  [GenderEnum.MALE]: '男',
  [GenderEnum.FEMALE]: '女',
  [GenderEnum.SECRET]: '保密'
};

// 获取性别枚举的显示文本
export function getGenderLabel (gender: GenderEnum): string {
  return GenderLabel[gender] || '未知';
}

