# Dockerfile
FROM nginx:latest

# 复制nginx配置文件
COPY nginx.conf /etc/nginx/nginx.conf

# 复制前端构建产物
COPY dist /usr/share/nginx/html