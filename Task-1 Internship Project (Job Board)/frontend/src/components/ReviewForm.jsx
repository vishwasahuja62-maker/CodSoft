import React, { useState } from 'react';
import { Star } from 'lucide-react';
import { apiPost } from '../utils/api';
import { useToast } from './ToastProvider';

export default function ReviewForm({ companyId, onSubmitted }) {
  const { addToast } = useToast();
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [title, setTitle] = useState('');
  const [review, setReview] = useState('');
  const [pros, setPros] = useState('');
  const [cons, setCons] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!rating || !review) return addToast('Rating and review text required', 'error');
    setLoading(true);
    try {
      await apiPost(`/reviews/company/${companyId}`, { rating, title, review, pros, cons });
      addToast('Review submitted for approval!', 'success');
      onSubmitted && onSubmitted();
    } catch (err) {
      addToast(err.message, 'error');
    }
    setLoading(false);
  };

  const btn = { padding: '10px 20px', borderRadius: '10px', border: 'none', fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.6 : 1, background: 'linear-gradient(135deg, #818cf8, #c084fc)', color: 'white' };

  return (
    <form onSubmit={handleSubmit} style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.08)', padding: '1.5rem', marginBottom: '2rem' }}>
      <h4 style={{ color: 'white', marginBottom: '1rem' }}>Write a Review</h4>
      <div style={{ display: 'flex', gap: '4px', marginBottom: '1rem' }}>
        {[1,2,3,4,5].map(n => (
          <button key={n} type="button" onClick={() => setRating(n)} onMouseEnter={() => setHover(n)} onMouseLeave={() => setHover(0)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
            <Star size={24} fill={(hover || rating) >= n ? '#fbbf24' : 'none'} color={(hover || rating) >= n ? '#fbbf24' : '#475569'} />
          </button>
        ))}
      </div>
      <input placeholder="Review title (optional)" value={title} onChange={e => setTitle(e.target.value)} style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.08)', color: 'white', outline: 'none', marginBottom: '0.75rem', fontSize: '0.9rem' }} />
      <textarea placeholder="Share your experience..." value={review} onChange={e => setReview(e.target.value)} required rows={4} style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.08)', color: 'white', outline: 'none', marginBottom: '0.75rem', fontSize: '0.9rem', resize: 'vertical' }} />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
        <input placeholder="Pros" value={pros} onChange={e => setPros(e.target.value)} style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.08)', color: 'white', outline: 'none', fontSize: '0.9rem' }} />
        <input placeholder="Cons" value={cons} onChange={e => setCons(e.target.value)} style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.08)', color: 'white', outline: 'none', fontSize: '0.9rem' }} />
      </div>
      <button type="submit" style={btn}>{loading ? 'Submitting...' : 'Submit Review'}</button>
    </form>
  );
}
