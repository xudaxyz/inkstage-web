import type { StatusEnum, VisibleStatus } from './enums';
import type { ApiPageResponse } from './common';

// 专栏列表VO
export interface ColumnListVO {
  id: string;
  name: string;
  slug?: string;
  description: string;
  coverImage: string;
  articleCount: number;
  subscriptionCount: number;
  readCount: number;
  sortOrder?: number;
  status: StatusEnum;
  visible?: VisibleStatus;
  userId: number;
  nickname: string;
  avatar: string;
  createTime: string;
  updateTime: string;
}

// 专栏详情VO
export interface ColumnDetailVO {
  id: string;
  name: string;
  slug?: string;
  description: string;
  coverImage: string;
  articleCount: number;
  subscriptionCount: number;
  readCount: number;
  sortOrder?: number;
  status: StatusEnum;
  visible?: VisibleStatus;
  userId: string;
  nickname: string;
  avatar: string;
  signature?: string;
  createTime: string;
  updateTime: string;
}

// 我的专栏VO
export interface MyColumnVO {
  id: string;
  name: string;
  slug?: string;
  description: string;
  coverImage: string;
  articleCount: number;
  subscriptionCount: number;
  readCount: number;
  sortOrder?: number;
  status: StatusEnum;
  visible?: VisibleStatus;
  createTime: string;
  updateTime: string;
}

// 我的订阅专栏VO
export interface MyColumnSubscriptionVO {
  id: string;
  name: string;
  slug?: string;
  description: string;
  coverImage: string;
  articleCount: number;
  subscriptionCount: number;
  readCount: number;
  sortOrder?: number;
  status: StatusEnum;
  visible?: VisibleStatus;
  nickname: string;
  avatar: string;
  subscriptionTime: string;
}

// 创建/更新专栏DTO
export interface ColumnCreateDTO {
  name: string;
  slug?: string;
  description?: string;
  coverImage?: string;
  sortOrder?: number;
}

// 专栏查询DTO
export interface ColumnQueryDTO {
  keyword?: string;
  userId?: string;
  pageNum?: number;
  pageSize?: number;
}

// 添加文章到专栏DTO
export interface AddArticleToColumnDTO {
  columnId: string;
  articleId: string;
  sortOrder?: number;
}

// 更新文章排序DTO
export interface UpdateColumnArticleSortDTO {
  columnId: string;
  articleId: string;
  sortOrder: number;
}

// 文章专栏关联
export interface ArticleColumn {
  id: string;
  articleId: string;
  columnId: string;
  sortOrder: number;
  createTime: string;
  updateTime: string;
}

// 专栏内文章上下篇VO
export interface NeighborArticleVO {
  id: string;
  title: string;
}

// 专栏文章上下篇结果VO
export interface ColumnNeighborVO {
  columnId: string;
  columnName: string;
  prev: NeighborArticleVO | null;
  next: NeighborArticleVO | null;
}

// 我的专栏订阅分页响应接口
export type MyColumnSubscriptionPageResponse = ApiPageResponse<MyColumnSubscriptionVO>;
