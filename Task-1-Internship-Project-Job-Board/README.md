<div align="center">
  <img src="App Logo.png" alt="ElevateHire Logo" width="200" />
  <h1>ElevateHire - Advanced Job Board Platform</h1>
  <p>A next-generation, full-stack job board web application connecting top talent with elite teams. Built for scale with modern technologies.</p>
</div>

---

## 🚀 Overview

**ElevateHire** is a comprehensive job platform designed to streamline the hiring process for both candidates and employers. It features advanced AI job matching, real-time messaging, kanban-style application tracking, and an intuitive, responsive design.

## 🛠️ Tech Stack

### Frontend
* **Core:** React 19, Vite
* **Routing:** React Router v6
* **Styling & Animations:** Vanilla CSS, Framer Motion
* **UI Components:** Lucide Icons, Recharts (Data Visualization)
* **Drag-and-Drop:** `@dnd-kit` (for Kanban hiring pipelines)
* **Real-time:** Socket.IO Client

### Backend
* **Server:** Node.js, Express.js
* **Database:** Supabase (PostgreSQL)
* **Real-time:** Socket.IO
* **Authentication:** JWT (JSON Web Tokens), Bcryptjs
* **File Uploads:** Multer
* **Email & Communications:** Nodemailer, Resend
* **Security:** Helmet, Express Rate Limit, CORS

### Infrastructure
* Docker & Docker Compose
* Nginx (Reverse Proxy)

## ✨ Key Features

### 👥 Role-Based Portals
* **Candidate Dashboard:** Manage profiles, track job applications, upload resumes, and receive AI-curated job recommendations.
* **Employer Dashboard:** Post job listings, manage company profiles, review applications, and move candidates through a visual Kanban pipeline.
* **Admin Dashboard:** Oversee platform activity, manage users, and view platform-wide analytics and insights.

### 💬 Real-Time Communication
* Built-in instant messaging between candidates and employers using **Socket.IO**.
* Live push notifications for application updates, new messages, and interview requests.

### 🧠 AI-Powered Matching & Assessments
* Advanced algorithms to match candidate skills with job requirements (`matching.js`).
* Automated candidate skill assessments and scoring (`assessments.js`).

### 📊 Application Tracking & Insights
* **Kanban Pipeline:** Employers can easily drag and drop candidates across different hiring stages.
* **Analytics:** Interactive charts and metrics (powered by Recharts) showing application views, conversion rates, and hiring trends.

### 📄 Document Management
* Secure resume uploading and parsing.
* Portfolio and cover letter management with secure cloud storage integration.

### 📅 Interview Scheduling & Offers
* Integrated tools to schedule, track, and manage interviews directly on the platform.
* Formal job offer generation and tracking.

## 🚀 Getting Started (Local Development)

### Prerequisites
* Node.js (v18 or higher)
* PostgreSQL / Supabase Account
* Docker (Optional, for containerized deployment)

### 1. Clone the Repository
```bash
git clone https://github.com/vishwasahuja62-maker/CodSoft.git
cd CodSoft
```

### 2. Environment Setup
Navigate to the `backend` folder and create a `.env` file based on your configuration:
```env
PORT=5001
NODE_ENV=development
JWT_SECRET=your_super_secret_jwt_key
SUPABASE_DATABASE_URL=postgresql://postgres:password@db.xxx.supabase.co:5432/postgres
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_ANON_KEY=your_supabase_anon_key
RESEND_API_KEY=re_xxx
SMTP_FROM=onboarding@resend.dev
FRONTEND_URL=http://localhost:5173
```

### 3. Install Dependencies & Run

**Backend:**
```bash
# Open Terminal 1
cd backend
npm install
npm run dev
```

**Frontend:**
```bash
# Open Terminal 2
cd frontend
npm install
npm run dev
```

The application will be available at:
* **Frontend:** `http://localhost:5173`
* **Backend API:** `http://localhost:5001`

## 🌍 Deployment Options

### Option 1: Docker Compose (Recommended)
You can easily spin up the entire application stack using Docker.
```bash
docker-compose up --build
```
* Frontend will be served on `http://localhost:80`
* Backend will be running on `http://localhost:5000`

*Note: Ensure `FRONTEND_URL` in `backend/.env` is set to your production domain.*

### Option 2: Render / Vercel (Cloud Hosting)
* **Frontend (Vercel/Netlify):** Set build command to `npm run build` and publish directory to `dist`. Set `VITE_API_URL` to your backend endpoint.
* **Backend (Render/Railway):** Deploy the `backend` folder as a Node.js Web Service. Configure your `.env` variables securely in the platform dashboard.

## 📂 Project Structure Overview

```text
├── backend/
│   ├── routes/           # API Endpoints (auth, jobs, applications, messaging, etc.)
│   ├── middleware/       # JWT Auth, Rate Limiting, Error Handling
│   ├── services/         # Core business logic and Supabase integrations
│   ├── database.js       # Database initialization and migrations
│   └── server.js         # Express App Entry Point
├── frontend/
│   ├── src/
│   │   ├── components/   # Reusable UI elements (Buttons, Cards, Modals)
│   │   ├── pages/        # Core Views (Home, Dashboards, JobListing, Login)
│   │   ├── context/      # React Context (Auth State, Theme, Notifications)
│   │   └── utils/        # API Axios instances and helper functions
│   └── public/           # Static assets and icons
└── docker-compose.yml    # Docker orchestration
```

## 🔒 Security Measures
* Passwords are securely hashed using `bcryptjs`.
* API endpoints are protected using JWT authorization middlewares.
* Protection against common web vulnerabilities via `helmet`.
* Rate limiting prevents brute-force attacks and API abuse.

---

<div align="center">
  <p>Built with ❤️ by Vishwas Ahuja</p>
</div>
