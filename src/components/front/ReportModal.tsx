import React, { useState } from 'react';
import { Checkbox, Form, Input, message, Modal, Select } from 'antd';
import { ReportTargetTypeEnum, ReportTypeMap } from '../../types/enums';
import reportService from '../../services/reportService';
import type { FrontReport } from '../../types/report.ts';

interface ReportModalProps {
  visible: boolean;
  onClose: () => void;
  reportedType: ReportTargetTypeEnum;
  relatedId?: number;
  reportedId: number;
  reportedName?: string;
}

const ReportModal: React.FC<ReportModalProps> = ({
  visible,
  onClose,
  reportedType,
  reportedId,
  relatedId,
  reportedName
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (values: FrontReport): Promise<void> => {
    setLoading(true);
    try {
      const reportData = {
        reportedType,
        reportedId,
        reportedName,
        relatedId: relatedId,
        reportType: values.reportType,
        reason: values.reason,
        evidence: values.evidence,
        anonymous: values.anonymous
      };

      const response = await reportService.createReport(reportData);
      if (response.code === 200) {
        message.success(response.message || '举报成功');
        form.resetFields();
        onClose();
      } else {
        message.error(response.message || '举报失败');
      }
    } catch {
      message.error('举报失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title="举报"
      open={visible}
      onCancel={onClose}
      onOk={() => form.submit()}
      okText="提交举报"
      cancelText="取消"
      confirmLoading={loading}
    >
      <Form form={form} onFinish={handleSubmit} layout="vertical">
        <Form.Item name="reportType" label="举报类型" rules={[{ required: true, message: '请选择举报类型' }]}>
          <Select placeholder="请选择举报类型">
            {Object.entries(ReportTypeMap).map(([value, label]) => (
              <Select.Option key={value} value={value}>
                {label}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item name="reason" label="举报理由" rules={[{ required: true, message: '请填写举报理由' }]}>
          <Input.TextArea rows={4} placeholder="请详细描述您的举报理由" />
        </Form.Item>

        <Form.Item name="evidence" label="证据">
          <Input placeholder="请提供相关证据（如图片链接等）" />
        </Form.Item>

        <Form.Item name="anonymous" valuePropName="checked">
          <Checkbox>匿名举报</Checkbox>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default ReportModal;
