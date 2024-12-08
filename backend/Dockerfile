FROM node:18-alpine

WORKDIR /app

# Copy backend package files
COPY package*.json ./

# Install backend dependencies
RUN npm install

# Copy backend source files
COPY . .

EXPOSE 8080

CMD ["node", "server.js"]