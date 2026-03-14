import React, { useState } from 'react';
import { Card, Button, List, message, Popconfirm } from 'antd';
import { LockOutlined, MailOutlined, PhoneOutlined, SecurityScanOutlined, LogoutOutlined, DeleteOutlined } from '@ant-design/icons';

interface SettingItem {
  id: string;
  title: string;
  description: string;
  type: 'button' | 'status';
  action?: () => void;
  danger?: boolean;
}

const AccountSettings: React.FC = () => {
  const [emailVerified] = useState(true);
  const [phoneVerified] = useState(false);

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
      action: handleVerifyEmail
    },
    {
      id: 'phone',
      title: '手机验证',
      description: phoneVerified ? '手机已验证' : '手机未验证',
      type: 'status',
      action: handleVerifyPhone
    },
    {
      id: 'password',
      title: '修改密码',
      description: '定期修改密码可以提高账号安全性',
      type: 'button',
      action: handleChangePassword
    }
  ];

  const accountActions: SettingItem[] = [
    {
      id: 'logout',
      title: '退出登录',
      description: '退出当前账号',
      type: 'button',
      action: handleLogout
    },
    {
      id: 'delete',
      title: '删除账号',
      description: '永久删除当前账号及所有数据',
      type: 'button',
      action: handleDeleteAccount,
      danger: true
    }
  ];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-800">账号设置</h1>
        <p className="text-gray-600 mt-2">管理您的账号安全</p>
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
                )
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
                )
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
