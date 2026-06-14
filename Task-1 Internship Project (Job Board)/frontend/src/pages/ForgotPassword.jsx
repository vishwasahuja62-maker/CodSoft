import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Mail, Lock, CheckCircle, ShieldCheck, KeyRound } from 'lucide-react';
import { apiPost } from '../utils/api';

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const passwordStrength = (pwd) => {
    if (!pwd) return { label: '', color: 'transparent', width: '0%' };
    if (pwd.length < 6) return { label: 'Too short', color: '#f87171', width: '20%' };
    if (pwd.length < 8) return { label: 'Weak', color: '#fb923c', width: '40%' };
    if (!/[A-Z]/.test(pwd) || !/[0-9]/.test(pwd)) return { label: 'Fair', color: '#facc15', width: '65%' };
    return { label: 'Strong', color: '#34d399', width: '100%' };
  };

  const strength = passwordStrength(newPassword);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (newPassword.length < 6) return setError('Password must be at least 6 characters.');
    if (newPassword !== confirmPassword) return setError('Passwords do not match.');
    setLoading(true);
    try {
      await apiPost('/password/reset-direct', { email, newPassword });
      setDone(true);
    } catch (err) {
      setError(err.message || 'No account found with that email address.');
    }
    setLoading(false);
  };

  if (done) {
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
          initial={{ scale: 0.85, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, type: 'spring' }}
          className="glass auth-card"
          style={{ position: 'relative', overflow: 'visible', textAlign: 'center' }}
        >
          <div style={{
            position: 'absolute', top: '-1px', left: '20%', right: '20%', height: '2px',
            background: 'linear-gradient(90deg, transparent, #34d399, #818cf8, transparent)',
            borderRadius: '2px'
          }}></div>

          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            style={{
              width: 80, height: 80, borderRadius: '50%',
              background: 'linear-gradient(135deg, rgba(52,211,153,0.2), rgba(129,140,248,0.2))',
              border: '2px solid rgba(52,211,153,0.4)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 1.5rem'
            }}
          >
            <CheckCircle size={36} color="#34d399" />
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.5rem' }}
          >
            Password Updated!
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
            style={{ color: '#94a3b8', marginBottom: '2rem', lineHeight: 1.6 }}
          >
            Your password has been reset successfully.<br />You can now sign in with your new password.
          </motion.p>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/login')}
            className="btn btn-primary"
            style={{ width: '100%', padding: '1rem', fontSize: '1.05rem', borderRadius: '14px' }}
          >
            <ShieldCheck size={18} /> Go to Sign In
          </motion.button>
        </motion.div>
      </div>
    );
  }

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
          onClick={() => navigate('/login')}
          style={{ width: 'fit-content', marginBottom: '2rem', padding: '0.5rem 1rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
        >
          <ArrowLeft size={14} />
          <span style={{ color: '#cbd5e1' }}>Back to Login</span>
        </button>

        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '10px',
            background: 'rgba(129,140,248,0.1)', border: '1px solid rgba(129,140,248,0.2)',
            borderRadius: '30px', padding: '6px 16px', marginBottom: '1.25rem'
          }}>
            <KeyRound size={14} color="#818cf8" />
            <span style={{ color: '#818cf8', fontSize: '0.8rem', fontWeight: 600 }}>Password Reset</span>
          </div>
          <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.5rem' }}>Set New Password</h2>
          <p style={{ color: '#94a3b8', marginBottom: '2rem' }}>Enter your email and choose a strong new password.</p>
        </motion.div>

        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              style={{ background: 'rgba(248,113,113,0.1)', color: '#f87171', padding: '1rem', borderRadius: '12px', marginBottom: '1.5rem', border: '1px solid rgba(248,113,113,0.2)', fontSize: '0.9rem' }}
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>

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

          <div className="form-group">
            <label className="form-label"><Lock size={14} /> New Password</label>
            <input
              type="password"
              className="premium-input-field"
              placeholder="Min. 6 characters"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              minLength={6}
              required
              disabled={loading}
            />
            {newPassword && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ marginTop: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Strength</span>
                  <span style={{ fontSize: '0.75rem', color: strength.color, fontWeight: 600 }}>{strength.label}</span>
                </div>
                <div style={{ height: '4px', borderRadius: '4px', background: 'rgba(255,255,255,0.08)', overflow: 'hidden' }}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: strength.width }}
                    transition={{ duration: 0.3 }}
                    style={{ height: '100%', background: strength.color, borderRadius: '4px' }}
                  />
                </div>
              </motion.div>
            )}
          </div>

          <div className="form-group" style={{ marginBottom: '2rem' }}>
            <label className="form-label"><Lock size={14} /> Confirm New Password</label>
            <input
              type="password"
              className="premium-input-field"
              placeholder="Repeat your new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              minLength={6}
              required
              disabled={loading}
            />
            {confirmPassword && newPassword && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ marginTop: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                {newPassword === confirmPassword
                  ? <><CheckCircle size={13} color="#34d399" /><span style={{ fontSize: '0.75rem', color: '#34d399' }}>Passwords match</span></>
                  : <><span style={{ fontSize: '0.75rem', color: '#f87171' }}>✕ Passwords don't match</span></>
                }
              </motion.div>
            )}
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', padding: '1rem', fontSize: '1.05rem', borderRadius: '14px' }}
            disabled={loading}
          >
            {loading ? 'Updating Password...' : <><ShieldCheck size={18} /> Reset Password</>}
          </motion.button>
        </form>

        <motion.p
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
          style={{ textAlign: 'center', marginTop: '1.5rem', color: '#64748b' }}
        >
          Remember your password?{' '}
          <Link to="/login" style={{ color: '#a78bfa', fontWeight: 600, textDecoration: 'none' }}>Sign In</Link>
        </motion.p>
      </motion.div>
    </div>
  );
}
