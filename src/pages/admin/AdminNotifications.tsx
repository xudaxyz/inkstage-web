import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Button,
  Card,
  Descriptions,
  Form,
  Input,
  message,
  Modal,
  Select,
  Space,
  Switch,
  Table,
  Tabs,
  Tag,
  Typography
} from 'antd';
import AdminNotificationTemplateEditor from '../../components/admin/AdminNotificationTemplateEditor';
import type { TablePaginationConfig } from 'antd/es/table';
import {
  CalendarOutlined,
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
  PlusOutlined,
  SearchOutlined,
  SendOutlined,
  UserOutlined
} from '@ant-design/icons';
import notificationTemplateService from '../../services/notificationTemplateService';
import type {
  AdminNotificationTemplate,
  ManualNotification,
  NotificationTemplate,
  TemplatePreview
} from '../../types/notificationTemplate';
import {
  NotificationChannel,
  NotificationChannelMap,
  NotificationType,
  NotificationTypeMap,
  PriorityEnum,
  PriorityMap,
  StatusEnum,
  StatusEnumLabel
} from '../../types/enums';
import TemplateVariableSelector from '../../components/admin/TemplateVariableSelector';
// 自定义防抖 hook
const useDebounceValue = <T,>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return (): void => {
      clearTimeout(timer);
    };
  }, [value, delay]);
  return debouncedValue;
};
const { Search } = Input;
const { Text } = Typography;
const { TabPane } = Tabs;
// 分页配置常量
const DEFAULT_PAGE_SIZE = 10;
const PAGE_SIZE_OPTIONS = ['5', '10', '20', '50'];
const AdminNotifications: React.FC = () => {
  // 状态管理
  const [templates, setTemplates] = useState<AdminNotificationTemplate[]>([]);
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
  // 分页状态
  const [pagination, setPagination] = useState<TablePaginationConfig>({
    current: 1,
    pageSize: DEFAULT_PAGE_SIZE,
    total: 0,
    showSizeChanger: true,
    pageSizeOptions: PAGE_SIZE_OPTIONS,
    showTotal: (total: number) => `共 ${total} 条模板`
  });

  // 表单实例
  const [sendForm] = Form.useForm();
  const [previewForm] = Form.useForm();

  // 防抖搜索文本
  const debouncedSearchText = useDebounceValue(searchText, 300);

  // 获取通知模板列表 - 使用后端分页和筛选
  const fetchTemplates = useCallback(
    async (
      pageNum: number = 1,
      pageSize: number = DEFAULT_PAGE_SIZE,
      notificationType?: NotificationType,
      status?: StatusEnum,
      keyword?: string
    ) => {
      try {
        setLoading(true);
        const response = await notificationTemplateService.getTemplatePage(
          pageNum,
          pageSize,
          notificationType,
          status,
          keyword
        );
        if (response.code === 200) {
          setTemplates(response.data?.record || []);
          setPagination((prev) => ({
            ...prev,
            current: pageNum,
            pageSize: pageSize,
            total: response.data?.total || 0
          }));
        } else {
          message.error(response.message || '获取模板列表失败');
        }
      } catch (error) {
        console.error('获取模板列表失败:', error);
        message.error('获取模板列表失败');
      } finally {
        setLoading(false);
      }
    },
    []
  );
  // 初始化加载
  useEffect(() => {
    void fetchTemplates(1, DEFAULT_PAGE_SIZE);
  }, [fetchTemplates]);
  // 监听防抖后的搜索文本和筛选条件变化，自动触发后端查询
  useEffect(() => {
    void fetchTemplates(1, pagination.pageSize, selectedType, selectedStatus, debouncedSearchText);
  }, [debouncedSearchText, selectedType, selectedStatus, pagination.pageSize, fetchTemplates]);
  // 搜索处理 - 只更新搜索文本，防抖后会自动触发查询
  const handleSearch = (value: string): void => {
    setSearchText(value);
    // 重置到第一页
    setPagination((prev) => ({ ...prev, current: 1 }));
  };
  // 类型筛选变化
  const handleTypeChange = (value: NotificationType | undefined): void => {
    setSelectedType(value);
    // 重置到第一页
    setPagination((prev) => ({ ...prev, current: 1 }));
  };
  // 状态筛选变化
  const handleStatusChange = (value: StatusEnum | undefined): void => {
    setSelectedStatus(value);
    // 重置到第一页
    setPagination((prev) => ({ ...prev, current: 1 }));
  };
  // 表格分页变化处理
  const handleTableChange = (newPagination: TablePaginationConfig): void => {
    const { current, pageSize } = newPagination;
    setPagination((prev) => ({ ...prev, current: current || 1, pageSize: pageSize || DEFAULT_PAGE_SIZE }));
    void fetchTemplates(current || 1, pageSize || DEFAULT_PAGE_SIZE, selectedType, selectedStatus, debouncedSearchText);
  };
  // 打开编辑模板模态框
  const handleEditTemplate = (template: AdminNotificationTemplate): void => {
    setIsEditing(true);
    setCurrentTemplate(template);
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
        // 使用当前分页和筛选状态刷新列表
        await fetchTemplates(
          pagination.current || 1,
          pagination.pageSize || DEFAULT_PAGE_SIZE,
          selectedType,
          selectedStatus,
          debouncedSearchText
        );
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
      const response =
        newStatus === StatusEnum.ENABLED
          ? await notificationTemplateService.enableTemplate(id)
          : await notificationTemplateService.disableTemplate(id);
      if (response.code === 200) {
        message.success(`模板已${newStatus === StatusEnum.ENABLED ? '启用' : '禁用'}`);
        // 使用当前分页和筛选状态刷新列表
        await fetchTemplates(
          pagination.current || 1,
          pagination.pageSize || DEFAULT_PAGE_SIZE,
          selectedType,
          selectedStatus,
          debouncedSearchText
        );
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
  const handleSaveTemplate = async (template: NotificationTemplate): Promise<void> => {
    try {
      setLoading(true);
      if (isEditing && currentTemplate) {
        // 编辑现有模板
        const updateDTO: NotificationTemplate = {
          ...template
        };
        const response = await notificationTemplateService.updateTemplate(currentTemplate.id, updateDTO);
        if (response.code === 200) {
          message.success('模板更新成功');
          // 使用当前分页和筛选状态刷新列表
          await fetchTemplates(
            pagination.current || 1,
            pagination.pageSize || DEFAULT_PAGE_SIZE,
            selectedType,
            selectedStatus,
            debouncedSearchText
          );
        } else {
          message.error(response.message || '更新模板失败');
        }
      } else {
        // 添加新模板
        const createDTO: NotificationTemplate = template;
        // 检查编码是否存在
        const checkResponse = await notificationTemplateService.checkCodeExists(createDTO.code);
        if (checkResponse.code === 200 && checkResponse.data) {
          message.error('模板编码已存在');
          return;
        }
        const response = await notificationTemplateService.createTemplate(createDTO);
        if (response.code === 200) {
          message.success('模板创建成功');
          // 使用当前分页和筛选状态刷新列表
          await fetchTemplates(
            pagination.current || 1,
            pagination.pageSize || DEFAULT_PAGE_SIZE,
            selectedType,
            selectedStatus,
            debouncedSearchText
          );
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
  const handlePreviewTemplate = async (isSendForm: boolean = false): Promise<void> => {
    try {
      setLoading(true);
      const formToUse = isSendForm ? sendForm : previewForm;
      await formToUse.validateFields();
      const values = formToUse.getFieldsValue();
      const response = await notificationTemplateService.previewTemplate(values.templateCode, values.variables || {});
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
      const sendDTO: ManualNotification = {
        templateCode: values.templateCode,
        variables: values.variables || {},
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
  const getTypeColor = (notificationType: NotificationType): string => {
    switch (notificationType) {
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
      render: (text: string): React.ReactNode => (
        <Text ellipsis={{ tooltip: text }} className="font-medium">
          {text}
        </Text>
      )
    },
    {
      title: '模板名称',
      dataIndex: 'templateName',
      key: 'templateName',
      width: 180,
      render: (text: string): React.ReactNode => (
        <Text ellipsis={{ tooltip: text }} className="font-medium">
          {text}
        </Text>
      )
    },
    {
      title: '类型',
      dataIndex: 'notificationType',
      key: 'notificationType',
      width: 120,
      render: (notificationType: NotificationType): React.ReactNode => (
        <Tag color={getTypeColor(notificationType)}>{NotificationTypeMap[notificationType]}</Tag>
      )
    },
    {
      title: '渠道',
      dataIndex: 'notificationChannel',
      key: 'notificationChannel',
      width: 100,
      render: (notificationChannel: NotificationChannel): React.ReactNode => (
        <Tag color="blue">{NotificationChannelMap[notificationChannel]}</Tag>
      )
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
        <Switch checked={status === StatusEnum.ENABLED} onChange={() => handleToggleStatus(record.id, status)} />
      )
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      key: 'createTime',
      width: 180,
      render: (time: string): React.ReactNode => {
        try {
          return new Date(time).toLocaleString();
        } catch {
          return time;
        }
      }
    },
    {
      title: '更新作者',
      dataIndex: 'updateUsername',
      key: 'updateUsername',
      width: 140
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      render: (_: unknown, record: AdminNotificationTemplate): React.ReactNode => (
        <Space size="middle">
          <Button
            type="text"
            icon={<EyeOutlined />}
            onClick={() => handleViewTemplate(record)}
            className="text-blue-500"
          >
            查看
          </Button>
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => handleEditTemplate(record)}
            className="text-green-500"
          >
            编辑
          </Button>
          <Button
            type="text"
            icon={<DeleteOutlined />}
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
                  enterButton={<SearchOutlined />}
                  onSearch={handleSearch}
                  style={{ width: 300 }}
                />
                <Select placeholder="按类型筛选" allowClear style={{ width: 150 }} onChange={handleTypeChange}>
                  {Object.entries(NotificationTypeMap).map(([label, value]) => (
                    <Select.Option key={label} value={label}>
                      {value}
                    </Select.Option>
                  ))}
                </Select>
                <Select placeholder="按状态筛选" allowClear style={{ width: 120 }} onChange={handleStatusChange}>
                  <Select.Option value={StatusEnum.ENABLED}>启用</Select.Option>
                  <Select.Option value={StatusEnum.DISABLED}>禁用</Select.Option>
                </Select>
              </div>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => {
                  setIsEditing(false);
                  setCurrentTemplate(null);
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
              dataSource={templates}
              rowKey="id"
              loading={loading}
              pagination={pagination}
              onChange={handleTableChange}
            />
          </Card>
        </TabPane>

        {/* 手动发送通知 */}
        <TabPane tab="手动发送通知" key="send">
          <Card className="mb-4 border border-gray-100 shadow-sm">
            <div className="p-4">
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
                  userType: 'all'
                }}
              >
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                  {/* 模板信息区域 */}
                  <div className="bg-gray-50 rounded-lg p-5 space-y-4 shadow-sm border border-gray-100">
                    <h4 className="text-sm font-semibold text-gray-700 border-b border-gray-200 pb-3">模板信息</h4>
                    <Form.Item
                      name="templateCode"
                      label={<span className="font-medium">模板编码</span>}
                      rules={[{ required: true, message: '请输入模板编码' }]}
                    >
                      <Input placeholder="请输入模板编码" size="large" />
                    </Form.Item>
                  </div>

                  {/* 接收用户区域 */}
                  <div className="bg-gray-50 rounded-lg p-5 space-y-4 shadow-sm border border-gray-100">
                    <h4 className="text-sm font-semibold text-gray-700 border-b border-gray-200 pb-3">接收用户</h4>
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
                                rules={[
                                  {
                                    required: true,
                                    message: '请输入用户ID，多个ID用逗号分隔'
                                  }
                                ]}
                              >
                                <Input placeholder="请输入用户ID，多个ID用逗号分隔" size="large" />
                              </Form.Item>
                            )}
                            {userType === 'role' && (
                              <Form.Item
                                name="roleCode"
                                label={<span className="font-medium">角色编码</span>}
                                rules={[{ required: true, message: '请输入角色编码' }]}
                              >
                                <Input placeholder="请输入角色编码" size="large" />
                              </Form.Item>
                            )}
                          </>
                        );
                      }}
                    </Form.Item>

                    <Form.Item name="relatedId" label={<span className="font-medium">关联ID</span>}>
                      <Input placeholder="请输入关联ID（可选）" size="large" />
                    </Form.Item>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <Button
                    variant="filled"
                    color="cyan"
                    icon={<EyeOutlined />}
                    onClick={() => handlePreviewTemplate(true)}
                    loading={loading}
                    size="large"
                    className="h-12 text-base px-8"
                  >
                    预览模板
                  </Button>
                  <Button
                    type="primary"
                    icon={<SendOutlined />}
                    onClick={handleSendNotification}
                    loading={loading}
                    size="large"
                    className="h-12 text-base px-8"
                  >
                    发送通知
                  </Button>
                </div>
              </Form>
            </div>
          </Card>
        </TabPane>

        {/* 模板预览 */}
        <TabPane tab="模板预览" key="preview">
          <Card className="mb-6 border border-gray-100 shadow-sm">
            <div className="space-y-6">
              <Form form={previewForm} layout="vertical">
                <Form.Item name="templateCode" label="模板编码" rules={[{ required: true, message: '请输入模板编码' }]}>
                  <Input placeholder="请输入模板编码" />
                </Form.Item>

                <Form.Item name="variables" label="模板变量">
                  <TemplateVariableSelector placeholder="点击可用变量插入到模板" multiline rows={4} />
                </Form.Item>

                <Form.Item>
                  <Button
                    type="primary"
                    icon={<EyeOutlined />}
                    onClick={() => handlePreviewTemplate(true)}
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

      {/* 添加/编辑模板编辑器 */}
      <AdminNotificationTemplateEditor
        visible={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        onSave={handleSaveTemplate}
        isEditing={isEditing}
        initialValues={currentTemplate as AdminNotificationTemplate}
        loading={loading}
      />

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
                  children={<Text copyable>{currentTemplate.code}</Text>}
                ></Descriptions.Item>
                <Descriptions.Item label="模板名称" children={currentTemplate.templateName}></Descriptions.Item>
                <Descriptions.Item
                  label="通知类型"
                  children={
                    <Tag color={getTypeColor(currentTemplate.notificationType)}>
                      {NotificationTypeMap[currentTemplate.notificationType]}
                    </Tag>
                  }
                ></Descriptions.Item>
                <Descriptions.Item
                  label="通知渠道"
                  children={<Tag color="blue">{NotificationChannelMap[currentTemplate.notificationChannel]}</Tag>}
                ></Descriptions.Item>
                <Descriptions.Item
                  label="优先级"
                  children={
                    <Tag
                      color={
                        currentTemplate.priority === PriorityEnum.HIGH ||
                        currentTemplate.priority === PriorityEnum.URGENT
                          ? 'red'
                          : 'orange'
                      }
                    >
                      {PriorityMap[currentTemplate.priority]}
                    </Tag>
                  }
                ></Descriptions.Item>
                <Descriptions.Item
                  label="状态"
                  children={
                    <Tag color={currentTemplate.status === StatusEnum.ENABLED ? 'success' : 'default'}>
                      {StatusEnumLabel[currentTemplate.status]}
                    </Tag>
                  }
                ></Descriptions.Item>
                <Descriptions.Item
                  label="标题模板"
                  span={2}
                  children={
                    <div className="bg-blue-50 p-3 font-mono text-sm border border-blue-100">
                      {currentTemplate.titleTemplate}
                    </div>
                  }
                ></Descriptions.Item>
                <Descriptions.Item
                  label="内容模板"
                  span={2}
                  children={
                    <div className="bg-blue-50 p-3 font-mono text-sm whitespace-pre-wrap border border-blue-100">
                      {currentTemplate.contentTemplate}
                    </div>
                  }
                ></Descriptions.Item>
                <Descriptions.Item label="操作URL模板" span={2}>
                  {currentTemplate.actionUrlTemplate ? (
                    <div className="bg-green-50 p-3 font-mono text-sm border border-green-100">
                      {currentTemplate.actionUrlTemplate}
                    </div>
                  ) : (
                    <span className="text-gray-400">-</span>
                  )}
                </Descriptions.Item>

                <Descriptions.Item label="模板描述" span={2}>
                  <div className="bg-gray-50 p-3 rounded text-gray-700 leading-relaxed">
                    {currentTemplate.description || '暂无描述'}
                  </div>
                </Descriptions.Item>
                {/* 元信息 - 保持不变 */}
                <Descriptions.Item
                  label={
                    <span className="flex items-center gap-1">
                      <UserOutlined />
                      创建人
                    </span>
                  }
                >
                  {currentTemplate.createUsername}
                </Descriptions.Item>
                <Descriptions.Item
                  label={
                    <span className="flex items-center gap-1">
                      <UserOutlined />
                      更新人
                    </span>
                  }
                >
                  {currentTemplate.updateUsername}
                </Descriptions.Item>
                <Descriptions.Item
                  label={
                    <span className="flex items-center gap-1">
                      <CalendarOutlined />
                      创建时间
                    </span>
                  }
                >
                  {new Date(currentTemplate.createTime).toLocaleString()}
                </Descriptions.Item>
                <Descriptions.Item
                  label={
                    <span className="flex items-center gap-1">
                      <CalendarOutlined />
                      更新时间
                    </span>
                  }
                >
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
              <div className="bg-gray-50 p-4 rounded-md">{previewResult.title}</div>
            </div>
            <div>
              <h3 className="font-medium mb-2">渲染后内容</h3>
              <div className="bg-gray-50 p-4 rounded-md">{previewResult.content}</div>
            </div>
            <div>
              <h3 className="font-medium mb-2">通知类型</h3>
              <div className="bg-gray-50 p-4 rounded-md">{NotificationTypeMap[previewResult.notificationType]}</div>
            </div>
            <div>
              <h3 className="font-medium mb-2">操作URL</h3>
              <div className="bg-gray-50 p-4 rounded-md">{previewResult.actionUrl || '-'}</div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
export default AdminNotifications;
