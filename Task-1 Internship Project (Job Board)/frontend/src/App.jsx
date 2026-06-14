import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './components/ToastProvider';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';

// Pages
import Home from './pages/Home';
import JobListings from './pages/JobListings';
import JobDetail from './pages/JobDetail';
import Login from './pages/Login';
import Register from './pages/Register';
import CandidateDashboard from './pages/CandidateDashboard';
import EmployerDashboard from './pages/EmployerDashboard';
import CompanyProfile from './pages/CompanyProfile';
import NotFound from './pages/NotFound';
import AdminDashboard from './pages/AdminDashboard';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import VerifyEmail from './pages/VerifyEmail';
import About from './pages/About';
import Careers from './pages/Careers';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';

// Dashboard router switch based on User role
function DashboardRedirect() {
  const { user } = useAuth();

  if (user?.role === 'admin') {
    return <Navigate to="/admin" replace />;
  }
  if (user?.role === 'employer') {
    return <EmployerDashboard />;
  }
  return <CandidateDashboard />;
}

// ─── Page Transition: 3D Perspective Tunnel ───
const pageVariants = {
  initial: {
    opacity: 0,
    x: '-100vw',
    scale: 0.5,
    rotateY: -45,
    filter: 'blur(30px)',
    transformPerspective: 1500,
  },
  animate: {
    opacity: 1,
    x: 0,
    scale: 1,
    rotateY: 0,
    filter: 'blur(0px)',
    transformPerspective: 1500,
    transition: {
      duration: 1.0,
      type: "spring",
      stiffness: 80,
      damping: 12,
      mass: 1.2,
    }
  },
  exit: {
    opacity: 0,
    x: '100vw',
    scale: 0.5,
    rotateY: 45,
    filter: 'blur(30px)',
    transformPerspective: 1500,
    transition: {
      duration: 0.6,
      ease: "easeInOut"
    }
  },
};

const pageTrans = {
  duration: 0.8,
};

const PageTransition = ({ children }) => (
  <motion.div
    variants={pageVariants}
    initial="initial"
    animate="animate"
    exit="exit"
    transition={pageTrans}
    className="page-transition"
    style={{ backfaceVisibility: 'hidden', transformStyle: 'preserve-3d' }}
  >
    {children}
  </motion.div>
);

// ─── Glow + vignette pulse during page flip ───
function TransitionOverlays() {
  const location = useLocation();
  const [phase, setPhase] = useState('idle');
  const t1 = useRef(null);
  const t2 = useRef(null);

  useEffect(() => {
    setPhase('peak');
    clearTimeout(t1.current); clearTimeout(t2.current);
    t1.current = setTimeout(() => setPhase('fade'), 180);
    t2.current = setTimeout(() => setPhase('idle'), 450);
    return () => { clearTimeout(t1.current); clearTimeout(t2.current); };
  }, [location.pathname]);

  const anim = phase === 'idle' ? { opacity: 0 } :
    phase === 'peak' ? { opacity: 1 } :
      { opacity: 0 };

  return (
    <>
      <motion.div
        animate={anim}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        style={{
          position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none',
          background: 'radial-gradient(ellipse at 50% 35%, rgba(129,140,248,0.12), transparent 55%)',
        }}
      />
      <motion.div
        animate={anim}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        style={{
          position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none',
          background: 'radial-gradient(ellipse at 50% 50%, transparent 60%, rgba(2,6,23,0.4) 100%)',
        }}
      />
    </>
  );
}



function AppContent() {
  const location = useLocation();
  const isDashboard = location.pathname === '/dashboard' || location.pathname === '/admin' || location.pathname.startsWith('/dashboard/') || location.pathname.startsWith('/admin/');

  return (
    <div className="app-wrapper" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', overflowX: 'hidden' }}>

      <ScrollToTop />
      <Navbar />
      <main className="main-content" style={{ flex: 1, display: 'flex', flexDirection: 'column', perspective: 1200 }}>
        <TransitionOverlays />
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<PageTransition><Home /></PageTransition>} />
            <Route path="/jobs" element={<PageTransition><JobListings /></PageTransition>} />
            <Route path="/jobs/:id" element={<PageTransition><JobDetail /></PageTransition>} />
            <Route path="/login" element={<PageTransition><Login /></PageTransition>} />
            <Route path="/register" element={<PageTransition><Register /></PageTransition>} />
            <Route path="/company/:id" element={<PageTransition><CompanyProfile /></PageTransition>} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <PageTransition><DashboardRedirect /></PageTransition>
                </ProtectedRoute>
              }
            />
            <Route path="/forgot-password" element={<PageTransition><ForgotPassword /></PageTransition>} />
            <Route path="/reset-password" element={<PageTransition><ResetPassword /></PageTransition>} />
            <Route path="/verify-email" element={<VerifyEmail />} />
            <Route path="/admin" element={<ProtectedRoute><PageTransition><AdminDashboard /></PageTransition></ProtectedRoute>} />
            <Route path="/about" element={<PageTransition><About /></PageTransition>} />
            <Route path="/careers" element={<PageTransition><Careers /></PageTransition>} />
            <Route path="/privacy" element={<PageTransition><Privacy /></PageTransition>} />
            <Route path="/terms" element={<PageTransition><Terms /></PageTransition>} />
            {/* 404 Route */}
            <Route path="*" element={<PageTransition><NotFound /></PageTransition>} />
          </Routes>
        </AnimatePresence>
      </main>
      {!isDashboard && <Footer />}
    </div>
  );
}

import { ThemeProvider } from './context/ThemeContext';

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ToastProvider>
          <Router>
            <AppContent />
          </Router>
        </ToastProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
