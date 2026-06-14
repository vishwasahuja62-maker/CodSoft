import React, { useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Lock, CheckCircle, XCircle } from 'lucide-react';
import { apiPost } from '../utils/api';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  if (!token) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', background: '#020617' }}>
        <div className="card glass" style={{ maxWidth: 440, width: '100%', padding: '2.5rem', textAlign: 'center' }}>
          <XCircle size={48} color="#f87171" style={{ marginBottom: '1rem' }} />
          <h2 style={{ color: 'white', marginBottom: '0.5rem' }}>Invalid Link</h2>
          <p style={{ color: '#94a3b8', marginBottom: '1.5rem' }}>This reset link is invalid or expired.</p>
          <Link to="/forgot-password" style={{ color: '#818cf8', textDecoration: 'none' }}>Request a new link</Link>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirm) return setError('Passwords do not match');
    if (password.length < 6) return setError('Password must be at least 6 characters');
    setLoading(true);
    setError('');
    try {
      await apiPost('/password/reset', { token, password });
      setDone(true);
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  if (done) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', background: '#020617' }}>
        <div className="card glass" style={{ maxWidth: 440, width: '100%', padding: '2.5rem', textAlign: 'center' }}>
          <CheckCircle size={48} color="#34d399" style={{ marginBottom: '1rem' }} />
          <h2 style={{ color: 'white', marginBottom: '0.5rem' }}>Password Reset!</h2>
          <p style={{ color: '#94a3b8', marginBottom: '1.5rem' }}>Your password has been updated successfully.</p>
          <Link to="/login" style={{ color: '#818cf8', textDecoration: 'none', fontWeight: 600 }}>Login Now</Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', background: '#020617' }}>
      <div className="card glass" style={{ maxWidth: 440, width: '100%', padding: '2.5rem' }}>
        <h2 style={{ color: 'white', marginBottom: '0.5rem' }}>Reset Password</h2>
        <p style={{ color: '#94a3b8', marginBottom: '2rem', fontSize: '0.9rem' }}>Enter your new password.</p>
        {error && <div style={{ background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.3)', color: '#f87171', padding: '12px', borderRadius: '10px', marginBottom: '1rem', fontSize: '0.9rem' }}>{error}</div>}
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', color: '#cbd5e1', marginBottom: '6px', fontSize: '0.85rem', fontWeight: 600 }}>New Password</label>
            <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', padding: '0 14px' }}>
              <Lock size={18} color="#64748b" />
              <input type="password" required value={password} onChange={e => setPassword(e.target.value)} placeholder="Min 6 characters" style={{ width: '100%', padding: '12px 14px', background: 'none', border: 'none', color: 'white', outline: 'none', fontSize: '0.9rem' }} />
            </div>
          </div>
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', color: '#cbd5e1', marginBottom: '6px', fontSize: '0.85rem', fontWeight: 600 }}>Confirm Password</label>
            <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', padding: '0 14px' }}>
              <Lock size={18} color="#64748b" />
              <input type="password" required value={confirm} onChange={e => setConfirm(e.target.value)} placeholder="Re-enter password" style={{ width: '100%', padding: '12px 14px', background: 'none', border: 'none', color: 'white', outline: 'none', fontSize: '0.9rem' }} />
            </div>
          </div>
          <button type="submit" disabled={loading} style={{ width: '100%', padding: '14px', borderRadius: '10px', border: 'none', background: 'linear-gradient(135deg, #818cf8, #c084fc)', color: 'white', fontWeight: 600, fontSize: '1rem', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.6 : 1 }}>{loading ? 'Resetting...' : 'Reset Password'}</button>
        </form>
      </div>
    </div>
  );
}
