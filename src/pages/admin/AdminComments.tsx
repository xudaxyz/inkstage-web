import React, { useState, useEffect, useCallback } from 'react';
import { Card, Table, Input, Button, Space, Tag, Modal, Form, Select, message, Typography } from 'antd';
import {
  SearchOutlined,
  DeleteOutlined,
  EyeOutlined,
  EditOutlined,
  CalendarOutlined,
  UserOutlined,
  MessageOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined
} from '@ant-design/icons';
import commentService from '../../services/commentService';
import { CommentStatusEnum, CommentStatusMap, CommentTopStatus, CommentTopMap } from '../../types/enums/CommentEnum';

const { Option } = Select;
const { Search } = Input;
const { Title, Text } = Typography;

// 评论类型定义
interface Comment {
    id: number;
    content: string;
    authorName: string;
    articleTitle: string;
    status: string;
    top: CommentTopStatus;
    likeCount: number;
    createTime: string;
    updateTime: string;
}

// 状态选项
const statusOptions = Object.entries(CommentStatusMap).map(([value, label]) => ({
  value,
  label
}));

const AdminComments: React.FC = () => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<CommentStatusEnum | undefined>();
  const [selectedArticleId, setSelectedArticleId] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isViewModalVisible, setIsViewModalVisible] = useState(false);
  const [currentComment, setCurrentComment] = useState<Comment | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [form] = Form.useForm();
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  });

  // 获取评论列表
  const fetchComments = useCallback(async () => {
    setLoading(true);
    try {
      const response = await commentService.admin.getCommentsByPage({
        page: pagination.current,
        pageSize: pagination.pageSize,
        keyword: searchText,
        articleId: selectedArticleId ? parseInt(selectedArticleId) : undefined,
        status: selectedStatus
      });

      if (response.code === 200 && response.data) {
        const commentList = response.data.record.map((comment: {
                    id: number;
                    content: string;
                    authorName?: string;
                    articleTitle?: string;
                    status: string;
                    top: CommentTopStatus;
                    likeCount?: number;
                    createTime?: string;
                    updateTime?: string;
                }) => ({
          id: comment.id,
          content: comment.content,
          authorName: comment.authorName || '',
          articleTitle: comment.articleTitle || '',
          status: comment.status,
          top: comment.top,
          likeCount: comment.likeCount || 0,
          createTime: comment.createTime || '',
          updateTime: comment.updateTime || ''
        }));

        setComments(commentList);
        setPagination(prev => ({
          ...prev,
          total: response.data.total
        }));
      } else {
        message.error('获取评论列表失败');
      }
    } catch (error) {
      console.error('获取评论列表失败:', error);
      message.error('获取评论列表失败');
    } finally {
      setLoading(false);
    }
  }, [pagination, searchText, selectedStatus, selectedArticleId]);

  // 搜索和筛选评论
  const handleSearch = (value: string) => {
    setSearchText(value);
    setPagination(prev => ({ ...prev, current: 1 }));
    fetchComments();
  };

  const handleStatusChange = (value: CommentStatusEnum) => {
    setSelectedStatus(value);
    setPagination(prev => ({ ...prev, current: 1 }));
    fetchComments();
  };

  const handleArticleChange = (value: string) => {
    setSelectedArticleId(value);
    setPagination(prev => ({ ...prev, current: 1 }));
    fetchComments();
  };

  // 组件挂载时获取评论列表
  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  // 打开编辑评论模态框
  const handleEditComment = (comment: Comment) => {
    setIsEditing(true);
    setCurrentComment(comment);
    form.setFieldsValue({
      content: comment.content,
      status: comment.status,
      top: comment.top
    });
    setIsModalVisible(true);
  };

  // 打开查看评论模态框
  const handleViewComment = (comment: Comment) => {
    setCurrentComment(comment);
    setIsViewModalVisible(true);
  };

  // 删除评论
  const handleDeleteComment = async (id: number) => {
    try {
      const response = await commentService.admin.deleteComment(id);
      if (response.code === 200) {
        message.success('评论删除成功');
        fetchComments();
      } else {
        message.error('删除评论失败');
      }
    } catch (error) {
      console.error('删除评论失败:', error);
      message.error('删除评论失败');
    }
  };

  // 更新评论置顶状态
  const handleUpdateTop = async (id: number, top: boolean) => {
    try {
      const response = await commentService.admin.updateCommentTop(id, top ? CommentTopStatus.TOP : CommentTopStatus.NOT_TOP);
      if (response.code === 200) {
        message.success(top ? '评论置顶成功' : '取消评论置顶成功');
        fetchComments();
      } else {
        message.error('更新评论置顶状态失败');
      }
    } catch (error) {
      console.error('更新评论置顶状态失败:', error);
      message.error('更新评论置顶状态失败');
    }
  };

  // 保存评论
  const handleSaveComment = () => {
    form.validateFields().then(values => {
      if (isEditing && currentComment) {
        // 编辑现有评论
        const updatedComments = comments.map(comment =>
          comment.id === currentComment.id ? {
            ...comment,
            ...values,
            updatedAt: new Date().toISOString().split('T')[0]
          } : comment
        );
        setComments(updatedComments);
        message.success('评论更新成功');
      }
      setIsModalVisible(false);
    }).catch(error => {
      console.error('验证失败:', error);
    });
  };

  // 获取状态标签颜色
  const getStatusColor = (status: string) => {
    switch (status) {
      case CommentStatusEnum.APPROVED:
        return 'green';
      case CommentStatusEnum.PENDING:
        return 'blue';
      case CommentStatusEnum.REJECTED:
        return 'red';
      case CommentStatusEnum.DISABLED:
        return 'gray';
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
      render: (_: unknown, __: unknown, index: number) => index + 1
    },
    {
      title: '内容',
      dataIndex: 'content',
      key: 'content',
      render: (text: string) => <Text ellipsis={{ tooltip: text }} className="font-medium">{text}</Text>
    },
    {
      title: '作者',
      dataIndex: 'author',
      key: 'author',
      width: 100
    },
    {
      title: '文章',
      dataIndex: 'article',
      key: 'article',
      width: 150,
      render: (text: string) => <Text ellipsis={{ tooltip: text }}>{text}</Text>
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string) => (
        <Tag color={getStatusColor(status)}>
          {CommentStatusMap[status as keyof typeof CommentStatusMap] || status}
        </Tag>
      )
    },
    {
      title: '置顶',
      dataIndex: 'top',
      key: 'top',
      width: 80,
      render: (top: boolean) => (
        <Tag color={top ? 'red' : 'default'}>
          {top ? CommentTopMap[CommentTopStatus.TOP] : CommentTopMap[CommentTopStatus.NOT_TOP]}
        </Tag>
      )
    },
    {
      title: '点赞数',
      dataIndex: 'likes',
      key: 'likes',
      width: 80
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
      width: 250,
      render: (_: unknown, record: Comment) => (
        <Space size="middle">
          <Button
            type="text"
            icon={<EyeOutlined/>}
            onClick={() => handleViewComment(record)}
            className="text-blue-500"
          >
                        查看
          </Button>
          <Button
            type="text"
            icon={<EditOutlined/>}
            onClick={() => handleEditComment(record)}
            className="text-green-500"
          >
                        编辑
          </Button>
          <Button
            type="text"
            icon={<DeleteOutlined/>}
            onClick={() => handleDeleteComment(record.id)}
            className="text-red-500"
          >
                        删除
          </Button>
          <Button
            type="text"
            icon={record.top ? <CloseCircleOutlined/> : <CheckCircleOutlined/>}
            onClick={() => handleUpdateTop(record.id, !record.top)}
            className={record.top ? 'text-gray-500' : 'text-red-500'}
          >
            {record.top ? '取消置顶' : '置顶'}
          </Button>
        </Space>
      )
    }
  ];

  return (
    <div className="mb-6">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">评论管理</h2>
      </div>

      {/* 搜索和筛选 */}
      <Card className="mb-6 border border-gray-100 shadow-sm">
        <div className="flex flex-col md:flex-row gap-4">
          <Search
            placeholder="搜索评论内容或作者"
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
            placeholder="按文章筛选"
            allowClear
            style={{ width: 150 }}
            onChange={handleArticleChange}
          >
            {/* 这里可以动态加载文章列表，暂时留空 */}
          </Select>
        </div>
      </Card>

      {/* 评论列表 */}
      <Card className="border border-gray-100 shadow-sm">
        <Table
          columns={columns}
          dataSource={comments}
          rowKey="id"
          loading={loading}
          pagination={{
            showSizeChanger: true,
            pageSizeOptions: ['10', '20', '50'],
            pageSize: pagination.pageSize,
            current: pagination.current,
            total: pagination.total,
            showTotal: (total) => `共 ${total} 条评论`,
            onChange: (page, pageSize) => {
              setPagination(prev => ({
                ...prev,
                current: page,
                pageSize: pageSize
              }));
              fetchComments();
            }
          }}
        />
      </Card>

      {/* 添加/编辑评论模态框 */}
      <Modal
        title={isEditing ? '编辑评论' : '添加评论'}
        open={isModalVisible}
        onOk={handleSaveComment}
        onCancel={() => setIsModalVisible(false)}
        width={600}
        okText="保存"
        cancelText="取消"
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            status: 'approved',
            top: false
          }}
        >
          <Form.Item
            name="content"
            label="评论内容"
            rules={[
              { required: true, message: '请输入评论内容' },
              { min: 1, max: 500, message: '评论内容长度应在1-500个字符之间' }
            ]}
          >
            <Input.TextArea rows={4} placeholder="请输入评论内容"/>
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

          <Form.Item
            name="top"
            label="置顶"
            valuePropName="checked"
          >
          </Form.Item>
        </Form>
      </Modal>

      {/* 查看评论模态框 */}
      <Modal
        title="评论详情"
        open={isViewModalVisible}
        onCancel={() => setIsViewModalVisible(false)}
        width={800}
        footer={[
          <Button key="close" onClick={() => setIsViewModalVisible(false)}>
                        关闭
          </Button>
        ]}
      >
        {currentComment && (
          <div className="space-y-6">
            <div>
              <Title level={4}>评论内容</Title>
              <Text className="text-gray-600">
                {currentComment.content}
              </Text>
            </div>
            <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-4">
              <span className="flex items-center gap-1">
                <UserOutlined/> {currentComment.authorName}
              </span>
              <span className="flex items-center gap-1">
                <MessageOutlined/> {currentComment.articleTitle}
              </span>
              <span className="flex items-center gap-1">
                <CalendarOutlined/> {currentComment.createTime}
              </span>
              <Tag color={getStatusColor(currentComment.status)}>
                {CommentStatusMap[currentComment.status as keyof typeof CommentStatusMap] || currentComment.status}
              </Tag>
              <Tag color={currentComment.top ? 'red' : 'default'}>
                {currentComment.top ? CommentTopMap[CommentTopStatus.TOP] : CommentTopMap[CommentTopStatus.NOT_TOP]}
              </Tag>
            </div>
            <div className="border-t pt-4">
              <h4 className="font-medium mb-2">统计信息</h4>
              <div className="flex gap-4">
                <span>点赞数: {currentComment.likeCount}</span>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AdminComments;
