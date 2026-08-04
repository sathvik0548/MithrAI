# MithrAI — AI Career & Interview Coach Platform

MithrAI is a comprehensive career accelerator platform featuring AI resume ATS scoring, AI mock interviews powered by Claude API, personalized skill roadmaps, Google Calendar integration, and expert human mock interview booking.

---

## 🌟 Key Features

- **Google Auth & Supabase Database**: Seamless sign-in via Supabase OAuth (Google & Email/Password) with PostgreSQL database storage.
- **AI Resume ATS Analyzer**: Instantly scores resumes, highlights strengths/improvements, and pinpoints missing keywords.
- **AI Mock Interview**: Interactive interview session with real-time feedback and dynamic scoring.
- **Personalized Roadmap**: Customized learning plans built around skill gaps.
- **Human Interview Coaching**: Schedule 1-on-1 practice sessions with industry experts.

---

## 🚀 Repository Structure & Vercel Deployment

This project is separated into independent **Frontend** and **Backend** applications ready for 1-click deployment on **Vercel**.

### 1️⃣ Frontend Deployment (Vercel)
- **Framework**: React + Vite
- **Root Directory**: `./` (or root folder)
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Environment Variables**:
  - `VITE_SUPABASE_URL`: Your Supabase Project URL
  - `VITE_SUPABASE_ANON_KEY`: Your Supabase Anonymous Public Key
  - `VITE_API_URL`: URL of your deployed backend (e.g. `https://mithrai-backend.vercel.app/api`)

### 2️⃣ Backend Deployment (Vercel)
- **Framework**: Express.js (Node.js Serverless Functions)
- **Root Directory**: `backend`
- **Build Command**: `npm install`
- **Configuration**: Uses `backend/vercel.json`
- **Environment Variables**:
  - `SUPABASE_URL`: Your Supabase Project URL
  - `SUPABASE_ANON_KEY`: Your Supabase Anonymous Key
  - `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase Service Role Key
  - `ANTHROPIC_API_KEY`: Anthropic Claude API key
  - `CLIENT_URL`: Frontend production domain (for CORS)

---

## 🗄️ Database Setup (Supabase Postgres)

1. Create a project at [Supabase](https://app.supabase.com).
2. Open the **SQL Editor** in Supabase dashboard.
3. Run the complete SQL script in `supabase_schema.sql`.
4. Enable **Google Provider** under **Authentication -> Providers** and add your Google Client ID & Secret.

---

## 💻 Local Development

```bash
# Frontend
npm install
npm run dev

# Backend
cd backend
npm install
npm run dev
```
