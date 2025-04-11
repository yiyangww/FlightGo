# ===== frontend build 阶段 =====
FROM node:20-bullseye AS frontend-build
WORKDIR /app/frontend
COPY frontend/package*.json ./
# Increase memory limit for npm install
ENV NODE_OPTIONS="--max-old-space-size=4096"
RUN npm install
COPY frontend/ .
# Set environment variables for the build
ENV VITE_API_URL=http://localhost:3000
ENV VITE_GOOGLE_AUTH_URL=http://localhost:3000/auth/google
ENV VITE_AUTH_URL=http://localhost:3000/auth
RUN npm run build

# ===== backend build 阶段 =====
FROM node:20-bullseye AS backend-build
WORKDIR /app/backend
RUN apt-get update && apt-get install -y python3 make g++
# Increase memory limit for npm install
ENV NODE_OPTIONS="--max-old-space-size=4096"
COPY backend/package*.json ./
RUN npm install
COPY backend/ .
RUN npx prisma generate

# ===== 最终运行镜像 =====
FROM node:20-bullseye
WORKDIR /app

# 安装 serve（用于前端静态文件托管）
RUN apt-get update && apt-get install -y python3 make g++ && npm install -g serve

# 拷贝 frontend build 文件
COPY --from=frontend-build /app/frontend/dist /app/frontend/dist

# 拷贝 backend 项目
COPY --from=backend-build /app/backend /app/backend
COPY --from=backend-build /app/backend/node_modules /app/backend/node_modules

# 暴露端口：前端 5173，后端 3000
EXPOSE 3000 5173

# 启动前端和后端服务
CMD ["sh", "-c", "cd /app/backend && sleep 3 && npx prisma migrate deploy && node scripts/seed.js && npm start & serve -s /app/frontend/dist -l 5173"]
