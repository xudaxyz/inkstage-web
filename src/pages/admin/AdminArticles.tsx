import React, { useState } from 'react';
import { Card, Table, Input, Button, Space, Tag, Modal, Form, Select, message, Typography } from 'antd';
import { SearchOutlined, DeleteOutlined, EyeOutlined, EditOutlined, CalendarOutlined, EyeInvisibleOutlined, TagOutlined, UserOutlined } from '@ant-design/icons';

const { Option } = Select;
const { Search } = Input;
const { Title, Text } = Typography;

// 文章类型定义
interface Article {
    key: string;
    id: number;
    title: string;
    author: string;
    category: string;
    tags: string[];
    status: string;
    views: number;
    comments: number;
    createdAt: string;
    updatedAt: string;
}

// 模拟文章数据
const mockArticles: Article[] = [
    {
        key: '1',
        id: 1,
        title: 'React最佳实践',
        author: '张三',
        category: '前端开发',
        tags: ['React', '前端', '最佳实践'],
        status: 'published',
        views: 1234,
        comments: 56,
        createdAt: '2026-01-01',
        updatedAt: '2026-01-01'
    },
    {
        key: '2',
        id: 2,
        title: 'TypeScript高级特性',
        author: '李四',
        category: '前端开发',
        tags: ['TypeScript', '前端'],
        status: 'published',
        views: 987,
        comments: 45,
        createdAt: '2026-01-02',
        updatedAt: '2026-01-02'
    },
    {
        key: '3',
        id: 3,
        title: 'Node.js性能优化',
        author: '王五',
        category: '后端开发',
        tags: ['Node.js', '后端', '性能优化'],
        status: 'published',
        views: 876,
        comments: 34,
        createdAt: '2026-01-03',
        updatedAt: '2026-01-03'
    },
    {
        key: '4',
        id: 4,
        title: 'Tailwind CSS使用指南',
        author: '赵六',
        category: '前端开发',
        tags: ['Tailwind CSS', '前端', 'CSS'],
        status: 'draft',
        views: 765,
        comments: 23,
        createdAt: '2026-01-04',
        updatedAt: '2026-01-04'
    },
    {
        key: '5',
        id: 5,
        title: 'React Hooks深入理解',
        author: '孙七',
        category: '前端开发',
        tags: ['React', 'Hooks', '前端'],
        status: 'published',
        views: 654,
        comments: 12,
        createdAt: '2026-01-05',
        updatedAt: '2026-01-05'
    },
    {
        key: '6',
        id: 6,
        title: 'Docker容器化实践',
        author: '周八',
        category: 'DevOps',
        tags: ['Docker', '容器化', 'DevOps'],
        status: 'published',
        views: 543,
        comments: 10,
        createdAt: '2026-01-06',
        updatedAt: '2026-01-06'
    },
    {
        key: '7',
        id: 7,
        title: 'Vue 3 Composition API',
        author: '吴九',
        category: '前端开发',
        tags: ['Vue', 'Composition API', '前端'],
        status: 'draft',
        views: 432,
        comments: 8,
        createdAt: '2026-01-07',
        updatedAt: '2026-01-07'
    },
    {
        key: '8',
        id: 8,
        title: 'MongoDB性能优化',
        author: '郑十',
        category: '后端开发',
        tags: ['MongoDB', '数据库', '性能优化'],
        status: 'published',
        views: 321,
        comments: 5,
        createdAt: '2026-01-08',
        updatedAt: '2026-01-08'
    }
];

// 状态选项
const statusOptions = [
    { value: 'published', label: '已发布' },
    { value: 'draft', label: '草稿' },
    { value: 'pending', label: '待审核' }
];

// 分类选项
const categoryOptions = [
    { value: '前端开发', label: '前端开发' },
    { value: '后端开发', label: '后端开发' },
    { value: '移动开发', label: '移动开发' },
    { value: 'DevOps', label: 'DevOps' },
    { value: '其他', label: '其他' }
];

