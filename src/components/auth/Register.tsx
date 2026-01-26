import React, { useState } from 'react';
import { Button, Input, Form, message, Checkbox } from 'antd';
import { Link, useNavigate } from 'react-router-dom';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-regular-svg-icons';
import AuthLayout from '../../layouts/AuthLayout';
import SlideCaptchaModal from './captcha/SlideCaptchaModal.tsx';
import { useUser } from '../../store';

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
  const { register, sendCode, isLoading } = useUser();
  const [showPassword, setShowPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState<PasswordStrength>('weak');
  const [registerType, setRegisterType] = useState<'password' | 'code'>('code');
  const [captchaModalVisible, setCaptchaModalVisible] = useState(false);
  const [formData, setFormData] = useState<RegisterFormData | null>(null);
  const [codeCountdown, setCodeCountdown] = useState(0);
  const [form] = Form.useForm<RegisterFormData>();

  // 开始倒计时
  const startCountdown = () => {
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
    if (password.length < 6) return 'weak';
    if (password.length < 10) return 'medium';
    return 'strong';
  };

  // 密码变化处理
  const handlePasswordChange = (value: string) => {
    setPasswordStrength(checkPasswordStrength(value));
  };

  // 表单提交处理
  const handleRegister = (values: RegisterFormData) => {
    // 保存表单数据，弹出验证码模态框
    setFormData(values);
    setCaptchaModalVisible(true);
  };
  
  // 验证码成功后的注册处理
  const handleCaptchaSuccess = async () => {
    if (!formData) return;
    
    try {
      await register({
        ...formData,
        registerType,
        agreeTerms: formData.agreeTerms || false,
      });
      
      message.success('注册成功，欢迎加入InkStage！');
      // 延迟跳转，让用户看到成功提示
      setTimeout(() => {
        navigate('/');
      }, 1000);
    } catch (error: any) {
      const errorMsg = error?.response?.data?.message || error?.message || '注册失败，请稍后重试';
      message.error(errorMsg);
      console.error('注册失败:', error);
    } finally {
      setCaptchaModalVisible(false);
      setFormData(null);
    }
  };

  // 发送验证码
  const handleSendCode = async () => {
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
      await sendCode({
        target: account,
        type,
        purpose: 'register',
      });
      message.success('验证码已发送，有效期5分钟');
      startCountdown();
    } catch (error: any) {
      const errorMsg = error?.response?.data?.message || error?.message || '验证码发送失败，请稍后重试';
      message.error(errorMsg);
    }
  };

  return (
    <AuthLayout title="">
      {/* 第一层：左侧注册，右侧登录链接 */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold bg-linear-to-r from-blue-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent">注册</h2>
        <div className="text-sm">
          <span className="text-gray-600">已有账号？</span>
          <Link to="/login" className="ml-1 text-primary-600 hover:text-primary-700 hover:underline transition-colors duration-200">
            点击登录
          </Link>
        </div>
      </div>
      
      {/* 注册表单 */}
      <Form
        form={form}
        onFinish={handleRegister}
        layout="vertical"
        className="w-full"
      >
        {/* 第二层：用户名/邮箱/手机号输入 */}
        <Form.Item
          name="account"
          rules={[
            { required: true, message: '请输入用户名、邮箱或手机号' },
            {
              validator: (_, value) => {
                if (!value) return Promise.resolve();
                // 简单的邮箱或手机号验证
                const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
                const isPhone = /^1[3-9]\d{9}$/.test(value);
                const isUsername = /^[a-zA-Z0-9_]{3,50}$/.test(value);
                
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
                { min: 6, max: 50, message: '密码长度必须在6-50个字符之间' }
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
              />
            </Form.Item>
            
            {/* 密码强度提示 - 仅当输入密码时显示 */}
            {form.getFieldValue('password') && (
              <div className="mb-4 py-2">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs text-gray-600">密码强度：</span>
                  <span className={`text-xs font-medium ${passwordStrength === 'weak' ? 'text-red-500' : passwordStrength === 'medium' ? 'text-yellow-500' : 'text-green-500'}`}>
                    {passwordStrength === 'weak' && '弱'}
                    {passwordStrength === 'medium' && '中'}
                    {passwordStrength === 'strong' && '强'}
                  </span>
                </div>
                <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full rounded-full transition-all duration-300" 
                    style={{
                      width: passwordStrength === 'weak' ? '33%' : 
                            passwordStrength === 'medium' ? '66%' : '100%',
                      backgroundColor: passwordStrength === 'weak' ? '#ef4444' : 
                                       passwordStrength === 'medium' ? '#f59e0b' : '#10b981'
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
                  validator: (_, value) => {
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
              />
            </Form.Item>
          </>
        )}
        
        {/* 验证码注册方式 */}
        {registerType === 'code' && (
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
                disabled={isLoading || codeCountdown > 0}
              >
                {codeCountdown > 0 ? `${codeCountdown}s后重发` : '获取验证码'}
              </Button>
            </div>
          </Form.Item>
        )}
        
        {/* 第四层：同意条款和注册类型切换 */}
        <div className="flex justify-between items-center mb-6">
          <Form.Item name="agreeTerms" valuePropName="checked" noStyle>
            <Checkbox className="text-sm text-gray-600">
              我已阅读并同意
              <a href="#" className="mx-1 text-primary-600 hover:text-primary-700 hover:underline transition-colors duration-200 cursor-pointer" onClick={(e) => {
                e.preventDefault();
                message.info('🤫 悄悄告诉你, 用户协议还在和产品经理“打架”中, 敬请期待！');
              }}>服务条款</a>
              和
              <a href="#" className="mx-1 text-primary-600 hover:text-primary-700 hover:underline transition-colors duration-200 cursor-pointer" onClick={(e) => {
                e.preventDefault();
                message.info('🔒 隐私政策正在“梳妆打扮”, 马上就和大家见面啦！');
              }}>隐私政策</a>
            </Checkbox>
          </Form.Item>
          
          <a 
            href="#" 
            className="text-sm text-primary-600 hover:text-primary-700 hover:underline transition-colors duration-200"
            onClick={(e) => {
              e.preventDefault();
              setRegisterType(registerType === 'password' ? 'code' : 'password');
              form.resetFields(['password', 'confirmPassword', 'code']);
            }}
          >
            {registerType === 'password' ? '验证码注册' : '密码注册'}
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
              imgUrl="https://picsum.photos/320/200"
              captchaProps={{
                  gapShape: 'trapezoid', // 梯形缺口
                  gapTolerance: 6, // 更严格的对齐精度
                  tipText: '拖动滑块完成拼图',
              }}
          />
      </Form>
    </AuthLayout>
  );
};

export default Register;