// 路由常量定义
export const ROUTES = {
  // 基础路由
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',

  // 文章相关
  CREATE_ARTICLE: '/create-article',
  EDIT_ARTICLE: (id: string): string => `/edit-article/${id}`,
  ARTICLE_DETAIL: (id: string): string => `/article/${id}`,

  // 个人中心
  PROFILE: '/profile',
  PROFILE_INFO: '/profile/info',
  MY_CREATIONS: '/profile/creations',
  MY_COLLECTIONS: '/profile/collections',
  READING_HISTORY: '/profile/histories',
  NOTIFICATIONS: '/profile/notifications',
  ACCOUNT_SETTINGS: '/profile/settings',

  // 其他
  RANKINGS: '/rankings',
  USER_PROFILE: (id: string): string => `/user/${id}`
};
