import React from 'react';
import type { UploadFile } from 'antd';
import { Button } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import type { CroppedFileInfo } from '../common/ImageUploadWithCrop';
import ImageUploadWithCrop from '../common/ImageUploadWithCrop';

interface ArticleCoverUploaderProps {
  /** 当前封面URL */
  currentCover?: string;
  /** 裁剪完成回调(延迟上传模式) */
  onCropComplete: (fileInfo: CroppedFileInfo) => void;
  /** 删除图片回调 */
  onRemove: (file: UploadFile) => void;
  /** 自定义类名 */
  className?: string;
}

/**
 * 文章封面上传组件
 * - 矩形裁剪，16:9比例
 * - 延迟上传模式
 * - 显示预览图片
 * - 按钮在预览图下方
 */
const ArticleCoverUploader: React.FC<ArticleCoverUploaderProps> = ({
  currentCover,
  onCropComplete,
  onRemove,
  className = ''
}) => {
  return (
    <div className={`relative ${className}`}>
      <ImageUploadWithCrop
        currentImage={currentCover}
        cropShape="rect"
        aspectRatio={16 / 9}
        placeholder="上传文章封面"
        uploadMode="deferred"
        onCropComplete={onCropComplete}
        onRemove={onRemove}
        uploadButton={
          <Button
            icon={<UploadOutlined />}
            className="w-full h-48 flex items-center justify-center border-dashed border-2"
          >
            上传文章封面
          </Button>
        }
      />
    </div>
  );
};

export default ArticleCoverUploader;
