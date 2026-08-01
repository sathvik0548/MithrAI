# PlacementAI Backend

Express + MongoDB + JWT backend for the AI Placement & Career Accelerator frontend. AI features (resume ATS analysis, AI mock interview, roadmap generation) are powered by the Claude API.

## Setup

```bash
cd backend
npm install
cp .env.example .env   # then edit .env
npm run dev            # or: npm start
```

You need:
- **MongoDB** running locally (`mongodb://127.0.0.1:27017/placement_ai`) or a MongoDB Atlas URI in `MONGO_URI`
- **ANTHROPIC_API_KEY** from https://platform.claude.com for the AI endpoints

Server runs on `http://localhost:5000`.

## API

All routes are prefixed with `/api`. Protected routes need `Authorization: Bearer <token>`.

### Auth
| Method | Route | Body |
|---|---|---|
| POST | `/auth/register` | `{ name, email, password }` → `{ token, user }` |
| POST | `/auth/login` | `{ email, password }` → `{ token, user }` |
| GET | `/auth/me` | — |
| PUT | `/auth/profile` | `{ name?, phone?, college?, branch?, graduationYear?, targetRole?, skills?, bio? }` |

### Resume Analyzer (AI)
| Method | Route | Body |
|---|---|---|
| POST | `/resume/analyze` | multipart `file` (PDF) + `targetRole`, or JSON `{ resumeText, targetRole }` |
| GET | `/resume/history` | — |

Response includes `atsScore` (0–100), section `scores` (each /20), `strengths`, `improvements`, `missingKeywords`, `summary` — matching the ResumeAnalyzer page UI.

### AI Mock Interview (AI)
| Method | Route | Body |
|---|---|---|
| POST | `/interview/start` | `{ role, difficulty, count? }` → `{ sessionId, questions }` |
| POST | `/interview/:id/answer` | `{ questionIndex, answer }` → `{ score, feedback }` |
| POST | `/interview/:id/finish` | — → session with `overallScore`, `overallFeedback` |
| GET | `/interview/history` | — |

### Roadmap (AI)
| Method | Route | Body |
|---|---|---|
| POST | `/roadmap/generate` | `{ goal }` → roadmap with phases/topics |
| GET | `/roadmap` | — |
| PATCH | `/roadmap/:id/topic` | `{ phaseIndex, topicIndex, done }` |
| DELETE | `/roadmap/:id` | — |

### Human Interview Bookings
| Method | Route | Body |
|---|---|---|
| POST | `/bookings` | `{ expertId, expertName, role, date, time }` |
| GET | `/bookings` | — |
| DELETE | `/bookings/:id` | cancels the booking |

### Dashboard
| Method | Route | Returns |
|---|---|---|
| GET | `/dashboard/stats` | `{ atsScore, interviewsTaken, averageScore, roadmapProgress, progress[] }` |
| GET | `/dashboard/activities` | recent activity feed |

## Wiring the frontend

The frontend currently uses `localStorage` for auth. To switch it to this backend (axios is already installed):

```js
// src/api.js
import axios from "axios";
const api = axios.create({ baseURL: "http://localhost:5000/api" });
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
export default api;
```

Then e.g. in `Login.jsx`: `const { data } = await api.post("/auth/login", { email, password }); localStorage.setItem("token", data.token);`
