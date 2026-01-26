import React, { useState, useRef, useEffect } from 'react';

interface SliderCaptchaProps {
  onSuccess: () => void;
  className?: string;
}

const SliderCaptcha: React.FC<SliderCaptchaProps> = ({ 
  onSuccess, 
  className 
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState(0);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  
  const containerRef = useRef<HTMLDivElement>(null);
  const sliderRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  
  // 目标位置（随机生成，范围：容器宽度 - 滑块宽度）
  const [targetPosition, setTargetPosition] = useState(0);
  
  // 滑块宽度
  const sliderWidth = 40;
  // 验证误差范围
  const tolerance = 5;
  
  // 初始化目标位置
  useEffect(() => {
    if (containerRef.current) {
      const containerWidth = containerRef.current.offsetWidth;
      // 生成随机目标位置，确保在有效范围内
      const randomPos = Math.floor(Math.random() * (containerWidth - sliderWidth * 2)) + sliderWidth;
      setTargetPosition(randomPos);
    }
  }, []);
  
  // 处理鼠标按下
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    e.preventDefault();
  };
  
  // 处理鼠标移动
  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging || !containerRef.current) return;
    
    const containerRect = containerRef.current.getBoundingClientRect();
    let newPosition = e.clientX - containerRect.left - sliderWidth / 2;
    
    // 限制位置范围
    newPosition = Math.max(0, Math.min(newPosition, containerRect.width - sliderWidth));
    
    setPosition(newPosition);
  };
  
  // 处理鼠标释放
  const handleMouseUp = () => {
    if (!isDragging) return;
    
    setIsDragging(false);
    
    // 验证位置
    if (Math.abs(position - targetPosition) <= tolerance) {
      // 验证成功
      setStatus('success');
      onSuccess();
    } else {
      // 验证失败
      setStatus('error');
      // 重置位置
      setTimeout(() => {
        setPosition(0);
        setStatus('idle');
      }, 1000);
    }
  };
  
  // 添加全局鼠标事件监听
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);
  
  // 获取提示文字
  const getTipText = () => {
    switch (status) {
      case 'success':
        return '验证成功';
      case 'error':
        return '验证失败，请重试';
      default:
        return '按住滑块，拖动到右侧';
    }
  };
  
  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden ${className}`}>
      <div 
        ref={containerRef}
        className="relative w-full h-16 bg-gray-100 overflow-hidden"
      >
        {/* 目标点 */}
        <div 
          className="absolute top-1/2 left-0 transform -translate-y-1/2 w-10 h-10 bg-white border-2 border-gray-300 rounded-md shadow-sm"
          style={{ left: `${targetPosition}px` }}
        >
          <div className="w-full h-full flex items-center justify-center text-gray-500">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>
        
        {/* 已滑动轨迹 */}
        <div 
          ref={trackRef}
          className={`absolute top-0 left-0 h-full ${status === 'success' ? 'bg-green-500' : status === 'error' ? 'bg-red-500' : 'bg-blue-500'}`}
          style={{ width: `${position + sliderWidth / 2}px` }}
        />
        
        {/* 滑块 */}
        <div 
          ref={sliderRef}
          className={`absolute top-1/2 left-0 transform -translate-y-1/2 w-10 h-12 bg-white border-2 border-gray-300 rounded-md shadow-md cursor-pointer transition-all duration-200 ${isDragging ? 'shadow-lg' : ''}`}
          style={{ left: `${position}px` }}
          onMouseDown={handleMouseDown}
        >
          <div className="w-full h-full flex items-center justify-center text-gray-600">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </div>
        </div>
      </div>
      
      {/* 提示文字 */}
      <div className="p-2 text-center text-sm text-gray-600">
        {getTipText()}
      </div>
    </div>
  );
};

export default SliderCaptcha;