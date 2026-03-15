import React, { useState, useEffect, useCallback } from 'react';
import { Card, Button, Empty, message, Select, Spin, Badge, Pagination } from 'antd';
import { CheckOutlined, DeleteOutlined, FilterOutlined, BellOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import notificationService from '../../../services/notificationService';
import { type Notification } from '../../../types/notification';
import websocketService from '../../../services/websocketService';
import { NotificationType, NotificationTypeMap, ReadStatus } from '../../../types/enums';
import { formatDateOnly, formatTimeShort } from '../../../utils';

const Notifications: React.FC = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [selectedType, setSelectedType] = useState<string>('all');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [pageNum, setPageNum] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [total, setTotal] = useState<number>(0);

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

  // 获取通知列表
  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const type = selectedType === 'all' ? undefined : NotificationType[selectedType as keyof typeof NotificationType];
      const response = await notificationService.getNotificationList(type, pageNum, pageSize);
      if (response.code === 200) {
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
        setNotifications(formattedNotifications);
        setTotal(response.data.total || 0);
        // 更新未读数量
        await fetchUnreadCount();
      } else {
        setError(response.message || '获取通知列表失败');
        message.error(response.message || '获取通知列表失败');
      }
    } catch (err) {
      setError('网络错误，请稍后重试');
      message.error('网络错误，请稍后重试');
      console.error('获取通知列表失败:', err);
    } finally {
      setLoading(false);
    }
  }, [selectedType, pageNum, pageSize, fetchUnreadCount]);

  // 标记通知为已读
  const markAsRead = async (id: number) : Promise<void> => {
    try {
      const response = await notificationService.markAsRead(id);
      if (response.code === 200 && response.data) {
        setNotifications(prev => prev.map(notification =>
          notification.id === id ? { ...notification, read: true } : notification
        ));
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
  const markAllAsRead = async () : Promise<void> => {
    try {
      const response = await notificationService.markAllAsRead();
      if (response.code === 200 && response.data) {
        setNotifications(prev => prev.map(notification => ({ ...notification, read: true })));
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
  const deleteNotification = async (id: number) : Promise<void> => {
    try {
      const response = await notificationService.deleteNotification(id);
      if (response.code === 200 && response.data) {
        setNotifications(prev => prev.filter(notification => notification.id !== id));
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
  const handleNotificationClick = (notification: Notification) : void => {
    if (!notification.readStatus) {
      markAsRead(notification.id);
    }
    if (notification.actionUrl) {
      navigate(notification.actionUrl);
    }
  };

  // 当选中类型、页码或每页大小变化时重新获取通知
  useEffect(() => {
    fetchNotifications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedType, pageNum, pageSize]);

  // 初始加载通知和未读数量
  useEffect(() => {
    // 初始加载
    fetchNotifications();
    fetchUnreadCount();

    // 监听WebSocket消息
    const handleNotification = (data: unknown) : void => {
      console.log('收到新通知:', data);
      // 重新获取通知列表
      fetchNotifications();
    };

    const handleUnreadCount = (data: unknown) : void => {
      console.log('未读通知数量更新:', data);
      if (typeof data === 'number') {
        setUnreadCount(data);
      }
    };

    // 注册事件监听器
    websocketService.on('notification', handleNotification);
    websocketService.on('unreadCount', handleUnreadCount);

    // 清理事件监听器
    return () : void => {
      websocketService.off('notification', handleNotification);
      websocketService.off('unreadCount', handleUnreadCount);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // 空依赖，只在组件挂载时运行一次

  const filteredNotifications = notifications;

  // 按日期分组通知
  const groupedNotifications = filteredNotifications.reduce((groups, notification) => {
    const date = formatDateOnly(notification.createTime);
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(notification);
    return groups;
  }, {} as Record<string, Notification[]>);

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

      {/* 消息列表 */}
      {loading ? (
        <div className="py-12 flex justify-center">
          <Spin size="large" tip="加载中..."/>
        </div>
      ) : error ? (
        <div className="py-12 flex justify-center">
          <div className="text-center">
            <p className="text-red-500 mb-4">{error}</p>
            <Button type="primary" onClick={fetchNotifications}>重试</Button>
          </div>
        </div>
      ) : filteredNotifications.length > 0 ? (
        <div className="space-y-6">
          {Object.entries(groupedNotifications).map(([date, dateNotifications]) => (
            <div key={date} className="mb-6">
              {/* 日期标题 */}
              <h2 className="text-lg font-semibold text-secondary-700 mb-4">
                {date}
              </h2>

              {/* 当日通知列表 */}
              <div className="space-y-4">
                {dateNotifications.map((notification) => (
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
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl shadow-sm">
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="暂无通知"
            className="py-8"
          />
        </div>
      )}

      {/* 分页组件 */}
      {!loading && !error && total > 0 && (
        <div className="mt-8 flex justify-center">
          <Pagination
            current={pageNum}
            pageSize={pageSize}
            total={total}
            onChange={(page) => setPageNum(page)}
            onShowSizeChange={(_, size) => {
              setPageSize(size);
              setPageNum(1);
            }}
            showSizeChanger
            showQuickJumper
            showTotal={(total) => `共 ${total} 条通知`}
            size="large"
          />
        </div>
      )}
    </div>
  );
};

export default Notifications;
