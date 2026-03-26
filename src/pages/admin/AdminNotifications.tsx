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
    Switch,
    Tabs,
    Alert,
    Tooltip,
    Descriptions
} from 'antd';
import {
    SearchOutlined,
    DeleteOutlined,
    EyeOutlined,
    EditOutlined,
    UserOutlined,
    CalendarOutlined,
    PlusOutlined,
    SendOutlined,
    MinusCircleOutlined,
    PlusCircleOutlined
} from '@ant-design/icons';
import notificationTemplateService from '../../services/notificationTemplateService';
import type {
    AdminNotificationTemplate,
    NotificationTemplate,
    ManualNotification,
    TemplatePreview
} from '../../types/notificationTemplate';
import {
    NotificationType,
    NotificationTypeMap,
    NotificationChannel,
    NotificationChannelMap,
    PriorityEnum,
    PriorityMap,
    StatusEnum,
    StatusEnumLabel
} from '../../types/enums';

const { Search } = Input;
const { Text } = Typography;
const { TabPane } = Tabs;
const AdminNotifications: React.FC = () => {
    // 状态管理
    const [templates, setTemplates] = useState<AdminNotificationTemplate[]>([]);
    const [filteredTemplates, setFilteredTemplates] = useState<AdminNotificationTemplate[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [selectedType, setSelectedType] = useState<NotificationType>();
    const [selectedStatus, setSelectedStatus] = useState<StatusEnum>();
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isViewModalVisible, setIsViewModalVisible] = useState(false);
    const [isPreviewModalVisible, setIsPreviewModalVisible] = useState(false);
    const [currentTemplate, setCurrentTemplate] = useState<AdminNotificationTemplate | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [previewResult, setPreviewResult] = useState<TemplatePreview | null>(null);
    const [form] = Form.useForm();
    const [sendForm] = Form.useForm();
    const [previewForm] = Form.useForm();
    // 解析变量数据
    const parseVariables = (val: string): Array<{ name: string; value: string }> => {
        if (!val) return [];
        try {
            const parsed = JSON.parse(val);
            // 检查是否为数组
            if (Array.isArray(parsed)) {
                return parsed;
            }
            return [];
        } catch {
            return [];
        }
    };

    const VariableEditor: React.FC<{
        value: string;
        onChange: (value: string) => void;
    }> = ({ value, onChange }) => {
        const [variables, setVariables] = useState<Array<{ name: string; value: string }>>(
        parseVariables(value)
    );
    // 监听 value 变化，更新内部状态
    useEffect(() => {
        setVariables(parseVariables(value));
    }, [value]);
        const handleAdd = (): void => {
            setVariables([...variables, { name: `name${variables.length + 1}`, value: '' }]);
        };
        const handleChange = (index: number, field: 'name' | 'value', val: string): void => {
            const newVariables = [...variables];
            newVariables[index] = { ...newVariables[index], [field]: val };
            setVariables(newVariables);
        };
        const handleDelete = (index: number): void => {
            const newVariables = variables.filter((_, i) => i !== index);
            setVariables(newVariables);
        };
        useEffect(() => {
            // 只有当variables确实发生变化且不为空时才调用onChange
            if (variables.length > 0) {
                const variablesString = JSON.stringify(variables);
                // 避免与当前value相同导致的死循环
                if (variablesString !== value) {
                    onChange(variablesString);
                }
            }
        }, [variables, onChange, value]);
        return (
            <div className="space-y-4">
                <div className="flex justify-between items-center mb-4">
                    <h4 className="text-sm font-semibold text-gray-700">变量说明</h4>
                    <Button
                        icon={<PlusCircleOutlined/>}
                        onClick={handleAdd}
                        type="dashed"
                    >
                        添加变量
                    </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {variables.map((variable, index) => (
                        <div key={index} className="flex items-center gap-2">
                            <Input
                                value={variable.name}
                                onChange={(e) => handleChange(index, 'name', e.target.value)}
                                placeholder="变量名"
                                style={{ width: 120 }}
                                size="middle"
                            />
                            <span className="text-gray-500">:</span>
                            <Input
                                value={variable.value}
                                onChange={(e) => handleChange(index, 'value', e.target.value)}
                                placeholder="变量描述"
                                style={{ flex: 1 }}
                                size="middle"
                            />
                            <Button
                                danger
                                icon={<MinusCircleOutlined/>}
                                onClick={() => handleDelete(index)}
                                size="small"
                            />
                        </div>
                    ))}
                </div>
            </div>
        );
    };
    // 获取通知模板列表
    const fetchTemplates = useCallback(async () => {
        try {
            setLoading(true);
            const response = await notificationTemplateService.getTemplatePage();
            console.log('getTemplatePage', response);
            if (response.code === 200) {
                setTemplates(response.data?.record || []);
                setFilteredTemplates(response.data?.record || []);
            } else {
                message.error(response.message || '获取模板列表失败');
            }
        } catch (error) {
            console.error('获取模板列表失败:', error);
            message.error('获取模板列表失败');
        } finally {
            setLoading(false);
        }
    }, []);
    // 初始化加载
    useEffect(() => {
        void fetchTemplates();
    }, [fetchTemplates]);
    // 搜索和筛选模板
    const handleSearch = (value: string): void => {
        setSearchText(value);
        filterTemplates(value, selectedType, selectedStatus);
    };
    const handleTypeChange = (value: NotificationType | undefined): void => {
        setSelectedType(value);
        filterTemplates(searchText, value, selectedStatus);
    };
    const handleStatusChange = (value: StatusEnum | undefined): void => {
        setSelectedStatus(value);
        filterTemplates(searchText, selectedType, value);
    };
    const filterTemplates = (search: string, type?: NotificationType, status?: StatusEnum): void => {
        let filtered = [...templates];
        if (search) {
            filtered = filtered.filter(template =>
                template.name.toLowerCase().includes(search.toLowerCase()) ||
                template.code.toLowerCase().includes(search.toLowerCase()) ||
                template.description.toLowerCase().includes(search.toLowerCase())
            );
        }
        if (type) {
            filtered = filtered.filter(template => template.type === type);
        }
        if (status) {
            filtered = filtered.filter(template => template.status === status);
        }
        setFilteredTemplates(filtered);
    };
    // 打开编辑模板模态框
    const handleEditTemplate = (template: AdminNotificationTemplate): void => {
        setIsEditing(true);
        setCurrentTemplate(template);
        form.setFieldsValue({
            code: template.code,
            name: template.name,
            titleTemplate: template.titleTemplate,
            contentTemplate: template.contentTemplate,
            type: template.type,
            channel: template.channel,
            actionUrlTemplate: template.actionUrlTemplate,
            variables: template.variables,
            description: template.description,
            priority: template.priority,
            status: template.status
        });
        setIsModalVisible(true);
    };
    // 打开查看模板模态框
    const handleViewTemplate = (template: AdminNotificationTemplate): void => {
        setCurrentTemplate(template);
        setIsViewModalVisible(true);
    };
    // 删除模板
    const handleDeleteTemplate = async (id: number): Promise<void> => {
        try {
            setLoading(true);
            const response = await notificationTemplateService.deleteTemplate(id);
            if (response.code === 200) {
                message.success('模板删除成功');
                await fetchTemplates();
            } else {
                message.error(response.message || '删除模板失败');
            }
        } catch (error) {
            console.error('删除模板失败:', error);
            message.error('删除模板失败');
        } finally {
            setLoading(false);
        }
    };
    // 切换模板状态
    const handleToggleStatus = async (id: number, currentStatus: StatusEnum): Promise<void> => {
        try {
            setLoading(true);
            const newStatus = currentStatus === StatusEnum.ENABLED ? StatusEnum.DISABLED : StatusEnum.ENABLED;
            const response = newStatus === StatusEnum.ENABLED
                ? await notificationTemplateService.enableTemplate(id)
                : await notificationTemplateService.disableTemplate(id);
            if (response.code === 200) {
                message.success(`模板已${newStatus === StatusEnum.ENABLED ? '启用' : '禁用'}`);
                await fetchTemplates();
            } else {
                message.error(response.message || '更新模板状态失败');
            }
        } catch (error) {
            console.error('更新模板状态失败:', error);
            message.error('更新模板状态失败');
        } finally {
            setLoading(false);
        }
    };
    // 保存模板
    const handleSaveTemplate = async (): Promise<void> => {
        try {
            setLoading(true);
            await form.validateFields();
            const values = form.getFieldsValue();
            if (isEditing && currentTemplate) {
                // 编辑现有模板
                const updateDTO: NotificationTemplate = {
                    id: currentTemplate.id,
                    ...values
                };
                const response = await notificationTemplateService.updateTemplate(currentTemplate.id, updateDTO);
                if (response.code === 200) {
                    message.success('模板更新成功');
                    await fetchTemplates();
                } else {
                    message.error(response.message || '更新模板失败');
                }
            } else {
                // 添加新模板
                const createDTO: NotificationTemplate = values;
                // 检查编码是否存在
                const checkResponse = await notificationTemplateService.checkCodeExists(createDTO.code);
                if (checkResponse.code === 200 && checkResponse.data) {
                    message.error('模板编码已存在');
                    return;
                }
                console.log('checkResponse', checkResponse);
                console.log('createDTO', createDTO);
                const response = await notificationTemplateService.createTemplate(createDTO);
                console.log('createTemplate response', response);
                if (response.code === 200) {
                    message.success('模板创建成功');
                    await fetchTemplates();
                } else {
                    message.error(response.message || '创建模板失败');
                }
            }
            setIsModalVisible(false);
        } catch (error) {
            console.error('保存模板失败:', error);
            message.error('保存模板失败');
        } finally {
            setLoading(false);
        }
    };
    // 预览模板
    const handlePreviewTemplate = async (): Promise<void> => {
        try {
            setLoading(true);
            await previewForm.validateFields();
            const values = previewForm.getFieldsValue();
            let variables: Record<string, object> = {};
            try {
                variables = JSON.parse(values.variables);
            } catch (error) {
                message.error('变量格式错误，请输入有效的JSON');
                console.error('变量格式错误', error);
                return;
            }
            const response = await notificationTemplateService.previewTemplate(values.templateCode, variables);
            if (response.code === 200) {
                setPreviewResult(response.data);
                setIsPreviewModalVisible(true);
            } else {
                message.error(response.message || '预览模板失败');
            }
        } catch (error) {
            console.error('预览模板失败:', error);
            message.error('预览模板失败');
        } finally {
            setLoading(false);
        }
    };
    // 发送通知
    const handleSendNotification = async (): Promise<void> => {
        try {
            setLoading(true);
            await sendForm.validateFields();
            const values = sendForm.getFieldsValue();
            let variables: Record<string, object> = {};
            try {
                variables = JSON.parse(values.variables);
            } catch (error) {
                message.error('变量格式错误，请输入有效的JSON');
                console.error('预览模板失败:', error);
                return;
            }
            const sendDTO: ManualNotification = {
                templateCode: values.templateCode,
                variables,
                userType: values.userType,
                userIds: values.userIds ? values.userIds.split(',').map((id: number) => id) : undefined,
                roleCode: values.roleCode,
                relatedId: values.relatedId
            };
            const response = await notificationTemplateService.sendNotification(sendDTO);
            if (response.code === 200) {
                message.success('通知发送成功');
            } else {
                message.error(response.message || '发送通知失败');
            }
        } catch (error) {
            console.error('发送通知失败:', error);
            message.error('发送通知失败');
        } finally {
            setLoading(false);
        }
    };
    // 获取类型标签颜色
    const getTypeColor = (type: NotificationType): string => {
        switch (type) {
            case NotificationType.SYSTEM:
                return 'blue';
            case NotificationType.ARTICLE_PUBLISH:
                return 'green';
            case NotificationType.ARTICLE_LIKE:
                return 'purple';
            case NotificationType.ARTICLE_COLLECTION:
                return 'orange';
            case NotificationType.ARTICLE_COMMENT:
                return 'cyan';
            case NotificationType.COMMENT_REPLY:
                return 'gold';
            case NotificationType.COMMENT_LIKE:
                return 'lime';
            case NotificationType.FOLLOW:
                return 'pink';
            case NotificationType.MESSAGE:
                return 'red';
            case NotificationType.REPORT:
                return 'volcano';
            case NotificationType.FEEDBACK:
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
            render: (_: unknown, __: unknown, index: number): number => index + 1
        },
        {
            title: '模板编码',
            dataIndex: 'code',
            key: 'code',
            width: 150,
            render: (text: string): React.ReactNode => <Text ellipsis={{ tooltip: text }}
                                                             className="font-medium">{text}</Text>
        },
        {
            title: '模板名称',
            dataIndex: 'name',
            key: 'name',
            width: 180,
            render: (text: string): React.ReactNode => <Text ellipsis={{ tooltip: text }}
                                                             className="font-medium">{text}</Text>
        },
        {
            title: '类型',
            dataIndex: 'type',
            key: 'type',
            width: 120,
            render: (type: NotificationType): React.ReactNode => (
                <Tag color={getTypeColor(type)}>
                    {NotificationTypeMap[type]}
                </Tag>
            )
        },
        {
            title: '渠道',
            dataIndex: 'channel',
            key: 'channel',
            width: 100,
            render: (channel: NotificationChannel): React.ReactNode => (
                <Tag color="blue">
                    {NotificationChannelMap[channel]}
                </Tag>
            )
        },
        {
            title: '变量说明',
            dataIndex: 'variables',
            key: 'variables',
            align: 'center' as const,
            width: 180,
            render: (variables: string): React.ReactNode => {
                try {
                    const parsedVariables = JSON.parse(variables);
                    let variableList: Array<{ name: string; value: string }> = [];
                    if (Array.isArray(parsedVariables)) {
                        variableList = parsedVariables;
                    }
                    const variableCount = variableList.length;
                    const displayEntries = variableList.slice(0, 2);
                    if (variableCount === 0) {
                        return (
                            <Tag color="blue">
                                无变量
                            </Tag>
                        );
                    }
                    return (
                        <Tooltip title={`共${variableCount}个变量`}>
                            <div className="space-y-1">
                                {displayEntries.map(({ name, value }) => (
                                    <div key={name} className="flex items-center justify-center">
                                        <Tag color="default">{name}</Tag>
                                        <span className="mx-1">:</span>
                                        <Tag color="cyan-inverse">{value}</Tag>
                                    </div>
                                ))}
                                {variableCount > 2 && (
                                    <div className="text-gray-400 text-xs">
                                        还有{variableCount - 2}个变量...
                                    </div>
                                )}
                            </div>
                        </Tooltip>
                    );
                } catch {
                    return (
                        <Tag color="red">
                            格式错误
                        </Tag>
                    );
                }
            }
        },
        {
            title: '优先级',
            dataIndex: 'priority',
            key: 'priority',
            width: 80,
            render: (priority: PriorityEnum): React.ReactNode => (
                <Tag color={priority === PriorityEnum.HIGH || priority === PriorityEnum.URGENT ? 'red' : 'orange'}>
                    {PriorityMap[priority]}
                </Tag>
            )
        },
        {
            title: '状态',
            dataIndex: 'status',
            key: 'status',
            width: 80,
            render: (status: StatusEnum, record: AdminNotificationTemplate): React.ReactNode => (
                <Switch
                    checked={status === StatusEnum.ENABLED}
                    onChange={() => handleToggleStatus(record.id, status)}
                />
            )
        },
        {
            title: '创建时间',
            dataIndex: 'createTime',
            key: 'createTime',
            width: 160,
            render: (time: string): React.ReactNode => {
                try {
                    return new Date(time).toLocaleString();
                } catch {
                    return time;
                }
            }
        },
        {
            title: '操作',
            key: 'action',
            width: 200,
            render: (_: unknown, record: AdminNotificationTemplate): React.ReactNode => (
                <Space size="middle">
                    <Button
                        type="text"
                        icon={<EyeOutlined/>}
                        onClick={() => handleViewTemplate(record)}
                        className="text-blue-500"
                    >
                        查看
                    </Button>
                    <Button
                        type="text"
                        icon={<EditOutlined/>}
                        onClick={() => handleEditTemplate(record)}
                        className="text-green-500"
                    >
                        编辑
                    </Button>
                    <Button
                        type="text"
                        icon={<DeleteOutlined/>}
                        onClick={() => handleDeleteTemplate(record.id)}
                        className="text-red-500"
                        danger
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

            <Tabs defaultActiveKey="templates">
                {/* 通知模板管理 */}
                <TabPane tab="通知模板管理" key="templates">
                    {/* 搜索和筛选 */}
                    <Card className="mb-6 border border-gray-100 shadow-sm">
                        <div className="flex flex-col md:flex-row gap-4 items-start justify-between">
                            <div className="flex flex-wrap gap-4">
                                <Search
                                    placeholder="搜索模板编码、名称或描述"
                                    allowClear
                                    enterButton={<SearchOutlined/>}
                                    onSearch={handleSearch}
                                    style={{ width: 300 }}
                                />
                                <Select
                                    placeholder="按类型筛选"
                                    allowClear
                                    style={{ width: 150 }}
                                    onChange={handleTypeChange}
                                >
                                    {Object.entries(NotificationTypeMap).map(([label, value]) => (
                                        <Select.Option key={label} value={label}>
                                            {value}
                                        </Select.Option>
                                    ))}
                                </Select>
                                <Select
                                    placeholder="按状态筛选"
                                    allowClear
                                    style={{ width: 120 }}
                                    onChange={handleStatusChange}
                                >
                                    <Select.Option value={StatusEnum.ENABLED}>
                                        启用
                                    </Select.Option>
                                    <Select.Option value={StatusEnum.DISABLED}>
                                        禁用
                                    </Select.Option>
                                </Select>
                            </div>
                            <Button
                                type="primary"
                                icon={<PlusOutlined/>}
                                onClick={() => {
                                    setIsEditing(false);
                                    setCurrentTemplate(null);
                                    form.resetFields();
                                    setIsModalVisible(true);
                                }}
                            >
                                新增模板
                            </Button>
                        </div>
                    </Card>

                    {/* 模板列表 */}
                    <Card className="border border-gray-100 shadow-sm">
                        <Table
                            columns={columns}
                            dataSource={filteredTemplates}
                            rowKey="id"
                            loading={loading}
                            pagination={{
                                showSizeChanger: true,
                                pageSizeOptions: ['10', '20', '50'],
                                defaultPageSize: 10,
                                showTotal: (total) => `共 ${total} 条模板`
                            }}
                        />
                    </Card>
                </TabPane>

                {/* 手动发送通知 */}
                <TabPane tab="手动发送通知" key="send">
                    <Card className="mb-6 border border-gray-100 shadow-sm">
                        <div className="max-w-3xl mx-auto">
                            <Alert
                                title="发送通知须知"
                                description="请选择合适的模板并填写正确的变量值，确保通知能够正确发送给目标用户。"
                                type="info"
                                showIcon
                                className="mb-6"
                            />

                            <Form
                                form={sendForm}
                                layout="vertical"
                                initialValues={{
                                    userType: 'all',
                                    variables: '[]'
                                }}
                                className="space-y-4"
                            >
                                {/* 模板信息区域 */}
                                <div className="bg-gray-50 rounded-lg p-4 space-y-4">
                                    <h4 className="text-sm font-semibold text-gray-700 border-b border-gray-200 pb-2">
                                        模板信息
                                    </h4>
                                    <Form.Item
                                        name="templateCode"
                                        label={<span className="font-medium">模板编码</span>}
                                        rules={[{ required: true, message: '请输入模板编码' }]}
                                    >
                                        <Input placeholder="请输入模板编码" size="large"/>
                                    </Form.Item>

                                    <Form.Item
                                        name="variables"
                                        label={<span className="font-medium">变量（JSON格式）</span>}
                                        rules={[{ required: true, message: '请输入变量' }]}
                                    >
                                        <Input.TextArea
                                            rows={5}
                                            placeholder='例如: [{"name": "nickname", "value": "张三"}, {"name": "articleTitle", "value": "React最佳实践"}]'
                                            className="font-mono text-sm"
                                        />
                                    </Form.Item>
                                </div>

                                {/* 接收用户区域 */}
                                <div className="bg-gray-50 rounded-lg p-4 space-y-4">
                                    <h4 className="text-sm font-semibold text-gray-700 border-b border-gray-200 pb-2">
                                        接收用户
                                    </h4>
                                    <Form.Item
                                        name="userType"
                                        label={<span className="font-medium">接收用户类型</span>}
                                        rules={[{ required: true, message: '请选择接收用户类型' }]}
                                    >
                                        <Select placeholder="请选择接收用户类型" size="large">
                                            <Select.Option value="all">
                                                <div className="flex items-center gap-2">
                                                    <span className="w-2 h-2 rounded-full bg-green-500"></span>
                                                    所有用户
                                                </div>
                                            </Select.Option>
                                            <Select.Option value="specific">
                                                <div className="flex items-center gap-2">
                                                    <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                                                    指定用户
                                                </div>
                                            </Select.Option>
                                            <Select.Option value="role">
                                                <div className="flex items-center gap-2">
                                                    <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                                                    指定角色
                                                </div>
                                            </Select.Option>
                                        </Select>
                                    </Form.Item>

                                    <Form.Item
                                        noStyle
                                        shouldUpdate={(prevValues, currentValues) => prevValues.userType !== currentValues.userType}
                                    >
                                        {({ getFieldValue }) => {
                                            const userType = getFieldValue('userType');
                                            return (
                                                <>
                                                    {userType === 'specific' && (
                                                        <Form.Item
                                                            name="userIds"
                                                            label={<span className="font-medium">用户ID</span>}
                                                            rules={[{
                                                                required: true,
                                                                message: '请输入用户ID，多个ID用逗号分隔'
                                                            }]}
                                                        >
                                                            <Input
                                                                placeholder="请输入用户ID，多个ID用逗号分隔"
                                                                size="large"
                                                            />
                                                        </Form.Item>
                                                    )}
                                                    {userType === 'role' && (
                                                        <Form.Item
                                                            name="roleCode"
                                                            label={<span className="font-medium">角色编码</span>}
                                                            rules={[{ required: true, message: '请输入角色编码' }]}
                                                        >
                                                            <Input
                                                                placeholder="请输入角色编码"
                                                                size="large"
                                                            />
                                                        </Form.Item>
                                                    )}
                                                </>
                                            );
                                        }}
                                    </Form.Item>
                                </div>

                                {/* 其他选项 */}
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <h4 className="text-sm font-semibold text-gray-700 border-b border-gray-200 pb-2 mb-4">
                                        其他选项
                                    </h4>
                                    <Form.Item
                                        name="relatedId"
                                        label={<span className="font-medium">关联ID</span>}
                                    >
                                        <Input placeholder="请输入关联ID（可选）" size="large"/>
                                    </Form.Item>
                                </div>

                                <Form.Item className="pt-4">
                                    <Button
                                        type="primary"
                                        icon={<SendOutlined/>}
                                        onClick={handleSendNotification}
                                        loading={loading}
                                        size="large"
                                        block
                                        className="h-12 text-base"
                                    >
                                        发送通知
                                    </Button>
                                </Form.Item>
                            </Form>
                        </div>
                    </Card>
                </TabPane>

                {/* 模板预览 */}
                <TabPane tab="模板预览" key="preview">
                    <Card className="mb-6 border border-gray-100 shadow-sm">
                        <div className="space-y-6">
                            <Form
                                form={previewForm}
                                layout="vertical"
                                initialValues={{
                                    variables: '{}'
                                }}
                            >
                                <Form.Item
                                    name="templateCode"
                                    label="模板编码"
                                    rules={[{ required: true, message: '请输入模板编码' }]}
                                >
                                    <Input placeholder="请输入模板编码"/>
                                </Form.Item>

                                <Form.Item
                                    name="variables"
                                    label="变量（JSON格式）"
                                    rules={[{ required: true, message: '请输入变量' }]}
                                >
                                    <Input.TextArea rows={4}
                                                    placeholder='例如: {"username": "张三", "articleTitle": "React最佳实践"}'/>
                                </Form.Item>

                                <Form.Item>
                                    <Button
                                        type="primary"
                                        icon={<EyeOutlined/>}
                                        onClick={handlePreviewTemplate}
                                        loading={loading}
                                    >
                                        预览模板
                                    </Button>
                                </Form.Item>
                            </Form>
                        </div>
                    </Card>
                </TabPane>
            </Tabs>

            {/* 添加/编辑模板模态框 */}
            <Modal
                title={isEditing ? '编辑模板' : '添加模板'}
                open={isModalVisible}
                onOk={handleSaveTemplate}
                onCancel={() => setIsModalVisible(false)}
                width={800}
                okText="保存"
                cancelText="取消"
                confirmLoading={loading}
            >
                <div className="max-h-[70vh] overflow-y-auto pr-2">
                <Form
                    form={form}
                    layout="vertical"
                    initialValues={{
                        status: StatusEnum.ENABLED,
                        priority: PriorityEnum.NORMAL,
                        channel: NotificationChannel.SITE,
                        actionUrlTemplate: '',
                        variables: '[]',
                        description: ''
                    }}
                    className="space-y-2"
                    onValuesChange={(changedValues, allValues) => {
                        if ((changedValues.type || changedValues.channel) && !isEditing) {
                            const { type, channel } = allValues;
                            if (type && channel) {
                                // 生成模板编码
                                const code = `${type}_${channel}`;
                                // 生成模板名称
                                const name = `${NotificationTypeMap[type as NotificationType]}(${NotificationChannelMap[channel as NotificationChannel]})`;
                                // 生成标题模板和内容模板
                                let titleTemplate: string;
                                let contentTemplate: string;
                                let variables: Array<{ name: string; value: string }>;
                                switch (type) {
                                    case NotificationType.ARTICLE_LIKE:
                                        titleTemplate = '${nickname}点赞了您的文章';
                                        contentTemplate = '用户${nickname}点赞了您的文章《${articleTitle}》';
                                        variables = [
                                            { name: 'nickname', value: '点赞用户昵称' },
                                            { name: 'articleTitle', value: '文章标题' }
                                        ];
                                        break;
                                    case NotificationType.ARTICLE_COMMENT:
                                        titleTemplate = '${nickname}评论了您的文章';
                                        contentTemplate = '用户${nickname}评论了您的文章《${articleTitle}》：${commentContent}';
                                        variables = [
                                            { name: 'nickname', value: '评论用户昵称' },
                                            { name: 'articleTitle', value: '文章标题' },
                                            { name: 'commentContent', value: '评论内容' }
                                        ];
                                        break;
                                    case NotificationType.ARTICLE_COLLECTION:
                                        titleTemplate = '${nickname}收藏了您的文章';
                                        contentTemplate = '用户${nickname}收藏了您的文章《${articleTitle}》';
                                        variables = [
                                            { name: 'nickname', value: '收藏用户昵称' },
                                            { name: 'articleTitle', value: '文章标题' }
                                        ];
                                        break;
                                    case NotificationType.COMMENT_REPLY:
                                        titleTemplate = '${nickname}回复了您的评论';
                                        contentTemplate = '用户${nickname}回复了您的评论：${replyContent}';
                                        variables = [
                                            { name: 'nickname', value: '回复用户昵称' },
                                            { name: 'replyContent', value: '回复内容' }
                                        ];
                                        break;
                                    case NotificationType.FOLLOW:
                                        titleTemplate = '${nickname}关注了您';
                                        contentTemplate = '用户${nickname}关注了您';
                                        variables = [
                                            { name: 'nickname', value: '关注用户昵称' }
                                        ];
                                        break;
                                    case NotificationType.SYSTEM:
                                        titleTemplate = '系统通知';
                                        contentTemplate = '${content}';
                                        variables = [
                                            { name: 'content', value: '通知内容' }
                                        ];
                                        break;
                                    case NotificationType.REPORT:
                                        titleTemplate = '举报处理结果';
                                        contentTemplate = '您的举报已处理，结果：${result}';
                                        variables = [
                                            { name: 'result', value: '处理结果' }
                                        ];
                                        break;
                                    case NotificationType.FEEDBACK:
                                        titleTemplate = '反馈处理结果';
                                        contentTemplate = '您的反馈已处理，结果：${result}';
                                        variables = [
                                            { name: 'result', value: '处理结果' }
                                        ];
                                        break;
                                    default:
                                        titleTemplate = '通知';
                                        contentTemplate = '您收到了一条新通知';
                                        variables = [];
                                }
                                // 设置表单值
                                form.setFieldsValue({
                                    code,
                                    name,
                                    titleTemplate,
                                    contentTemplate,
                                    variables: JSON.stringify(variables)
                                });
                            }
                        }
                    }}
                >
                    {/* 通知设置 */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <Form.Item
                            name="type"
                            label="通知类型"
                            rules={[{ required: true, message: '请选择通知类型' }]}
                        >
                            <Select placeholder="请选择通知类型">
                                {Object.entries(NotificationTypeMap).map(([label, value]) => (
                                    <Select.Option key={label} value={label}>
                                        {value}
                                    </Select.Option>
                                ))}
                            </Select>
                        </Form.Item>

                        <Form.Item
                            name="channel"
                            label="通知渠道"
                            rules={[{ required: true, message: '请选择通知渠道' }]}
                        >
                            <Select placeholder="请选择通知渠道">
                                {Object.entries(NotificationChannelMap).map(([value, label]) => (
                                    <Select.Option key={value} value={value}>
                                        {label}
                                    </Select.Option>
                                ))}
                            </Select>
                        </Form.Item>

                        <Form.Item
                            name="priority"
                            label="优先级"
                            rules={[{ required: true, message: '请选择优先级' }]}
                        >
                            <Select placeholder="请选择优先级" defaultValue={PriorityEnum.NORMAL}>
                                {Object.entries(PriorityMap).map(([label, value]) => (
                                    <Select.Option key={value} value={label}>
                                        {value}
                                    </Select.Option>
                                ))}
                            </Select>
                        </Form.Item>

                        <Form.Item
                            name="status"
                            label="状态"
                            rules={[{ required: true, message: '请选择状态' }]}
                        >
                            <Select placeholder="请选择状态" defaultValue={StatusEnum.ENABLED}>
                                <Select.Option value={StatusEnum.ENABLED}>启用</Select.Option>
                                <Select.Option value={StatusEnum.DISABLED}>禁用</Select.Option>
                            </Select>
                        </Form.Item>
                    </div>

                    {/* 基本信息 */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                        <Form.Item
                            name="code"
                            label="模板编码"
                            rules={[
                                { required: true, message: '请输入模板编码' },
                                { min: 2, max: 32, message: '编码长度应在2-50个字符之间' }
                            ]}
                        >
                            <Input
                                placeholder="请输入模板编码"
                                disabled={isEditing}
                            />
                        </Form.Item>

                        <Form.Item
                            name="name"
                            label="模板名称"
                            rules={[
                                { required: true, message: '请输入模板名称' },
                                { min: 2, max: 100, message: '名称长度应在2-100个字符之间' }
                            ]}
                        >
                            <Input
                                placeholder="请输入模板名称"
                            />
                        </Form.Item>
                        {/* 模板标题 */}
                        <Form.Item
                            name="titleTemplate"
                            label="标题模板"
                            rules={[
                                { required: true, message: '请输入标题模板' }
                            ]}
                        >
                            <Input
                                placeholder="请输入标题模板，支持变量占位符如 ${username}"
                            />
                        </Form.Item>
                    </div>

                    <Form.Item
                        name="contentTemplate"
                        label="内容模板"
                        rules={[
                            { required: true, message: '请输入内容模板' }
                        ]}
                    >
                        <Input.TextArea
                            rows={3}
                            placeholder="请输入内容模板，支持变量占位符如 ${nickname}"
                        />
                    </Form.Item>

                    {/* 操作设置 */}
                    <Form.Item
                        name="actionUrlTemplate"
                        label="操作URL模板"
                    >
                        <Input
                            placeholder="请输入操作URL模板，支持变量占位符如 /article/${articleId}"
                        />
                        <span className="text-gray-400 text-sm">示例: /article/{'{ articleId }'}</span>
                    </Form.Item>

                    {/* 变量管理 */}
                    <Form.Item
                        name="variables"
                    >
                        <Form.Item
                            noStyle
                            shouldUpdate
                        >
                            {({ getFieldValue }) => (
                                <VariableEditor
                                    value={getFieldValue('variables') || '[]'}
                                    onChange={(value) => {
                                        form.setFieldsValue({ variables: value });
                                    }}
                                />
                            )}
                        </Form.Item>
                    </Form.Item>

                    {/* 其他设置 */}
                    <Form.Item
                        name="description"
                        label="模板描述"
                    >
                        <Input.TextArea rows={2} placeholder="请输入模板描述"/>
                    </Form.Item>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                    </div>
                </Form>
                </div>
            </Modal>

            {/* 查看模板模态框 */}
            <Modal
                title="模板详情"
                open={isViewModalVisible}
                onCancel={() => setIsViewModalVisible(false)}
                width={800}
                footer={[
                    <Button key="close" onClick={() => setIsViewModalVisible(false)}>
                        关闭
                    </Button>
                ]}
            >
                {currentTemplate && (
                    <div className="max-h-[70vh] overflow-y-auto pr-2">
                        {/* 统一容器 */}
                        <div className="bg-white rounded-t-lg rounded-b-lg border border-gray-100 overflow-hidden">
                            <Descriptions bordered column={2} size="small" className="m-0">
                                {/* 基本信息 - 两列布局 */}
                                <Descriptions.Item
                                    label="模板编码"
                                    children={(<Text copyable>{currentTemplate.code}</Text>)}>
                                </Descriptions.Item>
                                <Descriptions.Item
                                    label="模板名称"
                                    children={currentTemplate.name}>
                                </Descriptions.Item>
                                <Descriptions.Item
                                    label="通知类型"
                                    children={(
                                        <Tag color={getTypeColor(currentTemplate.type)}>
                                            {NotificationTypeMap[currentTemplate.type]}
                                        </Tag>
                                    )}>
                                </Descriptions.Item>
                                <Descriptions.Item
                                    label="通知渠道" children={(
                                    <Tag color="blue">
                                        {NotificationChannelMap[currentTemplate.channel]}
                                    </Tag>
                                )}>
                                </Descriptions.Item>
                                <Descriptions.Item label="优先级" children={(<Tag
                                    color={
                                        currentTemplate.priority === PriorityEnum.HIGH ||
                                        currentTemplate.priority === PriorityEnum.URGENT
                                            ? 'red'
                                            : 'orange'
                                    }
                                >
                                    {PriorityMap[currentTemplate.priority]}
                                </Tag>)}>
                                </Descriptions.Item>
                                <Descriptions.Item label="状态" children={(<Tag
                                    color={
                                        currentTemplate.status === StatusEnum.ENABLED
                                            ? 'success'
                                            : 'default'
                                    }
                                >
                                    {StatusEnumLabel[currentTemplate.status]}
                                </Tag>)}>
                                </Descriptions.Item>
                                <Descriptions.Item label="标题模板"
                                                   span={2}
                                                   children={(<div
                                                       className="bg-blue-50 p-3 font-mono text-sm border border-blue-100">
                                                       {currentTemplate.titleTemplate}
                                                   </div>)}>

                                </Descriptions.Item>
                                <Descriptions.Item label="内容模板" span={2} children={(<div
                                    className="bg-blue-50 p-3 font-mono text-sm whitespace-pre-wrap border border-blue-100">
                                    {currentTemplate.contentTemplate}
                                </div>)}>
                                </Descriptions.Item>
                                <Descriptions.Item label="操作URL模板" span={2}>
                                    {currentTemplate.actionUrlTemplate ? (
                                        <div className="bg-green-50 p-3 font-mono text-sm border border-green-100">
                                            {currentTemplate.actionUrlTemplate}
                                        </div>
                                    ) : (
                                        <span className="text-gray-400">-</span>
                                    )}
                                </Descriptions.Item>
                                {/* 变量说明 */}
                                <Descriptions.Item label="变量说明" span={2}>
                                    {((): React.ReactNode => {
                                        try {
                                            const parsedVariables = JSON.parse(currentTemplate.variables);
                                            let variableList: Array<{ name: string; value: string }> = [];
                                            if (Array.isArray(parsedVariables)) {
                                                variableList = parsedVariables;
                                            } else if (typeof parsedVariables === 'object') {
                                                variableList = Object.entries(parsedVariables).map(([key, value]) => ({
                                                    name: key,
                                                    value: String(value)
                                                }));
                                            }
                                            if (variableList.length === 0) {
                                                return <Tag color="blue">无变量</Tag>;
                                            }
                                            return (
                                                <div className="grid grid-cols-3 gap-2">
                                                    {variableList.map(({ name, value }) => (
                                                        <div key={name} className="flex items-center gap-2">
                                                            <span className="font-medium text-gray-700">{name}:</span>
                                                            <Tag color="cyan" className="text-center">
                                                                {value}
                                                            </Tag>
                                                        </div>
                                                    ))}
                                                </div>
                                            );
                                        } catch {
                                            return <Tag color="red">格式错误</Tag>;
                                        }
                                    })()}
                                </Descriptions.Item>
                                <Descriptions.Item label="模板描述" span={2}>
                                    <div className="bg-gray-50 p-3 rounded text-gray-700 leading-relaxed">
                                        {currentTemplate.description || '暂无描述'}
                                    </div>
                                </Descriptions.Item>
                                {/* 元信息 - 保持不变 */}
                                <Descriptions.Item
                                    label={<span className="flex items-center gap-1"><UserOutlined/>创建人</span>}>
                                    {currentTemplate.createUserId}
                                </Descriptions.Item>
                                <Descriptions.Item
                                    label={<span className="flex items-center gap-1"><UserOutlined/>更新人</span>}>
                                    {currentTemplate.updateUserId}
                                </Descriptions.Item>
                                <Descriptions.Item label={<span className="flex items-center gap-1"><CalendarOutlined/>创建时间</span>}>
                                    {new Date(currentTemplate.createTime).toLocaleString()}
                                </Descriptions.Item>
                                <Descriptions.Item label={<span className="flex items-center gap-1"><CalendarOutlined/>更新时间</span>}>
                                    {new Date(currentTemplate.updateTime).toLocaleString()}
                                </Descriptions.Item>
                            </Descriptions>
                        </div>
                    </div>
                )}
            </Modal>

            {/* 预览结果模态框 */}
            <Modal
                title="模板预览结果"
                open={isPreviewModalVisible}
                onCancel={() => setIsPreviewModalVisible(false)}
                width={600}
                footer={[
                    <Button key="close" onClick={() => setIsPreviewModalVisible(false)}>
                        关闭
                    </Button>
                ]}
            >
                {previewResult && (
                    <div className="space-y-6">
                        <div>
                            <h3 className="font-medium mb-2">渲染后标题</h3>
                            <div className="bg-gray-50 p-4 rounded-md">
                                {previewResult.title}
                            </div>
                        </div>
                        <div>
                            <h3 className="font-medium mb-2">渲染后内容</h3>
                            <div className="bg-gray-50 p-4 rounded-md">
                                {previewResult.content}
                            </div>
                        </div>
                        <div>
                            <h3 className="font-medium mb-2">通知类型</h3>
                            <div className="bg-gray-50 p-4 rounded-md">
                                {NotificationTypeMap[previewResult.type]}
                            </div>
                        </div>
                        <div>
                            <h3 className="font-medium mb-2">操作URL</h3>
                            <div className="bg-gray-50 p-4 rounded-md">
                                {previewResult.actionUrl || '-'}
                            </div>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};
export default AdminNotifications;
