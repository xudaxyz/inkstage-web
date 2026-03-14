import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Input,
  Button,
  Space,
  Tag,
  Modal,
  Form,
  Switch,
  message,
  Typography,
  Spin,
  type PaginationProps
} from 'antd';
import {
  SearchOutlined,
  DeleteOutlined,
  EyeOutlined,
  EditOutlined,
  PlusOutlined,
  TagOutlined,
  CalendarOutlined
} from '@ant-design/icons';
import tagService, { type AdminTag } from '../../services/tagService';
import { StatusEnum, StatusEnumLabel } from '../../types/enums';
import { formatDateTime, formatDateTimeShort } from '../../utils/date';

const { Search } = Input;
const { Text } = Typography;

const AdminTags: React.FC = () => {
  const [tags, setTags] = useState<AdminTag[]>([]);
  const [filteredTags, setFilteredTags] = useState<AdminTag[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isViewModalVisible, setIsViewModalVisible] = useState(false);
  const [currentTag, setCurrentTag] = useState<AdminTag | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  });
  const [searchKeyword, setSearchKeyword] = useState('');

  // 加载标签数据
  const loadTags = async (pageNum: number = 1, pageSize: number = 10, keyword: string = '') => {
    setLoading(true);
    try {
      const response = await tagService.adminGetTagsByPage(keyword, pageNum, pageSize);
      if (response.code === 200 && response.data) {
        const formattedTags = response.data.record.map((tag: AdminTag) => ({
          ...tag,
          key: tag.id.toString()
        }));
        setTags(formattedTags);
        setFilteredTags(formattedTags);
        setPagination({
          current: response.data.pageNum,
          pageSize: response.data.pageSize,
          total: response.data.total
        });
      } else {
        message.error('获取标签列表失败');
      }
    } catch (error) {
      console.error('加载标签失败:', error);
      message.error('加载标签失败');
    } finally {
      setLoading(false);
    }
  };

  // 组件挂载时加载数据
  useEffect(() => {
    loadTags();
  }, []);

  // 处理分页变化
  const handleTableChange = (pagination: PaginationProps) => {
    const current = pagination.current || 1;
    const pageSize = pagination.pageSize || 10;
    loadTags(current, pageSize, searchKeyword);
  };

  // 搜索和筛选标签
  const handleSearch = (value: string) => {
    setSearchKeyword(value);
    loadTags(1, pagination.pageSize, value);
  };

  // 打开编辑标签模态框
  const handleEditTag = (tag: AdminTag) => {
    setIsEditing(true);
    setCurrentTag(tag);
    form.setFieldsValue({
      name: tag.name,
      slug: tag.slug,
      description: tag.description,
      status: tag.status === StatusEnum.ENABLED
    });
    setIsModalVisible(true);
  };

  // 打开查看标签模态框
  const handleViewTag = (tag: AdminTag) => {
    setCurrentTag(tag);
    setIsViewModalVisible(true);
  };

  // 删除标签
  const handleDeleteTag = async (id: number) => {
    try {
      await tagService.adminDeleteTag(id);
      message.success('标签删除成功');
      loadTags(pagination.current, pagination.pageSize);
    } catch (error) {
      console.error('删除标签失败:', error);
      message.error('删除标签失败');
    }
  };

  // 切换标签状态
  const handleToggleStatus = async (id: number, status: StatusEnum) => {
    try {
      // 先更新本地状态，提供即时反馈
      const updatedTags = tags.map(tag =>
        tag.id === id ? { ...tag, status: status === StatusEnum.ENABLED ? StatusEnum.DISABLED : StatusEnum.ENABLED } : tag
      );
      setTags(updatedTags);
      setFilteredTags(updatedTags);

      // 然后调用 API 更新后端数据
      await tagService.adminUpdateTagStatus(id, status === StatusEnum.ENABLED ? StatusEnum.DISABLED : StatusEnum.ENABLED);
      message.success(`标签已${status === StatusEnum.ENABLED ? '禁用' : '启用'}`);

    } catch (error) {
      console.error('更新标签状态失败:', error);
      message.error('更新标签状态失败');
      // 失败时重新加载数据
      loadTags(pagination.current, pagination.pageSize);
    }
  };

  // 保存标签
  const handleSaveTag = async () => {
    form.validateFields().then(async (values) => {
      try {
        if (isEditing && currentTag) {
          // 编辑现有标签
          await tagService.adminUpdateTag(currentTag.id, {
            name: values.name,
            slug: values.slug,
            description: values.description,
            status: values.status ? StatusEnum.ENABLED : StatusEnum.DISABLED
          });
          message.success('标签更新成功');
        } else {
          // 添加新标签
          await tagService.adminAddTag({
            name: values.name,
            slug: values.slug,
            description: values.description,
            status: values.status ? StatusEnum.ENABLED : StatusEnum.DISABLED
          });
          message.success('标签添加成功');
        }
        setIsModalVisible(false);
        loadTags(pagination.current, pagination.pageSize);
      } catch (error) {
        console.error('保存标签失败:', error);
        message.error('保存标签失败');
      }
    }).catch(error => {
      console.error('验证失败:', error);
    });
  };

  // 表格列配置
  const columns = [
    {
      title: '序号',
      key: 'index',
      width: 60,
      render: (_: unknown, __: unknown, index: number) => (pagination.current - 1) * pagination.pageSize + index + 1
    },
    {
      title: '标签名称',
      dataIndex: 'name',
      key: 'name',
      width: 150,
      render: (text: string) => <Text className="font-medium">{text}</Text>
    },
    {
      title: '别名',
      dataIndex: 'slug',
      key: 'slug',
      width: 150
    },
    {
      title: '标签描述',
      dataIndex: 'description',
      key: 'description',
      width: 200
    },
    {
      title: '文章数量',
      dataIndex: 'articleCount',
      key: 'articleCount',
      width: 100
    },
    {
      title: '使用次数',
      dataIndex: 'usageCount',
      key: 'usageCount',
      width: 100
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: StatusEnum, record: AdminTag) => (
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
      width: 180,
      render: (createTime: string) => formatDateTimeShort(createTime)
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      render: (_: unknown, record: AdminTag) => (
        <Space size="middle">
          <Button
            variant={'text'}
            color={'green'}
            icon={<EyeOutlined/>}
            onClick={() => handleViewTag(record)}
            className="text-blue-500"
          >
                        查看
          </Button>
          <Button
            variant={'text'}
            color={'orange'}
            icon={<EditOutlined/>}
            onClick={() => handleEditTag(record)}
            className="text-green-500"
          >
                        编辑
          </Button>
          <Button
            variant={'text'}
            color={'danger'}
            icon={<DeleteOutlined/>}
            onClick={() => handleDeleteTag(record.id)}
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
      <div>
        <h2 className="text-2xl font-semibold text-gray-800">标签管理</h2>
      </div>

      {/* 搜索和筛选 */}
      <Card variant="borderless" className="border-b border-gray-100">
        <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
          <Search
            placeholder="搜索标签名称或别名"
            allowClear
            enterButton={<SearchOutlined/>}
            onSearch={handleSearch}
            style={{ width: 300 }}
          />
          <Button
            type="primary"
            icon={<PlusOutlined/>}
            onClick={() => {
              setIsEditing(false);
              setCurrentTag(null);
              form.resetFields();
              setIsModalVisible(true);
            }}
          >
                        新增标签
          </Button>
        </div>
      </Card>

      {/* 标签列表 */}
      <Card variant="borderless">
        {loading ? (
          <div className="flex justify-center py-10">
            <Spin size="large"/>
          </div>
        ) : (
          <Table
            columns={columns}
            dataSource={filteredTags}
            rowKey="id"
            onChange={handleTableChange}
            pagination={{
              current: pagination.current,
              pageSize: pagination.pageSize,
              total: pagination.total,
              showSizeChanger: true,
              placement: ['bottomCenter'],
              pageSizeOptions: ['10', '20', '50'],
              showTotal: (total) => `共 ${total} 个标签`
            }}
          />
        )}
      </Card>

      {/* 添加/编辑标签模态框 */}
      <Modal
        title={isEditing ? '编辑标签' : '添加标签'}
        open={isModalVisible}
        onOk={handleSaveTag}
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
            label="标签名称"
            rules={[
              { required: true, message: '请输入标签名称' },
              { min: 1, max: 30, message: '标签名称长度应在1-30个字符之间' }
            ]}
          >
            <Input placeholder="请输入标签名称"/>
          </Form.Item>

          <Form.Item
            name="slug"
            label="别名"
            rules={[
              { required: true, message: '请输入别名' },
              { min: 1, max: 50, message: '别名长度应在1-50个字符之间' }
            ]}
          >
            <Input placeholder="请输入别名，用于URL"/>
          </Form.Item>

          <Form.Item
            name="description"
            label="描述"
            rules={[
              { max: 200, message: '描述长度不能超过200个字符' }
            ]}
          >
            <Input.TextArea rows={3} placeholder="请输入标签描述"/>
          </Form.Item>

          <Form.Item
            name="status"
            label="状态"
            valuePropName="checked"
          >
            <Switch/>
          </Form.Item>
        </Form>
      </Modal>

      {/* 查看标签模态框 */}
      <Modal
        title="标签详情"
        open={isViewModalVisible}
        onCancel={() => setIsViewModalVisible(false)}
        width={500}
        footer={[
          <Button key="close" onClick={() => setIsViewModalVisible(false)}>
                        关闭
          </Button>
        ]}
      >
        {currentTag && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <TagOutlined className="text-gray-500"/>
              <span className="font-medium">标签名称:</span>
              <span>{currentTag.name}</span>
            </div>
            <div className="flex items-center gap-2">
              <TagOutlined className="text-gray-500"/>
              <span className="font-medium">别名:</span>
              <span>{currentTag.slug}</span>
            </div>
            <div className="flex items-start gap-2">
              <TagOutlined className="text-gray-500 mt-1"/>
              <span className="font-medium">描述:</span>
              <span>{currentTag.description}</span>
            </div>
            <div className="flex items-center gap-2">
              <TagOutlined className="text-gray-500"/>
              <span className="font-medium">文章数量:</span>
              <span>{currentTag.articleCount || 0}</span>
            </div>
            <div className="flex items-center gap-2">
              <TagOutlined className="text-gray-500"/>
              <span className="font-medium">使用次数:</span>
              <span>{currentTag.usageCount || 0}</span>
            </div>
            <div className="flex items-center gap-2">
              <TagOutlined className="text-gray-500"/>
              <span className="font-medium">状态:</span>
              <Tag color={currentTag.status === StatusEnum.ENABLED ? 'green' : 'orange'}>
                {StatusEnumLabel[currentTag.status]}
              </Tag>
            </div>
            <div className="flex items-center gap-2">
              <CalendarOutlined className="text-gray-500"/>
              <span className="font-medium">创建时间:</span>
              <span>{formatDateTime(currentTag.createTime || '')}</span>
            </div>
            <div className="flex items-center gap-2">
              <CalendarOutlined className="text-gray-500"/>
              <span className="font-medium">更新时间:</span>
              <span>{formatDateTime(currentTag.updateTime || '')}</span>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AdminTags;
