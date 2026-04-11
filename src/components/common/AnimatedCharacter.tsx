import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

interface AnimatedCharacterProps {
  isPasswordGuardMode: boolean;
  isTyping?: boolean;
  showPassword?: boolean;
  passwordLength?: number;
  className?: string;
}

interface CharacterState {
  isBlinking: boolean;
  blinkTimeout: ReturnType<typeof setTimeout> | null;
}

/**
 * 角色配置接口
 * 定义每个小人的外观、位置和动画参数
 */
interface CharacterConfig {
  id: number; // 角色唯一标识
  color: string; // 角色身体颜色
  width: number; // 角色宽度
  height: number; // 角色高度
  borderRadius: string; // 角色边框圆角
  zIndex: number; // 角色层级
  left: number; // 角色左侧位置
  eyeSize: number; // 眼睛大小
  eyePosition: number; // 眼睛位置（从顶部开始的距离）
  mouthSize: number; // 嘴巴大小
  mouthPosition: number; // 嘴巴位置（从顶部开始的距离）
  maxEyeDistance: number; // 眼睛最大移动距离
  bodySkewMultiplier: number; // 身体倾斜系数
  faceXMultiplier: number; // 面部X轴移动系数
  faceYMultiplier: number; // 面部Y轴移动系数
}

const characterConfigs: CharacterConfig[] = [
  {
    id: 0,
    color: '#6C3FF5',
    width: 180,
    height: 400,
    borderRadius: '20px 20px 0 0',
    zIndex: 1,
    left: 70,
    eyeSize: 18,
    eyePosition: 40,
    mouthSize: 40,
    mouthPosition: 150,
    maxEyeDistance: 5,
    bodySkewMultiplier: -0.5,
    faceXMultiplier: 0.75,
    faceYMultiplier: 0.33
  },
  {
    id: 1,
    color: '#2D2D2D',
    width: 120,
    height: 300,
    borderRadius: '8px 8px 0 0',
    zIndex: 2,
    left: 240,
    eyeSize: 16,
    eyePosition: 32,
    mouthSize: 32,
    mouthPosition: 100,
    maxEyeDistance: 4,
    bodySkewMultiplier: -0.5,
    faceXMultiplier: 0.75,
    faceYMultiplier: 0.33
  },
  {
    id: 2,
    color: '#FF9B6B',
    width: 240,
    height: 180,
    borderRadius: '120px 120px 0 0',
    zIndex: 3,
    left: 0,
    eyeSize: 14,
    eyePosition: 90,
    mouthSize: 0,
    mouthPosition: 0,
    maxEyeDistance: 5,
    bodySkewMultiplier: -0.5,
    faceXMultiplier: 0.75,
    faceYMultiplier: 0.33
  },
  {
    id: 3,
    color: '#E8D754',
    width: 140,
    height: 200,
    borderRadius: '70px 70px 0 0',
    zIndex: 4,
    left: 310,
    eyeSize: 16,
    eyePosition: 40,
    mouthSize: 40,
    mouthPosition: 142,
    maxEyeDistance: 5,
    bodySkewMultiplier: -0.5,
    faceXMultiplier: 0.75,
    faceYMultiplier: 0.33
  }
];

// 可重用的角色组件
interface CharacterProps {
  config: CharacterConfig;
  animation: { bodySkew: number; faceX: number; faceY: number; eyeX: number; eyeY: number };
  isBlinking: boolean;
  isPasswordGuardMode: boolean;
  isTyping: boolean;
  isShowingPassword: boolean;
  isLooking: boolean;
}

