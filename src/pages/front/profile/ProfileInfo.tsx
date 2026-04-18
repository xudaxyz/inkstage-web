import React, { useEffect, useState } from 'react';
import { Button, Card, DatePicker, Form, Input, message, Modal, Radio, type UploadProps } from 'antd';
import { Helmet } from 'react-helmet-async';
import { LockOutlined, ManOutlined, SaveOutlined, WomanOutlined } from '@ant-design/icons';
import { useTheme, useUserStore } from '../../../store';
import authService from '../../../services/authService';
import userService from '../../../services/userService';
import dayjs, { type Dayjs } from 'dayjs';
import { GenderEnum, GenderLabel } from '../../../types/enums';
import AvatarUploader from '../../../components/upload/AvatarUploader';
import UserCoverUploader from '../../../components/upload/UserCoverUploader.tsx';
// 表单值类型定义
type ProfileFormValues = {
  username: string;
  nickname: string;
  email: string;
  gender: GenderEnum | undefined;
  birthDate: string | Dayjs | undefined;
  location: string;
  signature: string;
};
const { TextArea } = Input;
const ProfileInfo: React.FC = () => {
  const theme = useTheme();
  const isDarkMode = theme === 'dark';
  const { user, updateUser, getProfile } = useUserStore();
  const [form] = Form.useForm();
  const [isModified, setIsModified] = useState(false);
  const [updateUsernameModalVisible, setUpdateUsernameModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [modificationTimeLeft, setModificationTimeLeft] = useState<number>(-1);
  const [usernameForm] = Form.useForm();

  // 初始化表单数据
  useEffect(() => {
    // 调用getProfile获取最新的个人资料
    void getProfile();
    // 获取修改用户名的剩余时间
    void fetchModificationTimeLeft();
  }, [getProfile]);

  // 获取修改用户名的剩余时间
  const fetchModificationTimeLeft = async (): Promise<void> => {
    try {
      const timeLeft = await userService.getUsernameModificationTimeLeft();
      setModificationTimeLeft(timeLeft);
    } catch (error) {
      console.error('获取修改时间剩余失败:', error);
    }
  };
  // 打开修改用户名模态框
  const handleOpenUpdateUsernameModal = (): void => {
    if (modificationTimeLeft > 0) {
      const days = Math.floor(modificationTimeLeft / (1000 * 60 * 60 * 24));
      const hours = Math.floor((modificationTimeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((modificationTimeLeft % (1000 * 60 * 60)) / (1000 * 60));
      let messageText;
      if (days > 0) {
        messageText = `您在${days}天后才能修改用户名`;
      } else if (hours > 0) {
        messageText = `您在${hours}小时后才能修改用户名`;
      } else {
        messageText = `您在${minutes}分钟后才能修改用户名`;
      }
      void message.error(messageText);
      return;
    }
    if (user) {
      usernameForm.setFieldsValue({ newUsername: user.username });
      setUpdateUsernameModalVisible(true);
    }
  };
  // 关闭修改用户名模态框
  const handleCloseUpdateUsernameModal = (): void => {
    setUpdateUsernameModalVisible(false);
  };
  // 处理修改用户名
  const handleUpdateUsername = async (values: { newUsername: string }): Promise<void> => {
    setIsLoading(true);
    try {
      const result = await userService.updateUsername(values.newUsername);
      if (result.code === 200) {
        message.success(result.message || '登录账号已成功修改');
        setUpdateUsernameModalVisible(false);
        // 重新获取用户信息
        await getProfile();
        // 重新获取修改时间剩余
        await fetchModificationTimeLeft();
      } else {
        message.error(result.message || '修改用户名失败');
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        message.error(error.message || '修改用户名失败');
      }
    } finally {
      setIsLoading(false);
    }
  };
  // 当用户信息更新时，更新表单数据
  useEffect(() => {
    if (user) {
      form.setFieldsValue({
        username: user.username,
        email: user.email,
        nickname: user.nickname,
        gender: user.gender || GenderEnum.UNKNOWN,
        birthDate: user.birthDate ? dayjs(user.birthDate) : null,
        location: user.location,
        signature: user.signature
      });
    }
  }, [user, form]);
  // 处理表单提交
  const handleSubmit = async (values: ProfileFormValues): Promise<void> => {
    try {
      const submitData = {
        ...values,
        gender: values.gender || GenderEnum.UNKNOWN,
        // 转换生日字段格式
        birthDate: values.birthDate
          ? typeof values.birthDate === 'string'
            ? values.birthDate
            : values.birthDate.format('YYYY-MM-DD')
          : undefined
      };
      // 更新个人资料
      const response = await authService.updateProfile(submitData);
      if (response.code === 200) {
        // 更新前端状态，确保birthDate映射到birthDate
        const updatedUserData = {
          ...response.data,
          nickname: values.nickname,
          birthDate: response.data.birthDate,
          gender: response.data.gender || GenderEnum.UNKNOWN,
          avatar: user.avatar,
          coverImage: user.coverImage
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

  // 头像上传请求
  const handleAvatarUpload: UploadProps['customRequest'] = async (options): Promise<void> => {
    const { file, onSuccess, onError } = options;
    try {
      const result = await authService.uploadAvatar(file as File, 604800);
      if (result.code === 200) {
        message.success(result.message || '头像上传成功');
        onSuccess?.(result);
      } else {
        message.error(result.message || '头像上传失败');
        onError?.(new Error(result.message || '头像上传失败'));
      }
    } catch {
      message.error('头像上传失败，请重试');
      onError?.(new Error('头像上传失败'));
    }
  };

  const handleCoverImageUpload: UploadProps['customRequest'] = async (options): Promise<void> => {
    const { file, onSuccess, onError } = options;
    try {
      const result = await authService.uploadCoverImage(file as File, 604800);
      if (result.code === 200) {
        message.success(result.message || '封面上传成功');
        onSuccess?.(result);
      } else {
        message.error('封面上传失败');
        onError?.(new Error(result.message || '头像上传失败'));
      }
    } catch (error) {
      if (error instanceof Error) {
        message.error(error.message || '封面上传失败，请重试');
      }
      onError?.(new Error('头像上传失败'));
    }
  };
  return (
    <>
      <Helmet>
        <title>个人资料 - InkStage</title>
      </Helmet>
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
            {!user?.coverImage && <div className="w-full h-full flex items-center justify-center text-gray-400"></div>}

            {/* 用户信息叠加在封面图片上 */}
            <div className="absolute bottom-4 left-4 md:bottom-6 md:left-6 flex flex-col md:flex-row items-start md:items-end gap-3 md:gap-4">
              {/* 头像 */}
              <div className="shrink relative">
                <AvatarUploader
                  currentAvatar={
                    user?.avatar ? (
                      user.avatar
                    ) : (
                      <span className="text-sm font-medium">{user.nickname?.charAt(0) || 'U'}</span>
                    )
                  }
                  onUploadSuccess={(url) => {
                    if (user) {
                      void updateUser({ ...user, avatar: url });
                    }
                  }}
                  customRequest={handleAvatarUpload}
                />
              </div>

              {/* 基本信息 */}
              <div className="text-purple-600 text-shadow">
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="text-lg md:text-xl font-semibold">{user?.nickname}</h2>
                  {user?.gender === GenderEnum.MALE && (
                    <span>
                      <ManOutlined style={{ color: 'blue' }} />
                    </span>
                  )}
                  {user?.gender === GenderEnum.FEMALE && (
                    <span>
                      <WomanOutlined style={{ color: 'red' }} />
                    </span>
                  )}
                </div>
                <p className="text-gray-700 truncate max-w-[150px] sm:max-w-[200px] md:max-w-[300px] lg:max-w-[400px]">
                  {user?.signature || '暂无简介'}
                </p>
              </div>
            </div>

            {/* 设置封面按钮 */}
            <div className="absolute bottom-4 right-4 md:bottom-5 md:right-12">
              <UserCoverUploader
                onUploadSuccess={(url) => {
                  if (user) {
                    void updateUser({ ...user, coverImage: url });
                  }
                }}
                customRequest={handleCoverImageUpload}
              />
            </div>
          </div>
        </div>

        {/* 个人信息表单 */}
        <Card
          style={{
            marginBottom: '16px',
            backgroundColor: `${isDarkMode ? '#364153' : 'transparent'}`
          }}
        >
          <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-6">个人信息</h3>

          <Form form={form} onFinish={handleSubmit} onValuesChange={() => setIsModified(true)} layout="vertical">
            {/* 第一行：登录账号和昵称 - 移动端垂直堆叠 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8 mb-4">
              <div className="pr-4">
                <Form.Item name="username" label="登录账号" extra="登录账号一个月仅允许修改一次">
                  <Input
                    disabled
                    className="h-12 rounded-lg bg-gray-50 border-gray-200 text-gray-500 pr-24"
                    suffix={
                      <Button
                        type="text"
                        className="text-blue-500 hover:bg-none"
                        onClick={handleOpenUpdateUsernameModal}
                      >
                        修改
                      </Button>
                    }
                  />
                </Form.Item>
              </div>

              <div className="md:pl-4">
                <Form.Item name="nickname" label="昵称" rules={[{ required: true, message: '请输入昵称' }]}>
                  <Input
                    placeholder="请输入昵称"
                    className="h-12 rounded-lg border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                  />
                </Form.Item>
              </div>
            </div>

            {/* 第二行：性别和生日 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8 mb-4">
              <div className="pr-4">
                <Form.Item name="gender" label="性别">
                  <Radio.Group className="h-12 flex flex-wrap items-center gap-2 md:gap-4">
                    <Radio value={GenderEnum.MALE} className="mr-0 md:mr-6 flex items-center">
                      <ManOutlined style={{ color: 'blue' }} /> {GenderLabel.MALE}
                    </Radio>
                    <Radio value={GenderEnum.FEMALE} className="mr-0 md:mr-6 flex items-center">
                      <WomanOutlined style={{ color: 'red' }} /> {GenderLabel.FEMALE}
                    </Radio>
                    <Radio value={GenderEnum.SECRET} className="flex items-center">
                      <LockOutlined style={{ color: 'gray' }} /> {GenderLabel.SECRET}
                    </Radio>
                  </Radio.Group>
                </Form.Item>
              </div>

              <div className="md:pl-4">
                <Form.Item name="birthDate" label="生日">
                  <DatePicker
                    style={{ width: '100%' }}
                    placeholder="请选择生日"
                    className="h-12 w-full rounded-lg border-gray-200 hover:border-blue-500 focus:border-blue-500"
                  />
                </Form.Item>
              </div>
            </div>

            <div className="pr-4">
              <Form.Item name="location" label="居住地区" className="mb-6">
                <Input
                  placeholder="请输入居住地区"
                  className="h-12 rounded-lg border-gray-200 hover:border-blue-500 focus:border-blue-500"
                />
              </Form.Item>
            </div>

            <div className="pr-4">
              <Form.Item name="signature" label="个性签名" className="mb-6">
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
                icon={<SaveOutlined />}
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

        {/* 修改用户名模态框 */}
        <Modal
          title="修改用户名"
          open={updateUsernameModalVisible}
          onCancel={handleCloseUpdateUsernameModal}
          footer={null}
        >
          <Form form={usernameForm} layout="vertical" onFinish={handleUpdateUsername}>
            <Form.Item
              name="newUsername"
              label="新用户名"
              rules={[
                { required: true, message: '请输入新用户名' },
                { min: 2, message: '用户名长度至少为2个字符' },
                { max: 16, message: '用户名长度不能超过16个字符' }
              ]}
            >
              <Input placeholder="请输入新用户名" />
            </Form.Item>
            <div className="text-sm text-gray-500 mb-4">用户名一个月只能修改一次</div>
            <Form.Item>
              <div className="flex justify-end gap-2">
                <Button onClick={handleCloseUpdateUsernameModal}>取消</Button>
                <Button type="primary" htmlType="submit" loading={isLoading}>
                  确定修改
                </Button>
              </div>
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </>
  );
};
export default ProfileInfo;
