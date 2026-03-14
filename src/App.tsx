import { BrowserRouter as Router } from 'react-router-dom';

// 导入路由配置
import AppRoutes from './routes';
// 导入WebSocket服务
import websocketService from './services/websocketService';
import { useEffect } from 'react';

function App () {
  useEffect(() => {
    // 连接WebSocket
    websocketService.connect()
      .then(() => {
        console.log('WebSocket连接成功');
      })
      .catch((error) => {
        console.error('WebSocket连接失败:', error);
      });

    // 组件卸载时断开WebSocket连接
    return () => {
      websocketService.disconnect();
    };
  }, []);

  return (
    <Router>
      <AppRoutes />
    </Router>
  );
}

export default App;
