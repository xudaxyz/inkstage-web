import React, { useCallback, useRef, useState } from 'react';
import { Input, Space, Tag, Tooltip, Typography } from 'antd';
import { DownOutlined, UpOutlined } from '@ant-design/icons';
import { getNotificationVariables, validateTemplateVariablesForType } from '../../types/notificationParams';
import type { NotificationType } from '../../types/enums';

const { Text } = Typography;

interface TemplateVariableSelectorProps {
  /** 输入框的当前值 */
  value?: string;
  /** 值变化回调 */
  onChange?: (value: string) => void;
  /** 输入框占位符 */
  placeholder?: string;
  /** 是否是多行输入 */
  multiline?: boolean;
  /** 输入框行数（仅 multiline=true 时有效） */
  rows?: number;
  /** 自定义样式 */
  className?: string;
  /** 当前选中的通知类型，用于过滤变量 */
  notificationType?: NotificationType;
}

/**
 * 模板变量选择器组件
 * 根据选择的通知类型显示对应的变量
 */
const TemplateVariableSelector: React.FC<TemplateVariableSelectorProps> = ({
  value = '',
  onChange,
  placeholder,
  multiline = false,
  rows = 3,
  className = '',
  notificationType
}) => {
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);
  const [showVariables, setShowVariables] = useState(false);
  const [validationResult, setValidationResult] = useState<{ valid: boolean; invalidVars: string[] } | null>(null);

  // 根据通知类型获取对应的变量
  const variables = notificationType ? getNotificationVariables(notificationType) : [];

  // 插入变量到输入框
  const insertVariable = useCallback(
    (variableKey: string) => {
      const inputElement = inputRef.current;
      if (!inputElement) return;

      const start = inputElement.selectionStart || 0;
      const end = inputElement.selectionEnd || 0;

      const newValue = value.substring(0, start) + '${' + variableKey + '}' + value.substring(end);

      onChange?.(newValue);

      setTimeout(() => {
        inputElement.focus();
        const newCursorPos = start + variableKey.length + 3;
        inputElement.setSelectionRange(newCursorPos, newCursorPos);
      }, 0);
    },
    [value, onChange]
  );

  // 处理输入变化
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const newValue = e.target.value;
      onChange?.(newValue);

      if (newValue && notificationType) {
        const result = validateTemplateVariablesForType(newValue, notificationType);
        setValidationResult(result);
      } else {
        setValidationResult(null);
      }
    },
    [onChange, notificationType]
  );

  // 渲染输入框
  const renderInput = (): React.ReactNode => {
    const commonProps = { placeholder, className: 'w-full' };
    if (multiline) {
      return (
        <Input.TextArea
          {...commonProps}
          rows={rows}
          value={value}
          onChange={handleChange}
          ref={(el) => {
            inputRef.current = el?.resizableTextArea?.textArea || null;
          }}
        />
      );
    }
    return (
      <Input
        {...commonProps}
        value={value}
        onChange={handleChange}
        ref={(el) => {
          inputRef.current = el?.input || null;
        }}
      />
    );
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {/* 输入框 */}
      {renderInput()}

      {/* 验证结果提示 */}
      {validationResult && !validationResult.valid && (
        <div className="text-red-500 text-sm">
          <Text type="danger">发现无效变量: {validationResult.invalidVars.join(', ')}</Text>
        </div>
      )}

      {/* 变量选择器折叠栏 */}
      <div className="border border-gray-200 rounded-md overflow-hidden">
        <div
          className="bg-gray-50 px-3 py-2 flex items-center justify-between cursor-pointer hover:bg-gray-100 transition-colors"
          onClick={() => setShowVariables(!showVariables)}
        >
          <span className="text-sm font-medium text-gray-700 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-500"></span>
            {notificationType ? '可用变量（点击插入）' : '请先选择通知类型'}
          </span>
          <span className="text-gray-400">{showVariables ? <UpOutlined /> : <DownOutlined />}</span>
        </div>

        {/* 变量标签列表 */}
        {showVariables && (
          <div className="p-3 bg-white">
            {!notificationType ? (
              <Text type="secondary">请先选择通知类型</Text>
            ) : variables.length === 0 ? (
              <Text type="secondary">该通知类型暂无变量</Text>
            ) : (
              <Space size={[8, 8]} wrap>
                {variables.map((variable) => (
                  <Tooltip key={variable.key} title={`${variable.description}（点击插入）`} placement="top">
                    <Tag
                      color="blue"
                      className="cursor-pointer hover:opacity-80 transition-opacity"
                      onClick={() => insertVariable(variable.key)}
                    >
                      ${'{'}{variable.key}
                      {'}'}
                    </Tag>
                  </Tooltip>
                ))}
              </Space>
            )}
          </div>
        )}
      </div>

      {/* 已使用变量提示 */}
      {value && validationResult?.valid && (
        <div className="text-green-600 text-sm">
          <Text type="success">✓ 所有变量均有效</Text>
        </div>
      )}
    </div>
  );
};

export default TemplateVariableSelector;
