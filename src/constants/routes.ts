// 前端路由常量定义
export const ROUTES = {
  // 主页相关
  HOME: '/',
  RANKINGS: '/rankings',

  // 认证相关
  LOGIN: '/login',
  ADMIN_LOGIN: '/admin/login',
  REGISTER: '/register',

  // 用户相关
  USER_PROFILE: (id: string): string => `/user/${id}`,

  // 用户个人中心
  PROFILE: '/profile',
  PROFILE_INFO: '/profile/info',
  MY_CREATIONS: '/profile/creations',
  MY_COLLECTIONS: '/profile/collections',
  READING_HISTORY: '/profile/histories',
  NOTIFICATIONS: '/profile/notifications',
  ACCOUNT_SETTINGS: '/profile/settings',

  // 文章相关
  ARTICLE_DETAIL: (id: number): string => `/article/${id}`,
  CREATE_ARTICLE: '/article/create',
  UPDATE_ARTICLE: (id: number): string => `/edit-article/${id}`,

  // 管理后台
  ADMIN_DASHBOARD: '/admin',
  ADMIN_USERS: '/admin/users',
  ADMIN_ARTICLES: '/admin/articles',
  ADMIN_COMMENTS: '/admin/comments',
  ADMIN_TAGS: '/admin/tags',
  ADMIN_CATEGORIES: '/admin/categories',

  // 其他
  SEARCH: '/search'
};
