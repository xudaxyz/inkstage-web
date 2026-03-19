import { Routes, Route, Navigate } from 'react-router-dom';
import { useUserStore } from '../store';
import React, { lazy, Suspense } from 'react';

// 导入布局组件
import ProfileLayout from '../layouts/ProfileLayout';
import AdminLayout from '../layouts/AdminLayout';

// 使用 React.lazy 实现代码分割
const Home = lazy(() => import('../pages/front/Home.tsx'));
const Profile = lazy(() => import('../pages/front/Profile.tsx'));
const CreateArticle = lazy(() => import('../pages/front/CreateArticle.tsx'));
const ArticleDetail = lazy(() => import('../pages/front/ArticleDetail.tsx'));
const Rankings = lazy(() => import('../pages/front/Rankings.tsx'));
const UserProfile = lazy(() => import('../pages/front/UserProfile.tsx'));
const ProfileInfo = lazy(() => import('../pages/front/profile/ProfileInfo'));
const MyCreations = lazy(() => import('../pages/front/profile/MyCreations'));
const MyCollections = lazy(() => import('../pages/front/profile/MyCollections'));
const ReadingHistories = lazy(() => import('../pages/front/profile/ReadingHistories.tsx'));
const Notifications = lazy(() => import('../pages/front/profile/Notifications'));
const NotificationSettings = lazy(() => import('../pages/front/profile/NotificationSettings'));
const AccountSettings = lazy(() => import('../pages/front/profile/AccountSettings'));

// 导入认证组件
const Login = lazy(() => import('../components/auth/Login'));
const Register = lazy(() => import('../components/auth/Register'));
const AdminLogin = lazy(() => import('../components/auth/AdminLogin'));

// 导入后台页面
const AdminDashboard = lazy(() => import('../pages/admin/AdminDashboard'));
const AdminUsers = lazy(() => import('../pages/admin/AdminUsers'));
const AdminArticles = lazy(() => import('../pages/admin/AdminArticles'));
const AdminCategories = lazy(() => import('../pages/admin/AdminCategories'));
const AdminTags = lazy(() => import('../pages/admin/AdminTags'));
const AdminComments = lazy(() => import('../pages/admin/AdminComments'));
const AdminNotifications = lazy(() => import('../pages/admin/AdminNotifications'));
const AdminPermissions = lazy(() => import('../pages/admin/AdminPermissions'));
const AdminAnalytics = lazy(() => import('../pages/admin/AdminAnalytics'));
const AdminSettings = lazy(() => import('../pages/admin/AdminSettings'));


// 管理员路由保护组件
const AdminRoute = ({ children }: { children: React.ReactNode }): React.ReactNode => {
  const { adminUser, isAdminLoggedIn } = useUserStore();

  if (!isAdminLoggedIn) {
    return <Navigate to="/admin/login" replace />;
  }

  if (adminUser.role !== 'ADMIN' && adminUser.role !== 'SUPER_ADMIN') {
    return <Navigate to="/" replace />;
  }

  return <AdminLayout>{children}</AdminLayout>;
};

const AppRoutes = (): React.ReactNode => {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">加载中...</div>}>
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
        <Route path="/user/:id" element={<UserProfile />} />
        <Route path="/user/:id/:nickname" element={<UserProfile />} />
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
    </Suspense>
  );
};

export default AppRoutes;
