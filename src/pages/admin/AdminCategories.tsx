import React, { useState, useEffect } from 'react';
import { Card, Table, Input, Button, Space, Tag, Modal, Form, Switch, message, Typography, Spin, type PaginationProps } from 'antd';
import {
  SearchOutlined,
  DeleteOutlined,
  EyeOutlined,
  EditOutlined,
  PlusOutlined,
  AppstoreOutlined,
  CalendarOutlined
} from '@ant-design/icons';
import categoryService from '../../services/categoryService';
import  { type AdminCategory } from '../../types/category';
import { StatusEnum, StatusEnumLabel } from '../../types/enums';
import { formatDateTime, formatDateTimeShort } from '../../utils';

const { Search } = Input;
const { Text } = Typography;

const AdminCategories: React.FC = () => {
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [filteredCategories, setFilteredCategories] = useState<AdminCategory[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isViewModalVisible, setIsViewModalVisible] = useState(false);
  const [currentCategory, setCurrentCategory] = useState<AdminCategory | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  });
  const [searchKeyword, setSearchKeyword] = useState('');

  // 加载分类数据
  const loadCategories = async (pageNum: number = 1, pageSize: number = 10, keyword: string = '') : Promise<void> => {
    setLoading(true);
    try {
      const response = await categoryService.adminGetCategoriesByPage(keyword, pageNum, pageSize);
      if (response.code === 200 && response.data) {
        const formattedCategories = response.data.record.map((category: AdminCategory) => ({
          ...category,
          key: category.id.toString()
        }));
        setCategories(formattedCategories);
        setFilteredCategories(formattedCategories);
        setPagination({
          current: response.data.pageNum,
          pageSize: response.data.pageSize,
          total: response.data.total
        });
      } else {
        message.error('获取分类列表失败');
      }
    } catch (error) {
      console.error('加载分类失败:', error);
      message.error('加载分类失败');
    } finally {
      setLoading(false);
    }
  };

  // 组件挂载时加载数据
  useEffect((): void => {
    loadCategories();
  }, []);

  // 处理分页变化
  const handleTableChange = async (pagination: PaginationProps): Promise<void> => {
    const current = pagination.current || 1;
    const pageSize = pagination.pageSize || 10;
    await loadCategories(current, pageSize, searchKeyword);
  };

  // 搜索和筛选分类
  const handleSearch = async (value: string): Promise<void> => {
    setSearchKeyword(value);
    await loadCategories(1, pagination.pageSize, value);
  };

  // 打开编辑分类模态框
  const handleEditCategory = (category: AdminCategory): void => {
    setIsEditing(true);
    setCurrentCategory(category);
    form.setFieldsValue({
      name: category.name,
      slug: category.slug,
      description: category.description,
      status: category.status === StatusEnum.ENABLED
    });
    setIsModalVisible(true);
  };

  // 打开查看分类模态框
  const handleViewCategory = (category: AdminCategory): void => {
    setCurrentCategory(category);
    setIsViewModalVisible(true);
  };

  // 删除分类
  const handleDeleteCategory = async (id: number): Promise<void> => {
    try {
      await categoryService.adminDeleteCategory(id);
      message.success('分类删除成功');
      await loadCategories(pagination.current, pagination.pageSize);
    } catch (error) {
      console.error('删除分类失败:', error);
      message.error('删除分类失败');
    }
  };

  // 切换分类状态
  const handleToggleStatus = async (id: number, status: StatusEnum): Promise<void> => {
    try {
      // 先更新本地状态，提供即时反馈
      const updatedCategories = categories.map(category =>
        category.id === id ? { ...category, status: status === StatusEnum.ENABLED ? StatusEnum.DISABLED : StatusEnum.ENABLED } : category
      );
      setCategories(updatedCategories);
      setFilteredCategories(updatedCategories);

      // 然后调用 API 更新后端数据
      await categoryService.adminUpdateCategoryStatus(id, status === StatusEnum.ENABLED ? StatusEnum.DISABLED : StatusEnum.ENABLED);
      message.success(`分类已${status === StatusEnum.ENABLED ? '禁用' : '启用'}`);

    } catch (error) {
      console.error('更新分类状态失败:', error);
      message.error('更新分类状态失败');
      // 失败时重新加载数据
      await loadCategories(pagination.current, pagination.pageSize);
    }
  };

  // 保存分类
  const handleSaveCategory = async (): Promise<void> => {
    form.validateFields().then(async (values) => {
      try {
        if (isEditing && currentCategory) {
          // 编辑现有分类
          await categoryService.adminUpdateCategory(currentCategory.id, {
            name: values.name,
            slug: values.slug,
            description: values.description,
            status: values.status ? StatusEnum.ENABLED : StatusEnum.DISABLED
          });
          message.success('分类更新成功');
        } else {
          // 添加新分类
          await categoryService.adminAddCategory({
            name: values.name,
            slug: values.slug,
            description: values.description,
            status: values.status ? StatusEnum.ENABLED : StatusEnum.DISABLED
          });
          message.success('分类添加成功');
        }
        setIsModalVisible(false);
        await loadCategories(pagination.current, pagination.pageSize);
      } catch (error) {
        console.error('保存分类失败:', error);
        message.error('保存分类失败');
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
      render: (_: unknown, __: unknown, index: number): number => (pagination.current - 1) * pagination.pageSize + index + 1
    },
    {
      title: '分类名称',
      dataIndex: 'name',
      key: 'name',
      width: 150,
      render: (text: string): React.ReactNode => <Text className="font-medium">{text}</Text>
    },
    {
      title: '别名',
      dataIndex: 'slug',
      key: 'slug',
      width: 150
    },
    {
      title: '分类描述',
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
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: StatusEnum, record: AdminCategory): React.ReactNode => (
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
      render: (createTime: string): string => formatDateTimeShort(createTime)
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      render: (_: unknown, record: AdminCategory): React.ReactNode => (
        <Space size="middle">
          <Button
            variant={'text'}
            color={'green'}
            icon={<EyeOutlined/>}
            onClick={() => handleViewCategory(record)}
            className="text-blue-500"
          >
                        查看
          </Button>
          <Button
            variant={'text'}
            color={'orange'}
            icon={<EditOutlined/>}
            onClick={() => handleEditCategory(record)}
            className="text-green-500"
          >
                        编辑
          </Button>
          <Button
            variant={'text'}
            color={'danger'}
            icon={<DeleteOutlined/>}
            onClick={() => handleDeleteCategory(record.id)}
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
        <h2 className="text-2xl font-semibold text-gray-800">分类管理</h2>
      </div>

      {/* 搜索和筛选 */}
      <Card variant="borderless" className="border-b border-gray-100">
        <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
          <Search
            placeholder="搜索分类名称或别名"
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
              setCurrentCategory(null);
              form.resetFields();
              setIsModalVisible(true);
            }}
          >
                        新增分类
          </Button>
        </div>
      </Card>

      {/* 分类列表 */}
      <Card variant="borderless">
        {loading ? (
          <div className="flex justify-center py-10">
            <Spin size="large"/>
          </div>
        ) : (
          <Table
            columns={columns}
            dataSource={filteredCategories}
            rowKey="id"
            onChange={handleTableChange}
            pagination={{
              current: pagination.current,
              pageSize: pagination.pageSize,
              total: pagination.total,
              showSizeChanger: true,
              placement: ['bottomCenter'],
              pageSizeOptions: ['5', '10', '20', '50'],
              showTotal: (total) => `共 ${total} 个分类`
            }}
          />
        )}
      </Card>

      {/* 添加/编辑分类模态框 */}
      <Modal
        title={isEditing ? '编辑分类' : '添加分类'}
        open={isModalVisible}
        onOk={handleSaveCategory}
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
            label="分类名称"
            rules={[
              { required: true, message: '请输入分类名称' },
              { min: 2, max: 50, message: '分类名称长度应在2-50个字符之间' }
            ]}
          >
            <Input placeholder="请输入分类名称"/>
          </Form.Item>

          <Form.Item
            name="slug"
            label="别名"
            rules={[
              { required: true, message: '请输入别名' },
              { min: 2, max: 50, message: '别名长度应在2-50个字符之间' }
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
            <Input.TextArea rows={3} placeholder="请输入分类描述"/>
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

      {/* 查看分类模态框 */}
      <Modal
        title="分类详情"
        open={isViewModalVisible}
        onCancel={() => setIsViewModalVisible(false)}
        width={500}
        footer={[
          <Button key="close" onClick={() => setIsViewModalVisible(false)}>
                        关闭
          </Button>
        ]}
      >
        {currentCategory && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <AppstoreOutlined className="text-gray-500"/>
              <span className="font-medium">分类名称:</span>
              <span>{currentCategory.name}</span>
            </div>
            <div className="flex items-center gap-2">
              <AppstoreOutlined className="text-gray-500"/>
              <span className="font-medium">别名:</span>
              <span>{currentCategory.slug}</span>
            </div>
            <div className="flex items-start gap-2">
              <AppstoreOutlined className="text-gray-500 mt-1"/>
              <span className="font-medium">描述:</span>
              <span>{currentCategory.description}</span>
            </div>
            <div className="flex items-center gap-2">
              <AppstoreOutlined className="text-gray-500"/>
              <span className="font-medium">文章数量:</span>
              <span>{currentCategory.articleCount || 0}</span>
            </div>
            <div className="flex items-center gap-2">
              <AppstoreOutlined className="text-gray-500"/>
              <span className="font-medium">状态:</span>
              <Tag color={currentCategory.status === StatusEnum.ENABLED ? 'green' : 'orange'}>
                {StatusEnumLabel[currentCategory.status]}
              </Tag>
            </div>
            <div className="flex items-center gap-2">
              <CalendarOutlined className="text-gray-500"/>
              <span className="font-medium">创建时间:</span>
              <span>{formatDateTime(currentCategory.createTime || '')}</span>
            </div>
            <div className="flex items-center gap-2">
              <CalendarOutlined className="text-gray-500"/>
              <span className="font-medium">更新时间:</span>
              <span>{formatDateTime(currentCategory.updateTime || '')}</span>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AdminCategories;
