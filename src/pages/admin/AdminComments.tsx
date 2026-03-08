import React, { useState } from 'react';
import { Card, Table, Input, Button, Space, Tag, Modal, Form, Select, message, Typography } from 'antd';
import { SearchOutlined, DeleteOutlined, EyeOutlined, EditOutlined, UserOutlined, FileTextOutlined, CalendarOutlined } from '@ant-design/icons';

const { Search } = Input;
const { Text } = Typography;

// 评论类型定义
interface Comment {
    key: string;
    id: number;
    articleId: number;
    articleTitle: string;
    userId: number;
    username: string;
    content: string;
    status: string;
    createdAt: string;
    updatedAt: string;
}

// 模拟评论数据
const mockComments: Comment[] = [
    {
        key: '1',
        id: 1,
        articleId: 1,
        articleTitle: 'React最佳实践',
        userId: 2,
        username: 'user1',
        content: '这篇文章写得非常好，对我帮助很大！',
        status: 'approved',
        createdAt: '2026-03-08',
        updatedAt: '2026-03-08'
    },
    {
        key: '2',
        id: 2,
        articleId: 1,
        articleTitle: 'React最佳实践',
        userId: 3,
        username: 'user2',
        content: '请问作者，React 19的新特性有哪些？',
        status: 'approved',
        createdAt: '2026-03-07',
        updatedAt: '2026-03-07'
    },
    {
        key: '3',
        id: 3,
        articleId: 2,
        articleTitle: 'TypeScript高级特性',
        userId: 4,
        username: 'editor',
        content: 'TypeScript确实是前端开发的利器',
        status: 'approved',
        createdAt: '2026-03-06',
        updatedAt: '2026-03-06'
    },
    {
        key: '4',
        id: 4,
        articleId: 3,
        articleTitle: 'Node.js性能优化',
        userId: 5,
        username: 'user3',
        content: '这篇文章的优化建议很实用',
        status: 'approved',
        createdAt: '2026-03-05',
        updatedAt: '2026-03-05'
    },
    {
        key: '5',
        id: 5,
        articleId: 2,
        articleTitle: 'TypeScript高级特性',
        userId: 6,
        username: 'user4',
        content: '学习TypeScript的好资源',
        status: 'approved',
        createdAt: '2026-03-04',
        updatedAt: '2026-03-04'
    },
    {
        key: '6',
        id: 6,
        articleId: 4,
        articleTitle: 'Tailwind CSS使用指南',
        userId: 7,
        username: 'user5',
        content: 'Tailwind CSS真的很方便',
        status: 'approved',
        createdAt: '2026-03-03',
        updatedAt: '2026-03-03'
    },
    {
        key: '7',
        id: 7,
        articleId: 1,
        articleTitle: 'React最佳实践',
        userId: 8,
        username: 'user6',
        content: '感谢作者的分享',
        status: 'approved',
        createdAt: '2026-03-02',
        updatedAt: '2026-03-02'
    },
    {
        key: '8',
        id: 8,
        articleId: 3,
        articleTitle: 'Node.js性能优化',
        userId: 9,
        username: 'user7',
        content: '这篇文章对我帮助很大，谢谢！',
        status: 'approved',
        createdAt: '2026-03-01',
        updatedAt: '2026-03-01'
    }
];

// 状态选项
const statusOptions = [
    { value: 'approved', label: '已批准' },
    { value: 'pending', label: '待审核' },
    { value: 'rejected', label: '已拒绝' }
];

