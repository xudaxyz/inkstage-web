import React from 'react';
import type { UploadProps } from 'antd';
import { Button } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import ImageUploadWithCrop from '../common/ImageUploadWithCrop';

interface CoverUploaderProps {
  /** 当前封面URL */
  currentCover?: string;
  /** 上传成功回调 */
  onUploadSuccess: (url: string) => void;
  /** 自定义上传请求 */
  customRequest: UploadProps['customRequest'];
  /** 自定义类名 */
  className?: string;
}

/**
 * 封面上传组件
 * - 矩形裁剪，16:9比例
 * - 立即上传模式
 * - 按钮固定在右下角
 */
const UserCoverUploader: React.FC<CoverUploaderProps> = ({
  currentCover,
  onUploadSuccess,
  customRequest,
  className = ''
}) => {
  return (
    <div className={`relative ${className}`}>
      <ImageUploadWithCrop
        cropShape="rect"
        aspectRatio={16 / 9}
        placeholder="设置封面图片"
        uploadMode="immediate"
        onUploadSuccess={onUploadSuccess}
        customRequest={customRequest}
        uploadButton={
          <Button icon={<UploadOutlined />} variant="solid" color="blue" className="shadow-md">
            {currentCover ? '更换封面' : '设置封面图片'}
          </Button>
        }
      />
    </div>
  );
};

export default UserCoverUploader;
