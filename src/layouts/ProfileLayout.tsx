import React, { useEffect } from 'react';
import { Link, useLocation, Outlet, useNavigate } from 'react-router-dom';
import { UserOutlined, FileTextOutlined, StarOutlined, HistoryOutlined, BellOutlined, SettingOutlined } from '@ant-design/icons';
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';
import { useUserStore } from '../store';

const ProfileLayout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isLoggedIn } = useUserStore();
  const currentPath = location.pathname;

  // 检查用户登录状态
  useEffect(() => {
    if (!isLoggedIn) {
      // 保存当前路径，登录后可以重定向回来
      localStorage.setItem('redirect_after_login', currentPath);
      // 跳转到登录页
      navigate('/login');
    }
  }, [isLoggedIn, navigate, currentPath]);

  // 个人中心菜单项
  const menuItems = [
    {
      key: '/profile/info',
      icon: <UserOutlined />,
      label: '个人资料',
      path: '/profile/info'
    },
    {
      key: '/profile/creations',
      icon: <FileTextOutlined />,
      label: '我的创作',
      path: '/profile/creations'
    },
    {
      key: '/profile/collections',
      icon: <StarOutlined />,
      label: '我的收藏',
      path: '/profile/collections'
    },
    {
      key: '/profile/histories',
      icon: <HistoryOutlined />,
      label: '阅读历史',
      path: '/profile/histories'
    },
    {
      key: '/profile/notifications',
      icon: <BellOutlined />,
      label: '消息通知',
      path: '/profile/notifications'
    },
    {
      key: '/profile/notification-settings',
      icon: <SettingOutlined />,
      label: '通知设置',
      path: '/profile/notification-settings'
    },
    {
      key: '/profile/settings',
      icon: <SettingOutlined />,
      label: '账号设置',
      path: '/profile/settings'
    }
  ];

  return (
    <div className="flex min-h-screen flex-col bg-gray-50 font-sans">
      {/* 顶部导航 */}
      <Header />

      {/* 主体内容 */}
      <main className="flex-1 py-8 px-[5%]">
        <div className="mx-auto">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* 左侧导航 */}
            <div className="lg:w-48 shrink-0">
              <div className="bg-white rounded-2xl shadow-sm p-6 sticky top-24">
                <div className="mb-6">
                  <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">个人中心</h1>
                </div>

                <nav>
                  <ul className="space-y-2">
                    {menuItems.map((item) => (
                      <li key={item.key}>
                        <Link
                          to={item.path}
                          className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                            currentPath === item.path
                              ? 'bg-blue-50 text-blue-600 font-medium'
                              : 'text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          {item.icon}
                          <span>{item.label}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </nav>
              </div>
            </div>

            {/* 右侧内容 */}
            <div className="flex-1">
              <div className="bg-white rounded-xs shadow-xs p-6">
                <Outlet />
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* 底部页脚 */}
      <Footer />
    </div>
  );
};

export default ProfileLayout;
