import React from 'react';
import {Avatar} from 'antd';
import {Link} from 'react-router-dom';
import {LikeOutlined, EyeOutlined, MessageOutlined, CalendarOutlined} from '@ant-design/icons';

interface Article {
    id: number;
    title: string;
    summary: string;
    coverImage?: string;
    authorName: string;
    avatar: string;
    likeCount: number;
    readCount: number;
    commentCount: number;
    publishTime: string;
}

interface ArticleCardProps {
    article: Article;
}

const ArticleCard: React.FC<ArticleCardProps> = ({article}) => {
    const {title, summary, coverImage, authorName, avatar, likeCount, readCount, commentCount, publishTime} = article;

    return (
        <div className="border-b border-gray-200 pt-2 pb-4 mb-4 hover:bg-gray-50 transition-colors duration-200 w-full">
            <div className="flex flex-col md:flex-row gap-6 w-full">
                {/* 左侧内容 */}
                <div className={`flex-1 ${coverImage ? 'md:pr-4' : ''} flex flex-col min-w-10`}>
                    {/* 文章标题 */}
                    <h3 className="text-xl font-semibold mb-2 leading-tight">
                        <Link to={`/article/${article.id}`}
                              className="text-gray-800 hover:text-blue-600 transition-colors cursor-pointer">
                            {title}
                        </Link>
                    </h3>

                    {/* 文章简介 */}
                    <p className="text-gray-500 mb-4 line-clamp-2 text-base min-h-[24px] max-h-[48px] leading-relaxed">
                        {summary || '暂无简介'}
                    </p>

                    {/* 用户信息和互动数据 */}
                    <div className="flex items-center gap-4 text-sm text-gray-500 flex-wrap mt-auto">
                        {/* 用户信息 */}
                        <div className="flex items-center gap-2">
                            <Avatar src={avatar || undefined} alt={authorName} className="w-6 h-6"/>
                            <a href={`/user/${authorName}`}
                               className="font-medium text-gray-700 hover:text-blue-600 transition-colors">
                                {authorName}
                            </a>
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
                            {publishTime}
            </span>
                    </div>
                </div>

                {/* 右侧封面图 */}
                {coverImage && (
                    <div className="w-full md:w-64 h-40 md:h-32 rounded-md overflow-hidden flex-shrink-0">
                        <Link to={`/article/${article.id}`}>
                            <img
                                src={coverImage}
                                alt={title}
                                className="w-full h-full object-cover hover:opacity-90 transition-opacity"
                            />
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ArticleCard;