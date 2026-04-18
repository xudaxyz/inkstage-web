import React from 'react';
import { Button } from 'antd';
import { ArrowLeftOutlined, HomeOutlined } from '@ant-design/icons';
import Header from '../common/Header';
import Footer from '../common/Footer';

interface ErrorBoundaryProps {
  error?: string;
  message?: string;
}

const ErrorBoundary: React.FC<ErrorBoundaryProps> = ({
  error = '文章不存在',
  message = '很抱歉，您访问的文章可能已被删除或不存在。'
}) => {
  return (
    <div className="flex min-h-screen flex-col bg-white font-sans">
      <Header />
      <main className="flex-1 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="text-red-500 text-6xl mb-4">😢</div>
          <h2 className="text-2xl font-bold mb-2 text-gray-800">{error}</h2>
          <p className="text-gray-500 mb-6">{message}</p>
          <div className="flex gap-4 justify-center">
            <Button
              onClick={() => window.history.back()}
              className="px-6 py-2 bg-gray-100 text-gray-800 rounded-md hover:bg-gray-200 transition-colors"
            >
              <ArrowLeftOutlined />
              返回上一页
            </Button>
            <Button
              onClick={() => (window.location.href = '/')}
              className="ml-10 px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
            >
              <HomeOutlined />
              回到首页
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ErrorBoundary;
