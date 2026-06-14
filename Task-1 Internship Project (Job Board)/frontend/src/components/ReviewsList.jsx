import React from 'react';
import { Star, ThumbsUp, ThumbsDown } from 'lucide-react';

export default function ReviewsList({ reviews }) {
  if (!reviews || !reviews.length) return <p style={{ color: '#64748b', textAlign: 'center', padding: '2rem' }}>No reviews yet. Be the first!</p>;

  return (
    <div>
      {reviews.map(r => (
        <div key={r.id} style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)', padding: '1.25rem', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <div style={{ display: 'flex', gap: '4px' }}>{[1,2,3,4,5].map(n => <Star key={n} size={14} fill={n <= r.rating ? '#fbbf24' : 'none'} color={n <= r.rating ? '#fbbf24' : '#475569'} />)}</div>
            <span style={{ color: '#64748b', fontSize: '0.8rem' }}>{r.user_name}</span>
          </div>
          {r.title && <h4 style={{ color: 'white', marginBottom: '6px', fontSize: '1rem' }}>{r.title}</h4>}
          <p style={{ color: '#cbd5e1', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '8px' }}>{r.review}</p>
          <div style={{ display: 'flex', gap: '1rem', fontSize: '0.85rem' }}>
            {r.pros && <span style={{ color: '#34d399', display: 'flex', alignItems: 'center', gap: '4px' }}><ThumbsUp size={14} /> {r.pros}</span>}
            {r.cons && <span style={{ color: '#f87171', display: 'flex', alignItems: 'center', gap: '4px' }}><ThumbsDown size={14} /> {r.cons}</span>}
          </div>
        </div>
      ))}
    </div>
  );
}
