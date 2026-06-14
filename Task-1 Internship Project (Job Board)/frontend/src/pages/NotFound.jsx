import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Search } from 'lucide-react';

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="landing-container">
      <div className="bg-blobs">
        <div className="bg-glow-1"></div>
        <div className="bg-glow-2"></div>
      </div>
      
      <div className="not-found-container">
        <div className="rocket-container">
          <div className="rocket">🚀</div>
          <div className="rocket-trail"></div>
        </div>
        
        <h1 className="not-found-code">404</h1>
        <h2 className="not-found-title">Lost in Space</h2>
        <p className="not-found-desc">
          We've explored the entire platform, but we couldn't find the page you're looking for. 
          It might have been moved, deleted, or perhaps it never existed in this dimension.
        </p>
        
        <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
          <button className="btn btn-outline" onClick={() => navigate('/')}>
            <ArrowLeft size={18} />
            Back to Earth
          </button>
          <button className="btn btn-primary" onClick={() => navigate('/jobs')}>
            <Search size={18} />
            Find Real Jobs
          </button>
        </div>
      </div>
    </div>
  );
}
