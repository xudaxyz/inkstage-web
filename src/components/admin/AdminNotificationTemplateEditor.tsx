import React, { useEffect } from 'react';
import { Form, Input, message, Modal, Select } from 'antd';
import {
  NotificationChannel,
  NotificationChannelMap,
  NotificationTypeMap,
  PriorityEnum,
  PriorityMap,
  StatusEnum,
  StatusEnumLabel
} from '../../types/enums';
import { getNotificationTypeConfig, validateTemplateVariablesForType } from '../../types/notificationParams';
import TemplateVariableSelector from './TemplateVariableSelector';
import type { NotificationTemplate } from '../../types/notificationTemplate';

interface AdminNotificationTemplateEditorProps {
  visible: boolean;
  onCancel: () => void;
  onSave: (template: NotificationTemplate) => Promise<void>;
  isEditing: boolean;
  initialValues?: NotificationTemplate;
  loading?: boolean;
}

const AdminNotificationTemplateEditor: React.FC<AdminNotificationTemplateEditorProps> = ({
                                                                                           visible,
                                                                                           onCancel,
                                                                                           onSave,
                                                                                           isEditing,
                                                                                           initialValues,
                                                                                           loading = false
                                                                                         }) => {
  const [form] = Form.useForm();

  // 使用 useWatch 监听 notificationType 的变化（响应式）
  const notificationType = Form.useWatch('notificationType', form);

  // 当 visible 变化或 initialValues 变化时重置表单
  useEffect(() => {
    if (visible) {
      if (isEditing && initialValues) {
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
        form.resetFields();
      }
    }
  }, [visible, isEditing, initialValues, form]);

  // 处理表单值变化，自动生成模板编码和名称
  const handleValuesChange = (changedValues: Partial<NotificationTemplate>, allValues: NotificationTemplate): void => {
    if ((changedValues.notificationType || changedValues.notificationChannel) && !isEditing) {
      const { notificationType: type, notificationChannel: channel } = allValues;
      if (type && channel) {
        // 从配置获取默认值
        const config = getNotificationTypeConfig(type);

        const code = `${type}_${channel}`;
        const name = config ? `${config.name}(${NotificationChannelMap[channel]})` : `${NotificationTypeMap[type]}(${NotificationChannelMap[channel]})`;

        const currentValues = form.getFieldsValue();
        const updates: Record<string, unknown> = {};

        if (currentValues.code !== code) {
          updates.code = code;
        }
        if (currentValues.templateName !== name) {
          updates.templateName = name;
        }
        if (config && currentValues.titleTemplate !== config.defaultTitleTemplate) {
          updates.titleTemplate = config.defaultTitleTemplate;
        }
        if (config && currentValues.contentTemplate !== config.defaultContentTemplate) {
          updates.contentTemplate = config.defaultContentTemplate;
        }
        if (config && currentValues.actionUrlTemplate !== config.defaultActionUrlTemplate) {
          updates.actionUrlTemplate = config.defaultActionUrlTemplate;
        }
        if (config && currentValues.description !== config.description) {
          updates.description = config.description;
        }
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

  // 创建验证器工厂函数
  const createValidator = (): ((_: unknown, value: string) => Promise<unknown>) => {
    return async (_: unknown, value: string): Promise<unknown> => {
      if (!value) return Promise.resolve();
      if (!notificationType) return Promise.resolve();
      const result = validateTemplateVariablesForType(value, notificationType);
      if (!result.valid) {
        return Promise.reject(new Error(`包含无效变量: ${result.invalidVars.join(', ')}`));
      }
      return Promise.resolve();
    };
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
              <Input placeholder="请输入模板编码" disabled={isEditing}/>
            </Form.Item>

            <Form.Item
              name="templateName"
              label="模板名称"
              rules={[
                { required: true, message: '请输入模板名称' },
                { min: 2, max: 100, message: '名称长度应在2-100个字符之间' }
              ]}
            >
              <Input placeholder="请输入模板名称"/>
            </Form.Item>
          </div>

          {/* 标题模板 */}
          <Form.Item
            name="titleTemplate"
            label="标题模板"
            rules={[
              { required: true, message: '请输入标题模板' },
              { validator: createValidator() }
            ]}
          >
            <TemplateVariableSelector
              placeholder="请输入标题模板，点击可用变量插入"
              notificationType={notificationType}
            />
          </Form.Item>

          {/* 内容模板 */}
          <Form.Item
            name="contentTemplate"
            label="内容模板"
            rules={[
              { required: true, message: '请输入内容模板' },
              { validator: createValidator() }
            ]}
          >
            <TemplateVariableSelector
              placeholder="请输入内容模板，点击可用变量插入"
              multiline
              rows={4}
              notificationType={notificationType}
            />
          </Form.Item>

          {/* 操作URL模板 */}
          <Form.Item
            name="actionUrlTemplate"
            label="操作URL模板"
            rules={[{ validator: createValidator() }]}
          >
            <TemplateVariableSelector
              placeholder="请输入操作URL模板，点击可用变量插入"
              notificationType={notificationType}
            />
          </Form.Item>

          {/* 模板描述（放在最底部） */}
          <Form.Item name="description" label="模板描述">
            <Input.TextArea rows={2} placeholder="请输入模板描述"/>
          </Form.Item>
        </Form>
      </div>
    </Modal>
  );
};

export default AdminNotificationTemplateEditor;
