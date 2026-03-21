// API响应基础类型
export interface ApiResponse<T = unknown> {
    code: number;
    message: string;
    data: T;
}

// API分页响应基础类型
export interface ApiPageResponse<T> {
    record: T[];
    total: number; // 总记录数
    pageNum: number; // 当前页码
    pageSize: number; // 每页条数
    pages: number; // 总页数
    isFirstPage: boolean; // 是否为首页
    isLastPage: boolean; // 是否为末页
    prePage: number; // 前一页页码
    nextPage: number; // 后一页页码
}
