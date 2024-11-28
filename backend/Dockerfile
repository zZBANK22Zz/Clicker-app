FROM node:18-alpine

WORKDIR /app

COPY backend/package*.json ./
RUN npm install

COPY backend/. .
COPY plugins/plugin.proto ./plugins/plugin.proto

EXPOSE 8000

CMD ["node", "server.js"]