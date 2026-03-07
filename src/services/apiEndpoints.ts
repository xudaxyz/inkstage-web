// 导出所有API端点
export const API_ENDPOINTS = {
    // 首页相关
    INDEX: {
        INDEX: '/',
        LIST: '/index/articles',        // 获取首页文章列表
        BANNER: '/index/banner',      // 获取轮播图文章
        LATEST_ARTICLES: '/index/latest-articles',      // 获取最新文章列表
        HOT_ARTICLES: '/index/hot-articles',      // 获取热门文章
        HOT_USERS: '/index/hot-users',      // 获取热门用户
        CREATE: '/article',             // 创建文章

    },

    // 文章相关
    ARTICLE: {
        DETAIL: '/front/article',
        CREATE: '/front/article/create', // 创建文章
        UPDATE: (id: number) => `/front/article/update/${id}`, // 更新文章
        SAVE_DRAFT: (id?: number) => `/front/article/draft/${id}`, // 保存草稿
        DELETE: (id: number) => `/front/article/delete/${id}`, // 删除文章
        USER_ARTICLES: (userId: number) => `/front/article/user/${userId}`, // 获取用户文章列表
        AUTHOR_RELATED: '/front/article/author/related', // 获取作者相关文章
        LIKE: (id: number) => `/front/article/like/${id}`, // 点赞文章
        UNLIKE: (id: number) => `/front/article/like/${id}`, // 取消点赞
        LIKE_STATUS: (id: number) => `/front/article/like/${id}/status`, // 检查点赞状态
        COLLECT: '/front/article/collect', // 收藏文章
        UN_COLLECT: (id: number) => `/front/article/un-collect/${id}`, // 取消收藏
        COLLECT_STATUS: (id: number) => `/front/article/collect/${id}/status`, // 检查收藏状态
        INCREMENT_READ: (id: number) => `/front/article/read/${id}`, // 增加阅读数
    },

    // 用户相关
    USER: {
        PROFILE: '/front/user/profile', // 获取/更新用户资料
        PUBLIC_PROFILE: (userId: number) => `/front/user/profile/${userId}`, // 获取用户公开资料
        MY_ARTICLES: '/front/article/my', // 获取我的文章列表
    },

    // 标签相关
    TAG: {
        ACTIVE: '/front/tag/active', // 获取激活状态的标签
    },

    // 分类相关
    CATEGORY: {
        ACTIVE: '/front/category/active', // 获取激活状态的分类
    },

    // 评论相关
    COMMENT: {
        LIST: '/front/comment/list', // 获取评论列表
        CREATE: '/front/comment/create', // 创建评论
        UPDATE: '/front/comment/update', // 更新评论
        DELETE: '/front/comment/delete', // 删除评论
    },

    // 文件上传相关
    UPLOAD: {
        COVER: '/upload/user/cover-image',        // 上传用户封面图
        AVATAR: '/upload/user/avatar',            // 上传用户头像
        ARTICLE_COVER_IMG: '/upload/article/cover-image', // 上传文章封面图
        DELETE: '/upload/delete',                  // 删除文件
    },

    // 认证相关
    AUTH: {
        TOKEN: '/oauth2/token', // 刷新令牌
    },

    // 阅读历史相关
    READING_HISTORY: {
        LIST: '/front/reading-history/get', // 获取阅读历史列表
        SAVE: '/front/reading-history/save', // 保存阅读历史
        DELETE: (articleId: number) => `/front/reading-history/delete/${articleId}`, // 删除单条阅读历史
        CLEAR: '/front/reading-history/delete/all', // 清空阅读历史
        DETAIL: (articleId: number) => `/front/reading-history/${articleId}`, // 获取单篇文章的阅读历史
        BATCH: '/front/reading-history/batch', // 批量获取阅读历史
    },

    // 通知相关
    NOTIFICATION: {
        LIST: '/front/notification/list', // 获取通知列表
        LIST_PAGE: '/front/notification/list/page', // 分页获取通知列表
        MARK_READ: (id: number) => `/front/notification/read/${id}`, // 标记通知为已读
        MARK_ALL_READ: '/front/notification/read/all', // 标记所有通知为已读
        DELETE: (id: number) => `/front/notification/delete/${id}`, // 删除通知
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
            DELETE: '/front/search/history/delete', // 删除搜索历史
            CLEAR: '/front/search/history/clear' // 清空搜索历史
        }
    },
};

// 公开端点列表（不需要身份认证的端点）
export const PUBLIC_ENDPOINTS = [
    API_ENDPOINTS.INDEX.INDEX,
    API_ENDPOINTS.INDEX.LIST,
    API_ENDPOINTS.INDEX.BANNER,
    API_ENDPOINTS.INDEX.LATEST_ARTICLES,
    API_ENDPOINTS.INDEX.HOT_ARTICLES,
    API_ENDPOINTS.INDEX.HOT_USERS,
    API_ENDPOINTS.TAG.ACTIVE,
    API_ENDPOINTS.CATEGORY.ACTIVE,
    API_ENDPOINTS.COMMENT.LIST,
    // 这里添加用户公开资料接口的基础路径，具体ID会动态生成
    '/front/user/profile/',
    // 这里添加用户文章列表接口的基础路径，具体ID会动态生成
    '/front/article/user/',
    // 作者相关文章接口
    '/front/article/author/related',
    // 文章阅读量增加接口
    '/front/article/read/',
];


