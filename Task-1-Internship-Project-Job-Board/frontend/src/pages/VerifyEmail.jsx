import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { CheckCircle, XCircle, Loader } from 'lucide-react';
import { apiGet } from '../utils/api';

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [status, setStatus] = useState('verifying');

  useEffect(() => {
    if (!token) { setStatus('invalid'); return; }
    apiGet(`/verification/verify?token=${token}`)
      .then(() => setStatus('success'))
      .catch(() => setStatus('error'));
  }, [token]);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', background: '#020617' }}>
      <div className="card glass" style={{ maxWidth: 440, width: '100%', padding: '2.5rem', textAlign: 'center' }}>
        {status === 'verifying' && <><Loader size={48} color="#818cf8" style={{ marginBottom: '1rem' }} /><h2 style={{ color: 'white' }}>Verifying your email...</h2></>}
        {status === 'success' && <><CheckCircle size={48} color="#34d399" style={{ marginBottom: '1rem' }} /><h2 style={{ color: 'white', marginBottom: '0.5rem' }}>Email Verified!</h2><p style={{ color: '#94a3b8', marginBottom: '1.5rem' }}>Your email has been verified successfully.</p><Link to="/login" style={{ color: '#818cf8', textDecoration: 'none', fontWeight: 600 }}>Login Now</Link></>}
        {status === 'error' && <><XCircle size={48} color="#f87171" style={{ marginBottom: '1rem' }} /><h2 style={{ color: 'white', marginBottom: '0.5rem' }}>Verification Failed</h2><p style={{ color: '#94a3b8', marginBottom: '1.5rem' }}>The verification link is invalid or expired.</p><Link to="/login" style={{ color: '#818cf8', textDecoration: 'none' }}>Back to Login</Link></>}
        {status === 'invalid' && <><XCircle size={48} color="#f87171" style={{ marginBottom: '1rem' }} /><h2 style={{ color: 'white', marginBottom: '0.5rem' }}>Invalid Link</h2><p style={{ color: '#94a3b8', marginBottom: '1.5rem' }}>No verification token provided.</p><Link to="/login" style={{ color: '#818cf8', textDecoration: 'none' }}>Back to Login</Link></>}
      </div>
    </div>
  );
}
