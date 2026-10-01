# Architecture

The browser loads static files served by Spring Boot. `app.js` calls `GET /api/health`, then sends an entered password to `POST /api/analyze` as JSON. `PasswordController` rejects empty values and delegates valid values to `PythonAnalyzerService`. That service starts the configured Python executable and script using `ProcessBuilder`, writes a JSON object to the process stdin, enforces a five-second timeout, and parses the JSON response into `PasswordAnalysis`. No shell is involved and no password is put in process arguments, persisted, or logged.

The analyzer is a standard-library Python program. It returns a bounded score, strength label, length, five boolean checks, and warnings. On service failure, Java responds with HTTP 503 and a generic message.

```text
frontend files ──served by──> Spring Boot :8080
Browser ──POST /api/analyze──> Java controller
                                 │ JSON over stdin
                                 ▼
                           Python analyzer
                                 │ JSON over stdout
Browser <── response JSON ──────┘
```
