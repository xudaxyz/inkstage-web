import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // Sentry插件配置暂时移除，避免配置错误
    // sentryVitePlugin({
    //   org: 'your-org-slug',
    //   project: 'your-project-slug',
    //   authToken: process.env.SENTRY_AUTH_TOKEN,
    // })
  ],
  // Vitest配置暂时移除，避免TypeScript错误
  // 可以在单独的vitest.config.ts中配置
})
