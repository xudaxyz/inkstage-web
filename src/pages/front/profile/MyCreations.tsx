import React, {useCallback, useEffect, useState, useMemo} from 'react';
import {Button, Card, Empty, Input, message, Modal, Pagination, Popover, Space, Tag, Spin} from 'antd';
import {
    DeleteOutlined,
    LikeOutlined,
    EditOutlined,
    MessageOutlined,
    MoreOutlined,
    SearchOutlined,
    ShareAltOutlined,
    EyeOutlined
} from '@ant-design/icons';
import {useNavigate} from 'react-router-dom';
import articleService, {type MyArticleList} from '../../../services/articleService.ts';
import {
    ArticleOriginalEnum,
    ArticleVisibleEnum,
    ArticleOriginalMap,
    ArticleStatusEnum,
    ArticleVisibleMap,
    ArticleStatusMap
} from '../../../types/enums';

// 文章类型定义
interface Article {
    id: string;
    title: string;
    summary: string;
    publishTime: string;
    original: ArticleOriginalEnum;
    visible: ArticleVisibleEnum;
    articleStatus: ArticleStatusEnum;
    readCount: number;
    likeCount: number;
    commentCount: number;
}

const MyCreations: React.FC = () => {
    const navigate = useNavigate();

    // 状态管理
    const [searchText, setSearchText] = useState('');
    const [debouncedSearchText, setDebouncedSearchText] = useState('');
    const [currentStatus, setCurrentStatus] = useState<ArticleStatusEnum>(ArticleStatusEnum.ALL);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(3);
    const [deleteModalVisible, setDeleteModalVisible] = useState(false);
    const [deleteArticleId, setDeleteArticleId] = useState('');
    const [articles, setArticles] = useState<Article[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // 搜索防抖
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearchText(searchText);
        }, 300);

        return () => clearTimeout(timer);
    }, [searchText]);

    // 创作统计数据
    const stats = useMemo(() => ({
        totalArticles: total
    }), [total]);

    // 获取文章列表
    const fetchArticles = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await articleService.getMyArticles({
                articleStatus: currentStatus,
                keyword: debouncedSearchText,
                page: currentPage,
                size: pageSize
            });
            if (response.code === 200 && response.data) {
                // 转换后端数据格式
                const formattedArticles: Article[] = response.data.record.map((item: MyArticleList) => ({
                    id: item.id.toString(),
                    title: item.title,
                    summary: item.summary,
                    publishTime: item.publishTime,
                    original: item.original as ArticleOriginalEnum || ArticleOriginalEnum.OTHER,
                    visible: item.visible as ArticleVisibleEnum || ArticleVisibleEnum.PUBLIC,
                    articleStatus: item.articleStatus as ArticleStatusEnum,
                    readCount: item.readCount || 0,
                    likeCount: item.likeCount || 0,
                    commentCount: item.commentCount || 0,
                }));
                setArticles(formattedArticles);
                setTotal(response.data.total);
            } else {
                setError(response.message || '获取文章列表失败');
            }
        } catch (err) {
            setError('网络错误，请稍后重试');
            console.error('获取文章列表失败:', err);
        } finally {
            setLoading(false);
        }
    }, [currentStatus, debouncedSearchText, currentPage, pageSize]);

    // 当状态、搜索词或分页参数变化时重新获取数据
    useEffect(() => {
        fetchArticles();
    }, [fetchArticles]);

    // 分享文章
    const handleShare = (articleId: string) => {
        // 实现分享逻辑
        void message.success('分享功能已触发');
        // 可以添加复制链接到剪贴板的功能
        const shareUrl = `${window.location.origin}/article/${articleId}`;
        navigator.clipboard.writeText(shareUrl).then(() => {
            message.success('链接已复制到剪贴板');
        }).catch(() => {
            console.error('复制失败');
        });
    };

    // 编辑文章
    const handleEdit = (articleId: string) => {
        navigate(`/edit-article/${articleId}`);
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
            setLoading(true);
            await articleService.deleteArticle(deleteArticleId);
            message.success('文章已删除');
            setDeleteModalVisible(false);
            setDeleteArticleId('');
            // 重新加载文章列表
            await fetchArticles();
        } catch (error) {
            message.error('删除失败，请重试');
            console.error('删除文章失败:', error);
        } finally {
            setLoading(false);
        }
    };

    // 状态变化时重置页码
    const handleStatusChange = (articleStatus: ArticleStatusEnum) => {
        setCurrentStatus(articleStatus);
        setCurrentPage(1);
    };

    // 获取状态文本
    const getStatusText = (status: string) => {
        switch (status) {
            case 'PUBLISHED':
                return '已发布';
            case 'DRAFT':
                return '草稿';
            case 'PENDING':
                return '待审核';
            case 'DELETED':
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
                        color={currentStatus === ArticleStatusEnum.ALL ? 'cyan' : 'default'}
                        variant={currentStatus === ArticleStatusEnum.ALL ? 'solid' : 'text'}
                        size="large"
                        onClick={() => handleStatusChange(ArticleStatusEnum.ALL)}
                    >
                        全部文章
                    </Button>
                    <Button
                        color={currentStatus === ArticleStatusEnum.PUBLISHED ? 'cyan' : 'default'}
                        variant={currentStatus === ArticleStatusEnum.PUBLISHED ? 'solid' : 'text'}
                        size="large"
                        onClick={() => handleStatusChange(ArticleStatusEnum.PUBLISHED)}
                    >
                        已发布
                    </Button>
                    <Button
                        color={currentStatus === ArticleStatusEnum.DRAFT ? 'cyan' : 'default'}
                        variant={currentStatus === ArticleStatusEnum.DRAFT ? 'solid' : 'text'}
                        size="large"
                        onClick={() => handleStatusChange(ArticleStatusEnum.DRAFT)}
                    >
                        草稿
                    </Button>
                    <Button
                        color={currentStatus === ArticleStatusEnum.PENDING ? 'cyan' : 'default'}
                        variant={currentStatus === ArticleStatusEnum.PENDING ? 'solid' : 'text'}
                        size="large"
                        onClick={() => handleStatusChange(ArticleStatusEnum.PENDING)}
                    >
                        待审核
                    </Button>
                    <Button
                        color={currentStatus === ArticleStatusEnum.RECYCLE ? 'cyan' : 'default'}
                        variant={currentStatus === ArticleStatusEnum.RECYCLE ? 'solid' : 'text'}
                        size="large"
                        onClick={() => handleStatusChange(ArticleStatusEnum.RECYCLE)}
                    >
                        回收站
                    </Button>
                </div>

                {/* 搜索框 */}
                <Input
                    placeholder={`搜索${currentStatus === ArticleStatusEnum.ALL ? '' : getStatusText(currentStatus)}文章`}
                    prefix={<SearchOutlined/>}
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    style={{width: 300, marginRight: 80}}
                />
            </div>

            {/* 文章列表 */}
            {loading ? (
                <div className="py-12 flex justify-center">
                    <Spin size="large" tip="加载中..."/>
                </div>
            ) : error ? (
                <div className="py-12 flex justify-center">
                    <div className="text-center">
                        <p className="text-red-500 mb-4">{error}</p>
                        <Button type="primary" onClick={fetchArticles}>重试</Button>
                    </div>
                </div>
            ) : articles.length > 0 ? (
                <div className="space-y-4">
                    {articles.map((article) => (
                        <Card key={article.id} variant="borderless"
                              style={{borderBottom: '1px solid #e8e8e8', borderRadius: 0}}>
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-start">
                                    <a
                                        href={`/article/${article.id}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-2xl font-semibold text-black hover:text-primary-600"
                                    >
                                        {article.title}
                                    </a>
                                    <div className="ml-1">
                                        <Tag variant="outlined"
                                             color={article.visible === ArticleVisibleEnum.PUBLIC ? 'green' : 'default'}>
                                            {ArticleVisibleMap[article.visible]}
                                        </Tag>
                                    </div>
                                </div>
                                <div className="flex items-center">
                                    <Tag variant="filled"
                                         color={article.articleStatus === ArticleStatusEnum.PUBLISHED ? 'default' : 'warning'}>
                                        {ArticleStatusMap[article.articleStatus]}
                                    </Tag>
                                </div>
                            </div>

                            <div className="text-gray-600 mb-4 line-clamp-2">
                                {article.summary}
                            </div>

                            <div className="flex flex-wrap items-center justify-between ">
                                <div className="flex items-center gap-5 text-sm text-gray-500">
                                    <Tag variant="solid"
                                         color={article.original === ArticleOriginalEnum.ORIGINAL ? 'gold' : 'green'}>
                                        {ArticleOriginalMap[article.original] || ArticleOriginalEnum.OTHER}
                                    </Tag>
                                    <span>{article.publishTime}</span>
                                    <Space size={4}>
                                        <EyeOutlined/> {article.readCount}
                                    </Space>
                                    <Space size={4}>
                                        <LikeOutlined/> {article.likeCount}
                                    </Space>
                                    <Space size={4}>
                                        <MessageOutlined/> {article.commentCount}
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
                                                    onClick={() => handleEdit(article.id)}
                                                >
                                                    编辑
                                                </Button>
                                                <Button
                                                    icon={<ShareAltOutlined/>}
                                                    size="small"
                                                    type="text"
                                                    onClick={() => handleShare(article.id)}
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
                <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="暂无文章"/>
            )}

            {/* 分页 */}
            <div className="mt-6 flex justify-center">
                <Pagination
                    current={currentPage}
                    pageSize={pageSize}
                    total={total}
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