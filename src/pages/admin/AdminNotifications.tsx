import React, { useState } from 'react';
import { Card, Table, Input, Button, Space, Tag, Modal, Form, Select, message, Typography, Switch } from 'antd';
import { SearchOutlined, DeleteOutlined, EyeOutlined, EditOutlined, BellOutlined, UserOutlined, CalendarOutlined, PlusOutlined } from '@ant-design/icons';

const { Search } = Input;
const { Text } = Typography;

// 通知类型定义
interface Notification {
    key: string;
    id: number;
    title: string;
    content: string;
    type: string;
    status: boolean;
    recipient: string;
    createdAt: string;
    updatedAt: string;
}

// 模拟通知数据
const mockNotifications: Notification[] = [
    {
        key: '1',
        id: 1,
        title: '系统更新通知',
        content: '系统将于2026年3月10日进行维护更新，请提前做好准备。',
        type: 'system',
        status: true,
        recipient: '所有用户',
        createdAt: '2026-03-08',
        updatedAt: '2026-03-08'
    },
    {
        key: '2',
        id: 2,
        title: '新功能上线',
        content: '我们新增了文章评论功能，欢迎体验！',
        type: 'feature',
        status: true,
        recipient: '所有用户',
        createdAt: '2026-03-07',
        updatedAt: '2026-03-07'
    },
    {
        key: '3',
        id: 3,
        title: '账户安全提醒',
        content: '您的账户在新设备上登录，如非本人操作请及时修改密码。',
        type: 'security',
        status: true,
        recipient: 'user1',
        createdAt: '2026-03-06',
        updatedAt: '2026-03-06'
    },
    {
        key: '4',
        id: 4,
        title: '文章审核通过',
        content: '您的文章《React最佳实践》已审核通过并发布。',
        type: 'article',
        status: true,
        recipient: 'user2',
        createdAt: '2026-03-05',
        updatedAt: '2026-03-05'
    },
    {
        key: '5',
        id: 5,
        title: '系统维护通知',
        content: '系统将于2026年3月9日凌晨2:00-4:00进行维护，期间服务可能暂时不可用。',
        type: 'system',
        status: true,
        recipient: '所有用户',
        createdAt: '2026-03-04',
        updatedAt: '2026-03-04'
    },
    {
        key: '6',
        id: 6,
        title: '评论回复提醒',
        content: '用户user3回复了您的评论："感谢分享，很有帮助！"',
        type: 'comment',
        status: true,
        recipient: 'user1',
        createdAt: '2026-03-03',
        updatedAt: '2026-03-03'
    },
    {
        key: '7',
        id: 7,
        title: '账户积分到账',
        content: '您的账户已到账100积分，可用于兑换礼品。',
        type: 'reward',
        status: true,
        recipient: 'user2',
        createdAt: '2026-03-02',
        updatedAt: '2026-03-02'
    },
    {
        key: '8',
        id: 8,
        title: '活动通知',
        content: '我们将在3月15日举办技术分享会，欢迎报名参加！',
        type: 'event',
        status: true,
        recipient: '所有用户',
        createdAt: '2026-03-01',
        updatedAt: '2026-03-01'
    }
];

// 类型选项
const typeOptions = [
    { value: 'system', label: '系统通知' },
    { value: 'feature', label: '功能通知' },
    { value: 'security', label: '安全提醒' },
    { value: 'article', label: '文章通知' },
    { value: 'comment', label: '评论通知' },
    { value: 'reward', label: '奖励通知' },
    { value: 'event', label: '活动通知' }
];

