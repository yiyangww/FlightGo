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


FROM node:20-bullseye
WORKDIR /app


RUN apt-get update && apt-get install -y python3 make g++ && npm install -g serve


COPY --from=frontend-build /app/frontend/dist /app/frontend/dist


COPY --from=backend-build /app/backend /app/backend
COPY --from=backend-build /app/backend/node_modules /app/backend/node_modules


EXPOSE 3000 5173


CMD ["sh", "-c", "cd /app/backend && sleep 3 && npx prisma migrate deploy && node scripts/seed.js && npm start & serve -s /app/frontend/dist -l 5173"]
