import React from 'react';
import { GithubOutlined, MailOutlined } from '@ant-design/icons';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-50 dark:bg-gray-800 backdrop-blur-sm border-t dark:border-t border-gray-200 dark:border-gray-700 py-10 mt-auto">
      <div className="px-[5%] max-w-7xl mx-auto">
        {/* 导航链接 */}
        <div className="flex flex-wrap justify-center gap-8 mb-6">
          <a href="/about" target="_blank" rel="noopener noreferrer" className="transition-colors duration-200">
            <span className="text-gray-600 dark:text-gray-300 hover:text-blue-600">关于我</span>
          </a>
          <a href="/help" target="_blank" rel="noopener noreferrer" className="transition-colors duration-200">
            <span className="text-gray-600 dark:text-gray-300 hover:text-blue-600">使用指南</span>
          </a>
          <a
            href="/community-rules"
            target="_blank"
            rel="noopener noreferrer"
            className="transition-colors duration-200"
          >
            <span className="text-gray-600 dark:text-gray-300 hover:text-blue-600">社区规范</span>
          </a>
          <a href="/contact" target="_blank" rel="noopener noreferrer" className="transition-colors duration-200">
            <span className="text-gray-600 dark:text-gray-300 hover:text-blue-600">联系我</span>
          </a>
        </div>

        {/* 社交媒体图标 */}
        <div className="flex justify-center gap-6 mb-6">
          <a
            href="https://github.com/xudaxyz"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-500 dark:text-gray-400 hover:text-blue-600 transition-colors duration-200"
          >
            <GithubOutlined style={{ fontSize: '20px' }} />
          </a>
          <a
            href="#"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-500 dark:text-gray-400 hover:text-blue-600 transition-colors duration-200"
          >
            <MailOutlined style={{ fontSize: '20px' }} />
          </a>
        </div>

        {/* 版权信息 */}
        <div className="text-center text-sm text-gray-500">
          <p>© 2026 DaXu's Blog. 用心记录，分享生活</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
