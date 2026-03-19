// 文章状态枚举
export const ArticleStatusEnum = {
  ALL: 'ALL',
  DRAFT: 'DRAFT',
  PENDING_PUBLISH: 'PENDING_PUBLISH',
  PUBLISHED: 'PUBLISHED',
  OFFLINE: 'OFFLINE',
  RECYCLE: 'RECYCLE'
} as const;

// 文章审核状态枚举
export const ArticleReviewStatusEnum = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  APPEALING: 'APPEALING'
} as const;

// 文章原创性枚举
export const ArticleOriginalEnum = {
  ORIGINAL: 'ORIGINAL',
  REPRINT: 'REPRINT',
  OTHER: 'OTHER'
} as const;

// 文章可见性枚举
export const ArticleVisibleEnum = {
  PRIVATE: 'PRIVATE',
  PUBLIC: 'PUBLIC',
  FOLLOWERS_ONLY: 'FOLLOWERS_ONLY'
} as const;

// 文章收藏状态
export const ArticleCollectionStatusEnum = {
  PUBLIC: 'PUBLIC',
  PRIVATE: 'PRIVATE'
} as const;

// 是否允许
export const AllowStatusEnum = {
  ALLOWED: 'ALLOWED',
  PROHIBITED: 'PROHIBITED'
} as const;

// 是否置顶
export const AllowTopEnum = {
    TOP: 'TOP',
    NOT_TOP: 'NOT_TOP'
} as const;

// 导出类型
export type ArticleStatusEnum = typeof ArticleStatusEnum[keyof typeof ArticleStatusEnum];
export type ArticleReviewStatusEnum = typeof ArticleReviewStatusEnum[keyof typeof ArticleReviewStatusEnum];
export type ArticleOriginalEnum = typeof ArticleOriginalEnum[keyof typeof ArticleOriginalEnum];
export type ArticleVisibleEnum = typeof ArticleVisibleEnum[keyof typeof ArticleVisibleEnum];
export type ArticleCollectionStatusEnum = typeof ArticleCollectionStatusEnum[keyof typeof ArticleCollectionStatusEnum];
export type AllowStatusEnum = typeof AllowStatusEnum[keyof typeof AllowStatusEnum];
export type AllowTopEnum = typeof AllowTopEnum[keyof typeof AllowTopEnum];

// 枚举映射（用于UI显示）
export const ArticleStatusMap = {
  [ArticleStatusEnum.ALL]: '所有',
  [ArticleStatusEnum.DRAFT]: '草稿',
  [ArticleStatusEnum.PENDING_PUBLISH]: '待发布',
  [ArticleStatusEnum.PUBLISHED]: '已发布',
  [ArticleStatusEnum.OFFLINE]: '已下架',
  [ArticleStatusEnum.RECYCLE]: '回收站'
};

export const ArticleOriginalMap = {
  [ArticleOriginalEnum.ORIGINAL]: '原创',
  [ArticleOriginalEnum.REPRINT]: '转载',
  [ArticleOriginalEnum.OTHER]: '其他'
};

export const ArticleVisibleMap = {
  [ArticleVisibleEnum.PRIVATE]: '私有',
  [ArticleVisibleEnum.PUBLIC]: '公开',
  [ArticleVisibleEnum.FOLLOWERS_ONLY]: '仅粉丝可见'
};

export const ArticleCollectionStatusMap = {
  [ArticleCollectionStatusEnum.PUBLIC]: '公开',
  [ArticleCollectionStatusEnum.PRIVATE]: '私有'
};

export const AllowStatusMap = {
  [AllowStatusEnum.ALLOWED]: '允许',
  [AllowStatusEnum.PROHIBITED]: '禁止'
};

export const ArticleTopMap = {
    [AllowTopEnum.TOP]: '置顶',
    [AllowTopEnum.NOT_TOP]: '不置顶'
};

export const ArticleReviewStatusMap = {
  [ArticleReviewStatusEnum.PENDING]: '待审核',
  [ArticleReviewStatusEnum.APPROVED]: '审核通过',
  [ArticleReviewStatusEnum.REJECTED]: '审核拒绝',
  [ArticleReviewStatusEnum.APPEALING]: '申诉中'
};
