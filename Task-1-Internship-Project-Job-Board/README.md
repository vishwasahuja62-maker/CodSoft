
# ElevateHire - Job Board Platform

A full-stack job board web application connecting top talent with elite teams. Built with React, Node.js, Express, and Supabase (PostgreSQL).

## Tech Stack

**Frontend:** React 19, Vite, Framer Motion, Recharts, Lucide Icons, React Router v6

**Backend:** Node.js, Express, Supabase (PostgreSQL), Socket.IO, JWT Auth, Nodemailer/Resend

**Infrastructure:** Docker, Docker Compose, Nginx

## Features

- Role-based dashboards (Candidate, Employer, Admin)
- Real-time chat with Socket.IO
- AI-powered job matching & skill assessments
- Resume builder & document management
- Kanban-style hiring pipeline
- Email notifications & alerts
- Responsive dark-themed UI

---

## Deployment

### Option 1: Single-Server (Easiest)

The backend can serve the frontend's built files directly — no separate hosting needed.

```bash
# 1. Build frontend
cd frontend
npm install
npm run build

# 2. Configure backend .env
cd ../backend
cp .env .env.production
# Edit .env.production:
#   - Set NODE_ENV=production
#   - Update FRONTEND_URL to your domain (e.g. https://yourdomain.com)
#   - Set a strong JWT_SECRET
#   - Configure Supabase credentials
#   - Set Resend API key for emails

# 3. Install & start backend
npm install --omit=dev
NODE_ENV=production npm start
```

The backend serves the frontend at `http://localhost:5001`. Use a reverse proxy (Nginx, Caddy) to point your domain to it.

---

### Option 2: Docker (Recommended)

```bash
docker-compose up --build
```

- Frontend: `http://localhost:80`
- Backend API: `http://localhost:5000`

Set `FRONTEND_URL` in `backend/.env` to your domain before building.

---

### Option 3: Separate Hosting (Frontend + Backend)

**Frontend** (Vercel, Netlify, Cloudflare Pages):

```bash
cd frontend
npm install
npm run build
```

Set `VITE_API_URL` env var to your backend URL at build time (e.g. `https://api.yourdomain.com/api`). Deploy the `dist/` folder.

**Backend** (Render, Railway, Fly.io, VPS):

```bash
cd backend
npm install --omit=dev
npm start
```

Set environment variables on your hosting platform: `PORT`, `JWT_SECRET`, `SUPABASE_DATABASE_URL`, `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `RESEND_API_KEY`, `FRONTEND_URL`.

---

### Environment Variables (backend/.env)

```env
PORT=5001
NODE_ENV=development
JWT_SECRET=your-secret-key-change-in-production
SUPABASE_DATABASE_URL=postgresql://postgres:password@db.xxx.supabase.co:5432/postgres
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_ANON_KEY=your-anon-key
RESEND_API_KEY=re_xxx
SMTP_FROM=onboarding@resend.dev
FRONTEND_URL=http://localhost:5173
```

---

## Local Development

```bash
# Terminal 1 - Backend
cd backend
npm install
npm run dev

# Terminal 2 - Frontend
cd frontend
npm install
npm run dev
```

Frontend: `http://localhost:5173` · Backend: `http://localhost:5001`

---

## Project Structure

```
├── backend/
│   ├── middleware/       # Auth, error handling
│   ├── routes/           # API route handlers
│   ├── services/         # Business logic, Supabase client
│   ├── server.js         # Entry point
│   └── database.js       # DB init & migration
├── frontend/
│   ├── src/
│   │   ├── components/   # Reusable UI components
│   │   ├── context/      # React context providers
│   │   ├── pages/        # Page components
│   │   └── utils/        # API helpers
│   ├── public/           # Static assets
│   └── dist/             # Build output (generated)
└── docker-compose.yml
```
