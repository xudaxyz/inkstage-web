import {defineConfig} from 'vite'
import react from "@vitejs/plugin-react"
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
    server: {
        port: 3000,
        proxy: {
            '/api': {
                target: 'http://localhost:8080',
                changeOrigin: true,
                rewrite: (path) => {
                    if (path.startsWith('/api/auth')) {
                        return path.replace(/^\/api\/auth/, '/api/v1/front/auth');
                    }
                    return path;
                }
            }
        }
    },
    plugins: [
        tailwindcss(), react()
    ],
    resolve: {
        alias: {
            "@": "/src",
        },
    }
})
