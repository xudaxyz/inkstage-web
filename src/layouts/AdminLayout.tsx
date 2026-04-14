import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Avatar, Button, ConfigProvider, Dropdown, Layout, Menu, Switch } from 'antd';
import {
  AppstoreOutlined,
  BellOutlined,
  DashboardOutlined,
  ExclamationCircleOutlined,
  FileTextOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  MessageOutlined,
  MoonOutlined,
  SettingOutlined,
  SunOutlined,
  TagOutlined,
  UsergroupAddOutlined,
  UserOutlined
} from '@ant-design/icons';
import { useAdminStore } from '../store/adminStore';

const { Header, Sider, Content } = Layout;

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { adminUser, isAdminLoggedIn, refreshToken, logout } = useAdminStore();
  const [collapsed, setCollapsed] = useState(false);
  const [darkMode, setDarkMode] = useState(true);

  // 根据路由路径计算当前选中的菜单项
  const current = useMemo(() => {
    const path = location.pathname;
    const pathToKeyMap: Record<string, string> = {
      '/admin': 'dashboard',
      '/admin/users': 'users',
      '/admin/articles': 'articles',
      '/admin/categories': 'categories',
      '/admin/tags': 'tags',
      '/admin/comments': 'comments',
      '/admin/notifications': 'notifications',
      '/admin/reports': 'reports',
      '/admin/settings': 'settings'
    };
    return pathToKeyMap[path] || 'dashboard';
  }, [location.pathname]);

  // 导航菜单配置
  const menuItems = [
    {
      key: 'dashboard',
      icon: <DashboardOutlined />,
      label: <Link to="/admin">控制台</Link>
    },
    {
      key: 'users',
      icon: <UsergroupAddOutlined />,
      label: <Link to="/admin/users">用户管理</Link>
    },
    {
      key: 'articles',
      icon: <FileTextOutlined />,
      label: <Link to="/admin/articles">文章管理</Link>
    },
    {
      key: 'categories',
      icon: <AppstoreOutlined />,
      label: <Link to="/admin/categories">分类管理</Link>
    },
    {
      key: 'tags',
      icon: <TagOutlined />,
      label: <Link to="/admin/tags">标签管理</Link>
    },
    {
      key: 'comments',
      icon: <MessageOutlined />,
      label: <Link to="/admin/comments">评论管理</Link>
    },
    {
      key: 'notifications',
      icon: <BellOutlined />,
      label: <Link to="/admin/notifications">通知管理</Link>
    },
    {
      key: 'reports',
      icon: <ExclamationCircleOutlined />,
      label: <Link to="/admin/reports">举报管理</Link>
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: <Link to="/admin/settings">系统设置</Link>
    }
  ];

  // 处理菜单点击
  const handleMenuClick = (): void => {
    // 不再在这里设置current状态，由useEffect根据路由变化来更新
  };

  // 处理退出登录
  const handleLogout = async (): Promise<void> => {
    try {
      logout();
      navigate('/admin/login');
    } catch (error) {
      console.error('退出登录失败:', error);
    }
  };

  // 监听用户活动，自动延长会话
  const handleUserActivity = useCallback((): void => {
    // 每5分钟自动刷新令牌
    if (isAdminLoggedIn) {
      refreshToken().catch((error) => {
        console.error('自动刷新令牌失败:', error);
      });
    }
  }, [isAdminLoggedIn, refreshToken]);

  // 防抖处理用户活动
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const debouncedHandleUserActivity = useCallback((): void => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      handleUserActivity();
    }, 60000); // 1分钟内只触发一次
  }, [handleUserActivity]);

  // 初始化和更新会话状态
  useEffect(() => {
    if (!isAdminLoggedIn) return;

    // 监听用户活动
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    events.forEach((event) => {
      document.addEventListener(event, debouncedHandleUserActivity);
    });

    // 每5分钟自动刷新令牌
    const autoRefreshInterval = setInterval(handleUserActivity, 5 * 60 * 1000);

    return (): void => {
      clearInterval(autoRefreshInterval);
      events.forEach((event) => {
        document.removeEventListener(event, debouncedHandleUserActivity);
      });
    };
  }, [isAdminLoggedIn, handleUserActivity, debouncedHandleUserActivity, refreshToken]);

  // 用户下拉菜单
  const userMenu = [
    {
      key: 'profile',
      label: (
        <div className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded-md transition-colors duration-200">
          <UserOutlined className="text-gray-600" />
          <span className="text-gray-700">个人信息</span>
        </div>
      )
    },
    {
      key: 'logout',
      label: (
        <div
          className="flex items-center gap-2 p-2 hover:bg-red-50 rounded-md transition-colors duration-200 text-red-500"
          onClick={handleLogout}
        >
          <LogoutOutlined />
          <span>退出登录</span>
        </div>
      )
    }
  ];

  return (
    <ConfigProvider>
      <Layout style={{ minHeight: '100vh' }}>
        {/* 顶部导航栏 */}
        <Header
          style={{
            position: 'sticky',
            top: 0,
            zIndex: 100,
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 24px ',
            height: 64
          }}
        >
          <div className="flex items-center gap-4">
            <div className="flex text-cyan-500 items-center gap-2">
              <div className="text-xl font-bold">InkStage-后台管理系统</div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* 主题切换 */}
            <div className="flex items-center gap-2">
              <SunOutlined style={{ fontSize: '16px' }} />
              <Switch
                checked={darkMode}
                onChange={setDarkMode}
                checkedChildren={<MoonOutlined />}
                unCheckedChildren={<SunOutlined />}
              />
              <MoonOutlined style={{ fontSize: '16px' }} />
            </div>

            {/* 用户头像和下拉菜单 */}
            <Dropdown menu={{ items: userMenu }} placement="bottomRight">
              <div className="flex items-center gap-3 cursor-pointer p-2 rounded-full hover:bg-gray-100 transition-colors duration-200">
                <Avatar size="small" icon={<UserOutlined />}>
                  {'A'}
                </Avatar>
                <span className="text-sm text-gray-400 font-medium">{adminUser?.nickname || '管理员'}</span>
              </div>
            </Dropdown>
          </div>
        </Header>

        <Layout>
          {/* 左侧导航栏 */}
          <Sider
            width={180}
            collapsed={collapsed}
            collapsedWidth={70}
            theme="dark"
            style={{
              position: 'fixed',
              left: 0,
              top: '64px',
              height: 'calc(100% - 64px)',
              zIndex: 100
            }}
            onCollapse={(value) => setCollapsed(value)}
          >
            <div style={{ marginTop: '10px', height: 'calc(100% - 64px)' }}>
              <Menu
                mode="inline"
                selectedKeys={[current]}
                onClick={handleMenuClick}
                items={menuItems}
                theme={'dark'}
                style={{
                  height: '100%'
                }}
              />
            </div>
            {/* 折叠展开按钮 */}
            <div
              style={{
                position: 'absolute',
                bottom: 20,
                left: 0,
                right: 0,
                display: 'flex',
                justifyContent: 'center'
              }}
            >
              <Button
                variant="text"
                color="cyan"
                icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                onClick={() => setCollapsed(!collapsed)}
                style={{ fontSize: '18px' }}
              />
            </div>
          </Sider>

          {/* 右侧内容区域 */}
          <Content
            style={{
              marginLeft: collapsed ? 70 : 180,
              padding: 20,
              minHeight: 'calc(100vh - 64px)',
              overflowY: 'auto'
            }}
          >
            <div className="bg-white rounded-lg shadow-sm p-6 transition-all duration-300">{children}</div>
          </Content>
        </Layout>
      </Layout>
    </ConfigProvider>
  );
};

export default AdminLayout;
