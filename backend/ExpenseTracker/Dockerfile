# Build stage
FROM maven:3.9.6-eclipse-temurin-21-jammy AS build
WORKDIR /app
COPY pom.xml .
COPY src ./src
RUN mvn clean package -DskipTests

# Run stage
FROM eclipse-temurin:21-jre-jammy
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar

# Expose Render's dynamic port
EXPOSE 8080

# Use optimized Java flags for faster startup on Render's free tier
# -XX:TieredStopAtLevel=1 speeds up startup
# -Xmx and -Xms help manage limited memory
# -Dserver.port=${PORT} binds the app to Render's assigned port
ENTRYPOINT ["sh", "-c", "java -XX:TieredStopAtLevel=1 -Xmx384m -Xms384m -Dserver.port=${PORT:-8080} -Dspring.datasource.url=jdbc:postgresql://${DB_HOST}:${DB_PORT}/${DB_NAME} -Dspring.datasource.username=${DB_USER} -Dspring.datasource.password=${DB_PASS} -jar app.jar"]
