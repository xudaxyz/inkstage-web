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
        UPDATE: (id: number) => `/front/article/update/${id}`, // 更新文章
        SAVE_DRAFT: (id?: number) => `/article/${id}/draft`, // 保存草稿
        DELETE: (id: number) => `/article/${id}`, // 删除文章
        USER_ARTICLES: (userId: number) => `/front/article/user/${userId}`, // 获取用户文章列表
        AUTHOR_RELATED: '/front/article/author/related', // 获取作者相关文章
    },

    // 用户相关
    USER: {
        PROFILE: '/front/user/profile', // 获取/更新用户资料
        PUBLIC_PROFILE: (userId: number) => `/front/user/profile/${userId}`, // 获取用户公开资料
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
        ARTICLE_COVER: '/upload/article/cover-image', // 上传文章封面图
        DELETE: '/upload/delete',                  // 删除文件
    },

    // 认证相关
    AUTH: {
        TOKEN: '/oauth2/token', // 刷新令牌
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
];


