# Stage 1: Build environment
FROM maven:3.8.5-openjdk-17 AS build

WORKDIR /app
COPY pom.xml .
RUN mvn dependency:go-offline
COPY src ./src
RUN mvn clean package -DskipTests

# Stage 2: Run environment
FROM openjdk:17-jdk-slim

WORKDIR /app
COPY --from=build /app/target/*.jar app.jar

# Eureka mặc định chạy port 8761
EXPOSE 8761

ENTRYPOINT ["java", "-jar", "app.jar"]
