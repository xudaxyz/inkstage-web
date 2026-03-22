import React, { useState, useEffect, useCallback } from 'react';
import { Card, Table, Input, Button, Space, Tag, Modal, Select, message, Dropdown, DatePicker, Tabs, Switch } from 'antd';
import {
    SearchOutlined,
    EyeOutlined,
    UserOutlined,
    EnvironmentOutlined,
    MailOutlined,
    PhoneOutlined,
    ClockCircleOutlined,
    MessageOutlined,
    LikeOutlined,
    FileTextOutlined,
    ManOutlined,
    WomanOutlined
} from '@ant-design/icons';
import userService from '../../services/userService';
import { type AdminUser } from '../../types/user';
import type { Dayjs } from 'dayjs';
import {
    ArticleStatusMap,
    CommentStatusMap,
    GenderEnum,
    GenderLabel,
    UserRoleEnum,
    UserRoleEnumLabel,
    UserStatusEnum,
    UserStatusEnumLabel, VerificationStatusEnum,
    VerificationStatusMap
} from '../../types/enums';
import { formatDateTimeShort, formatDateTime } from '../../utils';
import { ROUTES } from '../../constants/routes';

const { Option } = Select;
const { Search } = Input;
const { TabPane } = Tabs;

// 角色选项
const roleOptions = [
    { value: UserRoleEnum.SUPER_ADMIN, label: UserRoleEnumLabel[UserRoleEnum.SUPER_ADMIN] },
    { value: UserRoleEnum.ADMIN, label: UserRoleEnumLabel[UserRoleEnum.ADMIN] },
    { value: UserRoleEnum.USER, label: UserRoleEnumLabel[UserRoleEnum.USER] }
];

// 状态选项
const statusOptions = [
    { value: UserStatusEnum.NORMAL, label: UserStatusEnumLabel[UserStatusEnum.NORMAL] },
    { value: UserStatusEnum.DISABLED, label: UserStatusEnumLabel[UserStatusEnum.DISABLED] },
    { value: UserStatusEnum.PENDING, label: UserStatusEnumLabel[UserStatusEnum.PENDING] }
];

// 验证状态选项
const verificationOptions = [
    { value: VerificationStatusEnum.VERIFIED, label: VerificationStatusMap[VerificationStatusEnum.VERIFIED] },
    { value: VerificationStatusEnum.UNVERIFIED, label: VerificationStatusMap[VerificationStatusEnum.UNVERIFIED] }
];

