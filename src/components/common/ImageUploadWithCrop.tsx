import React, { useCallback, useMemo, useState } from 'react';
import type { UploadFile, UploadProps } from 'antd';
import { Button, message, Tooltip, Upload } from 'antd';
import { CameraOutlined, DeleteOutlined, UploadOutlined } from '@ant-design/icons';
import ImgCrop from 'antd-img-crop';
import type { UploadChangeParam } from 'antd/es/upload';

/**
 * 上传模式类型
 * - immediate: 立即上传(选择图片后立即上传到服务器)
 * - deferred: 延迟上传(先裁剪预览，稍后手动上传)
 */
export type UploadMode = 'immediate' | 'deferred';

/**
 * 裁剪后的文件信息
 */
export interface CroppedFileInfo {
  file: File;
  previewUrl: string;
}

/**
 * 图片上传组件属性
 */
export interface ImageUploadWithCropProps {
  /** 当前图片URL(用于预览)或React元素(用于默认头像) */
  currentImage?: string | React.ReactNode;
  /** 裁剪形状：rect-矩形，round-圆形 */
  cropShape?: 'rect' | 'round';
  /** 裁剪比例，如 1/1、16/9、4/3 等 */
  aspectRatio?: number;
  /** 占位提示文字 */
  placeholder?: string;
  /** 自定义类名 */
  className?: string;
  /** 接受的文件类型 */
  accept?: string;
  /** 最大文件数量 */
  maxCount?: number;
  /** 自定义上传按钮 */
  uploadButton?: React.ReactNode;

  // ===== 立即上传模式属性 =====
  /** 上传模式，默认为 'immediate' */
  uploadMode?: UploadMode;
  /** 立即上传成功回调(uploadMode='immediate' 时必传) */
  onUploadSuccess?: (url: string) => void;
  /** 自定义上传请求(uploadMode='immediate' 时必传) */
  customRequest?: UploadProps['customRequest'];

  // ===== 延迟上传模式属性 =====
  /** 裁剪完成回调(uploadMode='deferred' 时必传) */
  onCropComplete?: (fileInfo: CroppedFileInfo) => void;
  /** 删除图片回调(图片的路径) */
  onRemove?: (file: UploadFile) => void;
}

/**
 * 图片上传裁剪组件
 *
 * 支持两种上传模式：
 * 1. 立即上传(immediate)：选择图片后立即上传到服务器
 * 2. 延迟上传(deferred)：先裁剪预览，稍后手动上传
 */
