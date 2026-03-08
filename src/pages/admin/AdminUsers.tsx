import React, { useState } from 'react';
import { Card, Table, Input, Button, Space, Tag, Modal, Form, Select, message, Dropdown } from 'antd';
import { SearchOutlined, DeleteOutlined, EyeOutlined, UserOutlined, LockOutlined, MailOutlined, PhoneOutlined, CalendarOutlined } from '@ant-design/icons';

const { Option } = Select;
const { Search } = Input;

// 用户类型定义
interface User {
    key: string;
    id: number;
    username: string;
    nickname: string;
    email: string;
    phone: string;
    role: string;
    status: string;
    createdAt: string;
    lastLogin: string;
}

// 模拟用户数据
const mockUsers = [
    {
        key: '1',
        id: 1,
        username: 'admin',
        nickname: '管理员',
        email: 'admin@example.com',
        phone: '13800138000',
        role: 'admin',
        status: 'active',
        createdAt: '2026-01-01',
        lastLogin: '2026-03-08'
    },
    {
        key: '2',
        id: 2,
        username: 'user1',
        nickname: '用户一',
        email: 'user1@example.com',
        phone: '13800138001',
        role: 'user',
        status: 'active',
        createdAt: '2026-01-02',
        lastLogin: '2026-03-07'
    },
    {
        key: '3',
        id: 3,
        username: 'user2',
        nickname: '用户二',
        email: 'user2@example.com',
        phone: '13800138002',
        role: 'user',
        status: 'inactive',
        createdAt: '2026-01-03',
        lastLogin: '2026-03-05'
    },
    {
        key: '4',
        id: 4,
        username: 'editor',
        nickname: '编辑',
        email: 'editor@example.com',
        phone: '13800138003',
        role: 'editor',
        status: 'active',
        createdAt: '2026-01-04',
        lastLogin: '2026-03-08'
    },
    {
        key: '5',
        id: 5,
        username: 'user3',
        nickname: '用户三',
        email: 'user3@example.com',
        phone: '13800138004',
        role: 'user',
        status: 'active',
        createdAt: '2026-01-05',
        lastLogin: '2026-03-06'
    },
    {
        key: '6',
        id: 6,
        username: 'user4',
        nickname: '用户四',
        email: 'user4@example.com',
        phone: '13800138005',
        role: 'user',
        status: 'active',
        createdAt: '2026-01-06',
        lastLogin: '2026-03-04'
    },
    {
        key: '7',
        id: 7,
        username: 'user5',
        nickname: '用户五',
        email: 'user5@example.com',
        phone: '13800138006',
        role: 'user',
        status: 'banned',
        createdAt: '2026-01-07',
        lastLogin: '2026-03-03'
    },
    {
        key: '8',
        id: 8,
        username: 'user6',
        nickname: '用户六',
        email: 'user6@example.com',
        phone: '13800138007',
        role: 'user',
        status: 'active',
        createdAt: '2026-01-08',
        lastLogin: '2026-03-02'
    },
    {
        key: '9',
        id: 9,
        username: 'user7',
        nickname: '用户七',
        email: 'user7@example.com',
        phone: '13800138008',
        role: 'user',
        status: 'active',
        createdAt: '2026-01-09',
        lastLogin: '2026-03-01'
    },
    {
        key: '10',
        id: 10,
        username: 'user8',
        nickname: '用户八',
        email: 'user8@example.com',
        phone: '13800138009',
        role: 'user',
        status: 'inactive',
        createdAt: '2026-01-10',
        lastLogin: '2026-02-28'
    },
    {
        key: '11',
        id: 11,
        username: 'user9',
        nickname: '用户九',
        email: 'user9@example.com',
        phone: '13800138010',
        role: 'user',
        status: 'active',
        createdAt: '2026-01-11',
        lastLogin: '2026-02-27'
    },
    {
        key: '12',
        id: 12,
        username: 'user10',
        nickname: '用户十',
        email: 'user10@example.com',
        phone: '13800138011',
        role: 'user',
        status: 'active',
        createdAt: '2026-01-12',
        lastLogin: '2026-02-26'
    }
];

