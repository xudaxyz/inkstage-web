import { Routes, Route, Navigate } from 'react-router-dom';
import { useUser } from '../store';

// 导入页面组件
import Home from '../pages/front/Home.tsx';
import Profile from '../pages/front/Profile.tsx';
import CreateArticle from '../pages/front/CreateArticle.tsx';
import ArticleDetail from '../pages/front/ArticleDetail.tsx';
import Rankings from '../pages/front/Rankings.tsx';
import UserProfile from '../pages/front/UserProfile.tsx';
import ProfileLayout from '../layouts/ProfileLayout';
import ProfileInfo from '../pages/front/profile/ProfileInfo';
import MyCreations from '../pages/front/profile/MyCreations';
import MyCollections from '../pages/front/profile/MyCollections';
import ReadingHistories from "../pages/front/profile/ReadingHistories.tsx";
import Notifications from '../pages/front/profile/Notifications';
import NotificationSettings from '../pages/front/profile/NotificationSettings';
import AccountSettings from '../pages/front/profile/AccountSettings';

// 导入认证组件
import Login from '../components/auth/Login';
import Register from '../components/auth/Register';
import AdminLogin from '../components/auth/AdminLogin';

// 导入后台页面
import AdminLayout from '../layouts/AdminLayout';
import AdminDashboard from '../pages/admin/AdminDashboard';
import AdminUsers from '../pages/admin/AdminUsers';
import AdminArticles from '../pages/admin/AdminArticles';
import AdminCategories from '../pages/admin/AdminCategories';
import AdminTags from '../pages/admin/AdminTags';
import AdminComments from '../pages/admin/AdminComments';
import AdminNotifications from '../pages/admin/AdminNotifications';
import AdminPermissions from '../pages/admin/AdminPermissions';
import AdminAnalytics from '../pages/admin/AdminAnalytics';
import AdminSettings from '../pages/admin/AdminSettings';
import React from "react";


// 管理员路由保护组件
const AdminRoute = ({ children }: { children: React.ReactNode }) => {
    const { user, isLoggedIn } = useUser();
    
    if (!isLoggedIn) {
        return <Navigate to="/admin/login" replace />;
    }
    
    if (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') {
        return <Navigate to="/" replace />;
    }
    
    return <AdminLayout>{children}</AdminLayout>;
};

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
      {/* 编辑文章路由 */}
      <Route path="/edit-article/:articleId" element={<CreateArticle />} />
      {/* 文章详情路由 */}
      <Route path="/article/:id" element={<ArticleDetail />} />
      {/* 热门排行榜路由 */}
      <Route path="/rankings" element={<Rankings />} />
      {/* 用户主页路由 */}
      <Route path="/author/:id" element={<UserProfile />} />
      {/* 个人中心路由 */}
      <Route path="/profile" element={<ProfileLayout />}>
        <Route index element={<Profile />} />
        <Route path="info" element={<ProfileInfo />} />
        <Route path="creations" element={<MyCreations />} />
        <Route path="collections" element={<MyCollections />} />
        <Route path="histories" element={<ReadingHistories />} />
        <Route path="notifications" element={<Notifications />} />
        <Route path="notification-settings" element={<NotificationSettings />} />
        <Route path="settings" element={<AccountSettings />} />
      </Route>
      
      {/* 后台路由 */}
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
      <Route path="/admin/users" element={<AdminRoute><AdminUsers /></AdminRoute>} />
      <Route path="/admin/articles" element={<AdminRoute><AdminArticles /></AdminRoute>} />
      <Route path="/admin/categories" element={<AdminRoute><AdminCategories /></AdminRoute>} />
      <Route path="/admin/tags" element={<AdminRoute><AdminTags /></AdminRoute>} />
      <Route path="/admin/comments" element={<AdminRoute><AdminComments /></AdminRoute>} />
      <Route path="/admin/notifications" element={<AdminRoute><AdminNotifications /></AdminRoute>} />
      <Route path="/admin/permissions" element={<AdminRoute><AdminPermissions /></AdminRoute>} />
      <Route path="/admin/analytics" element={<AdminRoute><AdminAnalytics /></AdminRoute>} />
      <Route path="/admin/settings" element={<AdminRoute><AdminSettings /></AdminRoute>} />
    </Routes>
  );
};

export default AppRoutes;