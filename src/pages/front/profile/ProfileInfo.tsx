import React, {useState, useEffect} from 'react';
import {Card, Form, Input, Button, Avatar, message, DatePicker, Upload, Tooltip, Radio} from 'antd';
import {
    SaveOutlined,
    CameraOutlined,
    UploadOutlined,
    ManOutlined,
    WomanOutlined,
    LockOutlined
} from '@ant-design/icons';
import {useUser} from '../../../store';
import authService from '../../../services/authService.ts';
import type {UploadProps} from 'antd';
import dayjs, {type Dayjs} from 'dayjs';
import {GenderEnum} from '../../../types/enums';

// 表单值类型定义
type ProfileFormValues = {
    name: string;
    email: string;
    nickname: string;
    gender: GenderEnum | undefined;
    birthDate: string | Dayjs | undefined;
    location: string;
    signature: string;
};

const {TextArea} = Input;

const ProfileInfo: React.FC = () => {
    const {user, updateUser, getProfile} = useUser();
    const [form] = Form.useForm();
    const [isModified, setIsModified] = useState(false);

    // 初始化表单数据
    useEffect(() => {
        // 调用getProfile获取最新的个人资料
        void getProfile();
    }, [getProfile]);

    // 当用户信息更新时，更新表单数据
    useEffect(() => {
        if (user) {
            form.setFieldsValue({
                name: user.name,
                email: user.email,
                nickname: user.nickname || user.name,
                gender: user.gender || GenderEnum.UNKNOWN,
                birthDate: user.birthDate ? dayjs(user.birthDate) : null,
                location: user.location,
                signature: user.signature
            });
        }
    }, [user, form]);

    // 处理表单提交
    const handleSubmit = async (values: ProfileFormValues) => {
        try {
            const submitData = {
                ...values,
                gender: values.gender || GenderEnum.UNKNOWN,
                // 转换生日字段格式
                birthDate: values.birthDate ? (typeof values.birthDate === 'string' ? values.birthDate : values.birthDate.format('YYYY-MM-DD')) : undefined,
            };

            // 调用后端接口更新个人资料
            const response = await authService.updateProfile(submitData);
            if (response.code === 200) {
                // 更新前端状态，确保birthDate映射到birthDate
                const updatedUserData = {
                    ...response.data,
                    birthDate: response.data.birthDate,
                    gender: response.data.gender || GenderEnum.UNKNOWN,
                    name: user.name, // 保留原始的登录账号，避免被覆盖
                    avatar: user.avatar,
                    coverImage: user.coverImage,
                };
                void updateUser(updatedUserData);
                message.success('个人资料更新成功');
                setIsModified(false); // 重置修改状态
            } else {
                message.error('个人资料更新失败: ' + (response.message || ''));
            }
        } catch (error: unknown) {
            console.error('个人资料更新失败:', error);
        }
    };

    // 头像上传配置
    const avatarUploadProps: UploadProps = {
        name: 'avatar',
        multiple: false,
        showUploadList: false,
        customRequest: async (options) => {
            const {file, onSuccess, onError} = options;
            try {
                // 调用服务层上传方法
                const result = await authService.uploadAvatar(file as File, 604800);
                if (result.code === 200) {
                    onSuccess?.(result.data);
                    message.success('头像上传成功');
                    // 上传成功后刷新个人资料
                    void getProfile();
                } else {
                    const errorMsg = result.message || '头像上传失败';
                    onError?.(new Error(errorMsg));
                    message.error(errorMsg);
                }
            } catch (error) {
                const errorMsg = error instanceof Error ? error.message : '上传失败，请重试';
                onError?.(new Error(errorMsg));
                message.error(errorMsg);
            }
        },
        beforeUpload: (file) => {
            // 验证文件类型
            const isImage = file.type.startsWith('image/');
            if (!isImage) {
                void message.error('只能上传图片文件！');
                return Upload.LIST_IGNORE;
            }
            // 验证文件大小
            const isLt5M = file.size / 1024 / 1024 < 5;
            if (!isLt5M) {
                void message.error('图片大小不能超过 5MB！');
                return Upload.LIST_IGNORE;
            }
            return true;
        },
    };

    // 背景图片上传配置
    const coverUploadProps: UploadProps = {
        name: 'cover',
        multiple: false,
        showUploadList: false,
        customRequest: async (options) => {
            const {file, onSuccess, onError} = options;
            try {
                // 调用服务层上传方法
                const result = await authService.uploadCoverImage(file as File, 604800);
                if (result.code === 200) {
                    onSuccess?.(result.data);
                    message.success('封面上传成功');
                    // 上传成功后刷新个人资料
                    void getProfile();
                } else {
                    const errorMsg = result.message || '封面上传失败';
                    onError?.(new Error(errorMsg));
                    message.error(errorMsg);
                }
            } catch (error) {
                const errorMsg = error instanceof Error ? error.message : '上传失败，请重试';
                onError?.(new Error(errorMsg));
                message.error(errorMsg);
            }
        },
        beforeUpload: (file) => {
            // 验证文件类型
            const isImage = file.type.startsWith('image/');
            if (!isImage) {
                void message.error('请上传图片文件！');
                return Upload.LIST_IGNORE;
            }
            // 验证文件大小
            const isLt10M = file.size / 1024 / 1024 < 10;
            if (!isLt10M) {
                void message.error('图片大小不能超过 10MB！');
                return Upload.LIST_IGNORE;
            }
            return true;
        },
    };

    return (
        <div className="mx-auto">
            {/* 背景图片区域 */}
            <div className="relative mb-8">
                <div
                    className="h-60 rounded-2xl overflow-hidden bg-gray-200"
                    style={{
                        backgroundImage: user?.coverImage ? `url(${user.coverImage})` : 'none',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center'
                    }}
                >
                    {!user?.coverImage && (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                        </div>
                    )}

                    {/* 用户信息叠加在封面图片上 */}
                    <div className="absolute bottom-6 left-6 flex items-end gap-4">
                        {/* 头像 */}
                        <div className="shrink-0 relative">
                            <div className="relative">
                                <Avatar
                                    size={100}
                                    src={user?.avatar}
                                    className="border-4 border-white shadow-md"
                                >
                                    {user?.nickname?.charAt(0) || 'U'}
                                </Avatar>
                                <div className="absolute bottom-0 right-0 bg-white rounded-full p-1 shadow-md">
                                    <Upload {...avatarUploadProps} maxCount={1} accept="image/*">
                                        <Tooltip title="上传头像">
                                            <Button icon={<CameraOutlined/>} size="small" className="rounded-full"/>
                                        </Tooltip>
                                    </Upload>
                                </div>
                            </div>
                        </div>

                        {/* 基本信息 */}
                        <div className="text-purple-600 text-shadow">
                            <div className="flex items-center gap-2 mb-1">
                                <h2 className="text-xl font-semibold">{user?.nickname}</h2>
                                {user?.gender === GenderEnum.MALE && (
                                    <span><ManOutlined/></span>
                                )}
                                {user?.gender === GenderEnum.FEMALE && (
                                    <span><WomanOutlined/></span>
                                )}
                            </div>
                            <p className="text-gray-400 truncate max-w-[200px] sm:max-w-[300px] md:max-w-[400px] lg:max-w-[500px]">{user?.signature || '暂无简介'}</p>
                        </div>
                    </div>

                    {/* 设置封面按钮 */}
                    <div className="absolute bottom-10 right-8">
                        <Upload {...coverUploadProps} maxCount={1} accept="image/*">
                            <Button
                                icon={<UploadOutlined/>}
                                className="bg-white/80 backdrop-blur-sm text-gray-700 hover:bg-white"
                            >
                                设置封面图片
                            </Button>
                        </Upload>
                    </div>
                </div>
            </div>

            {/* 个人信息表单 */}
            <Card className="mb-8">
                <h3 className="text-lg font-medium text-gray-800 mb-6">个人信息</h3>

                <Form
                    form={form}
                    onFinish={handleSubmit}
                    onValuesChange={() => setIsModified(true)}
                    layout="vertical"
                >
                    {/* 第一行：登录账号和昵称 */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
                        <div className="pr-4">
                            <Form.Item
                                name="name"
                                label="登录账号"
                            >
                                <Input disabled className="h-12 rounded-lg bg-gray-50 border-gray-200 text-gray-500"/>
                            </Form.Item>
                        </div>

                        <div className="pl-4">
                            <Form.Item
                                name="nickname"
                                label="昵称"
                                rules={[{required: true, message: '请输入昵称'}]}
                            >
                                <Input placeholder="请输入昵称"
                                       className="h-12 rounded-lg border-gray-200 focus:border-blue-500 focus:ring-blue-500"/>
                            </Form.Item>
                        </div>
                    </div>

                    {/* 第二行：性别和生日 */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
                        <div className="pr-4">
                            <Form.Item
                                name="gender"
                                label="性别"
                            >
                                <Radio.Group className="h-12 flex items-center">
                                    <Radio value={GenderEnum.MALE} className="mr-6 flex items-center">
                                        <ManOutlined/> 男
                                    </Radio>
                                    <Radio value={GenderEnum.FEMALE} className="mr-6 flex items-center">
                                        <WomanOutlined/> 女
                                    </Radio>
                                    <Radio value={GenderEnum.SECRET} className="flex items-center">
                                        <LockOutlined/> 保密
                                    </Radio>
                                </Radio.Group>
                            </Form.Item>
                        </div>

                        <div className="pl-4">
                            <Form.Item
                                name="birthDate"
                                label="生日"
                            >
                                <DatePicker
                                    style={{width: '100%'}}
                                    placeholder="请选择生日"
                                    className="h-12 w-full rounded-lg border-gray-200 hover:border-blue-500 focus:border-blue-500"
                                />
                            </Form.Item>
                        </div>
                    </div>

                    <div className="pr-4">
                        <Form.Item
                            name="location"
                            label="居住地区"
                            className="mb-6"
                        >
                            <Input placeholder="请输入居住地区"
                                   className="h-12 rounded-lg border-gray-200 hover:border-blue-500 focus:border-blue-500"/>
                        </Form.Item>
                    </div>

                    <div className="pr-4">
                        <Form.Item
                            name="signature"
                            label="个性签名"
                            className="mb-6"
                        >
                            <TextArea
                                rows={3}
                                placeholder="请输入个性签名"
                                maxLength={100}
                                className="rounded-lg border-gray-200 hover:border-blue-500 focus:border-blue-500 resize-none"
                            />
                        </Form.Item>
                    </div>

                    <div className="flex justify-start">
                        <Button
                            type="primary"
                            htmlType="submit"
                            icon={<SaveOutlined/>}
                            disabled={!isModified}
                            className={`h-12 px-10 rounded-lg transition-all duration-300 transform hover:scale-105 ${
                                isModified
                                    ? 'bg-linear-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 border-none shadow-lg shadow-blue-500/30'
                                    : 'bg-gray-300 text-gray-500 cursor-not-allowed border-none'
                            }`}
                        >
                            保存
                        </Button>
                    </div>
                </Form>
            </Card>
        </div>
    );
};

export default ProfileInfo;