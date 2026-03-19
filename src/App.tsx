import { BrowserRouter as Router } from 'react-router-dom';

// 导入路由配置
import AppRoutes from './routes';
// 导入WebSocket服务
import websocketService from './services/websocketService';
import { useEffect } from 'react';
// 导入用户状态管理
import { useUserStore } from './store';
// 导入全局通知组件
import Notification from './components/common/Notification';

import type { ReactNode } from 'react';

function App (): ReactNode {
  const { initAuth } = useUserStore();

  useEffect(() => {
    // 初始化登录状态
    initAuth()
      .then(() => {
        console.log('登录状态初始化完成');
      })
      .catch((error) => {
        console.error('登录状态初始化失败:', error);
      });

    // 连接WebSocket
    websocketService.connect()
      .then(() => {
        console.log('WebSocket连接成功');
      })
      .catch((error) => {
        console.error('WebSocket连接失败:', error);
      });

    // 组件卸载时断开WebSocket连接
    return (): void => {
      websocketService.disconnect();
    };
  }, [initAuth]);

  return (
    <Router>
      <Notification />
      <AppRoutes />
    </Router>
  );
}

export default App;
