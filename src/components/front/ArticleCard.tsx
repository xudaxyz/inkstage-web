import React from 'react';
import {Avatar} from 'antd';

interface User {
    avatar?: string;
    name: string;
}

interface Stats {
    likes: number;
    views: number;
    comments: number;
}

interface Article {
    id: number;
    title: string;
    summary: string;
    coverImage?: string;
    user: User;
    stats: Stats;
    publishTime: string;
}

interface ArticleCardProps {
    article: Article;
}

const ArticleCard: React.FC<ArticleCardProps> = ({article}) => {
    const {title, summary, coverImage, user, stats, publishTime} = article;

    return (
        <div className="border-b border-gray-200 pb-6 mb-6 hover:bg-gray-50 transition-colors duration-200">
            <div className="flex flex-col md:flex-row gap-6">
                {/* 左侧内容 */}
                <div className={`flex-1 ${coverImage ? 'md:pr-4' : ''} flex flex-col`}>
                    {/* 文章标题 */}
                    <h3 className="text-xl font-semibold mb-2 text-gray-800 hover:text-blue-600 transition-colors cursor-pointer leading-tight">
                        {title}
                    </h3>

                    {/* 文章简介 */}
                    <p className="text-gray-500 mb-4 line-clamp-2 text-base min-h-[24px] max-h-[48px] leading-relaxed">
                        {summary || '暂无简介'}
                    </p>

                    {/* 用户信息和互动数据 */}
                    <div className="flex items-center gap-4 text-sm text-gray-500 flex-wrap mt-auto">
                        {/* 用户信息 */}
                        <div className="flex items-center gap-2">
                            <Avatar src={user.avatar} alt={user.name} className="w-6 h-6"/>
                            <a href={`/user/${user.name.toLowerCase().replace(/\s+/g, '-')}`}
                               className="font-medium text-gray-700 hover:text-blue-600 transition-colors">
                                {user.name}
                            </a>
                        </div>

                        {/* 点赞量 */}
                        <span className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"/>
              </svg>
                            {stats.likes}
            </span>

                        {/* 浏览量 */}
                        <span className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
              </svg>
                            {stats.views}
            </span>


                        {/* 评论数量 */}
                        <span className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.21-.802A13.985 13.985 0 013 12c0-4.418 4.03-8 9-8a9.863 9.863 0 014.21.802A13.985 13.985 0 0121 12z"/>
              </svg>
                            {stats.comments}
            </span>

                        {/* 发布时间 */}
                        <span className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
              </svg>
                            {publishTime}
            </span>
                    </div>
                </div>

                {/* 右侧封面图 */}
                {coverImage && (
                    <div className="w-full md:w-64 h-40 md:h-32 rounded-md overflow-hidden flex-shrink-0">
                        <img
                            src={coverImage}
                            alt={title}
                            className="w-full h-full object-cover"
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

export default ArticleCard;