FROM node:18-alpine

WORKDIR /app

# Copy package.json และ package-lock.json
COPY package*.json ./

# ติดตั้ง dependencies ภายใน Docker
RUN npm install

# Copy source code ทั้งหมด
COPY . .

# Expose port (ถ้าจำเป็น)
EXPOSE 4000

# รัน Service
CMD ["node", "historyService.js"]