const AdminArticles: React.FC = () => {
    const [articles, setArticles] = useState<Article[]>(mockArticles);
    const [filteredArticles, setFilteredArticles] = useState<Article[]>(mockArticles);
    const [searchText, setSearchText] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isViewModalVisible, setIsViewModalVisible] = useState(false);
    const [currentArticle, setCurrentArticle] = useState<Article | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [form] = Form.useForm();

    // 搜索和筛选文章
    const handleSearch = (value: string) => {
        setSearchText(value);
        filterArticles(value, selectedStatus, selectedCategory);
    };

    const handleStatusChange = (value: string) => {
        setSelectedStatus(value);
        filterArticles(searchText, value, selectedCategory);
    };

    const handleCategoryChange = (value: string) => {
        setSelectedCategory(value);
        filterArticles(searchText, selectedStatus, value);
    };

    const filterArticles = (search: string, status: string, category: string) => {
        let filtered = [...articles];

        if (search) {
            filtered = filtered.filter(article => 
                article.title.toLowerCase().includes(search.toLowerCase()) ||
                article.author.toLowerCase().includes(search.toLowerCase())
            );
        }

        if (status) {
            filtered = filtered.filter(article => article.status === status);
        }

        if (category) {
            filtered = filtered.filter(article => article.category === category);
        }

        setFilteredArticles(filtered);
    };

    // 打开编辑文章模态框
    const handleEditArticle = (article: Article) => {
        setIsEditing(true);
        setCurrentArticle(article);
        form.setFieldsValue({
            title: article.title,
            author: article.author,
            category: article.category,
            tags: article.tags.join(','),
            status: article.status
        });
        setIsModalVisible(true);
    };

    // 打开查看文章模态框
    const handleViewArticle = (article: Article) => {
        setCurrentArticle(article);
        setIsViewModalVisible(true);
    };

    // 删除文章
    const handleDeleteArticle = (id: number) => {
        setArticles(articles.filter(article => article.id !== id));
        setFilteredArticles(filteredArticles.filter(article => article.id !== id));
        message.success('文章删除成功');
    };

    // 保存文章
    const handleSaveArticle = () => {
        form.validateFields().then(values => {
            const tags = values.tags.split(',').map((tag: string) => tag.trim()).filter((tag: string) => tag);
            
            if (isEditing && currentArticle) {
                // 编辑现有文章
                const updatedArticles = articles.map(article => 
                    article.id === currentArticle.id ? { 
                        ...article, 
                        ...values, 
                        tags,
                        updatedAt: new Date().toISOString().split('T')[0]
                    } : article
                );
                setArticles(updatedArticles);
                filterArticles(searchText, selectedStatus, selectedCategory);
                message.success('文章更新成功');
            } else {
                // 添加新文章
                const newArticle: Article = {
                    key: String(articles.length + 1),
                    id: articles.length + 1,
                    ...values,
                    tags,
                    views: 0,
                    comments: 0,
                    createdAt: new Date().toISOString().split('T')[0],
                    updatedAt: new Date().toISOString().split('T')[0]
                };
                setArticles([...articles, newArticle]);
                filterArticles(searchText, selectedStatus, selectedCategory);
                message.success('文章添加成功');
            }
            setIsModalVisible(false);
        }).catch(error => {
            console.error('验证失败:', error);
        });
    };

    // 获取状态标签颜色
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'published': return 'green';
            case 'draft': return 'orange';
            case 'pending': return 'blue';
            default: return 'default';
        }
    };

    // 表格列配置
    const columns = [
        {
            title: '序号',
            key: 'index',
            width: 60,
            render: (_: unknown, __: unknown, index: number) => index + 1
        },
        {
            title: '标题',
            dataIndex: 'title',
            key: 'title',
            render: (text: string) => <Text ellipsis={{ tooltip: text }} className="font-medium">{text}</Text>
        },
        {
            title: '作者',
            dataIndex: 'author',
            key: 'author',
            width: 100
        },
        {
            title: '分类',
            dataIndex: 'category',
            key: 'category',
            width: 100
        },
        {
            title: '标签',
            dataIndex: 'tags',
            key: 'tags',
            render: (tags: string[]) => (
                <Space size="small">
                    {tags.map((tag, index) => (
                        <Tag key={index}>{tag}</Tag>
                    ))}
                </Space>
            )
        },
        {
            title: '状态',
            dataIndex: 'status',
            key: 'status',
            width: 100,
            render: (status: string) => (
                <Tag color={getStatusColor(status)}>
                    {statusOptions.find(opt => opt.value === status)?.label}
                </Tag>
            )
        },
        {
            title: '浏览量',
            dataIndex: 'views',
            key: 'views',
            width: 80
        },
        {
            title: '评论数',
            dataIndex: 'comments',
            key: 'comments',
            width: 80
        },
        {
            title: '创建时间',
            dataIndex: 'createdAt',
            key: 'createdAt',
            width: 140
        },
        {
            title: '操作',
            key: 'action',
            width: 180,
            render: (_: unknown, record: Article) => (
                <Space size="middle">
                    <Button 
                        type="text" 
                        icon={<EyeOutlined />} 
                        onClick={() => handleViewArticle(record)}
                        className="text-blue-500"
                    >
                        查看
                    </Button>
                    <Button 
                        type="text" 
                        icon={<EditOutlined />} 
                        onClick={() => handleEditArticle(record)}
                        className="text-green-500"
                    >
                        编辑
                    </Button>
                    <Button 
                        type="text" 
                        icon={<DeleteOutlined />} 
                        onClick={() => handleDeleteArticle(record.id)}
                        className="text-red-500"
                    >
                        删除
                    </Button>
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
                        enterButton={<SearchOutlined />}
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
                        {categoryOptions.map(option => (
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
                    dataSource={filteredArticles}
                    rowKey="id"
                    pagination={{
                        showSizeChanger: true,
                        pageSizeOptions: ['10', '20', '50'],
                        defaultPageSize: 10,
                        showTotal: (total) => `共 ${total} 篇文章`
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
                        <Input placeholder="请输入标题" />
                    </Form.Item>

                    <Form.Item
                        name="author"
                        label="作者"
                        rules={[
                            { required: true, message: '请输入作者' },
                            { min: 2, max: 20, message: '作者名称长度应在2-20个字符之间' }
                        ]}
                    >
                        <Input prefix={<UserOutlined />} placeholder="请输入作者" />
                    </Form.Item>

                    <Form.Item
                        name="category"
                        label="分类"
                        rules={[{ required: true, message: '请选择分类' }]}
                    >
                        <Select placeholder="请选择分类">
                            {categoryOptions.map(option => (
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
                        <Input prefix={<TagOutlined />} placeholder="请输入标签，多个标签用逗号分隔" />
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
                width={800}
                footer={[
                    <Button key="close" onClick={() => setIsViewModalVisible(false)}>
                        关闭
                    </Button>
                ]}
            >
                {currentArticle && (
                    <div className="space-y-6">
                        <div>
                            <Title level={3}>{currentArticle.title}</Title>
                            <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-4">
                                <span className="flex items-center gap-1">
                                    <UserOutlined /> {currentArticle.author}
                                </span>
                                <span className="flex items-center gap-1">
                                    <CalendarOutlined /> {currentArticle.createdAt}
                                </span>
                                <span className="flex items-center gap-1">
                                    <EyeOutlined /> {currentArticle.views} 浏览
                                </span>
                                <span className="flex items-center gap-1">
                                    <EyeInvisibleOutlined /> {currentArticle.comments} 评论
                                </span>
                                <Tag color={getStatusColor(currentArticle.status)}>
                                    {statusOptions.find(opt => opt.value === currentArticle.status)?.label}
                                </Tag>
                            </div>
                        </div>
                        <div className="border-t pt-4">
                            <h4 className="font-medium mb-2">分类</h4>
                            <Tag>{currentArticle.category}</Tag>
                        </div>
                        <div className="border-t pt-4">
                            <h4 className="font-medium mb-2">标签</h4>
                            <Space size="small">
                                {currentArticle.tags.map((tag, index) => (
                                    <Tag key={index}>{tag}</Tag>
                                ))}
                            </Space>
                        </div>
                        <div className="border-t pt-4">
                            <h4 className="font-medium mb-2">内容</h4>
                            <Text className="text-gray-600">
                                文章内容预览...
                            </Text>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default AdminArticles;