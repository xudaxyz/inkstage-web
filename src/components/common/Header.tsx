import React, {useState} from 'react';
import {Link} from 'react-router-dom';
import {Input, Button, Switch} from 'antd';
import {SearchOutlined, MoonOutlined, SunOutlined} from '@ant-design/icons';

const Header: React.FC = () => {
    const [isDarkMode, setIsDarkMode] = useState(false);

    // 切换主题模式
    const toggleTheme = () => {
        setIsDarkMode(!isDarkMode);
        // 这里可以添加实际的主题切换逻辑
    };

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

            {/* 右侧区域：搜索框 + 主题切换 + 登录注册 */}
            <div className="flex items-center gap-5 ml-auto">
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

                {/* 登录按钮 */}
                <Link to="/login" className="text-gray-700 hover:text-primary-600 font-medium transition-colors duration-200 px-4">
                    登录
                </Link>

                {/* 注册按钮 */}
                <Link to="/register">
                    <Button
                        type="primary"
                        size="middle"
                        className="rounded-4xl px-6 bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-600 text-white font-medium hover:shadow-lg hover:scale-105 transition-all duration-300 border-none"
                    >
                        注册
                    </Button>
                </Link>
            </div>
        </header>
    );
};

export default Header;