// 用户认证类型枚举，对应后端 AuthTypeEnum

export const AuthTypeEnum = {
    USERNAME: 'USERNAME',
    EMAIL: 'EMAIL',
    PHONE: 'PHONE',
    GITHUB: 'GITHUB',
    QQ: 'QQ',
    WECHAT: 'WECHAT',
    OTHER: 'OTHER'
} as const;

export type AuthTypeEnum = typeof AuthTypeEnum[keyof typeof AuthTypeEnum];

export const AuthTypeEnumLabel: Record<AuthTypeEnum, string> = {
    [AuthTypeEnum.USERNAME]: '用户名密码认证',
    [AuthTypeEnum.EMAIL]: '邮箱认证',
    [AuthTypeEnum.PHONE]: '手机号认证',
    [AuthTypeEnum.GITHUB]: 'GitHub认证',
    [AuthTypeEnum.QQ]: 'QQ认证',
    [AuthTypeEnum.WECHAT]: '微信认证',
    [AuthTypeEnum.OTHER]: '其他'
};

export function getAuthTypeEnumByName (name: string): AuthTypeEnum {
    return Object.values(AuthTypeEnum).find((value) => value === name) as AuthTypeEnum || AuthTypeEnum.USERNAME;
}

// 获取用户角色枚举的显示文本
export function getAuthTypeEnumLabel (role: AuthTypeEnum): string {
    return AuthTypeEnumLabel[role] || AuthTypeEnum.OTHER;
}
