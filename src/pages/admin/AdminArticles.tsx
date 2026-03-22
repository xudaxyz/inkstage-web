import React, { useState, useEffect, useCallback } from 'react';
import {
    Card,
    Table,
    Input,
    Button,
    Space,
    Tag,
    Modal,
    Form,
    Select,
    message,
    Typography,
    Popconfirm,
    Tabs,
    Descriptions,
    Badge,
    Divider
} from 'antd';
import {
    SearchOutlined,
    DeleteOutlined,
    EyeOutlined,
    EditOutlined,
    CalendarOutlined,
    CommentOutlined,
    TagOutlined,
    UserOutlined,
    CheckCircleOutlined,
    CloseCircleOutlined,
    LikeOutlined,
    ShareAltOutlined,
    StarOutlined,
    PushpinOutlined,
    PushpinTwoTone,
    GlobalOutlined,
    LockOutlined,
    LinkOutlined
} from '@ant-design/icons';
import articleService from '../../services/articleService';
import categoryService from '../../services/categoryService';
import { type AdminArticleList, type AdminArticleDetail } from '../../types/article';
import { type AdminCategory } from '../../types/category';
import {
    AllowStatusEnum, AllowTopEnum, AllowTopMap, ArticleOriginalEnum, ArticleReviewStatusEnum, ArticleReviewStatusMap,
    ArticleStatusEnum,
    ArticleStatusMap,
    ArticleVisibleEnum
} from '../../types/enums';
import { formatDateTime, formatDateTimeShort } from '../../utils';

