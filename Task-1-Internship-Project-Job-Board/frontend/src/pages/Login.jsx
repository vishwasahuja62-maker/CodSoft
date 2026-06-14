import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { ArrowLeft, LogIn, Mail, Lock } from 'lucide-react';


export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const from = location.state?.from?.pathname || '/dashboard';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message || 'Incorrect email or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="landing-container auth-container">
      <div className="bg-blobs">
          <div className="bg-glow-1"></div>
          <div className="bg-glow-2"></div>
          <div className="bg-glow-3"></div>
          <div className="bg-noise"></div>
          <div className="bg-lines"></div>
      </div>

      <motion.div 
        initial={{ y: 50, opacity: 0, scale: 0.95 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="glass auth-card"
        style={{ position: 'relative', overflow: 'visible' }}
      >
        <div style={{
          position: 'absolute', top: '-1px', left: '20%', right: '20%', height: '2px',
          background: 'linear-gradient(90deg, transparent, #818cf8, #c084fc, transparent)',
          borderRadius: '2px'
        }}></div>

        <button
            className="btn btn-secondary btn-sm"
            onClick={() => navigate('/')}
            style={{ width: 'fit-content', marginBottom: '2rem', padding: '0.5rem 1rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
        >
            <ArrowLeft size={14} />
            <span style={{ color: '#cbd5e1' }}>Home</span>
        </button>

        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
          <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.5rem' }}>Welcome Back</h2>
          <p style={{ color: '#94a3b8', marginBottom: '2rem' }}>Pick up right where you left off in your professional journey.</p>
        </motion.div>

        {error && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} style={{ background: 'rgba(248, 113, 113, 0.1)', color: '#f87171', padding: '1rem', borderRadius: '12px', marginBottom: '1.5rem', border: '1px solid rgba(248, 113, 113, 0.2)' }}>
                {error}
            </motion.div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label"><Mail size={14} /> Email Address</label>
            <input
              type="email"
              className="premium-input-field"
              placeholder="you@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <div className="form-group" style={{ marginBottom: '2rem' }}>
            <label className="form-label"><Lock size={14} /> Password</label>
            <input
              type="password"
              className="premium-input-field"
              placeholder="••••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <div style={{ textAlign: 'right', marginBottom: '0.75rem' }}>
            <Link to="/forgot-password" style={{ color: '#818cf8', fontSize: '0.88rem', textDecoration: 'none' }}>Forgot password?</Link>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', padding: '1rem', fontSize: '1.05rem', borderRadius: '14px' }}
            disabled={loading}
          >
            {loading ? 'Authenticating...' : <><LogIn size={18} /> Sign In</>}
          </motion.button>
        </form>



        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} style={{ textAlign: 'center', marginTop: '1.5rem', color: '#64748b' }}>
          Don't have an account?{' '}
          <Link to="/register" style={{ color: '#a78bfa', fontWeight: 600, textDecoration: 'none' }}>Get Started</Link>
        </motion.p>
      </motion.div>
    </div>
  );
}
