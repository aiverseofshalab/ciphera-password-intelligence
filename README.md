# CIPHERΛ — Personal Password Intelligence

A small full stack portfolio app that scores password characteristics through an analysis service. Java serves the CIPHERΛ web UI and REST API; a Python standard library analyzer computes the result.

## Features

- Strength score, length, character checks, and clear warnings
- Premium responsive glass interface with show/hide password control
- Java-to-Python communication over stdin/stdout JSON
- No database, password persistence, logging, or external analysis APIs
- Health endpoint and friendly analyzer failure responses

## Tech stack

Java 21+, Spring Boot 3, Maven, Python 3 standard library, HTML5, CSS3, and vanilla JavaScript.

## Architecture

```text
Browser (HTML/CSS/JS) → Spring Boot POST /api/analyze → Python analyzer.py
                     ← JSON analysis result ← stdin/stdout JSON
```

Spring starts Python with `ProcessBuilder` argument lists, writes the request JSON to stdin, and parses stdout. The password is never placed in a command argument or logged. When deployed, the browser sends the password over HTTPS to this app’s Java/Python analysis service; the app does not store it or send it to a third-party analysis API.

## Project structure

```text
backend/    Spring Boot API, tests, and served static UI
frontend/   Editable source UI
python/     Analyzer and unittest suite
docs/       Architecture overview
```

The three frontend files are mirrored in `backend/src/main/resources/static/` so Spring Boot serves the app as one origin.

## Run

Requirements: Java 21 or newer, Python 3, and Maven. From the project root:

```sh
cd backend
./mvnw spring-boot:run
```

The included lightweight launcher uses an installed Maven executable. The Maven Wrapper bootstrap JAR is not included, so Maven must be installed. Set `python.executable` and `python.script` in `backend/src/main/resources/application.properties` if needed. The default script path is relative to the backend working directory and works with the command above.

Open [http://localhost:8080](http://localhost:8080).

## Deployment

The frontend can be deployed to Vercel from the `frontend/` directory. The Java/Python backend runs as a Docker web service on Render using `render.yaml`. Vercel forwards `/api/*` requests to the Render service. The current Render service name is `cipher-lambda-api`; update `frontend/vercel.json` if Render assigns a different hostname. The Blueprint uses Render’s free plan, which can sleep while idle and take longer to respond on the first request.

From the Render dashboard, create a Blueprint from the connected repository and deploy `render.yaml`. After the backend is healthy at `https://cipher-lambda-api.onrender.com/api/health`, deploy `frontend/` as a Vercel project. See [Render web services](https://render.com/docs/web-services) and [Vercel rewrites](https://vercel.com/docs/routing/rewrites).

## API

`GET /api/health` returns `{"status":"UP"}`.

`POST /api/analyze`, with `Content-Type: application/json`:

```json
{"password":"Hello@World123!"}
```

Example response:

```json
{"score":82,"strength":"Strong","length":15,"checks":{"length":true,"uppercase":true,"lowercase":true,"number":true,"special":true},"warnings":[]}
```

An empty password receives HTTP 400. If Python cannot be started or exits unexpectedly, the API returns HTTP 503 without exposing a stack trace.

## Scoring

Length earns up to 24 points, longer lengths add bonuses, and each character class earns 12. Predictable/common or very repetitive passwords incur penalties. Scores below 40 are Weak, below 70 are Medium, and 70+ are Strong. This is an educational heuristic, not a breach database or production security assessment.

## Tests

```sh
python3 -m unittest discover -s python -v
cd backend && ./mvnw test
```

## Security notes

The browser sends the entered value over HTTPS to this app’s Java server, which pipes it to Python. Neither process writes it to a file or database. The app intentionally does not log the password. Because this is a demo, do not enter real production passwords.

## Screenshots

Capture a screenshot after starting the application and place it here.

## Future improvements

- Add more sophisticated entropy and passphrase guidance
- Add browser automation coverage and a bundled local font
- Publish a production deployment with HTTPS and rate limiting
