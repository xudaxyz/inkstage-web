import React from 'react';
import { Avatar } from 'antd';
import { LikeOutlined, EyeOutlined, MessageOutlined, CalendarOutlined } from '@ant-design/icons';
import { formatDateTimeShort } from '../../utils';
import LazyImage from '../common/LazyImage';

interface Article {
    id: number;
    title: string;
    summary: string;
    coverImage?: string;
    nickname: string;
    userId: number;
    avatar: string;
    likeCount: number;
    readCount: number;
    commentCount: number;
    publishTime: string;
}

interface ArticleCardProps {
    article: Article;
}

const ArticleCard: React.FC<ArticleCardProps> = ({ article }) => {
    const { title, summary, coverImage, nickname, avatar, likeCount, readCount, commentCount, publishTime } = article;
    return (
        <div
            className="border-b border-gray-200 dark:border-gray-800 pt-2 pb-4 mb-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-200 w-full rounded-t-lg">
            <div className="flex flex-col md:flex-row gap-6 w-full items-start">
                {/* 左侧内容 */}
                <div className="flex-1 px-2 flex flex-col min-w-10">
                    {/* 文章标题 */}
                    <div
                        className="flex text-xl font-semibold mb-2 text-gray-800 dark:text-gray-200/90 hover:text-blue-600 leading-tight">
                        <a href={`/article/${article.id}`}
                           target="_blank"
                           rel="noopener noreferrer"
                           className="text-gray-800 dark:text-gray-200/90 hover:text-blue-600 transition-colors cursor-pointer truncate no-underline">
                            {title}
                        </a>
                    </div>

                    {/* 文章简介 */}
                    <p className="text-gray-500 dark:text-gray-400 mb-4 text-base leading-relaxed line-clamp-2">
                        {summary || '暂无简介'}
                    </p>

                    {/* 用户信息和互动数据 */}
                    <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 flex-wrap mt-auto">
                        {/* 用户信息 */}
                        <div className="flex items-center gap-2">
                            <Avatar src={avatar} alt={nickname} className="w-6 h-6"/>
                            {article.userId ? (
                                <a href={`/user/${article.userId}`}
                                   className="font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 transition-colors">
                                    {nickname}
                                </a>
                            ) : (
                                <span className="font-medium text-gray-700 dark:text-gray-300">{nickname}</span>
                            )}
                        </div>

                        {/* 点赞量 */}
                        <span className="flex items-center gap-1">
              <LikeOutlined/>
                            {likeCount}
            </span>

                        {/* 浏览量 */}
                        <span className="flex items-center gap-1">
              <EyeOutlined/>
                            {readCount}
            </span>


                        {/* 评论数量 */}
                        <span className="flex items-center gap-1">
              <MessageOutlined/>
                            {commentCount}
            </span>

                        {/* 发布时间 */}
                        <span className="flex items-center gap-1">
              <CalendarOutlined/>
                            {formatDateTimeShort(publishTime)}
            </span>
                    </div>
                </div>

                {/* 右侧封面图 */}
                {coverImage ? (
                    <div className="w-full md:w-64 h-40 md:h-32 rounded-md overflow-hidden flex-shrink-0">
                        <a href={`/article/${article.id}`}
                           target="_blank"
                           rel="noopener noreferrer">
                            <LazyImage
                                src={coverImage}
                                alt={title}
                                className="w-full h-full object-cover hover:opacity-90 transition-opacity"
                            />
                        </a>
                    </div>
                ) : (
                    <div className="w-1 h-40 md:h-32 flex-shrink-0"></div>
                )}
            </div>
        </div>
    );
};
export default React.memo(ArticleCard);
