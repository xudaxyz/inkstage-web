import React, {useEffect, useState, useRef, useCallback} from 'react';
import {useParams} from 'react-router-dom';
import {Avatar, message, Button, Tooltip, Divider, List, Card} from 'antd';
import {
    ArrowLeftOutlined,
    LikeOutlined,
    LikeTwoTone,
    MessageOutlined,
    EyeOutlined,
    ShareAltOutlined,
    StarOutlined,
    StarTwoTone,
    LinkOutlined,
    ExclamationCircleOutlined
} from '@ant-design/icons';
import Header from '../../components/common/Header.tsx';
import Footer from '../../components/common/Footer.tsx';
import CommentSection from '../../components/front/CommentSection.tsx';
import {useUser} from '../../store';
import type {ArticleDetailInfo} from '../../services/articleService.ts';
import articleService from '../../services/articleService.ts';
import MarkdownIt from 'markdown-it';
import {createHighlighter} from 'shiki';

// 初始化shiki高亮器
let highlighter: Awaited<ReturnType<typeof createHighlighter>> | null = null;

// 初始化高亮器函数
const initHighlighter = async () => {
    if (!highlighter) {
        highlighter = await createHighlighter({
            themes: ['github-dark', 'github-light'],
            langs: ['javascript', 'typescript', 'html', 'css', 'python', 'java', 'go', 'rust', 'json', 'yaml', 'markdown'],
        });
    }
};

// 初始化Markdown渲染器
const md: MarkdownIt = new MarkdownIt({
    html: true,
    linkify: true,
    typographer: true
});

