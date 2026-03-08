import React, { useState } from 'react';
import { Card, Table, Input, Button, Space, Tag, Modal, Form, Select, message, Typography, Switch } from 'antd';
import { SearchOutlined, DeleteOutlined, EyeOutlined, EditOutlined, LockOutlined, UserOutlined, CalendarOutlined, PlusOutlined } from '@ant-design/icons';

const { Search } = Input;
const { Text } = Typography;

// 权限类型定义
interface Permission {
    key: string;
    id: number;
    name: string;
    code: string;
    description: string;
    role: string;
    status: boolean;
    createdAt: string;
    updatedAt: string;
}

// 模拟权限数据
const mockPermissions: Permission[] = [
    {
        key: '1',
        id: 1,
        name: '用户管理',
        code: 'user:manage',
        description: '管理所有用户',
        role: 'admin',
        status: true,
        createdAt: '2026-01-01',
        updatedAt: '2026-01-01'
    },
    {
        key: '2',
        id: 2,
        name: '文章管理',
        code: 'article:manage',
        description: '管理所有文章',
        role: 'admin',
        status: true,
        createdAt: '2026-01-01',
        updatedAt: '2026-01-01'
    },
    {
        key: '3',
        id: 3,
        name: '分类管理',
        code: 'category:manage',
        description: '管理所有分类',
        role: 'admin',
        status: true,
        createdAt: '2026-01-01',
        updatedAt: '2026-01-01'
    },
    {
        key: '4',
        id: 4,
        name: '标签管理',
        code: 'tag:manage',
        description: '管理所有标签',
        role: 'admin',
        status: true,
        createdAt: '2026-01-01',
        updatedAt: '2026-01-01'
    },
    {
        key: '5',
        id: 5,
        name: '评论管理',
        code: 'comment:manage',
        description: '管理所有评论',
        role: 'admin',
        status: true,
        createdAt: '2026-01-01',
        updatedAt: '2026-01-01'
    },
    {
        key: '6',
        id: 6,
        name: '通知管理',
        code: 'notification:manage',
        description: '管理所有通知',
        role: 'admin',
        status: true,
        createdAt: '2026-01-01',
        updatedAt: '2026-01-01'
    },
    {
        key: '7',
        id: 7,
        name: '数据分析',
        code: 'analytics:view',
        description: '查看数据分析',
        role: 'admin',
        status: true,
        createdAt: '2026-01-01',
        updatedAt: '2026-01-01'
    },
    {
        key: '8',
        id: 8,
        name: '系统设置',
        code: 'system:settings',
        description: '管理系统设置',
        role: 'admin',
        status: true,
        createdAt: '2026-01-01',
        updatedAt: '2026-01-01'
    },
    {
        key: '9',
        id: 9,
        name: '文章编辑',
        code: 'article:edit',
        description: '编辑文章',
        role: 'editor',
        status: true,
        createdAt: '2026-01-01',
        updatedAt: '2026-01-01'
    },
    {
        key: '10',
        id: 10,
        name: '评论审核',
        code: 'comment:approve',
        description: '审核评论',
        role: 'editor',
        status: true,
        createdAt: '2026-01-01',
        updatedAt: '2026-01-01'
    }
];

// 角色选项
const roleOptions = [
    { value: 'admin', label: '管理员' },
    { value: 'editor', label: '编辑' },
    { value: 'user', label: '普通用户' }
];

