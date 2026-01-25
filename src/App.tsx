import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// 示例页面组件
const Home = () => <div className="text-center">
  <h1 className="text-2xl font-bold mb-2">欢迎来到 InkStage</h1>
  <p className="text-gray-600">专业的博客管理系统</p>
</div>;

const About = () => <div className="text-center">
  <h1 className="text-2xl font-bold mb-2">关于我们</h1>
  <p className="text-gray-600">InkStage 是一个现代化的博客管理系统</p>
</div>;

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
      </Routes>
    </Router>
  )
}

export default App
