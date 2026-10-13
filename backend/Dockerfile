# Build stage
FROM maven:3.9-eclipse-temurin-17 AS build
WORKDIR /app
COPY maven-settings.xml pom.xml ./
COPY src ./src
# Download from Google's Maven Central mirror (avoids 429s on shared build hosts); retry transient failures
RUN for attempt in 1 2 3; do \
      mvn -q -B -s maven-settings.xml package -DskipTests && exit 0; \
      echo "Maven build attempt $attempt failed, retrying in 15s..."; sleep 15; \
    done; exit 1

# Run stage
FROM eclipse-temurin:17-jre
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
# Keep the JVM inside small free-tier memory limits
ENV JAVA_OPTS="-XX:MaxRAMPercentage=75 -XX:+UseSerialGC"
EXPOSE 8080
CMD ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
