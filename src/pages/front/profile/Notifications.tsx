import React, { useCallback, useEffect, useState } from 'react';
import { Badge, Button, Card, Empty, message, Select, Spin } from 'antd';
import { BellOutlined, CheckOutlined, DeleteOutlined, FilterOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import notificationService from '../../../services/notificationService';
import { type Notification } from '../../../types/notification';
import websocketService from '../../../services/websocketService';
import { NotificationType, NotificationTypeMap, ReadStatus } from '../../../types/enums';
import { formatTimeShort } from '../../../utils';
import InfiniteScrollContainer from '../../../components/common/InfiniteScrollContainer';
import { useInfiniteScroll } from '../../../hooks';
import type { ApiPageResponse } from '../../../types/common';
import {
    useDeleteNotification,
    useMarkAllAsRead,
    useMarkAsRead,
    useSetNotifications,
    useSetUnreadCount, useTheme,
    useUnreadCount
} from '../../../store';

const Notifications: React.FC = () => {
    const theme = useTheme();
    const isDarkMode = theme === 'dark';
    const navigate = useNavigate();
    const [selectedType, setSelectedType] = useState<NotificationType>(NotificationType.ALL);
    // 从store获取状态和操作
    const unreadCount = useUnreadCount();
    const markAsReadStore = useMarkAsRead();
    const markAllAsReadStore = useMarkAllAsRead();
    const deleteNotificationStore = useDeleteNotification();
    const setNotificationsStore = useSetNotifications();
    const setUnreadCount = useSetUnreadCount();
    const notificationTypes = [
        { value: 'ALL', label: NotificationTypeMap[NotificationType.ALL] },
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
    // 通知列表无限滚动fetcher
    const notificationsFetcher = useCallback(
        async (pageNum: number, pageSize: number): Promise<ApiPageResponse<Notification>> => {
            const notificationType =
                selectedType === NotificationType.ALL
                    ? undefined
                    : NotificationType[selectedType as keyof typeof NotificationType];
            const response = await notificationService.getNotificationList(notificationType, pageNum, pageSize);
            if (response.code !== 200) {
                throw new Error(response.message || '获取通知列表失败');
            }
            // 转换后端数据格式
            const record = response.data === null ? [] : response.data.record;
            const formattedNotifications = record.map(
                (item: {
                    id: number;
                    notificationType: NotificationType;
                    title: string;
                    content: string;
                    createTime: string;
                    readStatus: ReadStatus;
                    relatedId: number;
                    actionUrl: string;
                }) => ({
                    id: item.id,
                    notificationType: item.notificationType,
                    title: item.title,
                    content: item.content,
                    createTime: item.createTime,
                    readStatus: item.readStatus,
                    relatedId: item.relatedId,
                    actionUrl: item.actionUrl
                })
            );
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
        },
        [selectedType]
    );
    // 使用无限滚动hook
    const {
        data: notifications,
        isLoading,
        isLoadingMore,
        isError,
        error,
        hasMore,
        loadMoreRef,
        refresh: refreshNotifications,
        setData: setInfiniteScrollData
    } = useInfiniteScroll<Notification>(notificationsFetcher, {
        pageSize: 10,
        threshold: 0.1
    });
    // 创建兼容的setData函数
    const setData = useCallback((value: Notification[] | ((prev: Notification[]) => Notification[])): void => {
        let updatedNotifications: Notification[];
        if (typeof value === 'function') {
            // 由于store中的setNotifications不支持函数形式，需要先获取当前状态
            updatedNotifications = value(notifications);
        } else {
            updatedNotifications = value;
        }
        // 同时更新store和infinite scroll的数据
        setNotificationsStore(updatedNotifications);
        setInfiniteScrollData(updatedNotifications);
    }, [notifications, setNotificationsStore, setInfiniteScrollData]);
    // 标记通知为已读 - 包装store方法并添加消息提示
    const markAsRead = useCallback(
        async (id: number): Promise<void> => {
            const success = await markAsReadStore(id);
            if (success) {
                // 同时更新 infinite scroll 的数据
                const updatedNotifications = notifications.map(item =>
                    item.id === id ? { ...item, readStatus: ReadStatus.READ } : item);
                setData(updatedNotifications);
                message.success('已标记为已读');
            } else {
                message.error('标记已读失败，请稍后重试');
            }
        },
        [markAsReadStore, notifications, setData]
    );
    // 标记所有通知为已读 - 包装store方法并添加消息提示
    const markAllAsRead = useCallback(async (): Promise<void> => {
        const success = await markAllAsReadStore();
        if (success) {
            // 同时更新 infinite scroll 的数据
            const updatedNotifications = notifications.map(item => ({ ...item, readStatus: ReadStatus.READ }));
            setData(updatedNotifications);
            message.success('已全部标记为已读');
        } else {
            message.error('标记全部已读失败，请稍后重试');
        }
    }, [markAllAsReadStore, notifications, setData]);
    // 删除通知 - 包装store方法并添加消息提示
    const deleteNotification = useCallback(
        async (id: number): Promise<void> => {
            const success = await deleteNotificationStore(id);
            if (success) {
                // 同时更新 infinite scroll 的数据
                const updatedNotifications = notifications.filter(item => item.id !== id);
                setData(updatedNotifications);
                message.success('通知已删除');
            } else {
                message.error('删除通知失败，请稍后重试');
            }
        },
        [deleteNotificationStore, notifications, setData]
    );
    // 处理通知点击
    const handleNotificationClick = (notification: Notification): void => {
        if (notification.readStatus === ReadStatus.UNREAD) {
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
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedType]);
    // 初始加载未读数量
    useEffect(() => {
        // 监听WebSocket消息
        const handleNotification = (): void => {
            // 重新获取通知列表
            refreshNotifications();
        };
        const handleUnreadCount = (data: unknown): void => {
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
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    // 渲染通知项
    const renderNotificationItem = (notification: Notification): React.ReactNode => (
        <Card
            key={notification.id}
            variant="borderless"
            style={{
                borderRadius: '16px',
                backgroundColor: notification.readStatus === ReadStatus.UNREAD ? `${isDarkMode ? '#4a5565' : '#e5e5e5'}` : `${isDarkMode ? '#1e2939' : 'white'}`
            }}
            styles={{
                body: {
                    padding: '12px 20px',
                    borderBottom: `1px solid ${isDarkMode ? '#6a7282' : '#e8e8e8'}`,
                    borderRadius: '16px',
                    backgroundColor: notification.readStatus === ReadStatus.UNREAD ? `${isDarkMode ? '#4a5565' : '#e5e5e5'}` : `${isDarkMode ? '#1e2939' : 'white'}`,
                    transition: 'background-color 0.3s ease'
                }
            }}
            className={`hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${notification.readStatus === ReadStatus.UNREAD ? 'bg-gray-100 dark:bg-gray-800' : ''}`}
        >
            <div className="flex items-start gap-4">
                {/* 通知内容 */}
                <div className="flex-1 min-w-0">
                    {/* 第一行：标题和时间 */}
                    <div className="flex items-center mb-2">
                        {notification.readStatus === ReadStatus.UNREAD && (
                            <div className="w-2 h-2 rounded-full bg-blue-400 mr-2 mt-1"></div>
                        )}
                        <h3
                            className="text-lg font-semibold text-secondary-800 dark:text-white hover:text-primary-600 transition-colors duration-200 cursor-pointer"
                            onClick={() => handleNotificationClick(notification)}
                        >
                            {notification.title}
                        </h3>
                        <span className="text-sm text-secondary-500 dark:text-gray-400 ml-2">
              {formatTimeShort(notification.createTime)}
            </span>
                    </div>

                    {/* 第二行：内容 */}
                    <p
                        className="text-secondary-600 dark:text-gray-300 mb-2 line-clamp-2 cursor-pointer"
                        onClick={() => handleNotificationClick(notification)}
                    >
                        {notification.content}
                    </p>

                    {/* 操作按钮 */}
                    <div className="flex items-center justify-end space-x-2">
                        {notification.readStatus === ReadStatus.UNREAD && (
                            <> {isDarkMode ?
                                (<Button type='text' icon={<CheckOutlined/>}
                                         onClick={() => markAsRead(notification.id)}>
                                    标为已读
                                </Button>) : (
                                    <Button type='link' icon={<CheckOutlined/>}
                                            onClick={() => markAsRead(notification.id)}>
                                        标为已读
                                    </Button>)
                            }</>
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
            <div
                className="border-b border-gray-200 dark:border-gray-700 flex flex-wrap justify-between items-center pb-4 mb-6">
                {/* 左侧：通知中心和数量 */}
                <div className="flex items-center gap-2">
                    <h1 className="text-2xl font-bold text-secondary-800 dark:text-white">通知中心</h1>
                    <div className="text-gray-500 dark:text-gray-400">({notifications.length})</div>
                    {unreadCount > 0 && (
                        <Badge size={'small'} count={unreadCount}>
                            <BellOutlined style={{ fontSize: 16, color: '#1677ff', marginLeft: '10px' }}/>
                        </Badge>
                    )}
                </div>

                {/* 右侧：消息类别和全部已读按钮 */}
                <div className="flex items-center gap-4">
                    <Select
                        value={selectedType}
                        onChange={setSelectedType}
                        options={notificationTypes}
                        style={{ width: 150 }}
                        size="middle"
                        variant="outlined"
                        prefix={<FilterOutlined className="text-gray-300"/>}
                    />
                    <Button
                        type="primary"
                        variant="text"
                        size="middle"
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
                    },
                    setData: setData
                }}
                renderItem={renderNotificationItem}
                loadingContent={
                    <div className="py-12 flex justify-center">
                        <Spin size="large" tip="加载中..."/>
                    </div>
                }
                emptyContent={
                    <div
                        className="flex flex-col items-center justify-center py-20 bg-white rounded-xl shadow-sm">
                        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="暂无通知"
                               className="py-8"/>
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
