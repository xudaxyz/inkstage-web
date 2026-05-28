import React, { useEffect, useState } from 'react';
import { Alert, Button, Card, Checkbox, Form, Input, List, message, Modal } from 'antd';
import type { RuleObject } from 'antd/es/form';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import {
  DeleteOutlined,
  ExclamationCircleOutlined,
  LockOutlined,
  LogoutOutlined,
  MailOutlined,
  PhoneOutlined,
  SecurityScanOutlined
} from '@ant-design/icons';
import authService from '../../../services/authService';
import { useUserStore } from '../../../store';
import { ROUTES } from '../../../constants/routes';
import { UserStatusEnum } from '../../../types/enums';

interface SettingItem {
  id: string;
  title: string;
  description: string;
  type: 'button' | 'status';
  action?: () => void;
  danger?: boolean;
}

const AccountSettings: React.FC = () => {
  const navigate = useNavigate();
  const { logout: storeLogout } = useUserStore();
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);
  const [deleteAccountOpen, setDeleteAccountOpen] = useState(false);
  const [logoutOpen, setLogoutOpen] = useState(false);
  const [changePasswordLoading, setChangePasswordLoading] = useState(false);
  const [deleteAccountLoading, setDeleteAccountLoading] = useState(false);
  const [logoutLoading, setLogoutLoading] = useState(false);
  const [changePasswordForm] = Form.useForm();
  const [deleteAccountForm] = Form.useForm();
  const [deleteSuccessAlert, setDeleteSuccessAlert] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [cleanContent, setCleanContent] = useState(false);
  const [cleanInteraction, setCleanInteraction] = useState(false);

  // 页面加载时检测 PENDING_DELETE 状态（用户刷新页面的情况）
  useEffect(() => {
    const userStatus = useUserStore.getState().user.status;
    if (userStatus === UserStatusEnum.PENDING_DELETE) {
      localStorage.setItem('pending_message', '您的账号已申请注销，30天后将永久删除');
      storeLogout();
      window.location.replace('/');
    }
  }, [storeLogout]);

  // 删除账号成功后倒计时跳转
  useEffect(() => {
    if (!deleteSuccessAlert || countdown <= 0) return;
    if (countdown === 0) return;
    const timer = setTimeout(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);
    return (): void => clearTimeout(timer);
  }, [deleteSuccessAlert, countdown]);

  // 倒计时结束自动跳转
  useEffect(() => {
    if (deleteSuccessAlert && countdown === 0) {
      storeLogout();
      window.location.replace('/');
    }
  }, [deleteSuccessAlert, countdown, storeLogout]);

  // 执行跳转(立即或关闭时)
  const handleDeleteRedirect = (): void => {
    setDeleteSuccessAlert(false);
    storeLogout();
    window.location.replace('/');
  };

  // 邮箱/手机验证 — 功能开发中提示
  const handleVerifyEmail = (): void => {
    void message.info('邮箱验证功能开发中，敬请期待');
  };

  const handleVerifyPhone = (): void => {
    void message.info('手机验证功能开发中，敬请期待');
  };

  // 修改密码
  const handleChangePassword = (): void => {
    setChangePasswordOpen(true);
  };

  const handleChangePasswordOk = async (): Promise<void> => {
    try {
      const values = await changePasswordForm.validateFields();
      setChangePasswordLoading(true);
      const response = await authService.changePassword(values);
      if (response.code !== 200) {
        message.error(response.message || '密码修改失败，请稍后再试！');
        return;
      }
      setChangePasswordOpen(false);
      changePasswordForm.resetFields();
      message.success(response.message || '密码修改成功，请重新登录');
      storeLogout();
      navigate(ROUTES.LOGIN);
    } catch (error) {
      if (error instanceof Error) {
        message.error(error.message);
      }
    } finally {
      setChangePasswordLoading(false);
    }
  };

  // 退出登录
  const handleLogoutClick = (): void => {
    setLogoutOpen(true);
  };

  const handleLogoutOk = async (): Promise<void> => {
    setLogoutLoading(true);
    try {
      await authService.logout();
    } catch {
      // 即使 API 调用失败，也执行本地退出
    }
    setLogoutLoading(false);
    setLogoutOpen(false);
    storeLogout();
    window.location.replace('/');
  };

  // 删除账号
  const handleDeleteAccountClick = (): void => {
    setDeleteAccountOpen(true);
  };

  const handleDeleteAccountOk = async (): Promise<void> => {
    try {
      const values = await deleteAccountForm.validateFields();
      setDeleteAccountLoading(true);
      const response = await authService.deleteAccount({
        password: values.password,
        cleanContent,
        cleanInteraction
      });
      if (response.code === 200) {
        setDeleteAccountOpen(false);
        deleteAccountForm.resetFields();
        setCleanContent(false);
        setCleanInteraction(false);
        setDeleteSuccessAlert(true);
        setCountdown(10);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        message.error(response.message || '删除账号失败，请联系管理员');
      }
    } catch (error) {
      if (error instanceof Error) {
        message.error(error.message);
      }
    } finally {
      setDeleteAccountLoading(false);
    }
  };

  const securitySettings: SettingItem[] = [
    {
      id: 'email',
      title: '邮箱验证',
      description: '邮箱未验证',
      type: 'status',
      action: handleVerifyEmail
    },
    {
      id: 'phone',
      title: '手机验证',
      description: '手机未验证',
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
      action: handleLogoutClick
    },
    {
      id: 'delete',
      title: '删除账号',
      description: '永久删除当前账号及所有数据',
      type: 'button',
      action: handleDeleteAccountClick,
      danger: true
    }
  ];

  return (
    <>
      <Helmet>
        <title>账号设置 - InkStage</title>
      </Helmet>
      <div className="px-4 sm:px-6 py-6 space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">账号设置</h1>
          <p className="text-gray-600 mt-2">管理您的账号安全</p>
        </div>

        {deleteSuccessAlert && (
          <Alert
            title="账号注销申请已提交"
            description={
              <div>
                <p>感谢您一直以来的陪伴！我们已收到您的注销申请，您的账号将于30天后永久删除。在此之前，您仍可随时登录恢复账号！</p>
                <p className="mt-2">
                  将于 {countdown} 秒后自动退出，
                  <span className="text-blue-500 hover:text-blue-700">
                    <a onClick={handleDeleteRedirect} className="cursor-pointer">点击立即跳转</a>
                  </span>
                </p>
              </div>
            }
            type="warning"
            showIcon
            styles={{
              title: { fontSize: '18px', fontWeight: 600 },
              description: { fontSize: '14px', lineHeight: 1.6 }
            }}
            closable={{
              closeIcon: true,
              onClose: handleDeleteRedirect
            }}
          />
        )}

        <Card
          title={
            <span className="flex items-center">
              <SecurityScanOutlined className="mr-2" /> 安全设置
            </span>
          }
        >
          <List
            dataSource={securitySettings}
            renderItem={(item) => (
              <List.Item
                key={item.id}
                actions={[
                  item.type === 'status' && (
                    <Button variant="outlined" color="cyan" onClick={item.action}>
                      点击验证
                    </Button>
                  ),
                  item.type === 'button' && (
                    <Button variant="outlined" color="orange" onClick={item.action}>
                      修改密码
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
            renderItem={(item) => (
              <List.Item
                key={item.id}
                actions={[
                  item.type === 'button' &&
                  (item.danger ? (
                    <Button variant="solid" color="red" size="middle" icon={<DeleteOutlined />} onClick={item.action}>
                      {item.title}
                    </Button>
                  ) : (
                    <Button variant="outlined" color="red" size="middle" icon={<LogoutOutlined />}
                            onClick={item.action}>
                      {item.title}
                    </Button>
                  ))
                ]}
              >
                <List.Item.Meta title={item.title} description={item.description} />
              </List.Item>
            )}
          />
        </Card>

        <Card>
          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded">
            <h3 className="text-lg font-medium mb-2">账号安全提示</h3>
            <ul className="list-disc pl-5 space-y-1 text-gray-600 dark:text-gray-400">
              <li>请定期修改密码，使用强密码组合</li>
              <li>开启双重验证可以提高账号安全性</li>
              <li>不要在公共设备上保存登录状态</li>
              <li>警惕钓鱼网站和诈骗邮件</li>
            </ul>
          </div>
        </Card>
      </div>

      {/* 修改密码 Modal */}
      <Modal
        title={
          <span className="flex items-center">
            <LockOutlined className="mr-2 text-orange-500" /> 修改密码
          </span>
        }
        open={changePasswordOpen}
        onOk={handleChangePasswordOk}
        onCancel={() => {
          setChangePasswordOpen(false);
          changePasswordForm.resetFields();
        }}
        confirmLoading={changePasswordLoading}
        okText="确认修改"
        cancelText="取消"
      >
        <Form form={changePasswordForm} layout="vertical" className="mt-4">
          <Form.Item
            name="currentPassword"
            label="当前密码"
            rules={[{ required: true, message: '请输入当前密码' }]}
          >
            <Input.Password placeholder="请输入当前密码" />
          </Form.Item>
          <Form.Item
            name="newPassword"
            label="新密码"
            rules={[
              { required: true, message: '请输入新密码' },
              { min: 6, message: '密码长度不能少于6位' },
              { max: 20, message: '密码长度不能超过20位' }
            ]}
          >
            <Input.Password placeholder="请输入新密码（6-20位）" />
          </Form.Item>
          <Form.Item
            name="confirmPassword"
            label="确认新密码"
            dependencies={['newPassword']}
            rules={[
              { required: true, message: '请确认新密码' },
              ({ getFieldValue }): RuleObject => ({
                validator(_, value): Promise<void> {
                  if (!value || getFieldValue('newPassword') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('两次输入的密码不一致'));
                }
              })
            ]}
          >
            <Input.Password placeholder="请再次输入新密码" />
          </Form.Item>
        </Form>
      </Modal>

      {/* 删除账号 Modal */}
      <Modal
        title={
          <span className="flex items-center text-red-500">
            <ExclamationCircleOutlined className="mr-2" /> 删除账号
          </span>
        }
        open={deleteAccountOpen}
        onOk={handleDeleteAccountOk}
        onCancel={() => {
          setDeleteAccountOpen(false);
          deleteAccountForm.resetFields();
          setCleanContent(false);
          setCleanInteraction(false);
        }}
        confirmLoading={deleteAccountLoading}
        okText="确认注销"
        cancelText="取消"
        okButtonProps={{ danger: true }}
        width={520}
      >
        <div className="mb-4 p-3 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg">
          <p className="text-orange-600 dark:text-orange-400 font-medium mb-1">注销账号提醒</p>
          <p className="text-orange-500 dark:text-orange-400 text-sm">
            提交注销申请后，账号将进入30天冷静期。冷静期内您可随时登录恢复账号，30天后账号将被永久注销且无法恢复。
          </p>
        </div>

        <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <p className="text-gray-700 dark:text-gray-300 font-medium mb-3">注销时，是否同时清除您的内容？</p>
          <div className="space-y-3">
            <Checkbox
              checked={cleanContent}
              onChange={(e) => setCleanContent(e.target.checked)}
            >
              <span className="text-gray-700 dark:text-gray-300">清除我的内容（文章、专栏、评论）</span>
            </Checkbox>
            <div className="ml-6 text-xs text-gray-500 dark:text-gray-400">
              注销后立即不可见，30天后永久删除。冷静期内恢复账号可还原。
            </div>

            <Checkbox
              checked={cleanInteraction}
              onChange={(e) => setCleanInteraction(e.target.checked)}
            >
              <span className="text-gray-700 dark:text-gray-300">清除我的互动记录（点赞、收藏）</span>
            </Checkbox>
            <div className="ml-6 text-xs text-gray-500 dark:text-gray-400">
              注销后立即清除，30天后永久删除。冷静期内恢复账号可还原。
            </div>
          </div>

          {!cleanContent && !cleanInteraction && (
            <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                如不勾选，账户注销后您的文章相关内容将继续保留，作者显示为「已注销用户」。
              </p>
            </div>
          )}
        </div>

        <Form form={deleteAccountForm} layout="vertical">
          <Form.Item
            name="password"
            label="请输入当前密码以确认删除"
            rules={[{ required: true, message: '请输入当前密码' }]}
          >
            <Input.Password placeholder="请输入当前密码" />
          </Form.Item>
        </Form>
      </Modal>

      {/* 退出登录 Modal */}
      <Modal
        title={
          <span className="flex items-center">
            退出登录
          </span>
        }
        open={logoutOpen}
        onOk={handleLogoutOk}
        onCancel={() => setLogoutOpen(false)}
        confirmLoading={logoutLoading}
        okText="确定退出"
        cancelText="取消"
      >
        <p className="text-gray-600 dark:text-gray-400">确定要退出当前账号吗？</p>
      </Modal>
    </>
  );
};
export default AccountSettings;
