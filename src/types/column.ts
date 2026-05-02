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
