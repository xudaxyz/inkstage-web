/** @type {import('tailwindcss').Config} */
export default {
  // 配置需要处理的文件路径
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  // 配置主题
  theme: {
    extend: {
      // 扩展颜色主题
      colors: {
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
        },
        secondary: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
        },
      },
      // 扩展字体
      fontFamily: {
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'Helvetica Neue',
          'Arial',
          'sans-serif',
        ],
      },
      // 扩展间距
      spacing: {
        18: '4.5rem',
        88: '22rem',
      },
      // 扩展边框圆角
      borderRadius: {
        '4xl': '2rem',
      },
    },
  },
  // 配置插件
  plugins: [
      require('@tailwindcss/forms')
  ],
  // 配置深色模式
  darkMode: 'media',
}