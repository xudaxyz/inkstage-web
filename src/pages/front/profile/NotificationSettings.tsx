import React, { useEffect, useState } from 'react';
import { Button, Card, Divider, List, message, Popconfirm, Switch } from 'antd';
import { BellOutlined, MailOutlined, PushpinOutlined } from '@ant-design/icons';
import notificationService from '../../../services/notificationService';
import { type NotificationSetting } from '../../../types/notification';

const NotificationSettings: React.FC = () => {
  const [notificationSettings, setNotificationSettings] = useState<NotificationSetting>({
    userId: 0,
    articlePublish: true,
    articleLike: true,
    articleCollection: true,
    articleComment: true,
    commentReply: true,
    commentLike: true,
    follow: true,
    message: true,
    report: true,
    feedback: true,
    system: true,
    emailNotification: false,
    siteNotification: true
  });

  // 加载通知设置
  useEffect(() => {
    const fetchNotificationSetting = async (): Promise<void> => {
      try {
        const response = await notificationService.getNotificationSetting();
        if (response.code === 200) {
          // 将后端返回的 number 类型转换为 boolean 类型
          const settings = response.data;
          const formattedSettings = {
            ...settings,
            articlePublish: Boolean(settings.articlePublish),
            articleLike: Boolean(settings.articleLike),
            articleCollection: Boolean(settings.articleCollection),
            articleComment: Boolean(settings.articleComment),
            commentReply: Boolean(settings.commentReply),
            commentLike: Boolean(settings.commentLike),
            follow: Boolean(settings.follow),
            message: Boolean(settings.message),
            report: Boolean(settings.report),
            feedback: Boolean(settings.feedback),
            system: Boolean(settings.system),
            emailNotification: Boolean(settings.emailNotification),
            siteNotification: Boolean(settings.siteNotification)
          };
          setNotificationSettings(formattedSettings);
        } else {
          message.error(response.message || '获取通知设置失败');
        }
      } catch (error) {
        console.error('获取通知设置失败:', error);
        message.error('网络错误，请稍后重试');
      }
    };

    fetchNotificationSetting().then();
  }, []);

  const handleSettingChange = async (key: keyof NotificationSetting, value: boolean): Promise<void> => {
    const newSettings = {
      ...notificationSettings,
      [key]: value
    };
    setNotificationSettings(newSettings);

    try {
      const response = await notificationService.saveNotificationSetting(newSettings);
      if (response.code === 200 && response.data) {
        message.success('设置已更新');
      } else {
        message.error(response.message || '保存设置失败');
        // 恢复原设置
        setNotificationSettings(notificationSettings);
      }
    } catch (error) {
      console.error('保存设置失败:', error);
      message.error('网络错误，请稍后重试');
      // 恢复原设置
      setNotificationSettings(notificationSettings);
    }
  };

  const handleResetToDefault = async (): Promise<void> => {
    try {
      const response = await notificationService.resetNotificationSetting();
      if (response.code === 200 && response.data) {
        // 重新获取默认设置
        const settingResponse = await notificationService.getNotificationSetting();
        if (settingResponse.code === 200) {
          // 将后端返回的 number 类型转换为 boolean 类型
          const settings = settingResponse.data;
          const formattedSettings = {
            ...settings,
            articlePublish: Boolean(settings.articlePublish),
            articleLike: Boolean(settings.articleLike),
            articleCollection: Boolean(settings.articleCollection),
            articleComment: Boolean(settings.articleComment),
            commentReply: Boolean(settings.commentReply),
            commentLike: Boolean(settings.commentLike),
            follow: Boolean(settings.follow),
            message: Boolean(settings.message),
            report: Boolean(settings.report),
            feedback: Boolean(settings.feedback),
            system: Boolean(settings.system),
            emailNotification: Boolean(settings.emailNotification),
            siteNotification: Boolean(settings.siteNotification)
          };
          setNotificationSettings(formattedSettings);
        }
        message.success('已恢复默认设置');
      } else {
        message.error(response.message || '恢复默认设置失败');
      }
    } catch (error) {
      console.error('恢复默认设置失败:', error);
      message.error('网络错误，请稍后重试');
    }
  };

  // 通知类型设置
  const notificationTypeSettings = [
    {
      key: 'articlePublish' as keyof NotificationSetting,
      title: '文章发布通知',
      description: '接收文章发布成功的通知'
    },
    {
      key: 'articleLike' as keyof NotificationSetting,
      title: '文章点赞通知',
      description: '接收文章被点赞的通知'
    },
    {
      key: 'articleCollection' as keyof NotificationSetting,
      title: '文章收藏通知',
      description: '接收文章被收藏的通知'
    },
    {
      key: 'articleComment' as keyof NotificationSetting,
      title: '文章评论通知',
      description: '接收文章收到评论的通知'
    },
    {
      key: 'commentReply' as keyof NotificationSetting,
      title: '评论回复通知',
      description: '接收评论收到回复的通知'
    },
    {
      key: 'commentLike' as keyof NotificationSetting,
      title: '评论点赞通知',
      description: '接收评论被点赞的通知'
    },
    {
      key: 'follow' as keyof NotificationSetting,
      title: '关注通知',
      description: '接收被关注的通知'
    },
    {
      key: 'message' as keyof NotificationSetting,
      title: '私信通知',
      description: '接收私信消息的通知'
    },
    {
      key: 'report' as keyof NotificationSetting,
      title: '举报处理通知',
      description: '接收举报处理结果的通知'
    },
    {
      key: 'feedback' as keyof NotificationSetting,
      title: '反馈处理通知',
      description: '接收反馈处理结果的通知'
    },
    {
      key: 'system' as keyof NotificationSetting,
      title: '系统通知',
      description: '接收系统级别的重要通知'
    }
  ];

  // 推送渠道设置
  const pushChannelSettings = [
    {
      key: 'siteNotification' as keyof NotificationSetting,
      title: '站内信',
      description: '在系统内接收消息通知',
      icon: <BellOutlined className="mr-2 text-blue-500" />
    },
    {
      key: 'emailNotification' as keyof NotificationSetting,
      title: '邮件',
      description: '通过电子邮件接收通知',
      icon: <MailOutlined className="mr-2 text-green-500" />
    }
  ];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-800">通知设置</h1>
        <p className="text-gray-600 mt-2">管理您的通知偏好和接收方式</p>
      </div>

      <Card
        title={
          <span className="flex items-center">
            <BellOutlined className="mr-2" /> 通知类型
          </span>
        }
      >
        <List
          dataSource={notificationTypeSettings}
          renderItem={(item) => (
            <List.Item
              key={item.key}
              actions={[
                <Switch
                  checked={Boolean(notificationSettings[item.key])}
                  onChange={(checked) => handleSettingChange(item.key, checked)}
                />
              ]}
            >
              <List.Item.Meta title={item.title} description={item.description} />
            </List.Item>
          )}
        />
      </Card>

      <Card
        title={
          <span className="flex items-center">
            <PushpinOutlined className="mr-2" /> 推送渠道
          </span>
        }
      >
        <List
          dataSource={pushChannelSettings}
          renderItem={(item) => (
            <List.Item
              key={item.key}
              actions={[
                <Switch
                  checked={Boolean(notificationSettings[item.key])}
                  onChange={(checked) => handleSettingChange(item.key, checked)}
                />
              ]}
            >
              <List.Item.Meta
                title={
                  <div className="flex items-center">
                    {item.icon}
                    {item.title}
                  </div>
                }
                description={item.description}
              />
            </List.Item>
          )}
        />
      </Card>

      <Divider />

      <div className="flex justify-center">
        <Popconfirm title="确定要恢复默认设置吗？" onConfirm={handleResetToDefault} okText="确定" cancelText="取消">
          <Button type="default">恢复默认设置</Button>
        </Popconfirm>
      </div>
    </div>
  );
};

export default NotificationSettings;
