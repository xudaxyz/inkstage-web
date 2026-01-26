import { Routes, Route } from 'react-router-dom';

// 导入页面组件
import Home from '../pages/Home';
// 导入认证组件
import Login from '../components/auth/Login';
import Register from '../components/auth/Register';

const AppRoutes = () => {
  return (
    <Routes>
      {/* 首页路由 */}
      <Route path="/" element={<Home />} />
      {/* 登录注册路由 */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
    </Routes>
  );
};

export default AppRoutes;