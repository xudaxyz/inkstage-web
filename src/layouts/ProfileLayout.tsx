import React, { useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import {
  BellOutlined,
  FileTextOutlined,
  HistoryOutlined,
  MenuOutlined,
  SettingOutlined,
  StarOutlined,
  UserOutlined,
  BookOutlined,
  HeartOutlined
} from '@ant-design/icons';
import { Button, Drawer } from 'antd';
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';

const ProfileLayout: React.FC = () => {
  const location = useLocation();
  const currentPath = location.pathname;
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleDrawerOpen = (): void => {
    setDrawerOpen(true);
  };

  const handleDrawerClose = (): void => {
    setDrawerOpen(false);
  };
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
      key: '/profile/columns',
      icon: <BookOutlined />,
      label: '我的专栏',
      path: '/profile/columns'
    },
    {
      key: '/profile/subscriptions',
      icon: <HeartOutlined />,
      label: '我的订阅',
      path: '/profile/subscriptions'
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
      <main className="bg-white dark:bg-gray-900 flex-1 py-4 md:py-8 px-3 md:px-[5%]">
        <div className="mx-auto">
          {/* 移动端菜单按钮 */}
          <div className="lg:hidden mb-4">
            <Button
              variant="text"
              color="default"
              icon={<MenuOutlined />}
              onClick={handleDrawerOpen}
              className="flex items-center justify-center gap-2 "
            >
              个人中心
            </Button>
          </div>

          {/* 移动端抽屉导航 */}
          <Drawer
            title="个人中心"
            placement="left"
            onClose={handleDrawerClose}
            open={drawerOpen}
            className="lg:hidden"
            size="180px"
          >
            <nav>
              <ul className="space-y-2">
                {menuItems.map((item) => (
                  <li key={item.key}>
                    <Link
                      to={item.path}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                        currentPath === item.path
                          ? 'bg-blue-200 dark:bg-blue-200 text-blue-600 font-medium'
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-400'
                      }`}
                      onClick={handleDrawerClose}
                    >
                      {item.icon}
                      <span>{item.label}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </Drawer>

          <div className="flex flex-col lg:flex-row gap-4 md:gap-8">
            {/* 左侧导航 - 仅桌面端显示 */}
            <div className="hidden lg:block lg:w-48 shrink-0">
              <div className="bg-white dark:bg-gray-700 rounded-2xl shadow-sm p-6 sticky top-24">
                <div className="mb-6">
                  <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-6 text-center">个人中心</h1>
                </div>

                <nav>
                  <ul className="space-y-2">
                    {menuItems.map((item) => (
                      <li key={item.key}>
                        <Link
                          to={item.path}
                          className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                            currentPath === item.path
                              ? 'bg-blue-200 dark:bg-blue-100 text-blue-600 font-medium'
                              : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-400'
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
              <div className="bg-white dark:bg-gray-600/30 rounded-sm shadow-xs p-4 md:p-6">
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
