import React, { useEffect, useRef } from 'react';
import { message } from 'antd';
import { useUserStore } from '../../store';
import { useAdminStore } from '../../store/adminStore';
import { UserStatusEnum } from '../../types/enums';

/**
 * 全局通知组件，用于显示登录状态变化的提示信息
 */
const Notification: React.FC = () => {
  const { isLoggedIn, user, authSource } = useUserStore();
  const { isAdminLoggedIn } = useAdminStore();
  const lastLoginStatusRef = useRef<{ isLoggedIn: boolean; isAdminLoggedIn: boolean }>({
    isLoggedIn: isLoggedIn,
    isAdminLoggedIn: isAdminLoggedIn
  });

  useEffect(() => {
    // 检查登录状态变化
    if (isLoggedIn !== lastLoginStatusRef.current.isLoggedIn) {
      if (isLoggedIn && !isAdminLoggedIn && UserStatusEnum.NORMAL === user.status && authSource === 'login') {
        void message.success({
          content: '登录成功！',
          duration: 3,
          className: 'text-lg font-medium'
        });
      }
      lastLoginStatusRef.current = { ...lastLoginStatusRef.current, isLoggedIn };
    }

    // 检查管理员登录状态变化
    if (isAdminLoggedIn !== lastLoginStatusRef.current.isAdminLoggedIn) {
      if (isAdminLoggedIn && !isLoggedIn) {
        void message.success({
          content: '管理员登录成功',
          duration: 3,
          className: 'text-lg font-medium'
        });
      }
      lastLoginStatusRef.current = { ...lastLoginStatusRef.current, isAdminLoggedIn };
    }
  }, [isLoggedIn, isAdminLoggedIn, user.status, authSource]);

  return null;
};

export default Notification;
