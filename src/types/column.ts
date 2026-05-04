import type { ColumnArticleListVO } from './article';
import type { StatusEnum } from './enums';

// 专栏列表VO
export interface ColumnListVO {
  id: number;
  name: string;
  slug?: string;
  description: string;
  coverImage: string;
  articleCount: number;
  subscriptionCount: number;
  readCount: number;
  sortOrder?: number;
  status: StatusEnum;
  userId: number;
  nickname: string;
  avatar: string;
  createTime: string;
  updateTime: string;
}

// 专栏详情VO
export interface ColumnDetailVO {
  id: number;
  name: string;
  slug?: string;
  description: string;
  coverImage: string;
  articleCount: number;
  subscriptionCount: number;
  readCount: number;
  sortOrder?: number;
  status: StatusEnum;
  userId: number;
  nickname: string;
  avatar: string;
  signature?: string;
  articles: ColumnArticleListVO[];
  createTime: string;
  updateTime: string;
}

// 我的专栏VO
export interface MyColumnVO {
  id: number;
  name: string;
  slug?: string;
  description: string;
  coverImage: string;
  articleCount: number;
  subscriptionCount: number;
  readCount: number;
  sortOrder?: number;
  status: StatusEnum;
  createTime: string;
  updateTime: string;
}

// 我的订阅专栏VO
export interface MyColumnSubscriptionVO {
  id: number;
  name: string;
  slug?: string;
  description: string;
  coverImage: string;
  articleCount: number;
  subscriptionCount: number;
  readCount: number;
  sortOrder?: number;
  status: StatusEnum;
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
  userId?: number;
  pageNum?: number;
  pageSize?: number;
}

// 添加文章到专栏DTO
export interface AddArticleToColumnDTO {
  columnId: number;
  articleId: number;
  sortOrder?: number;
}

// 更新文章排序DTO
export interface UpdateColumnArticleSortDTO {
  columnId: number;
  articleId: number;
  sortOrder: number;
}

// 文章专栏关联
export interface ArticleColumn {
  id: number;
  articleId: number;
  columnId: number;
  sortOrder: number;
  createTime: string;
  updateTime: string;
}
