import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserStore } from '../../store';
import { ROUTES } from '../../constants/navigation';

const Profile: React.FC = () => {
  const navigate = useNavigate();
  const { isLoggedIn } = useUserStore();

  useEffect(() => {
    // 检查用户是否登录
    if (!isLoggedIn) {
      // 如果未登录，重定向到登录页面
      navigate(ROUTES.LOGIN);
    } else {
      // 如果已登录，重定向到个人资料页面
      navigate(ROUTES.PROFILE_INFO);
    }
  }, [isLoggedIn, navigate]);

  return null;
};

export default Profile;
