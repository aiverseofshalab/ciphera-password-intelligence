FROM maven:3.9.16-eclipse-temurin-21 AS build

WORKDIR /workspace/backend

COPY backend/pom.xml ./pom.xml
COPY backend/src ./src

RUN mvn --batch-mode --no-transfer-progress -DskipTests package

FROM eclipse-temurin:21-jre-jammy

RUN apt-get update \
    && apt-get install --yes --no-install-recommends python3-minimal \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app/backend

COPY --from=build /workspace/backend/target/smart-password-analyzer-1.0.0.jar ./app.jar
COPY python /app/python

ENV PYTHON_EXECUTABLE=python3
ENV PYTHON_SCRIPT=../python/analyzer.py
ENV LOGGING_LEVEL_ORG_SPRINGFRAMEWORK_WEB=INFO

EXPOSE 10000

ENTRYPOINT ["java", "-jar", "/app/backend/app.jar"]
