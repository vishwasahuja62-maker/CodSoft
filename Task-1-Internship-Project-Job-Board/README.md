<!-- Logo and Title -->
<p align="left">
  <img src="App Logo.png" alt="ElevateHire Logo" width="80" align="left" style="margin-right: 20px;" />
  <h1 style="margin: 0;">ElevateHire - Next-Generation Job Board</h1>
  <p>A highly scalable, full-stack job board web application connecting top-tier talent with elite teams. Engineered with real-time features, AI-powered matching, and an intuitive Kanban hiring pipeline.</p>
</p>
<br clear="left"/>

<!-- Badges -->
<p align="left">
  <img src="https://img.shields.io/badge/React_19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" />
  <img src="https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white" alt="Node.js" />
  <img src="https://img.shields.io/badge/Express.js-404D59?style=for-the-badge" alt="Express.js" />
  <img src="https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white" alt="Supabase" />
  <img src="https://img.shields.io/badge/Socket.io-010101?style=for-the-badge&logo=socket.io&logoColor=white" alt="Socket.IO" />
  <img src="https://img.shields.io/badge/Docker-2CA5E0?style=for-the-badge&logo=docker&logoColor=white" alt="Docker" />
</p>

---

## 📑 Table of Contents

- [Overview](#-overview)
- [System Architecture](#-system-architecture)
- [Comprehensive Features](#-comprehensive-features)
- [Technology Stack](#-technology-stack)
- [Database Schema](#-database-schema)
- [Getting Started](#-getting-started)
- [Deployment & CI/CD](#-deployment--cicd)
- [API Reference](#-api-reference)
- [Security](#-security)

---

## 🚀 Overview

**ElevateHire** transforms the traditional recruitment process by integrating modern real-time communication protocols, robust Applicant Tracking Systems (ATS) features, and AI-assisted candidate evaluation algorithms into a single, cohesive platform. It is built to handle multiple user types (Candidates, Employers, and Admins) with strict access control and real-time state synchronization.

---

## 🏗 System Architecture

```mermaid
graph TD;
    Client[Web Client - React 19 / Vite] -->|HTTPS / REST API| Server[Node.js / Express Server];
    Client -->|WebSockets| SocketIO[Socket.IO Server];
    SocketIO <--> Server;
    Server -->|PostgreSQL / pg| Database[(Supabase DB)];
    Server -->|Multer| FileStorage[Local/Cloud Storage];
    Server -->|Resend / Nodemailer| Email[Email Service];
```

---

## 💎 Comprehensive Features

### 🏢 For Employers
- **Kanban-Style ATS Pipeline**: Visually drag and drop candidate applications across customizable hiring stages (e.g., Applied, Screening, Interviewing, Offered) using `@dnd-kit`.
- **Intelligent Candidate Matching**: AI-driven algorithms (`matching.js`) analyze and rank candidates based on job requirements and resume parsing.
- **Interview Scheduling Engine**: Propose, track, and confirm interview slots.
- **Advanced Job Management**: Create rich job descriptions, set required skills, configure salary ranges, and toggle visibility.
- **Data & Insights Dashboard**: Visualize application traffic, conversion rates, and hiring bottlenecks utilizing `Recharts`.

### 👨‍💻 For Candidates
- **Dynamic Profile & Portfolio**: Construct a detailed professional profile with secure resume storage and versioning (`documents.js`).
- **AI Skill Assessments**: Take automated technical and soft-skill assessments to boost profile visibility (`assessments.js`).
- **Real-Time Job Alerts**: Receive instant push notifications and emails when relevant jobs are posted (`alerts.js`).
- **Application Tracking**: Monitor real-time status changes of submitted applications.

### ⚡ Cross-Platform Capabilities
- **Real-Time Messaging**: Instant, low-latency communication between employers and candidates via `Socket.IO`.
- **Role-Based Access Control (RBAC)**: Distinct, isolated experiences and API access limits based on user role.

---

## 🛠 Technology Stack

| Category | Technologies | Description |
| :--- | :--- | :--- |
| **Frontend** | React 19, Vite, React Router v6 | High-performance SPA with rapid build times. |
| **UI / UX** | Framer Motion, Lucide Icons, Recharts | Micro-animations, SVG icons, and interactive data visualizations. |
| **State & Tools**| `@dnd-kit`, Socket.IO-Client | Robust drag-and-drop mechanics and WebSocket handling. |
| **Backend Core**| Node.js, Express.js | Event-driven, non-blocking I/O server architecture. |
| **Database** | PostgreSQL (via Supabase) | Relational data integrity with high-performance querying. |
| **Auth & Sec** | JWT, Bcryptjs, Helmet, Rate Limiter | Secure token-based auth, password hashing, and attack mitigation. |
| **Utilities** | Multer, Nodemailer, Resend, CSV-Parse | File stream handling, transactional emails, and data parsing. |

---

## 🗄 Project Structure

```text
├── backend/
│   ├── middleware/       # JWT verification, Role guards, Rate limiting, Error handling
│   ├── routes/           # REST API Endpoints 
│   │   ├── auth.js       # Authentication & Authorization
│   │   ├── jobs.js       # Job posting & retrieval logic
│   │   ├── applications.js # Kanban state management
│   │   ├── messages.js   # Chat history and WebSockets linking
│   │   └── ...           # (assessments, matching, insights, etc.)
│   ├── services/         # Decoupled business logic and external API integrations
│   ├── database.js       # Supabase client instantiation and pool management
│   └── server.js         # Express app initialization and Socket.IO binding
│
├── frontend/
│   ├── src/
│   │   ├── components/   # Atomic & Compound UI components (Cards, Modals, Navbars)
│   │   ├── context/      # Global state (AuthContext, ThemeContext, SocketContext)
│   │   ├── pages/        # View controllers (Dashboards, Job Listings, Landing Page)
│   │   └── utils/        # Axios interceptors, formatting helpers, custom hooks
│   └── public/           # Static uncompiled assets
│
└── docker-compose.yml    # Container orchestration blueprint
```

---

## 🚀 Getting Started

Follow these instructions to set up the project locally for development and testing.

### 1. Prerequisites
- **Node.js**: v18.0.0 or higher
- **Database**: A Supabase project (or local PostgreSQL instance)
- **Email Service**: Resend API Key (for transactional emails)

### 2. Environment Configuration
Create a `.env` file in the `/backend` directory:

```env
# Server Configuration
PORT=5001
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

# Authentication
JWT_SECRET=your_highly_secure_random_string_here

# Database (Supabase)
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_DATABASE_URL=postgresql://postgres:password@aws-0-region.pooler.supabase.com:5432/postgres

# External Services
RESEND_API_KEY=re_your_api_key
SMTP_FROM=onboarding@resend.dev
```

### 3. Installation & Execution

Open two terminal windows to run both environments simultaneously:

**Terminal 1: Backend API**
```bash
cd backend
npm install
npm run dev # Starts server with hot-reloading (nodemon/watch)
```

**Terminal 2: Frontend Client**
```bash
cd frontend
npm install
npm run dev # Starts Vite development server
```

Navigate to `http://localhost:5173` in your browser.

---

## 🚢 Deployment & CI/CD

ElevateHire is built with containerization in mind, making it cloud-agnostic and easy to deploy to any modern PAAS or IAAS provider.

### Using Docker (Recommended for Production)
The included `docker-compose.yml` file defines the entire service architecture.

```bash
# Build and start all services in detached mode
docker-compose up --build -d
```
- The API will be exposed on port `5000`.
- The frontend will be served via Nginx on port `80`.

### Alternative Cloud Deployment
- **Frontend**: Deploy the `/frontend` directory to **Vercel** or **Netlify**. Ensure you set the `VITE_API_URL` build environment variable.
- **Backend**: Deploy the `/backend` directory to **Render**, **Railway**, or **Heroku**. Ensure all `.env` variables are configured in the platform's dashboard.

---

## 🔐 Security Measures

- **Data Protection**: All sensitive user data and passwords are encrypted using `bcryptjs` with salt rounds.
- **API Protection**: Endpoints are protected via `express-rate-limit` to prevent brute-force and DDoS attacks.
- **Headers**: HTTP headers are secured using `helmet` to mitigate XSS and clickjacking.
- **Authorization**: Stateless `JWT` tokens with short expiration times ensure secure and scalable session management. Route middlewares actively verify user roles (Admin vs Employer vs Candidate) before processing transactions.

---

<div align="center">
  <p>Engineered with ❤️ by <b>Vishwas Ahuja</b></p>
</div>