const ArticleDetail: React.FC = () => {
    const {id} = useParams<{ id: string }>();
    const [article, setArticle] = useState<ArticleDetailInfo | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [liked, setLiked] = useState(false);
    const [likeCount, setLikeCount] = useState(0);
    const [collected, setCollected] = useState(false);
    const [collectionCount, setCollectionCount] = useState(0);
    const [toc, setToc] = useState<Array<{ id: string; text: string; level: number }>>([]);
    const contentRef = useRef<HTMLDivElement>(null);

    // 获取当前用户信息
    const {user, isLoggedIn} = useUser();

    // 先定义fetchArticleDetail函数
    const fetchArticleDetail = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await articleService.getArticleDetail(Number(id));
            if (response.code !== 200) {
                message.error(response.message || '文章详情加载失败');
                setError(response.message || '文章详情加载失败');
                return;
            }
            setArticle(response.data);
        } catch {
            setError('文章详情加载失败');
            message.error('文章详情加载失败');
        } finally {
            setLoading(false);
        }
    }, [id]);

    // 再定义generateToc函数
    const generateToc = useCallback(() => {
        if (!article?.content) return;
        const newToc: Array<{ id: string; text: string; level: number }> = [];
        const headingRegex = /^(#{1,6})\s+(.+)$/gm;
        let match;

        while ((match = headingRegex.exec(article.content)) !== null) {
            const level = match[1].length;
            const text = match[2].trim();
            const id = text.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
            newToc.push({id, text, level});
        }

        setToc(newToc);
    }, [article?.content]);

    // 最后使用useEffect钩子
    useEffect(() => {
        // 初始化shiki高亮器
        void initHighlighter();

        // 获取文章详情
        if (id) {
            void fetchArticleDetail();
        }
    }, [id, fetchArticleDetail]);

    useEffect(() => {
        if (article) {
            setLiked(article.isLiked || false);
            setLikeCount(article.likeCount || 0);
            setCollected(article.isCollected || false);
            setCollectionCount(article.collectionCount || 0);
            generateToc();
        }
    }, [article, generateToc]);

    const scrollToHeading = (id: string) => {
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({behavior: 'smooth'});
        }
    };

    const handleLike = () => {
        setLiked(!liked);
        setLikeCount(prev => liked ? prev - 1 : prev + 1);
    };

    const handleCollect = () => {
        setCollected(!collected);
        setCollectionCount(prev => collected ? prev - 1 : prev + 1);
    };

    const handleShare = () => {
        void message.info('分享功能即将上线');
    };

    // 模拟作者相关文章数据
    const relatedArticles = [
        {id: 1, title: 'Cypress 测试框架入门指南', publishTime: '2026-01-30'},
        {id: 2, title: '前端自动化测试最佳实践', publishTime: '2026-01-25'},
        {id: 3, title: '如何编写高质量的测试用例', publishTime: '2026-01-20'}
    ];

    if (loading) {
        return (
            <div className="flex min-h-screen flex-col bg-white font-sans">
                <Header/>
                <main className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                        <div
                            className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                        <p className="text-gray-600">正在加载文章详情...</p>
                    </div>
                </main>
                <Footer/>
            </div>
        );
    }

    if (error || !article) {
        return (
            <div className="flex min-h-screen flex-col bg-white font-sans">
                <Header/>
                <main className="flex-1 flex items-center justify-center">
                    <div className="text-center max-w-md">
                        <div className="text-red-500 text-6xl mb-4">😢</div>
                        <h2 className="text-2xl font-bold mb-2 text-gray-800">{error || '文章不存在'}</h2>
                        <p className="text-gray-500 mb-6">很抱歉，您访问的文章可能已被删除或不存在。</p>
                        <div className="flex gap-4 justify-center">
                            <Button
                                onClick={() => window.history.back()}
                                className="px-6 py-2 bg-gray-100 text-gray-800 rounded-md hover:bg-gray-200 transition-colors"
                            >
                                <ArrowLeftOutlined className="mr-1"/>
                                返回上一页
                            </Button>
                            <Button
                                onClick={() => window.location.href = '/'}
                                className="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                            >
                                回到首页
                            </Button>
                        </div>
                    </div>
                </main>
                <Footer/>
            </div>
        );
    }

    // 渲染Markdown内容
    const renderedContent = md.render(article.content || '');

    return (
        <div className="flex min-h-screen flex-col bg-white font-sans">
            {/* 顶部导航栏 */}
            <Header/>

            {/* 主体内容 */}
            <main className="bg-gray-50 flex-1 pt-8 px-[5%]">
                {/* 三栏布局：左侧互动按钮 + 中间文章内容 + 右侧边栏 */}
                <div className="flex flex-col lg:flex-row">
                    {/* 左侧互动按钮区域 */}
                    <div className="hidden lg:block lg:w-[2%] ">
                        <div className="sticky top-36 flex flex-col items-end gap-6 max-h-[400px]">
                            {/* 点赞按钮 */}
                            <div className="flex flex-col items-center gap-1">
                                <Tooltip title="点赞">
                                    <Button
                                        type="text"
                                        variant="outlined"
                                        size="large"
                                        onClick={handleLike}
                                        icon={liked ? <LikeTwoTone/> : <LikeOutlined/>}
                                    />
                                </Tooltip>
                                <span className="text-xs text-gray-500">{likeCount}</span>
                            </div>

                            {/* 收藏按钮 */}
                            <div className="flex flex-col items-center gap-1">
                                <Tooltip title="收藏">
                                    <Button
                                        type="text"
                                        variant="outlined"
                                        size="large"
                                        onClick={handleCollect}
                                        icon={collected ? <StarTwoTone/> : <StarOutlined/>}
                                    />
                                </Tooltip>
                                <span className="text-xs text-gray-500">{collectionCount}</span>
                            </div>

                            {/* 评论按钮 */}
                            <div className="flex flex-col items-center gap-1">
                                <Tooltip title="评论">
                                    <Button
                                        type="text"
                                        variant="outlined"
                                        size="large"
                                        icon={<MessageOutlined/>}
                                    />
                                </Tooltip>
                                <span className="text-xs text-gray-500">{article.commentCount || 0}</span>
                            </div>

                            {/* 转发按钮 */}
                            <div className="flex flex-col items-center gap-1">
                                <Tooltip title="转发">
                                    <Button
                                        type="text"
                                        variant="outlined"
                                        size="large"
                                        onClick={handleShare}
                                        icon={<ShareAltOutlined/>}
                                    />
                                </Tooltip>
                            </div>

                            {/* 举报按钮 */}
                            <div className="flex flex-col items-end gap-1">
                                <Tooltip title="举报">
                                    <Button
                                        type="text"
                                        variant="outlined"
                                        size="large"
                                        icon={<ExclamationCircleOutlined/>}
                                    />
                                </Tooltip>
                            </div>
                        </div>
                    </div>

                    {/* 中间文章详情 */}
                    <div className="bg-white px-10 pt-8 lg:w-3/4 lg:mr-12 rounded-2xl">
                        {/* 响应式调整 */}
                        <div className="md:pr-4">
                            {/* 文章标题 */}
                            <h1 className="text-3xl font-semibold mb-4 text-gray-800 leading-snug">
                                {article.title}
                            </h1>

                            {/* 作者信息和统计数据 */}
                            <div
                                className="flex flex-wrap items-center gap-5 md:gap-6 mb-8 text-gray-500 pb-4 border-b border-gray-100">
                                <div className="flex items-center gap-3">
                                    <Avatar size={40} src={article.avatar || undefined} alt={article.authorName}/>
                                    <span
                                        className="font-medium text-gray-700">{article.authorName || '未知作者'}</span>
                                </div>
                                <div className="flex items-center gap-4">
                                    <Tooltip title="阅读量">
                                        <div className="flex items-center gap-2">
                                            <EyeOutlined className="text-gray-400"/>
                                            <span>{article.readCount || 0}</span>
                                        </div>
                                    </Tooltip>
                                    <Tooltip title="点赞数">
                                        <div className="flex items-center gap-2">
                                            <LikeOutlined
                                                className={`${liked ? 'text-red-500' : 'text-gray-400'}`}/>
                                            <span>{likeCount}</span>
                                        </div>
                                    </Tooltip>
                                    <Tooltip title="评论数">
                                        <div className="flex items-center gap-2">
                                            <MessageOutlined className="text-gray-400"/>
                                            <span>{article.commentCount || 0}</span>
                                        </div>
                                    </Tooltip>
                                </div>
                                <div className="flex items-center gap-1 text-sm text-gray-400">
                                    <span>{article.publishTime ? new Date(article.publishTime).toLocaleDateString('zh-CN', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    }) : ''}</span>
                                </div>
                            </div>

                            {/* 文章摘要 */}
                            {article.summary && (
                                <div
                                    className="mb-8 text-sm text-gray-500 italic border-l-4 border-gray-200 pl-4 py-2 bg-gray-50 rounded-r">
                                    {article.summary}
                                </div>
                            )}

                            {/* 文章封面图 */}
                            {article.coverImage && (
                                <div className="mb-8 rounded-lg overflow-hidden shadow-md">
                                    <img
                                        src={article.coverImage}
                                        alt={article.title}
                                        className="w-full h-64 md:h-80 object-cover transition-transform duration-300 hover:scale-105"
                                    />
                                </div>
                            )}

                            {/* 文章内容 */}
                            <div
                                ref={contentRef}
                                className="mb-12 text-gray-700 leading-relaxed"
                            >
                                <div
                                    className="prose max-w-none prose-headings:text-gray-800 prose-p:text-gray-700 prose-a:text-blue-600 prose-a:no-underline prose-a:hover:underline prose-ul:list-disc prose-ol:list-decimal prose-img:rounded-lg prose-img:my-6 prose-blockquote:border-l-4 prose-blockquote:border-gray-200 prose-blockquote:pl-4 prose-blockquote:italic prose-code:bg-gray-100 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-table:border prose-table:border-gray-200 prose-table:w-full prose-table:my-6"
                                    dangerouslySetInnerHTML={{__html: renderedContent}}
                                />
                            </div>

                            {/* 文章标签 */}
                            {article.tags && article.tags.length > 0 && (
                                <div className="mb-10 flex flex-wrap gap-2">
                                    {article.tags.map((tag, index) => (
                                        <span key={index}
                                              className="text-xs bg-blue-50 text-blue-600 px-3 py-1 rounded-full hover:bg-blue-100 transition-colors">
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            )}

                            {/* 操作按钮 */}
                            <div
                                className="flex flex-wrap items-center justify-center gap-20 px-10 py-6 border-t border-gray-100">
                                <Button
                                    onClick={handleLike}
                                    size="large"
                                    shape="round"
                                    icon={<LikeOutlined className={liked ? 'text-red-500' : ''}/>}
                                    className={`${liked ? 'text-red-500 bg-red-50 border-red-200' : 'text-gray-600 border-gray-200'} px-4 py-2 rounded-full hover:shadow-sm transition-all`}
                                >
                                    {liked ? '已点赞' : '点赞'}
                                </Button>
                                <Button
                                    onClick={handleCollect}
                                    size="large"
                                    shape="round"
                                    icon={<StarOutlined className={collected ? 'text-yellow-500' : ''}/>}
                                    className={`${collected ? 'text-yellow-500 bg-yellow-50 border-yellow-200' : 'text-gray-600 border-gray-200'} px-4 py-2 rounded-full hover:shadow-sm transition-all`}
                                >
                                    {collected ? '已收藏' : '收藏'}
                                </Button>
                                <Button
                                    onClick={handleShare}
                                    size="large"
                                    shape="round"
                                    icon={<ShareAltOutlined/>}
                                    className="text-gray-600 border-gray-200 px-4 py-2 rounded-full hover:shadow-sm transition-all"
                                >
                                    分享
                                </Button>
                            </div>

                            {/* 评论区 */}
                            <CommentSection
                                articleId={Number(id)}
                                currentUserId={isLoggedIn ? Number(user.id) : undefined}
                                currentUserNickname={user.nickname}
                                currentUserAvatar={user.avatar}
                            />
                        </div>
                    </div>

                    {/* 右侧边栏 */}
                    <div className="lg:w-1/4">
                        {/* 响应式调整 */}
                        <div className="sticky mb-10">
                            {/* 作者信息 */}
                            <Card
                                style={{marginBottom: 30, background: "white"}}>
                                <div className="text-center mb-4">
                                    <Avatar size={80} src={article.avatar || undefined} alt={article.authorName}/>
                                    <h3 className="mt-4 text-lg font-semibold text-gray-800 mb-1">{article.authorName || '未知作者'}</h3>
                                    <div className="text-center text-sm text-gray-500">
                                        <p className="mt-2">
                                            {article.signature || '暂无简介'}
                                        </p>
                                    </div>
                                    <Divider className="my-4"/>
                                    <Button
                                        type="primary"
                                        className="w-[60%] py-2 bg-blue-500 text-white hover:bg-blue-600 transition-colors rounded-md">
                                        关注作者
                                    </Button>
                                </div>

                            </Card>

                            {/* 作者相关文章 */}
                            <Card className="mb-8 border border-gray-100 rounded-lg shadow-sm"
                                  title="作者相关文章">
                                <List
                                    size="small"
                                    dataSource={relatedArticles}
                                    renderItem={(item) => (
                                        <List.Item className="py-3">
                                            <List.Item.Meta
                                                title={
                                                    <a href={`/article/${item.id}`}
                                                       className="text-gray-800 hover:text-blue-600 transition-colors">
                                                        {item.title}
                                                    </a>
                                                }
                                                description={
                                                    <span className="text-gray-400 text-xs">
                                                        {item.publishTime}
                                                    </span>
                                                }
                                            />
                                        </List.Item>
                                    )}
                                />
                            </Card>

                            {/* 文章目录 */}
                            {toc.length > 0 && (
                                <Card className="border border-gray-100 rounded-lg shadow-sm" title="文章目录">
                                    <div className="text-sm">
                                        {toc.map((item, index) => (
                                            <div
                                                key={index}
                                                className={`mb-2 pl-${(item.level - 1) * 4} cursor-pointer hover:text-blue-600 transition-colors`}
                                                onClick={() => scrollToHeading(item.id)}
                                            >
                                                <LinkOutlined className="mr-1 text-gray-400"/>
                                                {item.text}
                                            </div>
                                        ))}
                                    </div>
                                </Card>
                            )}
                        </div>
                    </div>
                </div>
            </main>

            {/* 页脚信息 */}
            <Footer/>
        </div>
    );
};

export default ArticleDetail;