const AdminNotifications: React.FC = () => {
    const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
    const [filteredNotifications, setFilteredNotifications] = useState<Notification[]>(mockNotifications);
    const [searchText, setSearchText] = useState('');
    const [selectedType, setSelectedType] = useState('');
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isViewModalVisible, setIsViewModalVisible] = useState(false);
    const [currentNotification, setCurrentNotification] = useState<Notification | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [form] = Form.useForm();

    // 搜索和筛选通知
    const handleSearch = (value: string) => {
        setSearchText(value);
        filterNotifications(value, selectedType);
    };

    const handleTypeChange = (value: string) => {
        setSelectedType(value);
        filterNotifications(searchText, value);
    };

    const filterNotifications = (search: string, type: string) => {
        let filtered = [...notifications];

        if (search) {
            filtered = filtered.filter(notification => 
                notification.title.toLowerCase().includes(search.toLowerCase()) ||
                notification.content.toLowerCase().includes(search.toLowerCase()) ||
                notification.recipient.toLowerCase().includes(search.toLowerCase())
            );
        }

        if (type) {
            filtered = filtered.filter(notification => notification.type === type);
        }

        setFilteredNotifications(filtered);
    };

    // 打开编辑通知模态框
    const handleEditNotification = (notification: Notification) => {
        setIsEditing(true);
        setCurrentNotification(notification);
        form.setFieldsValue({
            title: notification.title,
            content: notification.content,
            type: notification.type,
            status: notification.status,
            recipient: notification.recipient
        });
        setIsModalVisible(true);
    };

    // 打开查看通知模态框
    const handleViewNotification = (notification: Notification) => {
        setCurrentNotification(notification);
        setIsViewModalVisible(true);
    };

    // 删除通知
    const handleDeleteNotification = (id: number) => {
        setNotifications(notifications.filter(notification => notification.id !== id));
        setFilteredNotifications(filteredNotifications.filter(notification => notification.id !== id));
        message.success('通知删除成功');
    };

    // 切换通知状态
    const handleToggleStatus = (id: number, status: boolean) => {
        const updatedNotifications = notifications.map(notification => 
            notification.id === id ? { ...notification, status: !status } : notification
        );
        setNotifications(updatedNotifications);
        filterNotifications(searchText, selectedType);
        message.success(`通知已${status ? '禁用' : '启用'}`);
    };

    // 保存通知
    const handleSaveNotification = () => {
        form.validateFields().then(values => {
            if (isEditing && currentNotification) {
                // 编辑现有通知
                const updatedNotifications = notifications.map(notification => 
                    notification.id === currentNotification.id ? { 
                        ...notification, 
                        ...values,
                        updatedAt: new Date().toISOString().split('T')[0]
                    } : notification
                );
                setNotifications(updatedNotifications);
                filterNotifications(searchText, selectedType);
                message.success('通知更新成功');
            } else {
                // 添加新通知
                const newNotification: Notification = {
                    key: String(notifications.length + 1),
                    id: notifications.length + 1,
                    ...values,
                    createdAt: new Date().toISOString().split('T')[0],
                    updatedAt: new Date().toISOString().split('T')[0]
                };
                setNotifications([...notifications, newNotification]);
                filterNotifications(searchText, selectedType);
                message.success('通知添加成功');
            }
            setIsModalVisible(false);
        }).catch(error => {
            console.error('验证失败:', error);
        });
    };

    // 获取类型标签颜色
    const getTypeColor = (type: string) => {
        switch (type) {
            case 'system': return 'blue';
            case 'feature': return 'green';
            case 'security': return 'red';
            case 'article': return 'purple';
            case 'comment': return 'orange';
            case 'reward': return 'gold';
            case 'event': return 'cyan';
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
            title: '内容',
            dataIndex: 'content',
            key: 'content',
            render: (text: string) => <Text ellipsis={{ tooltip: text }}>{text}</Text>
        },
        {
            title: '类型',
            dataIndex: 'type',
            key: 'type',
            width: 100,
            render: (type: string) => (
                <Tag color={getTypeColor(type)}>
                    {typeOptions.find(opt => opt.value === type)?.label}
                </Tag>
            )
        },
        {
            title: '接收者',
            dataIndex: 'recipient',
            key: 'recipient',
            width: 120
        },
        {
            title: '状态',
            dataIndex: 'status',
            key: 'status',
            width: 100,
            render: (status: boolean, record: Notification) => (
                <Switch 
                    checked={status} 
                    onChange={(checked) => handleToggleStatus(record.id, checked)}
                />
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
            render: (_: unknown, record: Notification) => (
                <Space size="middle">
                    <Button 
                        type="text" 
                        icon={<EyeOutlined />} 
                        onClick={() => handleViewNotification(record)}
                        className="text-blue-500"
                    >
                        查看
                    </Button>
                    <Button 
                        type="text" 
                        icon={<EditOutlined />} 
                        onClick={() => handleEditNotification(record)}
                        className="text-green-500"
                    >
                        编辑
                    </Button>
                    <Button 
                        type="text" 
                        icon={<DeleteOutlined />} 
                        onClick={() => handleDeleteNotification(record.id)}
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
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">通知管理</h2>
            </div>

            {/* 搜索和筛选 */}
            <Card className="mb-6 border border-gray-100 shadow-sm">
                <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
                    <Search
                        placeholder="搜索标题、内容或接收者"
                        allowClear
                        enterButton={<SearchOutlined />}
                        onSearch={handleSearch}
                        style={{ width: 300 }}
                    />
                    <Select
                        placeholder="按类型筛选"
                        allowClear
                        style={{ width: 150 }}
                        onChange={handleTypeChange}
                    >
                        {typeOptions.map(option => (
                            <Select.Option key={option.value} value={option.value}>
                                {option.label}
                            </Select.Option>
                        ))}
                    </Select>
                    <Button 
                        type="primary" 
                        icon={<PlusOutlined />}
                        onClick={() => {
                            setIsEditing(false);
                            setCurrentNotification(null);
                            form.resetFields();
                            setIsModalVisible(true);
                        }}
                    >
                        新增通知
                    </Button>
                </div>
            </Card>

            {/* 通知列表 */}
            <Card className="border border-gray-100 shadow-sm">
                <Table
                    columns={columns}
                    dataSource={filteredNotifications}
                    rowKey="id"
                    pagination={{
                        showSizeChanger: true,
                        pageSizeOptions: ['10', '20', '50'],
                        defaultPageSize: 10,
                        showTotal: (total) => `共 ${total} 条通知`
                    }}
                />
            </Card>

            {/* 添加/编辑通知模态框 */}
            <Modal
                title={isEditing ? '编辑通知' : '添加通知'}
                open={isModalVisible}
                onOk={handleSaveNotification}
                onCancel={() => setIsModalVisible(false)}
                width={600}
                okText="保存"
                cancelText="取消"
            >
                <Form
                    form={form}
                    layout="vertical"
                    initialValues={{
                        status: true
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
                        name="content"
                        label="内容"
                        rules={[
                            { required: true, message: '请输入内容' }
                        ]}
                    >
                        <Input.TextArea rows={4} placeholder="请输入内容" />
                    </Form.Item>

                    <Form.Item
                        name="type"
                        label="类型"
                        rules={[{ required: true, message: '请选择类型' }]}
                    >
                        <Select placeholder="请选择类型">
                            {typeOptions.map(option => (
                                <Select.Option key={option.value} value={option.value}>
                                    {option.label}
                                </Select.Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="recipient"
                        label="接收者"
                        rules={[
                            { required: true, message: '请输入接收者' }
                        ]}
                    >
                        <Input placeholder="请输入接收者，多个接收者用逗号分隔" />
                    </Form.Item>

                    <Form.Item
                        name="status"
                        label="状态"
                    >
                        <Switch />
                    </Form.Item>
                </Form>
            </Modal>

            {/* 查看通知模态框 */}
            <Modal
                title="通知详情"
                open={isViewModalVisible}
                onCancel={() => setIsViewModalVisible(false)}
                width={600}
                footer={[
                    <Button key="close" onClick={() => setIsViewModalVisible(false)}>
                        关闭
                    </Button>
                ]}
            >
                {currentNotification && (
                    <div className="space-y-6">
                        <div>
                            <h3 className="font-medium mb-2">标题</h3>
                            <div className="bg-gray-50 p-4 rounded-md">
                                {currentNotification.title}
                            </div>
                        </div>
                        <div>
                            <h3 className="font-medium mb-2">内容</h3>
                            <div className="bg-gray-50 p-4 rounded-md">
                                {currentNotification.content}
                            </div>
                        </div>
                        <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                            <span className="flex items-center gap-1">
                                <BellOutlined /> 类型: {typeOptions.find(opt => opt.value === currentNotification.type)?.label}
                            </span>
                            <span className="flex items-center gap-1">
                                <UserOutlined /> 接收者: {currentNotification.recipient}
                            </span>
                            <span className="flex items-center gap-1">
                                <CalendarOutlined /> 创建时间: {currentNotification.createdAt}
                            </span>
                            <span className="flex items-center gap-1">
                                <CalendarOutlined /> 更新时间: {currentNotification.updatedAt}
                            </span>
                            <Tag color={currentNotification.status ? 'green' : 'red'}>
                                {currentNotification.status ? '启用' : '禁用'}
                            </Tag>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default AdminNotifications;