// 导出所有API端点
export const API_ENDPOINTS = {
  // 前台接口
  FRONT: {
    // 首页相关
    INDEX: {
      INDEX: '/',
      LIST: '/index/articles',        // 获取首页文章列表
      BANNER: '/index/banner',      // 获取轮播图文章
      LATEST_ARTICLES: '/index/latest-articles',      // 获取最新文章列表
      HOT_ARTICLES: '/index/hot-articles',      // 获取热门文章
      HOT_USERS: '/index/hot-users'      // 获取热门用户
    },

    // 文章相关
    ARTICLE: {
      DETAIL: (id: number): string => `/front/article/${id}`, // 获取文章详情
      CREATE: '/front/article/create', // 创建文章
      UPDATE: (id: number): string => `/front/article/update/${id}`, // 更新文章
      SAVE_DRAFT: (id?: number): string => `/front/article/draft/${id}`, // 保存草稿
      DELETE: (id: number): string => `/front/article/delete/${id}`, // 删除文章
      PERMANENT_DELETE: (id: number): string => `/front/article/permanent-delete/${id}`, // 彻底删除文章
      USER_ARTICLES: (userId: number): string => `/front/article/user/${userId}`, // 获取用户文章列表
      AUTHOR_RELATED: '/front/article/author/related', // 获取作者相关文章
      LIKE: (id: number): string => `/front/article/like/${id}`, // 点赞文章
      UNLIKE: (id: number): string => `/front/article/like/${id}`, // 取消点赞
      LIKE_STATUS: (id: number): string => `/front/article/like/${id}/status`, // 检查点赞状态
      COLLECT: '/front/article/collect', // 收藏文章
      UN_COLLECT: (id: number): string => `/front/article/un-collect/${id}`, // 取消收藏
      COLLECT_STATUS: (id: number): string => `/front/article/collect/${id}/status`, // 检查收藏状态
      INCREMENT_READ: (id: number): string => `/front/article/read/${id}`, // 增加阅读数
      MY_ARTICLES: '/front/article/my-articles', // 获取我的文章列表
      COLLECTIONS: {
        LIST: '/front/article/collections', // 获取收藏文章列表
        FOLDERS: '/front/article/collections/folders', // 获取收藏文件夹列表
        CREATE_FOLDER: '/front/article/collections/folders', // 创建收藏文件夹
        UPDATE_FOLDER: (folderId: number): string => `/front/article/collections/folders/${folderId}`, // 更新收藏文件夹
        DELETE_FOLDER: (folderId: number): string => `/front/article/collections/folders/${folderId}`, // 删除收藏文件夹
        MOVE: '/front/article/collections/move', // 移动收藏文章
        TOTAL: '/front/article/collections/total' // 获取总收藏数
      }
    },

    // 用户相关
    USER: {
      PROFILE: '/front/user/profile', // 获取/更新用户资料
      PUBLIC_PROFILE: (userId: number): string => `/front/user/profile/${userId}` // 获取用户公开资料
    },

    // 标签相关
    TAG: {
      ACTIVE: '/front/tag/active', // 获取激活状态的标签
      ALL: '/front/tag', // 获取所有标签
      DETAIL: (id: number): string => `/front/tag/${id}`, // 根据ID获取标签
      BY_ARTICLE: (articleId: number): string => `/front/tag/article/${articleId}` // 根据文章ID获取标签
    },

    // 分类相关
    CATEGORY: {
      ACTIVE: '/front/category/active', // 获取激活状态的分类
      ALL: '/front/category', // 获取所有分类
      DETAIL: (id: number): string => `/front/category/${id}` // 根据ID获取分类
    },

    // 评论相关
    COMMENT: {
      LIST: '/front/comment/list', // 获取评论列表
      CREATE: '/front/comment/create', // 创建评论
      UPDATE: '/front/comment/update', // 更新评论
      DELETE: (id: number): string => `/front/comment/delete/${id}`, // 删除评论
      LIKE: (id: number): string => `/front/comment/like/${id}`, // 点赞评论
      DISLIKE: (id: number): string => `/front/comment/dislike/${id}` // 点踩评论
    },

    // 阅读历史相关
    READING_HISTORY: {
      LIST: '/front/reading-history/get', // 获取阅读历史列表
      SAVE: '/front/reading-history/save', // 保存阅读历史
      DELETE: (articleId: number): string => `/front/reading-history/delete/${articleId}`, // 删除单条阅读历史
      CLEAR: '/front/reading-history/delete/all', // 清空阅读历史
      DETAIL: (articleId: number): string => `/front/reading-history/${articleId}`, // 获取单篇文章的阅读历史
      BATCH: '/front/reading-history/batch' // 批量获取阅读历史
    },

    // 通知相关
    NOTIFICATION: {
      LIST: '/front/notification/list', // 获取通知列表
      LIST_PAGE: '/front/notification/list/page', // 分页获取通知列表
      MARK_READ: (id: number): string => `/front/notification/read/${id}`, // 标记通知为已读
      MARK_ALL_READ: '/front/notification/read/all', // 标记所有通知为已读
      DELETE: (id: number): string => `/front/notification/delete/${id}`, // 删除通知
      UNREAD_COUNT: '/front/notification/unread/count', // 获取未读通知数量
      SYNC_UNREAD: '/front/notification/unread/sync', // 同步未读通知数量
      SETTING: {
        GET: '/front/notification/setting/get', // 获取通知设置
        SAVE: '/front/notification/setting/save', // 保存通知设置
        RESET: '/front/notification/setting/reset' // 恢复默认通知设置
      }
    },

    // 搜索相关
    SEARCH: {
      ARTICLES: '/front/search/articles', // 搜索文章
      HOT_WORDS: '/front/search/hot-words', // 获取热门搜索词
      HISTORY: {
        LIST: '/front/search/history', // 获取搜索历史
        DELETE: (id: number): string => `/front/search/history/delete/${id}`, // 删除搜索历史
        CLEAR: '/front/search/history/clear' // 清空搜索历史
      }
    },

    // 认证相关
    AUTH: {
      SEND_CODE: '/front/auth/send-code', // 发送验证码
      REGISTER: '/front/auth/register', // 用户注册
      LOGIN: '/front/auth/login' // 用户登录
    }
  },

  // 后台接口
  ADMIN: {
    // 用户管理
    USER: {
      LIST: '/admin/user/all', // 分页获取用户
      DETAIL: (id: number): string => `/admin/user/${id}`, // 获取用户详情
      DELETE: (id: number): string => `/admin/user/${id}`, // 删除用户
      UPDATE: (id: number): string => `/admin/user/${id}`, // 更新用户
      UPDATE_STATUS: (id: number): string => `/admin/user/update-status/${id}`, // 更新用户状态
      UPDATE_ROLE: (id: number): string => `/admin/user/update-role/${id}` // 更新用户角色
    },

    // 文章管理
    ARTICLE: {
      LIST_PAGE: '/admin/article/page', // 分页获取文章
      GET: (id: number): string => `/admin/article/${id}`, // 获取文章详情
      DELETE: (id: number): string => `/admin/article/${id}`, // 删除文章
      UPDATE_STATUS: (id: number): string => `/admin/article/${id}/status` // 更新文章状态
    },

    // 评论管理
    COMMENT: {
      LIST_PAGE: '/admin/comment/page', // 分页获取评论
      DELETE: (id: number): string => `/admin/comment/${id}`, // 删除评论
      UPDATE_STATUS: (id: number): string => `/admin/comment/${id}/status`, // 更新评论状态
      UPDATE_TOP: (id: number): string => `/admin/comment/${id}/top` // 更新评论置顶状态
    },

    // 标签管理
    TAG: {
      LIST: '/admin/tag/all', // 分页获取标签
      CREATE: '/admin/tag', // 添加标签
      UPDATE: (id: number): string => `/admin/tag/${id}`, // 更新标签
      DELETE: (id: number): string => `/admin/tag/${id}`, // 删除标签
      UPDATE_STATUS: (id: number): string => `/admin/tag/${id}/status` // 更新标签状态
    },

    // 分类管理
    CATEGORY: {
      LIST: '/admin/category/all', // 分页获取分类
      CREATE: '/admin/category', // 添加分类
      UPDATE: (id: number): string => `/admin/category/${id}`, // 更新分类
      DELETE: (id: number): string => `/admin/category/${id}`, // 删除分类
      UPDATE_STATUS: (id: number): string => `/admin/category/${id}/status` // 更新分类状态
    }
  },

  // 公共接口
  COMMON: {
    // 认证相关
    AUTH: {
      TOKEN: '/oauth2/token', // 刷新令牌
      REFRESH_TOKEN: '/auth/token' // 刷新令牌
    },

    // 文件上传相关
    UPLOAD: {
      COVER: '/upload/user/cover-image',        // 上传用户封面图
      AVATAR: '/upload/user/avatar',            // 上传用户头像
      ARTICLE_COVER_IMG: '/upload/article/cover-image', // 上传文章封面图
      DELETE: '/upload/delete'                  // 删除文件
    }
  }
};

