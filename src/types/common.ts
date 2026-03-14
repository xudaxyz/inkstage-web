// API响应基础类型
export interface ApiResponse<T = unknown> {
    code: number;
    message: string;
    data: T;
}

// API分页响应基础类型
export interface ApiPageResponse<T> {
    record: T[];
    total: number;
    size: number;
    current: number;
    pages: number;
}