const ImageUploadWithCrop: React.FC<ImageUploadWithCropProps> = ({
  currentImage,
  cropShape = 'rect',
  aspectRatio = 1,
  placeholder = '点击上传图片',
  className = '',
  accept = 'image/*',
  maxCount = 1,
  uploadButton,
  uploadMode = 'immediate',
  onUploadSuccess,
  customRequest,
  onCropComplete,
  onRemove
}) => {
  // ===== 状态管理 =====
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [localPreviewImage, setLocalPreviewImage] = useState<string | React.ReactNode>('');
  const [isUploading, setIsUploading] = useState(false);
  const [currentAspectRatio, setCurrentAspectRatio] = useState<number>(aspectRatio);

  // 确定要显示的预览图片：优先使用本地上传的图片，其次使用传入的currentImage
  const previewImage = localPreviewImage || currentImage || '';

  // ===== 工具函数 =====

  /**
   * 验证文件类型和大小
   */
  const validateFile = useCallback((file: File): boolean => {
    // 验证文件类型
    const isImage = file.type.startsWith('image/');
    if (!isImage) {
      message.error('只能上传图片文件！').then();
      return false;
    }

    // 验证文件大小(最大10MB)
    const isLt10M = file.size / 1024 / 1024 < 10;
    if (!isLt10M) {
      message.error('图片大小不能超过10MB！').then();
      return false;
    }

    return true;
  }, []);

  /**
   * 根据图片尺寸计算合适的裁剪比例
   */
  const calculateAspectRatio = useCallback((file: File): Promise<number> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = (): void => {
        const width = img.width;
        const height = img.height;
        const ratio = width / height;

        // 定义目标比例
        const ratios = [
          { value: 16 / 9, name: '16:9' },
          { value: 4 / 3, name: '4:3' },
          { value: 1, name: '1:1' },
          { value: 3 / 4, name: '3:4' },
          { value: 9 / 16, name: '9:16' }
        ];

        // 找到最接近的比例
        let closestRatio = ratios[0];
        let minDifference = Math.abs(ratio - closestRatio.value);

        for (const r of ratios) {
          const difference = Math.abs(ratio - r.value);
          if (difference < minDifference) {
            minDifference = difference;
            closestRatio = r;
          }
        }

        resolve(closestRatio.value);
      };
      img.src = URL.createObjectURL(file);
    });
  }, []);

  /**
   * 处理文件变化(立即上传模式)
   */
  const handleFileChange: UploadProps['onChange'] = useCallback(
    (info: UploadChangeParam) => {
      const { file, fileList: newFileList } = info;
      setFileList(newFileList);

      if (file.status === 'uploading') {
        setIsUploading(true);
      } else if (file.status === 'done') {
        setIsUploading(false);
        if (file.response?.data) {
          setLocalPreviewImage(file.response.data);
          onUploadSuccess?.(file.response.data);
        }
      } else if (file.status === 'error') {
        setIsUploading(false);
        message.error('上传失败，请重试').then();
      }
    },
    [onUploadSuccess]
  );

  /**
   *  延迟上传模式的删除处理
   */
  const handleDeferredRemove = useCallback(() => {
    setLocalPreviewImage('');
    setFileList([]);

    // 释放延迟上传模式创建的URL对象
    if (typeof localPreviewImage === 'string' && localPreviewImage.startsWith('blob:')) {
      URL.revokeObjectURL(localPreviewImage);
    }

    if (onRemove) {
      onRemove({} as UploadFile);
    }
  }, [localPreviewImage, onRemove]);

  /**
   * 处理文件上传前的验证和处理
   */
  const handleBeforeUpload = useCallback(
    async (file: File) => {
      if (!validateFile(file)) {
        return Upload.LIST_IGNORE;
      }

      // 计算合适的裁剪比例
      const calculatedRatio = await calculateAspectRatio(file);
      setCurrentAspectRatio(calculatedRatio);

      if (uploadMode === 'deferred') {
        const previewUrl = URL.createObjectURL(file);
        setLocalPreviewImage(previewUrl);

        if (onCropComplete) {
          onCropComplete({
            file,
            previewUrl
          });
        }

        return Upload.LIST_IGNORE;
      }

      // 立即上传模式：不创建本地预览，直接返回文件
      return file;
    },
    [validateFile, calculateAspectRatio, uploadMode, onCropComplete]
  );

  /**
   * 渲染上传按钮
   */
  const renderUploadButton = useMemo(() => {
    if (uploadButton) {
      return uploadButton;
    }

    return (
      <Button
        icon={<UploadOutlined />}
        className={`${className} ${previewImage ? '' : 'w-full h-48 flex items-center justify-center border-dashed border-2'}`}
      >
        <Tooltip title={placeholder}>{placeholder}</Tooltip>
      </Button>
    );
  }, [uploadButton, className, previewImage, placeholder]);

  /**
   * 渲染预览图(圆形)
   */
  const renderRoundPreview = useMemo(
    () => (
      <div className="relative mb-4">
        <div
          className="rounded-full overflow-hidden border-4 border-white shadow-md"
          style={{ width: '100px', height: '100px' }}
        >
          {typeof previewImage === 'string' ? (
            <img src={previewImage} alt="预览" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">{previewImage}</div>
          )}
        </div>
        <div className="absolute bottom-0 right-0 bg-white rounded-full p-1 shadow-md">
          <ImgCrop key={currentAspectRatio} aspect={currentAspectRatio} cropShape="round" rotationSlider>
            <Upload
              customRequest={uploadMode === 'immediate' ? customRequest : undefined}
              fileList={fileList}
              onChange={uploadMode === 'immediate' ? handleFileChange : undefined}
              showUploadList={false}
              maxCount={maxCount}
              accept={accept}
              beforeUpload={handleBeforeUpload}
            >
              <Button icon={<CameraOutlined />} size="small" className="rounded-full" loading={isUploading} />
            </Upload>
          </ImgCrop>
        </div>
      </div>
    ),
    [
      previewImage,
      currentAspectRatio,
      maxCount,
      accept,
      uploadMode,
      customRequest,
      fileList,
      handleFileChange,
      handleBeforeUpload,
      isUploading
    ]
  );

  /**
   * 渲染预览图(矩形)
   */
  const renderRectPreview = useMemo(
    () => (
      <div className="relative mb-4">
        <div className="flex items-center justify-start rounded-lg duration-200">
          <ImgCrop key={currentAspectRatio} aspect={currentAspectRatio} cropShape="rect" rotationSlider>
            <Upload
              customRequest={uploadMode === 'immediate' ? customRequest : undefined}
              fileList={fileList}
              onChange={uploadMode === 'immediate' ? handleFileChange : undefined}
              showUploadList={false}
              maxCount={maxCount}
              accept={accept}
              beforeUpload={handleBeforeUpload}
            >
              <Button icon={<UploadOutlined />} variant="solid" color="blue" className="mt-4" loading={isUploading}>
                更换图片
              </Button>
            </Upload>
          </ImgCrop>
          {uploadMode === 'deferred' && (
            <Button
              icon={<DeleteOutlined />}
              variant="solid"
              color="red"
              className="text-white hover:bg-red-600 ml-16 mt-4"
              onClick={handleDeferredRemove}
            >
              删除
            </Button>
          )}
        </div>
      </div>
    ),
    [
      currentAspectRatio,
      maxCount,
      accept,
      uploadMode,
      customRequest,
      fileList,
      handleFileChange,
      handleDeferredRemove,
      handleBeforeUpload,
      isUploading
    ]
  );

  /**
   * 渲染空状态上传区域
   */
  const renderEmptyUpload = useMemo(
    () => (
      <div className="mb-4">
        <ImgCrop key={currentAspectRatio} aspect={currentAspectRatio} cropShape={cropShape} rotationSlider>
          <Upload
            customRequest={uploadMode === 'immediate' ? customRequest : undefined}
            fileList={fileList}
            onChange={uploadMode === 'immediate' ? handleFileChange : undefined}
            showUploadList={false}
            maxCount={maxCount}
            accept={accept}
            beforeUpload={handleBeforeUpload}
          >
            {renderUploadButton}
          </Upload>
        </ImgCrop>
      </div>
    ),
    [
      uploadMode,
      currentAspectRatio,
      cropShape,
      maxCount,
      accept,
      renderUploadButton,
      customRequest,
      fileList,
      handleFileChange,
      handleBeforeUpload
    ]
  );

  // ===== 主渲染 =====
  return (
    <div className="relative">
      {previewImage ? (cropShape === 'round' ? renderRoundPreview : renderRectPreview) : renderEmptyUpload}
    </div>
  );
};

export default ImageUploadWithCrop;
