import { Routes, Route } from 'react-router-dom';

// 导入页面组件
import Home from '../pages/front/Home.tsx';
import Profile from '../pages/front/Profile.tsx';
import CreateArticle from '../pages/front/CreateArticle.tsx';
import ArticleDetail from '../pages/front/ArticleDetail.tsx';
import ProfileLayout from '../layouts/ProfileLayout';
import ProfileInfo from '../pages/front/profile/ProfileInfo';
import MyCreations from '../pages/front/profile/MyCreations';
import MyCollections from '../pages/front/profile/MyCollections';
import ReadingHistory from '../pages/front/profile/ReadingHistory';
import Notifications from '../pages/front/profile/Notifications';
import AccountSettings from '../pages/front/profile/AccountSettings';

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
      {/* 写文章路由 */}
      <Route path="/create-article" element={<CreateArticle />} />
      {/* 文章详情路由 */}
      <Route path="/article/:id" element={<ArticleDetail />} />
      {/* 个人中心路由 */}
      <Route path="/profile" element={<ProfileLayout />}>
        <Route index element={<Profile />} />
        <Route path="info" element={<ProfileInfo />} />
        <Route path="creations" element={<MyCreations />} />
        <Route path="collections" element={<MyCollections />} />
        <Route path="history" element={<ReadingHistory />} />
        <Route path="notifications" element={<Notifications />} />
        <Route path="settings" element={<AccountSettings />} />
      </Route>
    </Routes>
  );
};

export default AppRoutes;