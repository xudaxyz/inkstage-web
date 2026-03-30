import React, { useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button, Input, Switch, Badge } from 'antd';
import {
    BellTwoTone,
    EditOutlined,
    MenuOutlined,
    CloseOutlined,
    SearchOutlined,
    SunOutlined,
    MoonOutlined,
    UserOutlined,
    FileTextOutlined,
    LogoutOutlined
} from '@ant-design/icons';
import {
    useIsLoggedIn,
    useUser,
    useUserStore,
    useUnreadCount,
    useSetUnreadCount,
    useFetchUnreadCount
} from '../../store';
import { useAppStore, useTheme } from '../../store';
import websocketService from '../../services/websocketService';

const Header: React.FC = () => {
    const theme = useTheme();
    const { toggleTheme } = useAppStore();
    const isDarkMode = theme === 'dark';
    const [isDropdownOpen, setIsDropdownOpen] = React.useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const mobileMenuRef = useRef<HTMLDivElement>(null);
    const location = useLocation();
    const navigate = useNavigate();
    // 从store获取未读通知数量和相关操作
    const unreadCount = useUnreadCount();
    const setUnreadCount = useSetUnreadCount();
    const fetchUnreadCount = useFetchUnreadCount();
    // 根据路由路径计算活跃导航项
    const activeNavItem = React.useMemo((): string => {
        const path = location.pathname;
        if (path === '/' || path === '/recommend') {
            return 'recommend';
        } else if (path === '/rankings') {
            return 'rankings';
        } else {
            // 其他路径默认选中推荐
            return 'recommend';
        }
    }, [location.pathname]);
    // 获取用户状态
    const isLoggedIn = useIsLoggedIn();
    const user = useUser();
    const { logout } = useUserStore();
    // 切换主题模式
    const handleThemeToggle = (): void => {
        toggleTheme();
    };
    // 切换下拉菜单
    const toggleDropdown = (): void => {
        setIsDropdownOpen(!isDropdownOpen);
    };
    // 关闭下拉菜单
    const closeDropdown = (): void => {
        setIsDropdownOpen(false);
    };
    // 退出登录
    const handleLogout = (): void => {
        logout();
        closeDropdown();
    };
    // 切换移动端菜单
    const toggleMobileMenu = (): void => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };
    // 关闭移动端菜单
    const closeMobileMenu = (): void => {
        setIsMobileMenuOpen(false);
    };
    // 监听点击事件，点击外部区域关闭下拉菜单和移动端菜单
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent): void => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                closeDropdown();
            }
            if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node)) {
                closeMobileMenu();
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return (): void => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);
    // 监听登录状态，获取未读通知数量
    useEffect((): void => {
        if (isLoggedIn) {
            // 延迟调用，避免在effect中直接触发状态更新
            setTimeout(fetchUnreadCount, 0);
        }
    }, [isLoggedIn, fetchUnreadCount]);
    // 监听WebSocket未读数量更新
    useEffect((): (() => void) => {
        if (!isLoggedIn) return (): void => {
        };
        const handleUnreadCount = (data: unknown): void => {
            if (typeof data === 'number') {
                setUnreadCount(data);
            }
        };
        // 注册事件监听器
        websocketService.on('unreadCount', handleUnreadCount);
        // 清理事件监听器
        return (): void => {
            websocketService.off('unreadCount', handleUnreadCount);
        };
    }, [isLoggedIn, setUnreadCount]);
    return (
        <header
            className="h-18 bg-white/80 dark:bg-gray-800 backdrop-blur-sm border-b border-gray-200 dark:border-b dark:border-gray-700 dark:shadow-sm flex items-center px-4 sm:px-6 lg:px-[5%] sticky top-0 z-10 shadow-sm">
            {/* 左侧：Logo和导航 */}
            <div className="flex items-center gap-6 sm:gap-8 flex-1">
                {/* Logo */}
                <Link to="/" className="flex items-center transition-colors duration-200">
                    <div className="flex items-center gap-3">
            <span
                className="text-xl font-bold bg-linear-to-r from-blue-600 via-purple-500 to-indigo-600 bg-clip-text text-transparent tracking-wide">InkStage</span>
                    </div>
                </Link>

                {/* 导航项 */}
                <nav className="hidden md:flex items-center gap-10 whitespace-nowrap">
                    <div className="relative text-gray-600 dark:text-white">
                        <Link to="/"
                              className={`font-medium transition-colors duration-200 ${activeNavItem === 'recommend' ? 'text-gray-600 font-semibold dark:text-white' : 'text-gray-700 font-medium dark:text-white hover:text-primary-600'}`}>
                            推荐
                        </Link>
                        {activeNavItem === 'recommend' && (
                            <div
                                className="absolute bottom-[-4px] left-0 right-0 h-0.5 bg-primary-600 rounded-full transition-all duration-300 ease-in-out z-10"></div>
                        )}
                    </div>
                    <div className="relative text-gray-600 dark:text-white">
                        <Link to="/rankings"
                              className={`font-medium transition-colors duration-200 ${activeNavItem === 'rankings' ? 'text-gray-600 font-semibold dark:text-white' : 'text-gray-700 font-medium dark:text-white hover:text-primary-600'}`}>
                            热门
                        </Link>
                        {activeNavItem === 'rankings' && (
                            <div
                                className="absolute bottom-[-4px] left-0 right-0 h-0.5 bg-primary-600 rounded-full transition-all duration-300 ease-in-out z-10"></div>
                        )}
                    </div>
                </nav>


            </div>

            {/* 右侧区域：写文章按钮（登录后） + 搜索框 + 主题切换 + 通知 + 用户信息/登录注册 + 移动端菜单按钮 */}
            <div className="flex items-center gap-4 sm:gap-6 ml-auto">
                {/* 写文章按钮（仅登录后显示，桌面端） */}
                {isLoggedIn && (
                    <Link to="/create-article" className="hidden md:block">
                        <Button
                            type="primary"
                            size="middle"
                            shape="round"
                            className="rounded-full px-6 bg-linear-to-r from-green-500 to-green-600 text-white font-medium hover:shadow-lg hover:scale-105 transition-all duration-300"
                        >
                            <EditOutlined/> 写文章
                        </Button>
                    </Link>
                )}

                {/* 搜索框 */}
                <div className="hidden md:block w-80 sm:w-96">
                    <Input
                        placeholder="搜索..."
                        prefix={<SearchOutlined/>}
                        size="middle"
                        onPressEnter={(e) => {
                            const keyword = e.currentTarget.value.trim();
                            if (keyword) {
                                navigate({
                                    pathname: '/',
                                    search: `?keyword=${encodeURIComponent(keyword)}`
                                }, { replace: true });
                            }
                        }}
                        className="rounded-full bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-primary-300 focus:border-primary-500 focus:ring-0 transition-all duration-200"
                    />
                </div>

                {/* 主题切换按钮 */}
                <div className="flex items-center gap-2">
                    {isDarkMode ? <MoonOutlined/> : <SunOutlined/>}
                    <Switch
                        checked={isDarkMode}
                        onChange={handleThemeToggle}
                        size="small"
                    />
                </div>

                {/* 通知图标 */}
                {isLoggedIn && (<Link to="/profile/notifications"
                                      className="flex items-center text-gray-700 dark:text-white hover:text-primary-600 transition-colors duration-200">
                    {unreadCount > 0 ? (
                        <Badge count={unreadCount} size="small">
                            <BellTwoTone style={{ fontSize: '18px' }}/>
                        </Badge>
                    ) : (
                        <BellTwoTone style={{ fontSize: '18px' }}/>
                    )}
                </Link>)}

                {/* 移动端菜单按钮 */}
                <button
                    className="md:hidden flex items-center text-gray-700 dark:text-white"
                    onClick={toggleMobileMenu}
                    aria-label="菜单"
                >
                    {isMobileMenuOpen ? <CloseOutlined/> : <MenuOutlined/>}
                </button>

                {/* 根据登录状态显示不同内容 */}
                {isLoggedIn ? (
                    /* 登录状态：显示用户信息和下拉菜单 */
                    <div className="relative hidden md:block" ref={dropdownRef}>
                        <div
                            className="flex items-center gap-3 cursor-pointer hover:opacity-90 transition-opacity duration-200"
                            onClick={toggleDropdown}
                        >
                            {/* 用户头像 */}
                            <div
                                className="w-8 h-8 rounded-full bg-linear-to-r from-blue-400 to-purple-500 flex items-center justify-center text-white hover:scale-110 transition-all duration-300">
                                {user.avatar ? (
                                    <img
                                        src={user.avatar}
                                        alt={user.nickname || ''}
                                        className="w-full h-full rounded-full object-cover"
                                    />
                                ) : (
                                    <span className="text-sm font-medium">{user.nickname?.charAt(0) || 'U'}</span>
                                )}
                            </div>
                            {/* 用户名 */}
                            <span
                                className="text-purple-600 dark:text-white font-medium inline-block max-w-[100px] truncate">{user.nickname}</span>
                        </div>

                        {/* 下拉菜单 */}
                        {isDropdownOpen && (
                            <div
                                className="absolute right-0 mt-2 w-36 bg-white dark:bg-gray-900 rounded-xl shadow-sm py-2 z-50 transition-all duration-200 origin-top-right border border-gray-50 dark:border-gray-800">
                                {/* 个人中心 */}
                                <Link
                                    to="/profile"
                                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-200 w-full rounded-lg mx-1"
                                    onClick={closeDropdown}
                                >
                                    <UserOutlined className="text-gray-400 dark:text-gray-200"/>
                                    <span className="text-gray-700 dark:text-gray-200">个人中心</span>
                                </Link>

                                {/* 我的创作 */}
                                <Link
                                    to="/profile/creations"
                                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-200 w-full rounded-lg mx-1"
                                    onClick={closeDropdown}
                                >
                                    <FileTextOutlined className="text-gray-400 dark:text-gray-200"/>
                                    <span className="text-gray-700 dark:text-gray-200">我的创作</span>
                                </Link>

                                {/* 分割线 */}
                                <div className="border-t border-gray-50 my-1 mx-3"></div>

                                {/* 退出登录 */}
                                <button
                                    onClick={handleLogout}
                                    className="flex items-center gap-3 w-full text-left px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors duration-200 rounded-lg mx-1"
                                >
                                    <LogoutOutlined className="text-red-400"/>
                                    <span>退出登录</span>
                                </button>
                            </div>
                        )}
                    </div>
                ) : (
                    /* 未登录状态：显示登录和注册按钮（仅桌面端） */
                    <div className="hidden md:flex items-center gap-4">
                        {/* 登录按钮 */}
                        <Link to="/login"
                              className="text-gray-700 dark:text-white hover:text-primary-600 font-medium transition-colors duration-200 px-4">
                            登录
                        </Link>

                        {/* 注册按钮 */}
                        <Link to="/register">
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

            {/* 移动端导航菜单 */}
            {isMobileMenuOpen && (
                <div
                    className="md:hidden fixed top-18 left-0 right-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 shadow-sm z-50 p-4"
                    ref={mobileMenuRef}
                >
                    {/* 移动端导航项 */}
                    <nav className="flex items-center gap-6 overflow-x-auto whitespace-nowrap pb-2">
                        <div className="relative">
                            <Link to="/"
                                  className={`font-medium transition-colors duration-200 px-2 ${activeNavItem === 'recommend' ? 'text-primary-600 dark:text-white' : 'text-gray-700 dark:text-white hover:text-primary-600'}`}>
                                推荐
                            </Link>
                            {activeNavItem === 'recommend' && (
                                <div
                                    className="absolute bottom-[-4px] left-0 right-0 h-0.5 bg-primary-600 rounded-full transition-all duration-300 ease-in-out z-10"></div>
                            )}
                        </div>
                        <div className="relative">
                            <Link to="/rankings"
                                  className={`font-medium transition-colors duration-200 px-2 ${activeNavItem === 'rankings' ? 'text-primary-600 dark:text-white' : 'text-gray-700 dark:text-white hover:text-primary-600'}`}>
                                热门
                            </Link>
                            {activeNavItem === 'rankings' && (
                                <div
                                    className="absolute bottom-[-4px] left-0 right-0 h-0.5 bg-primary-600 rounded-full transition-all duration-300 ease-in-out z-10"></div>
                            )}
                        </div>
                    </nav>

                    {/* 移动端搜索框 */}
                    <div className="mt-4">
                        <Input
                            placeholder="搜索..."
                            prefix={<SearchOutlined/>}
                            size="middle"
                            onPressEnter={(e) => {
                                const keyword = e.currentTarget.value.trim();
                                if (keyword) {
                                    navigate({
                                        pathname: '/',
                                        search: `?keyword=${encodeURIComponent(keyword)}`
                                    }, { replace: true });
                                }
                            }}
                            className="rounded-full bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-primary-300 focus:border-primary-500 focus:ring-0 transition-all duration-200"
                        />
                    </div>

                    {/* 移动端写文章按钮 */}
                    {isLoggedIn && (
                        <Link to="/create-article" className="mt-4 block">
                            <Button
                                type="primary"
                                size="middle"
                                shape="round"
                                className="w-full rounded-full px-6 bg-linear-to-r from-green-500 to-green-600 text-white font-medium hover:shadow-lg hover:scale-105 transition-all duration-300"
                            >
                                <EditOutlined/> 写文章
                            </Button>
                        </Link>
                    )}

                    {/* 移动端登录注册 */}
                    {!isLoggedIn && (
                        <div className="mt-4 flex gap-4">
                            <Link to="/login" className="flex-1">
                                <Button
                                    variant="solid"
                                    size="middle"
                                    className="w-full rounded-full px-6 text-gray-700 font-medium hover:bg-gray-50 transition-all duration-300"
                                >
                                    登录
                                </Button>
                            </Link>
                            <Link to="/register" className="flex-1">
                                <Button
                                    color="danger"
                                    variant="solid"
                                    size="middle"
                                    className="w-full rounded-full px-6 bg-linear-to-r text-white font-medium hover:shadow-lg hover:scale-105 transition-all duration-300 border-none"
                                >
                                    注册
                                </Button>
                            </Link>
                        </div>
                    )}
                </div>
            )}
        </header>
    );
};
export default Header;
