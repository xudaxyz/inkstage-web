import React, { type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import AnimatedCharacter from '../components/common/AnimatedCharacter';

interface AuthLayoutProps {
  children: ReactNode;
  title: string;
  isPasswordGuardMode?: boolean;
  isTyping?: boolean;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ children, title, isPasswordGuardMode = false, isTyping = false }) => {
  return (
    <div className="flex min-h-screen flex-col bg-white font-sans">
      {/* 主体内容 - 左右布局，整体居中 */}
      <main className="flex-1 flex items-center justify-center px-8 py-12">
        <div className="flex flex-col md:flex-row items-center md:items-stretch max-w-5xl w-full">
          {/* 左侧图片 */}
          <div className="hidden md:block md:w-1/2">
            <div className="h-[600px] bg-gray-100 rounded-l-lg overflow-hidden relative">
              <img
                src="/assets/images/inkstage-bg.png"
                alt="InkStage Background"
                className="w-full h-full object-cover"
              />
              {/* 互动小人 */}
              <div className="absolute bottom-0 left-0 w-full h-[400px]">
                <AnimatedCharacter isPasswordGuardMode={isPasswordGuardMode} isTyping={isTyping} className="mx-auto" />
              </div>
            </div>
          </div>

          {/* 右侧表单 */}
          <div className="flex w-full md:w-1/2 items-center justify-center bg-gray-50 rounded-r-lg shadow-lg p-8">
            <div className="w-full max-w-md">
              {/* 品牌标识 */}
              <div className="flex flex-col items-center mb-8">
                <Link to="/" className="cursor-pointer transition-all duration-300 hover:scale-105">
                  <h1 className="text-2xl font-bold bg-linear-to-r from-blue-600 via-purple-500 to-indigo-600 bg-clip-text text-transparent mb-2">
                    InkStage
                  </h1>
                </Link>
              </div>

              {/* 页面标题 */}
              <h2 className="text-2xl font-semibold text-gray-800 mb-8 text-center">{title}</h2>

              {/* 子组件插槽 - 登录/注册表单 */}
              <div className="w-full">{children}</div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AuthLayout;
