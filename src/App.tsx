import {BrowserRouter as Router, Routes, Route} from 'react-router-dom';

// 导入认证组件
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
// 导入首页组件
import Home from './components/Home/Home';

function App() {
    return (
        <Router>
            <Routes>
                {/* 首页路由 */}
                <Route path="/" element={<Home />} />
                {/* 登录注册路由 */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
            </Routes>
        </Router>
    );
}

export default App
