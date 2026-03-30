import { BrowserRouter as Router } from 'react-router-dom';
import { ConfigProvider, theme } from 'antd';
import { useEffect } from 'react';

// 导入路由配置
import AppRoutes from './routes';
// 导入WebSocket服务
import websocketService from './services/websocketService';
// 导入用户状态管理
import { useUserStore } from './store';
// 导入管理员状态管理
import { useAdminStore } from './store/adminStore';
// 导入认证错误状态管理
import { useAuthErrorStore } from './store/authErrorStore';
// 导入应用状态管理
import { useTheme } from './store';
// 导入全局通知组件
import Notification from './components/common/Notification';
// 导入认证错误处理组件
import AuthErrorHandler from './components/common/AuthErrorHandler';

import type { ReactNode } from 'react';

function App (): ReactNode {
  const { initAuth: initUserAuth } = useUserStore();
  const { initAuth: initAdminAuth } = useAdminStore();
  const { error, hideError } = useAuthErrorStore();
  const currentTheme = useTheme();

  // 监听主题变化
  useEffect(() => {
    if (currentTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [currentTheme]);

  useEffect(() => {
    // 初始化登录状态
    Promise.all([
      initUserAuth(),
      initAdminAuth()
    ])
      .then(() => {
      })
      .catch((error) => {
        console.error('登录状态初始化失败:', error);
      });

    // 连接WebSocket
    websocketService.connect()
      .then(() => {
      })
      .catch((error) => {
        console.error('WebSocket连接失败:', error);
      });

    // 组件卸载时断开WebSocket连接
    return (): void => {
      websocketService.disconnect();
    };
  }, [initUserAuth, initAdminAuth]);

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#0ea5e9'
        },
        algorithm: currentTheme === 'dark' ? theme.darkAlgorithm : theme.defaultAlgorithm
      }}
    >
      <Router>
        <Notification />
        {error && (
          <AuthErrorHandler
            message={error.message}
            onClose={hideError}
            showActions={error.showActions}
            redirectToLogin={error.redirectToLogin}
          />
        )}
        <AppRoutes />
      </Router>
    </ConfigProvider>
  );
}

export default App;
