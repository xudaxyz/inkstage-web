import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useUserStore } from '../../store';
import { UserRoleEnum } from '../../types/enums';

// 私有路由组件，需要登录才能访问
export const PrivateRoute = ({ children }: { children: React.ReactNode }): React.ReactNode => {
  const { isLoggedIn } = useUserStore();
  const location = useLocation();

  if (!isLoggedIn) {
    // 保存当前路径，登录后可以重定向回来
    localStorage.setItem('redirect_after_login', location.pathname + location.search);
    return <Navigate to="/login" replace />;
  }

  return children;
};

// 权限路由组件，需要特定权限才能访问
export const PermissionRoute = ({
  children,
  requiredPermissions
}: {
  children: React.ReactNode;
  requiredPermissions: string[];
}): React.ReactNode => {
  const { user, isLoggedIn } = useUserStore();
  const location = useLocation();

  if (!isLoggedIn) {
    localStorage.setItem('redirect_after_login', location.pathname + location.search);
    return <Navigate to="/login" replace />;
  }

  // 检查用户权限
  const hasPermission = requiredPermissions.some(permission =>
    user.role === permission
  );

  if (!hasPermission) {
    return <Navigate to="/" replace />;
  }

  return children;
};

// 管理员路由组件，需要管理员权限才能访问
export const AdminRoute = ({ children }: { children: React.ReactNode }): React.ReactNode => {
  const { adminUser, isAdminLoggedIn } = useUserStore();
  const location = useLocation();

  if (!isAdminLoggedIn) {
    localStorage.setItem('redirect_after_login', location.pathname + location.search);
    return <Navigate to="/admin/login" replace />;
  }

  if (adminUser.role !== UserRoleEnum.ADMIN && adminUser.role !== UserRoleEnum.SUPER_ADMIN) {
    return <Navigate to="/" replace />;
  }

  return children;
};
