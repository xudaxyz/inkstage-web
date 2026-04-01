import React, { useState } from 'react';
import type { UploadFile, UploadProps } from 'antd';
import { Button, Tooltip, Upload } from 'antd';
import { CameraOutlined, UploadOutlined } from '@ant-design/icons';
import ImgCrop from 'antd-img-crop';

interface ImageUploadWithCropProps {
  onUploadSuccess: (url: string) => void;
  currentImage?: string;
  cropShape?: 'rect' | 'round';
  aspectRatio?: number;
  uploadButton?: React.ReactNode;
  maxCount?: number;
  accept?: string;
  customRequest: UploadProps['customRequest'];
  placeholder?: string;
  className?: string;
}

const ImageUploadWithCrop: React.FC<ImageUploadWithCropProps> = ({
  onUploadSuccess,
  currentImage,
  cropShape = 'rect',
  aspectRatio = 1,
  uploadButton,
  maxCount = 1,
  accept = 'image/*',
  customRequest,
  placeholder = '点击上传图片',
  className = ''
}) => {
  const [fileList, setFileList] = useState<UploadFile[]>([]);

  const onChange: UploadProps['onChange'] = ({ file, fileList: newFileList }) => {
    setFileList(newFileList);

    if (file.status === 'done') {
      // 上传成功后获取返回的URL
      if (file.response && file.response.data) {
        onUploadSuccess(file.response.data);
      }
    }
  };

  const defaultUploadButton = uploadButton || (
    <Button
      icon={<UploadOutlined />}
      className={`${className} ${currentImage ? '' : 'w-full h-48 flex items-center justify-center border-dashed'}`}
    >
      <Tooltip title={placeholder}>{placeholder}</Tooltip>
    </Button>
  );

  return (
    <div className="relative">
      {currentImage && cropShape === 'round' ? (
        <div className="relative mb-4">
          <div className="rounded-full overflow-hidden" style={{ width: '100px', height: '100px' }}>
            <img src={currentImage} alt="当前图片" className="w-full h-full object-cover" />
          </div>
          <div className="absolute bottom-0 right-0 bg-white rounded-full p-1 shadow-md">
            <ImgCrop aspect={aspectRatio} cropShape={'round'} rotationSlider>
              <Upload
                customRequest={customRequest}
                fileList={fileList}
                onChange={onChange}
                showUploadList={false}
                maxCount={maxCount}
                accept={accept}
              >
                <Button icon={<CameraOutlined />} size="small" className="rounded-full" />
              </Upload>
            </ImgCrop>
          </div>
        </div>
      ) : currentImage ? (
        <div className="relative mb-4">
          <div className="absolute inset-0 bg-black/30 flex items-center justify-center rounded-lg">
            <ImgCrop aspect={aspectRatio} cropShape={'rect'} rotationSlider>
              <Upload
                customRequest={customRequest}
                fileList={fileList}
                onChange={onChange}
                showUploadList={false}
                maxCount={maxCount}
                accept={accept}
              >
                <Button icon={<UploadOutlined />} className="bg-white/80 backdrop-blur-sm text-gray-700 hover:bg-white">
                  更换图片
                </Button>
              </Upload>
            </ImgCrop>
          </div>
        </div>
      ) : (
        <div className="mb-4">
          <ImgCrop aspect={aspectRatio} cropShape={cropShape} rotationSlider>
            <Upload
              customRequest={customRequest}
              fileList={fileList}
              onChange={onChange}
              showUploadList={false}
              maxCount={maxCount}
              accept={accept}
            >
              {defaultUploadButton}
            </Upload>
          </ImgCrop>
        </div>
      )}
    </div>
  );
};

export default ImageUploadWithCrop;
