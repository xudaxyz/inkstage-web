import React, { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Badge, Button, Divider, Drawer, Input, Switch } from 'antd';
import {
  BellOutlined,
  BellTwoTone,
  EditOutlined,
  FileTextOutlined,
  LogoutOutlined,
  MenuOutlined,
  MoonOutlined,
  SearchOutlined,
  SettingOutlined,
  StarOutlined,
  SunOutlined,
  UserOutlined
} from '@ant-design/icons';
import {
  useAppStore,
  useFetchUnreadCount,
  useIsLoggedIn,
  useSetUnreadCount,
  useTheme,
  useUnreadCount,
  useUser,
  useUserStore
} from '../../store';
import websocketService from '../../services/websocketService';
import { ROUTES } from '../../constants/routes';

const Header: React.FC = () => {
  const theme = useTheme();
  const { toggleTheme } = useAppStore();
  const isDarkMode = theme === 'dark';
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const [searchKeyword, setSearchKeyword] = useState('');

  const unreadCount = useUnreadCount();
  const setUnreadCount = useSetUnreadCount();
  const fetchUnreadCount = useFetchUnreadCount();
  const isLoggedIn = useIsLoggedIn();
  const user = useUser();
  const { logout } = useUserStore();

  const activeNavItem = React.useMemo((): string => {
    const path = location.pathname;
    if (path === '/' || path === '/recommend') return 'recommend';
    if (path === '/rankings') return 'rankings';
    return 'recommend';
  }, [location.pathname]);

  const navItems = [
    { key: 'recommend', label: '推荐', path: '/' },
    { key: 'rankings', label: '热门', path: '/rankings' }
  ];

  // Handlers
  const handleThemeToggle = (): void => toggleTheme();

  const toggleDropdown = (): void => setIsDropdownOpen(!isDropdownOpen);

  const closeDropdown = (): void => setIsDropdownOpen(false);

  const handleLogout = (): void => {
    logout();
    closeDropdown();
    setIsMobileDrawerOpen(false);
  };

  const openMobileDrawer = (): void => setIsMobileDrawerOpen(true);

  const closeMobileDrawer = (): void => setIsMobileDrawerOpen(false);

  const handleSearch = (): void => {
    if (searchKeyword.trim()) {
      navigate({
        pathname: '/',
        search: `?keyword=${encodeURIComponent(searchKeyword.trim())}`
      });
      setSearchKeyword('');
      closeMobileDrawer();
    }
  };

  // Effects
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent): void => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        closeDropdown();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return (): void => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect((): void => {
    if (isLoggedIn) {
      setTimeout(fetchUnreadCount, 0);
    }
  }, [isLoggedIn, fetchUnreadCount]);

  useEffect((): (() => void) => {
    if (!isLoggedIn) return (): void => {};
    const handleUnreadCount = (data: unknown): void => {
      if (typeof data === 'number') {
        setUnreadCount(data);
      }
    };
    websocketService.on('unreadCount', handleUnreadCount);
    return (): void => {
      websocketService.off('unreadCount', handleUnreadCount);
    };
  }, [isLoggedIn, setUnreadCount]);

  const renderNavItems = (isMobile: boolean): React.ReactNode => (
    <>
      {navItems.map((item) => (
        <div key={item.key} className={isMobile ? '' : 'relative text-gray-600 dark:text-white'}>
          <Link
            to={item.path}
            className={
              isMobile
                ? `text-[15px] whitespace-nowrap px-2 ${activeNavItem === item.key ? 'text-blue-600 font-[550]' : 'text-gray-700 dark:text-white font-normal'}`
                : `font-medium transition-colors duration-200 ${activeNavItem === item.key ? 'text-gray-600 font-semibold dark:text-white' : 'text-gray-700 font-medium dark:text-white hover:text-primary-600'}`
            }
          >
            {item.label}
          </Link>
          {!isMobile && activeNavItem === item.key && (
            <div className="bottom-[-4px] left-0 right-0 bg-primary-600 rounded-full transition-all duration-300 ease-in-out z-10"></div>
          )}
        </div>
      ))}
    </>
  );

  const renderSearchBox = (size: 'small' | 'middle', className: string): React.ReactNode => (
    <Input
      placeholder="搜索..."
      prefix={<SearchOutlined />}
      size={size}
      value={searchKeyword}
      onChange={(e) => setSearchKeyword(e.target.value)}
      onPressEnter={handleSearch}
      className={className}
    />
  );

  const renderUserAvatar = (): React.ReactNode => (
    <div className="w-8 h-8 rounded-full bg-linear-to-r from-blue-400 to-purple-500 flex items-center justify-center text-white hover:scale-110 transition-all duration-300">
      {user.avatar ? (
        <img src={user.avatar} alt={user.nickname || ''} className="w-full h-full rounded-full object-cover" />
      ) : (
        <span className="text-sm font-medium">{user.nickname?.charAt(0) || 'U'}</span>
      )}
    </div>
  );

  const renderMobileDrawer = (): React.ReactNode => (
    <Drawer placement="right" onClose={closeMobileDrawer} open={isMobileDrawerOpen} size={180} className="md:hidden">
      {isLoggedIn ? (
        <>
          <div className="flex items-center gap-3 pb-4 border-b border-gray-200 mb-4">
            {renderUserAvatar()}
            <span className="text-lg font-medium text-gray-800 dark:text-white">{user.nickname}</span>
          </div>
          <div className="flex justify-start">
            <Link to={ROUTES.CREATE_ARTICLE} onClick={closeMobileDrawer}>
              <Button type="text" block className="mb-3 rounded-lg">
                <EditOutlined /> 写文章
              </Button>
            </Link>
          </div>
          <div className="flex justify-start">
            <Link to={ROUTES.PROFILE} onClick={closeMobileDrawer}>
              <Button type="text" block className="mb-3 rounded-lg">
                <UserOutlined /> 个人中心
              </Button>
            </Link>
          </div>
          <div className="flex justify-start">
            <Link to={ROUTES.NOTIFICATIONS} onClick={closeMobileDrawer}>
              <Button type="text" block className="mb-3 rounded-lg">
                <BellOutlined /> 通知中心
              </Button>
            </Link>
          </div>
          <div className="flex justify-start mb-3 px-4">
            <div className="flex items-center justify-center">
              <div className="flex items-center gap-3">
                {isDarkMode ? <MoonOutlined /> : <SunOutlined />}
                <Switch checked={isDarkMode} onChange={handleThemeToggle} size="default" className="md:ml-4 sm:ml-2" />
              </div>
            </div>
          </div>
          <Divider />
          <Button danger block className="rounded-lg" onClick={handleLogout}>
            <LogoutOutlined /> 退出登录
          </Button>
        </>
      ) : (
        <>
          <Link
            to={ROUTES.LOGIN}
            onClick={closeMobileDrawer}
            className="text-gray-200 mb-3 dark:text-white hover:text-primary-600 font-medium transition-colors duration-200 rounded-lg"
          >
            <Button
              block
              type="default"
              className="rounded-lg mb-3"
              style={{
                backgroundColor: '#e5e7eb',
                borderRadius: '20px',
                color: 'black',
                fontSize: '16px'
              }}
            >
              登录
            </Button>
          </Link>

          <Link to={ROUTES.REGISTER} onClick={closeMobileDrawer}>
            <Button
              color="danger"
              block
              className="rounded-lg"
              style={{
                color: 'red',
                borderRadius: '20px',
                fontSize: '16px'
              }}
            >
              注册
            </Button>
          </Link>
          {/* 主题切换 */}
          <div className="mt-4 ">
            <div className="flex items-center justify-center">
              <div className="flex items-center gap-3">
                {isDarkMode ? <MoonOutlined /> : <SunOutlined />}
                <Switch checked={isDarkMode} onChange={handleThemeToggle} size="default" className="ml-2" />
              </div>
            </div>
          </div>
        </>
      )}
    </Drawer>
  );

  return (
    <header className="h-18 bg-white/80 dark:bg-gray-800 backdrop-blur-sm border-b border-gray-200 dark:border-b dark:border-gray-700 dark:shadow-sm flex items-center px-4 sm:px-6 lg:px-[5%] sticky top-0 z-10 shadow-sm">
      {/* Logo */}
      <Link to={ROUTES.HOME} className="flex items-center transition-colors duration-200 shrink-0">
        <span className="text-xl font-bold bg-linear-to-r from-blue-600 via-purple-500 to-indigo-600 bg-clip-text text-transparent tracking-wide">
          InkStage
        </span>
      </Link>

      {/* 导航项 - 桌面端 */}
      <nav className="hidden md:flex items-center gap-10 whitespace-nowrap ml-8">{renderNavItems(false)}</nav>

      {/* 导航项 - 移动端 */}
      <div className="flex items-center md:hidden ml-4">{renderNavItems(true)}</div>

      {/* 右侧区域 - 移动端 */}
      <div className="flex items-center gap-2 sm:gap-2 ml-auto md:hidden overflow-x-auto">
        {/* 搜索框 */}
        <div className="flex-1 min-w-0 max-w-[120px] sm:max-w-[200px]">{renderSearchBox('middle', 'rounded-full')}</div>
        {/* 菜单按钮 */}
        <button
          className="flex items-center text-gray-700 dark:text-white shrink-0 ml-2"
          onClick={openMobileDrawer}
          aria-label="菜单"
        >
          <MenuOutlined style={{ fontSize: '18px' }} />
        </button>
      </div>

      {/* 右侧区域 - 桌面端 */}
      <div className="hidden md:flex items-center gap-6 ml-auto">
        {/* 搜索框 */}
        <div className="w-64 md:w-72 lg:w-80 xl:w-96">
          <Input
            placeholder="搜索..."
            prefix={<SearchOutlined />}
            size="middle"
            onPressEnter={(e) => {
              const keyword = e.currentTarget.value.trim();
              if (keyword) {
                navigate(
                  {
                    pathname: '/',
                    search: `?keyword=${encodeURIComponent(keyword)}`
                  },
                  { replace: true }
                );
              }
            }}
            className="rounded-full bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-primary-300 focus:border-primary-500 focus:ring-0 transition-all duration-200"
          />
        </div>

        {/* 写文章按钮 */}
        {isLoggedIn && (
          <Link to={ROUTES.CREATE_ARTICLE}>
            <Button
              type="primary"
              size="middle"
              shape="round"
              className="rounded-full px-6 bg-linear-to-r from-green-500 to-green-600 text-white font-medium hover:shadow-lg hover:scale-105 transition-all duration-300"
            >
              <EditOutlined /> 写文章
            </Button>
          </Link>
        )}

        {/* 主题切换按钮 */}
        <div className="flex items-center gap-2">
          {isDarkMode ? <MoonOutlined /> : <SunOutlined />}
          <Switch checked={isDarkMode} onChange={handleThemeToggle} size="small" />
        </div>

        {/* 通知图标 */}
        {isLoggedIn && (
          <Link
            to={ROUTES.NOTIFICATIONS}
            className="flex items-center text-gray-700 dark:text-white hover:text-primary-600 transition-colors duration-200"
          >
            {unreadCount > 0 ? (
              <Badge count={unreadCount} size="small">
                <BellTwoTone style={{ fontSize: '18px' }} />
              </Badge>
            ) : (
              <BellTwoTone style={{ fontSize: '18px' }} />
            )}
          </Link>
        )}

        {/* 用户信息下拉菜单 */}
        {isLoggedIn ? (
          <div className="relative" ref={dropdownRef}>
            <div
              className="flex items-center gap-3 cursor-pointer hover:opacity-90 transition-opacity duration-200"
              onClick={toggleDropdown}
            >
              {renderUserAvatar()}
              <span className="text-purple-600 dark:text-white font-medium inline-block max-w-[100px] truncate">
                {user.nickname}
              </span>
            </div>

            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-36 bg-white dark:bg-gray-900 rounded-xl shadow-sm py-2 z-50 transition-all duration-200 origin-top-right border border-gray-50 dark:border-gray-800">
                <Link
                  to={ROUTES.PROFILE}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-200 w-full rounded-lg mx-1"
                  onClick={closeDropdown}
                >
                  <UserOutlined className="text-gray-400 dark:text-gray-200" />
                  <span className="text-gray-700 dark:text-gray-200">个人中心</span>
                </Link>
                <Link
                  to={ROUTES.MY_CREATIONS}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-200 w-full rounded-lg mx-1"
                  onClick={closeDropdown}
                >
                  <FileTextOutlined className="text-gray-400 dark:text-gray-200" />
                  <span className="text-gray-700 dark:text-gray-200">我的创作</span>
                </Link>
                <Link
                  to={ROUTES.MY_COLLECTIONS}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-200 w-full rounded-lg mx-1"
                  onClick={closeDropdown}
                >
                  <StarOutlined className="text-gray-400 dark:text-gray-200" />
                  <span className="text-gray-700 dark:text-gray-200">我的收藏</span>
                </Link>
                <Link
                  to={ROUTES.ACCOUNT_SETTINGS}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-200 w-full rounded-lg mx-1"
                  onClick={closeDropdown}
                >
                  <SettingOutlined className="text-gray-400 dark:text-gray-200" />
                  <span className="text-gray-700 dark:text-gray-200">账号设置</span>
                </Link>
                <div className="border-t border-gray-50 my-1 mx-3"></div>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 w-full text-left px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors duration-200 rounded-lg mx-1"
                >
                  <LogoutOutlined className="text-red-400" />
                  <span>退出登录</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-4">
            <Link
              to={ROUTES.LOGIN}
              className="text-gray-700 dark:text-white hover:text-primary-600 font-medium transition-colors duration-200 px-4"
            >
              登录
            </Link>
            <Link to={ROUTES.REGISTER}>
              <Button
                color="danger"
                variant="solid"
                size="middle"
                shape="round"
                className="rounded-full px-6 bg-linear-to-r text-white font-medium hover:shadow-lg hover:scale-105 transition-all duration-300 border-none"
              >
                注册
              </Button>
            </Link>
          </div>
        )}
      </div>

      {/* 移动端右侧抽屉 */}
      {renderMobileDrawer()}
    </header>
  );
};

export default Header;
