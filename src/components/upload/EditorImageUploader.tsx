import React from 'react';
import type { UploadProps } from 'antd';
import { Button } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import ImageUploadWithCrop from '../common/ImageUploadWithCrop';

interface EditorImageUploaderProps {
  /** 上传成功回调 */
  onUploadSuccess: (url: string) => void;
  /** 自定义上传请求 */
  customRequest: UploadProps['customRequest'];
  /** 自定义类名 */
  className?: string;
}

/**
 * 编辑器图片上传组件
 * - 矩形裁剪，自动计算比例
 * - 立即上传模式
 * - 简洁按钮，适合编辑器内使用
 */
const EditorImageUploader: React.FC<EditorImageUploaderProps> = ({
  onUploadSuccess,
  customRequest,
  className = ''
}) => {
  return (
    <div className={`relative ${className}`}>
      <ImageUploadWithCrop
        cropShape="rect"
        aspectRatio={1} // 会自动计算合适的比例
        placeholder="插入图片"
        uploadMode="immediate"
        onUploadSuccess={onUploadSuccess}
        customRequest={customRequest}
        uploadButton={
          <Button icon={<UploadOutlined />} variant="outlined">
            插入图片
          </Button>
        }
      />
    </div>
  );
};

export default EditorImageUploader;
