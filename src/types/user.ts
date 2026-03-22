import {
    type ArticleStatusEnum,
    type GenderEnum,
    type UserRoleEnum,
    type UserStatusEnum,
    type VerificationStatusEnum
} from './enums';
import type { ApiPageResponse } from './common';
import type { CommentStatusEnum } from './enums';

// 用户信息类型定义
export interface UserInfo {
    id: number;
    username: string;
    nickname: string;
    email: string;
    avatar: string;
    coverImage: string;
    signature: string;
    gender: GenderEnum;
    birthDate?: string;
    location?: string;
    articleCount: number;
    likeCount: number;
    commentCount: number;
    followerCount: number;
    followCount: number;
    registerTime: string;
}

// 后台用户管理相关类型
export interface AdminUserArticle {
    id: number;
    title: string;
    summary: string;
    articleStatus: ArticleStatusEnum;
    reviewStatus: string;
    publishTime: string;
    readCount: number;
    commentCount: number;
    likeCount: number;
}

export interface AdminUserComment {
    id: number;
    articleId: number;
    articleTitle: string;
    content: string;
    status: CommentStatusEnum;
    top: string;
    likeCount: number;
    replyCount: number;
    createTime: string;
}

export interface AdminUser {
    id: number;
    username: string;
    nickname: string;
    email: string;
    phone: string;
    userRole: UserRoleEnum;
    userStatus: UserStatusEnum;
    registerTime: string;
    usernameLastModifiedTime?: string;
    lastLoginTime: string;
    articleCount?: number;
    commentCount?: number;
    emailVerified: VerificationStatusEnum;
    phoneVerified: VerificationStatusEnum;
    avatar?: string;
    coverImage?: string;
    signature?: string;
    gender: GenderEnum;
    location?: string;
    website?: string;
    followCount?: number;
    followerCount?: number;
    likeCount?: number;
    lastLoginIp?: string;
    registerIp?: string;
    privacy?: string;
    recentArticles?: AdminUserArticle[];
    recentComments?: AdminUserComment[];
}

// 分页请求参数
export interface AdminUserQuery {
    pageNum: number;
    pageSize: number;
    keyword?: string;
    userRole?: UserRoleEnum;
    userStatus?: UserStatusEnum;
    startDate?: string;
    endDate?: string;
}

// 分页响应结果
export type PageResult<T> = ApiPageResponse<T>;

// 热门用户类型
export interface HotUser {
  id: number;
  nickname: string;
  avatar: string;
  articleCount: number;
  followerCount: number;
  likeCount: number;
}
