import React, { useState, useEffect, useCallback } from 'react';
import { Card, Table, Input, Button, Space, Tag, Modal, Form, Select, message, Typography, Popconfirm, Tabs, Descriptions, Badge, Divider } from 'antd';
import {
  SearchOutlined,
  DeleteOutlined,
  EyeOutlined,
  EditOutlined,
  CalendarOutlined,
  CommentOutlined,
  TagOutlined,
  UserOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ReloadOutlined,
  StarOutlined,
  PushpinOutlined,
  PushpinFilled,
  GlobalOutlined,
  LockOutlined,
  LinkOutlined,
  FileSearchOutlined
} from '@ant-design/icons';
import articleService from '../../services/articleService';
import categoryService from '../../services/categoryService';
import { type AdminArticleList, type AdminArticleDetail } from '../../types/article';
import { type AdminCategory } from '../../types/category';
import {
    AllowStatusEnum, ArticleOriginalEnum, ArticleReviewStatusEnum, ArticleReviewStatusMap,
    ArticleStatusEnum,
    ArticleStatusMap,
    ArticleVisibleEnum
} from '../../types/enums';
import { formatDateTime, formatDateTimeShort } from '../../utils';

const { Option } = Select;
const { Search } = Input;
const { Title, Text } = Typography;
const { TabPane } = Tabs;

// 状态选项
const statusOptions = Object.entries(ArticleStatusMap).map(([value, label]) => ({
  value,
  label
}));

// 可见性选项
const visibleOptions = [
  { value: ArticleVisibleEnum.PUBLIC, label: '公开' },
  { value: ArticleVisibleEnum.PRIVATE, label: '私有' },
  { value: ArticleVisibleEnum.FOLLOWERS_ONLY, label: '仅关注者可见' }
];

// 允许状态选项
const allowOptions = [
  { value: AllowStatusEnum.ALLOWED, label: '允许' },
  { value: AllowStatusEnum.PROHIBITED, label: '不允许' }
];

// 原创状态选项
const originalOptions = [
  { value: ArticleOriginalEnum.ORIGINAL, label: '原创' },
  { value: ArticleOriginalEnum.REPRINT, label: '转载' }
];

