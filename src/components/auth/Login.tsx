import React, { useState } from 'react';
import { Button, Input, Form, message, Checkbox } from 'antd';
import { Link } from 'react-router-dom';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-regular-svg-icons';
import AuthLayout from '../../layouts/AuthLayout';
import SlideCaptchaModal from './captcha/SlideCaptchaModal.tsx';
import { useAuth } from '../../hooks/useAuth';

// 登录表单数据类型
interface LoginFormData {
    // 统一登录字段
    account: string;
    password?: string;
    code?: string;
    // 通用
    remember?: boolean;
}

const Login: React.FC = () => {
  const { handleLogin, isLoading, sendCode } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [loginType, setLoginType] = useState<'password' | 'code'>('code');
  const [captchaModalVisible, setCaptchaModalVisible] = useState(false);
  const [formData, setFormData] = useState<LoginFormData | null>(null);
  const [form] = Form.useForm<LoginFormData>();

  // 表单提交处理
  const handleFormSubmit = (values: LoginFormData) : void => {
    // 保存表单数据，弹出验证码模态框
    setFormData(values);
    setCaptchaModalVisible(true);
  };

  // 验证码成功后的登录处理
  const handleCaptchaSuccess = async () : Promise<void> => {
    if (!formData) return;

    try {
      const response = await handleLogin({
        account: formData.account,
        authType: loginType,
        password: formData.password || '',
        code: formData.code || '',
        remember: formData.remember || false
      });

      if (response.code !== 200) {
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

  // 发送验证码
  const handleSendCode = async () : Promise<void> => {
    const account = form.getFieldValue('account');
    if (!account) {
      message.error('请输入邮箱或手机号');
      return;
    }

    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(account);
    const isPhone = /^1[3-9]\d{9}$/.test(account);

    if (!isEmail && !isPhone) {
      message.error('请输入有效的邮箱或手机号');
      return;
    }

    const type = isEmail ? 'email' : 'phone';

    try {
      const response = await sendCode({
        account: account,
        type,
        purpose: 'login'
      });
      if (response.code === 200) {
        message.success(response.message || '验证码已发送，有效期5分钟');
        // 开始倒计时
        let countdown = 60;
        const timer = setInterval(() => {
          countdown--;
          if (countdown <= 0) {
            clearInterval(timer);
          }
        }, 1000);
      } else {
        message.error(response.message);
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        message.error(error.message || '验证码发送失败，请稍后重试');
      }
      console.error('验证码发送失败:', error);
    }
  };

  return (
    <AuthLayout title="">
      {/* 登录表单 */}
      <Form
        form={form}
        onFinish={handleFormSubmit}
        layout="vertical"
        className="w-full"
      >
        {/* 左侧登录，右侧注册链接 */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold bg-linear-to-r from-blue-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent">请登录</h2>
          <div className="text-sm">
            <span className="text-gray-600">没有账号？</span>
            <Link to="/register"
              className="ml-1 text-primary-600 hover:text-primary-700 hover:underline transition-colors duration-200">
                            点击注册
            </Link>
          </div>
        </div>

        {/* 用户名/邮箱/手机号输入 */}
        <Form.Item
          name="account"
          rules={[
            {
              required: true,
              message: loginType === 'code' ? '请输入邮箱或手机号' : '请输入用户名、邮箱或手机号'
            }
          ]}
          className="mb-4"
        >
          <Input
            placeholder={loginType === 'code' ? '请输入邮箱或手机号' : '请输入用户名、邮箱或手机号'}
            size="large"
            className="rounded-md border border-gray-200 px-4 py-2.5 text-base focus:border-primary-500 focus:ring-1 focus:ring-primary-200 focus:outline-none transition-all duration-200 hover:border-gray-300"
          />
        </Form.Item>

        {/* 密码登录 */}
        {loginType === 'password' && (
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
        )}

        {/* 验证码登录 */}
        {loginType === 'code' && (
          <Form.Item
            name="code"
            rules={[{ required: true, message: '请输入验证码' }]}
            className="mb-4"
          >
            <div className="flex gap-3 items-center">
              <Input
                placeholder="请输入验证码"
                size="large"
                className="flex-1 rounded-md border border-gray-200 px-4 py-2.5 text-base focus:border-primary-500 focus:ring-1 focus:ring-primary-200 focus:outline-none transition-all duration-200 hover:border-gray-300"
              />
              <Button
                type="primary"
                size="large"
                className="rounded-md bg-primary-600 hover:bg-primary-700 text-white font-medium px-6 py-2.5 transition-all duration-200 hover:shadow-sm"
                onClick={handleSendCode}
              >
                                获取验证码
              </Button>
            </div>
          </Form.Item>
        )}

        {/* 记住我和登录方式切换 */}
        <div className="flex justify-between items-center mb-6">
          <Form.Item name="remember" valuePropName="checked" noStyle>
            <Checkbox className="text-sm text-gray-600">记住我</Checkbox>
          </Form.Item>

          <a
            href="#"
            className="text-sm text-primary-600 hover:text-primary-700 hover:underline transition-colors duration-200"
            onClick={(e) => {
              e.preventDefault();
              setLoginType(loginType === 'password' ? 'code' : 'password');
              form.resetFields(['password', 'code']);
            }}
          >
            {loginType === 'password' ? '验证码登录' : '密码登录'}
          </a>
        </div>

        {/* 登录按钮 */}
        <Form.Item className="mb-4">
          <Button
            type="primary"
            htmlType="submit"
            size="large"
            className="w-full rounded-md bg-primary-600 hover:bg-primary-700 text-white font-semibold text-base py-2.5 px-6 transition-all duration-200 flex items-center justify-center"
            loading={isLoading}
          >
                        登录
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
          imgUrl="https://picsum.photos/320/200"
          captchaProps={{
            gapShape: 'trapezoid', // 梯形缺口
            gapTolerance: 6, // 更严格的对齐精度
            tipText: '拖动滑块完成拼图'
          }}
        />

        {/* 忘记密码 */}
        <div className="text-center">
          <a href="#"
            className="text-sm text-primary-600 hover:text-primary-700 hover:underline transition-colors duration-200">
                        已有账号，忘记密码？
          </a>
        </div>
      </Form>
    </AuthLayout>
  );
};

export default Login;
