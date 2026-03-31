import React, { useEffect } from 'react';
import { Form, Input, message, Modal, Select } from 'antd';
import {
  NotificationChannel,
  NotificationChannelMap,
  NotificationType,
  NotificationTypeMap,
  PriorityEnum,
  PriorityMap,
  StatusEnum,
  StatusEnumLabel
} from '../../types/enums';
import TemplateVariableSelector from './TemplateVariableSelector';
import { validateTemplateVariables } from '../../constants/notificationTemplateVariables';
import type { NotificationTemplate } from '../../types/notificationTemplate';

interface AdminNotificationTemplateEditorProps {
  visible: boolean;
  onCancel: () => void;
  onSave: (template: NotificationTemplate) => Promise<void>;
  isEditing: boolean;
  initialValues?: NotificationTemplate;
  loading?: boolean;
}

/**
 * 通知模板编辑器组件
 * 用于创建和编辑通知模板
 */
const AdminNotificationTemplateEditor: React.FC<AdminNotificationTemplateEditorProps> = ({
  visible,
  onCancel,
  onSave,
  isEditing,
  initialValues,
  loading = false
}) => {
  const [form] = Form.useForm();

  // 当 visible 变化或 initialValues 变化时重置表单
  useEffect(() => {
    if (visible) {
      if (isEditing && initialValues) {
        // 编辑模式，设置表单初始值
        form.setFieldsValue({
          code: initialValues.code,
          templateName: initialValues.templateName,
          titleTemplate: initialValues.titleTemplate,
          contentTemplate: initialValues.contentTemplate,
          notificationType: initialValues.notificationType,
          notificationChannel: initialValues.notificationChannel,
          description: initialValues.description,
          actionUrlTemplate: initialValues.actionUrlTemplate,
          priority: initialValues.priority,
          status: initialValues.status
        });
      } else {
        // 新建模式，重置表单
        form.resetFields();
      }
    }
  }, [visible, isEditing, initialValues, form]);

  // 处理表单值变化，自动生成模板编码和名称
  const handleValuesChange = (changedValues: Partial<NotificationTemplate>, allValues: NotificationTemplate): void => {
    // 仅在 notificationType 或 notificationChannel 实际变化时执行
    if ((changedValues.notificationType || changedValues.notificationChannel) && !isEditing) {
      const { notificationType, notificationChannel } = allValues;
      if (notificationType && notificationChannel) {
        // 生成模板编码
        const code = `${notificationType}_${notificationChannel}`;
        // 生成模板名称
        const name = `${NotificationTypeMap[notificationType as NotificationType]}(${NotificationChannelMap[notificationChannel as NotificationChannel]})`;
        // 生成标题模板和内容模板
        let titleTemplate: string;
        let contentTemplate: string;
        switch (notificationType) {
          case NotificationType.ARTICLE_LIKE:
            titleTemplate = '${senderName}点赞了您的文章';
            contentTemplate = '用户${senderName}点赞了您的文章《${articleTitle}》';
            break;
          case NotificationType.ARTICLE_COMMENT:
            titleTemplate = '${senderName}评论了您的文章';
            contentTemplate = '用户${senderName}评论了您的文章《${articleTitle}》：${commentContent}';
            break;
          case NotificationType.ARTICLE_COLLECTION:
            titleTemplate = '${senderName}收藏了您的文章';
            contentTemplate = '用户${senderName}收藏了您的文章《${articleTitle}》';
            break;
          case NotificationType.COMMENT_REPLY:
            titleTemplate = '${senderName}回复了您的评论';
            contentTemplate = '用户${senderName}回复了您的评论：${commentContent}';
            break;
          case NotificationType.FOLLOW:
            titleTemplate = '${senderName}关注了您';
            contentTemplate = '用户${senderName}关注了您';
            break;
          case NotificationType.SYSTEM:
            titleTemplate = '系统通知';
            contentTemplate = '${messageContent}';
            break;
          case NotificationType.REPORT:
            titleTemplate = '举报处理结果';
            contentTemplate = '您的举报已处理，结果：${messageContent}';
            break;
          case NotificationType.FEEDBACK:
            titleTemplate = '反馈处理结果';
            contentTemplate = '您的反馈已处理，结果：${messageContent}';
            break;
          default:
            titleTemplate = '通知';
            contentTemplate = '您收到了一条新通知';
        }
        // 检查当前表单值，避免不必要的更新
        const currentValues = form.getFieldsValue();
        // 只更新必要的字段，避免触发不必要的回调
        const updates: Record<string, unknown> = {};
        // 仅当值真正不同时才更新
        if (currentValues.code !== code) {
          updates.code = code;
        }
        if (currentValues.templateName !== name) {
          updates.templateName = name;
        }
        if (currentValues.titleTemplate !== titleTemplate) {
          updates.titleTemplate = titleTemplate;
        }
        if (currentValues.contentTemplate !== contentTemplate) {
          updates.contentTemplate = contentTemplate;
        }
        // 只有当有更新时才调用 form.setFieldsValue
        if (Object.keys(updates).length > 0) {
          form.setFieldsValue(updates);
        }
      }
    }
  };

  // 处理保存
  const handleSave = async (): Promise<void> => {
    try {
      const values = await form.validateFields();
      await onSave(values);
    } catch (error) {
      console.error('保存模板失败:', error);
      message.error('保存模板失败');
    }
  };

  return (
    <Modal
      title={isEditing ? '编辑通知模板' : '添加通知模板'}
      open={visible}
      onOk={handleSave}
      onCancel={onCancel}
      width={800}
      okText="保存"
      cancelText="取消"
      confirmLoading={loading}
    >
      <div className="max-h-[70vh] overflow-y-auto pr-2">
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            status: StatusEnum.ENABLED,
            priority: PriorityEnum.NORMAL,
            notificationChannel: NotificationChannel.SITE,
            description: '',
            actionUrlTemplate: ''
          }}
          className="space-y-4"
          onValuesChange={handleValuesChange}
        >
          {/* 通知设置 */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Form.Item name="notificationType" label="通知类型" rules={[{ required: true, message: '请选择通知类型' }]}>
              <Select placeholder="请选择通知类型">
                {Object.entries(NotificationTypeMap).map(([value, label]) => (
                  <Select.Option key={value} value={value}>
                    {label}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              name="notificationChannel"
              label="通知渠道"
              rules={[{ required: true, message: '请选择通知渠道' }]}
            >
              <Select placeholder="请选择通知渠道">
                {Object.entries(NotificationChannelMap).map(([value, label]) => (
                  <Select.Option key={value} value={value}>
                    {label}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item name="priority" label="优先级" rules={[{ required: true, message: '请选择优先级' }]}>
              <Select placeholder="请选择优先级" defaultValue={PriorityEnum.NORMAL}>
                {Object.entries(PriorityMap).map(([value, label]) => (
                  <Select.Option key={value} value={value}>
                    {label}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item name="status" label="状态" rules={[{ required: true, message: '请选择状态' }]}>
              <Select placeholder="请选择状态" defaultValue={StatusEnum.ENABLED}>
                <Select.Option value={StatusEnum.ENABLED}>{StatusEnumLabel[StatusEnum.ENABLED]}</Select.Option>
                <Select.Option value={StatusEnum.DISABLED}>{StatusEnumLabel[StatusEnum.DISABLED]}</Select.Option>
              </Select>
            </Form.Item>
          </div>

          {/* 基本信息 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Form.Item
              name="code"
              label="模板编码"
              rules={[
                { required: true, message: '请输入模板编码' },
                { min: 2, max: 32, message: '编码长度应在2-50个字符之间' }
              ]}
            >
              <Input placeholder="请输入模板编码" disabled={isEditing} />
            </Form.Item>

            <Form.Item
              name="templateName"
              label="模板名称"
              rules={[
                { required: true, message: '请输入模板名称' },
                { min: 2, max: 100, message: '名称长度应在2-100个字符之间' }
              ]}
            >
              <Input placeholder="请输入模板名称" />
            </Form.Item>
          </div>

          {/* 模板标题 - 使用变量选择器 */}
          <Form.Item
            name="titleTemplate"
            label="标题模板"
            rules={[
              { required: true, message: '请输入标题模板' },
              {
                validator: (_, value): Promise<unknown> => {
                  if (!value) return Promise.resolve();
                  const result = validateTemplateVariables(value);
                  if (!result.valid) {
                    return Promise.reject(new Error(`包含未定义变量: ${result.invalidVars.join(', ')}`));
                  }
                  return Promise.resolve();
                }
              }
            ]}
          >
            <TemplateVariableSelector placeholder="请输入标题模板，点击可用变量插入" />
          </Form.Item>

          {/* 内容模板 - 使用变量选择器 */}
          <Form.Item
            name="contentTemplate"
            label="内容模板"
            rules={[
              { required: true, message: '请输入内容模板' },
              {
                validator: (_, value): Promise<unknown> => {
                  if (!value) return Promise.resolve();
                  const result = validateTemplateVariables(value);
                  if (!result.valid) {
                    return Promise.reject(new Error(`包含未定义变量: ${result.invalidVars.join(', ')}`));
                  }
                  return Promise.resolve();
                }
              }
            ]}
          >
            <TemplateVariableSelector placeholder="请输入内容模板，点击可用变量插入" multiline rows={4} />
          </Form.Item>

          {/* 操作URL模板 - 使用变量选择器 */}
          <Form.Item
            name="actionUrlTemplate"
            label="操作URL模板"
            rules={[
              {
                validator: (_, value): Promise<unknown> => {
                  if (!value) return Promise.resolve();
                  const result = validateTemplateVariables(value);
                  if (!result.valid) {
                    return Promise.reject(new Error(`包含未定义变量: ${result.invalidVars.join(', ')}`));
                  }
                  return Promise.resolve();
                }
              }
            ]}
          >
            <TemplateVariableSelector placeholder="请输入操作URL模板，点击可用变量插入" />
          </Form.Item>

          {/* 其他设置 */}
          <Form.Item name="description" label="模板描述">
            <Input.TextArea rows={2} placeholder="请输入模板描述" />
          </Form.Item>
        </Form>
      </div>
    </Modal>
  );
};

export default AdminNotificationTemplateEditor;
