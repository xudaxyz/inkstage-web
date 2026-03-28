import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  memo
} from 'react';
import type { MouseEvent, TouchEvent, CSSProperties } from 'react';

export interface SlideCaptchaProps {
    /** 验证图片地址（必传） */
    imgUrl: string;
    /** 验证码宽度（默认320px） */
    width?: number;
    /** 验证码高度（默认200px）- 图片高度 */
    imgHeight?: number;
    /** 滑块高度（默认40px） */
    sliderHeight?: number;
    /** 验证成功回调 */
    onSuccess: () => void;
    /** 验证失败回调 */
    onFail?: () => void;
    /** 重置验证码 */
    onReset?: () => void;
    /** 提示文字 */
    tipText?: string;
    /** 成功提示文字 */
    successText?: string;
    /** 失败提示文字 */
    failText?: string;
    /** 是否禁用 */
    disabled?: boolean;
    /** 对齐误差阈值（px），默认8px */
    gapTolerance?: number;
    /** 缺口形状：默认直角矩形 | 梯形 | 三角形 */
    gapShape?: 'rect' | 'trapezoid' | 'triangle';
}

// 滑动轨迹点类型
interface TrackPoint {
    x: number;
    time: number;
}

// 生成不同缺口的clipPath路径
const getGapClipPath = (shape: SlideCaptchaProps['gapShape'], size: number) :string => {
  switch (shape) {
    case 'trapezoid':
      // 梯形：上底80%，下底100%
      return `polygon(0 0, ${size * 0.8}px 0, ${size}px ${size}px, 0 ${size}px)`;
    case 'triangle':
      // 三角形
      return `polygon(0 0, ${size}px ${size / 2}px, 0 ${size}px)`;
    default:
      // 矩形
      return `polygon(0 0, ${size}px 0, ${size}px ${size}px, 0 ${size}px)`;
  }
};

