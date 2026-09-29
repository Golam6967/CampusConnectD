# CampusConnect

A student communication platform for IUT: announcements, club/society management, blood donation requests, lost & found, room booking, marketplace, and admin tooling.

## Tech Stack

- **Frontend**: React 19 + Vite, React Router, Axios, Firebase Auth
- **Backend**: Node.js + Express, dual-database (MongoDB via Mongoose + Supabase Postgres via Prisma), JWT auth, Firebase Admin, Nodemailer
- **Testing**: Jest (both frontend and backend)

## Project Structure

```
Backend/    # Express API (MongoDB + Supabase Postgres/Prisma), port 4000
frontend/   # React app (Vite), port 5173 in dev
```

## Local Development

### Backend
```bash
cd Backend
npm install
cp .env.example .env   # fill in MONGO_URI, DATABASE_URL, JWT_SECRET, GMAIL_USER, GMAIL_APP_PASSWORD
npx prisma generate
npm run dev
```
Also requires a `firebase.admin.json` service account file in `Backend/` (gitignored, not included in the repo).

### Frontend
```bash
cd frontend
npm install
npm run dev
```

### Tests
```bash
cd Backend && npm test
cd frontend && npm test
```

## Running with Docker

```bash
docker compose up --build
```

This builds and runs:
- **backend** — Express API on `http://localhost:4000`, using `Backend/.env` and a read-only mount of `Backend/firebase.admin.json` (both must exist locally; neither is baked into the image)
- **frontend** — static build served by Nginx on `http://localhost:80`

No local database containers are included — the app connects to external managed databases: MongoDB Atlas via `MONGO_URI` and Supabase Postgres (via Prisma) via `DATABASE_URL`. The backend image runs `prisma generate` at build time.

> Note: most frontend API calls currently use an absolute `http://localhost:4000` base URL rather than a relative path, so they work against the backend's published port directly rather than through Nginx's `/api` proxy. This only works for local/localhost deployments.

## CI

`.github/workflows/ci.yml` runs on push/PR to `main`:
- Backend and frontend test suites (`npm test`)
- A Docker build check for both images (no push to any registry)

## Deployment (Vercel + Render)

Architecture: **frontend** on Vercel, **backend API** and **chatbot (RAG agent)** on Render, databases on managed services (**MongoDB Atlas** + **Supabase Postgres**).

1. **Databases** – create a MongoDB Atlas cluster (allow `0.0.0.0/0` network access for Render) and a Supabase project; copy `MONGO_URI` and the Supabase connection string (`DATABASE_URL`). The backend runs `prisma db push` on every start to sync the schema.
2. **Render** – *New > Blueprint*, pick this repo (`render.yaml`). Fill in the env vars it asks for:
   - API: `MONGO_URI`, `DATABASE_URL`, `GMAIL_USER`, `GMAIL_APP_PASSWORD`, `FIREBASE_SERVICE_ACCOUNT_JSON` (paste the whole service-account JSON), `FRONTEND_URL` (your Vercel URL; fill after step 3)
   - Chatbot: `GROQ_API_KEY`, `ALLOWED_ORIGINS` (your Vercel URL)
3. **Vercel** – import the repo, set **Root Directory** to `frontend`, and add env vars `VITE_API_URL` (Render API URL), `VITE_API_BASE_URL` (`<API URL>/anonymous/api`), `VITE_CHATBOT_API_URL` (Render chatbot URL), plus the seven `VITE_FIREBASE_*` values from `frontend/.env.example` (Firebase console > Project settings > Your apps). Redeploy after changing them (they are baked in at build time).
4. **Firebase** – add the Vercel domain under Authentication > Settings > Authorized domains, or Google sign-in will fail.
5. Go back to Render and set `FRONTEND_URL` / `ALLOWED_ORIGINS` to the final Vercel URL.

Notes: the free Render API sleeps after inactivity (first request is slow). The chatbot needs at least the Starter plan for memory (torch + embedding models).
