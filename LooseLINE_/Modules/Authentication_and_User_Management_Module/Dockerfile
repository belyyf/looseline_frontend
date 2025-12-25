# ===============================================
# Stage 1: Dependencies
# ===============================================
FROM node:20-alpine AS deps
WORKDIR /LooseLINE

# 1. Install Shared dependencies
COPY Shared/package*.json ./Shared/
RUN --mount=type=cache,target=/root/.npm cd Shared && npm ci

# 2. Install Module dependencies
COPY Modules/Authentication_and_User_Management_Module/package*.json ./Modules/Authentication_and_User_Management_Module/
RUN --mount=type=cache,target=/root/.npm cd Modules/Authentication_and_User_Management_Module && npm ci

# ===============================================
# Stage 2: Builder
# ===============================================
FROM node:20-alpine AS builder
WORKDIR /LooseLINE

# Copy dependencies
COPY --from=deps /LooseLINE/Shared/node_modules ./Shared/node_modules
COPY --from=deps /LooseLINE/Modules/Authentication_and_User_Management_Module/node_modules ./Modules/Authentication_and_User_Management_Module/node_modules

# Copy source
COPY Shared ./Shared
COPY Modules/Authentication_and_User_Management_Module ./Modules/Authentication_and_User_Management_Module

# Build the application
WORKDIR /LooseLINE/Modules/Authentication_and_User_Management_Module
ENV NEXT_TELEMETRY_DISABLED=1
ENV DATABASE_URL="postgresql://dummy:dummy@localhost:5432/dummy"
ENV BETTER_AUTH_SECRET="build-time-secret"

RUN npm run build

# ===============================================
# Stage 3: Runner (Production)
# ===============================================
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy necessary files from builder
COPY --from=builder /LooseLINE/Modules/Authentication_and_User_Management_Module/public ./Modules/Authentication_and_User_Management_Module/public
COPY --from=builder --chown=nextjs:nodejs /LooseLINE/Modules/Authentication_and_User_Management_Module/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /LooseLINE/Modules/Authentication_and_User_Management_Module/.next/static ./Modules/Authentication_and_User_Management_Module/.next/static

# Set ownership
USER nextjs

# Expose port
EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

WORKDIR /app/Modules/Authentication_and_User_Management_Module
CMD ["node", "server.js"]