const Character: React.FC<CharacterProps> = ({
  config,
  animation,
  isBlinking,
  isPasswordGuardMode,
  isTyping,
  isShowingPassword,
  isLooking
}) => {
  const isPurpleCharacter = config.id === 0;

  return (
    <motion.div
      style={{
        position: 'absolute',
        bottom: 0,
        left: config.left,
        width: config.width,
        height: config.height,
        backgroundColor: config.color,
        borderRadius: config.borderRadius,
        zIndex: config.zIndex,
        transformOrigin: 'bottom center'
      }}
      animate={{
        skewX: isPasswordGuardMode ? 0 : animation.bodySkew,
        x:
          isTyping && !isShowingPassword && isPurpleCharacter
            ? 60
            : isTyping && !isShowingPassword && config.id === 1
              ? 40
              : 0,
        height: isTyping && !isShowingPassword && isPurpleCharacter ? 450 : config.height
      }}
      transition={{ duration: 0.1, ease: 'easeOut' }}
    >
      <div
        style={{
          position: 'absolute',
          top: config.eyePosition,
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          gap: config.eyeSize === 16 ? '32px' : '24px'
        }}
      >
        <motion.div
          style={{
            width: config.eyeSize,
            height: config.eyeSize,
            backgroundColor: 'white',
            borderRadius: '60%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
            position: 'relative'
          }}
          animate={{
            x: isLooking && isPurpleCharacter ? 10 : animation.faceX,
            y: isLooking && isPurpleCharacter ? 25 : animation.faceY
          }}
          transition={{ duration: 0.1, ease: 'easeOut' }}
        >
          <motion.div
            style={{
              width: config.eyeSize >= 16 ? 8 : 4,
              height: config.eyeSize >= 16 ? 8 : 4,
              backgroundColor: 'black',
              borderRadius: '50%',
              position: 'absolute',
              opacity: isBlinking ? 0 : 1
            }}
            animate={{ x: animation.eyeX, y: animation.eyeY }}
            transition={{ duration: 0.1, ease: 'easeOut' }}
          />
        </motion.div>
        <motion.div
          style={{
            width: config.eyeSize,
            height: config.eyeSize,
            backgroundColor: 'white',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
            position: 'relative'
          }}
          animate={{
            x: isLooking && isPurpleCharacter ? 10 : animation.faceX,
            y: isLooking && isPurpleCharacter ? 25 : animation.faceY
          }}
          transition={{ duration: 0.1, ease: 'easeOut' }}
        >
          <motion.div
            style={{
              width: config.eyeSize >= 16 ? 8 : 4,
              height: config.eyeSize >= 16 ? 8 : 4,
              backgroundColor: 'black',
              borderRadius: '50%',
              position: 'absolute',
              opacity: isBlinking ? 0 : 1
            }}
            animate={{ x: animation.eyeX, y: animation.eyeY }}
            transition={{ duration: 0.1, ease: 'easeOut' }}
          />
        </motion.div>
      </div>
      {config.mouthSize > 0 && (
        <motion.div
          style={{
            position: 'absolute',
            top: config.mouthPosition,
            left: '50%',
            transform: 'translateX(-50%)',
            width: config.mouthSize,
            height: 4,
            backgroundColor: 'black',
            borderRadius: '9999px'
          }}
          animate={{
            height: isTyping ? 2 : 4,
            width: isTyping ? config.mouthSize - 8 : config.mouthSize
          }}
          transition={{ duration: 0.3 }}
        />
      )}
    </motion.div>
  );
};

