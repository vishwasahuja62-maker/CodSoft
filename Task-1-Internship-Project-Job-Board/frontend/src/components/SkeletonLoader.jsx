import React from 'react';

// Reusable animated skeleton line
export const SkeletonText = ({ type = 'md', style = {}, className = '' }) => {
  return <div className={`skeleton skeleton-text ${type} ${className}`} style={style}></div>;
};

// Reusable circular avatar skeleton
export const SkeletonAvatar = ({ size = 56, style = {}, className = '' }) => {
  return (
    <div 
      className={`skeleton skeleton-avatar ${className}`} 
      style={{ width: size, height: size, ...style }}
    ></div>
  );
};

// Reusable dashboard stat card skeleton
export const SkeletonCard = ({ className = '' }) => {
  return (
    <div className={`skeleton-card ${className}`}>
      <SkeletonAvatar size={52} style={{ marginBottom: '1rem', borderRadius: '16px', margin: '0 auto 1rem auto' }} />
      <SkeletonText type="lg" style={{ margin: '0 auto 0.5rem auto' }} />
      <SkeletonText type="sm" style={{ margin: '0 auto' }} />
    </div>
  );
};

// Reusable job listing card skeleton
export const SkeletonJobCard = ({ className = '' }) => {
  return (
    <div className={`job-card ${className}`} style={{ cursor: 'default', background: 'rgba(255,255,255,0.01)' }}>
      <div className="job-card-main">
        <SkeletonAvatar size={56} style={{ borderRadius: '16px' }} />
        <div className="job-info-details" style={{ flex: 1 }}>
          <SkeletonText type="lg" style={{ marginBottom: '12px', width: '40%' }} />
          <div className="company-meta-row" style={{ gap: '12px' }}>
             <SkeletonText type="sm" style={{ width: '100px', margin: 0 }} />
             <SkeletonText type="sm" style={{ width: '80px', margin: 0 }} />
             <SkeletonText type="sm" style={{ width: '90px', margin: 0 }} />
          </div>
          <div className="job-tags-row" style={{ marginTop: '12px' }}>
            <SkeletonText type="md" style={{ width: '70px', height: '24px', borderRadius: '12px', margin: 0 }} />
            <SkeletonText type="md" style={{ width: '90px', height: '24px', borderRadius: '12px', margin: 0 }} />
          </div>
        </div>
      </div>
      <div style={{ flexShrink: 0 }}>
        <SkeletonText type="md" style={{ width: '80px', height: '36px', borderRadius: '12px', margin: 0 }} />
      </div>
    </div>
  );
};

// Full Job Detail Page Skeleton
export const SkeletonJobDetail = () => {
  return (
    <div className="landing-container">
      <div className="bg-blobs">
          <div className="bg-glow-1"></div>
          <div className="bg-glow-2"></div>
      </div>
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '3rem 2rem', position: 'relative', zIndex: 10, width: '100%' }}>
        <SkeletonText type="sm" style={{ width: '80px', marginBottom: '24px' }} />
        
        {/* Header Card Skeleton */}
        <div className="glass" style={{ padding: '3rem', marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', flex: 1 }}>
            <SkeletonAvatar size={80} style={{ borderRadius: '20px' }} />
            <div style={{ flex: 1 }}>
              <SkeletonText type="lg" style={{ width: '50%', height: '32px', marginBottom: '12px' }} />
              <div style={{ display: 'flex', gap: '1rem', marginBottom: '16px' }}>
                 <SkeletonText type="sm" style={{ width: '120px', margin: 0 }} />
                 <SkeletonText type="sm" style={{ width: '100px', margin: 0 }} />
                 <SkeletonText type="sm" style={{ width: '110px', margin: 0 }} />
              </div>
              <SkeletonText type="md" style={{ width: '90px', height: '28px', borderRadius: '14px', margin: 0 }} />
            </div>
          </div>
          <SkeletonText type="lg" style={{ width: '160px', height: '48px', borderRadius: '14px', margin: 0 }} />
        </div>

        {/* Grid Skeleton */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '2rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div className="glass" style={{ padding: '2.5rem' }}>
              <SkeletonText type="lg" style={{ width: '30%', marginBottom: '2rem' }} />
              <SkeletonText type="md" style={{ width: '100%' }} />
              <SkeletonText type="md" style={{ width: '100%' }} />
              <SkeletonText type="md" style={{ width: '90%' }} />
              <SkeletonText type="md" style={{ width: '95%' }} />
              <SkeletonText type="md" style={{ width: '60%' }} />
            </div>
            <div className="glass" style={{ padding: '2.5rem' }}>
              <SkeletonText type="lg" style={{ width: '30%', marginBottom: '2rem' }} />
              <SkeletonText type="md" style={{ width: '100%' }} />
              <SkeletonText type="md" style={{ width: '85%' }} />
              <SkeletonText type="md" style={{ width: '90%' }} />
            </div>
          </div>
          
          <aside>
            <div className="glass" style={{ padding: '2rem' }}>
              <SkeletonText type="lg" style={{ width: '50%', marginBottom: '2rem' }} />
              {[1, 2, 3, 4].map(i => (
                <div key={i} style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
                  <SkeletonAvatar size={20} style={{ borderRadius: '4px' }} />
                  <div>
                    <SkeletonText type="sm" style={{ width: '80px', marginBottom: '8px' }} />
                    <SkeletonText type="md" style={{ width: '120px', margin: 0 }} />
                  </div>
                </div>
              ))}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};
