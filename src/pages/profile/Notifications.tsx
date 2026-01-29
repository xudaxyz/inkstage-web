import React, { useState } from 'react';
import { Card, List, Badge, Button, Empty, message, Popconfirm } from 'antd';
import { BellOutlined, CheckOutlined, DeleteOutlined, ClockCircleOutlined, LikeOutlined, MessageOutlined, StarOutlined } from '@ant-design/icons';
import type { BadgeProps } from 'antd';

interface Notification {
  id: number;
  type: 'system' | 'interaction' | 'comment' | 'like' | 'bookmark';
  title: string;
  content: string;
  time: string;
  read: boolean;
  relatedId?: number;
}

const mockNotifications: Notification[] = [
  {
    id: 1,
    type: 'system',
    title: '系统通知',
    content: '您的账号已成功绑定邮箱',
    time: '2024-01-20 10:30',
    read: false,
  },
  {
    id: 2,
    type: 'interaction',
    title: '互动通知',
    content: '您的文章《React 18 新特性解析》获得了编辑推荐',
    time: '2024-01-19 16:45',
    read: false,
    relatedId: 123,
  },
  {
    id: 3,
    type: 'comment',
    title: '评论通知',
    content: '用户 "前端爱好者" 评论了您的文章',
    time: '2024-01-19 14:20',
    read: true,
    relatedId: 123,
  },
  {
    id: 4,
    type: 'like',
    title: '点赞通知',
    content: '用户 "技术控" 点赞了您的文章',
    time: '2024-01-18 09:15',
    read: true,
    relatedId: 123,
  },
  {
    id: 5,
    type: 'bookmark',
    title: '收藏通知',
    content: '用户 "学习者" 收藏了您的文章',
    time: '2024-01-17 11:00',
    read: true,
    relatedId: 123,
  },
];

const Notifications: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  const [activeTab, setActiveTab] = useState<'all' | 'unread'>('all');

  const filteredNotifications = activeTab === 'unread' 
    ? notifications.filter(notification => !notification.read)
    : notifications;

  const markAsRead = (id: number) => {
    setNotifications(prev => prev.map(notification => 
      notification.id === id ? { ...notification, read: true } : notification
    ));
    message.success('已标记为已读');
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(notification => ({ ...notification, read: true })));
    message.success('已全部标记为已读');
  };

  const deleteNotification = (id: number) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
    message.success('通知已删除');
  };

  const deleteAllNotifications = () => {
    setNotifications([]);
    message.success('所有通知已删除');
  };

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'system':
        return <ClockCircleOutlined className="text-blue-500" />;
      case 'interaction':
        return <StarOutlined className="text-yellow-500" />;
      case 'comment':
        return <MessageOutlined className="text-green-500" />;
      case 'like':
        return <LikeOutlined className="text-red-500" />;
      case 'bookmark':
        return <StarOutlined className="text-purple-500" />;
      default:
        return <BellOutlined />;
    }
  };

  const getBadgeStatus = (read: boolean): BadgeProps['status'] => {
    return read ? 'default' : 'processing';
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-800">消息通知</h1>
        <div className="flex space-x-2">
          <Button 
            type="primary" 
            ghost 
            size="small" 
            onClick={markAllAsRead}
            disabled={notifications.filter(n => !n.read).length === 0}
          >
            全部标为已读
          </Button>
          <Popconfirm
            title="确定要删除所有通知吗？"
            onConfirm={deleteAllNotifications}
            okText="确定"
            cancelText="取消"
          >
            <Button 
              danger 
              size="small" 
              disabled={notifications.length === 0}
            >
              清空所有
            </Button>
          </Popconfirm>
        </div>
      </div>

      <div className="flex border-b border-gray-200">
        <Button
          type={activeTab === 'all' ? 'primary' : 'default'}
          onClick={() => setActiveTab('all')}
          className="rounded-t-none"
        >
          全部 ({notifications.length})
        </Button>
        <Button
          type={activeTab === 'unread' ? 'primary' : 'default'}
          onClick={() => setActiveTab('unread')}
          className="rounded-t-none"
        >
          未读 ({notifications.filter(n => !n.read).length})
        </Button>
      </div>

      <Card>
        {filteredNotifications.length > 0 ? (
          <List
            dataSource={filteredNotifications}
            renderItem={notification => (
              <List.Item
                key={notification.id}
                className={`p-4 ${!notification.read ? 'bg-blue-50' : ''} rounded-lg mb-2 hover:bg-gray-50 transition-colors`}
                actions={[
                  !notification.read && (
                    <Button 
                      type="link" 
                      icon={<CheckOutlined />} 
                      onClick={() => markAsRead(notification.id)}
                    >
                      标为已读
                    </Button>
                  ),
                  <Popconfirm
                    title="确定要删除这条通知吗？"
                    onConfirm={() => deleteNotification(notification.id)}
                    okText="确定"
                    cancelText="取消"
                  >
                    <Button 
                      type="link" 
                      danger 
                      icon={<DeleteOutlined />} 
                    >
                      删除
                    </Button>
                  </Popconfirm>
                ].filter(Boolean)}
              >
                <List.Item.Meta
                  avatar={
                    <Badge status={getBadgeStatus(notification.read)} offset={[-20, 0]}>
                      <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                        {getNotificationIcon(notification.type)}
                      </div>
                    </Badge>
                  }
                  title={
                    <div className="flex justify-between">
                      <span className="font-medium">{notification.title}</span>
                      <span className="text-sm text-gray-500">{notification.time}</span>
                    </div>
                  }
                  description={notification.content}
                />
              </List.Item>
            )}
          />
        ) : (
          <Empty description="暂无通知" className="py-10" />
        )}
      </Card>
    </div>
  );
};

export default Notifications;