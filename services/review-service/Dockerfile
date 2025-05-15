FROM eclipse-temurin:17-jdk-alpine

WORKDIR /app

# Install necessary tools
RUN apk add --no-cache maven curl

# Copy pom.xml and source
COPY pom.xml .
COPY src ./src

# Build the application
RUN mvn package -DskipTests

# Expose port
EXPOSE 8080


# Run the application with configurable params
ENTRYPOINT ["java", "-jar", "target/review-service-0.0.1-SNAPSHOT.jar"]