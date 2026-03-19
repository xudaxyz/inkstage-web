import type { FrontTag } from './tag.ts';
import {
    ArticleStatusEnum,
    ArticleReviewStatusEnum,
    ArticleOriginalEnum,
    ArticleVisibleEnum,
    AllowStatusEnum,
    GenderEnum,
    ArticleCollectionStatusEnum, type AllowTopEnum
} from './enums';

// 文章类型定义
export interface Article {
    id?: number;
    title: string;
    content: string;
    summary: string;
    contentHtml: string;
    categoryId: number;
    tags?: FrontTag[];
    coverImage?: string;
    status: ArticleStatusEnum;
    reviewStatus?: ArticleReviewStatusEnum;
    visible: ArticleVisibleEnum;
    allowComment: AllowStatusEnum;
    allowForward: AllowStatusEnum;
    original: ArticleOriginalEnum;
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
    id: number;
    title: string;
    summary: string;
    coverImage: string;
    avatar: string;
    nickname: string;
    userId: number;
    readCount: number;
    likeCount: number;
    commentCount: number;
    publishTime: string;
}

// 我的文章列表项类型
export interface MyArticleList {
    id: number;
    title: string;
    summary: string;
    userId: number;
    readCount: number;
    likeCount: number;
    commentCount: number;
    publishTime: string;
    articleStatus: ArticleStatusEnum;
    reviewStatus: ArticleReviewStatusEnum;
    visible: ArticleVisibleEnum;
    original: ArticleOriginalEnum;
}

// 我的文章收藏列表项类型
export interface MyArticleCollectionList {
    collectionId: number; // 收藏id
    articleId: number; // 文章id
    title: string;
    summary: string;
    coverImage: string;
    userId: number;
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
    folderId: number;
    folderName: string;
}

// 轮播图文章类型
export interface BannerArticle {
    id: number;
    title: string;
    summary: string;
    coverImage: string;
}

// 最新文章类型
export interface LatestArticle {
    id: number;
    title: string;
    publishTime: string;
}

// 前台文章详情类型
export interface ArticleDetailInfo {
    id: number;
    title: string;
    content: string;
    contentHtml: string;
    summary: string;
    coverImage: string;
    allowComment: AllowStatusEnum;
    allowForward: AllowStatusEnum;
    visible: ArticleVisibleEnum;
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
    userId: number;
    nickname: string;
    avatar: string;
    signature: string;
    gender: GenderEnum;
    articleCount: number;
    followerCount: number;
    categoryId: number;
    categoryName: string;
    tags: FrontTag[]
}


// 热门文章类型
export interface HotArticle {
    id: number;
    title: string;
    nickname: string;
    userId: number;
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
    id: number;
    title: string;
    nickname: string;
    categoryName: string;
    articleStatus: ArticleStatusEnum;
    publishTime: string;
    readCount: number;
    likeCount: number;
    commentCount: number;
    top: string;
    reviewStatus: ArticleReviewStatusEnum;
    createTime: string;
    updateTime: string;
}

// 后台文章详情类型
export interface AdminArticleDetail {
    id: number;
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
    userId: number;
    nickname: string;
    // 分类
    categoryId: number;
    categoryName: string;
    // 标签
    tags: FrontTag[]
}

