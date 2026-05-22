# GradFlow

GradFlow is a personal graduate-life dashboard for tracking research work, daily check-ins, habits, rewards, money, goals, and calendar events. The project started from a task-management assignment idea and evolved into a full-stack web app that connects life signals into one place.

## Project Idea

Graduate work is rarely just a task list. Research progress is affected by sleep, stress, habits, money pressure, meetings, deadlines, and small routines. GradFlow tries to make those signals visible without turning the app into a rigid productivity system.

The core design goals are:

- Keep daily logging lightweight.
- Connect goals, habits, tasks, money, and calendar records.
- Support guest mode for quick demos.
- Support account mode where each email has isolated data.
- Use AI as a logging assistant, not as a replacement for user confirmation.

## Main Features

- **Overview**: weekly analytics, quick signals, AI Quick Log.
- **Today**: daily check-in for sleep, mood, stress, study, water, exercise, and notes.
- **Tasks**: priority, effort, deadlines, suggestions, completion, archive.
- **Research**: research logs, blockers, next steps, and research-hour tracking.
- **Habits**: habit setup, daily habit records, streak-style statistics.
- **Rewards**: points earned from completed habits and redeemable reward items.
- **Money**: income/expense records, cash-flow range filter, category breakdown, transaction history, daily trend chart.
- **Goals**: manual progress plus automatic progress from linked tasks and habits.
- **Calendar**: month view combining deadlines, daily check-ins, research, money, rewards, and custom events.
- **Settings**: profile name, password update, avatar upload/crop/zoom/contrast.

## Tech Stack

### Frontend

- React
- Vite
- JavaScript
- CSS
- Lucide React icons
- Browser localStorage for lightweight demo auth/profile state

### Backend

- Java 17
- Spring Boot
- Spring Web
- Spring Data JPA
- Maven
- PostgreSQL in Docker

### AI Integration

- Gemini API through the backend service
- API key is loaded from environment variables
- The frontend never asks the user to paste the key
- The AI Quick Log flow asks Gemini to return structured JSON actions
- The UI turns those actions into natural-language confirmation before saving

## Data Model

The backend stores records in user-scoped tables. Most user data includes:

- `userEmail`
- daily logs
- tasks
- archived tasks
- habits
- habit records
- goals
- rewards
- reward redemptions
- expenses
- research logs
- calendar events

This means two accounts using different emails should not see each other's records.

Guest mode is different: guest data is stored only in frontend memory. It appears while using the page, but disappears after refresh or reopening the app.

## Demo Account

Seed data is attached to:

```text
Email: demo@gradflow.local
Password: demo1234
```

The password is a frontend demo-login password. The seed records themselves live in PostgreSQL under `demo@gradflow.local`.

## Environment Variables

Create a `.env` file in the project root based on `.env.example`.

Common values:

```env
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-2.0-flash
VITE_API_BASE_URL=http://127.0.0.1:8082/api
APP_CORS_ALLOWED_ORIGIN=http://127.0.0.1:5180,http://localhost:5180
```

## Run With Docker

From the project root:

```powershell
docker compose up --build
```

Default ports used by this project:

- Frontend: `http://127.0.0.1:5180`
- Backend API: `http://127.0.0.1:8082/api`
- PostgreSQL host port: `55432`

Docker Compose starts three containers:

- `gradflow-frontend`: React/Vite production build served by Nginx
- `gradflow-backend`: Spring Boot REST API
- `gradflow-postgres`: PostgreSQL database with a persistent Docker volume

If you need to fully reset PostgreSQL and reload seed data:

```powershell
docker compose down -v
docker compose up --build
```

`down -v` deletes the database volume. Use it only when you do not need to keep current database records.

## Run Frontend Locally

```powershell
cd frontend
npm install
npm run dev:gradflow
```

The GradFlow frontend is configured to use port `5180` to avoid clashing with other Vite projects on `5173`.

## Run Backend Locally

```powershell
cd backend
mvn spring-boot:run
```

When running outside Docker, make sure the backend can connect to PostgreSQL and that the frontend CORS origin matches the active frontend port.

## AWS Learner Lab Deployment Plan

For a simple AWS Learner Lab demo, the easiest deployment path is:

1. Launch an EC2 instance.
2. Install Docker and Docker Compose on EC2.
3. Copy or clone this project onto the instance.
4. Put `GEMINI_API_KEY`, `GEMINI_MODEL`, `VITE_API_BASE_URL`, and `APP_CORS_ALLOWED_ORIGIN` in `.env`.
5. Run `docker compose up --build -d`.
6. Open the EC2 security group for the frontend port, usually `5180`, and optionally backend port `8082` for API testing.

Suggested AWS services to mention in the presentation:

- **Amazon EC2**: hosts the Docker Compose app.
- **Docker on EC2**: runs frontend, backend, and database containers.
- **Amazon EBS**: stores the EC2 instance disk and Docker volume data.
- **Security Groups**: controls inbound access to frontend/backend ports.

Optional upgrade:

- **Amazon RDS for PostgreSQL** can replace the PostgreSQL container if the demo needs a managed database. For a class deployment, the included PostgreSQL container is simpler and enough to demonstrate the full stack.

## GitHub Pages Frontend Preview

This repository includes a GitHub Actions workflow for publishing the React frontend as a static GitHub Pages preview:

```text
.github/workflows/pages.yml
```

The Pages preview is frontend-only. It is useful for showing the UI and guest mode, but it does not run the Spring Boot backend or PostgreSQL database. For the full app, use Docker Compose locally or deploy the containers to AWS EC2.

After pushing to GitHub:

1. Open the repository on GitHub.
2. Go to **Settings > Pages**.
3. Set **Source** to **GitHub Actions**.
4. Push to the `main` branch.
5. Open the Pages URL shown by the workflow.

## Gemini Quick Log Design

The Gemini service is in:

```text
backend/src/main/java/com/procrastiless/api/service/GeminiLogParserService.java
```

It works like this:

1. The user writes a natural-language note.
2. The backend sends Gemini a constrained instruction prompt.
3. Gemini must return JSON only.
4. If the note is ambiguous, Gemini returns one follow-up question.
5. If clear, Gemini returns proposed actions.
6. The frontend displays a natural-language summary.
7. The user confirms before data is saved.

This makes AI behavior safer for a class project because the app does not silently mutate records.

## Seed Data

Initial data lives in:

```text
backend/src/main/resources/data.sql
```

The seed data uses `current_date`, so records are created relative to the day the database is initialized. If the Docker volume already exists, dates do not shift every day. They only shift if the database is deleted and initialized again.

## Notes

This project currently uses a lightweight demo authentication flow in the frontend. It is enough for local demos and homework presentation, but it is not production-grade authentication. A production version should move account creation, password hashing, sessions/JWT, and authorization fully into the backend.
