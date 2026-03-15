import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserStore } from '../../store';

const Profile: React.FC = () => {
  const navigate = useNavigate();
  const { isLoggedIn } = useUserStore();

  useEffect(() => {
    // 检查用户是否登录
    if (!isLoggedIn) {
      // 如果未登录，重定向到登录页面
      navigate('/login');
    } else {
      // 如果已登录，重定向到个人资料页面
      navigate('/profile/info');
    }
  }, [isLoggedIn, navigate]);

  return null;
};

export default Profile;
