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
      USER_RELATED: '/front/article/user-related', // 获取作者相关文章
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
      PUBLIC_PROFILE: (userId: number): string => `/front/user/profile/${userId}`, // 获取用户公开资料
      UPDATE_USERNAME: '/front/user/username', // 修改用户名
      USERNAME_MODIFICATION_TIME_LEFT: '/front/user/username/modification-time-left', // 获取修改用户名的剩余时间
      FOLLOW: (userId: number): string => `/front/user/follow/${userId}`, // 关注用户
      UNFOLLOW: (userId: number): string => `/front/user/unfollow/${userId}`, // 取消关注用户
      FOLLOW_STATUS: (userId: number): string => `/front/user/follow/status/${userId}` // 检查关注状态
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
      DISLIKE: (id: number): string => `/front/comment/dislike/${id}`, // 点踩评论
      REPLIES: '/front/comment/replies' // 获取子评论列表
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
      SEND_CODE: '/auth/send-code', // 发送验证码
      REGISTER: '/auth/register', // 用户注册
      LOGIN: '/auth/login', // 用户登录
      REFRESH_TOKEN: '/auth/refresh-token' // 刷新令牌
    }
  },

  // 后台接口
  ADMIN: {
    // 认证相关
    AUTH: {
      LOGIN: '/auth/login', // 管理员登录
      REFRESH_TOKEN: '/auth/refresh-token' // 管理员刷新令牌
    },

    // 用户管理
    USER: {
      LIST: '/admin/user/list', // 分页获取用户
      DETAIL: (id: number): string => `/admin/user/detail/${id}`, // 获取用户详情
      PROFILE: '/admin/user/profile', // 获取当前管理员个人资料
      DELETE: (id: number): string => `/admin/user/delete/${id}`, // 删除用户
      UPDATE: (id: number): string => `/admin/user/update/${id}`, // 更新用户
      UPDATE_STATUS: (id: number): string => `/admin/user/update-status/${id}`, // 更新用户状态
      UPDATE_ROLE: (id: number): string => `/admin/user/update-role/${id}` // 更新用户角色
    },

    // 文章管理
    ARTICLE: {
      LIST_PAGE: '/admin/article/list', // 分页获取文章
      GET: (id: number): string => `/admin/article/detail/${id}`, // 获取文章详情
      DELETE: (id: number): string => `/admin/article/delete/${id}`, // 删除文章
      UPDATE: (id: number): string => `/admin/article/update/${id}`, // 更新文章
      UPDATE_STATUS: (id: number): string => `/admin/article/update/article-status/${id}`, // 更新文章状态
      APPROVE: (id: number): string => `/admin/article/approve/${id}`, // 审核通过文章
      REJECT: (id: number): string => `/admin/article/reject/${id}`, // 审核拒绝文章
      REPROCESS: (id: number): string => `/admin/article/reprocess/${id}`, // 重新审核文章
      TOP: (id: number): string => `/admin/article/top/${id}`, // 置顶文章
      CANCEL_TOP: (id: number): string => `/admin/article/cancel-top/${id}`, // 取消置顶文章
      RECOMMEND: (id: number): string => `/admin/article/recommend/${id}`, // 推荐文章
      CANCEL_RECOMMEND: (id: number): string => `/admin/article/cancel-recommend/${id}` // 取消推荐文章
    },

    // 评论管理
    COMMENT: {
      LIST_PAGE: '/admin/comment/list', // 分页获取评论
      DELETE: (id: number): string => `/admin/comment/delete/${id}`, // 删除评论
      UPDATE: (id: number): string => `/admin/comment/update/${id}`, // 更新评论
      UPDATE_STATUS: (id: number): string => `/admin/comment/update-status/${id}`, // 更新评论状态
      UPDATE_TOP: (id: number): string => `/admin/comment/update-top/${id}` // 更新评论置顶状态
    },

    // 标签管理
    TAG: {
      LIST: '/admin/tag/list', // 分页获取标签
      CREATE: '/admin/tag/add', // 添加标签
      UPDATE: (id: number): string => `/admin/tag/update/${id}`, // 更新标签
      DELETE: (id: number): string => `/admin/tag/delete/${id}`, // 删除标签
      UPDATE_STATUS: (id: number): string => `/admin/tag/status/${id}` // 更新标签状态
    },

    // 分类管理
    CATEGORY: {
      LIST: '/admin/category/list', // 分页获取分类
      CREATE: '/admin/category', // 添加分类
      UPDATE: (id: number): string => `/admin/category/${id}`, // 更新分类
      DELETE: (id: number): string => `/admin/category/${id}`, // 删除分类
      UPDATE_STATUS: (id: number): string => `/admin/category/${id}/status` // 更新分类状态
    },

    // 通知模板管理
    NOTIFICATION_TEMPLATE: {
      CREATE: '/admin/notification-templates/create', // 创建通知模板
      UPDATE: (id: number): string => `/admin/notification-templates/update/${id}`, // 更新通知模板
      DELETE: (id: number): string => `/admin/notification-templates/delete/${id}`, // 删除通知模板
      DETAIL: (id: number): string => `/admin/notification-templates/detail/${id}`, // 获取模板详情
      DETAIL_BY_CODE: (code: string): string => `/admin/notification-templates/detail/code/${code}`, // 根据编码获取模板
      LIST: '/admin/notification-templates/list', // 分页查询模板列表
      ALL: '/admin/notification-templates/all', // 获取所有模板
      ENABLE: (id: number): string => `/admin/notification-templates/enable/${id}`, // 启用模板
      DISABLE: (id: number): string => `/admin/notification-templates/disable/${id}`, // 禁用模板
      CHECK_CODE: '/admin/notification-templates/check-code', // 检查编码是否存在
      PREVIEW: (code: string): string => `/admin/notification-templates/preview/${code}`, // 预览模板渲染效果
      SEND: '/admin/notification-templates/send' // 手动发送通知
    }
  },

  // 公共接口
  COMMON: {
    // 认证相关
    AUTH: {
      TOKEN: '/auth/refresh-token', // 刷新令牌
      REFRESH_TOKEN: '/auth/refresh-token' // 刷新令牌
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
  // 首页相关
  API_ENDPOINTS.FRONT.INDEX.LIST,
  API_ENDPOINTS.FRONT.INDEX.BANNER,
  API_ENDPOINTS.FRONT.INDEX.LATEST_ARTICLES,
  API_ENDPOINTS.FRONT.INDEX.HOT_ARTICLES,
  API_ENDPOINTS.FRONT.INDEX.HOT_USERS,

  // 文章相关
  '/front/article/', // 文章详情
  '/article/', // 文章详情
  API_ENDPOINTS.FRONT.ARTICLE.USER_RELATED, // 作者相关文章
  API_ENDPOINTS.FRONT.ARTICLE.INCREMENT_READ, // 文章阅读量增加

  // 用户相关
  '/front/user/profile/', // 用户公开资料

  // 标签相关
  API_ENDPOINTS.FRONT.TAG.ACTIVE, // 激活状态的标签
  API_ENDPOINTS.FRONT.TAG.ALL, // 所有标签

  // 分类相关
  API_ENDPOINTS.FRONT.CATEGORY.ACTIVE, // 激活状态的分类
  API_ENDPOINTS.FRONT.CATEGORY.ALL, // 所有分类

  // 评论相关
  API_ENDPOINTS.FRONT.COMMENT.LIST, // 评论列表

  // 搜索相关
  API_ENDPOINTS.FRONT.SEARCH.ARTICLES, // 搜索文章
  API_ENDPOINTS.FRONT.SEARCH.HOT_WORDS, // 热门搜索词

  // 认证相关
  API_ENDPOINTS.FRONT.AUTH.SEND_CODE, // 发送验证码
  API_ENDPOINTS.FRONT.AUTH.REGISTER, // 用户注册
  API_ENDPOINTS.FRONT.AUTH.LOGIN, // 用户登录

  // 公共接口
  API_ENDPOINTS.COMMON.AUTH.TOKEN, // 刷新令牌
  API_ENDPOINTS.COMMON.UPLOAD.COVER, // 上传用户封面图
  API_ENDPOINTS.COMMON.UPLOAD.AVATAR, // 上传用户头像
  API_ENDPOINTS.COMMON.UPLOAD.ARTICLE_COVER_IMG // 上传文章封面图
];

// API端点类型定义
export type ApiEndpoints = typeof API_ENDPOINTS;
export type FrontEndpoints = typeof API_ENDPOINTS.FRONT;
export type AdminEndpoints = typeof API_ENDPOINTS.ADMIN;
export type CommonEndpoints = typeof API_ENDPOINTS.COMMON;
