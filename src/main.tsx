import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';
import { HelmetProvider } from 'react-helmet-async';
// Sentry初始化
import * as Sentry from '@sentry/react';
// React Query 配置
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
// 只有在生产环境才初始化Sentry, 目前无需使用sentry
if (import.meta.env.PROD) {
  // Sentry.init({
    // dsn: 'https://your-dsn@sentry.io/your-project',
    // 简化Sentry配置，移除需要额外安装的集成
    // tracesSampleRate: 1.0
  // });
}

// 创建 QueryClient 实例
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 5 * 60 * 1000, // 5分钟
      refetchOnWindowFocus: false
    }
  }
});

const rootElement = document.getElementById('root');

if (rootElement) {
  createRoot(rootElement).render(
    <StrictMode>
      <HelmetProvider>
        <QueryClientProvider client={queryClient}>
          {import.meta.env.PROD ? (
            <Sentry.ErrorBoundary fallback={<div className="text-center p-8">应用程序出现错误，请刷新页面重试</div>}>
              <App />
            </Sentry.ErrorBoundary>
          ) : (
            <App />
          )}
        </QueryClientProvider>
      </HelmetProvider>
    </StrictMode>
  );
} else {
  console.error('Root element not found');
}
