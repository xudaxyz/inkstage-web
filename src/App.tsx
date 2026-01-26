import { BrowserRouter as Router } from 'react-router-dom';

// 导入路由配置
import AppRoutes from './routes';

function App() {
    return (
        <Router>
            <AppRoutes />
        </Router>
    );
}

export default App