const AdminPermissions: React.FC = () => {
    const [permissions, setPermissions] = useState<Permission[]>(mockPermissions);
    const [filteredPermissions, setFilteredPermissions] = useState<Permission[]>(mockPermissions);
    const [searchText, setSearchText] = useState('');
    const [selectedRole, setSelectedRole] = useState('');
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isViewModalVisible, setIsViewModalVisible] = useState(false);
    const [currentPermission, setCurrentPermission] = useState<Permission | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [form] = Form.useForm();

    // 搜索和筛选权限
    const handleSearch = (value: string) => {
        setSearchText(value);
        filterPermissions(value, selectedRole);
    };

    const handleRoleChange = (value: string) => {
        setSelectedRole(value);
        filterPermissions(searchText, value);
    };

    const filterPermissions = (search: string, role: string) => {
        let filtered = [...permissions];

        if (search) {
            filtered = filtered.filter(permission => 
                permission.name.toLowerCase().includes(search.toLowerCase()) ||
                permission.code.toLowerCase().includes(search.toLowerCase()) ||
                permission.description.toLowerCase().includes(search.toLowerCase())
            );
        }

        if (role) {
            filtered = filtered.filter(permission => permission.role === role);
        }

        setFilteredPermissions(filtered);
    };

    // 打开编辑权限模态框
    const handleEditPermission = (permission: Permission) => {
        setIsEditing(true);
        setCurrentPermission(permission);
        form.setFieldsValue({
            name: permission.name,
            code: permission.code,
            description: permission.description,
            role: permission.role,
            status: permission.status
        });
        setIsModalVisible(true);
    };

    // 打开查看权限模态框
    const handleViewPermission = (permission: Permission) => {
        setCurrentPermission(permission);
        setIsViewModalVisible(true);
    };

    // 删除权限
    const handleDeletePermission = (id: number) => {
        setPermissions(permissions.filter(permission => permission.id !== id));
        setFilteredPermissions(filteredPermissions.filter(permission => permission.id !== id));
        message.success('权限删除成功');
    };

    // 切换权限状态
    const handleToggleStatus = (id: number, status: boolean) => {
        const updatedPermissions = permissions.map(permission => 
            permission.id === id ? { ...permission, status: !status } : permission
        );
        setPermissions(updatedPermissions);
        filterPermissions(searchText, selectedRole);
        message.success(`权限已${status ? '禁用' : '启用'}`);
    };

    // 保存权限
    const handleSavePermission = () => {
        form.validateFields().then(values => {
            if (isEditing && currentPermission) {
                // 编辑现有权限
                const updatedPermissions = permissions.map(permission => 
                    permission.id === currentPermission.id ? { 
                        ...permission, 
                        ...values,
                        updatedAt: new Date().toISOString().split('T')[0]
                    } : permission
                );
                setPermissions(updatedPermissions);
                filterPermissions(searchText, selectedRole);
                message.success('权限更新成功');
            } else {
                // 添加新权限
                const newPermission: Permission = {
                    key: String(permissions.length + 1),
                    id: permissions.length + 1,
                    ...values,
                    createdAt: new Date().toISOString().split('T')[0],
                    updatedAt: new Date().toISOString().split('T')[0]
                };
                setPermissions([...permissions, newPermission]);
                filterPermissions(searchText, selectedRole);
                message.success('权限添加成功');
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

    // 表格列配置
    const columns = [
        {
            title: '序号',
            key: 'index',
            width: 60,
            render: (_: unknown, __: unknown, index: number) => index + 1
        },
        {
            title: '权限名称',
            dataIndex: 'name',
            key: 'name',
            render: (text: string) => <Text className="font-medium">{text}</Text>
        },
        {
            title: '权限代码',
            dataIndex: 'code',
            key: 'code',
            width: 150
        },
        {
            title: '描述',
            dataIndex: 'description',
            key: 'description',
            render: (text: string) => <Text ellipsis={{ tooltip: text }}>{text}</Text>
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
            render: (status: boolean, record: Permission) => (
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
            render: (_: unknown, record: Permission) => (
                <Space size="middle">
                    <Button 
                        type="text" 
                        icon={<EyeOutlined />} 
                        onClick={() => handleViewPermission(record)}
                        className="text-blue-500"
                    >
                        查看
                    </Button>
                    <Button 
                        type="text" 
                        icon={<EditOutlined />} 
                        onClick={() => handleEditPermission(record)}
                        className="text-green-500"
                    >
                        编辑
                    </Button>
                    <Button 
                        type="text" 
                        icon={<DeleteOutlined />} 
                        onClick={() => handleDeletePermission(record.id)}
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
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">权限管理</h2>
            </div>

            {/* 搜索和筛选 */}
            <Card className="mb-6 border border-gray-100 shadow-sm">
                <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
                    <Search
                        placeholder="搜索权限名称、代码或描述"
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
                            setCurrentPermission(null);
                            form.resetFields();
                            setIsModalVisible(true);
                        }}
                    >
                        新增权限
                    </Button>
                </div>
            </Card>

            {/* 权限列表 */}
            <Card className="border border-gray-100 shadow-sm">
                <Table
                    columns={columns}
                    dataSource={filteredPermissions}
                    rowKey="id"
                    pagination={{
                        showSizeChanger: true,
                        pageSizeOptions: ['10', '20', '50'],
                        defaultPageSize: 10,
                        showTotal: (total) => `共 ${total} 个权限`
                    }}
                />
            </Card>

            {/* 添加/编辑权限模态框 */}
            <Modal
                title={isEditing ? '编辑权限' : '添加权限'}
                open={isModalVisible}
                onOk={handleSavePermission}
                onCancel={() => setIsModalVisible(false)}
                width={500}
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
                        name="name"
                        label="权限名称"
                        rules={[
                            { required: true, message: '请输入权限名称' },
                            { min: 2, max: 50, message: '权限名称长度应在2-50个字符之间' }
                        ]}
                    >
                        <Input placeholder="请输入权限名称" />
                    </Form.Item>

                    <Form.Item
                        name="code"
                        label="权限代码"
                        rules={[
                            { required: true, message: '请输入权限代码' },
                            { min: 2, max: 50, message: '权限代码长度应在2-50个字符之间' }
                        ]}
                    >
                        <Input placeholder="请输入权限代码，如 user:manage" />
                    </Form.Item>

                    <Form.Item
                        name="description"
                        label="描述"
                        rules={[
                            { required: true, message: '请输入描述' },
                            { max: 200, message: '描述长度不能超过200个字符' }
                        ]}
                    >
                        <Input.TextArea rows={3} placeholder="请输入权限描述" />
                    </Form.Item>

                    <Form.Item
                        name="role"
                        label="角色"
                        rules={[{ required: true, message: '请选择角色' }]}
                    >
                        <Select placeholder="请选择角色">
                            {roleOptions.map(option => (
                                <Select.Option key={option.value} value={option.value}>
                                    {option.label}
                                </Select.Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="status"
                        label="状态"
                    >
                        <Switch />
                    </Form.Item>
                </Form>
            </Modal>

            {/* 查看权限模态框 */}
            <Modal
                title="权限详情"
                open={isViewModalVisible}
                onCancel={() => setIsViewModalVisible(false)}
                width={500}
                footer={[
                    <Button key="close" onClick={() => setIsViewModalVisible(false)}>
                        关闭
                    </Button>
                ]}
            >
                {currentPermission && (
                    <div className="space-y-4">
                        <div className="flex items-center gap-2">
                            <LockOutlined className="text-gray-500" />
                            <span className="font-medium">权限名称:</span>
                            <span>{currentPermission.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <LockOutlined className="text-gray-500" />
                            <span className="font-medium">权限代码:</span>
                            <span>{currentPermission.code}</span>
                        </div>
                        <div className="flex items-start gap-2">
                            <LockOutlined className="text-gray-500 mt-1" />
                            <span className="font-medium">描述:</span>
                            <span>{currentPermission.description}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <UserOutlined className="text-gray-500" />
                            <span className="font-medium">角色:</span>
                            <Tag color={getRoleColor(currentPermission.role)}>
                                {roleOptions.find(opt => opt.value === currentPermission.role)?.label}
                            </Tag>
                        </div>
                        <div className="flex items-center gap-2">
                            <LockOutlined className="text-gray-500" />
                            <span className="font-medium">状态:</span>
                            <Tag color={currentPermission.status ? 'green' : 'red'}>
                                {currentPermission.status ? '启用' : '禁用'}
                            </Tag>
                        </div>
                        <div className="flex items-center gap-2">
                            <CalendarOutlined className="text-gray-500" />
                            <span className="font-medium">创建时间:</span>
                            <span>{currentPermission.createdAt}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <CalendarOutlined className="text-gray-500" />
                            <span className="font-medium">更新时间:</span>
                            <span>{currentPermission.updatedAt}</span>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default AdminPermissions;