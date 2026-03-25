// 优先级枚举
export const PriorityEnum = {
    LOW: 'LOW',    // 低
    NORMAL: 'NORMAL', // 中
    HIGH: 'HIGH',   // 高
    URGENT: 'URGENT'  // 紧急
} as const;

export type PriorityEnum = typeof PriorityEnum[keyof typeof PriorityEnum];

// 优先级描述映射
export const PriorityMap: Record<PriorityEnum, string> = {
    [PriorityEnum.LOW]: '低',
    [PriorityEnum.NORMAL]: '中',
    [PriorityEnum.HIGH]: '高',
    [PriorityEnum.URGENT]: '紧急'
};
