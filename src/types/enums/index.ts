// 统一导出所有枚举类型和工具函数
export * from './StatusEnum';
export * from './UserRoleEnum';
export * from './UserStatusEnum';
export * from './GenderEnum';
export * from './ArticleEnum';
export * from './DefaultStatusEnum';
export * from './NotificationEnum';
export * from './NotificationChannelEnum';
export * from './AuthTypeEnum';
export * from './AuthOperationTypeEnum';
export * from './CommentEnum';
export * from './PriorityEnum';
export * from './ReportEnum';

// 通用枚举工具类型
export type EnumLike = Record<string, string | number>;
export type EnumValue<T extends EnumLike> = T[keyof T];

// 通用枚举工具函数

/**
 * 从代码值获取枚举值
 * @param enumObj 枚举对象
 * @param code 代码值
 * @returns 对应的枚举值或 undefined
 */
export function getEnumByCode<T extends EnumLike> (enumObj: T, code: number | string): EnumValue<T> | undefined {
  return Object.values(enumObj).find((value) => value === code) as EnumValue<T> | undefined;
}

/**
 * 获取枚举的所有值
 * @param enumObj 枚举对象
 * @returns 枚举值数组
 */
export function getEnumValues<T extends EnumLike> (enumObj: T): EnumValue<T>[] {
  return Object.values(enumObj) as EnumValue<T>[];
}

/**
 * 获取枚举的所有键
 * @param enumObj 枚举对象
 * @returns 枚举键数组
 */
export function getEnumKeys<T extends EnumLike> (enumObj: T): Array<keyof T> {
  return Object.keys(enumObj) as Array<keyof T>;
}

/**
 * 检查值是否为有效的枚举值
 * @param enumObj 枚举对象
 * @param value 要检查的值
 * @returns 是否为有效的枚举值
 */
export function isValidEnumValue<T extends EnumLike> (enumObj: T, value: unknown): value is EnumValue<T> {
  return Object.values(enumObj).includes(value as EnumValue<T>);
}
