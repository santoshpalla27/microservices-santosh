FROM maven:3.8.7-eclipse-temurin-17-alpine AS build

WORKDIR /app

# Copy pom.xml first for dependency resolution
COPY pom.xml .
RUN mvn dependency:go-offline

# Copy source code
COPY src ./src/

# Build the application
RUN mvn package -DskipTests

# Use a smaller JRE image for the final container
FROM eclipse-temurin:17-jre-alpine

WORKDIR /app

# Copy the built JAR file
COPY --from=build /app/target/*.jar app.jar

EXPOSE 6000

ENTRYPOINT ["java", "-jar", "app.jar"]