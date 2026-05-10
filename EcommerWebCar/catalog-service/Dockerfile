# Stage 1: Build environment
FROM maven:3.9.6-eclipse-temurin-21 AS build

# Đặt thư mục làm việc cố định
WORKDIR /app

# Copy pom.xml và tải dependencies (cache layer)
COPY pom.xml .
RUN mvn dependency:go-offline

# Copy mã nguồn và chạy build
COPY src ./src
# Build file .jar và bỏ qua các unit test để tiết kiệm thời gian CI/CD
RUN mvn clean package -Dmaven.test.skip=true

# Stage 2: Run environment
FROM eclipse-temurin:21-jre-jammy

# Tạo thư mục làm việc chạy ứng dụng
WORKDIR /app

# Copy file .jar đã đóng gói từ Stage 1 sang Stage 2
COPY --from=build /app/target/*.jar app.jar

# Mở cổng 8080 (cổng mặc định của Spring Boot)
EXPOSE 8082

# Chạy ứng dụng
ENTRYPOINT ["java", "-jar", "app.jar"]
