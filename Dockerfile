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

# ===== final stage =====
FROM node:20-bullseye
WORKDIR /app

# Copy frontend build and backend
COPY --from=frontend-build /app/frontend/dist /app/frontend/dist
COPY --from=backend-build /app/backend /app/backend
COPY --from=backend-build /app/backend/node_modules /app/backend/node_modules

# Expose only backend port
EXPOSE 3000

# Start only the backend server
CMD ["sh", "-c", "cd /app/backend && sleep 3 && npx prisma generate && npx prisma migrate deploy && node scripts/seed.js && npm start"]

