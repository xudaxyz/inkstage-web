import React, { useState, useRef, useEffect } from 'react';
import { Modal, Button } from 'antd';

interface PuzzleSliderCaptchaProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const PuzzleSliderCaptcha: React.FC<PuzzleSliderCaptchaProps> = ({ 
  visible, 
  onClose, 
  onSuccess 
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState(0);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  
  const containerRef = useRef<HTMLDivElement>(null);
  const sliderRef = useRef<HTMLDivElement>(null);
  const puzzleRef = useRef<HTMLDivElement>(null);
  
  // 容器尺寸
  const containerWidth = 320;
  const containerHeight = 200;
  
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
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    e.preventDefault();
  };
  
  // 处理鼠标移动
  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging || !containerRef.current) return;
    
    const containerRect = containerRef.current.getBoundingClientRect();
    let newPosition = e.clientX - containerRect.left - puzzleSize / 2;
    
    // 限制位置范围
    newPosition = Math.max(0, Math.min(newPosition, containerWidth - puzzleSize));
    
    setPosition(newPosition);
  };
  
  // 处理鼠标释放
  const handleMouseUp = () => {
    if (!isDragging) return;
    
    setIsDragging(false);
    
    // 验证位置（只需要验证X坐标，Y坐标固定）
    if (Math.abs(position - targetPosition.x) <= tolerance) {
      // 验证成功
      setStatus('success');
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 500);
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
    >
      <div className="flex flex-col items-center">
        {/* 提示文字 */}
        <div className="mb-4 text-center text-gray-600">
          {status === 'idle' && '请拖动滑块将拼图填充到正确位置'}
          {status === 'success' && '验证成功！'}
          {status === 'error' && '验证失败，请重试'}
        </div>
        
        {/* 验证码容器 */}
        <div 
          ref={containerRef}
          className="relative w-full h-[200px] bg-gray-100 rounded-lg overflow-hidden border border-gray-300"
          style={{ width: containerWidth, height: containerHeight }}
        >
          {/* 背景图（使用渐变色模拟） */}
          <div 
            className="absolute inset-0 bg-linear-to-r from-blue-100 to-purple-100"
          />
          
          {/* 缺口区域 */}
          <div 
            className="absolute bg-white border-2 border-gray-300 shadow-md"
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
            className={`absolute cursor-pointer transition-all duration-100 ${isDragging ? 'shadow-lg' : ''}`}
            style={{
              left: `${position}px`,
              top: `${targetPosition.y}px`,
              width: puzzleSize,
              height: puzzleSize,
              backgroundColor: '#fff',
              border: '2px solid #d9d9d9',
              borderRadius: '4px',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
              clipPath: `polygon(0 0, 100% 0, 100% 80%, 80% 100%, 0 100%)`
            }}
          />
        </div>
        
        {/* 滑块轨道 */}
        <div className="mt-4 w-full" style={{ width: containerWidth }}>
          <div className="relative w-full h-8 bg-gray-200 rounded-lg overflow-hidden">
            {/* 已滑动轨迹 */}
            <div 
              className={`absolute top-0 left-0 h-full ${status === 'success' ? 'bg-green-500' : status === 'error' ? 'bg-red-500' : 'bg-blue-500'}`}
              style={{ width: `${(position + puzzleSize / 2) / containerWidth * 100}%` }}
            />
            
            {/* 滑块 */}
            <div 
              ref={sliderRef}
              className={`absolute top-1/2 left-0 transform -translate-y-1/2 w-10 h-8 bg-white border-2 border-gray-300 rounded-md shadow-md cursor-pointer transition-all duration-200 ${isDragging ? 'shadow-lg' : ''}`}
              style={{ left: `${position}px` }}
              onMouseDown={handleMouseDown}
            >
              <div className="w-full h-full flex items-center justify-center text-gray-600">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </div>
            </div>
          </div>
        </div>
        
        {/* 操作按钮 */}
        <div className="mt-6 flex gap-3">
          <Button 
            type="default" 
            onClick={onClose}
            className="flex-1"
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
            disabled={status === 'success'}
          >
            重新生成
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default PuzzleSliderCaptcha;