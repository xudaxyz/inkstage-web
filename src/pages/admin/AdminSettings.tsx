import React, { useState } from 'react';
import { Button, Card, Form, Input, message, Select, Switch, Typography, Upload } from 'antd';
import {
  GlobalOutlined,
  MailOutlined,
  SafetyOutlined,
  SaveOutlined,
  SearchOutlined,
  UploadOutlined
} from '@ant-design/icons';

const { Title } = Typography;
const { Option } = Select;
const { TextArea } = Input;
const { Search } = Input;

const AdminSettings: React.FC = () => {
  const [form] = Form.useForm();
  const [isSaving, setIsSaving] = useState(false);

  // 保存设置
  const handleSaveSettings = (): void => {
    form
      .validateFields()
      .then(() => {
        setIsSaving(true);
        // 模拟保存操作
        setTimeout(() => {
          setIsSaving(false);
          message.success('设置保存成功').then();
        }, 1000);
      })
      .catch((error) => {
        console.error('验证失败:', error);
      });
  };

  return (
    <div className="mb-6">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">系统设置</h2>
      </div>

      {/* 搜索和筛选 */}
      <Card className="mb-6 border border-gray-100 shadow-sm">
        <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
          <Search placeholder="搜索设置项" allowClear enterButton={<SearchOutlined />} style={{ width: 300 }} />
          <Button type="primary" icon={<SaveOutlined />} onClick={handleSaveSettings} loading={isSaving}>
            保存设置
          </Button>
        </div>
      </Card>

      <Form
        form={form}
        layout="vertical"
        initialValues={{
          siteName: 'InkStage',
          siteDescription: '一个现代化的内容管理系统',
          siteUrl: 'https://inkstage.example.com',
          adminEmail: 'admin@inkstage.example.com',
          enableRegistration: true,
          enableComments: true,
          enableEmailNotifications: true,
          smtpHost: 'smtp.example.com',
          smtpPort: 587,
          smtpUsername: 'admin@inkstage.example.com',
          smtpPassword: 'password',
          smtpSecure: true,
          uploadMaxSize: 10,
          uploadAllowedTypes: 'jpg,png,gif,webp',
          enableHttps: true,
          enableBruteForceProtection: true,
          sessionTimeout: 30
        }}
      >
        {/* 网站设置 */}
        <Card className="mb-6 border border-gray-100 shadow-sm">
          <Title level={5} className="mb-4 flex items-center gap-2">
            <GlobalOutlined /> 网站设置
          </Title>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Form.Item name="siteName" label="网站名称" rules={[{ required: true, message: '请输入网站名称' }]}>
              <Input placeholder="请输入网站名称" />
            </Form.Item>
            <Form.Item name="siteDescription" label="网站描述" rules={[{ required: true, message: '请输入网站描述' }]}>
              <TextArea rows={2} placeholder="请输入网站描述" />
            </Form.Item>
            <Form.Item name="siteUrl" label="网站URL" rules={[{ required: true, message: '请输入网站URL' }]}>
              <Input placeholder="请输入网站URL" />
            </Form.Item>
            <Form.Item name="adminEmail" label="管理员邮箱" rules={[{ required: true, message: '请输入管理员邮箱' }]}>
              <Input placeholder="请输入管理员邮箱" />
            </Form.Item>
            <Form.Item name="enableRegistration" label="启用用户注册">
              <Switch />
            </Form.Item>
            <Form.Item name="enableComments" label="启用评论功能">
              <Switch />
            </Form.Item>
          </div>
        </Card>

        {/* 邮件设置 */}
        <Card className="mb-6 border border-gray-100 shadow-sm">
          <Title level={5} className="mb-4 flex items-center gap-2">
            <MailOutlined /> 邮件设置
          </Title>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Form.Item name="enableEmailNotifications" label="启用邮件通知">
              <Switch />
            </Form.Item>
            <Form.Item name="smtpHost" label="SMTP主机" rules={[{ required: true, message: '请输入SMTP主机' }]}>
              <Input placeholder="请输入SMTP主机" />
            </Form.Item>
            <Form.Item name="smtpPort" label="SMTP端口" rules={[{ required: true, message: '请输入SMTP端口' }]}>
              <Input type="number" placeholder="请输入SMTP端口" />
            </Form.Item>
            <Form.Item name="smtpUsername" label="SMTP用户名" rules={[{ required: true, message: '请输入SMTP用户名' }]}>
              <Input placeholder="请输入SMTP用户名" />
            </Form.Item>
            <Form.Item name="smtpPassword" label="SMTP密码" rules={[{ required: true, message: '请输入SMTP密码' }]}>
              <Input.Password placeholder="请输入SMTP密码" />
            </Form.Item>
            <Form.Item name="smtpSecure" label="启用SSL">
              <Switch />
            </Form.Item>
          </div>
        </Card>

        {/* 上传设置 */}
        <Card className="mb-6 border border-gray-100 shadow-sm">
          <Title level={5} className="mb-4 flex items-center gap-2">
            <UploadOutlined /> 上传设置
          </Title>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Form.Item
              name="uploadMaxSize"
              label="最大上传大小 (MB)"
              rules={[{ required: true, message: '请输入最大上传大小' }]}
            >
              <Input type="number" placeholder="请输入最大上传大小" />
            </Form.Item>
            <Form.Item
              name="uploadAllowedTypes"
              label="允许的文件类型"
              rules={[{ required: true, message: '请输入允许的文件类型' }]}
            >
              <Input placeholder="请输入允许的文件类型，用逗号分隔" />
            </Form.Item>
            <Form.Item name="logo" label="网站Logo">
              <Upload>
                <Button icon={<UploadOutlined />}>上传Logo</Button>
              </Upload>
            </Form.Item>
            <Form.Item name="favicon" label="网站图标">
              <Upload>
                <Button icon={<UploadOutlined />}>上传图标</Button>
              </Upload>
            </Form.Item>
          </div>
        </Card>

        {/* 安全设置 */}
        <Card className="mb-6 border border-gray-100 shadow-sm">
          <Title level={5} className="mb-4 flex items-center gap-2">
            <SafetyOutlined /> 安全设置
          </Title>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Form.Item name="enableHttps" label="启用HTTPS">
              <Switch />
            </Form.Item>
            <Form.Item name="enableBruteForceProtection" label="启用暴力破解防护">
              <Switch />
            </Form.Item>
            <Form.Item
              name="sessionTimeout"
              label="会话超时 (分钟)"
              rules={[{ required: true, message: '请输入会话超时时间' }]}
            >
              <Input type="number" placeholder="请输入会话超时时间" />
            </Form.Item>
            <Form.Item name="passwordPolicy" label="密码策略" rules={[{ required: true, message: '请选择密码策略' }]}>
              <Select placeholder="请选择密码策略">
                <Option value="weak">弱</Option>
                <Option value="medium">中等</Option>
                <Option value="strong">强</Option>
              </Select>
            </Form.Item>
          </div>
        </Card>
      </Form>
    </div>
  );
};

export default AdminSettings;
