// 导出所有API端点
export const API_ENDPOINTS = {
    // 首页相关
    INDEX: {
        INDEX: '/',
        LIST: '/index/articles',        // 获取首页文章列表
        BANNER: '/index/banner',      // 获取轮播图文章
        LATEST: '/index/latest-article',      // 获取最新文章
        CREATE: '/article',             // 创建文章

    },

    // 文章相关
    ARTICLE: {
        DETAIL: '/front/article',
        SAVE_DRAFT: (id?: number) => `/article/${id}/draft`, // 保存草稿
        DELETE: (id: number) => `/article/${id}`, // 删除文章
    },

    // 用户相关
    USER: {
        PROFILE: '/front/user/profile', // 获取/更新用户资料
    },

    // 标签相关
    TAG: {
        ACTIVE: '/front/tag/active', // 获取激活状态的标签
    },

    // 分类相关
    CATEGORY: {
        ACTIVE: '/front/category/active', // 获取激活状态的分类
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
    API_ENDPOINTS.INDEX.LATEST,
    API_ENDPOINTS.TAG.ACTIVE,
    API_ENDPOINTS.CATEGORY.ACTIVE,
];