// 公开端点列表（不需要身份认证的端点）
export const PUBLIC_ENDPOINTS = [
  API_ENDPOINTS.FRONT.INDEX.INDEX,
  API_ENDPOINTS.FRONT.INDEX.LIST,
  API_ENDPOINTS.FRONT.INDEX.BANNER,
  API_ENDPOINTS.FRONT.INDEX.LATEST_ARTICLES,
  API_ENDPOINTS.FRONT.INDEX.HOT_ARTICLES,
  API_ENDPOINTS.FRONT.INDEX.HOT_USERS,
  API_ENDPOINTS.FRONT.TAG.ACTIVE,
  API_ENDPOINTS.FRONT.CATEGORY.ACTIVE,
  API_ENDPOINTS.FRONT.COMMENT.LIST,
  // 这里添加用户公开资料接口的基础路径，具体ID会动态生成
  '/front/user/profile/',
  // 这里添加用户文章列表接口的基础路径，具体ID会动态生成
  '/front/article/user/',
  // 作者相关文章接口
  '/front/article/author/related',
  // 文章阅读量增加接口
  '/front/article/read/'
];

// API端点类型定义
export type ApiEndpoints = typeof API_ENDPOINTS;
export type FrontEndpoints = typeof API_ENDPOINTS.FRONT;
export type AdminEndpoints = typeof API_ENDPOINTS.ADMIN;
export type CommonEndpoints = typeof API_ENDPOINTS.COMMON;


