import React from 'react';
import type { UploadProps } from 'antd';
import { Button } from 'antd';
import { CameraOutlined } from '@ant-design/icons';
import ImageUploadWithCrop from '../common/ImageUploadWithCrop';

interface AvatarUploaderProps {
  /** 当前头像URL或React元素(如用户名首字母) */
  currentAvatar?: string | React.ReactNode;
  /** 上传成功回调 */
  onUploadSuccess: (url: string) => void;
  /** 自定义上传请求 */
  customRequest: UploadProps['customRequest'];
  /** 自定义类名 */
  className?: string;
}

/**
 * 头像上传组件
 * - 圆形裁剪，1:1比例
 * - 立即上传模式
 * - 按钮固定在头像右下角
 */
const AvatarUploader: React.FC<AvatarUploaderProps> = ({
  currentAvatar,
  onUploadSuccess,
  customRequest,
  className = ''
}) => {
  return (
    <div className={`relative ${className}`}>
      <ImageUploadWithCrop
        currentImage={currentAvatar}
        cropShape="round"
        aspectRatio={1}
        placeholder="上传头像"
        uploadMode="immediate"
        onUploadSuccess={onUploadSuccess}
        customRequest={customRequest}
        uploadButton={
          <Button
            icon={<CameraOutlined />}
            size="small"
            className="rounded-full bg-white p-1 shadow-md hover:bg-gray-100"
          />
        }
      />
    </div>
  );
};

export default AvatarUploader;
