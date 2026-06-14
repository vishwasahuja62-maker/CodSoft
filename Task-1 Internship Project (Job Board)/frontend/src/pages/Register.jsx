import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { ArrowLeft, UserPlus, Briefcase, Users, Mail, Lock, User as UserIcon } from 'lucide-react';


export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('candidate');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await register(email, password, role, name);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Registration failed.');
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
          <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.5rem' }}>Create Account</h2>
          <p style={{ color: '#94a3b8', marginBottom: '2rem' }}>Set up your professional workspace in 30 seconds.</p>
        </motion.div>

        {error && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} style={{ background: 'rgba(248, 113, 113, 0.1)', color: '#f87171', padding: '1rem', borderRadius: '12px', marginBottom: '1.5rem', border: '1px solid rgba(248, 113, 113, 0.2)' }}>
                {error}
            </motion.div>
        )}

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '2rem', background: 'rgba(0,0,0,0.2)', padding: '0.25rem', borderRadius: '14px' }}>
            <motion.button
              type="button"
              whileTap={{ scale: 0.97 }}
              style={{ padding: '0.75rem', borderRadius: '10px', border: 'none', background: role === 'candidate' ? 'linear-gradient(135deg, rgba(129, 140, 248, 0.2), rgba(192, 132, 252, 0.2))' : 'transparent', color: role === 'candidate' ? 'white' : '#94a3b8', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', cursor: 'pointer', transition: 'all 0.3s ease', border: role === 'candidate' ? '1px solid rgba(129, 140, 248, 0.2)' : '1px solid transparent' }}
              onClick={() => setRole('candidate')}
              disabled={loading}
            >
              <Users size={16} /> Job Seeker
            </motion.button>
            <motion.button
              type="button"
              whileTap={{ scale: 0.97 }}
              style={{ padding: '0.75rem', borderRadius: '10px', border: 'none', background: role === 'employer' ? 'linear-gradient(135deg, rgba(129, 140, 248, 0.2), rgba(192, 132, 252, 0.2))' : 'transparent', color: role === 'employer' ? 'white' : '#94a3b8', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', cursor: 'pointer', transition: 'all 0.3s ease', border: role === 'employer' ? '1px solid rgba(129, 140, 248, 0.2)' : '1px solid transparent' }}
              onClick={() => setRole('employer')}
              disabled={loading}
            >
              <Briefcase size={16} /> Employer
            </motion.button>
        </motion.div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label"><UserIcon size={14} /> {role === 'employer' ? 'Company Name' : 'Full Name'}</label>
            <input
              type="text"
              className="premium-input-field"
              placeholder={role === 'employer' ? 'e.g. Stripe Solutions' : 'e.g. Alex Mercer'}
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              disabled={loading}
            />
          </div>

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
              placeholder="Min. 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength="6"
              required
              disabled={loading}
            />
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', padding: '1rem', fontSize: '1.05rem', borderRadius: '14px' }}
            disabled={loading}
          >
            {loading ? 'Creating account...' : <><UserPlus size={18} /> Create Account</>}
          </motion.button>
        </form>



        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} style={{ textAlign: 'center', marginTop: '1.5rem', color: '#64748b' }}>
          Already registered?{' '}
          <Link to="/login" style={{ color: '#a78bfa', fontWeight: 600, textDecoration: 'none' }}>Sign in</Link>
        </motion.p>
      </motion.div>
    </div>
  );
}
