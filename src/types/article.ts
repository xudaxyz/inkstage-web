import type { FrontTag } from './tag';
import {
  AllowStatusEnum,
  AllowTopEnum,
  ArticleCollectionStatusEnum,
  ArticleOriginalEnum,
  ArticleReviewStatusEnum,
  ArticleStatusEnum,
  ArticleVisibleEnum,
  GenderEnum,
  RecommendedEnum
} from './enums';

// 文章类型定义
export interface Article {
  id?: string;
  title: string;
  content: string;
  summary: string;
  contentHtml: string;
  categoryId: string;
  columnId?: string;
  tags?: FrontTag[];
  coverImage?: string;
  status: ArticleStatusEnum;
  reviewStatus?: ArticleReviewStatusEnum;
  visible: ArticleVisibleEnum;
  allowComment: AllowStatusEnum;
  allowForward: AllowStatusEnum;
  original: ArticleOriginalEnum;
  top: AllowTopEnum;
  originalUrl?: string;
  createdTime?: string;
  updatedTime?: string;
  publishTime?: string;
  readCount?: number;
  likeCount?: number;
  commentCount?: number;
  collectionCount?: number;
  shareCount?: number;
  lastEditTime?: string;
}

// 文章列表项类型
export interface IndexArticleList {
  id: string;
  title: string;
  summary: string;
  coverImage: string;
  avatar: string;
  nickname: string;
  userId: string;
  readCount: number;
  likeCount: number;
  commentCount: number;
  publishTime: string;
}

// 我的文章列表项类型
export interface MyArticleList {
  id: string;
  title: string;
  summary: string;
  userId: string;
  readCount: number;
  likeCount: number;
  commentCount: number;
  publishTime: string;
  articleStatus: ArticleStatusEnum;
  reviewStatus: ArticleReviewStatusEnum;
  visible: ArticleVisibleEnum;
  original: ArticleOriginalEnum;
  top: AllowTopEnum;
}

// 我的文章收藏列表项类型
export interface MyArticleCollectionList {
  collectionId: string;
  articleId: string;
  title: string;
  summary: string;
  coverImage: string;
  userId: string;
  nickname: string;
  avatar: string; // 作者头像
  categoryName: string;
  articleStatus: ArticleStatusEnum;
  originalStatus: ArticleOriginalEnum;
  publishTime: string;
  collectTime: string; // 收藏时间
  readCount: number;
  likeCount: number;
  commentCount: number;
  collectionStatus: ArticleCollectionStatusEnum;
  folderId: string;
  folderName: string;
}

// 专栏文章列表类型
export interface ColumnArticleListVO {
  id: string;
  title: string;
  summary: string;
  coverImage?: string;
  articleStatus?: ArticleStatusEnum;
  visible?: ArticleVisibleEnum;
  publishTime: string;
  lastEditTime?: string;
  readCount: number;
  likeCount: number;
  commentCount: number;
  userId: string;
  categoryId?: string;
  avatar: string;
  nickname: string;
  categoryName?: string;
  sortOrder?: number;
}

// 轮播图文章类型
export interface BannerArticle {
  id: string;
  title: string;
  summary: string;
  coverImage: string;
}

// 最新文章类型
export interface LatestArticle {
  id: string;
  title: string;
  publishTime: string;
}

// 前台文章详情类型
export interface ArticleDetailInfo {
  id: string;
  title: string;
  content: string;
  contentHtml: string;
  summary: string;
  coverImage: string;
  columnId?: string;
  allowComment: AllowStatusEnum;
  allowForward: AllowStatusEnum;
  visible: ArticleVisibleEnum;
  top: AllowTopEnum;
  original: ArticleOriginalEnum;
  originalUrl: string;
  publishTime: string;
  lastEditTime: string;
  readCount: number;
  likeCount: number;
  commentCount: number;
  collectionCount: number;
  shareCount: number;
  isLiked: boolean;
  isCollected: boolean;
  userId: string;
  nickname: string;
  avatar: string;
  signature: string;
  gender: GenderEnum;
  articleCount: number;
  followerCount: number;
  categoryId: string;
  categoryName: string;
  tags: FrontTag[];
}

// 热门文章类型
export interface HotArticle {
  id: string;
  title: string;
  nickname: string;
  userId: string;
  avatar: string;
  readCount: number;
  likeCount: number;
  commentCount: number;
  publishTime: string;
  categoryName: string;
  summary: string;
  coverImage?: string;
}

// 后台文章类型定义
export interface AdminArticleList {
  id: string;
  title: string;
  nickname: string;
  categoryName: string;
  articleStatus: ArticleStatusEnum;
  publishTime: string;
  readCount: number;
  likeCount: number;
  commentCount: number;
  top: AllowTopEnum;
  recommended: RecommendedEnum;
  reviewStatus: ArticleReviewStatusEnum;
  createTime: string;
  updateTime: string;
}

// 后台文章详情类型
export interface AdminArticleDetail {
  id: string;
  title: string;
  summary: string;
  content: string;
  contentHtml: string;
  coverImage: string;
  articleStatus: ArticleStatusEnum;
  reviewStatus: ArticleReviewStatusEnum;
  allowComment: AllowStatusEnum;
  allowForward: AllowStatusEnum;
  top: AllowTopEnum;
  recommended: RecommendedEnum;
  visible: ArticleVisibleEnum;
  original: ArticleOriginalEnum;
  originalUrl: string;
  createTime: string;
  publishTime: string;
  lastEditTime: string;
  readCount: number;
  likeCount: number;
  commentCount: number;
  collectionCount: number;
  shareCount: number;
  metaTitle: string;
  metaDescription: string;
  metaKeywords: string;
  // 用户
  userId: string;
  nickname: string;
  // 分类
  categoryId: string;
  categoryName: string;
  // 标签
  tags: FrontTag[];
}

// 后台更新文章字段类型
export interface UpdatedAdminArticleFields {
  title?: string;
  nickname?: string;
  categoryId?: string;
  tags?: FrontTag[];
  articleStatus?: ArticleStatusEnum;
  reviewStatus?: ArticleReviewStatusEnum;
  visible?: ArticleVisibleEnum;
  allowComment?: AllowStatusEnum;
  allowForward?: AllowStatusEnum;
  original?: ArticleOriginalEnum;
  originalUrl?: string;
  summary?: string;
  coverImage?: string;
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
  top?: AllowTopEnum;
  recommended?: RecommendedEnum;
  content?: string;
}
