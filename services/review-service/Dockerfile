
FROM eclipse-temurin:17-jdk-alpine

WORKDIR /app

COPY pom.xml .
COPY src ./src

RUN apk add --no-cache maven
RUN mvn package -DskipTests

EXPOSE 6000

CMD ["java", "-jar", "target/review-service-0.0.1-SNAPSHOT.jar"]