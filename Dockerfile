# syntax=docker/dockerfile:1.7

# ---------- Stage 1: build frontend ----------
FROM node:22-alpine AS frontend
WORKDIR /work
COPY frontend/package.json frontend/package-lock.json* ./frontend/
RUN cd frontend && npm install --no-audit --no-fund
COPY frontend ./frontend
RUN cd frontend && npm run build

# ---------- Stage 2: build backend ----------
FROM maven:3.9-eclipse-temurin-21 AS backend
WORKDIR /work
COPY backend/pom.xml ./backend/pom.xml
RUN cd backend && mvn -B -q -DskipTests dependency:go-offline
COPY backend ./backend
COPY --from=frontend /work/frontend/dist ./backend/src/main/resources/static
RUN cd backend && mvn -B -Dmaven.test.skip=true package

# ---------- Stage 3: runtime ----------
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
RUN addgroup -S app && adduser -S app -G app
COPY --from=backend /work/backend/target/careermovechecker.jar /app/app.jar
USER app
EXPOSE 8080
ENV SPRING_PROFILES_ACTIVE=prod
ENTRYPOINT ["java", "-XX:MaxRAMPercentage=75", "-jar", "/app/app.jar"]
