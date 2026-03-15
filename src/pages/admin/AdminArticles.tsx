import React, { useState, useEffect, useCallback } from 'react';
import { Card, Table, Input, Button, Space, Tag, Modal, Form, Select, message, Typography, Popconfirm } from 'antd';
import {
  SearchOutlined,
  DeleteOutlined,
  EyeOutlined,
  EditOutlined,
  CalendarOutlined,
  EyeInvisibleOutlined,
  TagOutlined,
  UserOutlined
} from '@ant-design/icons';
import articleService from '../../services/articleService';
import categoryService from '../../services/categoryService';
import { type AdminArticleList } from '../../types/article';
import { type AdminCategory } from '../../types/category';
import {
  AllowStatusEnum, ArticleOriginalEnum,
  ArticleStatusEnum,
  ArticleStatusMap,
  ArticleVisibleEnum
} from '../../types/enums';

const { Option } = Select;
const { Search } = Input;
const { Title, Text } = Typography;


// 状态选项
const statusOptions = Object.entries(ArticleStatusMap).map(([value, label]) => ({
  value,
  label
}));



const AdminArticles: React.FC = () => {
  const [articles, setArticles] = useState<AdminArticleList[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<ArticleStatusEnum | undefined>();
  const [selectedCategory, setSelectedCategory] = useState<number | undefined>(undefined);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isViewModalVisible, setIsViewModalVisible] = useState(false);
  const [currentArticle, setCurrentArticle] = useState<AdminArticleList | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [form] = Form.useForm();
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  });
  const [categories, setCategories] = useState<Array<{value: number; label: string}>>([]);

  // 获取文章列表
  const fetchArticles = useCallback(async (page = pagination.current, pageSize = pagination.pageSize) : Promise<void> => {
    console.log('fetchArticles called with selectedCategory:', selectedCategory);
    setLoading(true);
    try {
      const params = {
        page,
        pageSize,
        categoryId: 0,
        keyword: searchText,
        articleStatus: selectedStatus
      };

      if (selectedCategory !== undefined && selectedCategory !== 0) {
        params.categoryId = selectedCategory;
      }

      console.log('fetchArticles params:', params);
      const response = await articleService.admin.getArticlesByPage(params);

      if (response.code === 200 && response.data) {
        const articleList = response.data.record.map((article: AdminArticleList) => ({
          id: article.id,
          title: article.title,
          authorName: article.authorName,
          categoryName: article.categoryName,
          articleStatus: article.articleStatus,
          publishTime: article.publishTime,
          readCount: article.readCount,
          likeCount: article.likeCount,
          commentCount: article.commentCount,
          top: article.top,
          tags: article.tags || [],
          createTime: article.createTime,
          updateTime: article.updateTime
        }));

        setArticles(articleList);
        setPagination(prev => ({
          ...prev,
          total: response.data.total
        }));
      } else {
        message.error('获取文章列表失败');
      }
    } catch (error) {
      console.error('获取文章列表失败:', error);
      message.error('获取文章列表失败');
    } finally {
      setLoading(false);
    }
  }, [searchText, selectedCategory, selectedStatus, pagination]);

  // 搜索和筛选文章
  const handleSearch = (value: string) : void => {
    setSearchText(value);
    setPagination(prev => ({ ...prev, current: 1 }));
  };

  const handleStatusChange = (value: ArticleStatusEnum) : void => {
    setSelectedStatus(value);
    setPagination(prev => ({ ...prev, current: 1 }));
  };

  const handleCategoryChange = (value: number | null) : void => {
    console.log('handleCategoryChange', value);
    setSelectedCategory(value === null ? undefined : value);
    setPagination(prev => ({ ...prev, current: 1 }));
  };

  // 获取分类列表
  const fetchCategories = useCallback(async () => {
    try {
      const response = await categoryService.adminGetCategoriesByPage('', 1, 100);
      if (response.code === 200 && response.data) {
        const categoryList = response.data.record.map((category: AdminCategory) => ({
          value: category.id,
          label: category.name
        }));
        setCategories(categoryList);
      } else {
        message.error('获取分类列表失败');
      }
    } catch (error) {
      console.error('获取分类列表失败:', error);
      message.error('获取分类列表失败');
    }
  }, []);

  // 组件挂载时获取文章列表和分类列表
  useEffect((): void => {
    const loadData = async (): Promise<void> => {
      await fetchArticles();
    };
    void loadData();
  }, [fetchArticles]);

  // 组件挂载时获取分类列表
  useEffect((): void => {
    const loadCategories = async (): Promise<void> => {
      await fetchCategories();
    };
    void loadCategories();
  }, [fetchCategories]);

  // 打开编辑文章模态框
  const handleEditArticle = (article: AdminArticleList) : void => {
    setIsEditing(true);
    setCurrentArticle(article);
    // 查找分类ID
    const category = categories.find(cat => cat.label === article.categoryName);
    form.setFieldsValue({
      title: article.title,
      author: article.authorName,
      category: category?.value || 0,
      tags: article.tags.join(','),
      status: article.articleStatus
    });
    setIsModalVisible(true);
  };

  // 打开查看文章模态框
  const handleViewArticle = async (article: AdminArticleList) : Promise<void> => {
    try {
      const response = await articleService.getArticleDetail(article.id);
      if (response.code === 200 && response.data) {
        // 合并文章详情数据
        const detailedArticle = {
          ...article,
          content: response.data.content,
          summary: response.data.summary
        };
        setCurrentArticle(detailedArticle);
        setIsViewModalVisible(true);
      } else {
        message.error('获取文章详情失败');
      }
    } catch (error) {
      console.error('获取文章详情失败:', error);
      message.error('获取文章详情失败');
    }
  };

  // 删除文章
  const handleDeleteArticle = async (id: number) : Promise<void> => {
    try {
      const response = await articleService.admin.deleteArticle(id);
      if (response.code === 200 && response.data) {
        message.success('文章删除成功');
        await fetchArticles();
      } else {
        message.error('删除文章失败');
      }
    } catch (error) {
      console.error('删除文章失败:', error);
      message.error('删除文章失败');
    }
  };

  // 保存文章
  const handleSaveArticle = async () : Promise<void> => {
    form.validateFields().then(async values => {
      try {
        if (isEditing && currentArticle) {
          // 编辑现有文章
          const response = await articleService.updateArticle(currentArticle.id, {
            title: values.title,
            content: '', // 这里需要从后端获取完整内容，暂时为空
            categoryId: Number(values.category),
            tagIds: [], // 这里需要从后端获取完整标签，暂时为空
            status: values.status as ArticleStatusEnum,
            visible: ArticleVisibleEnum.PUBLIC,
            allowComment: AllowStatusEnum.ALLOWED,
            allowForward: AllowStatusEnum.ALLOWED,
            original: ArticleOriginalEnum.ORIGINAL
          });

          if (response.code === 200 && response.data) {
            message.success('文章更新成功');
            await fetchArticles();
            setIsModalVisible(false);
          } else {
            message.error('更新文章失败');
          }
        } else {
          message.info('添加文章功能暂未实现');
          setIsModalVisible(false);
        }
      } catch (error) {
        console.error('保存文章失败:', error);
        message.error('保存文章失败');
      }
    }).catch(error => {
      console.error('验证失败:', error);
    });
  };

  // 获取状态标签颜色
  const getStatusColor = (status: string) : string | undefined => {
    switch (status) {
      case ArticleStatusEnum.PUBLISHED:
        return 'green';
      case ArticleStatusEnum.DRAFT:
        return 'orange';
      case ArticleStatusEnum.PENDING_PUBLISH:
        return 'blue';
      case ArticleStatusEnum.OFFLINE:
        return 'gray';
      case ArticleStatusEnum.RECYCLE:
        return 'red';
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
      render: (_: unknown, __: unknown, index: number) : number => (pagination.current - 1) * pagination.pageSize + index + 1
    },
    {
      title: '标题',
      dataIndex: 'title',
      key: 'title',
      render: (text: string) : React.ReactNode => <Text ellipsis={{ tooltip: text }} className="font-medium">{text}</Text>
    },
    {
      title: '作者',
      dataIndex: 'authorName',
      key: 'authorName',
      width: 100
    },
    {
      title: '分类',
      dataIndex: 'categoryName',
      key: 'categoryName',
      width: 100
    },
    {
      title: '状态',
      dataIndex: 'articleStatus',
      key: 'articleStatus',
      width: 100,
      render: (status: string) : React.ReactNode => (
        <Tag color={getStatusColor(status)}>
          {ArticleStatusMap[status as keyof typeof ArticleStatusMap] || status}
        </Tag>
      )
    },
    {
      title: '发布时间',
      dataIndex: 'publishTime',
      key: 'publishTime',
      width: 180
    },
    {
      title: '阅读量',
      dataIndex: 'readCount',
      key: 'readCount',
      width: 80
    },
    {
      title: '点赞',
      dataIndex: 'likeCount',
      key: 'likeCount',
      width: 80
    },
    {
      title: '评论数',
      dataIndex: 'commentCount',
      key: 'commentCount',
      width: 80
    },
    {
      title: '是否置顶',
      dataIndex: 'top',
      key: 'top',
      width: 100,
      render: (top: string) : React.ReactNode => (
        <Tag color={top === 'TOP' ? 'red' : 'default'}>
          {top === 'TOP' ? '是' : '否'}
        </Tag>
      )
    },
    {
      title: '标签',
      dataIndex: 'tags',
      key: 'tags',
      render: (tags: string[]) : React.ReactNode => (
        <Space size="small">
          {tags.map((tag, index) => (
            <Tag key={index}>{tag}</Tag>
          ))}
        </Space>
      )
    },
    {
      title: '操作',
      key: 'action',
      width: 180,
      render: (_: unknown, record: AdminArticleList) : React.ReactNode => (
        <Space size="middle">
          <Button
            type="text"
            icon={<EyeOutlined/>}
            onClick={() => handleViewArticle(record)}
            className="text-blue-500"
          >
                        查看
          </Button>
          <Button
            type="text"
            icon={<EditOutlined/>}
            onClick={() => handleEditArticle(record)}
            className="text-green-500"
          >
                        编辑
          </Button>
          <Popconfirm
            title="确定要删除这篇文章吗？"
            description="删除后将无法恢复"
            onConfirm={() => handleDeleteArticle(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button
              type="text"
              icon={<DeleteOutlined/>}
              className="text-red-500"
            >
                            删除
            </Button>
          </Popconfirm>
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
            enterButton={<SearchOutlined/>}
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
            {categories.map(option => (
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
          dataSource={articles}
          rowKey="id"
          loading={loading}
          pagination={{
            showSizeChanger: true,
            pageSizeOptions: ['10', '20', '50'],
            pageSize: pagination.pageSize,
            current: pagination.current,
            total: pagination.total,
            showTotal: (total) => `共 ${total} 篇文章`,
            onChange: (page, pageSize) => {
              setPagination(prev => ({
                ...prev,
                current: page,
                pageSize: pageSize
              }));
              fetchArticles(page, pageSize);
            }
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
            <Input placeholder="请输入标题"/>
          </Form.Item>

          <Form.Item
            name="author"
            label="作者"
            rules={[
              { required: true, message: '请输入作者' },
              { min: 2, max: 20, message: '作者名称长度应在2-20个字符之间' }
            ]}
          >
            <Input prefix={<UserOutlined/>} placeholder="请输入作者"/>
          </Form.Item>

          <Form.Item
            name="category"
            label="分类"
            rules={[{ required: true, message: '请选择分类' }]}
          >
            <Select placeholder="请选择分类">
              {categories.map(option => (
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
            <Input prefix={<TagOutlined/>} placeholder="请输入标签，多个标签用逗号分隔"/>
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
                  <UserOutlined/> {currentArticle.authorName}
                </span>
                <span className="flex items-center gap-1">
                  <CalendarOutlined/> {currentArticle.publishTime}
                </span>
                <span className="flex items-center gap-1">
                  <EyeOutlined/> {currentArticle.readCount} 浏览
                </span>
                <span className="flex items-center gap-1">
                  <EyeInvisibleOutlined/> {currentArticle.commentCount} 评论
                </span>
                <span className="flex items-center gap-1">
                  <span>点赞: {currentArticle.likeCount}</span>
                </span>
                <span className="flex items-center gap-1">
                  <Tag color={currentArticle.top === 'TOP' ? 'red' : 'default'}>
                    {currentArticle.top === 'TOP' ? '置顶' : '普通'}
                  </Tag>
                </span>
                <Tag color={getStatusColor(currentArticle.articleStatus)}>
                  {ArticleStatusMap[currentArticle.articleStatus as keyof typeof ArticleStatusMap] || currentArticle.articleStatus}
                </Tag>
              </div>
            </div>
            <div className="border-t pt-4">
              <h4 className="font-medium mb-2">分类</h4>
              <Tag>{currentArticle.categoryName}</Tag>
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
              <Text className="text-gray-600 whitespace-pre-wrap">
                {currentArticle.title || '文章内容预览...'}
              </Text>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AdminArticles;
