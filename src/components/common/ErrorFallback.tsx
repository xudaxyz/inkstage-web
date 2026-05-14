import React, { useEffect } from 'react';

function ErrorFallback(): React.ReactElement {
  useEffect(() => {
    const timer = setTimeout(() => {
      window.location.reload();
    }, 1000);
    return (): void => clearTimeout(timer);
  }, []);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="text-lg text-gray-600 dark:text-gray-400">加载页面中...</div>
      </div>
    </div>
  );
}

export default ErrorFallback;
