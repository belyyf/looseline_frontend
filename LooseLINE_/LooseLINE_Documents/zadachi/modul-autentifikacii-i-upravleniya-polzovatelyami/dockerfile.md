---
order: 3
title: Dockerfile
---

```
FROM node:20-alpine

WORKDIR /app

# Копируем package.json и package-lock.json
COPY package*.json ./

# Устанавливаем зависимости
RUN npm ci

# Копируем исходный код
COPY . .

# Запускаем приложение (команда переопределится в docker-compose)
CMD ["npm", "start"]
```