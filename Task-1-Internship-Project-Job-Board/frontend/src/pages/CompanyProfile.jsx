import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiGet } from '../utils/api';
import { SkeletonText } from '../components/SkeletonLoader';
import ReviewsList from '../components/ReviewsList';
import ReviewForm from '../components/ReviewForm';
import { Building2, Globe, MapPin, Users, Briefcase, ArrowLeft, Star } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

const getInitials = (name) => {
  if (!name) return 'C';
  const parts = name.split(' ');
  if (parts.length > 1) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
};

export default function CompanyProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [company, setCompany] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reviews, setReviews] = useState([]);
  const [avgRating, setAvgRating] = useState(0);

  useEffect(() => {
    async function loadCompany() {
      setLoading(true);
      setError('');
      try {
        const data = await apiGet(`/profiles/employer/${id}`);
        setCompany(data);

        try {
          const jobData = await apiGet(`/jobs?employer_id=${id}`);
          setJobs(jobData);
        } catch (e) {
          console.log('Could not fetch jobs for this employer');
        }

        try {
          const reviewData = await apiGet(`/reviews/company/${id}`);
          setReviews(reviewData);
          if (reviewData.length > 0) {
            const total = reviewData.reduce((sum, r) => sum + r.rating, 0);
            setAvgRating(Math.round((total / reviewData.length) * 10) / 10);
          }
        } catch (e) {
          console.log('Could not fetch reviews');
        }
      } catch (err) {
        setError('Failed to fetch company profile.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadCompany();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [id]);

  if (loading) {
    return (
      <div className="landing-container" style={{ minHeight: '100vh' }}>
        <div className="bg-blobs"><div className="bg-glow-1"></div></div>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '3rem 2rem' }}>
          <div className="glass" style={{ padding: '3rem', marginBottom: '2rem' }}>
            <SkeletonText type="title" style={{ width: '40%', marginBottom: '1rem' }} />
            <SkeletonText type="text" />
            <SkeletonText type="text" style={{ width: '60%' }} />
          </div>
          <div className="glass" style={{ padding: '2.5rem' }}>
            <SkeletonText type="title" style={{ marginBottom: '1rem' }} />
            <SkeletonText type="lg" style={{ height: '120px' }} />
          </div>
        </div>
      </div>
    );
  }

  if (error || !company) {
    return (
      <div className="landing-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '70vh' }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass" style={{ padding: '60px', textAlign: 'center', border: '1px solid rgba(248, 113, 113, 0.3)', borderRadius: '24px', maxWidth: '500px' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(248, 113, 113, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem auto' }}>
            <Building2 size={28} color="#f87171" />
          </div>
          <h2 style={{ color: 'white', marginBottom: '16px' }}>Company Not Found</h2>
          <p style={{ color: '#94a3b8', margin: '0 0 32px 0' }}>{error || 'This company profile may have been removed or is unavailable.'}</p>
          <button className="btn btn-primary" onClick={() => navigate('/jobs')}><ArrowLeft size={16} /> Back to Jobs</button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="landing-container" style={{ paddingBottom: '4rem' }}>
      <div className="bg-blobs">
        <div className="bg-glow-1"></div>
        <div className="bg-glow-2"></div>
        <div className="bg-noise"></div>
      </div>

      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '3rem 2rem', position: 'relative', zIndex: 10, width: '100%' }}>
        <motion.button initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="btn btn-outline btn-sm" onClick={() => navigate('/jobs')} style={{ borderRadius: '12px', marginBottom: '2rem' }}>
          <ArrowLeft size={16} style={{ marginRight: '6px' }} /> Back to Jobs
        </motion.button>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass" style={{ padding: '3rem', marginBottom: '2.5rem', background: 'radial-gradient(circle at top right, rgba(139, 92, 246, 0.15), rgba(255,255,255,0.02))', border: '1px solid rgba(139, 92, 246, 0.2)', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: '-50px', right: '-50px', width: '200px', height: '200px', background: 'radial-gradient(circle, rgba(139, 92, 246, 0.2) 0%, transparent 70%)', filter: 'blur(30px)' }}></div>

          <div style={{ display: 'flex', gap: '2rem', alignItems: 'flex-start', flexWrap: 'wrap' }}>
            <div style={{ width: '100px', height: '100px', borderRadius: '24px', background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.3) 0%, rgba(217, 70, 239, 0.3) 100%)', border: '1px solid rgba(255, 255, 255, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: '#e9d5ff', fontSize: '2.5rem', flexShrink: 0, boxShadow: '0 10px 30px rgba(139, 92, 246, 0.2)' }}>
              {getInitials(company.company_name)}
            </div>
            <div style={{ flex: 1, minWidth: '280px' }}>
              <h1 style={{ fontSize: '2.5rem', marginBottom: '12px', fontWeight: 800, color: 'white', lineHeight: 1.2, letterSpacing: '-0.02em' }}>{company.company_name}</h1>

              <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', color: '#cbd5e1', fontSize: '0.95rem', marginBottom: '1.5rem' }}>
                {company.location && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><MapPin size={16} color="#94a3b8" /> {company.location}</span>
                )}
                {company.industry && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Briefcase size={16} color="#94a3b8" /> {company.industry}</span>
                )}
                {company.company_size && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Users size={16} color="#94a3b8" /> {company.company_size} employees</span>
                )}
              </div>

              {company.website && (
                <a href={company.website.startsWith('http') ? company.website : `https://${company.website}`} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#818cf8', fontWeight: 600, fontSize: '1rem', textDecoration: 'none', padding: '8px 16px', borderRadius: '12px', background: 'rgba(129, 140, 248, 0.1)', border: '1px solid rgba(129, 140, 248, 0.2)', transition: 'all 0.2s' }}>
                  <Globe size={16} /> {company.website.replace(/^https?:\/\/(www\.)?/, '')}
                </a>
              )}
            </div>
          </div>

          {company.description && (
            <div style={{ marginTop: '2rem', paddingTop: '2rem', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
              <h3 style={{ fontSize: '1.2rem', color: 'white', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Building2 size={20} color="#818cf8" /> About
              </h3>
              <p style={{ color: '#cbd5e1', lineHeight: 1.8, whiteSpace: 'pre-line', fontSize: '1.05rem' }}>{company.description}</p>
            </div>
          )}
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1.5rem' }}>
            <Briefcase size={24} color="#818cf8" />
            <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'white' }}>Active Jobs at {company.company_name}</h2>
            {jobs.length > 0 && <span className="badge active" style={{ fontSize: '0.9rem', padding: '4px 12px' }}>{jobs.length} open</span>}
          </div>

          {jobs.length === 0 ? (
            <div className="glass" style={{ padding: '3rem', textAlign: 'center', borderRadius: '24px' }}>
              <Building2 size={40} color="#64748b" style={{ margin: '0 auto 1rem auto' }} />
              <p style={{ color: '#94a3b8', fontSize: '1.1rem' }}>No active openings at this time.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {jobs.map((job, index) => (
                <motion.div
                  key={job.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + index * 0.05 }}
                  whileHover={{ y: -2 }}
                  onClick={() => navigate(`/jobs/${job.id}`)}
                  className="glass"
                  style={{ padding: '1.5rem 2rem', borderRadius: '20px', cursor: 'pointer', border: '1px solid rgba(255,255,255,0.05)', transition: 'all 0.2s' }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                    <div style={{ flex: 1, minWidth: '200px' }}>
                      <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'white', marginBottom: '8px' }}>{job.title}</h3>
                      <div style={{ display: 'flex', gap: '1.2rem', flexWrap: 'wrap', color: '#94a3b8', fontSize: '0.9rem' }}>
                        {job.location && (
                          <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><MapPin size={14} /> {job.location}</span>
                        )}
                        {job.type && <span className="badge" style={{ fontSize: '0.8rem', padding: '2px 10px' }}>{job.type}</span>}
                        {job.salary_range && (
                          <span style={{ color: '#34d399', fontWeight: 600 }}>{job.salary_range}</span>
                        )}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                      <span style={{ color: '#64748b', fontSize: '0.85rem' }}>{new Date(job.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                      <div style={{ color: '#818cf8', background: 'rgba(129, 140, 248, 0.1)', padding: '8px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Briefcase size={18} />
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} style={{ marginTop: '2.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1.5rem' }}>
            <Star size={24} color="#fbbf24" />
            <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'white' }}>Reviews</h2>
            {reviews.length > 0 && (
              <span className="badge active" style={{ fontSize: '0.9rem', padding: '4px 12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Star size={14} fill="#fbbf24" color="#fbbf24" /> {avgRating} ({reviews.length})
              </span>
            )}
          </div>
          <div className="glass" style={{ padding: '2rem', borderRadius: '24px' }}>
            {user && <ReviewForm companyId={id} onSubmitted={() => {
              const loadReviews = async () => {
                try {
                  const data = await apiGet(`/reviews/company/${id}`);
                  setReviews(data);
                  if (data.length > 0) {
                    const total = data.reduce((sum, r) => sum + r.rating, 0);
                    setAvgRating(Math.round((total / data.length) * 10) / 10);
                  }
                } catch (e) {}
              };
              loadReviews();
            }} />}
            <ReviewsList reviews={reviews} />
          </div>
        </motion.div>
      </div>
    </div>
  );
}
