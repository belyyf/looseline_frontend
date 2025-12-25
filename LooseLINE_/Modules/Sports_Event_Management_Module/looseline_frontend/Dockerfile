# ===============================================
# Stage 1: Build
# ===============================================
FROM node:20-alpine AS builder

# Set working directory to project root level to match monorepo structure
WORKDIR /LooseLINE

# 1. Install Shared dependencies
COPY Shared/package*.json ./Shared/
RUN --mount=type=cache,target=/root/.npm cd Shared && npm ci

# 2. Install Module dependencies
COPY Modules/Sports_Event_Management_Module/looseline_frontend/package*.json ./Modules/Sports_Event_Management_Module/looseline_frontend/
RUN --mount=type=cache,target=/root/.npm cd Modules/Sports_Event_Management_Module/looseline_frontend && npm ci

# 3. Copy source code
COPY Shared ./Shared
COPY Modules/Sports_Event_Management_Module/looseline_frontend ./Modules/Sports_Event_Management_Module/looseline_frontend

# 4. Build the application
WORKDIR /LooseLINE/Modules/Sports_Event_Management_Module/looseline_frontend
RUN npm run build

# ===============================================
# Stage 2: Production
# ===============================================
FROM nginx:alpine AS runner

# Copy built files
COPY --from=builder /LooseLINE/Modules/Sports_Event_Management_Module/looseline_frontend/dist /usr/share/nginx/html

# Copy nginx config
# Using COPY from context because nginx.conf is small and we want to keep runner layer simple
COPY Modules/Sports_Event_Management_Module/looseline_frontend/nginx.conf /etc/nginx/conf.d/default.conf

# Expose port
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
