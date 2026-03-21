import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useUserStore } from '../../store';
import { useAdminStore } from '../../store/adminStore';
import { UserRoleEnum } from '../../types/enums';
import { Button, message } from 'antd';

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

  if (!isLoggedIn) {
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
  const { adminUser, isAdminLoggedIn, initAuth, getProfile } = useAdminStore();
  const location = useLocation();
  const [initializing, setInitializing] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const loadingMessage = message.loading('正在验证身份...', 0);

    // 初始化认证状态
    const initializeAuth = async () : Promise<void> => {
      try {
        console.log('开始初始化管理员认证状态');
        // 初始化登录状态
        await initAuth();

        // 尝试获取个人资料（使用store中的isAdminLoggedIn状态）
        const currentState = useAdminStore.getState();
        console.log('初始化后 isAdminLoggedIn 状态:', currentState.isAdminLoggedIn);
        console.log('初始化后 adminUser 状态:', currentState.adminUser);
        if (currentState.isAdminLoggedIn) {
          try {
            await getProfile();
            const updatedState = useAdminStore.getState();
            console.log('获取个人资料后 adminUser 状态:', updatedState.adminUser);
          } catch (profileError) {
            console.error('获取个人资料失败:', profileError);
            // 个人资料获取失败不影响登录状态
          }
        }

        setError(null);
      } catch (err) {
        console.error('初始化登录状态失败:', err);
        setError('身份验证失败，请重新登录');
      } finally {
        setInitializing(false);
        loadingMessage(); // 关闭加载消息
      }
    };

    initializeAuth();
  }, [initAuth, getProfile]);

  // 加载中状态
  if (initializing) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-gray-600">正在验证身份...</p>
        </div>
      </div>
    );
  }

  // 错误状态
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Button
            type="primary"
            onClick={() => window.location.href = '/admin/login'}
          >
            重新登录
          </Button>
        </div>
      </div>
    );
  }

  // 未登录状态
  if (!isAdminLoggedIn) {
    console.error('用户未登录，重定向到登录页面');
    localStorage.setItem('redirect_after_login', location.pathname + location.search);
    return <Navigate to="/admin/login" replace />;
  }

  // 权限验证
  const userRole = adminUser.role || UserRoleEnum.ADMIN;
  if (userRole !== UserRoleEnum.ADMIN && userRole !== UserRoleEnum.SUPER_ADMIN) {
    console.error('用户没有管理员权限，当前角色:', userRole);
    return <Navigate to="/" replace />;
  }
  console.log('用户权限验证通过，角色:', userRole);

  // 验证通过，渲染子组件
  return children;
};
