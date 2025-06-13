# ===== frontend build 阶段 =====
FROM node:20-bullseye AS frontend-build
WORKDIR /app/frontend
COPY frontend/package*.json ./
# Increase memory limit for npm install
ENV NODE_OPTIONS="--max-old-space-size=4096"
RUN npm install
COPY frontend/ .
# Set environment variables for the build - using relative paths
ENV VITE_API_URL=""
ENV VITE_GOOGLE_AUTH_URL="/auth/google"
ENV VITE_AUTH_URL="/auth"
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
# Explicitly copy the prisma directory to ensure migrations are included
COPY backend/prisma ./prisma

# ===== final stage =====
FROM node:20-bullseye
WORKDIR /app

# Copy frontend build and backend
COPY --from=frontend-build /app/frontend/dist /app/frontend/dist
COPY --from=backend-build /app/backend /app/backend
COPY --from=backend-build /app/backend/node_modules /app/backend/node_modules

# Expose only backend port
EXPOSE 3000

# 创建启动脚本
RUN echo '#!/bin/sh\n\
echo "Checking DATABASE_URL..."\n\
if [ -z "$DATABASE_URL" ]; then\n\
  echo "Error: DATABASE_URL is not set"\n\
  exit 1\n\
fi\n\
\n\
echo "Generating Prisma client..."\n\
npx prisma generate\n\
\n\
echo "Waiting for database..."\n\
sleep 10\n\
\n\
echo "Verifying prisma migrations directory..."\n\
ls -la prisma\n\
ls -la prisma/migrations\n\
\n\
echo "Running database migrations..."\n\
npx prisma migrate deploy\n\
\n\
echo "Seeding database..."\n\
node scripts/seed.js\n\
\n\
echo "Starting application..."\n\
npm start\n\
' > /app/backend/start.sh && chmod +x /app/backend/start.sh

# 设置工作目录
WORKDIR /app/backend

# 启动应用
CMD ["/app/backend/start.sh"]

