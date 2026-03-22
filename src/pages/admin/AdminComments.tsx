import React, { useState, useEffect, useCallback } from 'react';
import { Card, Table, Input, Button, Space, Tag, Modal, Form, Select, message, Typography, Checkbox } from 'antd';
import {
    SearchOutlined,
    DeleteOutlined,
    EyeOutlined,
    EditOutlined,
    CalendarOutlined,
    UserOutlined,
    CheckCircleOutlined,
    CloseCircleOutlined,
    FileTextOutlined,
    DownOutlined
} from '@ant-design/icons';
import { Dropdown } from 'antd';
import commentService from '../../services/commentService';
import { CommentStatusEnum, CommentStatusMap, CommentTopStatus, CommentTopMap } from '../../types/enums';
import { formatDateTimeShort } from '../../utils';
import type { AdminArticleCommentList } from '../../types/comment';
import { ROUTES } from '../../constants/routes';

const { Option } = Select;
const { Search } = Input;
const { Text } = Typography;
// 状态选项
const statusOptions = Object.entries(CommentStatusMap).map(([value, label]) => ({
    value,
    label
}));
const AdminComments: React.FC = () => {
    const [comments, setComments] = useState<AdminArticleCommentList[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [selectedStatus, setSelectedStatus] = useState<CommentStatusEnum | undefined>();
    const [selectedArticleId, setSelectedArticleId] = useState('');
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isViewModalVisible, setIsViewModalVisible] = useState(false);
    const [currentComment, setCurrentComment] = useState<AdminArticleCommentList | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [form] = Form.useForm();
    const [pagination, setPagination] = useState({
        pageNum: 1,
        pageSize: 10,
        total: 0
    });
    const [isRejectModalVisible, setIsRejectModalVisible] = useState(false);
    const [currentReviewCommentId, setCurrentReviewCommentId] = useState<number | null>(null);
    const [rejectReason, setRejectReason] = useState('');
    // 获取评论列表
    const fetchComments = useCallback(async (pageNum: number = 1, pageSize: number = 10): Promise<void> => {
        setLoading(true);
        try {
            const response = await commentService.admin.getCommentsByPage({
                pageNum: pageNum,
                pageSize: pageSize,
                keyword: searchText,
                articleId: selectedArticleId ? parseInt(selectedArticleId) : undefined,
                status: selectedStatus
            });
            if (response.code === 200 && response.data) {
                const commentList = response.data.record.map((comment: AdminArticleCommentList) => ({
                    id: comment.id,
                    parentId: comment.parentId,
                    content: comment.content,
                    floor: comment.floor,
                    reviewStatus: comment.reviewStatus,
                    top: comment.top,
                    topOrder: comment.topOrder,
                    likeCount: comment.likeCount,
                    replyCount: comment.replyCount,
                    createTime: comment.createTime,
                    updateTime: comment.updateTime,
                    userId: comment.userId,
                    nickname: comment.nickname,
                    avatar: comment.avatar,
                    userStatus: comment.userStatus,
                    articleId: comment.articleId,
                    articleTitle: comment.articleTitle
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
    }, [searchText, selectedStatus, selectedArticleId]);
    // 搜索和筛选评论
    const handleSearch = (value: string): void => {
        setSearchText(value);
        setPagination(prev => ({ ...prev, pageNum: 1 }));
    };
    const handleStatusChange = (value: CommentStatusEnum): void => {
        setSelectedStatus(value);
        setPagination(prev => ({ ...prev, pageNum: 1 }));
    };
    const handleArticleChange = (value: string): void => {
        setSelectedArticleId(value);
        setPagination(prev => ({ ...prev, pageNum: 1 }));
    };
    // 当搜索条件变化时获取评论列表
    useEffect(() => {
        const loadData = async (): Promise<void> => {
            await fetchComments();
        };
        void loadData();
    }, [fetchComments, searchText, selectedStatus, selectedArticleId]);
    // 打开编辑评论模态框
    const handleEditComment = (comment: AdminArticleCommentList): void => {
        setIsEditing(true);
        setCurrentComment(comment);
        form.setFieldsValue({
            content: comment.content,
            reviewStatus: comment.reviewStatus,
            top: comment.top
        });
        setIsModalVisible(true);
    };
    // 打开查看评论模态框
    const handleViewComment = (comment: AdminArticleCommentList): void => {
        setCurrentComment(comment);
        setIsViewModalVisible(true);
    };
    // 删除评论
    const handleDeleteComment = async (id: number): Promise<void> => {
        try {
            const response = await commentService.admin.deleteComment(id);
            if (response.code === 200) {
                message.success(response.message || '评论删除成功');
                await fetchComments(pagination.pageNum, pagination.pageSize);
            } else {
                message.error(response.message || '删除评论失败');
            }
        } catch (error) {
            console.error('删除评论失败:', error);
            message.error('删除评论失败');
        }
    };
    // 更新评论置顶状态
    const handleUpdateTop = async (id: number, shouldTop: boolean): Promise<void> => {
        try {
            const top = shouldTop ? CommentTopStatus.TOP : CommentTopStatus.NOT_TOP;
            const response = await commentService.admin.updateCommentTop(id, top);
            if (response.code === 200) {
                message.success(shouldTop ? '评论置顶成功' : '取消评论置顶成功');
                await fetchComments(pagination.pageNum, pagination.pageSize);
            } else {
                message.error('更新评论置顶状态失败');
            }
        } catch (error) {
            console.error('更新评论置顶状态失败:', error);
            message.error('更新评论置顶状态失败');
        }
    };
    // 审核评论通过
    const handleApproveComment = async (id: number): Promise<void> => {
        try {
            const response = await commentService.admin.updateCommentStatus(id, CommentStatusEnum.APPROVED);
            if (response.code === 200) {
                message.success(response.message || '评论审核通过');
                await fetchComments(pagination.pageNum, pagination.pageSize);
            } else {
                message.error(response.message || '评论审核失败');
            }
        } catch (error) {
            console.error('评论审核失败:', error);
            message.error('评论审核失败');
        }
    };
    // 打开拒绝评论模态框
    const handleOpenRejectModal = (id: number): void => {
        setCurrentReviewCommentId(id);
        setRejectReason('');
        setIsRejectModalVisible(true);
    };
    // 审核评论拒绝
    const handleRejectComment = async (): Promise<void> => {
        if (!currentReviewCommentId) return;
        try {
            const response = await commentService.admin.updateCommentStatus(currentReviewCommentId, CommentStatusEnum.REJECTED, rejectReason);
            if (response.code === 200) {
                message.success(response.message || '评论审核[拒绝] - 成功');
                await fetchComments(pagination.pageNum, pagination.pageSize);
                setIsRejectModalVisible(false);
                setCurrentReviewCommentId(null);
                setRejectReason('');
            } else {
                message.error(response.message || '评论审核[拒绝] - 失败');
            }
        } catch (error) {
            console.error('评论审核失败:', error);
            message.error('评论审核失败');
        }
    };
    // 保存评论
    const handleSaveComment = async (): Promise<void> => {
        form.validateFields().then(async values => {
            if (isEditing && currentComment) {
                // 更新评论相关
                const response = await commentService.admin.updateComment(currentComment.id, values.content, values.top, values.reviewStatus, values.reviewReason);
                if (response.code === 200) {
                    message.success(response.message || '评论更新成功');
                    await fetchComments(pagination.pageNum, pagination.pageSize);
                } else {
                    message.error(response.message || '评论状态更新失败');
                }
            }
            setIsModalVisible(false);
        }).catch(error => {
            console.error('验证失败:', error);
        });
    };
    // 获取状态标签颜色
    const getStatusColor = (status: string): string => {
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
            render: (_: unknown, __: unknown, index: number): number => (pagination.pageNum - 1) * pagination.pageSize + index + 1
        },
        {
            title: '内容',
            dataIndex: 'content',
            key: 'content',
            width: 300,
            render: (text: string, record: AdminArticleCommentList): React.ReactNode => (
                <div style={{ width: '100%', maxWidth: '300px' }}>
                    <Text
                        ellipsis={{ tooltip: text }}
                        className="font-medium cursor-pointer hover:underline hover:text-blue-600 block whitespace-nowrap overflow-hidden text-ellipsis"
                        onClick={() => handleViewComment(record)}
                    >
                        {text}
                    </Text>
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
            title: '文章标题',
            dataIndex: 'articleTitle',
            key: 'articleTitle',
            width: 240,
            render: (text: string, record: AdminArticleCommentList): React.ReactNode => (
                <div style={{ width: '100%', maxWidth: '240px' }}>
                    <a
                        href={ROUTES.ARTICLE_DETAIL(record.articleId)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-700 hover:text-blue-500 hover:underline block whitespace-nowrap overflow-hidden text-ellipsis"
                        style={{ maxWidth: '100%' }}
                        title={text}
                    >
                        {text}
                    </a>
                </div>
            )
        },
        {
            title: '审核状态',
            dataIndex: 'reviewStatus',
            key: 'reviewStatus',
            width: 100,
            render: (reviewStatus: CommentStatusEnum): React.ReactNode => (
                <Tag color={getStatusColor(reviewStatus)}>
                    {CommentStatusMap[reviewStatus] || reviewStatus}
                </Tag>
            )
        },
        {
            title: '置顶',
            dataIndex: 'top',
            key: 'top',
            width: 80,
            render: (top: CommentTopStatus): React.ReactNode => (
                <Tag color={top === CommentTopStatus.TOP ? 'red' : 'default'}>
                    {top === CommentTopStatus.TOP ? CommentTopMap[CommentTopStatus.TOP] : CommentTopMap[CommentTopStatus.NOT_TOP]}
                </Tag>
            )
        },
        {
            title: '点赞数',
            align: 'center' as const,
            dataIndex: 'likeCount',
            key: 'likeCount',
            width: 80
        },
        {
            title: '创建时间',
            dataIndex: 'createTime',
            key: 'createTime',
            align: 'center' as const,
            width: 180,
            render: (publishTime: string): React.ReactNode => (
                formatDateTimeShort(publishTime)
            )
        },
        {
            title: '操作',
            key: 'action',
            align: 'center' as const,
            width: 240,
            render: (_: unknown, record: AdminArticleCommentList): React.ReactNode => (
                <Space size="middle">
                    <Button
                        variant={'filled'}
                        color={'green'}
                        icon={<EyeOutlined/>}
                        onClick={() => handleViewComment(record)}
                        className="text-blue-500"
                    >
                        查看
                    </Button>
                    <Dropdown menu={{
                        items: [
                            {
                                key: 'approve',
                                label: (
                                    <span onClick={() => handleApproveComment(record.id)}>
                                        <CheckCircleOutlined className="mr-2"/> 通过
                                    </span>
                                )
                            },
                            {
                                key: 'reject',
                                label: (
                                    <span onClick={() => handleOpenRejectModal(record.id)} className="text-red-500">
                                        <CloseCircleOutlined className="mr-2"/> 拒绝
                                    </span>
                                )
                            }
                        ]
                    }}>
                        <Button
                            variant={'filled'}
                            color={'orange'}
                            icon={<CheckCircleOutlined/>}
                            className="text-orange-500"
                        >
                            审核
                        </Button>
                    </Dropdown>
                    <Dropdown menu={{
                        items: [
                            {
                                key: 'edit',
                                label: (
                                    <span onClick={() => handleEditComment(record)}>
                                        <EditOutlined className="mr-2"/> 编辑
                                    </span>
                                )
                            },
                            {
                                key: 'delete',
                                label: (
                                    <span onClick={() => handleDeleteComment(record.id)} className="text-red-500">
                                        <DeleteOutlined className="mr-2"/> 删除
                                    </span>
                                )
                            },
                            {
                                key: 'top',
                                label: (
                                    <span
                                        onClick={() => handleUpdateTop(record.id, record.top !== CommentTopStatus.TOP)}>
                                        {record.top === CommentTopStatus.TOP ? (
                                            <>
                                                <CloseCircleOutlined className="mr-2"/> 取消置顶
                                            </>
                                        ) : (
                                            <>
                                                <CheckCircleOutlined className="mr-2"/> 置顶
                                            </>
                                        )}
                                    </span>
                                )
                            }
                        ]
                    }}>
                        <Button
                            variant={'filled'}
                            color={'default'}
                            icon={<DownOutlined/>}
                        >
                            更多
                        </Button>
                    </Dropdown>
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
                        placement: ['bottomCenter'],
                        pageSizeOptions: ['10', '20', '50'],
                        pageSize: pagination.pageSize,
                        current: pagination.pageNum,
                        total: pagination.total,
                        showTotal: (total) => `共 ${total} 条评论`,
                        onChange: (pageNum, pageSize) => {
                            setPagination(prev => ({
                                ...prev,
                                pageNum: pageNum,
                                pageSize: pageSize
                            }));
                            void fetchComments(pageNum, pageSize);
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
                        reviewStatus: 'approved',
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

                    <div className="flex gap-4">
                        <Form.Item
                            layout="horizontal"
                            name="reviewStatus"
                            label="审核状态"
                            rules={[{ required: true, message: '请选择状态' }]}
                            style={{ flex: 1 }}
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
                            valuePropName="checked"
                            style={{ flex: 1, textAlign: 'center' }}
                        >
                            <Checkbox>置顶</Checkbox>
                        </Form.Item>
                    </div>
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
                            <Text className="text-gray-600">
                                {currentComment.content}
                            </Text>
                        </div>
                        <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-4">
              <span className="flex items-center gap-1">
                <UserOutlined/> {currentComment.nickname}
              </span>
                            <span className="flex items-center gap-1">
                <FileTextOutlined/> {currentComment.articleTitle}
              </span>
                            <span className="flex items-center gap-1">
                <CalendarOutlined/> {formatDateTimeShort(currentComment.createTime)}
              </span>
                            <Tag color={getStatusColor(currentComment.reviewStatus)}>
                                {CommentStatusMap[currentComment.reviewStatus] || currentComment.reviewStatus}
                            </Tag>
                            <Tag color={currentComment.top === CommentTopStatus.TOP ? 'red' : 'default'}>
                                {currentComment.top === CommentTopStatus.TOP ? CommentTopMap[CommentTopStatus.TOP] : CommentTopMap[CommentTopStatus.NOT_TOP]}
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

            {/* 拒绝评论模态框 */}
            <Modal
                title="拒绝评论"
                open={isRejectModalVisible}
                onOk={handleRejectComment}
                onCancel={() => setIsRejectModalVisible(false)}
                width={500}
                okText="确定"
                cancelText="取消"
            >
                <Form
                    layout="vertical"
                >
                    <Form.Item
                        label="拒绝理由"
                        rules={[
                            { required: true, message: '请输入拒绝理由' },
                            { min: 1, max: 200, message: '拒绝理由长度应在1-200个字符之间' }
                        ]}
                    >
                        <Input.TextArea
                            rows={4}
                            placeholder="请输入拒绝理由"
                            value={rejectReason}
                            onChange={(e) => setRejectReason(e.target.value)}
                        />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};
export default AdminComments;
