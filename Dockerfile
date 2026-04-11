# Tahap 1: Build stage
FROM node:20-alpine AS builder
WORKDIR /app

# Copy file dependency dulu agar Docker bisa nge-cache
COPY package*.json ./
RUN npm install

# Copy seluruh kode NestJS (pastikan Anda sudah membuat .dockerignore)
COPY . .

# Build aplikasi NestJS menjadi JavaScript (ke folder /dist)
RUN npm run build

# Tahap 2: Production stage (Image final yang lebih kecil)
FROM node:20-alpine
WORKDIR /app

COPY package*.json ./
# Hanya install package untuk production (menghemat ratusan MB)
RUN npm install --only=production

# Copy folder dist dari tahap builder
COPY --from=builder /app/dist ./dist
# Copy environment file
COPY .env ./

# Ekspos port internal 3000
EXPOSE 3000

# Jalankan aplikasi
CMD ["node", "dist/main"]