const AdminUsers: React.FC = () => {
    const [users, setUsers] = useState<AdminUser[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [selectedRole, setSelectedRole] = useState<UserRoleEnum | ''>('');
    const [selectedStatus, setSelectedStatus] = useState<UserStatusEnum | ''>('');
    const [startDate, setStartDate] = useState<Dayjs | null>(null);
    const [endDate, setEndDate] = useState<Dayjs | null>(null);
    const [isViewModalVisible, setIsViewModalVisible] = useState(false);
    const [currentUser, setCurrentUser] = useState<AdminUser | null>(null);
    const [pagination, setPagination] = useState({
        pageNum: 1,
        pageSize: 10,
        total: 0
    });
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [deleteModalVisible, setDeleteModalVisible] = useState(false);
    const [userToDelete, setUserToDelete] = useState<number | null>(null);
    const [editModalVisible, setEditModalVisible] = useState(false);
    const [editUser, setEditUser] = useState<AdminUser | null>(null);
    const [editLoading, setEditLoading] = useState(false);
    const [usernameEditable, setUsernameEditable] = useState(false);
    const [changeRoleModalVisible, setChangeRoleModalVisible] = useState(false);
    const [userToChangeRole, setUserToChangeRole] = useState<AdminUser | null>(null);
    const [targetRole, setTargetRole] = useState<UserRoleEnum | ''>('');

    // 通用的获取用户列表函数，接受分页参数
    const fetchUsersWithParams = useCallback(async (
        pageNum: number,
        pageSize: number,
        keyword?: string,
        userRole?: UserRoleEnum | '',
        userStatus?: UserStatusEnum | '',
        startDate?: Dayjs | null,
        endDate?: Dayjs | null
    ): Promise<void> => {
        setLoading(true);
        try {
            const response = await userService.admin.getUsersByPage({
                pageNum: pageNum,
                pageSize: pageSize,
                keyword: keyword !== undefined ? keyword : searchText,
                userRole: userRole !== undefined ? (userRole || undefined) : (selectedRole || undefined),
                userStatus: userStatus !== undefined ? (userStatus || undefined) : (selectedStatus || undefined),
                startDate: startDate?.toISOString(),
                endDate: endDate?.toISOString()
            });

            console.log('admin users :', response);

            if (response.code === 200 && response.data) {
                const userList = response.data.record.map((user: AdminUser) => ({
                    key: user.id.toString(),
                    id: user.id,
                    username: user.username,
                    nickname: user.nickname,
                    email: user.email,
                    phone: user.phone,
                    userRole: user.userRole,
                    userStatus: user.userStatus,
                    registerTime: user.registerTime,
                    lastLoginTime: user.lastLoginTime,
                    articleCount: user.articleCount,
                    commentCount: user.commentCount,
                    emailVerified: user.emailVerified,
                    phoneVerified: user.phoneVerified,
                    avatar: user.avatar,
                    signature: user.signature,
                    gender: user.gender,
                    location: user.location,
                    website: user.website,
                    followCount: user.followCount,
                    followerCount: user.followerCount,
                    likeCount: user.likeCount,
                    lastLoginIp: user.lastLoginIp,
                    registerIp: user.registerIp,
                    privacy: user.privacy
                }));

                setUsers(userList);
                setPagination(prev => ({
                    ...prev,
                    total: response.data.total
                }));
            } else {
                message.error('获取用户列表失败');
            }
        } catch (error) {
            console.error('获取用户列表失败:', error);
            message.error('获取用户列表失败');
        } finally {
            setLoading(false);
        }
    }, [searchText, selectedRole, selectedStatus]);

    // 获取用户列表（使用当前分页状态）
    const fetchUsers = useCallback((): void => {
        void fetchUsersWithParams(pagination.pageNum, pagination.pageSize, searchText, selectedRole, selectedStatus, startDate, endDate);
    }, [fetchUsersWithParams, pagination.pageNum, pagination.pageSize, searchText, selectedRole, selectedStatus, startDate, endDate]);

    // 搜索和筛选用户
    const handleSearch = (value: string): void => {
        // 先更新状态
        setSearchText(value);
        setPagination(prev => ({ ...prev, pageNum: 1 }));
        void fetchUsersWithParams(1, pagination.pageSize, value);
    };

    const handleRoleChange = (value: UserRoleEnum | ''): void => {
        // 先更新状态
        setSelectedRole(value);
        setPagination(prev => ({ ...prev, pageNum: 1 } ));
        void fetchUsersWithParams(1, pagination.pageSize, searchText, value);
    };

    const handleStatusChange = (value: UserStatusEnum | ''): void => {
        // 先更新状态
        setSelectedStatus(value);
        setPagination(prev => ({ ...prev, pageNum: 1 }));
        void fetchUsersWithParams(1, pagination.pageSize, searchText, selectedRole, value);
    };

    const handleStartDateChange = (date: Dayjs | null): void => {
        // 先更新状态
        setStartDate(date);
        setPagination(prev => ({ ...prev, pageNum: 1 }));
        void fetchUsersWithParams(1, pagination.pageSize, searchText, selectedRole, selectedStatus, date);
    };

    const handleEndDateChange = (date: Dayjs | null): void => {
        // 先更新状态
        setEndDate(date);
        setPagination(prev => ({ ...prev, pageNum: 1 }));
        void fetchUsersWithParams(1, pagination.pageSize, searchText, selectedRole, selectedStatus, startDate, date);
    };

    // 组件挂载时获取用户列表
    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    // 打开查看用户模态框
    const handleViewUser = async (user: AdminUser): Promise<void> => {
        setLoading(true);
        try {
            const response = await userService.admin.getUserById(user.id);
            console.log('user detail:', response);
            if (response.code === 200) {
                setCurrentUser(response.data);
                setActiveTab('account');
                setIsViewModalVisible(true);
            } else {
                message.error('获取用户详情失败');
            }
        } catch (error) {
            console.error('获取用户详情失败:', error);
            message.error('获取用户详情失败');
        } finally {
            setLoading(false);
        }
    };

    // 打开删除确认模态框
    const handleOpenDeleteModal = (id: number): void => {
        setUserToDelete(id);
        setDeleteModalVisible(true);
    };

    // 关闭删除确认模态框
    const handleCloseDeleteModal = (): void => {
        setDeleteModalVisible(false);
        setUserToDelete(null);
    };

    // 删除用户
    const handleDeleteUser = async (): Promise<void> => {
        if (!userToDelete) return;

        setDeleteLoading(true);
        try {
            const response = await userService.admin.deleteUser(userToDelete);
            if (response.code === 200) {
                message.success(response.message || '用户删除成功');
                fetchUsers();
                setDeleteModalVisible(false);
                setUserToDelete(null);
            } else {
                message.error(response.message || '删除用户失败');
            }
        } catch (error) {
            console.error('删除用户失败:', error);
            message.error('删除用户失败');
        } finally {
            setDeleteLoading(false);
        }
    };

    // 打开编辑用户模态框
    const handleOpenEditModal = async (user: AdminUser): Promise<void> => {
        setLoading(true);
        try {
            // 获取用户详情，确保数据完整
            const response = await userService.admin.getUserById(user.id);
            if (response.code === 200) {
                const userDetail = response.data;
                const userWithDefaults = {
                    ...userDetail,
                    gender: userDetail.gender || GenderEnum.UNKNOWN,
                    location: userDetail.location || '',
                    signature: userDetail.signature || '',
                    emailVerified: userDetail.emailVerified || VerificationStatusEnum.UNVERIFIED,
                    phoneVerified: userDetail.phoneVerified || VerificationStatusEnum.UNVERIFIED,
                    website: userDetail.website || '',
                    avatar: userDetail.avatar || '',
                    coverImage: userDetail.coverImage || '',
                    lastLoginIp: userDetail.lastLoginIp || '',
                    registerIp: userDetail.registerIp || '',
                    privacy: userDetail.privacy || 'PUBLIC'
                };
                setEditUser(userWithDefaults);
                setEditModalVisible(true);
            } else {
                message.error('获取用户详情失败');
            }
        } catch (error) {
            console.error('获取用户详情失败:', error);
            message.error('获取用户详情失败');
        } finally {
            setLoading(false);
        }
    };

    // 关闭编辑用户模态框
    const handleCloseEditModal = (): void => {
        setEditModalVisible(false);
        setEditUser(null);
        setUsernameEditable(false);
    };

    // 处理编辑表单字段变化
    const handleEditFieldChange = <K extends keyof AdminUser>(field: K, value: AdminUser[K]): void => {
        if (editUser) {
            setEditUser(prev => {
                if (!prev) return prev;
                return {
                    ...prev,
                    [field]: value
                };
            });
        }
    };

    // 保存编辑的用户信息
    const handleSaveEdit = async (): Promise<void> => {
        if (!editUser) return;

        setEditLoading(true);
        try {
            const response = await userService.admin.updateUser(editUser.id, editUser);
            if (response.code === 200) {
                message.success(response.message || '用户信息更新成功');
                fetchUsers();
                setEditModalVisible(false);
                setEditUser(null);
            } else {
                message.error(response.message || '更新用户信息失败');
            }
        } catch (error) {
            console.error('更新用户信息失败:', error);
            message.error('更新用户信息失败');
        } finally {
            setEditLoading(false);
        }
    };

    // 打开修改角色模态框
    const handleOpenChangeRoleModal = (user: AdminUser): void => {
        setUserToChangeRole(user);
        setTargetRole(user.userRole);
        setChangeRoleModalVisible(true);
    };

    // 关闭修改角色模态框
    const handleCloseChangeRoleModal = (): void => {
        setChangeRoleModalVisible(false);
        setUserToChangeRole(null);
        setTargetRole('');
    };

    // 保存角色修改
    const handleSaveRoleChange = async (): Promise<void> => {
        if (!userToChangeRole || !targetRole) return;

        setEditLoading(true);
        try {
            const response = await userService.admin.updateUserRole(userToChangeRole.id, targetRole);
            if (response.code === 200) {
                message.success(response.message || '角色修改成功');
                fetchUsers();
                setChangeRoleModalVisible(false);
                setUserToChangeRole(null);
                setTargetRole('');
            } else {
                message.error(response.message || '角色修改失败');
            }
        } catch (error) {
            console.error('角色修改失败:', error);
            message.error('角色修改失败');
        } finally {
            setEditLoading(false);
        }
    };

    // 打开修改状态模态框
    const [changeStatusModalVisible, setChangeStatusModalVisible] = useState(false);
    const [userToChangeStatus, setUserToChangeStatus] = useState<AdminUser | null>(null);
    const [targetStatus, setTargetStatus] = useState<UserStatusEnum | ''>('');
    const [activeTab, setActiveTab] = useState('account');

    const handleOpenChangeStatusModal = (user: AdminUser): void => {
        setUserToChangeStatus(user);
        setTargetStatus(user.userStatus);
        setChangeStatusModalVisible(true);
    };

    const handleCloseChangeStatusModal = (): void => {
        setChangeStatusModalVisible(false);
        setUserToChangeStatus(null);
        setTargetStatus('');
    };

    // 保存状态修改
    const handleSaveStatusChange = async (): Promise<void> => {
        if (!userToChangeStatus || !targetStatus) return;

        setEditLoading(true);
        try {
            const response = await userService.admin.updateUserStatus(userToChangeStatus.id, targetStatus);
            if (response.code === 200) {
                message.success(response.message || '状态修改成功');
                fetchUsers();
                setChangeStatusModalVisible(false);
                setUserToChangeStatus(null);
                setTargetStatus('');
            } else {
                message.error(response.message || '状态修改失败');
            }
        } catch (error) {
            console.error('状态修改失败:', error);
            message.error('状态修改失败');
        } finally {
            setEditLoading(false);
        }
    };

    // 切换用户状态
    const handleToggleUserStatus = async (user: AdminUser): Promise<void> => {
        const newStatus = user.userStatus === UserStatusEnum.DISABLED ? UserStatusEnum.NORMAL : UserStatusEnum.DISABLED;

        setEditLoading(true);
        try {
            const response = await userService.admin.updateUserStatus(user.id, newStatus);
            if (response.code === 200) {
                message.success(response.message || (newStatus === UserStatusEnum.NORMAL ? '用户已启用' : '用户已禁用'));
                fetchUsers();
            } else {
                message.error(response.message || '状态修改失败');
            }
        } catch (error) {
            console.error('状态修改失败:', error);
            message.error('状态修改失败');
        } finally {
            setEditLoading(false);
        }
    };

    // 获取角色标签颜色
    const getRoleColor = (role: UserRoleEnum | undefined): string => {
        if (!role) return 'default';
        if (role === UserRoleEnum.USER) return 'green'; // USER
        if (role === UserRoleEnum.ADMIN) return 'blue';  // ADMIN
        if (role === UserRoleEnum.SUPER_ADMIN) return 'red';   // SUPER_ADMIN
        return 'default';
    };

    // 获取状态标签颜色
    const getStatusColor = (status: UserStatusEnum): string => {
        switch (status) {
            case UserStatusEnum.NORMAL:
                return 'green';
            case UserStatusEnum.DISABLED:
                return 'red';
            case UserStatusEnum.PENDING:
                return 'orange';
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
            render: (_: unknown, __: unknown, index: number): number => index + 1
        },
        {
            title: '用户名',
            dataIndex: 'username',
            key: 'username',
            width: 150,
            render: (text: string): React.ReactNode => <span className="font-medium">{text}</span>
        },
        {
            title: '昵称',
            dataIndex: 'nickname',
            key: 'nickname',
            width: 150
        },
        {
            title: '邮箱',
            dataIndex: 'email',
            key: 'email',
            width: 150
        },
        {
            title: '手机号',
            dataIndex: 'phone',
            key: 'phone',
            width: 120
        },
        {
            title: '角色',
            dataIndex: 'userRole',
            key: 'userRole',
            align: 'center' as const,
            width: 80,
            render: (userRole: UserRoleEnum | undefined): React.ReactNode => (
                <Tag color={getRoleColor(userRole)}>
                    {userRole ? UserRoleEnumLabel[userRole] : '未知'}
                </Tag>
            )
        },
        {
            title: '状态',
            dataIndex: 'userStatus',
            key: 'userStatus',
            width: 100,
            render: (status: UserStatusEnum): React.ReactNode => (
                <Tag color={getStatusColor(status)}>
                    {UserStatusEnumLabel[status]}
                </Tag>
            )
        },
        {
            title: '注册时间',
            dataIndex: 'registerTime',
            key: 'registerTime',
            align: 'center' as const,
            width: 180,
            render: (time: string): string => time ? formatDateTimeShort(time) : '未知'
        },
        {
            title: '最后登录时间',
            dataIndex: 'lastLoginTime',
            key: 'lastLoginTime',
            width: 180,
            render: (time: string): string => time ? formatDateTimeShort(time) : '未知'
        },
        {
            title: '操作',
            key: 'action',
            align: 'center' as const,
            width: 120,
            render: (_: unknown, record: AdminUser): React.ReactNode => {
                return (
                    <Space size="middle">
                        <Button
                            variant={'filled'}
                            color={'green'}
                            icon={<EyeOutlined/>}
                            onClick={() => handleViewUser(record)}
                            className="text-blue-500"
                        >
                            查看
                        </Button>
                        <Button
                            variant={'filled'}
                            color={'blue'}
                            icon={<UserOutlined/>}
                            onClick={() => handleOpenEditModal(record)}
                            className="text-blue-500"
                        >
                            编辑
                        </Button>
                        <Dropdown placement={'bottomCenter'}
                                  menu={{
                                      items: [
                                          {
                                              key: 'changeRole',
                                              label: (
                                                  <Button type="text" className="w-full justify-center"
                                                          onClick={() => handleOpenChangeRoleModal(record)}>
                                                      修改角色
                                                  </Button>
                                              )
                                          },
                                          {
                                              key: 'changeStatus',
                                              label: (
                                                  <Button type="text" className="w-full justify-center"
                                                          onClick={() => handleOpenChangeStatusModal(record)}>
                                                      修改状态
                                                  </Button>
                                              )
                                          },
                                          {
                                              key: 'toggleStatus',
                                              label: (
                                                  <Button
                                                      type="text"
                                                      className="w-full justify-start"
                                                      onClick={() => handleToggleUserStatus(record)}
                                                  >
                                                      {record.userStatus === UserStatusEnum.DISABLED ? '启用用户' : '禁用用户'}
                                                  </Button>
                                              )
                                          },
                                          {
                                              key: 'delete',
                                              label: (
                                                  <Button
                                                      type="text"
                                                      className="w-full justify-start text-red-500"
                                                      onClick={() => handleOpenDeleteModal(record.id)}
                                                  >
                                                      删除用户
                                                  </Button>
                                              )
                                          }
                                      ]
                                  }}>
                            <Button variant={'filled'}
                                    color={'cyan'}>
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
            <Card variant={'borderless'} className="border-b border-gray-100 mb-4">
                <div className="flex flex-col md:flex-row gap-4 flex-wrap">
                    <Search
                        placeholder="搜索用户名、邮箱或手机号"
                        allowClear
                        enterButton={<SearchOutlined/>}
                        onSearch={handleSearch}
                        style={{ width: '100%', maxWidth: 300 }}
                    />
                    <Select
                        placeholder="按角色筛选"
                        allowClear
                        style={{ width: '100%', maxWidth: 150 }}
                        onChange={handleRoleChange}
                    >
                        {roleOptions.map(option => (
                            <Option key={option.value} value={option.value}>
                                {option.label}
                            </Option>
                        ))}
                    </Select>
                    <Select
                        placeholder="按用户状态筛选"
                        allowClear
                        style={{ width: '100%', maxWidth: 150 }}
                        onChange={handleStatusChange}
                    >
                        {statusOptions.map(option => (
                            <Option key={option.value} value={option.value}>
                                {option.label}
                            </Option>
                        ))}
                    </Select>
                    <DatePicker
                        placeholder="开始日期"
                        style={{ width: '100%', maxWidth: 150 }}
                        onChange={handleStartDateChange}
                    />
                    <DatePicker
                        placeholder="结束日期"
                        style={{ width: '100%', maxWidth: 150 }}
                        onChange={handleEndDateChange}
                    />
                </div>
            </Card>

            {/* 用户列表 */}
            <Card variant={'borderless'}>
                <div className="overflow-x-auto">
                    <Table
                        columns={columns}
                        dataSource={users}
                        rowKey="id"
                        loading={loading}
                        pagination={{
                            showSizeChanger: true,
                            placement: ['bottomCenter'],
                            pageSizeOptions: ['10', '20', '50'],
                            pageSize: pagination.pageSize,
                            current: pagination.pageNum,
                            total: pagination.total,
                            showTotal: (total) => `共 ${total} 个用户`,
                            onChange: (pageNum, pageSize) => {
                                // 先更新状态
                                setPagination(prev => ({
                                    ...prev,
                                    pageNum: pageNum,
                                    pageSize: pageSize
                                }));
                                void fetchUsersWithParams(pageNum, pageSize);
                            }
                        }}
                        scroll={{ x: 'max-content' }}
                    />
                </div>
            </Card>


            {/* 查看用户详情模态框 */}
            <Modal
                title="用户详情"
                open={isViewModalVisible}
                onCancel={() => setIsViewModalVisible(false)}
                width={900}
                footer={[
                    <Button key="close" onClick={() => setIsViewModalVisible(false)}
                            className="px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 transition-all duration-200">
                        关闭
                    </Button>
                ]}
                className="user-detail-modal"
                styles={{
                    body: {
                        padding: 0,
                        maxHeight: 650,
                        overflow: 'hidden'
                    }
                }}
                style={{
                    borderRadius: '12px',
                    boxShadow: '0 12px 40px rgba(0, 0, 0, 0.12)',
                    overflow: 'hidden'
                }}
            >
                {currentUser && (
                    <div className="space-y-0 flex flex-col">
                        {/* 用户头部信息 */}
                        <div
                            className={currentUser.coverImage ? 'text-white p-6 relative' : 'bg-linear-to-r from-blue-500 to-indigo-600 text-white p-6'}>
                            {currentUser.coverImage && (
                                <div className="absolute inset-0 z-0">
                                    <img
                                        src={currentUser.coverImage}
                                        alt="封面图"
                                        className="w-full h-full object-cover"
                                    />
                                    <div className="absolute inset-0 bg-black/30"></div>
                                </div>
                            )}
                            <div className="relative z-10">
                                <div className="flex flex-col md:flex-row items-center gap-6">
                                    <div className="shrink">
                                        <div
                                            className="w-28 h-28 rounded-full bg-white/20 backdrop-blur-sm overflow-hidden border-3 border-white/30 shadow-lg transition-all duration-300">
                                            <img
                                                src={currentUser.avatar}
                                                alt={currentUser.nickname}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                    </div>
                                    <div className="flex-1 text-center md:text-left">
                                        <div
                                            className="flex flex-wrap items-center justify-start gap-3 mb-3">
                                            <h2 className="text-2xl font-bold">{currentUser.nickname}</h2>
                                            <div className="flex items-center gap-1">
                                                <span>{currentUser.gender === GenderEnum.MALE ? <ManOutlined
                                                    style={{ color: 'blue' }}/> : currentUser.gender === GenderEnum.FEMALE ?
                                                    <WomanOutlined
                                                        style={{ color: 'red' }}/> : GenderLabel[currentUser.gender]}</span>
                                            </div>
                                            <div className="flex justify-start self-start">
                                                <span className="text-white/80 ">@{currentUser.username}</span>
                                            </div>
                                        </div>
                                        <div className="flex flex-wrap justify-center md:justify-start gap-2 mb-4">
                                            <Tag color="blue" variant={'outlined'}
                                                 className="font-medium px-3 py-1 text-sm">
                                                {UserRoleEnumLabel[currentUser.userRole]}
                                            </Tag>
                                            <Tag color={getStatusColor(currentUser.userStatus)}
                                                 className="text-white font-medium px-3 py-1 text-sm rounded-full">
                                                {UserStatusEnumLabel[currentUser.userStatus]}
                                            </Tag>
                                        </div>
                                        {currentUser.signature && (
                                            <p className="text-white/90 mb-4 text-sm italic max-w-2xl mx-auto md:mx-0">{currentUser.signature}</p>
                                        )}
                                        <div
                                            className="flex flex-wrap justify-center md:justify-start gap-4 text-xs text-white/80">
                                            <div className="flex items-center gap-1">
                                                <MailOutlined size={14}/>
                                                <span>{currentUser.email || '未设置'}</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <PhoneOutlined size={14}/>
                                                <span>{currentUser.phone || '未设置'}</span>
                                            </div>

                                            <div className="flex items-center gap-1">
                                                <EnvironmentOutlined size={14}/>
                                                <span>{currentUser.location || '未设置'}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 统计信息卡片 */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-0 bg-white">
                            <div
                                className="p-4 border-b md:border-b-0 md:border-r border-gray-100 hover:bg-gray-50 transition-all duration-200">
                                <div className="text-xs text-gray-500 mb-1">文章数</div>
                                <div className="text-2xl font-bold text-blue-600">{currentUser.articleCount || 0}</div>
                            </div>
                            <div
                                className="p-4 border-b md:border-b-0 md:border-r border-gray-100 hover:bg-gray-50 transition-all duration-200">
                                <div className="text-xs text-gray-500 mb-1">评论数</div>
                                <div className="text-2xl font-bold text-green-600">{currentUser.commentCount || 0}</div>
                            </div>
                            <div
                                className="p-4 border-b md:border-b-0 md:border-r border-gray-100 hover:bg-gray-50 transition-all duration-200">
                                <div className="text-xs text-gray-500 mb-1">获赞数</div>
                                <div className="text-2xl font-bold text-orange-500">{currentUser.likeCount || 0}</div>
                            </div>
                            <div
                                className="p-4 border-b md:border-b-0 border-gray-100 hover:bg-gray-50 transition-all duration-200">
                                <div className="text-xs text-gray-500 mb-1">粉丝数</div>
                                <div
                                    className="text-2xl font-bold text-purple-600">{currentUser.followerCount || 0}</div>
                            </div>
                        </div>

                        {/* 标签页导航 */}
                        <div className="flex-1 h-[450px] overflow-auto bg-white">
                            <Tabs activeKey={activeTab} onChange={setActiveTab}>
                                {/* 账号信息 */}
                                <TabPane tab={<div className="flex items-center"><UserOutlined
                                    className="text-blue-500"/><span>账号信息</span></div>} key="account">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-3">
                                            <div className="flex flex-col p-3 bg-gray-50 rounded-md">
                                                <span className="text-xs text-gray-500 mb-1">注册时间</span>
                                                <span
                                                    className="text-gray-800 text-sm">{currentUser.registerTime ? formatDateTime(currentUser.registerTime) : '未知'}</span>
                                            </div>
                                            <div className="flex flex-col p-3 bg-gray-50 rounded-md">
                                                <span className="text-xs text-gray-500 mb-1">最后登录</span>
                                                <span
                                                    className="text-gray-800 text-sm">{currentUser.lastLoginTime ? formatDateTime(currentUser.lastLoginTime) : '未知'}</span>
                                            </div>
                                            <div className="flex flex-col p-3 bg-gray-50 rounded-md">
                                                <span className="text-xs text-gray-500 mb-1">注册IP</span>
                                                <span
                                                    className="text-gray-800 text-sm">{currentUser.registerIp || '未知'}</span>
                                            </div>
                                            <div className="flex flex-col p-3 bg-gray-50 rounded-md">
                                                <span className="text-xs text-gray-500 mb-1">最后登录IP</span>
                                                <span
                                                    className="text-gray-800 text-sm">{currentUser.lastLoginIp || '未知'}</span>
                                            </div>
                                        </div>
                                        <div className="space-y-3">
                                            <div className="flex flex-col p-3 bg-gray-50 rounded-md">
                                                <span className="text-xs text-gray-500 mb-1">个人网站</span>
                                                <span
                                                    className="text-gray-800 text-sm">{currentUser.website || '未设置'}</span>
                                            </div>
                                            <div className="flex flex-col p-3 bg-gray-50 rounded-md">
                                                <span className="text-xs text-gray-500 mb-1">关注数</span>
                                                <span
                                                    className="text-gray-800 text-sm">{currentUser.followCount || 0}</span>
                                            </div>
                                            <div className="flex flex-col p-3 bg-gray-50 rounded-md">
                                                <span className="text-xs text-gray-500 mb-1">邮箱验证</span>
                                                <span
                                                    className="text-gray-800 text-sm">{VerificationStatusMap[currentUser.emailVerified]}</span>
                                            </div>
                                            <div className="flex flex-col p-3 bg-gray-50 rounded-md">
                                                <span className="text-xs text-gray-500 mb-1">手机验证</span>
                                                <span
                                                    className="text-gray-800 text-sm">{VerificationStatusMap[currentUser.phoneVerified]}</span>
                                            </div>
                                        </div>
                                    </div>
                                </TabPane>

                                {/* 最近发布的文章 */}
                                <TabPane tab={<div className="flex items-center"><FileTextOutlined
                                    className="text-blue-500"/><span>最近发布的文章</span></div>} key="articles">
                                    <div className="w-full">
                                        {currentUser.recentArticles && currentUser.recentArticles.length > 0 ? (
                                            <div className="space-y-3 max-h-[300px] overflow-auto">
                                                {currentUser.recentArticles.map((article) => (
                                                    <div key={article.id}
                                                         className="p-4 rounded-md border border-gray-100 hover:shadow-sm transition-all duration-200 bg-white">
                                                        <div className="flex justify-between items-start">
                                                            <div className="flex-1">
                                                                <h4 className="font-medium mb-2 text-sm">
                                                                    <a href={ROUTES.ARTICLE_DETAIL(article.id)} target="_blank" rel="noopener noreferrer" className="text-black hover:text-blue-600 transition-colors">
                                                                        {article.title}
                                                                    </a>
                                                                </h4>
                                                                <div
                                                                    className="flex flex-wrap gap-3 text-xs text-gray-500">
                                <span className="flex items-center gap-1">
                                  <ClockCircleOutlined size={12}/>
                                    {formatDateTimeShort(article.publishTime)}
                                </span>
                                                                    <span className="flex items-center gap-1">
                                  <EyeOutlined size={12}/>
                                                                        {article.readCount}
                                </span>
                                                                    <span className="flex items-center gap-1">
                                  <MessageOutlined size={12}/>
                                                                        {article.commentCount}
                                </span>
                                                                    <span className="flex items-center gap-1">
                                  <LikeOutlined size={12}/>
                                                                        {article.likeCount}
                                </span>
                                                                </div>
                                                            </div>
                                                            <Tag color="blue" className="ml-3 text-xs rounded-full">
                                                                {ArticleStatusMap[article.articleStatus]}
                                                            </Tag>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="text-center py-8 text-gray-500">
                                                暂无发布的文章
                                            </div>
                                        )}
                                    </div>
                                </TabPane>

                                {/* 最近发布的评论 */}
                                <TabPane
                                    tab={<div className="flex items-center"><MessageOutlined className="text-blue-500"/><span>最近发布的评论</span>
                                    </div>} key="comments">
                                    {currentUser.recentComments && currentUser.recentComments.length > 0 ? (
                                        <div className="space-y-3 max-h-[300px] overflow-auto pr-2">
                                            {currentUser.recentComments.map((comment) => (
                                                <div key={comment.id}
                                                     className="p-4 rounded-md border border-gray-100 hover:shadow-sm transition-all duration-200 bg-white">
                                                    <div className="flex justify-between items-start">
                                                        <div className="flex-1">
                                                            <p className="text-gray-700 mb-2 text-sm line-clamp-2 pr-4">{comment.content}</p>
                                                            <div className="flex flex-wrap gap-3 text-xs text-gray-500">
                                <span className="flex items-center gap-1">
                                  <FileTextOutlined size={12}/>
                                  <span className="text-blue-600 hover:underline">{comment.articleTitle}</span>
                                </span>
                                                                <span className="flex items-center gap-1">
                                  <ClockCircleOutlined size={12}/>
                                                                    {formatDateTimeShort(comment.createTime)}
                                </span>
                                                                <span className="flex items-center gap-1">
                                  <LikeOutlined size={12}/>
                                                                    {comment.likeCount}
                                </span>
                                                                <span className="flex items-center gap-1">
                                  <MessageOutlined size={12}/>
                                                                    {comment.replyCount}
                                </span>
                                                            </div>
                                                        </div>
                                                        <Tag color="green" className="ml-3 text-xs rounded-full">
                                                            {CommentStatusMap[comment.status]}
                                                        </Tag>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-8 text-gray-500">
                                            暂无发布的评论
                                        </div>
                                    )}
                                </TabPane>
                            </Tabs>
                        </div>
                    </div>
                )}
            </Modal>

            {/* 删除确认模态框 */}
            <Modal
                title="删除用户"
                open={deleteModalVisible}
                onCancel={handleCloseDeleteModal}
                footer={[
                    <Button key="cancel" onClick={handleCloseDeleteModal} className="px-4 py-2">
                        取消
                    </Button>,
                    <Button
                        key="confirm"
                        type="primary"
                        danger
                        onClick={handleDeleteUser}
                        loading={deleteLoading}
                        className="px-6 py-2"
                    >
                        确定删除
                    </Button>
                ]}
                style={{
                    borderRadius: '12px',
                    boxShadow: '0 12px 40px rgba(0, 0, 0, 0.12)'
                }}
            >
                <div className="py-4">
                    <p className="text-left text-gray-800 font-medium">确定要删除该用户吗？</p>
                </div>
            </Modal>

            {/* 编辑用户模态框 */}
            <Modal
                title="编辑用户"
                open={editModalVisible}
                onCancel={handleCloseEditModal}
                footer={[
                    <Button key="cancel" onClick={handleCloseEditModal} className="px-4 py-2">
                        取消
                    </Button>,
                    <Button
                        key="save"
                        type="primary"
                        onClick={handleSaveEdit}
                        loading={editLoading}
                        className="px-6 py-2"
                    >
                        保存修改
                    </Button>
                ]}
                width={600}
                style={{
                    borderRadius: '12px',
                    boxShadow: '0 12px 40px rgba(0, 0, 0, 0.12)'
                }}
            >
                {editUser && (
                    <div className="py-4 space-y-4">
                        {/* 第一行：用户名和上次修改时间 */}
                        <div className="flex flex-col md:flex-row md:items-center gap-4">
                            <div className="flex-1">
                                <div className="flex items-center gap-1">
                                    <label className="text-base font-medium text-gray-700 whitespace-nowrap">用户名:</label>
                                    <div className="flex-1 flex items-center gap-2 max-w-64">
                                        <Input
                                            value={editUser.username}
                                            variant="underlined"
                                            onChange={(e) => handleEditFieldChange('username', e.target.value)}
                                            disabled={!usernameEditable}
                                            className="flex-1"
                                        />
                                        <Switch
                                            checked={usernameEditable}
                                            checkedChildren="启用"
                                            unCheckedChildren="禁用"
                                            onChange={(checked) => setUsernameEditable(checked)}
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="text-sm font-medium text-gray-700 whitespace-nowrap">
                                {editUser.usernameLastModifiedTime ? (
                                        <span className="flex items-center text-xs pl-2 text-gray-500">
                                            上次修改时间: {formatDateTimeShort(editUser.usernameLastModifiedTime)}
                                        </span>
                                ) : (
                                    <span className="text-xs text-gray-500">用户未修改过</span>
                                )}
                            </div>
                        </div>

                        {/* 第二行：昵称、角色和状态 */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">昵称</label>
                                <Input
                                    value={editUser.nickname}
                                    onChange={(e) => handleEditFieldChange('nickname', e.target.value)}
                                    className="w-full"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">角色</label>
                                <Select
                                    value={editUser.userRole}
                                    onChange={(value) => handleEditFieldChange('userRole', value)}
                                    className="w-full"
                                >
                                    {roleOptions.map(option => (
                                        <Option key={option.value} value={option.value}>
                                            {option.label}
                                        </Option>
                                    ))}
                                </Select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">状态</label>
                                <Select
                                    value={editUser.userStatus}
                                    onChange={(value) => handleEditFieldChange('userStatus', value)}
                                    className="w-full"
                                >
                                    {statusOptions.map(option => (
                                        <Option key={option.value} value={option.value}>
                                            {option.label}
                                        </Option>
                                    ))}
                                </Select>
                            </div>
                        </div>

                        {/* 第三行：邮箱和邮箱验证状态 */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">邮箱</label>
                                <Input
                                    value={editUser.email}
                                    onChange={(e) => handleEditFieldChange('email', e.target.value)}
                                    className="w-full"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">邮箱验证状态</label>
                                <Select
                                    value={editUser.emailVerified || VerificationStatusEnum.UNVERIFIED}
                                    onChange={(value) => handleEditFieldChange('emailVerified', value as VerificationStatusEnum)}
                                    className="w-full"
                                >
                                    {verificationOptions.map(option => (
                                        <Option key={option.value} value={option.value}>
                                            {option.label}
                                        </Option>
                                    ))}
                                </Select>
                            </div>
                        </div>

                        {/* 第四行：手机号和手机验证状态 */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">手机号</label>
                                <Input
                                    value={editUser.phone}
                                    onChange={(e) => handleEditFieldChange('phone', e.target.value)}
                                    className="w-full"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">手机验证状态</label>
                                <Select
                                    value={editUser.phoneVerified || VerificationStatusEnum.UNVERIFIED}
                                    onChange={(value) => handleEditFieldChange('phoneVerified', value as VerificationStatusEnum)}
                                    className="w-full"
                                >
                                    {verificationOptions.map(option => (
                                        <Option key={option.value} value={option.value}>
                                            {option.label}
                                        </Option>
                                    ))}
                                </Select>
                            </div>
                        </div>

                        {/* 第五行：性别（单选框）和所在地 */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">性别</label>
                                <div className="flex gap-4">
                                    <label className="flex items-center gap-1">
                                        <input
                                            type="radio"
                                            name="gender"
                                            checked={editUser.gender === GenderEnum.UNKNOWN}
                                            onChange={() => handleEditFieldChange('gender', GenderEnum.UNKNOWN)}
                                        />
                                        <span>未知</span>
                                    </label>
                                    <label className="flex items-center gap-1">
                                        <input
                                            type="radio"
                                            name="gender"
                                            checked={editUser.gender === GenderEnum.MALE}
                                            onChange={() => handleEditFieldChange('gender', GenderEnum.MALE)}
                                        />
                                        <span>男</span>
                                    </label>
                                    <label className="flex items-center gap-1">
                                        <input
                                            type="radio"
                                            name="gender"
                                            checked={editUser.gender === GenderEnum.FEMALE}
                                            onChange={() => handleEditFieldChange('gender', GenderEnum.FEMALE)}
                                        />
                                        <span>女</span>
                                    </label>
                                    <label className="flex items-center gap-1">
                                        <input
                                            type="radio"
                                            name="gender"
                                            checked={editUser.gender === GenderEnum.SECRET}
                                            onChange={() => handleEditFieldChange('gender', GenderEnum.SECRET)}
                                        />
                                        <span>保密</span>
                                    </label>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">所在地</label>
                                <Input
                                    value={editUser.location}
                                    onChange={(e) => handleEditFieldChange('location', e.target.value)}
                                    className="w-full"
                                />
                            </div>
                        </div>

                        {/* 第六行：签名 */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">签名</label>
                            <Input.TextArea
                                value={editUser.signature}
                                onChange={(e) => handleEditFieldChange('signature', e.target.value)}
                                rows={3}
                                className="w-full"
                            />
                        </div>

                        {/* 第七行：个人网站 */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">个人网站</label>
                            <Input
                                value={editUser.website}
                                onChange={(e) => handleEditFieldChange('website', e.target.value)}
                                className="w-full"
                            />
                        </div>

                        {/* 其他信息 */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">注册时间</label>
                                <Input
                                    value={editUser.registerTime ? formatDateTime(editUser.registerTime) : '未知'}
                                    disabled
                                    className="w-full"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">注册IP</label>
                                <Input
                                    value={editUser.registerIp || '未知'}
                                    disabled
                                    className="w-full"
                                />
                            </div>
                        </div>
                    </div>
                )}
            </Modal>

            {/* 修改角色模态框 */}
            <Modal
                title="修改角色"
                open={changeRoleModalVisible}
                onCancel={handleCloseChangeRoleModal}
                footer={[
                    <Button key="cancel" onClick={handleCloseChangeRoleModal} className="px-4 py-2">
                        取消
                    </Button>,
                    <Button
                        key="save"
                        type="primary"
                        onClick={handleSaveRoleChange}
                        loading={editLoading}
                        className="px-6 py-2"
                    >
                        保存修改
                    </Button>
                ]}
                width={400}
                style={{
                    borderRadius: '12px',
                    boxShadow: '0 12px 40px rgba(0, 0, 0, 0.12)'
                }}
            >
                {userToChangeRole && (
                    <div className="py-4 space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">用户</label>
                            <Input
                                value={`${userToChangeRole.nickname} (@${userToChangeRole.username})`}
                                disabled
                                className="w-full"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">当前角色</label>
                            <Input
                                value={UserRoleEnumLabel[userToChangeRole.userRole]}
                                disabled
                                className="w-full"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">新角色</label>
                            <Select
                                value={targetRole}
                                onChange={(value) => setTargetRole(value)}
                                className="w-full"
                            >
                                {roleOptions.map(option => (
                                    <Option key={option.value} value={option.value}>
                                        {option.label}
                                    </Option>
                                ))}
                            </Select>
                        </div>
                    </div>
                )}
            </Modal>

            {/* 修改状态模态框 */}
            <Modal
                title="修改状态"
                open={changeStatusModalVisible}
                onCancel={handleCloseChangeStatusModal}
                footer={[
                    <Button key="cancel" onClick={handleCloseChangeStatusModal} className="px-4 py-2">
                        取消
                    </Button>,
                    <Button
                        key="save"
                        type="primary"
                        onClick={handleSaveStatusChange}
                        loading={editLoading}
                        className="px-6 py-2"
                    >
                        保存修改
                    </Button>
                ]}
                width={400}
                style={{
                    borderRadius: '12px',
                    boxShadow: '0 12px 40px rgba(0, 0, 0, 0.12)'
                }}
            >
                {userToChangeStatus && (
                    <div className="py-4 space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">用户</label>
                            <Input
                                value={`${userToChangeStatus.nickname} (@${userToChangeStatus.username})`}
                                disabled
                                className="w-full"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">当前状态</label>
                            <Input
                                value={UserStatusEnumLabel[userToChangeStatus.userStatus]}
                                disabled
                                className="w-full"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">新状态</label>
                            <Select
                                value={targetStatus}
                                onChange={(value) => setTargetStatus(value)}
                                className="w-full"
                            >
                                {statusOptions.map(option => (
                                    <Option key={option.value} value={option.value}>
                                        {option.label}
                                    </Option>
                                ))}
                            </Select>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default AdminUsers;
