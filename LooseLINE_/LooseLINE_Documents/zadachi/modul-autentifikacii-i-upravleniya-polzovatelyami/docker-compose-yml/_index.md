---
order: 2
title: docker compose yml
---

```1c
services:
  postgres:
    image: postgres:15-alpine
    container_name: looseline_postgres
    restart: unless-stopped
    ports:
      - "5433:5432"
    environment:
      POSTGRES_DB: ${POSTGRES_DB}
      POSTGRES_USER: ${POSTGRES_USER}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
      POSTGRES_INITDB_ARGS: "-E UTF8 --locale=C.UTF-8"
      POSTGRES_SHARED_BUFFERS: "256MB"
      POSTGRES_EFFECTIVE_CACHE_SIZE: "1GB"
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./init-scripts/postgres:/docker-entrypoint-initdb.d:ro
    networks:
      - looseline_infrastructure
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER} -d ${POSTGRES_DB}"]
      interval: 10s
      timeout: 5s
      retries: 5
      start_period: 10s
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"

  # ========== МИГРАЦИИ ==========
  
  # Better Auth миграции
  auth_migrations:
    build:
      context: .  # ✅ Текущая папка (корень проекта)
      dockerfile: Dockerfile
    container_name: looseline_auth_migrations
    restart: "no"
    environment:
      DATABASE_URL: postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@postgres:5432/${POSTGRES_DB}
    networks:
      - looseline_infrastructure
    depends_on:
      postgres:
        condition: service_healthy
    command: >
      sh -c "
        echo '⏳ Waiting for postgres DNS...' &&
        for i in 1 2 3 4 5 6 7 8 9 10; do
          if getent hosts postgres > /dev/null 2>&1; then
            echo '✅ postgres resolved!' && break;
          fi;
          echo \"Attempt $$i: waiting for DNS...\" && sleep 2;
        done &&
        echo '🔧 Running Better Auth migrations...' &&
        npx @better-auth/cli generate --yes &&
        npx @better-auth/cli migrate --yes &&
        echo '✅ Better Auth tables created!'
      "
    logging:
      driver: "json-file"
      options:
        max-size: "5m"
        max-file: "2"

volumes:
  postgres_data:

networks:
  looseline_infrastructure:
    driver: bridge
```