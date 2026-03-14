import { StatusEnum } from './enums';
import type { ApiPageResponse } from './common';

// 前台标签接口
export interface FrontTag {
    id: number;
    name: string;
    slug: string;
    description: string;
    articleCount?: number;
    usageCount?: number;
    status: StatusEnum;
}

// 后台标签接口
export interface AdminTag {
    id: number;
    name: string;
    slug: string;
    description: string;
    articleCount: number;
    usageCount: number;
    status: StatusEnum;
    createTime?: string;
    updateTime?: string;
}

// 标签创建/更新参数
export type TagCreateUpdateParams = Omit<AdminTag, 'id' | 'articleCount' | 'usageCount' | 'createTime' | 'updateTime'>;

// 标签分页响应
export type TagPageResponse = ApiPageResponse<AdminTag>;
