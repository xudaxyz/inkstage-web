import React, { useState, memo } from 'react';
import SlideCaptcha from './SlideCaptcha';
import type { SlideCaptchaProps } from './SlideCaptcha';

export interface SlideCaptchaModalProps {
    visible: boolean;
    onClose: () => void;
    onSuccess: () => void;
    onFail?: () => void;
    /** 验证码图片地址 */
    imgUrl: string;
    /** 弹窗标题 */
    title?: string;
    /** 验证码配置 */
    captchaProps?: Omit<SlideCaptchaProps, 'imgUrl' | 'onSuccess' | 'onFail'>;
}

const SlideCaptchaModal: React.FC<SlideCaptchaModalProps> = memo(({
  visible,
  onClose,
  onSuccess,
  onFail,
  imgUrl,
  title = '安全验证',
  captchaProps = {}
}) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleSuccess = (): void => {
    setIsLoading(true);
    // 模拟接口校验延迟
    setTimeout(() => {
      onSuccess();
      onClose();
      setIsLoading(false);
    }, 500);
  };

  const handleFail = (): void => {
    setIsLoading(false);
    onFail?.();
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 relative">
        {/* 关闭按钮 */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition-colors"
          disabled={isLoading}
        >
          <span className="text-xl">×</span>
        </button>

        {/* 弹窗标题 */}
        <h3 className="text-lg font-medium text-gray-800 mb-4 text-center">
          {title}
        </h3>

        {/* 滑动验证码 */}
        <SlideCaptcha
          imgUrl={imgUrl}
          onSuccess={handleSuccess}
          onFail={handleFail}
          disabled={isLoading}
          {...captchaProps}
        />
      </div>
    </div>
  );
});

export default SlideCaptchaModal;