const SlideCaptcha: React.FC<SlideCaptchaProps> = memo(({
  imgUrl,
  width = 320,
  imgHeight = 200,
  sliderHeight = 40,
  onSuccess,
  onFail,
  onReset,
  tipText = '拖动滑块完成拼图',
  successText = '验证成功',
  failText = '验证失败，请重试',
  disabled = false,
  gapTolerance = 8,
  gapShape = 'rect'
}) => {
  // 缺口大小 = 滑块高度
  const gapSize = sliderHeight;
  // 拼图块的垂直位置：居中显示
  const puzzleTop = (imgHeight - gapSize) / 2;

  // 状态管理
  const [isDragging, setIsDragging] = useState(false);
  const [sliderPosition, setSliderPosition] = useState(0);
  const [status, setStatus] = useState<'idle' | 'success' | 'fail'>('idle');
  const [tip, setTip] = useState(tipText);
  const [trackPoints, setTrackPoints] = useState<TrackPoint[]>([]);
  const [gapPosition, setGapPosition] = useState(0);

  // 引用
  const trackRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const isFirstRenderRef = useRef(true);

  // 生成随机缺口位置（异步执行避免ESLint报错）
  const generateRandomGap = useCallback(() => {
    if (disabled) return;
    queueMicrotask(() => {
      // 缺口位置范围：width * 0.2 ~ width - gapSize - width * 0.2
      const minX = width * 0.2;
      const maxX = width - gapSize - width * 0.2;
      const randomX = Math.floor(minX + Math.random() * (maxX - minX));
      setGapPosition(randomX);
      // 滑块重置到初始位置
      setSliderPosition(0);
    });
  }, [disabled, width, gapSize]);

  // 重置验证码
  const reset = useCallback(() => {
    setIsDragging(false);
    setSliderPosition(0);
    setStatus('idle');
    setTip(tipText);
    setTrackPoints([]);
    generateRandomGap();
    onReset?.();
  }, [tipText, generateRandomGap, onReset]);

  // 初始化缺口
  useEffect(() => {
    if (disabled || !isFirstRenderRef.current) return;
    generateRandomGap();
    isFirstRenderRef.current = false;

    const handleResize = () :void => {
      if (status === 'idle' && !disabled) generateRandomGap();
    };
    window.addEventListener('resize', handleResize);
    return () :void => {
      window.removeEventListener('resize', handleResize);
      isFirstRenderRef.current = true;
    };
  }, [disabled, generateRandomGap, status]);

  // 校验滑动轨迹
  const validateTrack = useCallback(() => {
    if (trackPoints.length < 3) return false;
    const totalTime = trackPoints[trackPoints.length - 1].time - trackPoints[0].time;
    return totalTime >= 300;
  }, [trackPoints]);

  // 滑动结束验证
  const handleDragEnd = useCallback(() => {
    if (disabled || status !== 'idle') return;
    setIsDragging(false);

    // 计算滑块与缺口的位置误差
    const positionError = Math.abs(sliderPosition - gapPosition);
    const trackValid = validateTrack();

    if (positionError <= gapTolerance && trackValid) {
      setStatus('success');
      setTip(successText);
      onSuccess();
      setTimeout(reset, 1500);
    } else {
      setStatus('fail');
      setTip(failText);
      onFail?.();
      setTimeout(reset, 1200);
    }
  }, [
    disabled, status, sliderPosition, gapPosition,
    gapTolerance, validateTrack, successText, failText,
    onSuccess, onFail, reset
  ]);

  // 滑动中
  const handleDragMove = useCallback((clientX: number) => {
    if (!isDragging || disabled || status !== 'idle' || !trackRef.current) return;

    const trackRect = trackRef.current.getBoundingClientRect();
    // 计算滑块位置（限制在轨道内）
    let newPosition = clientX - trackRect.left - gapSize / 2;
    newPosition = Math.max(0, Math.min(newPosition, width - gapSize));

    // 记录轨迹
    setTrackPoints(prev => [...prev, { x: newPosition, time: Date.now() }]);
    setSliderPosition(newPosition);
  }, [isDragging, disabled, status, width, gapSize]);

  // 鼠标按下
  const handleMouseDown = useCallback((e: MouseEvent<HTMLDivElement>) => {
    if (disabled || status !== 'idle') {
      e.preventDefault();
      return;
    }
    setIsDragging(true);
    setTrackPoints([{ x: 0, time: Date.now() }]);
  }, [disabled, status]);

  // 触摸按下
  const handleTouchStart = useCallback((e: TouchEvent<HTMLDivElement>) => {
    if (disabled || status !== 'idle') {
      e.preventDefault();
      return;
    }
    setIsDragging(true);
    setTrackPoints([{ x: 0, time: Date.now() }]);
  }, [disabled, status]);

  // 全局事件监听
  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: globalThis.MouseEvent) :void  => handleDragMove(e.clientX);
    const handleMouseUp = () :void => handleDragEnd();
    const handleTouchMove = (e: globalThis.TouchEvent) : void => {
      e.preventDefault();
      if (e.touches.length > 0) handleDragMove(e.touches[0].clientX);
    };
    const handleTouchEnd = () : void => handleDragEnd();

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('touchend', handleTouchEnd);

    return () : void => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isDragging, handleDragMove, handleDragEnd]);

  // 样式定义
  const containerStyle: CSSProperties = {
    width: `${width}px`,
    userSelect: 'none',
    opacity: disabled ? 0.7 : 1,
    pointerEvents: disabled ? 'none' : 'auto',
    margin: '0 auto'
  };

  const imgContainerStyle: CSSProperties = {
    width: `${width}px`,
    height: `${imgHeight}px`,
    position: 'relative',
    overflow: 'hidden',
    borderRadius: '8px',
    marginBottom: '12px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
  };

  // 背景图片样式
  const imgStyle: CSSProperties = {
    width: '100%',
    height: '100%',
    objectFit: 'cover'
  };

  // 图片上的缺口遮罩（半透明，提示缺口位置）
  const gapMaskStyle: CSSProperties = {
    position: 'absolute',
    left: `${gapPosition}px`,
    top: `${puzzleTop}px`,
    width: `${gapSize}px`,
    height: `${gapSize}px`,
    backgroundColor: 'rgba(0,0,0,0.5)',
    clipPath: getGapClipPath(gapShape, gapSize),
    zIndex: 2,
    border: '2px solid #ffffff',
    boxSizing: 'border-box'
  };

  // 滑块轨道样式
  const sliderTrackStyle: CSSProperties = {
    width: '100%',
    height: `${sliderHeight}px`,
    backgroundColor: '#f0f0f0',
    borderRadius: `${sliderHeight / 2}px`,
    position: 'relative',
    boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.15)',
    border: '1px solid #e0e0e0'
  };

  // 拼图块样式（核心：显示和缺口对应的图片内容）
  const puzzleStyle: CSSProperties = {
    position: 'absolute',
    left: `${sliderPosition}px`,
    top: `${puzzleTop}px`,
    width: `${gapSize}px`,
    height: `${gapSize}px`,
    backgroundImage: `url(${imgUrl})`,
    backgroundSize: `${width}px ${imgHeight}px`,
    // 背景定位：让拼图块显示缺口位置的图片内容
    backgroundPosition: `-${gapPosition}px -${puzzleTop}px`,
    clipPath: getGapClipPath(gapShape, gapSize),
    boxShadow: '0 0 0 3px #3b82f6, 0 4px 12px rgba(0,0,0,0.4)',
    zIndex: 4,
    transition: isDragging ? 'none' : 'left 0.2s ease',
    border: '3px solid #ffffff', // 更粗的白色边框，增强对比
    boxSizing: 'border-box' // 边框不占用额外宽度，避免拼图块变形
  };

  // 滑块手柄样式（和拼图块联动）
  const sliderHandleStyle: CSSProperties = {
    position: 'absolute',
    left: `${sliderPosition}px`,
    top: -5,
    width: `${gapSize + 10}px`,
    height: `${sliderHeight + 10}px`,
    backgroundColor: status === 'success' ? '#10b981' : status === 'fail' ? '#ef4444' : '#3b82f6',
    borderRadius: `${(sliderHeight + 10) / 2}px`,
    cursor: disabled ? 'not-allowed' : 'pointer',
    transition: isDragging ? 'none' : 'left 0.2s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
    zIndex: 3,
    border: '2px solid #ffffff'
  };

  // 进度条样式
  const progressStyle: CSSProperties = {
    position: 'absolute',
    left: 0,
    top: 0,
    height: '100%',
    width: `${sliderPosition + gapSize / 2}px`,
    backgroundColor: status === 'success' ? '#d1fae5' : status === 'fail' ? '#fee2e2' : '#dbeafe',
    borderRadius: `${sliderHeight / 2}px`,
    zIndex: 1
  };

  // 提示文字样式
  const tipStyle: CSSProperties = {
    position: 'absolute',
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: status === 'success' ? '#059669' : status === 'fail' ? '#dc2626' : '#6b7280',
    fontSize: '14px',
    zIndex: 0
  };

  return (
    <div style={containerStyle} className="slide-captcha-container">
      {/* 图片容器 - 带缺口和拼图块 */}
      <div style={imgContainerStyle}>
        <img ref={imgRef} src={imgUrl} alt="验证背景图" style={imgStyle} />
        {/* 图片缺口遮罩 */}
        <div style={gapMaskStyle} />
        {/* 可滑动的拼图块（核心新增） */}
        {status === 'idle' && <div style={puzzleStyle} />}
      </div>

      {/* 滑块轨道 */}
      <div ref={trackRef} style={sliderTrackStyle}>
        <div style={progressStyle} />
        <div style={tipStyle}>{tip}</div>
        {/* 滑块手柄 */}
        <div
          style={sliderHandleStyle}
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
          aria-label={disabled ? '验证已禁用' : tipText}
        >
          {status === 'success' ? '✓' : status === 'fail' ? '✕' : '▶'}
        </div>
      </div>
    </div>
  );
});

export default SlideCaptcha;
