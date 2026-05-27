import React, { useState } from 'react';
import { Button, Form, Input, message } from 'antd';
import type { RuleObject } from 'antd/es/form';
import { Helmet } from 'react-helmet-async';
import { Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-regular-svg-icons';
import AuthLayout from '../../layouts/AuthLayout';
import authService from '../../services/authService';
import { AuthTypeEnum } from '../../types/enums';
import { ROUTES } from '../../constants/navigation';

// 表单步骤
type Step = 'input' | 'reset';

// 表单数据类型
interface ForgotPasswordFormData {
  account: string;
  code: string;
  newPassword: string;
  confirmPassword: string;
}

// 密码强度类型
type PasswordStrength = 'weak' | 'medium' | 'strong';

const ForgotPassword: React.FC = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm<ForgotPasswordFormData>();
  const [currentStep, setCurrentStep] = useState<Step>('input');
  const [loading, setLoading] = useState(false);
  const [codeCountdown, setCodeCountdown] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState<PasswordStrength>('weak');
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  // 判断账号类型
  const getAccountType = (account: string): 'email' | 'phone' | null => {
    if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(account)) return 'email';
    if (/^1[3-9]\d{9}$/.test(account)) return 'phone';
    return null;
  };

  // 发送验证码
  const handleSendCode = async (): Promise<void> => {
    const account = form.getFieldValue('account');
    if (!account) {
      message.error('请输入邮箱或手机号');
      return;
    }

    const type = getAccountType(account);
    if (!type) {
      message.error('请输入有效的邮箱或手机号');
      return;
    }

    try {
      const response = await authService.sendCode({
        account,
        type,
        purpose: 'forget'
      });
      if (response.code === 200) {
        message.success('验证码已发送，有效期5分钟');
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
      } else {
        message.error(response.message || '验证码发送失败');
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        message.error(error.message || '验证码发送失败，请稍后重试');
      }
    }
  };

  // 第一步：验证账号并发送验证码
  const handleInputSubmit = async (): Promise<void> => {
    try {
      const values = await form.validateFields(['account']);
      const type = getAccountType(values.account);
      if (!type) {
        message.error('请输入有效的邮箱或手机号');
        return;
      }
      // 进入重置密码步骤
      setCurrentStep('reset');
    } catch {
      // 表单校验失败
    }
  };

  // 第二步：重置密码
  const handleResetSubmit = async (values: ForgotPasswordFormData): Promise<void> => {
    const type = getAccountType(values.account);
    if (!type) {
      message.error('请输入有效的邮箱或手机号');
      return;
    }

    setLoading(true);
    try {
      const response = await authService.resetPassword({
        account: values.account,
        authType: type === 'email' ? AuthTypeEnum.EMAIL : AuthTypeEnum.PHONE,
        code: values.code,
        newPassword: values.newPassword,
        confirmPassword: values.confirmPassword
      });

      if (response.code === 200) {
        message.success('密码重置成功，请使用新密码登录');
        navigate(ROUTES.LOGIN);
      } else {
        message.error(response.message || '密码重置失败');
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        message.error(error.message || '密码重置失败，请稍后重试');
      }
    } finally {
      setLoading(false);
    }
  };

  // 密码强度检测
  const checkPasswordStrength = (password: string): PasswordStrength => {
    if (!password) return 'weak';
    let strength = 0;
    if (password.length >= 6) strength++;
    if (password.length >= 10) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    if (strength <= 2) return 'weak';
    if (strength <= 3) return 'medium';
    return 'strong';
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const password = e.target.value;
    setPasswordStrength(checkPasswordStrength(password));
  };

  const strengthConfig: Record<PasswordStrength, { label: string; color: string; width: string }> = {
    weak: { label: '弱', color: 'bg-red-400', width: 'w-1/3' },
    medium: { label: '中', color: 'bg-yellow-400', width: 'w-2/3' },
    strong: { label: '强', color: 'bg-green-400', width: 'w-full' }
  };

  return (
    <>
      <Helmet>
        <title>忘记密码 - InkStage</title>
      </Helmet>
      <AuthLayout title="忘记密码" isPasswordGuardMode={passwordFocused} isTyping={isTyping}>
        <Form form={form} onFinish={currentStep === 'reset' ? handleResetSubmit : undefined} layout="vertical" className="w-full">
          {/* 标题与返回登录 */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold bg-linear-to-r from-blue-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent">
              {currentStep === 'input' ? '验证账号' : '重置密码'}
            </h2>
            <div className="text-sm">
              <Link to={ROUTES.LOGIN} className="hover:underline transition-colors duration-200">
                <span className="text-blue-500 hover:text-blue-700">返回登录</span>
              </Link>
            </div>
          </div>

          {/* 账号输入 */}
          <Form.Item
            name="account"
            rules={[{ required: true, message: '请输入邮箱或手机号' }]}
            className="mb-4"
          >
            <Input
              placeholder="邮箱或手机号"
              size="large"
              disabled={currentStep === 'reset'}
              className="rounded-md border border-gray-200 px-4 py-2.5 text-base focus:border-primary-500 focus:ring-1 focus:ring-primary-200 focus:outline-none transition-all duration-200 hover:border-gray-300"
              onFocus={() => setIsTyping(true)}
              onBlur={() => setIsTyping(false)}
            />
          </Form.Item>

          {currentStep === 'input' ? (
            <>
              {/* 提示文字 */}
              <p className="text-[13px] text-gray-500 mb-6">
                请输入注册时绑定的邮箱或手机号，我们将发送验证码以验证您的身份。
              </p>

              {/* 下一步按钮 */}
              <Form.Item className="mb-4">
                <Button
                  type="primary"
                  size="large"
                  className="w-full rounded-md bg-primary-600 hover:bg-primary-700 text-white font-semibold text-base py-2.5 px-6 transition-all duration-200"
                  onClick={handleInputSubmit}
                >
                  下一步
                </Button>
              </Form.Item>
            </>
          ) : (
            <>
              {/* 验证码 */}
              <Form.Item name="code" rules={[{ required: true, message: '请输入验证码' }]} className="mb-4">
                <div className="flex gap-3 items-center">
                  <Input
                    placeholder="请输入验证码"
                    size="large"
                    className="flex-1 rounded-md border border-gray-200 px-4 py-2.5 text-base focus:border-primary-500 focus:ring-1 focus:ring-primary-200 focus:outline-none transition-all duration-200 hover:border-gray-300"
                    onFocus={() => setIsTyping(true)}
                    onBlur={() => setIsTyping(false)}
                  />
                  <Button
                    type="primary"
                    size="large"
                    disabled={codeCountdown > 0}
                    className="rounded-md bg-primary-600 hover:bg-primary-700 text-white font-medium px-6 py-2.5 transition-all duration-200 hover:shadow-sm whitespace-nowrap"
                    onClick={handleSendCode}
                  >
                    {codeCountdown > 0 ? `${codeCountdown}s` : '获取验证码'}
                  </Button>
                </div>
              </Form.Item>

              {/* 新密码 */}
              <Form.Item
                name="newPassword"
                rules={[
                  { required: true, message: '请输入新密码' },
                  { min: 6, message: '密码长度不能少于6位' },
                  { max: 20, message: '密码长度不能超过20位' }
                ]}
                className="mb-2"
              >
                <Input.Password
                  placeholder="请输入新密码（6-20位）"
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
                  onChange={handlePasswordChange}
                  onFocus={() => setPasswordFocused(true)}
                  onBlur={() => setPasswordFocused(false)}
                />
              </Form.Item>

              {/* 密码强度指示器 */}
              <div className="mb-4">
                <div className="flex gap-1 mb-1">
                  <div className={`h-1.5 rounded-full transition-all duration-300 ${strengthConfig[passwordStrength].width} ${strengthConfig[passwordStrength].color}`} />
                  <div className="h-1.5 rounded-full bg-gray-200 flex-1" />
                </div>
                <p className="text-xs text-gray-500">密码强度：{strengthConfig[passwordStrength].label}</p>
              </div>

              {/* 确认新密码 */}
              <Form.Item
                name="confirmPassword"
                label="确认新密码"
                dependencies={['newPassword']}
                rules={[
                  { required: true, message: '请确认新密码' },
                  ({ getFieldValue }): RuleObject => ({
                    validator(_: RuleObject, value: string): Promise<void> {
                      if (!value || getFieldValue('newPassword') === value) {
                        return Promise.resolve();
                      }
                      return Promise.reject(new Error('两次输入的密码不一致'));
                    }
                  })
                ]}
                className="mb-6"
              >
                <Input.Password
                  placeholder="请再次输入新密码"
                  size="large"
                  className="rounded-md border border-gray-200 px-4 py-2.5 text-base focus:border-primary-500 focus:ring-1 focus:ring-primary-200 focus:outline-none transition-all duration-200 hover:border-gray-300"
                />
              </Form.Item>

              {/* 重置密码按钮 */}
              <Form.Item className="mb-4">
                <Button
                  type="primary"
                  htmlType="submit"
                  size="large"
                  loading={loading}
                  className="w-full rounded-md bg-primary-600 hover:bg-primary-700 text-white font-semibold text-base py-2.5 px-6 transition-all duration-200"
                >
                  重置密码
                </Button>
              </Form.Item>
            </>
          )}

        </Form>
      </AuthLayout>
    </>
  );
};

export default ForgotPassword;
