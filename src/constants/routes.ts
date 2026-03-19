// 前端路由常量定义
export const ROUTES = {
  // 认证相关
  LOGIN: '/login',
  ADMIN_LOGIN: '/admin/login',
  REGISTER: '/register',

  // 主页相关
  HOME: '/',

  // 用户相关
  PROFILE: '/profile',
  ACCOUNT_SETTINGS: '/profile/settings',

  // 文章相关
  ARTICLE_DETAIL: (id: number): string => `/article/${id}`,
  CREATE_ARTICLE: '/article/create',
  UPDATE_ARTICLE: (id: number): string => `/article/update/${id}`,

  // 管理后台
  ADMIN_DASHBOARD: '/admin',
  ADMIN_USERS: '/admin/users',
  ADMIN_ARTICLES: '/admin/articles',
  ADMIN_COMMENTS: '/admin/comments',
  ADMIN_TAGS: '/admin/tags',
  ADMIN_CATEGORIES: '/admin/categories',

  // 其他
  NOTIFICATIONS: '/notifications',
  READING_HISTORY: '/reading-history',
  SEARCH: '/search'
};
