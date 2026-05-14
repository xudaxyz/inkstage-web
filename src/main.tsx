import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';
import { HelmetProvider } from 'react-helmet-async';
// Sentry初始化
import * as Sentry from '@sentry/react';
// React Query 配置
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ErrorFallback from './components/common/ErrorFallback';

if (import.meta.env.PROD) {
  // Sentry.init({
  // dsn: 'https://your-dsn@sentry.io/your-project',
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

const helmetContext = {};

const rootElement = document.getElementById('root');

if (rootElement) {
  createRoot(rootElement).render(
    <StrictMode>
      <HelmetProvider context={helmetContext}>
        <QueryClientProvider client={queryClient}>
          {import.meta.env.PROD ? (
            <Sentry.ErrorBoundary fallback={<ErrorFallback />}>
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
