import React, { useEffect, useState } from 'react';
import { Alert } from 'antd';
import { ROUTES } from '../../constants/routes';

interface AuthErrorHandlerProps {
    message: string;
    onClose: () => void;
    showActions?: boolean;
    redirectToLogin?: boolean;
}

const AuthErrorHandler: React.FC<AuthErrorHandlerProps> = ({
                                                               message,
                                                               onClose,
                                                               redirectToLogin = true
                                                           }) => {
    const [countdown, setCountdown] = useState<number>(3);
    useEffect(() => {
        if (redirectToLogin) {
            const timer = setInterval(() => {
                setCountdown((prev) => {
                    if (prev <= 1) {
                        clearInterval(timer);
                        window.location.href = ROUTES.LOGIN;
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
            return (): void => clearInterval(timer);
        }
    }, [redirectToLogin]);
    return (
        <div className="fixed top-8 left-1/2 transform -translate-x-1/2 z-50 w-80">
            <Alert
                type="warning"
                title={message && redirectToLogin && countdown > 0 && `${message}, 将在 ${countdown} 秒后跳转到登录页面...`}
                showIcon
                closable={{ closeIcon: true, onClose, 'aria-label': 'close' }}
            />
        </div>
    );
};
export default AuthErrorHandler;
