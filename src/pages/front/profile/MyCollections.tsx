import React, {useState, useEffect, useCallback} from 'react';
import {Button, Input, message, Tag, Empty, Card, Space, Popover, Divider, Pagination, Spin, Modal, Form} from 'antd';
import {
    DeleteOutlined,
    EyeOutlined,
    LikeOutlined,
    MessageOutlined,
    MoreOutlined,
    ShareAltOutlined,
    FlagOutlined,
    SearchOutlined,
    UpCircleTwoTone,
    DownCircleTwoTone,
    FolderTwoTone,
    FolderAddTwoTone,
    FolderOutlined
} from '@ant-design/icons';
import {ROUTES} from '../../../routes/constants';
import articleService, {type MyArticleCollectionList} from '../../../services/articleService';
import {DefaultStatusEnum, ArticleOriginalMap} from '../../../types/enums';
import {formatDateTimeShort} from '../../../utils/dateUtils';

// 收藏夹类型定义
interface CollectionFolder {
    id: string;
    name: string;
    count: number;
    isDefault: boolean;
}

// 排序类型
type SortType = 'recent' | 'mostLiked' | 'mostViewed';

const MyCollections: React.FC = () => {
    // 状态管理
    const [folders, setFolders] = useState<CollectionFolder[]>([]);
    const [defaultFolderId, setDefaultFolderId] = useState<number>(0);
    const [selectedFolder, setSelectedFolder] = useState<string>('all');
    const [sortType, setSortType] = useState<SortType>('recent');
    const [searchText, setSearchText] = useState('');
    const [showFolderList, setShowFolderList] = useState(false);
    const [collections, setCollections] = useState<MyArticleCollectionList[]>([]);
    const [total, setTotal] = useState(0);
    const [totalCollectionCount, setTotalCollectionCount] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [loading, setLoading] = useState(false);
    const [loadingFolders, setLoadingFolders] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
    const [createFolderLoading, setCreateFolderLoading] = useState(false);
    const [form] = Form.useForm();

    // 获取收藏文件夹列表
    const fetchFolders = useCallback(async () => {
        setLoadingFolders(true);
        try {
            const response = await articleService.getCollectionFolders();
            if (response.code === 200 && response.data) {
                const formattedFolders: CollectionFolder[] = response.data.map((folder: {
                    id: number;
                    name: string;
                    articleCount: number;
                    defaultFolder: DefaultStatusEnum | string;
                }) => ({
                    id: folder.id.toString(),
                    name: folder.name,
                    count: folder.articleCount || 0,
                    isDefault: folder.defaultFolder === DefaultStatusEnum.YES || folder.defaultFolder === 'YES'
                }));
                setFolders(formattedFolders);

                // 提取默认收藏夹ID
                const defaultFolder = formattedFolders.find(f => f.isDefault);
                if (defaultFolder) {
                    setDefaultFolderId(Number(defaultFolder.id));
                }
            }
        } catch (err) {
            console.error('获取收藏文件夹失败:', err);
        } finally {
            setLoadingFolders(false);
        }
    }, []);

    // 获取总收藏数
    const fetchTotalCollectionCount = useCallback(async () => {
        try {
            const response = await articleService.getTotalCollectionCount();
            if (response.code === 200 && response.data) {
                setTotalCollectionCount(response.data);
            }
        } catch (err) {
            console.error('获取总收藏数失败:', err);
        }
    }, []);

    // 获取收藏文章列表
    const fetchCollections = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            console.log('selectedFolder:', selectedFolder);
            console.log('defaultFolderId:', defaultFolderId);
            const folderId = selectedFolder === 'all' ? undefined : selectedFolder === 'default' ? defaultFolderId : Number(selectedFolder);
            console.log('folderId:', folderId);
            const response = await articleService.getMyCollections({
                folderId: folderId,
                page: currentPage,
                size: pageSize,
                sortBy: sortType === 'recent' ? 'collectTime' : sortType === 'mostLiked' ? 'likeCount' : 'readCount',
                sortOrder: 'desc',
                keyword: searchText
            });

            if (response.code === 200 && response.data) {
                // 转换数据格式以匹配前端接口
                console.log(response.data);
                const formattedCollections = response.data.record.map(result => ({
                    collectionId: result.collectionId,
                    articleId: result.articleId,
                    title: result.title,
                    summary: result.summary,
                    coverImage: result.coverImage,
                    userId: result.userId,
                    authorName: result.authorName,
                    avatar: result.avatar,
                    categoryName: result.categoryName,
                    articleStatus: result.articleStatus,
                    originalStatus: result.originalStatus,
                    collectTime: result.collectTime,
                    publishTime: result.publishTime,
                    readCount: result.readCount,
                    likeCount: result.likeCount,
                    commentCount: result.commentCount,
                    collectionStatus: result.collectionStatus,
                    folderId: result.folderId,
                    folderName: result.folderName
                }));
                setCollections(formattedCollections);
                setTotal(response.data.total);
            } else {
                setError(response.message || '获取收藏文章失败');
            }
        } catch (err) {
            setError('网络错误，请稍后重试');
            console.error('获取收藏文章失败:', err);
        } finally {
            setLoading(false);
        }
    }, [selectedFolder, sortType, searchText, currentPage, pageSize, defaultFolderId]);

    // 初始加载和参数变化时重新获取数据
    useEffect(() => {
        // 获取文件夹列表和总收藏数
        void fetchFolders();
        void fetchTotalCollectionCount();
        // 获取收藏文章列表
        void fetchCollections();
    }, [fetchCollections, fetchFolders, fetchTotalCollectionCount]);

    // 取消单个收藏
    const handleSingleDelete = async (articleId: string) => {
        try {
            setLoading(true);
            const result = await articleService.unCollectArticle(Number(articleId))
            if (result.code !== 200) {
                message.error(result.message || '取消收藏失败');
                return;
            }
            message.success(result.message || '已取消收藏');
            // 重新加载数据
            await fetchCollections();
            // 重新获取文件夹列表和总收藏数
            await fetchFolders();
            await fetchTotalCollectionCount();
        } catch (error) {
            message.error('取消收藏失败，请重试');
            console.error('取消收藏失败:', error);
        } finally {
            setLoading(false);
        }
    };

    // 分享文章
    const handleShare = () => {
        message.success('分享功能已触发');
    };

    // 举报文章
    const handleReport = () => {
        message.success('举报功能已触发');
    };

    // 打开新建收藏夹模态框
    const handleOpenCreateModal = () => {
        form.resetFields();
        setIsCreateModalVisible(true);
    };

    // 关闭新建收藏夹模态框
    const handleCloseCreateModal = () => {
        setIsCreateModalVisible(false);
    };

    // 提交新建收藏夹表单
    const handleCreateFolder = async (values: { folderName: string; folderDescription?: string }) => {
        setCreateFolderLoading(true);
        try {
            const response = await articleService.createCollectionFolder({
                folderName: values.folderName,
                folderDescription: values.folderDescription
            });
            if (response.code === 200 && response.data) {
                message.success('收藏夹创建成功');
                setIsCreateModalVisible(false);
                // 重新获取文件夹列表
                await fetchFolders();
            } else {
                message.error(response.message || '创建收藏夹失败');
            }
        } catch (error) {
            message.error('创建收藏夹失败，请重试');
            console.error('创建收藏夹失败:', error);
        } finally {
            setCreateFolderLoading(false);
        }
    };


    return (
        <div className="mx-auto">
            {/* 页面标题 */}
            <div className="flex items-center gap-2 mb-6">
                <h1 className="text-2xl font-bold text-secondary-800">我的收藏</h1>
                <div>({totalCollectionCount})</div>
            </div>

            <div className="flex gap-4">
                {/* 左侧收藏夹列表 */}
                <div className="w-48 shrink-0">
                    <Card
                        title="收藏夹列表"
                        variant={"borderless"}
                        styles={{
                            header: {padding: '2px 0', fontSize: '1.25rem'},
                            body: {padding: '4px'}
                        }}
                    >
                        {loadingFolders ? (
                            <div className="py-4 flex justify-center">
                                <Spin size="small"/>
                            </div>
                        ) : (
                            <>
                                {/* 全部收藏 */}
                                <div
                                    className={`flex items-center py-2 pr-2 rounded-lg cursor-pointer mb-2 ${selectedFolder === 'all' ? 'bg-primary-50 text-primary-600' : 'hover:bg-secondary-50'}`}
                                    onClick={() => setSelectedFolder('all')}
                                >
                                    <FolderTwoTone className="mr-2"/>
                                    <span className="flex-1">全部收藏</span>
                                    <span className={"font-medium"}>{totalCollectionCount}</span>
                                </div>

                                <div
                                    className="flex items-center py-2 rounded-lg cursor-pointer mb-2 hover:bg-secondary-50"
                                    onClick={handleOpenCreateModal}
                                >
                                    <FolderAddTwoTone className="mr-2"/>
                                    <span>新建收藏夹</span>
                                </div>

                                {/* 我的收藏夹标题 */}
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center">
                                        <FolderOutlined className="mr-2"/>
                                        <span className="font-medium text-secondary-500">我的收藏夹</span>
                                    </div>
                                    <Button
                                        type="text"
                                        size="small"
                                        onClick={() => setShowFolderList(!showFolderList)}
                                    >
                                        {showFolderList ? <UpCircleTwoTone style={{fontSize: '20px'}} /> : <DownCircleTwoTone style={{fontSize: '20px'}} />}
                                    </Button>
                                </div>

                                {/* 我的收藏夹列表 */}
                                {showFolderList && (
                                    <div className="space-y-1 pr-1">
                                        {/* 默认收藏夹 */}
                                        <div
                                            className={`flex items-center p-2 rounded-lg cursor-pointer ${selectedFolder === 'default' ? 'bg-primary-50 text-primary-600' : 'hover:bg-secondary-50'}`}
                                            onClick={() => setSelectedFolder('default')}
                                        >
                                            <FolderOutlined className="mr-2"/>
                                            <span className="flex-1">默认收藏夹</span>
                                            <span>{folders.find(f => f.isDefault)?.count || 0}</span>
                                        </div>

                                        {/* 其他创建的收藏夹 */}
                                        {folders.filter(f => !f.isDefault).map(folder => (
                                            <div
                                                key={folder.id}
                                                className={`flex items-center p-2 rounded-lg cursor-pointer ${selectedFolder === folder.id ? 'bg-primary-50 text-primary-600' : 'hover:bg-secondary-50'}`}
                                                onClick={() => setSelectedFolder(folder.id)}
                                            >
                                                <FolderOutlined className="mr-2"/>
                                                <span className="flex-1">{folder.name}</span>
                                                <span>{folder.count}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </>
                        )}
                    </Card>
                </div>

                {/* 右侧文章列表 */}
                <div className="flex-1">
                    {/* 排序和搜索区域 */}
                    <div
                        className="border-b border-gray-200 flex flex-wrap justify-between items-center pb-4 mb-6">
                        {/* 排序选项 */}
                        <div className="flex space-x-4 mb-2 md:mb-0">
                            <Button
                                color={sortType === 'recent' ? 'cyan' : 'default'}
                                variant={sortType === 'recent' ? 'solid' : 'text'}
                                size="large"
                                onClick={() => setSortType('recent')}
                            >
                                最近收藏
                            </Button>
                            <Button
                                color={sortType === 'mostLiked' ? 'cyan' : 'default'}
                                variant={sortType === 'mostLiked' ? 'solid' : 'text'}
                                size="large"
                                onClick={() => setSortType('mostLiked')}
                            >
                                最多点赞
                            </Button>
                            <Button
                                color={sortType === 'mostViewed' ? 'cyan' : 'default'}
                                variant={sortType === 'mostViewed' ? 'solid' : 'text'}
                                size="large"
                                onClick={() => setSortType('mostViewed')}
                            >
                                最多浏览
                            </Button>
                        </div>

                        {/* 搜索框 */}
                        <div className="flex items-center gap-24">
                            <Input
                                placeholder="搜索收藏的文章"
                                prefix={<SearchOutlined/>}
                                value={searchText}
                                onChange={(e) => setSearchText(e.target.value)}
                                style={{width: 300}}
                            />
                        </div>
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
                                <Button type="primary" onClick={fetchCollections}>重试</Button>
                            </div>
                        </div>
                    ) : collections.length > 0 ? (
                        <>
                            <div className="space-y-5">
                                {collections.map((collection) => (
                                    <Card
                                        key={collection.collectionId}
                                        variant="borderless"
                                        styles={{
                                            body: {
                                                padding: '20px 12px',
                                                borderBottom: '1px solid #e8e8e8',
                                                borderRadius: 0
                                            }
                                        }}
                                    >
                                        <div className="flex items-start gap-4">
                                            {/* 文章内容 */}
                                            <div className="flex-1">
                                                {/* 第一行：文章标题 */}
                                                <div className="flex items-center mb-2">
                                                    <h3 className="text-xl font-semibold text-secondary-800 hover:text-primary-600 transition-colors duration-200 flex-1">
                                                        <a
                                                            href={ROUTES.ARTICLE_DETAIL(collection.articleId.toString())}
                                                            className="hover:underline"
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                        >
                                                            {collection.title}
                                                        </a>
                                                    </h3>
                                                </div>

                                                {/* 第二行：简介 */}
                                                <div className="text-sm text-secondary-500 mb-4 line-clamp-2">
                                                    {collection.summary}
                                                </div>

                                                {/* 第三行：收藏时间、作者信息、统计数据 */}
                                                <div className="flex flex-wrap items-center justify-between">
                                                    <div
                                                        className="flex items-center gap-3 justify-between text-sm text-secondary-500">
                                                        {/*原创*/}
                                                        <div className="flex items-center">
                                                            <Tag variant="solid"
                                                                 color={'gold'}>
                                                                {ArticleOriginalMap[collection.originalStatus]}
                                                            </Tag>
                                                            <Divider orientation="vertical" className={"bg-gray-300"}
                                                                     style={{height: '16px'}}/>
                                                            {/*分类*/}
                                                            <span>{collection.categoryName || '无'}</span>
                                                            <Divider orientation="vertical" className={"bg-gray-300"}
                                                                     style={{height: '16px'}}/>

                                                        </div>

                                                        <div className="flex items-center gap-3">
                                                            <div className="flex items-center">
                                                                <img
                                                                    src={collection.avatar}
                                                                    alt={collection.authorName}
                                                                    className="w-7 h-7 rounded-full object-cover"
                                                                />
                                                                <span>{collection.authorName}</span>
                                                            </div>
                                                            <Space size={4}>
                                                                <EyeOutlined/> {collection.readCount}
                                                            </Space>
                                                            <Space size={4}>
                                                                <LikeOutlined/> {collection.likeCount}
                                                            </Space>
                                                            <Space size={4}>
                                                                <MessageOutlined/> {collection.commentCount}
                                                            </Space>
                                                            <div className="flex items-center pl-2">
                                                                <span>收藏于: {collection.collectTime ? formatDateTimeShort(collection.collectTime) : ''}</span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* 更多操作 */}
                                                    <div className="flex items-center space-x-2">
                                                        <Popover
                                                            placement="bottom"
                                                            content={
                                                                <Space orientation="vertical">
                                                                    <Button
                                                                        icon={<ShareAltOutlined/>}
                                                                        size="small"
                                                                        type="text"
                                                                        onClick={handleShare}
                                                                    >
                                                                        转发
                                                                    </Button>
                                                                    <Button
                                                                        icon={<FlagOutlined/>}
                                                                        size="small"
                                                                        type="text"
                                                                        onClick={handleReport}
                                                                    >
                                                                        举报
                                                                    </Button>
                                                                    <Button
                                                                        icon={<DeleteOutlined/>}
                                                                        size="small"
                                                                        type="text"
                                                                        danger
                                                                        onClick={() => handleSingleDelete(collection.articleId.toString())}
                                                                    >
                                                                        取消收藏
                                                                    </Button>
                                                                </Space>
                                                            }
                                                            trigger="click"
                                                        >
                                                            <Button icon={<MoreOutlined/>} size="small" type="text"/>
                                                        </Popover>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* 文章封面图 */}
                                            {collection.coverImage && (
                                                <div className="shrink-0">
                                                    <img
                                                        src={collection.coverImage}
                                                        alt={collection.title}
                                                        className="w-48 h-28 object-cover rounded-lg"
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    </Card>
                                ))}
                            </div>

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
                        </>
                    ) : (
                        <div
                            className="flex flex-col items-center justify-center py-20 bg-white rounded-xl shadow-sm">
                            <Empty image={Empty.PRESENTED_IMAGE_SIMPLE}
                                   description="暂无收藏的文章"
                                   className="py-8"
                            />
                        </div>
                    )}
                </div>
            </div>

            {/* 新建收藏夹模态框 */}
            <Modal
                title="新建收藏夹"
                open={isCreateModalVisible}
                onCancel={handleCloseCreateModal}
                footer={null}
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleCreateFolder}
                >
                    <Form.Item
                        name="folderName"
                        label="收藏夹名称"
                        rules={[{required: true, message: '请输入收藏夹名称'}]}
                    >
                        <Input placeholder="请输入收藏夹名称"/>
                    </Form.Item>
                    <Form.Item
                        name="folderDescription"
                        label="收藏夹描述"
                    >
                        <Input.TextArea placeholder="请输入收藏夹描述（可选）" rows={3}/>
                    </Form.Item>
                    <Form.Item>
                        <div className="flex justify-end gap-2">
                            <Button onClick={handleCloseCreateModal}>
                                取消
                            </Button>
                            <Button type="primary" htmlType="submit" loading={createFolderLoading}>
                                创建
                            </Button>
                        </div>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default MyCollections;