const AdminComments: React.FC = () => {
    const [comments, setComments] = useState<Comment[]>(mockComments);
    const [filteredComments, setFilteredComments] = useState<Comment[]>(mockComments);
    const [searchText, setSearchText] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('');
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isViewModalVisible, setIsViewModalVisible] = useState(false);
    const [currentComment, setCurrentComment] = useState<Comment | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [form] = Form.useForm();

    // 搜索和筛选评论
    const handleSearch = (value: string) => {
        setSearchText(value);
        filterComments(value, selectedStatus);
    };

    const handleStatusChange = (value: string) => {
        setSelectedStatus(value);
        filterComments(searchText, value);
    };

    const filterComments = (search: string, status: string) => {
        let filtered = [...comments];

        if (search) {
            filtered = filtered.filter(comment => 
                comment.content.toLowerCase().includes(search.toLowerCase()) ||
                comment.username.toLowerCase().includes(search.toLowerCase()) ||
                comment.articleTitle.toLowerCase().includes(search.toLowerCase())
            );
        }

        if (status) {
            filtered = filtered.filter(comment => comment.status === status);
        }

        setFilteredComments(filtered);
    };

    // 打开编辑评论模态框
    const handleEditComment = (comment: Comment) => {
        setIsEditing(true);
        setCurrentComment(comment);
        form.setFieldsValue({
            content: comment.content,
            status: comment.status
        });
        setIsModalVisible(true);
    };

    // 打开查看评论模态框
    const handleViewComment = (comment: Comment) => {
        setCurrentComment(comment);
        setIsViewModalVisible(true);
    };

    // 删除评论
    const handleDeleteComment = (id: number) => {
        setComments(comments.filter(comment => comment.id !== id));
        setFilteredComments(filteredComments.filter(comment => comment.id !== id));
        message.success('评论删除成功');
    };

    // 保存评论
    const handleSaveComment = () => {
        form.validateFields().then(values => {
            if (isEditing && currentComment) {
                // 编辑现有评论
                const updatedComments = comments.map(comment => 
                    comment.id === currentComment.id ? { 
                        ...comment, 
                        ...values,
                        updatedAt: new Date().toISOString().split('T')[0]
                    } : comment
                );
                setComments(updatedComments);
                filterComments(searchText, selectedStatus);
                message.success('评论更新成功');
            }
            setIsModalVisible(false);
        }).catch(error => {
            console.error('验证失败:', error);
        });
    };

    // 获取状态标签颜色
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'approved': return 'green';
            case 'pending': return 'blue';
            case 'rejected': return 'red';
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
            title: '评论内容',
            dataIndex: 'content',
            key: 'content',
            render: (text: string) => <Text ellipsis={{ tooltip: text }}>{text}</Text>
        },
        {
            title: '文章',
            dataIndex: 'articleTitle',
            key: 'articleTitle',
            render: (text: string) => <Text ellipsis={{ tooltip: text }} className="font-medium">{text}</Text>
        },
        {
            title: '用户',
            dataIndex: 'username',
            key: 'username',
            width: 100
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
            title: '创建时间',
            dataIndex: 'createdAt',
            key: 'createdAt',
            width: 140
        },
        {
            title: '操作',
            key: 'action',
            width: 180,
            render: (_: unknown, record: Comment) => (
                <Space size="middle">
                    <Button 
                        type="text" 
                        icon={<EyeOutlined />} 
                        onClick={() => handleViewComment(record)}
                        className="text-blue-500"
                    >
                        查看
                    </Button>
                    <Button 
                        type="text" 
                        icon={<EditOutlined />} 
                        onClick={() => handleEditComment(record)}
                        className="text-green-500"
                    >
                        编辑
                    </Button>
                    <Button 
                        type="text" 
                        icon={<DeleteOutlined />} 
                        onClick={() => handleDeleteComment(record.id)}
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
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">评论管理</h2>
            </div>

            {/* 搜索和筛选 */}
            <Card className="mb-6 border border-gray-100 shadow-sm">
                <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
                    <Search
                        placeholder="搜索评论内容、用户名或文章标题"
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
                            <Select.Option key={option.value} value={option.value} >
                                {option.label}
                            </Select.Option>
                        ))}
                    </Select>
                </div>
            </Card>

            {/* 评论列表 */}
            <Card className="border border-gray-100 shadow-sm">
                <Table
                    columns={columns}
                    dataSource={filteredComments}
                    rowKey="id"
                    pagination={{
                        showSizeChanger: true,
                        pageSizeOptions: ['10', '20', '50'],
                        defaultPageSize: 10,
                        showTotal: (total) => `共 ${total} 条评论`
                    }}
                />
            </Card>

            {/* 编辑评论模态框 */}
            <Modal
                title="编辑评论"
                open={isModalVisible}
                onOk={handleSaveComment}
                onCancel={() => setIsModalVisible(false)}
                width={600}
                okText="保存"
                cancelText="取消"
            >
                <Form
                    form={form}
                    layout="vertical"
                >
                    <Form.Item
                        name="content"
                        label="评论内容"
                        rules={[
                            { required: true, message: '请输入评论内容' }
                        ]}
                    >
                        <Input.TextArea rows={4} placeholder="请输入评论内容" />
                    </Form.Item>

                    <Form.Item
                        name="status"
                        label="状态"
                        rules={[{ required: true, message: '请选择状态' }]}
                    >
                        <Select placeholder="请选择状态">
                            {statusOptions.map(option => (
                                <Select.Option key={option.value} value={option.value}>
                                    {option.label}
                                </Select.Option>
                            ))}
                        </Select>
                    </Form.Item>
                </Form>
            </Modal>

            {/* 查看评论模态框 */}
            <Modal
                title="评论详情"
                open={isViewModalVisible}
                onCancel={() => setIsViewModalVisible(false)}
                width={600}
                footer={[
                    <Button key="close" onClick={() => setIsViewModalVisible(false)}>
                        关闭
                    </Button>
                ]}
            >
                {currentComment && (
                    <div className="space-y-6">
                        <div>
                            <h3 className="font-medium mb-2">评论内容</h3>
                            <div className="bg-gray-50 p-4 rounded-md">
                                {currentComment.content}
                            </div>
                        </div>
                        <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                            <span className="flex items-center gap-1">
                                <FileTextOutlined /> 文章: {currentComment.articleTitle}
                            </span>
                            <span className="flex items-center gap-1">
                                <UserOutlined /> 用户: {currentComment.username}
                            </span>
                            <span className="flex items-center gap-1">
                                <CalendarOutlined /> 创建时间: {currentComment.createdAt}
                            </span>
                            <span className="flex items-center gap-1">
                                <CalendarOutlined /> 更新时间: {currentComment.updatedAt}
                            </span>
                            <Tag color={getStatusColor(currentComment.status)}>
                                {statusOptions.find(opt => opt.value === currentComment.status)?.label}
                            </Tag>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default AdminComments;