const { Option } = Select;
const { Search } = Input;
const { Title, Text } = Typography;
const { TabPane } = Tabs;
// 状态选项
const statusOptions = Object.entries(ArticleStatusMap).map(([value, label]) => ({
    value,
    label
}));
// 可见性选项
const visibleOptions = [
    { value: ArticleVisibleEnum.PUBLIC, label: '公开' },
    { value: ArticleVisibleEnum.PRIVATE, label: '私有' },
    { value: ArticleVisibleEnum.FOLLOWERS_ONLY, label: '仅关注者可见' }
];
// 允许状态选项
const allowOptions = [
    { value: AllowStatusEnum.ALLOWED, label: '允许' },
    { value: AllowStatusEnum.PROHIBITED, label: '不允许' }
];
// 原创状态选项
const originalOptions = [
    { value: ArticleOriginalEnum.ORIGINAL, label: '原创' },
    { value: ArticleOriginalEnum.REPRINT, label: '转载' }
];
const AdminArticles: React.FC = () => {
    const [articles, setArticles] = useState<AdminArticleList[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [selectedStatus, setSelectedStatus] = useState<ArticleStatusEnum | undefined>();
    const [selectedCategory, setSelectedCategory] = useState<number | undefined>(undefined);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isViewModalVisible, setIsViewModalVisible] = useState(false);
    const [currentArticle, setCurrentArticle] = useState<AdminArticleDetail | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [form] = Form.useForm();
    const [rejectForm] = Form.useForm();
    const [pagination, setPagination] = useState({
        pageNum: 1,
        pageSize: 10,
        total: 0
    });
    const [categories, setCategories] = useState<Array<{ value: number; label: string }>>([]);
    const [reviewLoading, setReviewLoading] = useState(false);
    const [rejectModalVisible, setRejectModalVisible] = useState(false);
    // 获取文章列表
    const fetchArticles = useCallback(async (pageNum = 1, pageSize = 10): Promise<void> => {
        setLoading(true);
        try {
            const params = {
                pageNum,
                pageSize,
                categoryId: 0,
                keyword: searchText,
                articleStatus: selectedStatus
            };
            if (selectedCategory !== undefined && selectedCategory !== 0) {
                params.categoryId = selectedCategory;
            }
            const response = await articleService.admin.getArticlesByPage(params);
            if (response.code === 200 && response.data) {
                const articleList = response.data.record.map((article: AdminArticleList) => ({
                    id: article.id,
                    title: article.title,
                    nickname: article.nickname,
                    categoryName: article.categoryName,
                    articleStatus: article.articleStatus,
                    publishTime: article.publishTime,
                    readCount: article.readCount,
                    likeCount: article.likeCount,
                    commentCount: article.commentCount,
                    top: article.top,
                    reviewStatus: article.reviewStatus,
                    createTime: article.createTime,
                    updateTime: article.updateTime
                }));
                setArticles(articleList);
                setPagination(prev => ({
                    ...prev,
                    total: response.data.total
                }));
            } else {
                message.error('获取文章列表失败');
            }
        } catch (error) {
            console.error('获取文章列表失败:', error);
            message.error('获取文章列表失败');
        } finally {
            setLoading(false);
        }
    }, [searchText, selectedCategory, selectedStatus]);
    // 搜索和筛选文章
    const handleSearch = (value: string): void => {
        setSearchText(value);
        setPagination(prev => ({ ...prev, pageNum: 1 }));
    };
    const handleStatusChange = (value: ArticleStatusEnum): void => {
        setSelectedStatus(value);
        setPagination(prev => ({ ...prev, pageNum: 1 }));
    };
    const handleCategoryChange = (value: number | null): void => {
        setSelectedCategory(value === null ? undefined : value);
        setPagination(prev => ({ ...prev, pageNum: 1 }));
    };
    // 获取分类列表
    const fetchCategories = useCallback(async () => {
        try {
            const response = await categoryService.adminGetCategoriesByPage('', 1, 100);
            if (response.code === 200 && response.data) {
                const categoryList = response.data.record.map((category: AdminCategory) => ({
                    value: category.id,
                    label: category.name
                }));
                setCategories(categoryList);
            } else {
                message.error('获取分类列表失败');
            }
        } catch (error) {
            console.error('获取分类列表失败:', error);
            message.error('获取分类列表失败');
        }
    }, []);
    // 组件挂载时获取文章列表和分类列表
    useEffect((): void => {
        const loadData = async (): Promise<void> => {
            await fetchArticles();
        };
        void loadData();
    }, [fetchArticles]);
    // 组件挂载时获取分类列表
    useEffect((): void => {
        const loadCategories = async (): Promise<void> => {
            await fetchCategories();
        };
        void loadCategories();
    }, [fetchCategories]);
    // 打开编辑文章模态框
    const handleEditArticle = (article: AdminArticleList): void => {
        setIsEditing(true);
        setCurrentArticle(article as unknown as AdminArticleDetail);
        // 查找分类ID
        const category = categories.find(cat => cat.label === article.categoryName);
        form.setFieldsValue({
            title: article.title,
            nickname: article.nickname,
            category: category?.value || 0,
            reviewStatus: article.reviewStatus,
            status: article.articleStatus
        });
        setIsModalVisible(true);
    };
    // 打开查看文章模态框
    const handleViewArticle = async (article: AdminArticleList): Promise<void> => {
        try {
            const response = await articleService.admin.getArticleById(article.id);
            if (response.code === 200 && response.data) {
                setCurrentArticle(response.data);
                setIsViewModalVisible(true);
            } else {
                message.error('获取文章详情失败');
            }
        } catch (error) {
            console.error('获取文章详情失败:', error);
            message.error('获取文章详情失败');
        }
    };
    // 删除文章
    const handleDeleteArticle = async (id: number): Promise<void> => {
        try {
            const response = await articleService.admin.deleteArticle(id);
            if (response.code === 200 && response.data) {
                message.success('文章删除成功');
                await fetchArticles();
            } else {
                message.error('删除文章失败');
            }
        } catch (error) {
            console.error('删除文章失败:', error);
            message.error('删除文章失败');
        }
    };
    // 保存文章
    const handleSaveArticle = async (): Promise<void> => {
        form.validateFields().then(async values => {
            try {
                if (isEditing && currentArticle) {
                    // 编辑现有文章
                    const response = await articleService.updateArticle(currentArticle.id, {
                        title: values.title,
                        content: currentArticle.content,
                        categoryId: Number(values.category),
                        tags: values.tags,
                        status: values.status as ArticleStatusEnum,
                        visible: ArticleVisibleEnum.PUBLIC,
                        allowComment: AllowStatusEnum.ALLOWED,
                        allowForward: AllowStatusEnum.ALLOWED,
                        original: ArticleOriginalEnum.ORIGINAL
                    });
                    if (response.code === 200 && response.data) {
                        message.success('文章更新成功');
                        await fetchArticles();
                        setIsModalVisible(false);
                    } else {
                        message.error('更新文章失败');
                    }
                } else {
                    message.info('添加文章功能暂未实现');
                    setIsModalVisible(false);
                }
            } catch (error) {
                console.error('保存文章失败:', error);
                message.error('保存文章失败');
            }
        }).catch(error => {
            console.error('验证失败:', error);
        });
    };
    // 审核文章
    const handleReviewArticle = async (action: 'approve' | 'reject' | 'reprocess', rejectReason?: string): Promise<void> => {
        if (!currentArticle) return;
        setReviewLoading(true);
        try {
            let response;
            if (action === 'approve') {
                response = await articleService.admin.approveArticle(currentArticle.id);
            } else if (action === 'reject' && rejectReason) {
                response = await articleService.admin.rejectArticle(currentArticle.id, rejectReason);
            } else {
                response = await articleService.admin.reprocessArticle(currentArticle.id);
            }
            if (response.code === 200 && response.data) {
                message.success(action === 'approve' ? '审核通过' : action === 'reject' ? '审核拒绝' : '重新审核');
                // 重新获取文章详情
                const detailResponse = await articleService.admin.getArticleById(currentArticle.id);
                if (detailResponse.code === 200 && detailResponse.data) {
                    setCurrentArticle(detailResponse.data);
                }
                // 刷新文章列表
                await fetchArticles();
            } else {
                message.error('审核操作失败');
            }
        } catch (error) {
            console.error('审核操作失败:', error);
            message.error('审核操作失败');
        } finally {
            setReviewLoading(false);
        }
    };
    // 处理审核拒绝
    const handleRejectArticle = async (): Promise<void> => {
        try {
            const values = await rejectForm.validateFields();
            await handleReviewArticle('reject', values.rejectReason);
            setRejectModalVisible(false);
            rejectForm.resetFields();
        } catch (error) {
            console.error('验证失败:', error);
        }
    };
    // 获取状态标签颜色
    const getStatusColor = (status: string): string | undefined => {
        switch (status) {
            case ArticleStatusEnum.PUBLISHED:
                return 'green';
            case ArticleStatusEnum.DRAFT:
                return 'orange';
            case ArticleStatusEnum.PENDING_PUBLISH:
                return 'blue';
            case ArticleStatusEnum.OFFLINE:
                return 'gray';
            case ArticleStatusEnum.RECYCLE:
                return 'red';
            default:
                return 'default';
        }
    };
    // 获取审核状态标签颜色
    const getReviewStatusColor = (status: ArticleReviewStatusEnum): string | undefined => {
        switch (status) {
            case ArticleReviewStatusEnum.PENDING:
                return 'orange';
            case ArticleReviewStatusEnum.APPROVED:
                return 'green';
            case ArticleReviewStatusEnum.REJECTED:
                return 'red';
            case ArticleReviewStatusEnum.APPEALING:
                return 'blue';
            default:
                return 'default';
        }
    };
    // 表格列配置
    const columns = [
        {
            title: '序号',
            key: 'index',
            width: 60,
            render: (_: unknown, __: unknown, index: number): number => (pagination.pageNum - 1) * pagination.pageSize + index + 1
        },
        {
            title: '标题',
            dataIndex: 'title',
            key: 'title',
            width: 240,
            render: (text: string): React.ReactNode => (
                <div style={{ width: '100%', maxWidth: '300px' }}>
                    <Text ellipsis={{ tooltip: text }} className="font-medium">{text}</Text>
                </div>
            )
        },
        {
            title: '作者',
            dataIndex: 'nickname',
            key: 'nickname',
            width: 100
        },
        {
            title: '分类',
            dataIndex: 'categoryName',
            key: 'categoryName',
            align: 'center' as const,
            width: 100
        },
        {
            title: '文章状态',
            dataIndex: 'articleStatus',
            key: 'articleStatus',
            width: 90,
            render: (status: string): React.ReactNode => (
                <Tag color={getStatusColor(status)}>
                    {ArticleStatusMap[status as keyof typeof ArticleStatusMap] || status}
                </Tag>
            )
        },
        {
            title: '发布时间',
            dataIndex: 'publishTime',
            align: 'center' as const,
            key: 'publishTime',
            width: 160,
            render: (publishTime: string): React.ReactNode => (
                formatDateTimeShort(publishTime)
            )
        },
        {
            title: '阅读量',
            dataIndex: 'readCount',
            key: 'readCount',
            width: 80
        },
        {
            title: '点赞数',
            dataIndex: 'likeCount',
            key: 'likeCount',
            width: 80
        },
        {
            title: '评论数',
            dataIndex: 'commentCount',
            key: 'commentCount',
            width: 80
        },
        {
            title: '是否置顶',
            dataIndex: 'top',
            align: 'center' as const,
            key: 'top',
            width: 90,
            render: (top: AllowTopEnum): React.ReactNode => (
                <Tag color={top === AllowTopEnum.TOP ? 'red' : 'default'}>
                    {AllowTopMap[top]}
                </Tag>
            )
        },
        {
            title: '审核状态',
            dataIndex: 'reviewStatus',
            key: 'reviewStatus',
            width: 90,
            render: (reviewStatus: ArticleReviewStatusEnum): React.ReactNode => (
                <Tag color={getReviewStatusColor(reviewStatus)}>
                    {ArticleReviewStatusMap[reviewStatus]}
                </Tag>
            )
        },
        {
            title: '操作',
            key: 'action',
            align: 'center' as const,
            width: 180,
            render: (_: unknown, record: AdminArticleList): React.ReactNode => (
                <Space size="middle">
                    <Button
                        variant={'filled'}
                        color={'green'}
                        icon={<EyeOutlined/>}
                        onClick={() => handleViewArticle(record)}
                        className="text-blue-500"
                    >
                        查看
                    </Button>
                    <Button
                        variant={'filled'}
                        color={'blue'}
                        icon={<EditOutlined/>}
                        onClick={() => handleEditArticle(record)}
                        className="text-green-500"
                    >
                        编辑
                    </Button>
                    <Popconfirm
                        title="确定要删除这篇文章吗？"
                        description="删除后将无法恢复"
                        onConfirm={() => handleDeleteArticle(record.id)}
                        okText="确定"
                        cancelText="取消"
                    >
                        <Button
                            variant={'filled'}
                            color={'red'}
                            icon={<DeleteOutlined/>}
                            className="text-white"
                        >
                            删除
                        </Button>
                    </Popconfirm>
                </Space>
            )
        }
    ];
    return (
        <div className="mb-6">
            <div className="mb-6">
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">文章管理</h2>
            </div>

            {/* 搜索和筛选 */}
            <Card className="mb-6 border border-gray-100 shadow-sm">
                <div className="flex flex-col md:flex-row gap-4">
                    <Search
                        placeholder="搜索标题或作者"
                        allowClear
                        enterButton={<SearchOutlined/>}
                        onSearch={handleSearch}
                        style={{ width: 300 }}
                    />
                    <Select
                        placeholder="按状态筛选"
                        allowClear
                        style={{ width: 150 }}
                        onChange={handleStatusChange}
                    >
                        {statusOptions.map(option => (
                            <Option key={option.value} value={option.value}>
                                {option.label}
                            </Option>
                        ))}
                    </Select>
                    <Select
                        placeholder="按分类筛选"
                        allowClear
                        style={{ width: 150 }}
                        onChange={handleCategoryChange}
                    >
                        {categories.map(option => (
                            <Option key={option.value} value={option.value}>
                                {option.label}
                            </Option>
                        ))}
                    </Select>
                </div>
            </Card>

            {/* 文章列表 */}
            <Card className="border border-gray-100 shadow-sm">
                <Table
                    columns={columns}
                    dataSource={articles}
                    rowKey="id"
                    loading={loading}
                    pagination={{
                        showSizeChanger: true,
                        placement: ['bottomCenter'],
                        pageSizeOptions: ['10', '20', '50'],
                        pageSize: pagination.pageSize,
                        current: pagination.pageNum,
                        total: pagination.total,
                        showTotal: (total) => `共 ${total} 篇文章`,
                        onChange: (pageNum, pageSize) => {
                            setPagination(prev => ({
                                ...prev,
                                pageNum: pageNum,
                                pageSize: pageSize
                            }));
                            void fetchArticles(pageNum, pageSize);
                        }
                    }}
                />
            </Card>

            {/* 添加/编辑文章模态框 */}
            <Modal
                title={isEditing ? '编辑文章' : '添加文章'}
                open={isModalVisible}
                onOk={handleSaveArticle}
                onCancel={() => setIsModalVisible(false)}
                width={600}
                okText="保存"
                cancelText="取消"
            >
                <Form
                    form={form}
                    layout="vertical"
                    initialValues={{
                        status: 'draft'
                    }}
                >
                    <Form.Item
                        name="title"
                        label="标题"
                        rules={[
                            { required: true, message: '请输入标题' },
                            { min: 2, max: 100, message: '标题长度应在2-100个字符之间' }
                        ]}
                    >
                        <Input placeholder="请输入标题"/>
                    </Form.Item>

                    <Form.Item
                        name="nickname"
                        label="作者"
                        rules={[
                            { required: true, message: '请输入作者' },
                            { min: 2, max: 20, message: '作者名称长度应在2-20个字符之间' }
                        ]}
                    >
                        <Input prefix={<UserOutlined/>} placeholder="请输入作者"/>
                    </Form.Item>

                    <Form.Item
                        name="category"
                        label="分类"
                        rules={[{ required: true, message: '请选择分类' }]}
                    >
                        <Select placeholder="请选择分类">
                            {categories.map(option => (
                                <Option key={option.value} value={option.value}>
                                    {option.label}
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="tags"
                        label="标签"
                        rules={[{ required: true, message: '请输入标签' }]}
                    >
                        <Input prefix={<TagOutlined/>} placeholder="请输入标签，多个标签用逗号分隔"/>
                    </Form.Item>

                    <Form.Item
                        name="status"
                        label="状态"
                        rules={[{ required: true, message: '请选择状态' }]}
                    >
                        <Select placeholder="请选择状态">
                            {statusOptions.map(option => (
                                <Option key={option.value} value={option.value}>
                                    {option.label}
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>
                </Form>
            </Modal>

            {/* 查看文章模态框 */}
            <Modal
                title="文章详情"
                open={isViewModalVisible}
                onCancel={() => setIsViewModalVisible(false)}
                width={1000}
                height={800}
                footer={[
                    <div key="status" className="flex mr-60">
                        <span className="font-medium mr-1">当前审核状态:</span>
                        {currentArticle && (
                            <Tag color={getReviewStatusColor(currentArticle.reviewStatus || 'PENDING')}
                                 className="text-lg">
                                {ArticleReviewStatusMap[currentArticle.reviewStatus || 'PENDING']}
                            </Tag>
                        )}
                    </div>,
                    <Button
                        key="approve"
                        color="green"
                        variant="filled"
                        icon={<CheckCircleOutlined/>}
                        onClick={() => handleReviewArticle('approve')}
                        loading={reviewLoading}
                        disabled={currentArticle?.reviewStatus === ArticleReviewStatusEnum.APPROVED}
                        className="px-6 py-2 mr-10"
                    >
                        审核通过
                    </Button>,
                    <Button
                        key="reject"
                        color="red"
                        variant="filled"
                        icon={<CloseCircleOutlined/>}
                        onClick={() => setRejectModalVisible(true)}
                        loading={reviewLoading}
                        disabled={currentArticle?.reviewStatus === ArticleReviewStatusEnum.REJECTED}
                        className="px-6 py-2 mr-10"
                    >
                        审核拒绝
                    </Button>,
                    <Button
                        key="reprocess"
                        color="cyan"
                        variant="filled"
                        icon={<CheckCircleOutlined/>}
                        onClick={() => handleReviewArticle('reprocess')}
                        loading={reviewLoading}
                        className="px-6 py-2 mr-10"
                    >
                        重新审核
                    </Button>,
                    <Button color="default"
                            variant="filled"
                            key="close" onClick={() => setIsViewModalVisible(false)}
                            className="px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 transition-all duration-200 mr-2">
                        取消
                    </Button>
                ]}
                styles={{
                    body: {
                        padding: 0,
                        height: '100%',
                        maxHeight: 700,
                        overflow: 'hidden',
                        alignItems: 'start'
                    },
                    footer: {
                        display: 'flex',
                        alignItems: 'center',
                        justifyItems: 'start'
                    }
                }}
                style={{
                    borderRadius: '12px',
                    boxShadow: '0 12px 40px rgba(0, 0, 0, 0.12)',
                    overflow: 'hidden'
                }}
            >
                {currentArticle && (
                    <div className="space-y-6">
                        {/* 文章标题和基本信息 */}
                        <div>
                            <Title level={3}>{currentArticle.title}</Title>
                            <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-4">
                <span className="flex items-center gap-1">
                  <UserOutlined/> {currentArticle.nickname}
                </span>
                                <span className="flex items-center gap-1">
                  <CalendarOutlined/> {currentArticle.publishTime ? formatDateTimeShort(currentArticle.publishTime) : ''}
                </span>
                                <span className="flex items-center gap-1">
                  <EyeOutlined/> {currentArticle.readCount} 浏览
                </span>
                                <span className="flex items-center gap-1">
                  <CommentOutlined/> {currentArticle.commentCount} 评论
                </span>
                                <span className="flex items-center gap-1">
                  <LikeOutlined/> {currentArticle.likeCount} 点赞
                </span>
                                <span className="flex items-center gap-1">
                  <StarOutlined/>{currentArticle.collectionCount} 收藏
                </span>
                                <span className="flex items-center gap-1">
                  <ShareAltOutlined/>{currentArticle.shareCount} 分享
                </span>
                                <span className="flex items-center gap-1">
                  {currentArticle.top === AllowTopEnum.TOP ? <PushpinTwoTone/> :
                      <PushpinOutlined className="text-gray-400"/>}
                                    {AllowTopMap[currentArticle.top as keyof typeof AllowTopMap] || currentArticle.top}
                </span>
                                <Tag color={getStatusColor(currentArticle.articleStatus)}>
                                    {ArticleStatusMap[currentArticle.articleStatus as keyof typeof ArticleStatusMap] || currentArticle.articleStatus}
                                </Tag>
                            </div>
                        </div>

                        <Tabs defaultActiveKey="basic" className="mt-4">
                            {/* 基本信息 */}
                            <TabPane tab="基本信息" key="basic">
                                <div className="h-[500px] overflow-y-auto">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {/* 左侧信息 */}
                                        <Space orientation="vertical" size={32}>
                                            {/* 分类和标签 */}
                                            <Card size="small" title="分类和标签" hoverable={true} type={'inner'}>
                                                <div className="space-y-3">
                                                    <div>
                                                        <span className="font-medium">分类: </span>
                                                        <Tag>{currentArticle.categoryName}</Tag>
                                                    </div>
                                                    <div>
                                                        <span className="font-medium">标签: </span>
                                                        <Space wrap>
                                                            {currentArticle.tags?.map(tag => (
                                                                <Tag key={tag.id}>{tag.name}</Tag>
                                                            )) || <Text className="font-light pl-1"
                                                                        style={{ fontSize: '12px' }}
                                                                        type="warning">暂无标签</Text>}
                                                        </Space>
                                                    </div>
                                                </div>
                                            </Card>
                                            {/* 状态信息 */}
                                            <Card size="small" title="状态信息" hoverable={true} type={'inner'}>
                                                <Descriptions size="small" column={1}>
                                                    <Descriptions.Item label="文章状态">
                                                        <Tag color={getStatusColor(currentArticle.articleStatus)}>
                                                            {ArticleStatusMap[currentArticle.articleStatus as keyof typeof ArticleStatusMap] || currentArticle.articleStatus}
                                                        </Tag>
                                                    </Descriptions.Item>
                                                    <Descriptions.Item label="可见性">
                            <span className="flex items-center gap-1">
                              {currentArticle.visible === ArticleVisibleEnum.PUBLIC &&
                                  <GlobalOutlined style={{ color: 'green' }}/>}
                                {currentArticle.visible === ArticleVisibleEnum.PRIVATE &&
                                    <LockOutlined style={{ color: 'blue' }}/>}
                                {currentArticle.visible === ArticleVisibleEnum.FOLLOWERS_ONLY &&
                                    <UserOutlined style={{ color: 'chocolate' }}/>}
                                {visibleOptions.find(opt => opt.value === currentArticle.visible)?.label}
                            </span>
                                                    </Descriptions.Item>
                                                    <Descriptions.Item label="是否原创">
                            <span>
                              {originalOptions.find(opt => opt.value === currentArticle.original)?.label}
                                {currentArticle.original === ArticleOriginalEnum.REPRINT && currentArticle.originalUrl && (
                                    <a href={currentArticle.originalUrl} target="_blank" rel="noopener noreferrer"
                                       className="ml-2 text-blue-500 hover:underline">
                                        <LinkOutlined/> 来源链接
                                    </a>
                                )}
                            </span>
                                                    </Descriptions.Item>
                                                </Descriptions>
                                            </Card>
                                            {/* 权限设置 */}
                                            <Card size="small" title="权限设置" hoverable={true} type={'inner'}>
                                                <Descriptions size="small" column={1}>
                                                    <Descriptions.Item label="允许评论">
                                                        <Badge
                                                            status={currentArticle.allowComment === AllowStatusEnum.ALLOWED ? 'success' : 'default'}
                                                            text={allowOptions.find(opt => opt.value === currentArticle.allowComment)?.label}/>
                                                    </Descriptions.Item>
                                                    <Descriptions.Item label="允许转发">
                                                        <Badge
                                                            status={currentArticle.allowForward === AllowStatusEnum.ALLOWED ? 'success' : 'default'}
                                                            text={allowOptions.find(opt => opt.value === currentArticle.allowForward)?.label}/>
                                                    </Descriptions.Item>
                                                </Descriptions>
                                            </Card>
                                        </Space>

                                        {/* 右侧信息 */}
                                        <Space orientation="vertical" size={24}>
                                            {/* 时间信息 */}
                                            <Card size="small" title="时间信息" hoverable={true} type={'inner'}>
                                                <Descriptions size="small" column={1}>
                                                    <Descriptions.Item label="创建时间">
                                                        {currentArticle.createTime ? formatDateTime(currentArticle.createTime) : '未知'}
                                                    </Descriptions.Item>
                                                    <Descriptions.Item label="发布时间">
                                                        {currentArticle.publishTime ? formatDateTime(currentArticle.publishTime) : '未发布'}
                                                    </Descriptions.Item>
                                                    <Descriptions.Item label="最后编辑时间">
                                                        {currentArticle.lastEditTime ? formatDateTime(currentArticle.lastEditTime) : '无'}
                                                    </Descriptions.Item>
                                                </Descriptions>
                                            </Card>

                                            {/* SEO信息 */}
                                            <Card size="small" title="SEO信息" hoverable={true} type={'inner'}>
                                                <div className="space-y-3">
                                                    <div>
                                                        <span className="font-medium">SEO标题: </span>
                                                        <Text
                                                            ellipsis={{ tooltip: currentArticle.metaTitle }}>{currentArticle.metaTitle || '未设置'}</Text>
                                                    </div>
                                                    <div>
                                                        <span className="font-medium">SEO描述: </span>
                                                        <Text
                                                            ellipsis={{ tooltip: currentArticle.metaDescription }}>{currentArticle.metaDescription || '未设置'}</Text>
                                                    </div>
                                                    <div>
                                                        <span className="font-medium">SEO关键词: </span>
                                                        <Text
                                                            ellipsis={{ tooltip: currentArticle.metaKeywords }}>{currentArticle.metaKeywords || '未设置'}</Text>
                                                    </div>
                                                </div>
                                            </Card>

                                            {/* 统计信息 */}
                                            <Card size="small" title="统计信息" hoverable={true} type={'inner'}>
                                                <Descriptions size="small" column={2}>
                                                    <Descriptions.Item
                                                        label="阅读量">{currentArticle.readCount}</Descriptions.Item>
                                                    <Descriptions.Item
                                                        label="点赞数">{currentArticle.likeCount}</Descriptions.Item>
                                                    <Descriptions.Item
                                                        label="评论数">{currentArticle.commentCount}</Descriptions.Item>
                                                    <Descriptions.Item
                                                        label="收藏数">{currentArticle.collectionCount}</Descriptions.Item>
                                                    <Descriptions.Item
                                                        label="分享数">{currentArticle.shareCount}</Descriptions.Item>
                                                </Descriptions>
                                            </Card>
                                        </Space>
                                    </div>
                                </div>
                            </TabPane>

                            {/* 文章内容 */}
                            <TabPane tab="文章内容" key="content">
                                <div className="h-[500px] overflow-y-auto px-2">
                                    <Card>
                                        {currentArticle.coverImage && (
                                            <div className="mb-6">
                                                <img src={currentArticle.coverImage} alt="封面图"
                                                     className="w-full h-auto max-h-64 object-cover rounded"/>
                                            </div>
                                        )}
                                        <div className="mb-6">
                                            <span className="text-base font-semibold mr-2">摘要:</span>
                                            <Text
                                                className="text-gray-600 text-xs font-serif">{currentArticle.summary || '无摘要'}
                                            </Text>
                                        </div>
                                        <Divider/>
                                        <div>
                                            <div className="text-base font-semibold mb-2">正文:</div>
                                            <div className="prose max-w-none"
                                                 dangerouslySetInnerHTML={{ __html: currentArticle.contentHtml || currentArticle.content || '<p>无内容</p>' }}/>
                                        </div>
                                    </Card>
                                </div>
                            </TabPane>


                        </Tabs>
                    </div>
                )}
            </Modal>

            {/* 审核拒绝模态框 */}
            <Modal
                title="审核拒绝"
                open={rejectModalVisible}
                onOk={handleRejectArticle}
                onCancel={() => {
                    setRejectModalVisible(false);
                    rejectForm.resetFields();
                }}
                width={500}
                okText="确定拒绝"
                cancelText="取消"
                style={{
                    borderRadius: '12px',
                    boxShadow: '0 12px 40px rgba(0, 0, 0, 0.12)'
                }}
            >
                <Form form={rejectForm} layout="vertical">
                    <Form.Item
                        name="rejectReason"
                        label="拒绝原因"
                        rules={[{ required: true, message: '请输入拒绝原因' }, {
                            min: 5,
                            message: '拒绝原因至少5个字符'
                        }]}
                    >
                        <Input.TextArea rows={4} placeholder="请详细说明拒绝原因，以便作者改进" className="resize-none"/>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};
export default AdminArticles;