// 角色选项
const roleOptions = [
    { value: 'admin', label: '管理员' },
    { value: 'editor', label: '编辑' },
    { value: 'user', label: '普通用户' }
];

// 状态选项
const statusOptions = [
    { value: 'active', label: '活跃' },
    { value: 'inactive', label: '不活跃' },
    { value: 'banned', label: '已禁用' }
];

const AdminUsers: React.FC = () => {
    const [users, setUsers] = useState<User[]>(mockUsers);
    const [filteredUsers, setFilteredUsers] = useState<User[]>(mockUsers);
    const [searchText, setSearchText] = useState('');
    const [selectedRole, setSelectedRole] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('');
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isViewModalVisible, setIsViewModalVisible] = useState(false);
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [form] = Form.useForm();

    // 搜索和筛选用户
    const handleSearch = (value: string) => {
        setSearchText(value);
        filterUsers(value, selectedRole, selectedStatus);
    };

    const handleRoleChange = (value: string) => {
        setSelectedRole(value);
        filterUsers(searchText, value, selectedStatus);
    };

    const handleStatusChange = (value: string) => {
        setSelectedStatus(value);
        filterUsers(searchText, selectedRole, value);
    };

    const filterUsers = (search: string, role: string, status: string) => {
        let filtered = [...users];

        if (search) {
            filtered = filtered.filter(user => 
                user.username.toLowerCase().includes(search.toLowerCase()) ||
                user.email.toLowerCase().includes(search.toLowerCase()) ||
                user.phone.includes(search)
            );
        }

        if (role) {
            filtered = filtered.filter(user => user.role === role);
        }

        if (status) {
            filtered = filtered.filter(user => user.status === status);
        }

        setFilteredUsers(filtered);
    };

    // 打开编辑用户模态框
    const handleEditUser = (user: User) => {
        setIsEditing(true);
        setCurrentUser(user);
        form.setFieldsValue({
            username: user.username,
            nickname: user.nickname,
            email: user.email,
            phone: user.phone,
            role: user.role,
            status: user.status
        });
        setIsModalVisible(true);
    };

    // 打开查看用户模态框
    const handleViewUser = (user: User) => {
        setCurrentUser(user);
        setIsViewModalVisible(true);
    };

    // 删除用户
    const handleDeleteUser = (id: number) => {
        setUsers(users.filter(user => user.id !== id));
        setFilteredUsers(filteredUsers.filter(user => user.id !== id));
        message.success('用户删除成功');
    };

    // 保存用户
    const handleSaveUser = () => {
        form.validateFields().then(values => {
            if (isEditing && currentUser) {
                // 编辑现有用户
                const updatedUsers = users.map(user => 
                    user.id === currentUser.id ? { ...user, ...values } : user
                );
                setUsers(updatedUsers);
                filterUsers(searchText, selectedRole, selectedStatus);
                message.success('用户更新成功');
            } else {
                // 添加新用户
                const newUser: User = {
                    key: String(users.length + 1),
                    id: users.length + 1,
                    ...values,
                    createdAt: new Date().toISOString().split('T')[0],
                    lastLogin: new Date().toISOString().split('T')[0]
                };
                setUsers([...users, newUser]);
                filterUsers(searchText, selectedRole, selectedStatus);
                message.success('用户添加成功');
            }
            setIsModalVisible(false);
        }).catch(error => {
            console.error('验证失败:', error);
        });
    };

    // 获取角色标签颜色
    const getRoleColor = (role: string) => {
        switch (role) {
            case 'admin': return 'red';
            case 'editor': return 'blue';
            case 'user': return 'green';
            default: return 'default';
        }
    };

    // 获取状态标签颜色
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active': return 'green';
            case 'inactive': return 'orange';
            case 'banned': return 'red';
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
            title: '用户名',
            dataIndex: 'username',
            key: 'username',
            render: (text: string) => <span className="font-medium">{text}</span>
        },
        {
            title: '昵称',
            dataIndex: 'nickname',
            key: 'nickname'
        },
        {
            title: '邮箱',
            dataIndex: 'email',
            key: 'email'
        },
        {
            title: '手机号',
            dataIndex: 'phone',
            key: 'phone',
            width: 120
        },
        {
            title: '角色',
            dataIndex: 'role',
            key: 'role',
            width: 100,
            render: (role: string) => (
                <Tag color={getRoleColor(role)}>
                    {roleOptions.find(opt => opt.value === role)?.label}
                </Tag>
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
            title: '注册时间',
            dataIndex: 'createdAt',
            key: 'createdAt',
            width: 140
        },
        {
            title: '最后登录',
            dataIndex: 'lastLogin',
            key: 'lastLogin',
            width: 140
        },
        {
            title: '操作',
            key: 'action',
            width: 180,
            render: (_: unknown, record: User) => {
                return (
                    <Space size="middle">
                        <Button
                            variant={"filled"}
                            color={"green"}
                            icon={<EyeOutlined />}
                            onClick={() => handleViewUser(record)}
                            className="text-blue-500"
                        >
                            查看
                        </Button>
                        <Button
                            variant={"filled"}
                            color={"orange"}
                            icon={<DeleteOutlined />} 
                            onClick={() => handleDeleteUser(record.id)}
                            className="text-red-500"
                        >
                            删除
                        </Button>
                        <Dropdown placement={"bottomCenter"}
                                  menu={{ items: [
                            {
                                key: 'edit',
                                label: (
                                    <Button type="text" onClick={() => handleEditUser(record)} className="w-full">
                                        编辑用户
                                    </Button>
                                )
                            },
                            {
                                key: 'changeRole',
                                label: (
                                    <Button type="text" className="w-full justify-center">
                                        修改角色
                                    </Button>
                                )
                            },
                            {
                                key: 'changeStatus',
                                label: (
                                    <Button type="text" className="w-full justify-start">
                                        修改状态
                                    </Button>
                                )
                            },
                            {
                                key: 'disable',
                                label: (
                                    <Button 
                                        type="text" 
                                        className="w-full justify-start"
                                        disabled={record.status === 'banned'}
                                    >
                                        {record.status === 'banned' ? '已禁用' : '禁用用户'}
                                    </Button>
                                ),
                                disabled: record.status === 'banned'
                            }
                        ]}}>
                            <Button variant={"filled"}
                                    color={"cyan"}>
                                更多
                            </Button>
                        </Dropdown>
                    </Space>
                );
            }
        }
    ];

    return (
        <div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">用户管理</h2>

            {/* 搜索和筛选 */}
            <Card variant={"borderless"} className="border-b border-gray-100 mb-4">
                <div className="flex flex-col md:flex-row gap-4">
                    <Search
                        placeholder="搜索用户名、邮箱或手机号"
                        allowClear
                        enterButton={<SearchOutlined />}
                        onSearch={handleSearch}
                        style={{ width: 300 }}
                    />
                    <Select
                        placeholder="按角色筛选"
                        allowClear
                        style={{ width: 150 }}
                        onChange={handleRoleChange}
                    >
                        {roleOptions.map(option => (
                            <Option key={option.value} value={option.value}>
                                {option.label}
                            </Option>
                        ))}
                    </Select>
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
                </div>
            </Card>

            {/* 用户列表 */}
            <Card variant={"borderless"}>
                <Table
                    columns={columns}
                    dataSource={filteredUsers}
                    rowKey="id"
                    pagination={{
                        showSizeChanger: true,
                        placement: ['bottomCenter'],
                        pageSizeOptions: ['10', '20', '50'],
                        defaultPageSize: 10,
                        showTotal: (total) => `共 ${total} 个用户`,
                        onChange: (page, pageSize) => {
                            console.log(`Page: ${page}, PageSize: ${pageSize}`);
                        }
                    }}
                />
            </Card>

            {/* 添加/编辑用户模态框 */}
            <Modal
                title={isEditing ? '编辑用户' : '添加用户'}
                open={isModalVisible}
                onOk={handleSaveUser}
                onCancel={() => setIsModalVisible(false)}
                okText="保存"
                cancelText="取消"
            >
                <Form
                    form={form}
                    layout="vertical"
                    initialValues={{
                        role: 'user',
                        status: 'active'
                    }}
                >
                    <Form.Item
                        name="username"
                        label="用户名"
                        rules={[
                            { required: true, message: '请输入用户名' },
                            { min: 3, max: 20, message: '用户名长度应在3-20个字符之间' }
                        ]}
                    >
                        <Input prefix={<UserOutlined />} placeholder="请输入用户名" />
                    </Form.Item>

                    <Form.Item
                        name="nickname"
                        label="昵称"
                        rules={[
                            { required: true, message: '请输入昵称' },
                            { min: 2, max: 20, message: '昵称长度应在2-20个字符之间' }
                        ]}
                    >
                        <Input placeholder="请输入昵称" />
                    </Form.Item>

                    <Form.Item
                        name="email"
                        label="邮箱"
                        rules={[
                            { required: true, message: '请输入邮箱' },
                            { type: 'email', message: '请输入有效的邮箱地址' }
                        ]}
                    >
                        <Input prefix={<MailOutlined />} placeholder="请输入邮箱" />
                    </Form.Item>

                    <Form.Item
                        name="phone"
                        label="手机号"
                        rules={[
                            { required: true, message: '请输入手机号' },
                            { pattern: /^1[3-9]\d{9}$/, message: '请输入有效的手机号' }
                        ]}
                    >
                        <Input prefix={<PhoneOutlined />} placeholder="请输入手机号" />
                    </Form.Item>

                    <Form.Item
                        name="role"
                        label="角色"
                        rules={[{ required: true, message: '请选择角色' }]}
                    >
                        <Select placeholder="请选择角色">
                            {roleOptions.map(option => (
                                <Option key={option.value} value={option.value}>
                                    {option.label}
                                </Option>
                            ))}
                        </Select>
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

            {/* 查看用户模态框 */}
            <Modal
                title="用户详情"
                open={isViewModalVisible}
                onCancel={() => setIsViewModalVisible(false)}
                width={600}
                footer={[
                    <Button key="close" onClick={() => setIsViewModalVisible(false)}>
                        关闭
                    </Button>
                ]}
            >
                {currentUser && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <div className="flex items-center gap-2">
                                <UserOutlined className="text-gray-500" />
                                <span className="font-medium">用户名:</span>
                                <span>{currentUser.username}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <UserOutlined className="text-gray-500" />
                                <span className="font-medium">昵称:</span>
                                <span>{currentUser.nickname}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <MailOutlined className="text-gray-500" />
                                <span className="font-medium">邮箱:</span>
                                <span>{currentUser.email}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <PhoneOutlined className="text-gray-500" />
                                <span className="font-medium">手机号:</span>
                                <span>{currentUser.phone}</span>
                            </div>
                        </div>
                        <div className="space-y-4">
                            <div className="flex items-center gap-2">
                                <LockOutlined className="text-gray-500" />
                                <span className="font-medium">角色:</span>
                                <Tag color={getRoleColor(currentUser.role)}>
                                    {roleOptions.find(opt => opt.value === currentUser.role)?.label}
                                </Tag>
                            </div>
                            <div className="flex items-center gap-2">
                                <LockOutlined className="text-gray-500" />
                                <span className="font-medium">状态:</span>
                                <Tag color={getStatusColor(currentUser.status)}>
                                    {statusOptions.find(opt => opt.value === currentUser.status)?.label}
                                </Tag>
                            </div>
                            <div className="flex items-center gap-2">
                                <CalendarOutlined className="text-gray-500" />
                                <span className="font-medium">注册时间:</span>
                                <span>{currentUser.createdAt}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <CalendarOutlined className="text-gray-500" />
                                <span className="font-medium">最后登录:</span>
                                <span>{currentUser.lastLogin}</span>
                            </div>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default AdminUsers;