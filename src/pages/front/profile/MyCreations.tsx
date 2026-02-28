import React, {useMemo, useState} from 'react';
import {Button, Card, Empty, Input, message, Modal, Pagination, Popover, Space, Tag} from 'antd';
import {
    DeleteOutlined,
    LikeOutlined,
    EditOutlined,
    MessageOutlined,
    MoreOutlined,
    SearchOutlined,
    ShareAltOutlined
} from '@ant-design/icons';
import articleService from '../../../services/articleService.ts';

// 文章类型定义
interface Article {
    id: string;
    title: string;
    summary: string;
    publishTime: string;
    isOriginal: boolean;
    isPublic: boolean;
    status: 'published' | 'draft' | 'pending' | 'deleted';
    views: number;
    likes: number;
    comments: number;
    category: string;
    tags: string[];
}

const MyCreations: React.FC = () => {

    // 模拟文章数据
    const [articles] = useState<Article[]>([
        {
            id: '1',
            title: '如何提高写作技巧：实用指南',
            summary: '本文将分享一些实用的写作技巧，帮助你提高写作水平，包括如何构思、如何组织内容、如何修改等方面。',
            publishTime: '2026-01-25',
            isOriginal: true,
            isPublic: true,
            status: 'published',
            views: 1200,
            likes: 89,
            comments: 23,
            category: '写作',
            tags: ['写作技巧', '指南']
        },
        {
            id: '2',
            title: 'React 18 新特性详解',
            summary: 'React 18 带来了许多新特性，包括自动批处理、并发渲染、Suspense 改进等，本文将详细介绍这些特性。',
            publishTime: '2026-01-20',
            isOriginal: true,
            isPublic: false,
            status: 'published',
            views: 2500,
            likes: 156,
            comments: 45,
            category: '前端',
            tags: ['React', '前端']
        },
        {
            id: '3',
            title: 'TypeScript 类型系统深入理解',
            summary: 'TypeScript 的类型系统是其核心特性之一，本文将深入探讨 TypeScript 的类型系统，包括类型推断、泛型、类型守卫等。',
            publishTime: '2026-01-15',
            isOriginal: false,
            isPublic: true,
            status: 'draft',
            views: 0,
            likes: 0,
            comments: 0,
            category: '前端',
            tags: ['TypeScript', '类型系统']
        },
        {
            id: '4',
            title: '前端性能优化最佳实践',
            summary: '前端性能优化是提高用户体验的关键，本文将分享一些前端性能优化的最佳实践，包括资源加载优化、渲染优化、代码优化等。',
            publishTime: '2026-01-10',
            isOriginal: true,
            isPublic: true,
            status: 'published',
            views: 3200,
            likes: 210,
            comments: 67,
            category: '前端',
            tags: ['性能优化', '前端']
        },
        {
            id: '5',
            title: 'Python 数据分析入门',
            summary: '本文介绍 Python 数据分析的基本概念和工具，包括 NumPy、Pandas、Matplotlib 等库的使用。',
            publishTime: '2026-01-05',
            isOriginal: true,
            isPublic: true,
            status: 'pending',
            views: 0,
            likes: 0,
            comments: 0,
            category: '后端',
            tags: ['Python', '数据分析']
        },
        {
            id: '6',
            title: 'Docker 容器化实践',
            summary: '本文介绍 Docker 容器化技术的基本概念和实践，包括镜像构建、容器管理、网络配置等。',
            publishTime: '2026-01-01',
            isOriginal: false,
            isPublic: true,
            status: 'published',
            views: 1800,
            likes: 120,
            comments: 35,
            category: '后端',
            tags: ['Docker', '容器化']
        }
    ]);

    // 状态管理
    const [searchText, setSearchText] = useState('');
    const [currentStatus, setCurrentStatus] = useState<string>('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(3);
    const [deleteModalVisible, setDeleteModalVisible] = useState(false);
    const [deleteArticleId, setDeleteArticleId] = useState('');

    // 创作统计数据
    const stats = {
        totalArticles: articles.length
    };

    // 过滤文章
    const filteredArticles = useMemo(() => {
        return articles.filter(article => {
            // 搜索过滤
            const matchesSearch = article.title.toLowerCase().includes(searchText.toLowerCase()) ||
                article.summary.toLowerCase().includes(searchText.toLowerCase());

            // 状态过滤
            const matchesStatus = currentStatus === 'all' || article.status === currentStatus;

            return matchesSearch && matchesStatus;
        });
    }, [articles, searchText, currentStatus]);

    // 分页处理
    const paginatedArticles = useMemo(() => {
        const start = (currentPage - 1) * pageSize;
        const end = start + pageSize;
        return filteredArticles.slice(start, end);
    }, [filteredArticles, currentPage, pageSize]);

    // 分享文章
    const handleShare = () => {
        // 实现分享逻辑
        void message.success('分享功能已触发');
    };

    // 打开删除确认对话框
    const showDeleteConfirm = (articleId: string) => {
        setDeleteArticleId(articleId);
        setDeleteModalVisible(true);
    };

    // 关闭删除确认对话框
    const handleDeleteCancel = () => {
        setDeleteModalVisible(false);
        setDeleteArticleId('');
    };

    // 删除文章
    const handleDelete = async () => {
        if (!deleteArticleId) return;

        try {
            await articleService.deleteArticle(deleteArticleId);
            message.success('文章已删除');
            setDeleteModalVisible(false);
            setDeleteArticleId('');
            // 这里可以添加重新加载文章列表的逻辑
        } catch {
            message.error('删除失败，请重试');
        }
    };

    // 获取状态文本
    const getStatusText = (status: string) => {
        switch (status) {
            case 'published':
                return '已发布';
            case 'draft':
                return '草稿';
            case 'pending':
                return '待审核';
            case 'deleted':
                return '已删除';
            default:
                return '未知';
        }
    };

    return (
        <div className="mx-auto">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">我的创作 <span
                    className="text-gray-500 text-lg">({stats.totalArticles})</span></h1>
            </div>

            {/* 状态标签和搜索区域 */}
            <div className="border-b border-b-gray-200 flex flex-wrap justify-between items-center pb-4 ">
                {/* 状态标签 */}
                <div className="flex space-x-6 mb-2 md:mb-0">
                    <Button
                        color={currentStatus === 'all' ? 'cyan' : 'default'}
                        variant={currentStatus === 'all' ? 'solid' : 'text'}
                        size="large"
                        onClick={() => setCurrentStatus('all')}
                    >
                        全部文章
                    </Button>
                    <Button
                        color={currentStatus === 'published' ? 'cyan' : 'default'}
                        variant={currentStatus === 'published' ? 'solid' : 'text'}
                        size="large"
                        onClick={() => setCurrentStatus('published')}
                    >
                        已发布
                    </Button>
                    <Button
                        color={currentStatus === 'draft' ? 'cyan' : 'default'}
                        variant={currentStatus === 'draft' ? 'solid' : 'text'}
                        size="large"
                        onClick={() => setCurrentStatus('draft')}
                    >
                        草稿
                    </Button>
                    <Button
                        color={currentStatus === 'pending' ? 'cyan' : 'default'}
                        variant={currentStatus === 'pending' ? 'solid' : 'text'}
                        size="large"
                        onClick={() => setCurrentStatus('pending')}
                    >
                        待审核
                    </Button>
                    <Button
                        color={currentStatus === 'deleted' ? 'cyan' : 'default'}
                        variant={currentStatus === 'deleted' ? 'solid' : 'text'}
                        size="large"
                        onClick={() => setCurrentStatus('deleted')}
                    >
                        回收站
                    </Button>
                </div>

                {/* 搜索框 */}
                <Input
                    placeholder={`搜索${currentStatus === 'all' ? '' : getStatusText(currentStatus)}文章`}
                    prefix={<SearchOutlined/>}
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    style={{width: 300, marginRight: 80}}
                />
            </div>

            {/* 文章列表 */}
            {paginatedArticles.length > 0 ? (
                <div className="space-y-4">
                    {paginatedArticles.map((article) => (
                        <Card key={article.id} variant="borderless"
                              style={{borderBottom: '1px solid #e8e8e8', borderRadius: 0}}>
                            <div className="flex justify-between items-start mb-3">
                                <a
                                    href={`/article/${article.id}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-xl font-semibold text-black hover:text-primary-600"
                                >
                                    {article.title}
                                </a>
                                <Space>
                                    <Tag variant="filled" color={article.isPublic ? 'blue' : 'default'}>
                                        {article.isPublic ? '公开' : '私密'}
                                    </Tag>
                                </Space>
                            </div>

                            <div className="text-gray-600 mb-4 line-clamp-2">
                                {article.summary}
                            </div>

                            <div className="flex flex-wrap items-center justify-between ">
                                <div className="flex items-center gap-5 text-sm text-gray-500">
                                    <Tag variant="solid"
                                         color={article.isOriginal ? 'gold' : 'green'}>
                                        {article.isOriginal ? '原创' : '非原创'}
                                    </Tag>
                                    <span>{article.publishTime}</span>
                                    <Space size={4}>
                                        <LikeOutlined/> {article.likes}
                                    </Space>
                                    <Space size={4}>
                                        <MessageOutlined/> {article.comments}
                                    </Space>
                                </div>

                                <div className="flex items-center space-x-2">
                                    <Popover
                                        placement="bottom"
                                        content={
                                            <Space orientation="vertical">
                                                <Button
                                                    icon={<EditOutlined/>}
                                                    size="small"
                                                    type="text"
                                                    onClick={handleShare}
                                                >
                                                    编辑
                                                </Button>
                                                <Button
                                                    icon={<ShareAltOutlined/>}
                                                    size="small"
                                                    type="text"
                                                    onClick={handleShare}
                                                >
                                                    分享
                                                </Button>
                                                <Button
                                                    icon={<DeleteOutlined/>}
                                                    size="small"
                                                    type="text"
                                                    danger
                                                    onClick={() => showDeleteConfirm(article.id)}
                                                >
                                                    删除
                                                </Button>
                                            </Space>
                                        }
                                        trigger="click"
                                    >
                                        <Button icon={<MoreOutlined/>} size="small" type="text"/>
                                    </Popover>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            ) : (
                <Empty description="暂无文章"/>
            )}

            {/* 分页 */}
            <div className="mt-6 flex justify-center">
                <Pagination
                    current={currentPage}
                    pageSize={pageSize}
                    total={filteredArticles.length}
                    onChange={(page) => setCurrentPage(page)}
                    onShowSizeChange={(_, size) => setPageSize(size)}
                    showSizeChanger
                    showTotal={(total) => `共 ${total} 篇文章`}
                />
            </div>

            {/* 删除确认对话框 */}
            <Modal
                title="确认删除"
                open={deleteModalVisible}
                onOk={handleDelete}
                onCancel={handleDeleteCancel}
                okText="确认删除"
                cancelText="取消"
            >
                <p>确定要删除这篇文章吗？此操作不可撤销。</p>
            </Modal>
        </div>
    );
};

export default MyCreations;