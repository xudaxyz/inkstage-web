import React, { useCallback, useRef, useState } from 'react';
import { Input, Space, Tag, Tooltip, Typography } from 'antd';
import {
  BellOutlined,
  CommentOutlined,
  DownOutlined,
  ExclamationCircleOutlined,
  FileTextOutlined,
  LinkOutlined,
  SettingOutlined,
  UpOutlined,
  UserOutlined
} from '@ant-design/icons';
import {
  ALL_TEMPLATE_VARIABLES,
  type NotificationTemplateVariable,
  validateTemplateVariables
} from '../../constants/notificationTemplateVariables';

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
}

/**
 * 模板变量选择器组件
 * 提供输入框 + 变量标签选择功能
 */
const TemplateVariableSelector: React.FC<TemplateVariableSelectorProps> = ({
  value = '',
  onChange,
  placeholder,
  multiline = false,
  rows = 3,
  className = ''
}) => {
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);
  const [showVariables, setShowVariables] = useState(false);
  const [validationResult, setValidationResult] = useState<{ valid: boolean; invalidVars: string[] } | null>(null);

  // 按分类组织变量
  const groupedVariables = ALL_TEMPLATE_VARIABLES.reduce(
    (acc, variable) => {
      if (!acc[variable.category]) {
        acc[variable.category] = [];
      }
      acc[variable.category].push(variable);
      return acc;
    },
    {} as Record<string, NotificationTemplateVariable[]>
  );

  // 分类图标映射
  const categoryIcons: Record<string, React.ReactNode> = {
    user: <UserOutlined />,
    article: <FileTextOutlined />,
    comment: <CommentOutlined />,
    report: <ExclamationCircleOutlined />,
    system: <SettingOutlined />,
    general: <LinkOutlined />,
    notification: <BellOutlined />
  };

  // 分类名称映射
  const categoryNames: Record<string, string> = {
    user: '用户相关',
    article: '文章相关',
    comment: '评论相关',
    report: '举报相关',
    system: '系统相关',
    general: '通用变量',
    notification: '通知相关'
  };

  // 分类颜色映射
  const categoryColors: Record<string, string> = {
    user: 'blue',
    article: 'green',
    comment: 'orange',
    report: 'yellow',
    system: 'purple',
    general: 'cyan',
    notification: 'red'
  };

  // 插入变量到输入框
  const insertVariable = useCallback(
    (variableKey: string) => {
      const inputElement = inputRef.current;
      if (!inputElement) return;

      const start = inputElement.selectionStart || 0;
      const end = inputElement.selectionEnd || 0;

      // 使用 ${} 格式插入变量
      const newValue = value.substring(0, start) + '${' + variableKey + '}' + value.substring(end);

      onChange?.(newValue);

      // 恢复焦点并设置光标位置
      setTimeout(() => {
        inputElement.focus();
        const newCursorPos = start + variableKey.length + 3; // ${} 占3个字符
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

      // 实时验证
      if (newValue) {
        const result = validateTemplateVariables(newValue);
        setValidationResult(result);
      } else {
        setValidationResult(null);
      }
    },
    [onChange]
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
          <Text type="danger">发现未定义的变量: {validationResult.invalidVars.join(', ')}</Text>
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
            可用变量（点击插入）
          </span>
          <span className="text-gray-400">{showVariables ? <UpOutlined /> : <DownOutlined />}</span>
        </div>

        {/* 变量标签列表 */}
        {showVariables && (
          <div className="p-3 space-y-3 bg-white">
            {Object.entries(groupedVariables).map(([category, variables]) => (
              <div key={category} className="space-y-2">
                <div className="flex items-center gap-2 text-xs text-gray-500 font-medium">
                  {categoryIcons[category]}
                  <span>{categoryNames[category]}</span>
                </div>
                <Space size={[8, 8]} wrap>
                  {variables.map((variable) => (
                    <Tooltip key={variable.key} title={`${variable.description}（点击插入）`} placement="top">
                      <Tag
                        color={categoryColors[category]}
                        className="cursor-pointer hover:opacity-80 transition-opacity"
                        onClick={() => insertVariable(variable.key)}
                      >
                        ${'{'}${variable.key}
                        {'}'}
                      </Tag>
                    </Tooltip>
                  ))}
                </Space>
              </div>
            ))}
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
