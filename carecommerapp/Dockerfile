# Build stage
FROM node:18-alpine as build-stage
WORKDIR /app
COPY package*.json ./
RUN npm install
ARG REACT_APP_API_URL       
ENV REACT_APP_API_URL=$REACT_APP_API_URL
COPY . .
RUN npm run build


# Production stage
FROM nginx:stable-alpine
COPY --from=build-stage /app/build /usr/share/nginx/html
# Nếu bạn dùng thư mục build thay vì dist thì sửa lại /app/build
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]