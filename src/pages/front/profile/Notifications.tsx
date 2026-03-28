import React, { useState, useEffect, useCallback } from 'react';
import { Card, Button, Empty, message, Select, Spin, Badge } from 'antd';
import { CheckOutlined, DeleteOutlined, FilterOutlined, BellOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import notificationService from '../../../services/notificationService';
import { type Notification } from '../../../types/notification';
import websocketService from '../../../services/websocketService';
import { NotificationType, NotificationTypeMap, ReadStatus } from '../../../types/enums';
import { formatTimeShort } from '../../../utils';
import InfiniteScrollContainer from '../../../components/common/InfiniteScrollContainer';
import { useInfiniteScroll } from '../../../hooks';
import type { ApiPageResponse } from '../../../types/common';

const Notifications: React.FC = () => {
    const navigate = useNavigate();
    const [selectedType, setSelectedType] = useState<string>('all');
    const [unreadCount, setUnreadCount] = useState<number>(0);
    const notificationTypes = [
        { value: 'all', label: '全部类型' },
        { value: 'SYSTEM', label: NotificationTypeMap[NotificationType.SYSTEM] },
        { value: 'ARTICLE_PUBLISH', label: NotificationTypeMap[NotificationType.ARTICLE_PUBLISH] },
        { value: 'ARTICLE_LIKE', label: NotificationTypeMap[NotificationType.ARTICLE_LIKE] },
        { value: 'ARTICLE_COLLECTION', label: NotificationTypeMap[NotificationType.ARTICLE_COLLECTION] },
        { value: 'ARTICLE_COMMENT', label: NotificationTypeMap[NotificationType.ARTICLE_COMMENT] },
        { value: 'COMMENT_REPLY', label: NotificationTypeMap[NotificationType.COMMENT_REPLY] },
        { value: 'COMMENT_LIKE', label: NotificationTypeMap[NotificationType.COMMENT_LIKE] },
        { value: 'FOLLOW', label: NotificationTypeMap[NotificationType.FOLLOW] },
        { value: 'MESSAGE', label: NotificationTypeMap[NotificationType.MESSAGE] },
        { value: 'REPORT', label: NotificationTypeMap[NotificationType.REPORT] },
        { value: 'FEEDBACK', label: NotificationTypeMap[NotificationType.FEEDBACK] }
    ];
    // 获取未读通知数量
    const fetchUnreadCount = useCallback(async () => {
        try {
            const response = await notificationService.getUnreadCount();
            if (response.code === 200) {
                setUnreadCount(response.data);
            }
        } catch (err) {
            console.error('获取未读通知数量失败:', err);
        }
    }, []);
    // 通知列表无限滚动fetcher
    const notificationsFetcher = useCallback(async (pageNum: number, pageSize: number): Promise<ApiPageResponse<Notification>> => {
        const type = selectedType === 'all' ? undefined : NotificationType[selectedType as keyof typeof NotificationType];
        const response = await notificationService.getNotificationList(type, pageNum, pageSize);
        if (response.code !== 200) {
            throw new Error(response.message || '获取通知列表失败');
        }
        // 转换后端数据格式
        const record = response.data.record || [];
        const formattedNotifications = record.map((item: {
            id: number;
            type: NotificationType;
            title: string;
            content: string;
            createTime: string;
            readStatus: ReadStatus;
            relatedId: number;
            actionUrl: string
        }) => ({
            id: item.id,
            type: item.type,
            title: item.title,
            content: item.content,
            createTime: item.createTime,
            readStatus: item.readStatus,
            relatedId: item.relatedId,
            actionUrl: item.actionUrl
        }));
        // 更新未读数量
        await fetchUnreadCount();
        return {
            record: formattedNotifications,
            total: response.data.total || 0,
            pageNum: response.data.pageNum || pageNum,
            pageSize: response.data.pageSize || pageSize,
            pages: response.data.pages || 0,
            isFirstPage: response.data.isFirstPage || pageNum === 1,
            isLastPage: response.data.isLastPage || false,
            prePage: response.data.prePage || pageNum - 1,
            nextPage: response.data.nextPage || pageNum + 1
        };
    }, [selectedType, fetchUnreadCount]);
    // 使用无限滚动hook
    const {
        data: notifications,
        isLoading,
        isLoadingMore,
        isError,
        error,
        hasMore,
        loadMoreRef,
        refresh: refreshNotifications
    } = useInfiniteScroll<Notification>(notificationsFetcher, {
        pageSize: 10,
        threshold: 0.1
    });
    // 标记通知为已读
    const markAsRead = async (id: number): Promise<void> => {
        try {
            const response = await notificationService.markAsRead(id);
            if (response.code === 200 && response.data) {
                // 乐观更新
                // 这里可以通过refreshNotifications()来刷新数据
                message.success('已标记为已读');
                // 更新未读数量
                await fetchUnreadCount();
            } else {
                message.error(response.message || '标记已读失败');
            }
        } catch (err) {
            message.error('网络错误，请稍后重试');
            console.error('标记已读失败:', err);
        }
    };
    // 标记所有通知为已读
    const markAllAsRead = async (): Promise<void> => {
        try {
            const response = await notificationService.markAllAsRead();
            if (response.code === 200 && response.data) {
                message.success('已全部标记为已读');
                // 更新未读数量
                setUnreadCount(0);
            } else {
                message.error(response.message || '标记全部已读失败');
            }
        } catch (err) {
            message.error('网络错误，请稍后重试');
            console.error('标记全部已读失败:', err);
        }
    };
    // 删除通知
    const deleteNotification = async (id: number): Promise<void> => {
        try {
            const response = await notificationService.deleteNotification(id);
            if (response.code === 200 && response.data) {
                message.success('通知已删除');
                // 更新未读数量
                await fetchUnreadCount();
            } else {
                message.error(response.message || '删除通知失败');
            }
        } catch (err) {
            message.error('网络错误，请稍后重试');
            console.error('删除通知失败:', err);
        }
    };
    // 处理通知点击
    const handleNotificationClick = (notification: Notification): void => {
        if (!notification.readStatus) {
            (async (): Promise<void> => {
                await markAsRead(notification.id);
            })();
        }
        if (notification.actionUrl) {
            navigate(notification.actionUrl);
        }
    };
    // 当选中类型变化时刷新通知列表
    useEffect(() => {
        refreshNotifications();
    }, [selectedType, refreshNotifications]);
    // 初始加载未读数量
    useEffect(() => {
        // 监听WebSocket消息
        const handleNotification = (data: unknown): void => {
            console.log('收到新通知:', data);
            // 重新获取通知列表
            refreshNotifications();
        };
        const handleUnreadCount = (data: unknown): void => {
            console.log('未读通知数量更新:', data);
            if (typeof data === 'number') {
                setUnreadCount(data);
            }
        };
        // 注册事件监听器
        websocketService.on('notification', handleNotification);
        websocketService.on('unreadCount', handleUnreadCount);
        // 清理事件监听器
        return (): void => {
            websocketService.off('notification', handleNotification);
            websocketService.off('unreadCount', handleUnreadCount);
        };
    }, [refreshNotifications]);
    // 渲染通知项
    const renderNotificationItem = (notification: Notification): React.ReactNode => (
        <Card
            key={notification.id}
            variant="borderless"
            styles={{
                body: {
                    padding: '12px 20px',
                    borderBottom: '1px solid #e8e8e8',
                    borderRadius: 0,
                    backgroundColor: !notification.readStatus ? 'rgba(239, 246, 255, 0.6)' : 'white',
                    transition: 'background-color 0.3s ease'
                }
            }}
            className="hover:bg-gray-50 transition-colors"
        >
            <div className="flex items-start gap-4">
                {/* 通知内容 */}
                <div className="flex-1 min-w-0">
                    {/* 第一行：标题和时间 */}
                    <div className="flex items-center mb-2">
                        <h3 className="text-lg font-semibold text-secondary-800 hover:text-primary-600 transition-colors duration-200 cursor-pointer"
                            onClick={() => handleNotificationClick(notification)}>
                            {notification.title}
                        </h3>
                        <span
                            className="text-sm text-secondary-500 ml-2">{formatTimeShort(notification.createTime)}</span>
                    </div>

                    {/* 第二行：内容 */}
                    <p className="text-secondary-600 mb-2 line-clamp-2 cursor-pointer"
                       onClick={() => handleNotificationClick(notification)}>
                        {notification.content}
                    </p>

                    {/* 操作按钮 */}
                    <div className="flex items-center justify-end space-x-2">
                        {!notification.readStatus && (
                            <Button
                                type="link"
                                icon={<CheckOutlined/>}
                                onClick={() => markAsRead(notification.id)}
                            >
                                标为已读
                            </Button>
                        )}
                        <Button
                            type="link"
                            danger
                            icon={<DeleteOutlined/>}
                            onClick={() => deleteNotification(notification.id)}
                        >
                            删除
                        </Button>
                    </div>
                </div>
            </div>
        </Card>
    );
    return (
        <div className="mx-auto">
            {/* 页面标题和操作区域 */}
            <div className="border-b border-gray-200 flex flex-wrap justify-between items-center pb-4 mb-6">
                {/* 左侧：通知中心和数量 */}
                <div className="flex items-center gap-2">
                    <h1 className="text-2xl font-bold text-secondary-800">通知中心</h1>
                    <div>({notifications.length})</div>
                    {unreadCount > 0 && (
                        <Badge count={unreadCount} className="ml-2">
                            <BellOutlined style={{ fontSize: 24, color: '#1677ff' }}/>
                        </Badge>
                    )}
                </div>

                {/* 右侧：消息类别和全部已读按钮 */}
                <div className="flex items-center gap-4">
                    <Select
                        value={selectedType}
                        onChange={setSelectedType}
                        options={notificationTypes}
                        style={{ width: 140 }}
                        size="large"
                        variant="outlined"
                        prefix={<FilterOutlined className="text-gray-300"/>}
                    />
                    <Button
                        type="primary"
                        variant="text"
                        size="large"
                        onClick={markAllAsRead}
                        disabled={unreadCount === 0}
                    >
                        全部已读
                    </Button>
                </div>
            </div>

            {/* 消息列表 - 无限滚动 */}
            <InfiniteScrollContainer
                infiniteScroll={{
                    data: notifications,
                    isLoading,
                    isLoadingMore,
                    isError,
                    error,
                    hasMore,
                    loadMoreRef,
                    refresh: refreshNotifications,
                    total: 0,
                    pageSize: 0,
                    setPageSize: async () => {
                    }
                }}
                renderItem={renderNotificationItem}
                loadingContent={
                    <div className="py-12 flex justify-center">
                        <Spin size="large" tip="加载中..."/>
                    </div>
                }
                emptyContent={
                    <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl shadow-sm">
                        <Empty
                            image={Empty.PRESENTED_IMAGE_SIMPLE}
                            description="暂无通知"
                            className="py-8"
                        />
                    </div>
                }
                noMoreText="已经到底了，没有更多通知了"
                itemGap="16px"
                loadingMoreContent={
                    <div className="py-6 flex justify-center">
                        <Spin size="small" tip="加载更多通知..."/>
                    </div>
                }
            />
        </div>
    );
};
export default Notifications;
