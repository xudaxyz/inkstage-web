import React, { useState } from 'react';
import { Button, Checkbox, Form, Input, message } from 'antd';
import { Helmet } from 'react-helmet-async';
import { Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-regular-svg-icons';
import AuthLayout from '../../layouts/AuthLayout';
import SlideCaptchaModal from './captcha/SlideCaptchaModal';
import { useUserStore } from '../../store';
import type { AuthTypeEnum } from '../../types/enums';
import { getRandomCaptchaImage } from '../../utils';
import { ROUTES } from '../../constants/navigation';

// 注册表单数据类型
interface RegisterFormData {
  // 统一注册字段
  account: string;
  password?: string;
  confirmPassword?: string;
  code?: string;
  // 通用
  agreeTerms?: boolean;
}

// 密码强度类型
type PasswordStrength = 'weak' | 'medium' | 'strong';

const Register: React.FC = () => {
  const navigate = useNavigate();
  const { register, sendCode, isLoading } = useUserStore();
  const [showPassword, setShowPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState<PasswordStrength>('weak');
  const [registerType, setRegisterType] = useState<'password' | 'code'>('code');
  const [captchaModalVisible, setCaptchaModalVisible] = useState(false);
  const [formData, setFormData] = useState<RegisterFormData | null>(null);
  const [codeCountdown, setCodeCountdown] = useState(0);
  const [form] = Form.useForm<RegisterFormData>();
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  // 开始倒计时
  const startCountdown = (): void => {
    setCodeCountdown(60);
    const timer = setInterval(() => {
      setCodeCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // 检查密码强度
  const checkPasswordStrength = (password: string): PasswordStrength => {
    if (!password) return 'weak';

    let score = 0;
    // 长度检查
    if (password.length >= 8) score += 1;
    if (password.length >= 12) score += 1;

    // 复杂度检查
    if (/[A-Z]/.test(password)) score += 1; // 包含大写字母
    if (/[a-z]/.test(password)) score += 1; // 包含小写字母
    if (/\d/.test(password)) score += 1; // 包含数字
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score += 1; // 包含特殊字符

    if (score < 3) return 'weak';
    if (score < 5) return 'medium';
    return 'strong';
  };

  // 密码变化处理
  const handlePasswordChange = (value: string): void => {
    setPasswordStrength(checkPasswordStrength(value));
  };

  // 表单提交处理
  const handleRegister = (values: RegisterFormData): void => {
    // 保存表单数据，弹出验证码模态框
    setFormData(values);
    setCaptchaModalVisible(true);
  };

  // 验证码成功后的注册处理
  const handleCaptchaSuccess = async (): Promise<void> => {
    if (!formData) return;
    // 显示加载状态
    const successMessage = message.loading('注册中，请稍候...', 0);
    try {
      // 确定认证类型
      let authType;
      if (registerType === 'password') {
        authType = 'USERNAME';
      } else {
        // 验证码注册，根据账号类型确定认证类型
        const isEmail = /^[^@]+@[^@]+\.[^@]+$/.test(formData.account);
        authType = isEmail ? 'EMAIL' : 'PHONE';
      }

      const response = await register({
        account: formData.account,
        authType: authType as AuthTypeEnum,
        password: formData.password || '',
        confirmPassword: formData.confirmPassword || '',
        code: formData.code || '',
        agreeTerms: formData.agreeTerms || false
      });

      if (response.code === 200) {
        // 关闭加载状态，显示成功提示
        successMessage(); // 关闭loading
        message.success({
          content: response.message || '注册成功，欢迎加入InkStage！',
          duration: 3,
          className: 'text-lg font-medium'
        });
        // 延迟跳转，让用户看到成功提示，并添加引导流程
        setTimeout(() => {
          // 根据注册类型和账号类型进行不同的跳转
          if (registerType === 'code') {
            // 验证码注册（邮箱+验证码），直接跳转到首页
            navigate(ROUTES.HOME);
          } else if (registerType === 'password') {
            // 密码注册（用户名+密码），跳转到登录页面并传递用户名参数
            navigate({
              pathname: '/login',
              search: `?username=${encodeURIComponent(formData.account)}`
            });
          }
        }, 2000);
      } else {
        successMessage(); // 关闭loading
        message.error(response.message);
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        message.error({
          content: error.message || '注册失败，请稍后重试!',
          duration: 5
        });
      }
      console.error('注册失败:', error);
    } finally {
      successMessage();
      setCaptchaModalVisible(false);
      setFormData(null);
    }
  };

  // 发送验证码
  const handleSendCode = async (): Promise<void> => {
    const account = form.getFieldValue('account');
    if (!account) {
      message.error('请先输入邮箱或手机号');
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
        purpose: 'register'
      });
      if (response.code === 200) {
        message.success(response.message || '验证码已发送，有效期5分钟');
      }
      startCountdown();
    } catch (error: unknown) {
      if (error instanceof Error) {
        message.error(error.message || '验证码发送失败，请稍后重试');
      }
    }
  };

  return (
    <>
      <Helmet>
        <title>注册 - InkStage</title>
      </Helmet>
      <AuthLayout title="注册" isPasswordGuardMode={passwordFocused} isTyping={isTyping}>
        {/* 注册表单 */}
        <Form form={form} onFinish={handleRegister} layout="vertical" className="w-full">
          {/* 左侧注册，右侧登录链接 */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold bg-linear-to-r from-blue-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent">
              欢迎注册
            </h2>
            <div className="text-sm">
              <span className="text-gray-600">已有账号？</span>
              <Link to={ROUTES.LOGIN} className="ml-1 hover:underline transition-colors duration-200">
                <span className="text-blue-600 hover:text-blue-800">点击登录</span>
              </Link>
            </div>
          </div>
          {/* 用户名/邮箱/手机号输入 */}
          <Form.Item
            name="account"
            rules={[
              { required: true, message: '请输入用户名、邮箱或手机号' },
              {
                validator: (_, value): Promise<void> => {
                  if (!value) return Promise.resolve();
                  // 邮箱或手机号验证
                  const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
                  const isPhone = /^1[3-9]\d{9}$/.test(value);
                  const isUsername = /^[a-zA-Z0-9_\u4e00-\u9fa5]{2,16}$/.test(value);

                  if (isEmail || isPhone || isUsername) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('请输入有效的用户名、邮箱或手机号'));
                }
              }
            ]}
            className="mb-4"
          >
            <Input
              placeholder="请输入用户名、邮箱或手机号"
              size="large"
              className="rounded-md border border-gray-200 px-4 py-2.5 text-base focus:border-primary-500 focus:ring-1 focus:ring-primary-200 focus:outline-none transition-all duration-200 hover:border-gray-300"
              onFocus={() => setIsTyping(true)}
              onBlur={() => setIsTyping(false)}
            />
          </Form.Item>

          {/* 密码注册方式 */}
          {registerType === 'password' && (
            <>
              {/* 第三层：密码输入 */}
              <Form.Item
                name="password"
                rules={[
                  { required: true, message: '请输入密码' },
                  { min: 6, max: 32, message: '密码长度必须在6-32个字符之间' },
                  {
                    validator: (_, value): Promise<void> => {
                      if (!value) return Promise.resolve();
                      if (value.length < 6) return Promise.reject(new Error('密码长度至少6位'));
                      return Promise.resolve();
                    }
                  }
                ]}
                className="mb-2"
              >
                <Input.Password
                  placeholder="请输入密码"
                  size="large"
                  className="rounded-md border border-gray-200 px-4 py-2.5 text-base focus:border-primary-500 focus:ring-1 focus:ring-primary-200 focus:outline-none transition-all duration-200 hover:border-gray-300"
                  onChange={(e) => handlePasswordChange(e.target.value)}
                  iconRender={(visible) => (
                    <FontAwesomeIcon
                      icon={visible ? faEyeSlash : faEye}
                      onClick={() => setShowPassword(!showPassword)}
                      className="cursor-pointer text-gray-500 hover:text-gray-700 transition-colors duration-200"
                    />
                  )}
                  visibilityToggle={{ visible: showPassword, onVisibleChange: setShowPassword }}
                  onFocus={() => setPasswordFocused(true)}
                  onBlur={() => setPasswordFocused(false)}
                />
              </Form.Item>

              {/* 密码强度提示 - 仅当输入密码时显示 */}
              {form.getFieldValue('password') && (
                <div className="mb-4 py-2">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs text-gray-600">密码强度：</span>
                    <span
                      className={`text-xs font-medium ${passwordStrength === 'weak' ? 'text-red-500' : passwordStrength === 'medium' ? 'text-yellow-500' : 'text-green-500'}`}
                    >
                      {passwordStrength === 'weak' && '弱'}
                      {passwordStrength === 'medium' && '中'}
                      {passwordStrength === 'strong' && '强'}
                    </span>
                  </div>
                  <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{
                        width: passwordStrength === 'weak' ? '33%' : passwordStrength === 'medium' ? '66%' : '100%',
                        backgroundColor:
                          passwordStrength === 'weak'
                            ? '#ef4444'
                            : passwordStrength === 'medium'
                              ? '#f59e0b'
                              : '#10b981'
                      }}
                    ></div>
                  </div>
                </div>
              )}

              {/* 确认密码输入 */}
              <Form.Item
                name="confirmPassword"
                dependencies={['password']}
                rules={[
                  { required: true, message: '请确认密码' },
                  {
                    validator: (_, value): Promise<void> => {
                      const password = form.getFieldValue('password');
                      if (!value || password === value) {
                        return Promise.resolve();
                      }
                      return Promise.reject(new Error('两次输入的密码不一致'));
                    }
                  }
                ]}
                className="mb-4"
              >
                <Input.Password
                  placeholder="请再次输入密码"
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
                  onFocus={() => setPasswordFocused(true)}
                  onBlur={() => setPasswordFocused(false)}
                />
              </Form.Item>
            </>
          )}

          {/* 验证码注册方式 */}
          {registerType === 'code' && (
            <Form.Item name="code" rules={[{ required: true, message: '请输入验证码' }]} className="mb-4">
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
                  disabled={isLoading || codeCountdown > 0}
                >
                  {codeCountdown > 0 ? `${codeCountdown}s后重发` : '获取验证码'}
                </Button>
              </div>
            </Form.Item>
          )}

          {/* 同意条款和注册类型切换 */}
          <div className="flex justify-between items-center mb-6">
            <Form.Item name="agreeTerms" valuePropName="checked" noStyle>
              <Checkbox className="text-sm text-gray-600">
                我已阅读并同意
                <a
                  href="#"
                  className="mx-1 hover:underline transition-colors duration-200 cursor-pointer"
                  onClick={(e) => {
                    e.preventDefault();
                    void message.info('🤫 悄悄告诉你, 用户协议还在和产品经理"打架"中, 敬请期待！');
                  }}
                >
                  <span className="text-blue-500 hover:text-blue-700">服务条款</span>
                </a>
                和
                <a
                  href="#"
                  className="mx-1 text-primary-600 hover:text-primary-700 hover:underline transition-colors duration-200 cursor-pointer"
                  onClick={(e) => {
                    e.preventDefault();
                    void message.info('🔒 隐私政策正在“梳妆打扮”, 马上就和大家见面啦！');
                  }}
                >
                  <span className="text-blue-500 hover:text-blue-700">隐私政策</span>
                </a>
              </Checkbox>
            </Form.Item>

            <a
              href="#"
              className="text-sm text-primary-600 hover:text-primary-700 hover:underline transition-colors duration-200"
              onClick={(e) => {
                e.preventDefault();
                // 切换注册类型
                const newRegisterType = registerType === 'password' ? 'code' : 'password';
                setRegisterType(newRegisterType);
                // 重置相关字段
                if (newRegisterType === 'code') {
                  // 切换到验证码注册，重置密码相关字段
                  form.resetFields(['password', 'confirmPassword']);
                } else {
                  // 切换到密码注册，重置验证码字段
                  form.resetFields(['code']);
                }
                // 重置密码强度状态
                setPasswordStrength('weak');
              }}
            >
              <span className="text-blue-600 hover:text-blue-800">
                {registerType === 'password' ? '验证码注册' : '密码注册'}
              </span>
            </a>
          </div>

          {/* 第六层：注册按钮 */}
          <Form.Item className="mb-6">
            <Button
              type="primary"
              htmlType="submit"
              size="large"
              className="w-full rounded-md bg-primary-600 hover:bg-primary-700 text-white font-semibold text-base py-2.5 px-6 transition-all duration-200 flex items-center justify-center"
              loading={isLoading}
            >
              注册
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
              gapShape: 'trapezoid', // 梯形缺口
              gapTolerance: 6, // 更严格的对齐精度
              tipText: '拖动滑块完成拼图'
            }}
          />
        </Form>
      </AuthLayout>
    </>
  );
};

export default Register;
