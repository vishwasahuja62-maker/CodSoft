import React from 'react';
import { CheckCircle, XCircle } from 'lucide-react';

export default function ProfileStrength({ profile }) {
  const checks = [
    { key: 'title', label: 'Professional title', weight: 15 },
    { key: 'bio', label: 'Bio/summary', weight: 15 },
    { key: 'skills', label: 'Skills added', weight: 20 },
    { key: 'experience', label: 'Experience', weight: 20 },
    { key: 'education', label: 'Education', weight: 15 },
    { key: 'resume_url', label: 'Resume uploaded', weight: 15 },
  ];
  const score = checks.reduce((sum, c) => {
    return sum + (profile && profile[c.key] ? c.weight : 0);
  }, 0);

  return (
    <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)', padding: '1.25rem', marginBottom: '1.5rem' }}>
      <h4 style={{ color: 'white', marginBottom: '0.75rem', fontSize: '1rem' }}>Profile Strength</h4>
      <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', marginBottom: '0.75rem', overflow: 'hidden' }}>
        <div style={{ width: `${score}%`, height: '100%', borderRadius: '4px', background: score >= 80 ? 'linear-gradient(90deg, #34d399, #10b981)' : score >= 50 ? 'linear-gradient(90deg, #fbbf24, #f59e0b)' : 'linear-gradient(90deg, #f87171, #ef4444)', transition: 'width 0.5s ease' }} />
      </div>
      <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '0.75rem' }}>{score}% complete</p>
      <div style={{ display: 'grid', gap: '6px' }}>
        {checks.map(c => {
          const done = profile && profile[c.key];
          return (
            <div key={c.key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: done ? '#34d399' : '#64748b' }}>
                {done ? <CheckCircle size={12} /> : <XCircle size={12} />} {c.label}
              </span>
              <span style={{ color: '#475569' }}>+{c.weight}%</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
