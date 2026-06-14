const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const { initDatabase } = require('./database');
const chatSocket = require('./services/chatSocket');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// Security headers
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));

// Dynamic CORS origin
const allowedOrigins = [
  'http://localhost:5173',
  process.env.FRONTEND_URL,
].filter(Boolean);
app.use(cors({
  origin: allowedOrigins,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Rate limiting — generous limits for development; the dashboard makes ~15+ calls per load
const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 300,
  message: { error: 'Too many requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});
const authLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  message: { error: 'Too many login attempts, please try again later.' },
});
app.use('/api', apiLimiter);
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

// Body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Audit logging middleware
app.use('/api', (req, res, next) => {
  const originalJson = res.json.bind(res);
  res.json = function (body) {
    if (req.user && req.method !== 'GET') {
      const { dbRun } = require('./database');
      dbRun(
        'INSERT INTO audit_logs (user_id, method, path, status_code) VALUES ($1, $2, $3, $4)',
        [req.user.id, req.method, req.originalUrl, res.statusCode]
      ).catch(() => {});
    }
    return originalJson(body);
  };
  next();
});

// Serve static upload files (resumes)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Route mappings (defined before async init so they're ready)
app.use('/api/auth', require('./routes/auth'));
app.use('/api/profiles', require('./routes/profiles'));
app.use('/api/jobs', require('./routes/jobs'));
app.use('/api/applications', require('./routes/applications'));
app.use('/api/dashboard', require('./routes/dashboard'));
app.use('/api/bookmarks', require('./routes/bookmarks'));
app.use('/api/messages', require('./routes/messages'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/documents', require('./routes/documents'));
app.use('/api/insights', require('./routes/insights'));
app.use('/api/settings', require('./routes/settings'));
app.use('/api/alerts', require('./routes/alerts'));
app.use('/api/interviews', require('./routes/interviews'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/matching', require('./routes/matching'));
app.use('/api/assessments', require('./routes/assessments'));
app.use('/api/resumes', require('./routes/resumes'));
app.use('/api/password', require('./routes/password'));
app.use('/api/verification', require('./routes/verification'));
app.use('/api/reviews', require('./routes/reviews'));
app.use('/api/searches', require('./routes/searches'));
app.use('/api/offers', require('./routes/offers'));
app.use('/api/bulk', require('./routes/bulk'));

// Serve frontend static files in production
const frontendDist = path.join(__dirname, '..', 'frontend', 'dist');
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(frontendDist));
}

// Basic health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ message: 'Job Board Backend API is running smoothly.' });
});

// SPA fallback — must be after all API routes
if (process.env.NODE_ENV === 'production') {
  app.get('*', (req, res) => {
    res.sendFile(path.join(frontendDist, 'index.html'));
  });
}

// Initialize database schema (async), then start server
async function start() {
  try {
    await initDatabase();
    const server = app.listen(PORT, () => {
      console.log(`🚀 Server started on port ${PORT}`);
      console.log(`📂 Uploads directory: ${path.join(__dirname, 'uploads')}`);
      console.log(`📧 Emails preview directory: ${path.join(__dirname, 'temp_emails')}`);
      console.log(`🗄️  Database: Supabase (PostgreSQL)`);
    });
    chatSocket(server);
  } catch (err) {
    console.error('Failed to initialize database:', err.message);
    process.exit(1);
  }
}

start();
