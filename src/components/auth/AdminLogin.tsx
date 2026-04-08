import React, { useState } from 'react';
import { Button, Form, Input, message } from 'antd';
import { Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash, faShieldAlt } from '@fortawesome/free-solid-svg-icons';
import AuthLayout from '../../layouts/AuthLayout';
import SlideCaptchaModal from './captcha/SlideCaptchaModal.tsx';
import { useAdminStore } from '../../store/adminStore';
import { AuthTypeEnum } from '../../types/enums';
import { getRandomCaptchaImage } from '../../utils';

// 登录表单数据类型
interface AdminLoginFormData {
  // 统一登录字段
  account: string;
  password: string;
  // 通用
  remember?: boolean;
}

const AdminLogin: React.FC = () => {
  const navigate = useNavigate();
  const { adminLogin, isLoading } = useAdminStore();
  const [showPassword, setShowPassword] = useState(false);
  const [captchaModalVisible, setCaptchaModalVisible] = useState(false);
  const [formData, setFormData] = useState<AdminLoginFormData | null>(null);
  const [form] = Form.useForm<AdminLoginFormData>();
  // 表单提交处理
  const handleFormSubmit = (values: AdminLoginFormData): void => {
    // 保存表单数据，弹出验证码模态框
    setFormData(values);
    setCaptchaModalVisible(true);
  };
  // 验证码成功后的登录处理
  const handleCaptchaSuccess = async (): Promise<void> => {
    if (!formData) return;
    try {
      const response = await adminLogin({
        account: formData.account,
        authType: AuthTypeEnum.USERNAME,
        password: formData.password,
        remember: formData.remember || false
      });
      if (response.code === 200) {
        // 显示登录成功提示
        message.success({
          content: response.message || '登录成功，正在加载管理后台...',
          duration: 2,
          className: 'text-lg font-medium'
        });

        // 显示加载提示
        const loadingMessage = message.loading({
          content: '正在加载管理后台，请稍候...',
          duration: 0, // 不自动关闭
          className: 'text-lg'
        });

        // 预加载后台首页组件
        try {
          await import('../../pages/admin/AdminDashboard');
        } catch (e) {
          console.error('预加载后台组件失败:', e);
        }

        // 关闭加载提示
        loadingMessage();

        // 登录成功后重定向到后台首页
        const redirectPath = localStorage.getItem('redirect_after_login');
        if (redirectPath) {
          localStorage.removeItem('redirect_after_login');
          const normalizedPath = redirectPath.startsWith('/') ? redirectPath : `/${redirectPath}`;
          const baseUrl = import.meta.env.VITE_API_FRONT_URL;
          const cleanPath = normalizedPath.split(baseUrl)[1] || normalizedPath;
          navigate(cleanPath);
        } else {
          navigate('/admin');
        }
      } else {
        message.error(response.message || '登录失败，请稍后重试！');
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        message.error({
          content: error.message || '登录失败，请稍后重试！',
          duration: 5
        });
      }
      console.error('登录失败:', error);
    } finally {
      setCaptchaModalVisible(false);
      setFormData(null);
    }
  };
  return (
    <AuthLayout title="">
      {/* 登录表单 */}
      <Form form={form} onFinish={handleFormSubmit} layout="vertical" className="w-full">
        {/* 左侧登录，右侧注册链接 */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-2">
            <FontAwesomeIcon icon={faShieldAlt} className="text-primary-600" />
            <h2 className="text-2xl font-semibold bg-linear-to-r from-blue-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent">
              管理员登录
            </h2>
          </div>
        </div>

        {/* 用户名/邮箱/手机号输入 */}
        <Form.Item
          name="account"
          rules={[
            {
              required: true,
              message: '请输入管理员账号'
            }
          ]}
          className="mb-4"
        >
          <Input
            placeholder="请输入管理员账号"
            size="large"
            className="rounded-md border border-gray-200 px-4 py-2.5 text-base focus:border-primary-500 focus:ring-1 focus:ring-primary-200 focus:outline-none transition-all duration-200 hover:border-gray-300"
          />
        </Form.Item>

        {/* 密码登录 */}
        <Form.Item
          name="password"
          rules={[
            { required: true, message: '请输入密码' },
            { min: 6, message: '密码长度不能少于6位' }
          ]}
          className="mb-4"
        >
          <Input.Password
            placeholder="请输入密码"
            size="large"
            className="rounded-md border border-gray-200 px-4 py-2.5 text-base focus:border-primary-500 focus:ring-1 focus:ring-primary-200 focus:outline-none transition-all duration-200 hover:border-gray-300"
            iconRender={(visible) => (
              <FontAwesomeIcon
                icon={visible ? faEyeSlash : faEye}
                onClick={() => setShowPassword(!showPassword)}
                className="cursor-pointer text-gray-500 hover:text-gray-700 transition-colors duration-200"
              />
            )}
            visibilityToggle={{ visible: showPassword, onVisibleChange: setShowPassword }}
          />
        </Form.Item>

        {/* 忘记密码 */}
        <div className="flex justify-end items-center mb-6">
          <a
            href="#"
            className="text-sm text-primary-600 hover:text-primary-700 hover:underline transition-colors duration-200"
          >
            <span className="text-blue-500 hover:text-blue-700">忘记密码？</span>
          </a>
        </div>

        {/* 登录按钮 */}
        <Form.Item className="mb-6">
          <Button
            type="primary"
            htmlType="submit"
            size="large"
            className="w-full rounded-md bg-primary-600 hover:bg-primary-700 text-white font-semibold text-base py-2.5 px-6 transition-all duration-200 flex items-center justify-center"
            loading={isLoading}
          >
            登录管理后台
          </Button>
        </Form.Item>

        {/* 流畅滑动验证码模态框 */}
        <SlideCaptchaModal
          visible={captchaModalVisible}
          onClose={() => {
            setCaptchaModalVisible(false);
            setFormData(null);
          }}
          onSuccess={handleCaptchaSuccess}
          imgUrl={getRandomCaptchaImage()}
          captchaProps={{
            gapShape: 'trapezoid',
            gapTolerance: 6,
            tipText: '拖动滑块完成拼图'
          }}
        />

        {/* 返回前台 */}
        <div className="text-center">
          <Link
            to="/"
            className="text-sm text-primary-600 hover:text-primary-700 hover:underline transition-colors duration-200 flex items-center justify-center gap-1"
          >
            <span className="text-gray-700 hover:text-gray-500">返回前台首页</span>
          </Link>
        </div>
      </Form>
    </AuthLayout>
  );
};
export default AdminLogin;
