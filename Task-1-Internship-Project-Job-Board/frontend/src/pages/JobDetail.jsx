import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/ToastProvider';
import { apiGet, apiPost, apiUpload } from '../utils/api';
import { SkeletonText } from '../components/SkeletonLoader';
import { MapPin, Calendar, Briefcase, FileText, Globe, ArrowLeft, Send, CheckCircle, Share2, Upload, ChevronRight, X, Sparkles, IndianRupee, Star as StarIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import { ShareButtons, FeaturedBadge, MatchScore } from '../components/JobFeatures';

const Confetti = () => {
  const colors = ['#818cf8', '#34d399', '#fbbf24', '#f87171', '#c084fc'];
  const pieces = Array.from({ length: 50 });
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 10 }}>
      {pieces.map((_, i) => (
        <motion.div
          key={i}
          initial={{ top: '50%', left: '50%', opacity: 1, scale: 0 }}
          animate={{
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            opacity: 0,
            scale: Math.random() * 1.5 + 0.5,
            rotate: Math.random() * 360
          }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          style={{ position: 'absolute', width: '8px', height: '8px', background: colors[Math.floor(Math.random() * colors.length)], borderRadius: Math.random() > 0.5 ? '50%' : '0%' }}
        />
      ))}
    </div>
  );
};

