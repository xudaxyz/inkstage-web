import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Input, Button, Switch } from 'antd';
import { SearchOutlined, MoonOutlined, SunOutlined, UserOutlined, FileTextOutlined, LogoutOutlined, BellOutlined } from '@ant-design/icons';
import { useUser } from '../../store';

const Header: React.FC = () => {
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    
    // 获取用户状态
    const { isLoggedIn, user, logout } = useUser();

    // 切换主题模式
    const toggleTheme = () => {
        setIsDarkMode(!isDarkMode);
        // 这里可以添加实际的主题切换逻辑
    };

    // 切换下拉菜单
    const toggleDropdown = () => {
        setIsDropdownOpen(!isDropdownOpen);
    };

    // 关闭下拉菜单
    const closeDropdown = () => {
        setIsDropdownOpen(false);
    };

    // 退出登录
    const handleLogout = () => {
        logout();
        closeDropdown();
    };

    // 监听点击事件，点击外部区域关闭下拉菜单
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                closeDropdown();
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        <header
            className="h-18 bg-white/80 backdrop-blur-sm border-b border-[#dfe1e6] flex items-center px-[5%] sticky top-0 z-10 shadow-sm">
            {/* 左侧：Logo和导航 */}
            <div className="flex items-center gap-8">
                {/* Logo */}
                <Link to="/" className="flex items-center transition-colors duration-200">
                    <div className="flex items-center gap-3">
                        <span
                            className="text-xl font-bold bg-linear-to-r from-blue-600 via-purple-500 to-indigo-600 bg-clip-text text-transparent tracking-wide">InkStage</span>
                    </div>
                </Link>

                {/* 导航项 */}
                <nav className="hidden md:flex items-center gap-10">
                    <Link to="/" className="text-gray-700 hover:text-primary-600 font-medium transition-colors duration-200">
                        推荐
                    </Link>
                    <Link to="/hot" className="text-gray-700 hover:text-primary-600 font-medium transition-colors duration-200">
                        热门
                    </Link>
                    <Link to="/following" className="text-gray-700 hover:text-primary-600 font-medium transition-colors duration-200">
                        关注
                    </Link>
                    <Link to="/columns" className="text-gray-700 hover:text-primary-600 font-medium transition-colors duration-200">
                        专栏
                    </Link>
                </nav>
            </div>

            {/* 右侧区域：搜索框 + 主题切换 + 通知 + 用户信息/登录注册 */}
            <div className="flex items-center gap-6 ml-auto">
                {/* 搜索框 */}
                <div className="hidden md:block mr-8 w-85">
                    <Input
                        placeholder="搜索..."
                        prefix={<SearchOutlined/>}
                        size="middle"
                        className="rounded-4xl bg-gray-100 border border-gray-200 hover:border-primary-300 focus:border-primary-500 focus:ring-0 transition-all duration-200"
                    />
                </div>
                
                {/* 主题切换按钮 */}
                <div className="flex items-center gap-2">
                    {isDarkMode ? <MoonOutlined/> : <SunOutlined/>}
                    <Switch
                        checked={isDarkMode}
                        onChange={toggleTheme}
                        size="small"
                    />
                </div>

                {/* 通知图标 */}
                <div className="flex items-center gap-4">
                    <BellOutlined />
                </div>

                {/* 根据登录状态显示不同内容 */}
                {isLoggedIn ? (
                    /* 登录状态：显示用户信息和下拉菜单 */
                    <div className="relative" ref={dropdownRef}>
                        <div 
                            className="flex items-center gap-3 cursor-pointer hover:opacity-90 transition-opacity duration-200"
                            onClick={toggleDropdown}
                        >
                            {/* 用户头像 */}
                            <div className="w-8 h-8 rounded-full bg-linear-to-r from-blue-400 to-purple-500 flex items-center justify-center text-white hover:scale-110 transition-all duration-300">
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
                            <span className="text-purple-600 font-medium hidden md:inline-block max-w-[100px] truncate">{user.nickname}</span>
                        </div>
                        
                        {/* 下拉菜单 */}
                        {isDropdownOpen && (
                            <div className="absolute right-0 mt-2 w-36 bg-white rounded-xl shadow-sm py-2 z-50 transition-all duration-200 origin-top-right border border-gray-50">
                                {/* 个人中心 */}
                                <Link 
                                    to="/profile" 
                                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-200 w-full rounded-lg mx-1"
                                    onClick={closeDropdown}
                                >
                                    <UserOutlined className="text-gray-400" />
                                    <span>个人中心</span>
                                </Link>
                                
                                {/* 我的创作 */}
                                <Link 
                                    to="/creator" 
                                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-200 w-full rounded-lg mx-1"
                                    onClick={closeDropdown}
                                >
                                    <FileTextOutlined className="text-gray-400" />
                                    <span>我的创作</span>
                                </Link>
                                
                                {/* 分割线 */}
                                <div className="border-t border-gray-50 my-1 mx-3"></div>
                                
                                {/* 退出登录 */}
                                <button 
                                    onClick={handleLogout}
                                    className="flex items-center gap-3 w-full text-left px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors duration-200 rounded-lg mx-1"
                                >
                                    <LogoutOutlined className="text-red-400" />
                                    <span>退出登录</span>
                                </button>
                            </div>
                        )}
                    </div>
                ) : (
                    /* 未登录状态：显示登录和注册按钮 */
                    <>
                        {/* 登录按钮 */}
                        <Link to="/login" className="text-gray-700 hover:text-primary-600 font-medium transition-colors duration-200 px-4">
                            登录
                        </Link>

                        {/* 注册按钮 */}
                        <Link to="/register">
                            <Button
                                color="danger"
                                variant="solid"
                                size="middle"
                                shape="round"
                                className="rounded-4xl px-6 bg-linear-to-r text-white font-medium hover:shadow-lg hover:scale-105 transition-all duration-300 border-none"
                            >
                                注册
                            </Button>
                        </Link>
                    </>
                )}
            </div>
        </header>
    );
};

export default Header;