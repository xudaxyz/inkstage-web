import type { ApiPageResponse } from './common';

// 阅读历史类型定义
export interface ReadingHistory {
    id: string;
    articleId: string;
    title: string;
    summary: string;
    coverImage?: string;
    userId: string;
    nickname: string;
    avatar: string;
    progress: number;
    duration: number;
    lastReadTime: string;
    scrollPosition: number;
    readTime: string;
    readDate: string;
}

// 阅读历史请求参数类型
export interface ReadingHistoryRequest {
    articleId: string;
    progress: number;
    duration: number;
    scrollPosition: number;
}

// 阅读历史响应类型
export type ReadingHistoryResponse = ApiPageResponse<ReadingHistory>;
