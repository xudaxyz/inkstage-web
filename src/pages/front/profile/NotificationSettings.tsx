import React, { useEffect, useState } from 'react';
import { Button, Card, Divider, List, message, Popconfirm, Spin, Switch } from 'antd';
import { BellOutlined, MailOutlined, PushpinOutlined } from '@ant-design/icons';
import notificationService from '../../../services/notificationService';
import { type NotificationSetting } from '../../../types/notification';
import { NotificationType } from '../../../types/enums';

const NotificationSettings: React.FC = () => {
  const [notificationSettings, setNotificationSettings] = useState<NotificationSetting | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [updating, setUpdating] = useState<boolean>(false);

  // 加载通知设置
  useEffect(() => {
    const fetchNotificationSetting = async (): Promise<void> => {
      setLoading(true);
      try {
        const response = await notificationService.getNotificationSetting();
        console.log('getNotificationSetting', response);
        if (response.code === 200) {
          // 将后端返回的 number 类型转换为 boolean 类型
          const settings = response.data;
          const formattedSettings = {
            ...settings,
            articlePublish: settings.articlePublishNotification,
            articleLike: settings.articleLikeNotification,
            articleCollection: settings.articleCollectionNotification,
            articleComment: settings.articleCommentNotification,
            commentReply: settings.commentReplyNotification,
            follow: settings.followNotification,
            commentLike: settings.commentLikeNotification,
            message: settings.messageNotification,
            report: settings.reportNotification,
            feedback: settings.feedbackNotification,
            system: settings.systemNotification,
            emailNotification: settings.emailNotification,
            siteNotification: settings.siteNotification
          };
          setNotificationSettings(formattedSettings);
        } else {
          message.error(response.message || '获取通知设置失败');
        }
      } catch (error) {
        console.error('获取通知设置失败:', error);
        message.error('网络错误，请稍后重试');
      } finally {
        setLoading(false);
      }
    };

    fetchNotificationSetting().then();
  }, []);

  const handleSettingChange = async (
    key: keyof NotificationSetting,
    notificationType: NotificationType | undefined,
    value: boolean
  ): Promise<void> => {
    if (!notificationSettings) return;

    const newSettings = {
      ...notificationSettings,
      [key]: value
    };
    setNotificationSettings(newSettings);

    setUpdating(true);
    try {
      // 只发送修改的设置项
      const updateData = {
        notificationType: notificationType,
        notificationValue: value
      };

      const response = await notificationService.updateNotificationSetting(updateData);
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
    } finally {
      setUpdating(false);
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
            articlePublish: settings.articlePublishNotification,
            articleLike: settings.articleLikeNotification,
            articleCollection: settings.articleCollectionNotification,
            articleComment: settings.articleCommentNotification,
            commentReply: settings.commentReplyNotification,
            follow: settings.followNotification,
            commentLike: settings.commentLikeNotification,
            message: settings.messageNotification,
            report: settings.reportNotification,
            feedback: settings.feedbackNotification,
            system: settings.systemNotification,
            emailNotification: settings.emailNotification,
            siteNotification: settings.siteNotification
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
      notificationType: NotificationType.ARTICLE_PUBLISH,
      title: '文章发布通知',
      description: '接收文章发布成功的通知'
    },
    {
      key: 'articleLike' as keyof NotificationSetting,
      notificationType: NotificationType.ARTICLE_LIKE,
      title: '文章点赞通知',
      description: '接收文章被点赞的通知'
    },
    {
      key: 'articleCollection' as keyof NotificationSetting,
      notificationType: NotificationType.ARTICLE_COLLECTION,
      title: '文章收藏通知',
      description: '接收文章被收藏的通知'
    },
    {
      key: 'articleComment' as keyof NotificationSetting,
      notificationType: NotificationType.ARTICLE_COMMENT,
      title: '文章评论通知',
      description: '接收文章收到评论的通知'
    },
    {
      key: 'commentReply' as keyof NotificationSetting,
      notificationType: NotificationType.COMMENT_REPLY,
      title: '评论回复通知',
      description: '接收评论收到回复的通知'
    },
    {
      key: 'commentLike' as keyof NotificationSetting,
      notificationType: NotificationType.COMMENT_LIKE,
      title: '评论点赞通知',
      description: '接收评论被点赞的通知'
    },
    {
      key: 'follow' as keyof NotificationSetting,
      notificationType: NotificationType.FOLLOW,
      title: '关注通知',
      description: '接收被关注的通知'
    },
    {
      key: 'message' as keyof NotificationSetting,
      notificationType: NotificationType.MESSAGE,
      title: '私信通知',
      description: '接收私信消息的通知'
    },
    {
      key: 'report' as keyof NotificationSetting,
      notificationType: NotificationType.REPORT,
      title: '举报处理通知',
      description: '接收举报处理结果的通知'
    },
    {
      key: 'feedback' as keyof NotificationSetting,
      notificationType: NotificationType.FEEDBACK,
      title: '反馈处理通知',
      description: '接收反馈处理结果的通知'
    },
    {
      key: 'system' as keyof NotificationSetting,
      notificationType: NotificationType.SYSTEM,
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

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Spin size="large" tip="加载中..." />
        </div>
      ) : notificationSettings ? (
        <>
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
                      onChange={(checked) => handleSettingChange(item.key, item.notificationType, checked)}
                      loading={updating}
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
                      onChange={(checked) => handleSettingChange(item.key, undefined, checked)}
                      loading={updating}
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
              <Button type="default" loading={updating}>
                恢复默认设置
              </Button>
            </Popconfirm>
          </div>
        </>
      ) : (
        <div className="flex justify-center items-center h-64">
          <p className="text-gray-500">获取通知设置失败，请刷新页面重试</p>
        </div>
      )}
    </div>
  );
};

export default NotificationSettings;
