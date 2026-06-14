import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/ToastProvider';
import { apiPost } from '../utils/api';
import { MapPin, Calendar, ArrowUpRight, Bookmark, IndianRupee } from 'lucide-react';
import { FeaturedBadge } from './JobFeatures';

export default function JobCard({ job, isInitiallyBookmarked = false, onBookmarkRemove, style = {} }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToast } = useToast();
  const [isBookmarked, setIsBookmarked] = useState(isInitiallyBookmarked);

  useEffect(() => {
    setIsBookmarked(isInitiallyBookmarked);
  }, [isInitiallyBookmarked]);

  const handleCardClick = () => {
    navigate(`/jobs/${job.id}`);
  };

  const toggleBookmark = async (e) => {
    e.stopPropagation();
    
    if (!user || user.role !== 'candidate') {
      addToast('Please login as a job seeker to save roles.', 'error');
      return;
    }
    
    try {
      const res = await apiPost(`/bookmarks/${job.id}`);
      setIsBookmarked(res.bookmarked);
      if (res.bookmarked) {
         addToast('Role saved to your bookmarks!', 'success');
      } else {
         addToast('Role removed from bookmarks.', 'success');
         if (onBookmarkRemove) onBookmarkRemove(job.id);
      }
    } catch (err) {
      addToast('Failed to update bookmark.', 'error');
    }
  };

  const getInitials = (name) => {
    if (!name) return 'C';
    const parts = name.split(' ');
    if (parts.length > 1) return (parts[0][0] + parts[1][0]).toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Just now';
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  };

  const isNew = () => {
    if (!job.created_at) return false;
    const diffDays = Math.floor((new Date() - new Date(job.created_at)) / (1000 * 60 * 60 * 24));
    return diffDays <= 3;
  };

  return (
    <div className="job-card" onClick={handleCardClick} style={style}>
      <div className="card-shine"></div>

      <div className="company-logo-avatar">
        {getInitials(job.company_name)}
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px' }}>
          <div style={{ minWidth: 0 }}>
            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: 'white', lineHeight: 1.3, marginBottom: '2px' }}>{job.title}</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
              <span style={{ fontWeight: 600, color: '#a78bfa', fontSize: '0.85rem' }}>{job.company_name}</span>
              {isNew() && (
                <span style={{ background: 'linear-gradient(135deg, #10b981, #059669)', color: 'white', padding: '1px 6px', borderRadius: '100px', fontSize: '0.55rem', fontWeight: 800, letterSpacing: '0.3px' }}>NEW</span>
              )}
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
            <button
              onClick={toggleBookmark}
              style={{ background: 'transparent', border: 'none', color: isBookmarked ? '#fbbf24' : '#334155', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '4px', borderRadius: '6px', transition: 'all 0.2s' }}
            >
               <Bookmark size={16} fill={isBookmarked ? '#fbbf24' : 'none'} strokeWidth={2} />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); navigate(`/jobs/${job.id}`); }}
              style={{ background: 'transparent', border: 'none', color: '#475569', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '4px', borderRadius: '6px', transition: 'all 0.2s' }}
            >
              <ArrowUpRight size={16} />
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '2px', flexWrap: 'wrap', marginTop: '8px' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '3px', padding: '2px 8px', background: 'rgba(255,255,255,0.03)', borderRadius: '6px' }}>
            <MapPin size={11} /> {job.location}
          </span>
          {job.salary_range && (
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '3px', padding: '2px 8px', background: 'rgba(255,255,255,0.03)', borderRadius: '6px' }}>
              <IndianRupee size={11} /> {job.salary_range}
            </span>
          )}
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '3px', padding: '2px 8px', background: 'rgba(255,255,255,0.03)', borderRadius: '6px' }}>
            <Calendar size={11} /> {formatDate(job.created_at)}
          </span>
          {job.type && (
            <span style={{ fontSize: '0.7rem', color: '#64748b', padding: '2px 8px', background: 'rgba(100,116,139,0.08)', borderRadius: '6px' }}>{job.type}</span>
          )}
          {job.experience_level && (
            <span style={{ fontSize: '0.7rem', color: '#64748b', padding: '2px 8px', background: 'rgba(100,116,139,0.08)', borderRadius: '6px' }}>{job.experience_level}</span>
          )}
          {job.is_featured === 1 && <FeaturedBadge />}
        </div>
      </div>
    </div>
  );
}
