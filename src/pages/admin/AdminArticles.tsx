import React, { useCallback, useEffect, useState } from 'react';
import {
  Badge,
  Button,
  Card,
  Descriptions,
  Divider,
  Dropdown,
  Form,
  Input,
  message,
  Modal,
  Popconfirm,
  Select,
  Space,
  Table,
  Tabs,
  Tag,
  Typography
} from 'antd';
import AdminArticleEditor from '../../components/admin/AdminArticleEditor';
import {
  AuditOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  CommentOutlined,
  DeleteOutlined,
  DislikeOutlined,
  DownOutlined,
  EditOutlined,
  EyeOutlined,
  GlobalOutlined,
  LikeOutlined,
  LinkOutlined,
  LockOutlined,
  PushpinOutlined,
  PushpinTwoTone,
  SearchOutlined,
  ShareAltOutlined,
  StarOutlined,
  UpOutlined,
  UserOutlined
} from '@ant-design/icons';
import articleService from '../../services/articleService';
import categoryService from '../../services/categoryService';
import tagService from '../../services/tagService';
import { type AdminArticleDetail, type AdminArticleList } from '../../types/article';
import { type AdminCategory } from '../../types/category';
import { type FrontTag } from '../../types/tag';
import {
  AllowStatusEnum,
  AllowTopEnum,
  AllowTopMap,
  ArticleOriginalEnum,
  ArticleReviewStatusEnum,
  ArticleReviewStatusMap,
  ArticleStatusEnum,
  ArticleStatusMap,
  ArticleVisibleEnum,
  RecommendedEnum,
  RecommendedMap
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
// 允许状态选项
const allowOptions = [
  { value: AllowStatusEnum.ALLOWED, label: '允许' },
  { value: AllowStatusEnum.PROHIBITED, label: '不允许' }
];
// 可见性选项
const visibleOptions = [
  { value: ArticleVisibleEnum.PUBLIC, label: '公开' },
  { value: ArticleVisibleEnum.PRIVATE, label: '私有' },
  { value: ArticleVisibleEnum.FOLLOWERS_ONLY, label: '仅关注者可见' }
];
// 原创状态选项
const originalOptions = [
  { value: ArticleOriginalEnum.ORIGINAL, label: '原创' },
  { value: ArticleOriginalEnum.REPRINT, label: '转载' }
];
// 置顶状态选项
const topOptions = [
  { value: AllowTopEnum.TOP, label: '已置顶' },
  { value: AllowTopEnum.NOT_TOP, label: '未置顶' }
];
const AdminArticles: React.FC = () => {
  const [articles, setArticles] = useState<AdminArticleList[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<ArticleStatusEnum | undefined>();
  const [selectedCategory, setSelectedCategory] = useState<number | undefined>(undefined);
  const [selectedTop, setSelectedTop] = useState<AllowTopEnum | undefined>();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isViewModalVisible, setIsViewModalVisible] = useState(false);
  const [currentArticle, setCurrentArticle] = useState<AdminArticleDetail | null>(null);
  const [rejectForm] = Form.useForm();
  const [pagination, setPagination] = useState({
    pageNum: 1,
    pageSize: 10,
    total: 0
  });
  const [categories, setCategories] = useState<Array<{ value: number; label: string }>>([]);
  const [tags, setTags] = useState<Array<{ value: string; label: string }>>([]);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [rejectModalVisible, setRejectModalVisible] = useState(false);
  // 获取文章列表
  const fetchArticles = useCallback(
    async (pageNum = 1, pageSize = 10): Promise<void> => {
      setLoading(true);
      try {
        const params = {
          pageNum,
          pageSize,
          categoryId: 0,
          keyword: searchText,
          articleStatus: selectedStatus,
          topStatus: selectedTop
        };
        if (selectedCategory !== undefined && selectedCategory !== 0) {
          params.categoryId = selectedCategory;
        }
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
            recommended: article.recommended,
            reviewStatus: article.reviewStatus,
            createTime: article.createTime,
            updateTime: article.updateTime
          }));
          setArticles(articleList);
          setPagination((prev) => ({
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
    },
    [searchText, selectedStatus, selectedCategory, selectedTop]
  );
  // 搜索和筛选文章
  const handleSearch = (value: string): void => {
    setSearchText(value);
    setPagination((prev) => ({ ...prev, pageNum: 1 }));
  };
  const handleStatusChange = (value: ArticleStatusEnum): void => {
    setSelectedStatus(value);
    setPagination((prev) => ({ ...prev, pageNum: 1 }));
  };
  const handleCategoryChange = (value: number | null): void => {
    setSelectedCategory(value === null ? undefined : value);
    setPagination((prev) => ({ ...prev, pageNum: 1 }));
  };
  const handleTopChange = (value: AllowTopEnum): void => {
    setSelectedTop(value);
    setPagination((prev) => ({ ...prev, pageNum: 1 }));
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
  // 获取标签列表
  const fetchTags = useCallback(async () => {
    try {
      const response = await tagService.getActiveTags();
      if (response.code === 200 && response.data) {
        const tagList = response.data.map((tag: FrontTag) => ({
          value: tag.id?.toString() || '',
          label: tag.name
        }));
        setTags(tagList);
      } else {
        message.error('获取标签列表失败');
      }
    } catch (error) {
      console.error('获取标签列表失败:', error);
      message.error('获取标签列表失败');
    }
  }, []);
  // 组件挂载时获取文章列表和分类列表
  useEffect((): void => {
    const loadData = async (): Promise<void> => {
      await fetchArticles(pagination.pageNum, pagination.pageSize);
    };
    void loadData();
  }, [fetchArticles, pagination.pageNum, pagination.pageSize]);
  // 组件挂载时获取分类列表和标签列表
  useEffect((): void => {
    const loadCategoriesAndTags = async (): Promise<void> => {
      await Promise.all([fetchCategories(), fetchTags()]);
    };
    void loadCategoriesAndTags();
  }, [fetchCategories, fetchTags]);
  // 打开编辑文章模态框
  const handleEditArticle = async (article: AdminArticleList): Promise<void> => {
    try {
      // 先关闭模态框并重置状态
      setIsModalVisible(false);
      setCurrentArticle(null);
      // 等待状态重置完成
      setTimeout(async () => {
        const response = await articleService.admin.getArticleById(article.id);
        if (response.code === 200 && response.data) {
          const articleDetail = response.data;
          // 更新文章数据
          setCurrentArticle(articleDetail);
          // 打开模态框
          setTimeout(() => {
            setIsModalVisible(true);
          }, 0);
        } else {
          message.error('获取文章详情失败');
        }
      }, 100);
    } catch (error) {
      console.error('获取文章详情失败:', error);
      message.error('获取文章详情失败');
    }
  };
  // 打开查看文章模态框
  const handleViewArticle = async (article: AdminArticleList): Promise<void> => {
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
  const handleDeleteArticle = async (id: number): Promise<void> => {
    try {
      const response = await articleService.admin.deleteArticle(id);
      if (response.code === 200 && response.data) {
        message.success('文章删除成功');
        await fetchArticles(pagination.pageNum, pagination.pageSize);
      } else {
        message.error('删除文章失败');
      }
    } catch (error) {
      console.error('删除文章失败:', error);
      message.error('删除文章失败');
    }
  };
  // 保存文章后的回调
  const handleSaveSuccess = async (): Promise<void> => {
    await fetchArticles(pagination.pageNum, pagination.pageSize);
  };
  // 审核文章
  const handleReviewArticle = async (
    action: 'approve' | 'reject' | 'reprocess',
    rejectReason?: string
  ): Promise<void> => {
    if (!currentArticle) return;
    setReviewLoading(true);
    try {
      let response;
      if (action === 'approve') {
        response = await articleService.admin.approveArticle(currentArticle.id);
      } else if (action === 'reject' && rejectReason) {
        response = await articleService.admin.rejectArticle(currentArticle.id, rejectReason);
      } else {
        response = await articleService.admin.reprocessArticle(currentArticle.id);
      }
      if (response.code === 200 && response.data) {
        message.success(
          response.message || (action === 'approve' ? '审核通过' : action === 'reject' ? '审核拒绝' : '重新审核')
        );
        // 重新获取文章详情
        const detailResponse = await articleService.admin.getArticleById(currentArticle.id);
        if (detailResponse.code === 200 && detailResponse.data) {
          setCurrentArticle(detailResponse.data);
        }
        // 刷新文章列表
        await fetchArticles(pagination.pageNum, pagination.pageSize);
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
  // 处理审核拒绝
  const handleRejectArticle = async (): Promise<void> => {
    try {
      const values = await rejectForm.validateFields();
      await handleReviewArticle('reject', values.rejectReason);
      setRejectModalVisible(false);
      rejectForm.resetFields();
    } catch (error) {
      console.error('验证失败:', error);
    }
  };
  // 处理下架/上架文章
  const handleOfflineArticle = async (id: number, currentStatus: ArticleStatusEnum): Promise<void> => {
    try {
      const targetStatus =
        currentStatus === ArticleStatusEnum.OFFLINE ? ArticleStatusEnum.PUBLISHED : ArticleStatusEnum.OFFLINE;
      const response = await articleService.admin.updateArticleStatus(id, targetStatus);
      if (response.code === 200 && response.data) {
        message.success(
          response.message || (currentStatus === ArticleStatusEnum.OFFLINE ? '文章下架成功' : '文章上架成功')
        );
        await fetchArticles(pagination.pageNum, pagination.pageSize);
      } else {
        message.error(
          response.message || (currentStatus === ArticleStatusEnum.OFFLINE ? '上架文章失败' : '下架文章失败')
        );
      }
    } catch (error) {
      console.error(currentStatus === ArticleStatusEnum.OFFLINE ? '上架文章失败:' : '下架文章失败:', error);
      message.error(currentStatus === ArticleStatusEnum.OFFLINE ? '上架文章失败' : '下架文章失败');
    }
  };
  // 处理置顶/取消置顶文章
  const handleTopArticle = async (id: number, currentTopStatus: AllowTopEnum): Promise<void> => {
    try {
      const response =
        currentTopStatus === AllowTopEnum.TOP
          ? await articleService.admin.cancelTopArticle(id)
          : await articleService.admin.topArticle(id);
      if (response.code === 200 && response.data) {
        message.success(response.message || (currentTopStatus === AllowTopEnum.TOP ? '取消置顶成功' : '文章置顶成功'));
        await fetchArticles(pagination.pageNum, pagination.pageSize);
      } else {
        message.error(response.message || (currentTopStatus === AllowTopEnum.TOP ? '取消置顶失败' : '置顶文章失败'));
      }
    } catch (error) {
      console.error(currentTopStatus === AllowTopEnum.TOP ? '取消置顶失败:' : '置顶文章失败:', error);
      message.error(currentTopStatus === AllowTopEnum.TOP ? '取消置顶失败' : '置顶文章失败');
    }
  };
  // 处理推荐/取消文章
  const handleRecommendArticle = async (id: number, currentRecommendStatus: RecommendedEnum): Promise<void> => {
    try {
      const response =
        currentRecommendStatus === RecommendedEnum.RECOMMENDED
          ? await articleService.admin.cancelRecommendArticle(id)
          : await articleService.admin.recommendArticle(id);
      if (response.code === 200 && response.data) {
        message.success(
          response.message || (currentRecommendStatus === RecommendedEnum.RECOMMENDED ? '取消推荐成功' : '文章推荐成功')
        );
        await fetchArticles(pagination.pageNum, pagination.pageSize);
      } else {
        message.error(
          response.message || (currentRecommendStatus === RecommendedEnum.RECOMMENDED ? '取消推荐失败' : '文章推荐失败')
        );
      }
    } catch (error) {
      console.error(currentRecommendStatus === RecommendedEnum.RECOMMENDED ? '取消推荐失败:' : '推荐文章失败:', error);
      message.error(currentRecommendStatus === RecommendedEnum.RECOMMENDED ? '取消推荐失败' : '推荐文章失败');
    }
  };
  // 获取状态标签颜色
  const getStatusColor = (status: string): string | undefined => {
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
  const getReviewStatusColor = (status: ArticleReviewStatusEnum): string | undefined => {
    switch (status) {
      case ArticleReviewStatusEnum.PENDING:
        return 'orange';
      case ArticleReviewStatusEnum.APPROVED:
        return 'green';
      case ArticleReviewStatusEnum.REJECTED:
        return 'red';
      case ArticleReviewStatusEnum.APPEALING:
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
      render: (_: unknown, __: unknown, index: number): number =>
        (pagination.pageNum - 1) * pagination.pageSize + index + 1
    },
    {
      title: '标题',
      dataIndex: 'title',
      key: 'title',
      width: 200,
      render: (text: string, record: AdminArticleList): React.ReactNode => (
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-center',
            justifyContent: 'flex-start',
            width: '100%',
            maxWidth: '240px',
            overflow: 'hidden'
          }}
        >
          <div
            style={{
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}
          >
            <Text
              ellipsis={{ tooltip: text }}
              className="font-medium cursor-pointer hover:text-blue-600 block whitespace-nowrap overflow-hidden text-ellipsis"
            >
              {text}
            </Text>
          </div>
          {record.recommended === RecommendedEnum.RECOMMENDED && (
            <Tag color="red" style={{ fontSize: '10px', marginLeft: '4px', marginTop: '-2px', flexShrink: 0 }}>
              推荐
            </Tag>
          )}
        </div>
      )
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
      align: 'center' as const,
      width: 100
    },
    {
      title: '文章状态',
      dataIndex: 'articleStatus',
      key: 'articleStatus',
      width: 90,
      render: (status: string): React.ReactNode => (
        <Tag color={getStatusColor(status)}>{ArticleStatusMap[status as keyof typeof ArticleStatusMap] || status}</Tag>
      )
    },
    {
      title: '发布时间',
      dataIndex: 'publishTime',
      align: 'center' as const,
      key: 'publishTime',
      width: 160,
      render: (publishTime: string): React.ReactNode => formatDateTimeShort(publishTime)
    },
    {
      title: '阅读量',
      dataIndex: 'readCount',
      key: 'readCount',
      width: 80
    },
    {
      title: '点赞数',
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
      title: '置顶',
      dataIndex: 'top',
      align: 'center' as const,
      key: 'top',
      width: 80,
      render: (top: AllowTopEnum): React.ReactNode => (
        <Tag color={top === AllowTopEnum.TOP ? 'red' : 'default'}>{AllowTopMap[top]}</Tag>
      )
    },
    {
      title: '审核状态',
      dataIndex: 'reviewStatus',
      key: 'reviewStatus',
      width: 80,
      render: (reviewStatus: ArticleReviewStatusEnum): React.ReactNode => (
        <Tag color={getReviewStatusColor(reviewStatus)}>{ArticleReviewStatusMap[reviewStatus]}</Tag>
      )
    },
    {
      title: '操作',
      key: 'action',
      align: 'center' as const,
      width: 180,
      render: (_: unknown, record: AdminArticleList): React.ReactNode => {
        const moreMenuItems = [
          {
            key: 'edit',
            label: (
              <span onClick={() => handleEditArticle(record)} className="flex items-center cursor-pointer">
                <EditOutlined className="mr-2" />
                编辑
              </span>
            )
          },
          {
            key: 'delete',
            label: (
              <Popconfirm
                title="确定要删除这篇文章吗？"
                description="删除后将无法恢复"
                onConfirm={() => handleDeleteArticle(record.id)}
                okText="确定"
                cancelText="取消"
              >
                <span className="flex items-center cursor-pointer">
                  <DeleteOutlined className="mr-2 text-red-500" />
                  删除
                </span>
              </Popconfirm>
            )
          },
          {
            key: 'offline',
            label: (
              <span
                onClick={() => handleOfflineArticle(record.id, record.articleStatus)}
                className="flex items-center cursor-pointer"
              >
                {record.articleStatus === ArticleStatusEnum.OFFLINE ? (
                  <UpOutlined className="mr-2" />
                ) : (
                  <DownOutlined className="mr-2" />
                )}
                {record.articleStatus === ArticleStatusEnum.OFFLINE ? '上架' : '下架'}
              </span>
            )
          },
          {
            key: 'top',
            label: (
              <span
                onClick={() => handleTopArticle(record.id, record.top)}
                className="flex items-center cursor-pointer"
              >
                {record.top === AllowTopEnum.TOP ? (
                  <PushpinTwoTone className="mr-2" />
                ) : (
                  <PushpinOutlined className="mr-2" />
                )}
                {record.top === AllowTopEnum.TOP ? '取消置顶' : '置顶'}
              </span>
            )
          },
          {
            key: 'recommended',
            label: (
              <span
                onClick={() => handleRecommendArticle(record.id, record.recommended)}
                className="flex items-center cursor-pointer"
              >
                {record.recommended === RecommendedEnum.RECOMMENDED ? (
                  <DislikeOutlined className="mr-2" />
                ) : (
                  <LikeOutlined className="mr-2" />
                )}
                {record.recommended === RecommendedEnum.RECOMMENDED ? '取消推荐' : '推荐'}
              </span>
            )
          }
        ];
        return (
          <Space size="middle">
            <Button
              variant={'filled'}
              color={'blue'}
              icon={<EyeOutlined />}
              onClick={() => handleViewArticle(record)}
              className="text-blue-500"
            >
              查看
            </Button>
            <Button
              variant={'filled'}
              color={record.reviewStatus === 'APPROVED' ? 'default' : 'green'}
              icon={<AuditOutlined />}
              onClick={() => handleViewArticle(record)}
              className={record.reviewStatus === 'APPROVED' ? 'w-24 text-gray-500' : 'w-24 text-green-500'}
            >
              {record.reviewStatus === 'APPROVED' ? '已审核' : '审核'}
            </Button>
            <Dropdown menu={{ items: moreMenuItems }} trigger={['click']}>
              <Button variant={'filled'} color={'default'} className="text-gray-500">
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
      <h2 className="text-2xl font-semibold text-gray-800 mb-4">文章管理</h2>

      {/* 搜索和筛选 */}
      <Card variant={'borderless'} className="border-b border-gray-100 mb-4">
        <div className="flex flex-col md:flex-row gap-4">
          <Search
            placeholder="搜索标题或作者"
            allowClear
            enterButton={<SearchOutlined />}
            onSearch={handleSearch}
            style={{ width: 300 }}
          />
          <Select placeholder="按状态筛选" allowClear style={{ width: 150 }} onChange={handleStatusChange}>
            {statusOptions.map((option) => (
              <Option key={option.value} value={option.value}>
                {option.label}
              </Option>
            ))}
          </Select>
          <Select placeholder="按分类筛选" allowClear style={{ width: 150 }} onChange={handleCategoryChange}>
            {categories.map((option) => (
              <Option key={option.value} value={option.value}>
                {option.label}
              </Option>
            ))}
          </Select>
          <Select placeholder="是否置顶" allowClear style={{ width: 120 }} onChange={handleTopChange}>
            {topOptions.map((option) => (
              <Option key={option.value} value={option.value}>
                {option.label}
              </Option>
            ))}
          </Select>
        </div>
      </Card>

      {/* 文章列表 */}
      <Card variant={'borderless'}>
        <Table
          columns={columns}
          dataSource={articles}
          rowKey="id"
          loading={loading}
          pagination={{
            showSizeChanger: true,
            placement: ['bottomCenter'],
            pageSizeOptions: ['10', '20', '50'],
            pageSize: pagination.pageSize,
            current: pagination.pageNum,
            total: pagination.total,
            showTotal: (total) => `共 ${total} 篇文章`,
            onChange: (pageNum, pageSize) => {
              setPagination((prev) => ({
                ...prev,
                pageNum: pageNum,
                pageSize: pageSize
              }));
              void fetchArticles(pageNum, pageSize);
            }
          }}
        />
      </Card>

      {/* 编辑文章组件 */}
      <AdminArticleEditor
        visible={isModalVisible}
        article={currentArticle}
        categories={categories}
        tags={tags}
        onClose={() => setIsModalVisible(false)}
        onSave={handleSaveSuccess}
      />

      {/* 查看文章模态框 */}
      <Modal
        title="文章详情"
        open={isViewModalVisible}
        onCancel={() => setIsViewModalVisible(false)}
        width={1000}
        height={800}
        footer={[
          <div key="status" className="flex mr-60">
            <span className="font-medium mr-1">当前审核状态:</span>
            {currentArticle && (
              <Tag color={getReviewStatusColor(currentArticle.reviewStatus || 'PENDING')} className="text-lg">
                {ArticleReviewStatusMap[currentArticle.reviewStatus || 'PENDING']}
              </Tag>
            )}
          </div>,
          <Button
            key="approve"
            color="green"
            variant="filled"
            icon={<CheckCircleOutlined />}
            onClick={() => handleReviewArticle('approve')}
            loading={reviewLoading}
            disabled={currentArticle?.reviewStatus === ArticleReviewStatusEnum.APPROVED}
            className="px-6 py-2 mr-10"
          >
            审核通过
          </Button>,
          <Button
            key="reject"
            color="red"
            variant="filled"
            icon={<CloseCircleOutlined />}
            onClick={() => setRejectModalVisible(true)}
            loading={reviewLoading}
            disabled={currentArticle?.reviewStatus === ArticleReviewStatusEnum.REJECTED}
            className="px-6 py-2 mr-10"
          >
            审核拒绝
          </Button>,
          <Button
            key="reprocess"
            color="cyan"
            variant="filled"
            icon={<CheckCircleOutlined />}
            onClick={() => handleReviewArticle('reprocess')}
            loading={reviewLoading}
            className="px-6 py-2 mr-10"
          >
            重新审核
          </Button>,
          <Button
            color="default"
            variant="filled"
            key="close"
            onClick={() => setIsViewModalVisible(false)}
            className="px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 transition-all duration-200 mr-2"
          >
            取消
          </Button>
        ]}
        styles={{
          body: {
            padding: 0,
            height: '100%',
            maxHeight: 700,
            overflow: 'hidden',
            alignItems: 'start'
          },
          footer: {
            display: 'flex',
            alignItems: 'center',
            justifyItems: 'start'
          }
        }}
        style={{
          borderRadius: '12px',
          boxShadow: '0 12px 40px rgba(0, 0, 0, 0.12)',
          overflow: 'hidden'
        }}
      >
        {currentArticle && (
          <div className="space-y-6">
            {/* 文章标题和基本信息 */}
            <div>
              <Title level={3}>{currentArticle.title}</Title>
              <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-4">
                <span className="flex items-center gap-1">
                  <UserOutlined /> {currentArticle.nickname}
                </span>
                <span className="flex items-center gap-1">
                  <CalendarOutlined />{' '}
                  {currentArticle.publishTime ? formatDateTimeShort(currentArticle.publishTime) : ''}
                </span>
                <span className="flex items-center gap-1">
                  <EyeOutlined /> {currentArticle.readCount} 浏览
                </span>
                <span className="flex items-center gap-1">
                  <CommentOutlined /> {currentArticle.commentCount} 评论
                </span>
                <span className="flex items-center gap-1">
                  <LikeOutlined /> {currentArticle.likeCount} 点赞
                </span>
                <span className="flex items-center gap-1">
                  <StarOutlined />
                  {currentArticle.collectionCount} 收藏
                </span>
                <span className="flex items-center gap-1">
                  <ShareAltOutlined />
                  {currentArticle.shareCount} 分享
                </span>
                <span className="flex items-center gap-1">
                  {currentArticle.top === AllowTopEnum.TOP ? (
                    <PushpinTwoTone />
                  ) : (
                    <PushpinOutlined className="text-gray-400" />
                  )}
                  {AllowTopMap[currentArticle.top as keyof typeof AllowTopMap] || currentArticle.top}
                </span>
                {currentArticle.recommended === RecommendedEnum.RECOMMENDED && (
                  <span className="flex items-center gap-1">
                    <Tag color={'red'}>
                      {RecommendedMap[currentArticle.recommended as keyof typeof RecommendedMap] ||
                        currentArticle.recommended}
                    </Tag>
                  </span>
                )}
                <Tag color={getStatusColor(currentArticle.articleStatus)}>
                  {ArticleStatusMap[currentArticle.articleStatus as keyof typeof ArticleStatusMap] ||
                    currentArticle.articleStatus}
                </Tag>
              </div>
            </div>

            <Tabs defaultActiveKey="basic" className="mt-4">
              {/* 基本信息 */}
              <TabPane tab="基本信息" key="basic">
                <div className="h-[500px] overflow-y-auto">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* 左侧信息 */}
                    <Space orientation="vertical" size={32}>
                      {/* 分类和标签 */}
                      <Card size="small" title="分类和标签" hoverable={true} type={'inner'}>
                        <div className="space-y-3">
                          <div>
                            <span className="font-medium">分类: </span>
                            <Tag>{currentArticle.categoryName}</Tag>
                          </div>
                          <div>
                            <span className="font-medium">标签: </span>
                            <Space wrap>
                              {currentArticle.tags?.map((tag) => <Tag key={tag.id}>{tag.name}</Tag>) || (
                                <Text className="font-light pl-1" style={{ fontSize: '12px' }} type="warning">
                                  暂无标签
                                </Text>
                              )}
                            </Space>
                          </div>
                        </div>
                      </Card>
                      {/* 状态信息 */}
                      <Card size="small" title="状态信息" hoverable={true} type={'inner'}>
                        <Descriptions size="small" column={1}>
                          <Descriptions.Item label="文章状态">
                            <Tag color={getStatusColor(currentArticle.articleStatus)}>
                              {ArticleStatusMap[currentArticle.articleStatus as keyof typeof ArticleStatusMap] ||
                                currentArticle.articleStatus}
                            </Tag>
                          </Descriptions.Item>
                          <Descriptions.Item label="可见性">
                            <span className="flex items-center gap-1">
                              {currentArticle.visible === ArticleVisibleEnum.PUBLIC && (
                                <GlobalOutlined style={{ color: 'green' }} />
                              )}
                              {currentArticle.visible === ArticleVisibleEnum.PRIVATE && (
                                <LockOutlined style={{ color: 'blue' }} />
                              )}
                              {currentArticle.visible === ArticleVisibleEnum.FOLLOWERS_ONLY && (
                                <UserOutlined style={{ color: 'chocolate' }} />
                              )}
                              {visibleOptions.find((opt) => opt.value === currentArticle.visible)?.label}
                            </span>
                          </Descriptions.Item>
                          <Descriptions.Item label="是否原创">
                            <span>
                              {originalOptions.find((opt) => opt.value === currentArticle.original)?.label}
                              {currentArticle.original === ArticleOriginalEnum.REPRINT &&
                                currentArticle.originalUrl && (
                                  <a
                                    href={currentArticle.originalUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="ml-2 text-blue-500 hover:underline"
                                  >
                                    <LinkOutlined /> 来源链接
                                  </a>
                                )}
                            </span>
                          </Descriptions.Item>
                        </Descriptions>
                      </Card>
                      {/* 权限设置 */}
                      <Card size="small" title="权限设置" hoverable={true} type={'inner'}>
                        <Descriptions size="small" column={1}>
                          <Descriptions.Item label="允许评论">
                            <Badge
                              status={currentArticle.allowComment === AllowStatusEnum.ALLOWED ? 'success' : 'default'}
                              text={allowOptions.find((opt) => opt.value === currentArticle.allowComment)?.label}
                            />
                          </Descriptions.Item>
                          <Descriptions.Item label="允许转发">
                            <Badge
                              status={currentArticle.allowForward === AllowStatusEnum.ALLOWED ? 'success' : 'default'}
                              text={allowOptions.find((opt) => opt.value === currentArticle.allowForward)?.label}
                            />
                          </Descriptions.Item>
                        </Descriptions>
                      </Card>
                    </Space>

                    {/* 右侧信息 */}
                    <Space orientation="vertical" size={24}>
                      {/* 时间信息 */}
                      <Card size="small" title="时间信息" hoverable={true} type={'inner'}>
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
                      <Card size="small" title="SEO信息" hoverable={true} type={'inner'}>
                        <div className="space-y-3">
                          <div>
                            <span className="font-medium">SEO标题: </span>
                            <Text ellipsis={{ tooltip: currentArticle.metaTitle }}>
                              {currentArticle.metaTitle || '未设置'}
                            </Text>
                          </div>
                          <div>
                            <span className="font-medium">SEO描述: </span>
                            <Text ellipsis={{ tooltip: currentArticle.metaDescription }}>
                              {currentArticle.metaDescription || '未设置'}
                            </Text>
                          </div>
                          <div>
                            <span className="font-medium">SEO关键词: </span>
                            <Text ellipsis={{ tooltip: currentArticle.metaKeywords }}>
                              {currentArticle.metaKeywords || '未设置'}
                            </Text>
                          </div>
                        </div>
                      </Card>

                      {/* 统计信息 */}
                      <Card size="small" title="统计信息" hoverable={true} type={'inner'}>
                        <Descriptions size="small" column={2}>
                          <Descriptions.Item label="阅读量">{currentArticle.readCount}</Descriptions.Item>
                          <Descriptions.Item label="点赞数">{currentArticle.likeCount}</Descriptions.Item>
                          <Descriptions.Item label="评论数">{currentArticle.commentCount}</Descriptions.Item>
                          <Descriptions.Item label="收藏数">{currentArticle.collectionCount}</Descriptions.Item>
                          <Descriptions.Item label="分享数">{currentArticle.shareCount}</Descriptions.Item>
                        </Descriptions>
                      </Card>
                    </Space>
                  </div>
                </div>
              </TabPane>

              {/* 文章内容 */}
              <TabPane tab="文章内容" key="content">
                <div className="h-[500px] overflow-y-auto px-2">
                  <Card>
                    {currentArticle.coverImage && (
                      <div className="mb-6">
                        <img
                          src={currentArticle.coverImage}
                          alt="封面图"
                          className="w-full h-auto max-h-64 object-cover rounded"
                        />
                      </div>
                    )}
                    <div className="mb-6">
                      <span className="text-base font-semibold mr-2">摘要:</span>
                      <Text className="text-gray-600 text-xs font-serif">{currentArticle.summary || '无摘要'}</Text>
                    </div>
                    <Divider />
                    <div>
                      <div className="text-base font-semibold mb-2">正文:</div>
                      <div
                        className="prose max-w-none"
                        dangerouslySetInnerHTML={{
                          __html: currentArticle.content || currentArticle.contentHtml || '<p>无内容</p>'
                        }}
                      />
                    </div>
                  </Card>
                </div>
              </TabPane>
            </Tabs>
          </div>
        )}
      </Modal>

      {/* 审核拒绝模态框 */}
      <Modal
        title="审核拒绝"
        open={rejectModalVisible}
        onOk={handleRejectArticle}
        onCancel={() => {
          setRejectModalVisible(false);
          rejectForm.resetFields();
        }}
        width={500}
        okText="确定拒绝"
        cancelText="取消"
        style={{
          borderRadius: '12px',
          boxShadow: '0 12px 40px rgba(0, 0, 0, 0.12)'
        }}
      >
        <Form form={rejectForm} layout="vertical">
          <Form.Item
            name="rejectReason"
            label="拒绝原因"
            rules={[
              { required: true, message: '请输入拒绝原因' },
              {
                min: 5,
                message: '拒绝原因至少5个字符'
              }
            ]}
          >
            <Input.TextArea rows={4} placeholder="请详细说明拒绝原因，以便作者改进" className="resize-none" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};
export default AdminArticles;