const AnimatedCharacter: React.FC<AnimatedCharacterProps> = ({
  isPasswordGuardMode,
  isTyping = false,
  showPassword = false,
  passwordLength = 0,
  className = ''
}) => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isLooking, setIsLooking] = useState(false);
  const [characters, setCharacters] = useState<CharacterState[]>([
    { isBlinking: false, blinkTimeout: null },
    { isBlinking: false, blinkTimeout: null },
    { isBlinking: false, blinkTimeout: null },
    { isBlinking: false, blinkTimeout: null }
  ]);
  const [animations, setAnimations] = useState<
    { bodySkew: number; faceX: number; faceY: number; eyeX: number; eyeY: number }[]
  >([
    { bodySkew: 0, faceX: 0, faceY: 0, eyeX: 0, eyeY: 0 },
    { bodySkew: 0, faceX: 0, faceY: 0, eyeX: 0, eyeY: 0 },
    { bodySkew: 0, faceX: 0, faceY: 0, eyeX: 0, eyeY: 0 },
    { bodySkew: 0, faceX: 0, faceY: 0, eyeX: 0, eyeY: 0 }
  ]);

  const containerRef = useRef<HTMLDivElement>(null);

  const isShowingPassword = passwordLength > 0 && showPassword;

  // 鼠标移动处理
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent): void => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return (): void => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // 计算动画状态
  useEffect(() => {
    const currentContainer = containerRef.current;
    if (!currentContainer) return;

    const newAnimations = characterConfigs.map((config) => {
      const rect = currentContainer.getBoundingClientRect();
      const cx = rect.left + config.left + config.width / 2;
      const cy = rect.top + config.height / 3;
      const dx = mousePosition.x - cx;
      const dy = mousePosition.y - cy;

      const bodySkew = Math.max(-6, Math.min(6, (dx * config.bodySkewMultiplier) / 100));
      const faceX = Math.max(-15, Math.min(15, (dx * config.faceXMultiplier) / 20));
      const faceY = Math.max(-10, Math.min(10, (dy * config.faceYMultiplier) / 30));

      let eyeX = 0;
      let eyeY = 0;

      // 确保密码保护模式优先，小人不会偷看
      if (isPasswordGuardMode) {
        eyeX = -5;
        eyeY = -5;
      } else if (!isShowingPassword && !isLooking) {
        const dist = Math.min(Math.sqrt(dx ** 2 + dy ** 2), config.maxEyeDistance);
        const angle = Math.atan2(dy, dx);
        eyeX = Math.cos(angle) * dist;
        eyeY = Math.sin(angle) * dist;
      }

      return { bodySkew, faceX, faceY, eyeX, eyeY };
    });

    setAnimations(newAnimations);
  }, [mousePosition, isShowingPassword, isLooking, isPasswordGuardMode]);

  // 眨眼动画
  useEffect(() => {
    const blinkTimeouts: ReturnType<typeof setTimeout>[] = [];

    const setupBlinking = (index: number): void => {
      const randomBlinkInterval = 2000 + Math.random() * 3000;
      const blinkTimeout = setTimeout(() => {
        setCharacters((prev) => {
          const newCharacters = [...prev];
          newCharacters[index] = { ...newCharacters[index], isBlinking: true };
          return newCharacters;
        });

        setTimeout(() => {
          setCharacters((prev) => {
            const newCharacters = [...prev];
            newCharacters[index] = { ...newCharacters[index], isBlinking: false };
            return newCharacters;
          });
          setupBlinking(index);
        }, 200);
      }, randomBlinkInterval);

      blinkTimeouts.push(blinkTimeout);
    };

    for (let i = 0; i < 4; i++) {
      setupBlinking(i);
    }

    return (): void => {
      blinkTimeouts.forEach((timeout) => clearTimeout(timeout));
    };
  }, []);

  // 输入状态处理
  useEffect(() => {
    // 使用setTimeout延迟执行，避免同步调用setState
    const handleInputState = (): (() => void) | undefined => {
      if (isPasswordGuardMode) {
        setIsLooking(false);
        return;
      }

      if (isTyping && !isShowingPassword) {
        setIsLooking(true);

        const timer = setTimeout(() => {
          setIsLooking(false);
        }, 800);

        return (): void => clearTimeout(timer);
      } else {
        setIsLooking(false);
      }
    };

    // 使用setTimeout避免同步调用setState
    const timeoutId = setTimeout(handleInputState, 0);
    return (): void => clearTimeout(timeoutId);
  }, [isTyping, isShowingPassword, isPasswordGuardMode]);

  return (
    <div ref={containerRef} className={`relative w-[550px] h-[400px] ${className}`}>
      {characterConfigs.map((config, index) => (
        <Character
          key={config.id}
          config={config}
          animation={animations[index]}
          isBlinking={characters[index].isBlinking}
          isPasswordGuardMode={isPasswordGuardMode}
          isTyping={isTyping}
          isShowingPassword={isShowingPassword}
          isLooking={isLooking}
        />
      ))}
    </div>
  );
};

export default AnimatedCharacter;
