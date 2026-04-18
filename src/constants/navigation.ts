/**
 * 导航相关常量和策略
 */

// 路由路径常量
export const ROUTES = {
  // 公共路由
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  ARTICLE_DETAIL: '/article',
  USER_PROFILE: '/user',
  RANKINGS: '/rankings',
  SEARCH: '/search',

  // 需要登录的路由
  CREATE_ARTICLE: '/create-article',
  EDIT_ARTICLE: '/edit-article',
  PROFILE: '/profile',
  PROFILE_INFO: '/profile/info',
  MY_CREATIONS: '/profile/creations',
  MY_COLLECTIONS: '/profile/collections',
  READING_HISTORIES: '/profile/histories',
  NOTIFICATIONS: '/profile/notifications',
  NOTIFICATION_SETTINGS: '/profile/notification-settings',
  ACCOUNT_SETTINGS: '/profile/settings',

  // 后台路由
  ADMIN_LOGIN: '/admin/login',
  ADMIN_DASHBOARD: '/admin',
  ADMIN_USERS: '/admin/users',
  ADMIN_ARTICLES: '/admin/articles',
  ADMIN_CATEGORIES: '/admin/categories',
  ADMIN_TAGS: '/admin/tags',
  ADMIN_COMMENTS: '/admin/comments',
  ADMIN_NOTIFICATIONS: '/admin/notifications',
  ADMIN_REPORTS: '/admin/reports',
  ADMIN_SETTINGS: '/admin/settings'
};

// 公开页面列表
export const PUBLIC_PAGES = [
  ROUTES.HOME,
  ROUTES.LOGIN,
  ROUTES.REGISTER,
  ROUTES.ARTICLE_DETAIL,
  ROUTES.USER_PROFILE,
  ROUTES.RANKINGS,
  ROUTES.SEARCH
];

// 导航策略常量
export const NAVIGATION_STRATEGIES = {
  // 直接跳转到登录页的情况
  REDIRECT_TO_LOGIN: [
    '未登录用户访问需要登录的页面',
    '未登录用户访问后台管理页面',
    '已登录用户的token过期且无法刷新时，访问需要登录的API'
  ],

  // 跳转到首页的情况
  REDIRECT_TO_HOME: [
    '已登录用户登出后',
    '管理员用户权限不足时访问后台页面',
    '普通用户尝试访问后台页面',
    '权限不足时访问受保护的资源'
  ],

  // 不做跳转仅提醒用户的情况
  SHOW_NOTIFICATION_ONLY: [
    '未登录用户访问公开API时的401错误',
    '登录失败时',
    '注册成功后',
    '密码修改成功后',
    '个人资料更新成功后',
    '文章发布成功后',
    '评论发布成功后'
  ]
};

/**
 * 检查路径是否为公开页面
 * @param path 路径
 * @returns 是否为公开页面
 */
export const isPublicPage = (path: string): boolean => {
  return PUBLIC_PAGES.some((page) => path.startsWith(page));
};

/**
 * 检查路径是否为需要登录的页面
 * @param path 路径
 * @returns 是否为需要登录的页面
 */
export const isProtectedPage = (path: string): boolean => {
  const protectedPaths = [ROUTES.CREATE_ARTICLE, ROUTES.EDIT_ARTICLE, ROUTES.PROFILE];
  return protectedPaths.some((page) => path.startsWith(page));
};

/**
 * 检查路径是否为后台页面
 * @param path 路径
 * @returns 是否为后台页面
 */
export const isAdminPage = (path: string): boolean => {
  return path.startsWith('/admin');
};
