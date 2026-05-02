export interface ColumnAuthor {
  id: number;
  nickname: string;
  avatar: string;
  bio?: string;
  followersCount: number;
}

export interface Column {
  id: number;
  name: string;
  description: string;
  coverImage: string;
  author: ColumnAuthor;
  articleCount: number;
  subscriberCount: number;
  createdAt: string;
  updatedAt: string;
  tags?: string[];
  isSubscribed?: boolean;
}

export interface ColumnArticle {
  id: number;
  title: string;
  summary: string;
  coverImage?: string;
  authorId: number;
  authorNickname: string;
  authorAvatar: string;
  columnId: number;
  columnName: string;
  likeCount: number;
  readCount: number;
  commentCount: number;
  publishTime: string;
  isLiked?: boolean;
}

export interface ColumnDetail extends Column {
  articles: ColumnArticle[];
  recentArticles: ColumnArticle[];
}

export interface ColumnListResponse {
  record: Column[];
  total: number;
  pageNum: number;
  pageSize: number;
  pages: number;
  isFirstPage: boolean;
  isLastPage: boolean;
  prePage: number;
  nextPage: number;
}

export interface ColumnDetailResponse {
  column: Column;
  articles: ColumnArticle[];
  recentArticles: ColumnArticle[];
}

export interface ColumnSubscribeRequest {
  columnId: number;
  subscribe: boolean;
}
