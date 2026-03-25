// 通知渠道枚举
export const NotificationChannel = {
    SITE: 'SITE',        // 系统内置
    EMAIL: 'EMAIL',          // 邮件
    SMS: 'SMS',              // 短信
    PUSH: 'PUSH'            // 推送通知
} as const;

export type NotificationChannel = typeof NotificationChannel[keyof typeof NotificationChannel];

// 通知渠道描述映射
export const NotificationChannelMap: Record<NotificationChannel, string> = {
    [NotificationChannel.SITE]: '系统内置',
    [NotificationChannel.EMAIL]: '邮件',
    [NotificationChannel.SMS]: '短信',
    [NotificationChannel.PUSH]: '推送通知'
};

