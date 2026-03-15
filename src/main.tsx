import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';

// Sentry初始化
import * as Sentry from '@sentry/react';

// 只有在生产环境才初始化Sentry
if (import.meta.env.PROD) {
  Sentry.init({
    dsn: 'https://your-dsn@sentry.io/your-project',
    // 简化Sentry配置，移除需要额外安装的集成
    tracesSampleRate: 1.0
  });
}

const rootElement = document.getElementById('root');

if (rootElement) {
  createRoot(rootElement).render(
    <StrictMode>
      {import.meta.env.PROD ? (
        <Sentry.ErrorBoundary fallback={<div className="text-center p-8">应用程序出现错误，请刷新页面重试</div>}>
          <App />
        </Sentry.ErrorBoundary>
      ) : (
        <App />
      )}
    </StrictMode>
  );
} else {
  console.error('Root element not found');
}
