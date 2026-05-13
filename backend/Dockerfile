
FROM node:18-alpine

WORKDIR /app


COPY backend/package*.json ./
RUN npm ci --omit=dev


COPY backend/ .


COPY frontend/ ../frontend/

EXPOSE 5000


CMD ["node", "server.js"]