const AdminArticles: React.FC = () => {
  const [articles, setArticles] = useState<AdminArticleList[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<ArticleStatusEnum | undefined>();
  const [selectedCategory, setSelectedCategory] = useState<number | undefined>(undefined);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isViewModalVisible, setIsViewModalVisible] = useState(false);
  const [currentArticle, setCurrentArticle] = useState<AdminArticleDetail | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [form] = Form.useForm();
  const [reviewForm] = Form.useForm();
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  });
  const [categories, setCategories] = useState<Array<{value: number; label: string}>>([]);
  const [reviewLoading, setReviewLoading] = useState(false);

  // 获取文章列表
  const fetchArticles = useCallback(async (page = 1, pageSize = 10) : Promise<void> => {
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
          nickname: article.nickname,
          categoryName: article.categoryName,
          articleStatus: article.articleStatus,
          publishTime: article.publishTime,
          readCount: article.readCount,
          likeCount: article.likeCount,
          commentCount: article.commentCount,
          top: article.top,
          reviewStatus: article.reviewStatus,
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
  }, [searchText, selectedCategory, selectedStatus]);

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
    setCurrentArticle(article as unknown as AdminArticleDetail);
    // 查找分类ID
    const category = categories.find(cat => cat.label === article.categoryName);
    form.setFieldsValue({
      title: article.title,
      nickname: article.nickname,
      category: category?.value || 0,
      reviewStatus: article.reviewStatus,
      status: article.articleStatus
    });
    setIsModalVisible(true);
  };

  // 打开查看文章模态框
  const handleViewArticle = async (article: AdminArticleList) : Promise<void> => {
    try {
      const response = await articleService.admin.getArticleById(article.id);
      if (response.code === 200 && response.data) {
        setCurrentArticle(response.data);
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
            content: currentArticle.content,
            categoryId: Number(values.category),
            tags: values.tags,
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

  // 审核文章
  const handleReviewArticle = async (action: 'approve' | 'reject' | 'reprocess') : Promise<void> => {
    if (!currentArticle) return;

    setReviewLoading(true);
    try {
      let response;
      if (action === 'approve') {
        response = await articleService.admin.approveArticle(currentArticle.id);
      } else if (action === 'reject') {
        const values = await reviewForm.validateFields();
        response = await articleService.admin.rejectArticle(currentArticle.id, values.rejectReason);
      } else {
        response = await articleService.admin.reprocessArticle(currentArticle.id);
      }

      if (response.code === 200 && response.data) {
        message.success(action === 'approve' ? '审核通过' : action === 'reject' ? '审核拒绝' : '重新审核');
        // 重新获取文章详情
        const detailResponse = await articleService.admin.getArticleById(currentArticle.id);
        if (detailResponse.code === 200 && detailResponse.data) {
          setCurrentArticle(detailResponse.data);
        }
        // 刷新文章列表
        await fetchArticles();
      } else {
        message.error('审核操作失败');
      }
    } catch (error) {
      console.error('审核操作失败:', error);
      message.error('审核操作失败');
    } finally {
      setReviewLoading(false);
    }
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

  // 获取审核状态标签颜色
  const getReviewStatusColor = (status: ArticleReviewStatusEnum) : string | undefined => {
    switch (status) {
      case ArticleReviewStatusEnum.PENDING:
        return 'blue';
      case 'APPROVED':
        return 'green';
      case 'REJECTED':
        return 'red';
      case 'APPEALING':
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
      dataIndex: 'nickname',
      key: 'nickname',
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
      width: 180,
        render: (publishTime: string) : React.ReactNode => (
            formatDateTime(publishTime)
        )
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
      title: '审核状态',
      dataIndex: 'reviewStatus',
      key: 'reviewStatus',
      render: (reviewStatus: ArticleReviewStatusEnum) : React.ReactNode => (
        <Tag color={getReviewStatusColor(reviewStatus)}>
          {ArticleReviewStatusMap[reviewStatus]}
        </Tag>
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
              void fetchArticles(page, pageSize);
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
            name="nickname"
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
        width={1000}
        footer={[
          <Button key="close" onClick={() => setIsViewModalVisible(false)}>
                        关闭
          </Button>
        ]}
      >
        {currentArticle && (
          <div className="space-y-6">
            {/* 文章标题和基本信息 */}
            <div>
              <Title level={3}>{currentArticle.title}</Title>
              <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-4">
                <span className="flex items-center gap-1">
                  <UserOutlined/> {currentArticle.nickname}
                </span>
                <span className="flex items-center gap-1">
                  <CalendarOutlined/> {currentArticle.publishTime ? formatDateTimeShort(currentArticle.publishTime) : ''}
                </span>
                <span className="flex items-center gap-1">
                  <EyeOutlined/> {currentArticle.readCount} 浏览
                </span>
                <span className="flex items-center gap-1">
                  <CommentOutlined /> {currentArticle.commentCount} 评论
                </span>
                <span className="flex items-center gap-1">
                  <StarOutlined/> {currentArticle.likeCount} 点赞
                </span>
                <span className="flex items-center gap-1">
                  <span>收藏: {currentArticle.collectionCount}</span>
                </span>
                <span className="flex items-center gap-1">
                  <span>分享: {currentArticle.shareCount}</span>
                </span>
                <span className="flex items-center gap-1">
                  {currentArticle.top === 'TOP' ? <PushpinFilled className="text-red-500" /> : <PushpinOutlined className="text-gray-400" />}
                  {currentArticle.top === 'TOP' ? '置顶' : '普通'}
                </span>
                <Tag color={getStatusColor(currentArticle.articleStatus)}>
                  {ArticleStatusMap[currentArticle.articleStatus as keyof typeof ArticleStatusMap] || currentArticle.articleStatus}
                </Tag>
                <Tag color={getReviewStatusColor(currentArticle.reviewStatus || 'PENDING')}>
                  {ArticleReviewStatusMap[currentArticle.reviewStatus]}
                </Tag>
              </div>
            </div>

            <Tabs defaultActiveKey="basic" className="mt-4">
              {/* 基本信息 */}
              <TabPane tab="基本信息" key="basic">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* 左侧信息 */}
                  <div className="space-y-4">
                    {/* 分类和标签 */}
                    <Card size="small" title="分类和标签">
                      <div className="space-y-2">
                        <div>
                          <span className="font-medium">分类: </span>
                          <Tag>{currentArticle.categoryName}</Tag>
                        </div>
                        <div>
                          <span className="font-medium">标签: </span>
                          <Space wrap>
                            {currentArticle.tags?.map(tag => (
                              <Tag key={tag.id}>{tag.name}</Tag>
                            )) || <Text className="font-light pl-1" style={{ fontSize: '12px' }} type="warning">暂无标签</Text>}
                          </Space>
                        </div>
                      </div>
                    </Card>

                    {/* 状态信息 */}
                    <Card size="small" title="状态信息">
                      <Descriptions size="small" column={1}>
                        <Descriptions.Item label="文章状态">
                          <Tag color={getStatusColor(currentArticle.articleStatus)}>
                            {ArticleStatusMap[currentArticle.articleStatus as keyof typeof ArticleStatusMap] || currentArticle.articleStatus}
                          </Tag>
                        </Descriptions.Item>
                        <Descriptions.Item label="审核状态">
                          <Tag color={getReviewStatusColor(currentArticle.reviewStatus || 'PENDING')}>
                            {ArticleReviewStatusMap[currentArticle.reviewStatus || 'PENDING']}
                          </Tag>
                        </Descriptions.Item>
                        <Descriptions.Item label="可见性">
                          <span className="flex items-center gap-1">
                            {currentArticle.visible === ArticleVisibleEnum.PUBLIC && <GlobalOutlined />}
                            {currentArticle.visible === ArticleVisibleEnum.PRIVATE && <LockOutlined />}
                            {currentArticle.visible === ArticleVisibleEnum.FOLLOWERS_ONLY && <UserOutlined />}
                            {visibleOptions.find(opt => opt.value === currentArticle.visible)?.label}
                          </span>
                        </Descriptions.Item>
                        <Descriptions.Item label="原创状态">
                          <span>
                            {originalOptions.find(opt => opt.value === currentArticle.original)?.label}
                            {currentArticle.original === ArticleOriginalEnum.REPRINT && currentArticle.originalUrl && (
                              <a href={currentArticle.originalUrl} target="_blank" rel="noopener noreferrer" className="ml-2 text-blue-500 hover:underline">
                                <LinkOutlined /> 来源链接
                              </a>
                            )}
                          </span>
                        </Descriptions.Item>
                      </Descriptions>
                    </Card>

                    {/* 权限设置 */}
                    <Card size="small" title="权限设置">
                      <Descriptions size="small" column={1}>
                        <Descriptions.Item label="允许评论">
                          <Badge status={currentArticle.allowComment === AllowStatusEnum.ALLOWED ? 'success' : 'default'} text={allowOptions.find(opt => opt.value === currentArticle.allowComment)?.label} />
                        </Descriptions.Item>
                        <Descriptions.Item label="允许转发">
                          <Badge status={currentArticle.allowForward === AllowStatusEnum.ALLOWED ? 'success' : 'default'} text={allowOptions.find(opt => opt.value === currentArticle.allowForward)?.label} />
                        </Descriptions.Item>
                      </Descriptions>
                    </Card>
                  </div>

                  {/* 右侧信息 */}
                  <div className="space-y-4">
                    {/* 时间信息 */}
                    <Card size="small" title="时间信息">
                      <Descriptions size="small" column={1}>
                        <Descriptions.Item label="创建时间">
                          {currentArticle.createTime ? formatDateTime(currentArticle.createTime) : '未知'}
                        </Descriptions.Item>
                        <Descriptions.Item label="发布时间">
                          {currentArticle.publishTime ? formatDateTime(currentArticle.publishTime) : '未发布'}
                        </Descriptions.Item>
                        <Descriptions.Item label="最后编辑时间">
                          {currentArticle.lastEditTime ? formatDateTime(currentArticle.lastEditTime) : '无'}
                        </Descriptions.Item>
                      </Descriptions>
                    </Card>

                    {/* SEO信息 */}
                    <Card size="small" title="SEO信息">
                      <div className="space-y-2">
                        <div>
                          <span className="font-medium">SEO标题: </span>
                          <Text ellipsis={{ tooltip: currentArticle.metaTitle }}>{currentArticle.metaTitle || '未设置'}</Text>
                        </div>
                        <div>
                          <span className="font-medium">SEO描述: </span>
                          <Text ellipsis={{ tooltip: currentArticle.metaDescription }}>{currentArticle.metaDescription || '未设置'}</Text>
                        </div>
                        <div>
                          <span className="font-medium">SEO关键词: </span>
                          <Text ellipsis={{ tooltip: currentArticle.metaKeywords }}>{currentArticle.metaKeywords || '未设置'}</Text>
                        </div>
                      </div>
                    </Card>

                    {/* 统计信息 */}
                    <Card size="small" title="统计信息">
                      <Descriptions size="small" column={2}>
                        <Descriptions.Item label="阅读量">{currentArticle.readCount}</Descriptions.Item>
                        <Descriptions.Item label="点赞数">{currentArticle.likeCount}</Descriptions.Item>
                        <Descriptions.Item label="评论数">{currentArticle.commentCount}</Descriptions.Item>
                        <Descriptions.Item label="收藏数">{currentArticle.collectionCount}</Descriptions.Item>
                        <Descriptions.Item label="分享数">{currentArticle.shareCount}</Descriptions.Item>
                      </Descriptions>
                    </Card>
                  </div>
                </div>
              </TabPane>

              {/* 文章内容 */}
              <TabPane tab="文章内容" key="content">
                <Card>
                  {currentArticle.coverImage && (
                    <div className="mb-4">
                      <img src={currentArticle.coverImage} alt="封面图" className="w-full h-auto max-h-64 object-cover rounded" />
                    </div>
                  )}
                  <div className="mb-4">
                    <h4 className="font-medium mb-2">摘要</h4>
                    <Text className="text-gray-600">{currentArticle.summary || '无摘要'}</Text>
                  </div>
                  <Divider />
                  <div>
                    <h4 className="font-medium mb-2">正文</h4>
                    <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: currentArticle.contentHtml || currentArticle.content || '<p>无内容</p>' }} />
                  </div>
                </Card>
              </TabPane>

              {/* 审核操作 */}
              <TabPane tab="审核操作" key="review">
                <Card>
                  <div className="mb-6">
                    <h4 className="font-medium mb-4">当前审核状态</h4>
                    <div className="flex items-center gap-2">
                      <Tag color={getReviewStatusColor(currentArticle.reviewStatus)} className="text-lg">
                        {ArticleReviewStatusMap[currentArticle.reviewStatus]}
                      </Tag>
                    </div>
                  </div>

                  <Divider />

                  <div className="mb-6">
                    <h4 className="font-medium mb-4">审核操作</h4>
                    <Space orientation="vertical" size="middle" style={{ width: '100%' }}>
                      <Button
                        type='primary'
                        icon={<CheckCircleOutlined />}
                        onClick={() => handleReviewArticle('approve')}
                        loading={reviewLoading}
                        disabled={currentArticle.reviewStatus === 'APPROVED'}
                      >
                        审核通过
                      </Button>

                      <Form form={reviewForm} layout="vertical">
                        <Form.Item
                          name="rejectReason"
                          label="拒绝原因"
                          rules={[{ required: true, message: '请输入拒绝原因' }]}
                        >
                          <Input.TextArea rows={3} placeholder="请输入拒绝原因" />
                        </Form.Item>
                        <Button danger
                          icon={<CloseCircleOutlined />}
                          onClick={() => handleReviewArticle('reject')}
                          loading={reviewLoading}
                          disabled={currentArticle.reviewStatus === 'REJECTED'}
                        >
                          审核拒绝
                        </Button>
                      </Form>

                      <Button
                        icon={<ReloadOutlined />}
                        onClick={() => handleReviewArticle('reprocess')}
                        loading={reviewLoading}
                        disabled={currentArticle.reviewStatus === 'PENDING'}
                      >
                        重新审核
                      </Button>
                    </Space>
                  </div>

                  <Divider />

                  <div>
                    <h4 className="font-medium mb-4">审核记录</h4>
                    <div className="text-gray-500 text-center py-8">
                      <FileSearchOutlined style={{ fontSize: '24px' }} />
                      <p className="mt-2">暂无审核记录</p>
                    </div>
                  </div>
                </Card>
              </TabPane>
            </Tabs>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AdminArticles;
