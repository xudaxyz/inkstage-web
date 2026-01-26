import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Modal, Button } from 'antd';

interface SmoothSliderCaptchaProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const SmoothSliderCaptcha: React.FC<SmoothSliderCaptchaProps> = ({ 
  visible, 
  onClose, 
  onSuccess 
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState(0);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  
  const containerRef = useRef<HTMLDivElement>(null);
  const sliderRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const puzzleRef = useRef<HTMLDivElement>(null);
  
  // 容器尺寸
  const containerWidth = 320;
  const containerHeight = 160;
  
  // 滑块和拼图尺寸
  const puzzleSize = 40;
  
  // 目标位置（随机生成）
  const [targetPosition, setTargetPosition] = useState({
    x: 0,
    y: 0
  });
  
  // 验证误差范围
  const tolerance = 5;
  
  // 初始化目标位置
  useEffect(() => {
    if (visible) {
      // 生成随机位置，确保拼图在容器内
      const randomX = Math.floor(Math.random() * (containerWidth - puzzleSize * 2)) + puzzleSize;
      const randomY = Math.floor(Math.random() * (containerHeight - puzzleSize * 2)) + puzzleSize;
      setTargetPosition({ x: randomX, y: randomY });
      setPosition(0);
      setStatus('idle');
    }
  }, [visible]);
  
  // 处理鼠标按下
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    setIsDragging(true);
    e.preventDefault();
  }, []);
  
  // 处理触摸开始
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    setIsDragging(true);
    e.preventDefault();
  }, []);
  
  // 处理鼠标移动
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging || !containerRef.current) return;
    
    const containerRect = containerRef.current.getBoundingClientRect();
    let newPosition = e.clientX - containerRect.left - puzzleSize / 2;
    
    // 限制位置范围
    newPosition = Math.max(0, Math.min(newPosition, containerWidth - puzzleSize));
    
    setPosition(newPosition);
  }, [isDragging]);
  
  // 处理触摸移动
  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!isDragging || !containerRef.current) return;
    
    const containerRect = containerRef.current.getBoundingClientRect();
    const touch = e.touches[0];
    let newPosition = touch.clientX - containerRect.left - puzzleSize / 2;
    
    // 限制位置范围
    newPosition = Math.max(0, Math.min(newPosition, containerWidth - puzzleSize));
    
    setPosition(newPosition);
  }, [isDragging]);
  
  // 处理鼠标释放
  const handleMouseUp = useCallback(() => {
    if (!isDragging) return;
    
    setIsDragging(false);
    
    // 验证位置
    if (Math.abs(position - targetPosition.x) <= tolerance) {
      // 验证成功
      setStatus('success');
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 500);
    } else {
      // 验证失败，滑块回弹
      setStatus('error');
      setTimeout(() => {
        setPosition(0);
        setStatus('idle');
      }, 800);
    }
  }, [isDragging, position, targetPosition.x, onSuccess, onClose]);
  
  // 处理触摸结束
  const handleTouchEnd = useCallback(() => {
    handleMouseUp();
  }, [handleMouseUp]);
  
  // 添加全局事件监听
  useEffect(() => {
    if (isDragging) {
      // 添加鼠标事件监听
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      
      // 添加触摸事件监听，支持移动端
      document.addEventListener('touchmove', handleTouchMove, { passive: false });
      document.addEventListener('touchend', handleTouchEnd);
    }
    
    return () => {
      // 移除所有事件监听
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isDragging, handleMouseMove, handleMouseUp, handleTouchMove, handleTouchEnd]);
  
  // 获取滑块样式
  const getSliderStyle = () => {
    const translate = `translateX(${position}px)`;
    
    return {
      transform: translate,
      WebkitTransform: translate,
      transition: isDragging ? 'none' : 'transform 0.3s cubic-bezier(0.18, 0.89, 0.32, 1.28)',
      WebkitTransition: isDragging ? 'none' : 'transform 0.3s cubic-bezier(0.18, 0.89, 0.32, 1.28)'
    };
  };
  
  // 获取拼图样式
  const getPuzzleStyle = () => {
    const translate = `translateX(${position}px)`;
    
    return {
      transform: translate,
      WebkitTransform: translate,
      transition: isDragging ? 'none' : 'transform 0.3s cubic-bezier(0.18, 0.89, 0.32, 1.28)',
      WebkitTransition: isDragging ? 'none' : 'transform 0.3s cubic-bezier(0.18, 0.89, 0.32, 1.28)'
    };
  };
  
  // 获取进度条样式
  const getProgressStyle = () => {
    const width = `${(position + puzzleSize / 2) / containerWidth * 100}%`;
    
    return {
      width,
      transition: 'width 0.1s ease-out',
      WebkitTransition: 'width 0.1s ease-out',
      backgroundColor: status === 'success' ? '#52c41a' : status === 'error' ? '#ff4d4f' : '#1890ff'
    };
  };
  
  return (
    <Modal
      title="验证身份"
      open={visible}
      onCancel={onClose}
      footer={null}
      centered
      width={400}
      closeIcon={null}
      maskClosable={false}
      className="smooth-slider-captcha-modal"
    >
      <div className="flex flex-col items-center">
        {/* 提示文字 */}
        <div className={`mb-4 text-center text-sm font-medium transition-all duration-300 ${status === 'success' ? 'text-green-500' : status === 'error' ? 'text-red-500' : 'text-gray-600'}`}>
          {status === 'idle' && '请拖动滑块完成验证'}
          {status === 'success' && '验证成功！'}
          {status === 'error' && '验证失败，请重试'}
        </div>
        
        {/* 验证码容器 */}
        <div 
          ref={containerRef}
          className="relative w-full bg-white rounded-lg overflow-hidden border border-gray-200 shadow-sm"
          style={{ width: containerWidth, height: containerHeight }}
        >
          {/* 背景渐变 */}
          <div 
            className="absolute inset-0 bg-linear-to-r from-blue-50 via-purple-50 to-pink-50"
          />
          
          {/* 随机背景图案 - 圆点 */}
          {Array.from({ length: 20 }).map((_, index) => (
            <div 
              key={index}
              className="absolute w-2 h-2 bg-blue-200 rounded-full opacity-50"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
            />
          ))}
          
          {/* 缺口区域 */}
          <div 
            className="absolute bg-white border-2 border-gray-200 shadow-sm"
            style={{
              left: `${targetPosition.x}px`,
              top: `${targetPosition.y}px`,
              width: puzzleSize,
              height: puzzleSize,
              clipPath: `polygon(0 0, 100% 0, 100% 80%, 80% 100%, 0 100%)`
            }}
          />
          
          {/* 滑块拼图 */}
          <div 
            ref={puzzleRef}
            className={`absolute cursor-pointer transition-shadow duration-200 ${isDragging ? 'shadow-lg' : 'shadow-sm'}`}
            style={{
              left: `${targetPosition.x}px`,
              top: `${targetPosition.y}px`,
              width: puzzleSize,
              height: puzzleSize,
              backgroundColor: '#fff',
              border: '2px solid #d9d9d9',
              borderRadius: '4px',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
              clipPath: `polygon(0 0, 100% 0, 100% 80%, 80% 100%, 0 100%)`,
              ...getPuzzleStyle()
            }}
          />
        </div>
        
        {/* 滑块轨道 */}
        <div 
          ref={trackRef}
          className="mt-4 relative w-full h-10 bg-gray-100 rounded-full overflow-hidden border border-gray-200"
          style={{ width: containerWidth }}
        >
          {/* 进度条 */}
          <div 
            className="absolute top-0 left-0 h-full bg-primary-500"
            style={getProgressStyle()}
          />
          
          {/* 滑块 */}
          <div 
            ref={sliderRef}
            className={`absolute top-1/2 left-0 transform -translate-y-1/2 w-12 h-8 bg-white border-2 border-primary-300 rounded-full shadow-md cursor-pointer transition-all duration-200 ${isDragging ? 'shadow-lg scale-105' : 'hover:shadow-md'}`}
            style={{
              ...getSliderStyle()
            }}
            onMouseDown={handleMouseDown}
            onTouchStart={handleTouchStart}
          >
            <div className="w-full h-full flex items-center justify-center text-primary-500">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </div>
          </div>
        </div>
        
        {/* 操作按钮 */}
        <div className="mt-6 flex gap-3 w-full" style={{ width: containerWidth }}>
          <Button 
            type="default" 
            onClick={onClose}
            className="flex-1"
            size="middle"
          >
            取消
          </Button>
          <Button 
            type="primary" 
            onClick={() => {
              setPosition(0);
              setStatus('idle');
            }}
            className="flex-1"
            size="middle"
            disabled={status === 'success'}
          >
            刷新
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default SmoothSliderCaptcha;