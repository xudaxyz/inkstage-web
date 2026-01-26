import React, { type ReactNode } from 'react';
import { Card } from 'antd';
import { Link } from 'react-router-dom';
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';

interface AuthLayoutProps {
  children: ReactNode;
  title: string;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ children, title }) => {
  return (
    <div className="flex min-h-screen flex-col bg-white font-sans">
      {/* 顶部导航栏 */}
      <Header />
      
      {/* 主体内容 */}
      <main className="flex-1 flex items-start justify-center pt-25 pb-12 px-[5%]">
        {/* 卡片容器 */}
        <div className="w-full max-w-md">
          <Card 
            className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200 transition-all duration-300 hover:shadow-xl">
            {/* 品牌标识 */}
            <div className="flex flex-col items-center mb-6">
              <Link to="/" className="cursor-pointer transition-all duration-300 hover:scale-105">
                <h1 className="text-2xl font-bold bg-linear-to-r from-blue-600 via-purple-500 to-indigo-600 bg-clip-text text-transparent mb-2">InkStage</h1>
              </Link>
            </div>
            
            {/* 页面标题 */}
            <h2 className="text-2xl font-semibold text-gray-800 mb-8 text-center">{title}</h2>
            
            {/* 子组件插槽 - 登录/注册表单 */}
            <div className="w-full">
              {children}
            </div>
          </Card>
        </div>
      </main>
      
      {/* 页脚信息 */}
      <Footer />
    </div>
  );
};

export default AuthLayout;