import { StatusEnum } from './enums';
import type { ApiPageResponse } from './common.ts';

// 前台分类接口
export interface FrontendCategory {
    id: number;
    name: string;
    slug?: string;
    description?: string;
    articleCount?: number;
    status?: StatusEnum;
}

// 后台分类接口
export interface AdminCategory {
    id: number;
    name: string;
    slug: string;
    parentId?: number;
    sortOrder?: number;
    description: string;
    articleCount: number;
    status: StatusEnum;
    createTime?: string;
    updateTime?: string;
}

// 分类分页响应接口
export type CategoryPageResponse = ApiPageResponse<AdminCategory>;