export default function JobDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [job, setJob] = useState(null);
  const [relatedJobs, setRelatedJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [hasApplied, setHasApplied] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState('USD');
  const [exchangeRates, setExchangeRates] = useState(null);
  const [customRate, setCustomRate] = useState('');
  const [convertedSalary, setConvertedSalary] = useState(null);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [applyStep, setApplyStep] = useState(1);
  const [coverLetter, setCoverLetter] = useState('');
  const [resumeOption, setResumeOption] = useState('profile');
  const [profileResumeUrl, setProfileResumeUrl] = useState('');
  const [uploadFile, setUploadFile] = useState(null);
  const [applying, setApplying] = useState(false);

  useEffect(() => {
    async function loadJobDetails() {
      setLoading(true);
      setError('');
      try {
        const data = await apiGet(`/jobs/${id}`);
        setJob(data);

        try {
          const related = await apiGet(`/jobs?type=${data.type}`);
          setRelatedJobs(related.filter(j => j.id !== data.id).slice(0, 3));
        } catch (e) {
           console.log('Could not fetch related jobs');
        }

        if (user && user.role === 'candidate') {
          const apps = await apiGet('/applications/candidate');
          const alreadyApplied = apps.some((app) => app.job_id === parseInt(id));
          setHasApplied(alreadyApplied);

          const profile = await apiGet('/profiles/me');
          if (profile && profile.resume_url) {
            setProfileResumeUrl(profile.resume_url);
            setResumeOption('profile');
          } else {
            setResumeOption('upload');
          }
        }
      } catch (err) {
        setError('Failed to fetch job opening details.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadJobDetails();

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [id, user]);

  const detectBaseCurrency = (raw) => {
    if (!raw) return 'INR';
    if (raw.includes('₹')) return 'INR';
    if (raw.includes('$')) return 'USD';
    if (raw.includes('€')) return 'EUR';
    if (raw.includes('£')) return 'GBP';
    return 'INR';
  };

  const baseCurrency = detectBaseCurrency(job?.salary_range);

  useEffect(() => {
    if (!job) return;
    const base = detectBaseCurrency(job.salary_range || '');
    fetch(`https://api.frankfurter.app/latest?from=${base}`)
      .then(r => r.json())
      .then(data => setExchangeRates(data.rates))
      .catch(() => {});
  }, [job]);

  const inrFallback = {
    USD: 0.01044, EUR: 0.00905, GBP: 0.00781, JPY: 1.6764, AUD: 0.01492,
    CAD: 0.0146, SGD: 0.01345, AED: 0.03841, CHF: 0.00835, CNY: 0.07077,
    MYR: 0.04247, THB: 0.34408, KRW: 15.9723, SAR: 0.03919
  };

  const getLiveRate = (from, to) => {
    if (from === to) return 1;
    if (exchangeRates) return exchangeRates[to] || 1;
    // Cross-rate from INR-based fallback
    if (from === 'INR') return inrFallback[to] || 1;
    if (to === 'INR') return 1 / (inrFallback[from] || 1);
    return (inrFallback[to] || 1) / (inrFallback[from] || 1);
  };

  const getActiveRate = () => {
    if (customRate !== '' && !isNaN(parseFloat(customRate)) && parseFloat(customRate) > 0) {
      return parseFloat(customRate);
    }
    return getLiveRate(baseCurrency, selectedCurrency);
  };

  useEffect(() => {
    if (!job || !job.salary_range || selectedCurrency === baseCurrency) {
      setConvertedSalary(null);
      return;
    }
    const raw = job.salary_range;
    const cleaned = raw.replace(/[₹$,€£¥,]/g, '');
    const nums = cleaned.match(/[\d.]+/g);
    if (!nums || nums.length < 2) { setConvertedSalary(null); return; }
    const minVal = parseFloat(nums[0]);
    const maxVal = parseFloat(nums[1]);
    const period = raw.includes('/ hour') ? '/ hour' : '/ year';
    const rate = getActiveRate();
    const minConv = Math.round(minVal * rate);
    const maxConv = Math.round(maxVal * rate);
    setConvertedSalary({ min: minConv, max: maxConv, period, rate, from: baseCurrency });
  }, [job, selectedCurrency, customRate, exchangeRates, baseCurrency]);

  const formatCurrency = (amount, currency) => {
    if (currency === 'INR') {
      return '₹' + amount.toLocaleString('en-IN');
    }
    try {
      return new Intl.NumberFormat('en-US', { style: 'currency', currency, maximumFractionDigits: 0 }).format(amount);
    } catch {
      return `${currency} ${amount.toLocaleString('en-US')}`;
    }
  };

  const currencies = [
    { code: 'INR', name: 'Indian Rupee' },
    { code: 'USD', name: 'US Dollar' },
    { code: 'EUR', name: 'Euro' },
    { code: 'GBP', name: 'British Pound' },
    { code: 'JPY', name: 'Japanese Yen' },
    { code: 'AUD', name: 'Australian Dollar' },
    { code: 'CAD', name: 'Canadian Dollar' },
    { code: 'SGD', name: 'Singapore Dollar' },
    { code: 'AED', name: 'UAE Dirham' },
    { code: 'CHF', name: 'Swiss Franc' },
    { code: 'CNY', name: 'Chinese Yuan' },
    { code: 'KRW', name: 'South Korean Won' },
  ];

  useEffect(() => {
    if (showApplyModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showApplyModal]);

  const handleApplyClick = () => {
    if (!user) {
      navigate('/login', { state: { from: location } });
      return;
    }
    setApplyStep(1);
    setShowApplyModal(true);
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    addToast('Job link copied to clipboard!', 'success');
  };

  const handleApplySubmit = async () => {
    setApplying(true);

    try {
      let finalResumeUrl = '';

      if (resumeOption === 'upload') {
        const formData = new FormData();
        formData.append('resume', uploadFile);
        const uploadRes = await apiUpload('/profiles/upload-resume', formData);
        finalResumeUrl = uploadRes.resume_url;
      } else {
        finalResumeUrl = profileResumeUrl;
      }

      await apiPost('/applications', {
        job_id: job.id,
        cover_letter: coverLetter,
        resume_url: finalResumeUrl,
      });

      setHasApplied(true);
      setApplyStep(4);
      
      setTimeout(() => {
        setShowApplyModal(false);
      }, 4000);

    } catch (err) {
      addToast(err.message || 'Application submission failed.', 'error');
      setApplyStep(3);
    } finally {
      setApplying(false);
    }
  };

  const getInitials = (name) => {
    if (!name) return 'C';
    const parts = name.split(' ');
    if (parts.length > 1) return (parts[0][0] + parts[1][0]).toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

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
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '2rem' }}>
            <div className="glass" style={{ padding: '2.5rem' }}>
              <SkeletonText type="title" style={{ marginBottom: '2rem' }} />
              <SkeletonText type="lg" style={{ height: '200px' }} />
            </div>
            <div className="glass" style={{ padding: '2.5rem', height: '400px' }}>
              <SkeletonText type="title" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="landing-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '70vh' }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass" style={{ padding: '60px', textAlign: 'center', border: '1px solid rgba(248, 113, 113, 0.3)', borderRadius: '24px', maxWidth: '500px' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(248, 113, 113, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem auto' }}>
            <Briefcase size={28} color="#f87171" />
          </div>
          <h2 style={{ color: 'white', marginBottom: '16px' }}>Job Opening Not Found</h2>
          <p style={{ color: '#94a3b8', margin: '0 0 32px 0' }}>{error || 'This job opening may have been removed or expired.'}</p>
          <button className="btn btn-primary" onClick={() => navigate('/jobs')}><ArrowLeft size={16} /> Back to Job Search</button>
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
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <motion.button initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="btn btn-outline btn-sm" onClick={() => navigate(-1)} style={{ borderRadius: '12px' }}>
            <ArrowLeft size={16} style={{ marginRight: '6px' }} /> Go Back
          </motion.button>
          
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <MatchScore score={job?.match_score} />
            <motion.button initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="btn btn-outline btn-sm" onClick={handleShare} style={{ borderRadius: '12px' }}>
              <Share2 size={16} style={{ marginRight: '6px' }} /> Share Role
            </motion.button>
          </div>
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass" style={{ padding: '3rem', marginBottom: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '2rem', background: 'radial-gradient(circle at top right, rgba(139, 92, 246, 0.15), rgba(255,255,255,0.02))', border: '1px solid rgba(139, 92, 246, 0.2)', position: 'relative', overflow: 'hidden' }}>
          
          <div style={{ position: 'absolute', top: '-50px', right: '-50px', width: '200px', height: '200px', background: 'radial-gradient(circle, rgba(139, 92, 246, 0.2) 0%, transparent 70%)', filter: 'blur(30px)' }}></div>

          <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
            <div style={{ width: '90px', height: '90px', borderRadius: '24px', background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.3) 0%, rgba(217, 70, 239, 0.3) 100%)', border: '1px solid rgba(255, 255, 255, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: '#e9d5ff', fontSize: '2.5rem', flexShrink: 0, boxShadow: '0 10px 30px rgba(139, 92, 246, 0.2)' }}>
              {getInitials(job.company_name)}
            </div>
            <div>
              <h1 style={{ fontSize: '2.5rem', marginBottom: '12px', fontWeight: 800, color: 'white', lineHeight: 1.2, letterSpacing: '-0.02em' }}>{job.title}</h1>
              
              <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', color: '#cbd5e1', fontSize: '1rem', marginBottom: '1rem' }}>
                <span style={{ fontWeight: 700, color: '#e9d5ff' }}>{job.company_name}</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><MapPin size={16} color="#94a3b8" /> {job.location}</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><IndianRupee size={16} color="#94a3b8" /> {job.salary_range}</span>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.75rem' }}>
                <Calendar size={14} />
                <span>Posted {(() => {
                  const diff = Math.floor((new Date() - new Date(job.created_at)) / (1000 * 60 * 60 * 24));
                  if (diff === 0) return 'today';
                  if (diff === 1) return 'yesterday';
                  return `${diff} days ago`;
                })()}</span>
              </div>
              
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                <span className="badge active">{job.type}</span>
                {job.experience_level && <span className="badge" style={{ background: 'rgba(192, 132, 252, 0.12)', color: '#c084fc', border: '1px solid rgba(192, 132, 252, 0.2)' }}>{job.experience_level}</span>}
                {job.is_featured === 1 && <FeaturedBadge />}
              </div>
            </div>
          </div>

          <div style={{ position: 'relative', zIndex: 2 }}>
            {user?.role === 'employer' ? (
              <p style={{ fontSize: '0.95rem', color: '#94a3b8', background: 'rgba(255,255,255,0.05)', padding: '16px 24px', borderRadius: '16px', border: '1px dashed rgba(255,255,255,0.1)' }}>Viewing as Employer</p>
            ) : hasApplied ? (
              <motion.button initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="btn" disabled style={{ background: 'rgba(52, 211, 153, 0.1)', color: '#34d399', border: '1px solid rgba(52, 211, 153, 0.3)', opacity: 1, padding: '16px 32px', borderRadius: '16px', fontSize: '1.1rem', cursor: 'default' }}>
                <CheckCircle size={20} style={{ marginRight: '8px' }} /> Application Submitted
              </motion.button>
            ) : (
              <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="btn btn-primary" onClick={handleApplyClick} style={{ padding: '16px 32px', borderRadius: '16px', fontSize: '1.1rem', boxShadow: '0 10px 25px rgba(129, 140, 248, 0.4)' }}>
                Apply For This Role <ChevronRight size={20} style={{ marginLeft: '8px' }}/>
              </motion.button>
            )}
          </div>
        </motion.div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '2.5rem' }} className="job-detail-grid">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass" style={{ padding: '3rem', borderRadius: '24px' }}>
              <h3 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '1rem', color: 'white', display: 'flex', alignItems: 'center', gap: '12px' }}>
                 <FileText color="#818cf8"/> Job Overview
              </h3>
              <div style={{ color: '#cbd5e1', lineHeight: 1.8, whiteSpace: 'pre-line', fontSize: '1.05rem' }}>{job.description}</div>
              {job.skills_required && (
                <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                  <h4 style={{ fontSize: '1rem', color: '#94a3b8', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Skills Required</h4>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    {job.skills_required.split(',').map((skill, i) => (
                      <span key={i} style={{ padding: '6px 14px', background: 'rgba(129, 140, 248, 0.1)', border: '1px solid rgba(129, 140, 248, 0.2)', borderRadius: '8px', color: '#c4b5fd', fontSize: '0.9rem', fontWeight: 500 }}>{skill.trim()}</span>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass" style={{ padding: '3rem', borderRadius: '24px' }}>
              <h3 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '1rem', color: 'white', display: 'flex', alignItems: 'center', gap: '12px' }}>
                 <CheckCircle color="#34d399"/> Key Requirements
              </h3>
              <div style={{ color: '#cbd5e1', lineHeight: 1.8, fontSize: '1.05rem' }}>
                {job.requirements.split('\n').map((req, i) => (
                  <div key={i} style={{ display: 'flex', gap: '12px', padding: '6px 0', alignItems: 'flex-start' }}>
                    <CheckCircle size={14} color="#34d399" style={{ marginTop: '5px', flexShrink: 0 }} />
                    <span>{req}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {job.benefits && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass" style={{ padding: '3rem', borderRadius: '24px' }}>
                <h3 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '1rem', color: 'white', display: 'flex', alignItems: 'center', gap: '12px' }}>
                   <Sparkles color="#fbbf24"/> Compensation & Benefits
                </h3>
                <div style={{ color: '#cbd5e1', lineHeight: 1.8, fontSize: '1.05rem' }}>
                  {job.benefits.split('\n').map((ben, i) => (
                    <div key={i} style={{ display: 'flex', gap: '12px', padding: '6px 0', alignItems: 'flex-start' }}>
                      <Sparkles size={14} color="#fbbf24" style={{ marginTop: '5px', flexShrink: 0 }} />
                      <span>{ben}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>

          <aside style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div className="glass" style={{ padding: '2.5rem', position: 'sticky', top: '100px', borderRadius: '24px' }}>
              <h3 style={{ fontSize: '1.3rem', marginBottom: '2rem', color: 'white' }}>Role Specifications</h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div style={{ display: 'flex', gap: '1.2rem', alignItems: 'flex-start' }}>
                  <div style={{ color: '#818cf8', background: 'rgba(129, 140, 248, 0.1)', padding: '10px', borderRadius: '12px' }}><Briefcase size={20} /></div>
                  <div><h4 style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '1px' }}>Employment Type</h4><p style={{ color: 'white', fontWeight: 500 }}>{job.type}</p></div>
                </div>

                <div style={{ display: 'flex', gap: '1.2rem', alignItems: 'flex-start' }}>
                  <div style={{ color: '#34d399', background: 'rgba(52, 211, 153, 0.1)', padding: '10px', borderRadius: '12px' }}><MapPin size={20} /></div>
                  <div><h4 style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '1px' }}>Location</h4><p style={{ color: 'white', fontWeight: 500 }}>{job.location}</p></div>
                </div>

                <div style={{ display: 'flex', gap: '1.2rem', alignItems: 'flex-start' }}>
                  <div style={{ color: '#fbbf24', background: 'rgba(251, 191, 36, 0.1)', padding: '10px', borderRadius: '12px' }}><IndianRupee size={20} /></div>
                  <div style={{ flex: 1 }}>
                    <h4 style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '1px' }}>Salary Range</h4>
                    <p style={{ color: 'white', fontWeight: 500 }}>{job.salary_range}</p>
                    {convertedSalary && selectedCurrency !== baseCurrency && (
                      <p style={{ color: '#34d399', fontWeight: 600, fontSize: '0.95rem', marginTop: '4px' }}>
                        {formatCurrency(convertedSalary.min, selectedCurrency)} - {formatCurrency(convertedSalary.max, selectedCurrency)}{convertedSalary.period}
                      </p>
                    )}
                    <div style={{ marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <select
                        value={selectedCurrency}
                        onChange={(e) => { setSelectedCurrency(e.target.value); setCustomRate(''); }}
                        style={{ width: '100%', padding: '6px 10px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: 'white', fontSize: '0.8rem', cursor: 'pointer', outline: 'none', appearance: 'none' }}
                      >
                        {currencies.map(c => (
                          <option key={c.code} value={c.code} style={{ background: '#1e293b', color: 'white' }}>{c.code} - {c.name}</option>
                        ))}
                      </select>
                      {selectedCurrency !== baseCurrency && (
                        <>
                          <p style={{ fontSize: '0.7rem', color: '#64748b', margin: '2px 0' }}>
                            Live rate: 1 {baseCurrency} = {getLiveRate(baseCurrency, selectedCurrency)} {selectedCurrency} &nbsp;
                            <span
                              onClick={() => setCustomRate(getLiveRate(baseCurrency, selectedCurrency).toString())}
                              style={{ color: '#818cf8', cursor: 'pointer', textDecoration: 'underline' }}
                            >Use live</span>
                          </p>
                          <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                            <span style={{ color: '#94a3b8', fontSize: '0.75rem' }}>Rate:</span>
                            <input
                              type="number"
                              step="any"
                              placeholder={getLiveRate(baseCurrency, selectedCurrency).toString()}
                              value={customRate}
                              onChange={(e) => setCustomRate(e.target.value)}
                              style={{
                                flex: 1, padding: '4px 8px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)',
                                borderRadius: '6px', color: 'white', fontSize: '0.8rem', outline: 'none'
                              }}
                            />
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '1.2rem', alignItems: 'flex-start' }}>
                  <div style={{ color: '#c084fc', background: 'rgba(192, 132, 252, 0.1)', padding: '10px', borderRadius: '12px' }}><Calendar size={20} /></div>
                  <div><h4 style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '1px' }}>Date Published</h4><p style={{ color: 'white', fontWeight: 500 }}>{new Date(job.created_at).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}</p></div>
                </div>

                <div style={{ display: 'flex', gap: '1.2rem', alignItems: 'flex-start' }}>
                  <div style={{ color: '#c084fc', background: 'rgba(192, 132, 252, 0.1)', padding: '10px', borderRadius: '12px' }}><Briefcase size={20} /></div>
                  <div><h4 style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '1px' }}>Experience Level</h4><p style={{ color: 'white', fontWeight: 500 }}>{job.experience_level || 'Not specified'}</p></div>
                </div>

                {job.company_website && (
                  <div style={{ display: 'flex', gap: '1.2rem', alignItems: 'flex-start', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '1.5rem', marginTop: '0.5rem' }}>
                    <div style={{ color: '#60a5fa', background: 'rgba(96, 165, 250, 0.1)', padding: '10px', borderRadius: '12px' }}><Globe size={20} /></div>
                    <div>
                       <h4 style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '1px' }}>Website</h4>
                       <a href={job.company_website} target="_blank" rel="noopener noreferrer" style={{ wordBreak: 'break-all', fontSize: '0.95rem', fontWeight: 600, color: '#818cf8', textDecoration: 'none' }}>{job.company_website.replace(/^https?:\/\/(www\.)?/, '')}</a>
                    </div>
                  </div>
                )}
                
                {job.company_bio && (
                  <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '1.5rem', marginTop: '0.5rem' }}>
                    <h4 style={{ fontSize: '0.85rem', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '12px', letterSpacing: '1px' }}>About {job.company_name}</h4>
                    <p style={{ fontSize: '0.9rem', color: '#cbd5e1', lineHeight: 1.7, marginBottom: '12px' }}>{job.company_bio}</p>
                    {job.company_website && (
                      <a href={job.company_website} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#818cf8', fontSize: '0.85rem', fontWeight: 600, textDecoration: 'none', padding: '6px 14px', background: 'rgba(129, 140, 248, 0.1)', borderRadius: '8px', border: '1px solid rgba(129, 140, 248, 0.15)' }}>
                        <Globe size={14} /> Visit Company Site
                      </a>
                    )}
                  </div>
                )}
              </div>
            </div>

            {relatedJobs.length > 0 && (
              <div className="glass" style={{ padding: '2rem', borderRadius: '24px' }}>
                <h3 style={{ fontSize: '1.2rem', marginBottom: '1.5rem', color: 'white' }}>Similar Roles</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {relatedJobs.map(rj => (
                    <motion.div key={rj.id} whileHover={{ x: 4 }} onClick={() => navigate(`/jobs/${rj.id}`)} style={{ padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', cursor: 'pointer', border: '1px solid rgba(255,255,255,0.05)', transition: 'all 0.2s' }} className="hover-card">
                      <h4 style={{ color: 'white', fontSize: '1rem', marginBottom: '4px' }}>{rj.title}</h4>
                      <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '4px' }}>{rj.company_name} &bull; {rj.location}</p>
                      {rj.salary_range && <p style={{ color: '#34d399', fontSize: '0.8rem', fontWeight: 600 }}>{rj.salary_range}</p>}
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </aside>
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass" style={{ padding: '2rem', borderRadius: '24px', marginTop: '2rem' }}>
          <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem', color: 'white', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Share2 size={18} color="#818cf8" /> Share This Job
          </h3>
          <ShareButtons job={job} />
        </motion.div>
      </div>

      {showApplyModal && createPortal(
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.8)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', zIndex: 9999, overflowY: 'auto', padding: '2rem 1rem' }} onClick={() => !applying && setShowApplyModal(false)}>
          <motion.div initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} className="glass" style={{ width: '100%', maxWidth: '650px', margin: 'auto', padding: '0', overflow: 'hidden', borderRadius: '24px', border: '1px solid rgba(129, 140, 248, 0.3)', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' }} onClick={(e) => e.stopPropagation()}>
              
              <div style={{ padding: '2rem', borderBottom: '1px solid rgba(255,255,255,0.1)', background: 'linear-gradient(to right, rgba(129, 140, 248, 0.1), transparent)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'white', marginBottom: '8px' }}>Application Wizard</h2>
                    <p style={{ color: '#94a3b8', fontSize: '0.95rem' }}>Applying to <strong style={{ color: '#e2e8f0' }}>{job.title}</strong> at {job.company_name}</p>
                  </div>
                  <motion.button whileHover={{ rotate: 90 }} style={{ background: 'rgba(255,255,255,0.05)', border: 'none', color: '#cbd5e1', cursor: 'pointer', padding: '8px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setShowApplyModal(false)} disabled={applying}><X size={20}/></motion.button>
                </div>

                {applyStep < 4 && (
                  <div style={{ marginTop: '2rem', display: 'flex', gap: '8px' }}>
                    {[1, 2, 3].map(step => (
                      <div key={step} style={{ flex: 1, height: '4px', background: step <= applyStep ? '#818cf8' : 'rgba(255,255,255,0.1)', borderRadius: '4px', transition: 'background 0.3s' }}></div>
                    ))}
                  </div>
                )}
              </div>
              
              <div style={{ padding: '2.5rem 2rem', position: 'relative' }}>
                
                {applyStep === 1 && (
                  <motion.div key="step1" initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -20, opacity: 0 }}>
                    <h3 style={{ fontSize: '1.2rem', color: 'white', marginBottom: '1.5rem' }}>Step 1: Resume Attachment</h3>
                    
                    {profileResumeUrl ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', padding: '1rem', background: resumeOption === 'profile' ? 'rgba(129, 140, 248, 0.1)' : 'rgba(255,255,255,0.02)', border: `1px solid ${resumeOption === 'profile' ? '#818cf8' : 'rgba(255,255,255,0.1)'}`, borderRadius: '16px', transition: 'all 0.2s' }}>
                          <input type="radio" name="resumeSelect" checked={resumeOption === 'profile'} onChange={() => setResumeOption('profile')} style={{ accentColor: '#818cf8', width: '20px', height: '20px' }} />
                          <div>
                            <span style={{ display: 'block', color: 'white', fontWeight: 600, fontSize: '1rem', marginBottom: '4px' }}>Use existing profile resume</span>
                            <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>{profileResumeUrl.split('/').pop()}</span>
                          </div>
                        </label>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', padding: '1rem', background: resumeOption === 'upload' ? 'rgba(129, 140, 248, 0.1)' : 'rgba(255,255,255,0.02)', border: `1px solid ${resumeOption === 'upload' ? '#818cf8' : 'rgba(255,255,255,0.1)'}`, borderRadius: '16px', transition: 'all 0.2s' }}>
                          <input type="radio" name="resumeSelect" checked={resumeOption === 'upload'} onChange={() => setResumeOption('upload')} style={{ accentColor: '#818cf8', width: '20px', height: '20px' }} />
                          <span style={{ color: 'white', fontWeight: 600, fontSize: '1rem' }}>Upload a different file</span>
                        </label>
                      </div>
                    ) : (
                      <p style={{ fontSize: '0.95rem', color: '#fbbf24', marginBottom: '1.5rem', background: 'rgba(251, 191, 36, 0.1)', padding: '1rem', borderRadius: '12px' }}>You haven't uploaded a profile resume yet. Please select a file below.</p>
                    )}

                    {resumeOption === 'upload' && (
                      <div style={{ padding: '2.5rem', border: '2px dashed rgba(255,255,255,0.15)', borderRadius: '20px', textAlign: 'center', background: 'rgba(255,255,255,0.02)' }}>
                        <Upload size={36} style={{ color: '#818cf8', margin: '0 auto 1rem auto' }} />
                        <p style={{ fontWeight: 600, fontSize: '1.1rem', color: 'white', marginBottom: '8px' }}>{uploadFile ? uploadFile.name : 'Choose a file to upload'}</p>
                        <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: '1.5rem' }}>PDF, DOCX, Word, or TXT formats (Max 5MB)</p>
                        <input type="file" id="wizard-upload" accept=".pdf,.doc,.docx,.txt,.rtf" onChange={(e) => setUploadFile(e.target.files[0])} style={{ display: 'none' }} />
                        <label htmlFor="wizard-upload" className="btn btn-outline" style={{ cursor: 'pointer', borderRadius: '12px' }}>Browse Files</label>
                      </div>
                    )}
                  </motion.div>
                )}

                {applyStep === 2 && (
                  <motion.div key="step2" initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -20, opacity: 0 }}>
                    <h3 style={{ fontSize: '1.2rem', color: 'white', marginBottom: '1.5rem' }}>Step 2: Cover Letter <span style={{ color: '#64748b', fontSize: '0.85rem', fontWeight: 400 }}>(Optional)</span></h3>
                    <p style={{ color: '#94a3b8', fontSize: '0.95rem', marginBottom: '1.5rem' }}>A strong cover letter helps you stand out and explains why you are a great fit for this specific role at {job.company_name}.</p>
                    <textarea className="premium-input-field" rows="8" placeholder="Introduce yourself, your motivations, and your core strengths..." value={coverLetter} onChange={(e) => setCoverLetter(e.target.value)} style={{ resize: 'vertical' }} />
                  </motion.div>
                )}

                {applyStep === 3 && (
                  <motion.div key="step3" initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -20, opacity: 0 }}>
                    <h3 style={{ fontSize: '1.2rem', color: 'white', marginBottom: '1.5rem' }}>Step 3: Review & Submit</h3>
                    <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '1rem' }}>
                         <span style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Position:</span>
                         <span style={{ color: 'white', fontWeight: 600 }}>{job.title}</span>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '1rem' }}>
                         <span style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Company:</span>
                         <span style={{ color: 'white', fontWeight: 600 }}>{job.company_name}</span>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '1rem', borderTop: '1px dashed rgba(255,255,255,0.1)', paddingTop: '1rem' }}>
                         <span style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Resume:</span>
                         <span style={{ color: 'white', display: 'flex', alignItems: 'center', gap: '8px' }}><FileText size={16} color="#818cf8"/> {resumeOption === 'upload' ? uploadFile?.name : profileResumeUrl.split('/').pop()}</span>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '1rem' }}>
                         <span style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Cover Letter:</span>
                         <span style={{ color: 'white' }}>{coverLetter ? `Included (${coverLetter.length} chars)` : 'None provided'}</span>
                      </div>
                    </div>
                  </motion.div>
                )}

                {applyStep === 4 && (
                  <motion.div key="step4" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} style={{ textAlign: 'center', padding: '2rem 0' }}>
                    <Confetti />
                    <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(52, 211, 153, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem auto' }}>
                      <CheckCircle size={40} color="#34d399" />
                    </div>
                    <h3 style={{ fontSize: '1.8rem', color: 'white', marginBottom: '12px', fontWeight: 800 }}>Application Sent!</h3>
                    <p style={{ color: '#94a3b8', fontSize: '1.05rem', maxWidth: '400px', margin: '0 auto' }}>Your profile and documents have been successfully securely routed to {job.company_name}.</p>
                  </motion.div>
                )}

              </div>

              {applyStep < 4 && (
                <div style={{ padding: '1.5rem 2rem', borderTop: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.2)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <button type="button" className="btn btn-outline" onClick={() => applyStep > 1 ? setApplyStep(applyStep - 1) : setShowApplyModal(false)} disabled={applying} style={{ borderRadius: '12px' }}>
                    {applyStep === 1 ? 'Cancel' : 'Back'}
                  </button>
                  
                  {applyStep < 3 ? (
                    <button type="button" className="btn btn-primary" onClick={() => setApplyStep(applyStep + 1)} disabled={resumeOption === 'upload' && !uploadFile} style={{ borderRadius: '12px' }}>
                      Continue to Next Step <ChevronRight size={16} style={{ marginLeft: '4px' }}/>
                    </button>
                  ) : (
                    <button type="button" className="btn btn-primary" onClick={handleApplySubmit} disabled={applying} style={{ borderRadius: '12px', background: 'linear-gradient(135deg, #10b981, #059669)' }}>
                      {applying ? 'Submitting...' : 'Submit Application'} <Send size={16} style={{ marginLeft: '8px' }}/>
                    </button>
                  )}
                </div>
              )}
            </motion.div>
          </div>
        , document.body)}
      <style>{`
        @media (max-width: 768px) {
          .job-detail-grid { grid-template-columns: 1fr !important; }
        }
        .hover-card:hover { transform: translateY(-2px); }
      `}</style>
    </div>
  );
}
