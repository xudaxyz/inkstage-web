import React, { useState } from 'react';
import { Card, Button, Switch, List, message, Popconfirm } from 'antd';
import { LockOutlined, MailOutlined, PhoneOutlined, BellOutlined, SecurityScanOutlined, LogoutOutlined, DeleteOutlined } from '@ant-design/icons';

interface SettingItem {
  id: string;
  title: string;
  description: string;
  type: 'switch' | 'button' | 'status';
  status?: boolean;
  action?: () => void;
  danger?: boolean;
}

const AccountSettings: React.FC = () => {
  const [emailVerified] = useState(true);
  const [phoneVerified] = useState(false);
  const [notificationSettings, setNotificationSettings] = useState({
    email: true,
    sms: false,
    push: true,
    comment: true,
    like: true,
    bookmark: false,
    system: true,
  });

  const handleNotificationChange = (key: keyof typeof notificationSettings) => {
    setNotificationSettings(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
    message.success('设置已更新');
  };

  const handleVerifyEmail = () => {
    message.success('验证邮件已发送，请查收');
  };

  const handleVerifyPhone = () => {
    message.success('验证码已发送');
  };

  const handleChangePassword = () => {
    message.info('跳转到修改密码页面');
  };

  const handleLogout = () => {
    message.success('已退出登录');
  };

  const handleDeleteAccount = () => {
    message.success('账号已删除');
  };

  const securitySettings: SettingItem[] = [
    {
      id: 'email',
      title: '邮箱验证',
      description: emailVerified ? '邮箱已验证' : '邮箱未验证',
      type: 'status',
      action: handleVerifyEmail,
    },
    {
      id: 'phone',
      title: '手机验证',
      description: phoneVerified ? '手机已验证' : '手机未验证',
      type: 'status',
      action: handleVerifyPhone,
    },
    {
      id: 'password',
      title: '修改密码',
      description: '定期修改密码可以提高账号安全性',
      type: 'button',
      action: handleChangePassword,
    },
  ];

  const notificationSettingItems: SettingItem[] = [
    {
      id: 'email',
      title: '邮件通知',
      description: '接收系统邮件通知',
      type: 'switch',
      status: notificationSettings.email,
    },
    {
      id: 'sms',
      title: '短信通知',
      description: '接收重要短信通知',
      type: 'switch',
      status: notificationSettings.sms,
    },
    {
      id: 'push',
      title: '站内通知',
      description: '接收站内消息通知',
      type: 'switch',
      status: notificationSettings.push,
    },
    {
      id: 'comment',
      title: '评论通知',
      description: '有人评论时通知我',
      type: 'switch',
      status: notificationSettings.comment,
    },
    {
      id: 'like',
      title: '点赞通知',
      description: '有人点赞时通知我',
      type: 'switch',
      status: notificationSettings.like,
    },
    {
      id: 'bookmark',
      title: '收藏通知',
      description: '有人收藏时通知我',
      type: 'switch',
      status: notificationSettings.bookmark,
    },
    {
      id: 'system',
      title: '系统通知',
      description: '接收系统重要通知',
      type: 'switch',
      status: notificationSettings.system,
    },
  ];

  const accountActions: SettingItem[] = [
    {
      id: 'logout',
      title: '退出登录',
      description: '退出当前账号',
      type: 'button',
      action: handleLogout,
    },
    {
      id: 'delete',
      title: '删除账号',
      description: '永久删除当前账号及所有数据',
      type: 'button',
      action: handleDeleteAccount,
      danger: true,
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-800">账号设置</h1>
        <p className="text-gray-600 mt-2">管理您的账号安全和通知偏好</p>
      </div>

      <Card title={<span className="flex items-center"><SecurityScanOutlined className="mr-2" /> 安全设置</span>}>
        <List
          dataSource={securitySettings}
          renderItem={item => (
            <List.Item
              key={item.id}
              actions={[
                item.type === 'status' && (
                  <Button 
                    type="primary" 
                    size="small" 
                    onClick={item.action}
                  >
                    {item.id === 'email' ? '重新验证' : '立即验证'}
                  </Button>
                ),
                item.type === 'button' && (
                  <Button 
                    type="primary" 
                    size="small" 
                    onClick={item.action}
                  >
                    立即操作
                  </Button>
                ),
              ].filter(Boolean)}
            >
              <List.Item.Meta
                title={
                  <div className="flex items-center">
                    {item.id === 'email' && <MailOutlined className="mr-2 text-blue-500" />}
                    {item.id === 'phone' && <PhoneOutlined className="mr-2 text-green-500" />}
                    {item.id === 'password' && <LockOutlined className="mr-2 text-orange-500" />}
                    {item.title}
                  </div>
                }
                description={item.description}
              />
            </List.Item>
          )}
        />
      </Card>

      <Card title={<span className="flex items-center"><BellOutlined className="mr-2" /> 通知设置</span>}>
        <List
          dataSource={notificationSettingItems}
          renderItem={item => (
            <List.Item
              key={item.id}
              actions={[
                item.type === 'switch' && (
                  <Switch
                    checked={item.status}
                    onChange={() => handleNotificationChange(item.id as keyof typeof notificationSettings)}
                  />
                ),
              ]}
            >
              <List.Item.Meta
                title={item.title}
                description={item.description}
              />
            </List.Item>
          )}
        />
      </Card>

      <Card title="账号操作">
        <List
          dataSource={accountActions}
          renderItem={item => (
            <List.Item
              key={item.id}
              actions={[
                item.type === 'button' && (
                  item.danger ? (
                    <Popconfirm
                      title="确定要删除账号吗？此操作不可恢复！"
                      description="删除后，您的所有数据将被永久清除。"
                      onConfirm={item.action}
                      okText="确定删除"
                      cancelText="取消"
                      okType="danger"
                    >
                      <Button 
                        danger 
                        size="small" 
                        icon={<DeleteOutlined />}
                      >
                        {item.title}
                      </Button>
                    </Popconfirm>
                  ) : (
                    <Button 
                      type="default" 
                      size="small" 
                      icon={<LogoutOutlined />}
                      onClick={item.action}
                    >
                      {item.title}
                    </Button>
                  )
                ),
              ]}
            >
              <List.Item.Meta
                title={item.title}
                description={item.description}
              />
            </List.Item>
          )}
        />
      </Card>

      <Card>
        <div className="p-4 bg-gray-50 rounded">
          <h3 className="text-lg font-medium mb-2">账号安全提示</h3>
          <ul className="list-disc pl-5 space-y-1 text-gray-600">
            <li>请定期修改密码，使用强密码组合</li>
            <li>开启双重验证可以提高账号安全性</li>
            <li>不要在公共设备上保存登录状态</li>
            <li>警惕钓鱼网站和诈骗邮件</li>
          </ul>
        </div>
      </Card>
    </div>
  );
};

export default AccountSettings;