# Stage 1: Build
FROM node:18-alpine AS build

# Đặt thư mục làm việc trong container
WORKDIR /app

# Copy file cấu hình package để cài đặt dependencies trước
# (Tận dụng cơ chế cache layer của Docker)
COPY package*.json ./

# Cài đặt các thư viện cần thiết
RUN npm install

# Copy toàn bộ code vào
COPY . .

# Build ứng dụng cho môi trường production
RUN npm run build

# Stage 2: Serve
FROM nginx:alpine

# Copy toàn bộ file build từ stage 1 sang thư mục html của Nginx
COPY --from=build /app/build /usr/share/nginx/html

# Expose port 80 cho web server
EXPOSE 80

# Chạy Nginx
CMD ["nginx", "-g", "daemon off;"]
