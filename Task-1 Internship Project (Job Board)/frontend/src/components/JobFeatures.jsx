import React from 'react';
import { Star, MapPin, Briefcase, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

const styles = {
  badge: {
    display: 'inline-flex', alignItems: 'center', gap: '4px',
    background: 'linear-gradient(135deg, #fbbf24, #f59e0b)', color: '#1e293b',
    padding: '2px 10px', borderRadius: '20px', fontSize: '0.7rem', fontWeight: 700,
    textTransform: 'uppercase', letterSpacing: '0.5px',
  },
  score: (value) => ({
    display: 'inline-flex', alignItems: 'center', gap: '3px',
    padding: '1px 8px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 600,
    background: value >= 80 ? 'rgba(52,211,153,0.15)' : value >= 50 ? 'rgba(251,191,36,0.15)' : 'rgba(248,113,113,0.15)',
    color: value >= 80 ? '#34d399' : value >= 50 ? '#fbbf24' : '#f87171',
  }),
  shareBtn: {
    background: 'none', border: '1px solid rgba(255,255,255,0.15)', color: '#94a3b8',
    padding: '6px 12px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.8rem',
    display: 'inline-flex', alignItems: 'center', gap: '4px',
    transition: 'all 0.15s',
  },
};

export function FeaturedBadge() {
  return <span style={styles.badge}><Star size={10} /> Featured</span>;
}

export function MatchScore({ score }) {
  if (score === undefined || score === null) return null;
  return <span style={styles.score(score)}><Star size={12} /> {score}% match</span>;
}

export function ShareButtons({ job }) {
  const url = window.location.origin + '/jobs/' + job?.id;
  const text = `Check out this job: ${job?.title} at ${job?.company_name}`;
  const copyLink = () => navigator.clipboard.writeText(url).then(() => alert('Link copied!'));

  return (
    <div style={{ display: 'flex', gap: '8px', marginTop: '1rem' }}>
      <button style={styles.shareBtn} onClick={copyLink}><Briefcase size={14} /> Copy Link</button>
      <button style={styles.shareBtn} onClick={() => window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`)}>X</button>
      <button style={styles.shareBtn} onClick={() => window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`)}>LinkedIn</button>
      <button style={styles.shareBtn} onClick={() => window.open(`mailto:?subject=${encodeURIComponent(text)}&body=${encodeURIComponent(url)}`)}>Email</button>
    </div>
  );
}

export function SavedSearchBadge({ count }) {
  if (!count) return null;
  return <span style={{ background: 'rgba(129,140,248,0.15)', color: '#818cf8', padding: '2px 8px', borderRadius: '10px', fontSize: '0.75rem', fontWeight: 600 }}>{count} saved</span>;
}
