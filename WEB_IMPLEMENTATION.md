# ProcrastiLess Web Implementation

This folder adds a full-stack implementation of the README specification and expands it into GradFlow, a graduate-student life analytics system:

- Frontend: React + Vite
- Backend: Java Spring Boot
- Database: H2 file database through Spring Data JPA

## Features

- Add tasks with name, priority, effort, and optional deadline
- List active tasks and archived tasks
- Mark tasks as done
- Delete tasks
- Suggest top N pending tasks
- Postpone or advance deadlines with positive or negative day values
- Show total, pending, done, completion rate, workload, overdue count, weekly summary, and evaluations
- Archive all completed tasks into a separate archive table
- Reset active tasks
- Daily check-ins for sleep, mood, stress, study time, water, and notes
- Habit tracking with daily counts and weekly completion rate
- Research logs for progress, blockers, next steps, and hours
- Expense tracking with weekly category analysis
- Goal tracking
- Built-in calendar events
- Weekly life analytics and insight generation

## Backend

```bash
cd backend
mvn spring-boot:run
```

API base URL:

```text
http://localhost:8080/api
```

H2 console:

```text
http://localhost:8080/h2-console
```

Use these H2 settings:

```text
JDBC URL: jdbc:h2:file:./data/procrastiless
User: sa
Password:
```

## Frontend

```bash
cd frontend
npm install
npm run dev
```

The UI runs at:

```text
http://localhost:5173
```

If the API runs somewhere else:

```bash
set VITE_API_BASE_URL=http://localhost:8080/api
npm run dev
```

## Main API Endpoints

| Method | Endpoint | Purpose |
| --- | --- | --- |
| GET | `/api/tasks` | List active tasks |
| GET | `/api/tasks?archived=true` | List archived tasks |
| POST | `/api/tasks` | Add a task |
| DELETE | `/api/tasks/{id}` | Delete a task |
| PATCH | `/api/tasks/{id}/done` | Mark a task done |
| PATCH | `/api/tasks/{id}/postpone` | Shift deadline by non-zero days |
| GET | `/api/suggestions?top=3` | Get top N task suggestions |
| GET | `/api/stats` | Get behavior analysis and weekly summary |
| POST | `/api/archive` | Move completed tasks to archive |
| DELETE | `/api/tasks/reset` | Clear active tasks |
| GET | `/api/gradflow/analytics` | Weekly life analytics |
| GET/POST | `/api/gradflow/daily-logs` | Daily check-in logs |
| GET/POST | `/api/gradflow/habits` | Habit definitions |
| POST | `/api/gradflow/habit-records` | Habit daily count |
| GET/POST | `/api/gradflow/expenses` | Expense records |
| GET/POST | `/api/gradflow/research-logs` | Research progress logs |
| GET/POST | `/api/gradflow/goals` | Goals |
| GET/POST | `/api/gradflow/calendar-events` | Built-in calendar events |

## Scoring Rule

```text
score = priority * 2 + urgency - effort
```

Urgency follows the original v2 CLI rules:

- overdue or today: 5
- within 1 day: 4
- within 3 days: 3
- within 7 days: 2
- no deadline or later than 7 days: 0
