import React, {useState} from 'react';
import {Button, Input, Form, message, Checkbox} from 'antd';
import {Link, useNavigate} from 'react-router-dom';

import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faEye, faEyeSlash} from '@fortawesome/free-regular-svg-icons';
import AuthLayout from '../../layouts/AuthLayout';
import SlideCaptchaModal from './captcha/SlideCaptchaModal.tsx';
import {useUser} from '../../store';

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
    const navigate = useNavigate();
    const {login} = useUser();
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [loginType, setLoginType] = useState<'password' | 'code'>('password');
    const [captchaModalVisible, setCaptchaModalVisible] = useState(false);
    const [formData, setFormData] = useState<LoginFormData | null>(null);
    const [form] = Form.useForm<LoginFormData>();

    // 表单提交处理
    const handleLogin = (values: LoginFormData) => {
        // 保存表单数据，弹出验证码模态框
        setFormData(values);
        setCaptchaModalVisible(true);
    };

    // 验证码成功后的登录处理
    const handleCaptchaSuccess = async () => {
        if (!formData) return;

        setIsLoading(true);
        try {
            // 模拟登录请求
            await new Promise(resolve => setTimeout(resolve, 1000));

            // 登录成功，更新用户状态
            login({
                id: '1',
                name: formData.account || '测试用户',
                email: formData.account || 'test@example.com'
            });

            message.success('登录成功');
            navigate('/');
        } catch (error) {
            message.error('登录失败，请检查您的账号和密码');
            console.error(error);
        } finally {
            setIsLoading(false);
            setCaptchaModalVisible(false);
            setFormData(null);
        }
    };

    // 发送验证码
    const handleSendCode = () => {
        message.success('验证码已发送，有效期5分钟');
    };

    return (
        <AuthLayout title="">
            {/* 登录表单 */}
            <Form
                form={form}
                onFinish={handleLogin}
                layout="vertical"
                className="w-full"
            >
                {/* 第一层：左侧登录，右侧注册链接 */}
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-semibold bg-linear-to-r from-blue-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent">登录</h2>
                    <div className="text-sm">
                        <span className="text-gray-600">没有账号？</span>
                        <Link to="/register"
                              className="ml-1 text-primary-600 hover:text-primary-700 hover:underline transition-colors duration-200">
                            点击注册
                        </Link>
                    </div>
                </div>

                {/* 第二层：用户名/邮箱/手机号输入 */}
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
                            {required: true, message: '请输入密码'},
                            {min: 6, message: '密码长度不能少于6位'}
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
                            visibilityToggle={{visible: showPassword, onVisibleChange: setShowPassword}}
                        />
                    </Form.Item>
                )}

                {/* 验证码登录 */}
                {loginType === 'code' && (
                    <Form.Item
                        name="code"
                        rules={[{required: true, message: '请输入验证码'}]}
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

                {/* 第三层：记住我和登录方式切换 */}
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

                {/* 第四层：登录按钮 */}
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
                        tipText: '拖动滑块完成拼图',
                    }}
                />

                {/* 第五层：忘记密码 */}
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