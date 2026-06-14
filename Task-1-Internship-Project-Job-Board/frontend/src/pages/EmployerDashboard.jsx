import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/ToastProvider';
import { SkeletonCard, SkeletonJobCard, SkeletonText } from '../components/SkeletonLoader';
import { apiGet, apiPost, apiPut, apiPatch, apiDelete, apiUpload, getStaticUrl } from '../utils/api';
import { motion, AnimatePresence } from 'framer-motion';
import { Briefcase, Building, PlusCircle, Users, FileText, ArrowLeft, Mail, Trash2, LogOut, BarChart2, Calendar, Clock, Activity, Target, MessageSquare, Search, Upload, FileSpreadsheet, ScrollText } from 'lucide-react';
import LiveChat from '../components/LiveChat';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function EmployerDashboard() {
  const { user, syncUser, logout } = useAuth();
  const { addToast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  
  // Tabs: 'manage-jobs' | 'post-job' | 'company-profile' | 'view-applicants' | 'analytics'
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'analytics');
  
  // Selected job for reviewing candidates
  const [selectedJob, setSelectedJob] = useState(null);
  const [applicants, setApplicants] = useState([]);
  const [applicantsLoading, setApplicantsLoading] = useState(false);

  // Posted Jobs State
  const [myJobs, setMyJobs] = useState([]);
  const [jobsLoading, setJobsLoading] = useState(true);

  // Analytics State
  const [analytics, setAnalytics] = useState(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);

  // Job Form State
  const [jobTitle, setJobTitle] = useState('');
  const [jobLocation, setJobLocation] = useState('');
  const [jobType, setJobType] = useState('Full-time');
  const [jobExperienceLevel, setJobExperienceLevel] = useState('Mid-Level');
  const [jobSalary, setJobSalary] = useState('');
  const [jobDesc, setJobDesc] = useState('');
  const [jobReq, setJobReq] = useState('');
  const [jobBenefits, setJobBenefits] = useState('');
  const [jobFeatured, setJobFeatured] = useState(false);

  // Company Profile Form State
  const [companyName, setCompanyName] = useState(user?.name || '');
  const [companyWebsite, setCompanyWebsite] = useState('');
  const [companyBio, setCompanyBio] = useState('');
  
  const [profileLoading, setProfileLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const [candidateSearch, setCandidateSearch] = useState('');
  const [candidateResults, setCandidateResults] = useState([]);
  const [candidateSearchLoading, setCandidateSearchLoading] = useState(false);
  const [offerLetters, setOfferLetters] = useState([]);
  const [offerLettersLoading, setOfferLettersLoading] = useState(false);

  const COLORS = ['#818cf8', '#34d399', '#fbbf24', '#f87171', '#c084fc'];

  // Dynamic Greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  const loadOfferLetters = async () => {
    setOfferLettersLoading(true);
    try {
      const data = await apiGet('/offers');
      setOfferLetters(data);
    } catch (err) {
      console.error('Failed to load offer letters', err);
    } finally {
      setOfferLettersLoading(false);
    }
  };

  const handleCandidateSearch = async () => {
    if (!candidateSearch.trim()) return;
    setCandidateSearchLoading(true);
    try {
      const data = await apiGet(`/candidates/search?q=${encodeURIComponent(candidateSearch)}`);
      setCandidateResults(data);
    } catch (err) {
      console.error('Failed to search candidates', err);
      addToast('Failed to search candidates.', 'error');
    } finally {
      setCandidateSearchLoading(false);
    }
  };

  useEffect(() => {
    setSearchParams({ tab: activeTab });
    if (activeTab === 'analytics') loadAnalytics();
    if (activeTab === 'manage-jobs') loadMyJobs();
    if (activeTab === 'company-profile') loadCompanyProfile();
    if (activeTab === 'offer-letters') loadOfferLetters();
  }, [activeTab, setSearchParams]);

  const loadAnalytics = async () => {
    setAnalyticsLoading(true);
    try {
      const data = await apiGet('/dashboard/stats');
      setAnalytics(data);
    } catch (err) {
      console.error('Failed to load analytics', err);
      addToast('Failed to load dashboard metrics', 'error');
    } finally {
      setAnalyticsLoading(false);
    }
  };

  const loadMyJobs = async () => {
    setJobsLoading(true);
    try {
      const data = await apiGet('/jobs/my-jobs');
      const jobsWithCounts = await Promise.all(data.map(async (job) => {
        try {
          const apps = await apiGet(`/applications/employer/${job.id}`);
          return { ...job, applicantCount: apps.length };
        } catch (e) {
          return { ...job, applicantCount: 0 };
        }
      }));
      setMyJobs(jobsWithCounts);
    } catch (err) {
      console.error('Failed to load my jobs', err);
      addToast('Failed to load your job postings', 'error');
    } finally {
      setJobsLoading(false);
    }
  };

  const loadCompanyProfile = async () => {
    setProfileLoading(true);
    try {
      const profile = await apiGet('/profiles/me');
      if (profile) {
        setCompanyName(profile.company_name || user?.name || '');
        setCompanyWebsite(profile.company_website || '');
        setCompanyBio(profile.company_bio || '');
      }
    } catch (err) {
      console.error('Failed to load company profile', err);
    } finally {
      setProfileLoading(false);
    }
  };

  const handlePostJob = async (e) => {
    e.preventDefault();
    setActionLoading(true);

    try {
      await apiPost('/jobs', {
        title: jobTitle,
        company_name: companyName,
        location: jobLocation,
        type: jobType,
        experience_level: jobExperienceLevel,
        salary_range: jobSalary,
        description: jobDesc,
        requirements: jobReq,
        benefits: jobBenefits,
        is_featured: jobFeatured
      });

      addToast('Job opening posted successfully!', 'success');
      
      setJobTitle('');
      setJobLocation('');
      setJobType('Full-time');
      setJobExperienceLevel('Mid-Level');
      setJobSalary('');
      setJobDesc('');
      setJobReq('');
      setJobBenefits('');
      setJobFeatured(false);

      setTimeout(() => setActiveTab('manage-jobs'), 500);
    } catch (err) {
      addToast(err.message || 'Failed to publish job opening.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setActionLoading(true);

    try {
      const result = await apiPut('/profiles/me', {
        company_name: companyName,
        company_website: companyWebsite,
        company_bio: companyBio
      });

      syncUser(result.user);
      addToast('Company profile updated successfully!', 'success');
    } catch (err) {
      addToast(err.message || 'Failed to update company profile.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteJob = async (id, title) => {
    if (!window.confirm(`Are you sure you want to permanently delete the job listing: "${title}"?`)) {
      return;
    }

    try {
      await apiDelete(`/jobs/${id}`);
      setMyJobs(myJobs.filter(job => job.id !== id));
      addToast('Job listing deleted successfully.', 'success');
    } catch (err) {
      addToast('Failed to delete job listing.', 'error');
    }
  };

  const handleViewApplicants = async (job) => {
    setSelectedJob(job);
    setActiveTab('view-applicants');
    setApplicantsLoading(true);
    try {
      const data = await apiGet(`/applications/employer/${job.id}`);
      setApplicants(data);
    } catch (err) {
      console.error(err);
      addToast('Failed to load applicants.', 'error');
    } finally {
      setApplicantsLoading(false);
    }
  };

  const handleStatusChange = async (appId, newStatus) => {
    try {
      await apiPatch(`/applications/${appId}/status`, { status: newStatus });
      setApplicants(applicants.map(app => 
        app.application_id === appId ? { ...app, status: newStatus } : app
      ));
      addToast(`Status updated to "${newStatus}"!`, 'success');
    } catch (err) {
      addToast('Failed to update application status.', 'error');
    }
  };

  const tabVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
    exit: { opacity: 0, y: -10, transition: { duration: 0.2 } }
  };

  return (
    <div className="dashboard-container">
      {/* Premium Background */}
      <div className="bg-glow-1"></div>
      <div className="bg-glow-2"></div>
      <div className="bg-noise"></div>

      <aside className="sidebar glass" style={{ border: 'none', borderRight: '1px solid rgba(255,255,255,0.08)' }}>
        <div style={{ marginBottom: '2.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }} onClick={() => navigate('/')}>
          <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'linear-gradient(135deg, #818cf8, #6366f1)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 15px rgba(129, 140, 248, 0.4)' }}>
            <Briefcase size={18} color="#fff" strokeWidth={2.5} />
          </div>
          <span style={{ fontSize: '1.2rem', fontWeight: 800, color: 'white' }}>Console</span>
        </div>

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <button className={`nav-item ${activeTab === 'analytics' ? 'active' : ''}`} onClick={() => setActiveTab('analytics')}>
            <BarChart2 size={18} /><span>Dashboard Overview</span>
          </button>
          <button className={`nav-item ${activeTab === 'manage-jobs' || activeTab === 'view-applicants' ? 'active' : ''}`} onClick={() => setActiveTab('manage-jobs')}>
            <Briefcase size={18} /><span>Job Postings</span>
          </button>
          <button className={`nav-item ${activeTab === 'post-job' ? 'active' : ''}`} onClick={() => setActiveTab('post-job')}>
            <PlusCircle size={18} /><span>Publish New Job</span>
          </button>
          <button className={`nav-item ${activeTab === 'company-profile' ? 'active' : ''}`} onClick={() => setActiveTab('company-profile')}>
            <Building size={18} /><span>Company Profile</span>
          </button>
          <button className={`nav-item ${activeTab === 'candidate-search' ? 'active' : ''}`} onClick={() => setActiveTab('candidate-search')}>
            <Search size={18} /><span>Candidate Search</span>
          </button>
          <button className={`nav-item ${activeTab === 'offer-letters' ? 'active' : ''}`} onClick={() => setActiveTab('offer-letters')}>
            <ScrollText size={18} /><span>Offer Letters</span>
          </button>
          <button className={`nav-item ${activeTab === 'messages' ? 'active' : ''}`} onClick={() => setActiveTab('messages')}>
            <MessageSquare size={18} /><span>Messages</span>
          </button>
        </div>

        <button className="nav-item" onClick={() => { logout(); navigate('/'); }} style={{ marginTop: 'auto', color: '#f87171' }}>
          <LogOut size={18} /><span>Sign Out</span>
        </button>
      </aside>

      <main className="main-content-dash">
        <div className="header-bar" style={{ background: 'transparent', border: 'none', paddingBottom: 0 }}>
          <div className="welcome-text">
            <h1 style={{ fontSize: '2rem', display: 'flex', alignItems: 'center', gap: '12px' }}>
              {getGreeting()}, {user?.name.split(' ')[0]} <span className="wave-emoji">👋</span>
            </h1>
            <p>Here's what's happening with your recruitment pipeline today.</p>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {/* Tab: Analytics */}
          {activeTab === 'analytics' && (
            <motion.div key="analytics" variants={tabVariants} initial="hidden" animate="visible" exit="exit" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {analyticsLoading ? (
                 <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))', gap: '1.5rem' }}>
                   {[1, 2, 3].map(i => <SkeletonCard key={i} />)}
                 </div>
              ) : (
                <>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 240px), 1fr))', gap: '1.5rem' }}>
                    <div className="card glass stat-card" style={{ padding: '2rem', position: 'relative', overflow: 'hidden' }}>
                      <div style={{ position: 'absolute', top: '-20px', right: '-20px', opacity: 0.1, color: '#818cf8' }}><Target size={120} /></div>
                      <p style={{ color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', fontSize: '0.8rem', letterSpacing: '1px' }}>Active Roles</p>
                      <h3 style={{ fontSize: '3rem', fontWeight: 800, color: 'white', marginTop: '0.5rem' }}>{analytics?.totalJobs || 0}</h3>
                      <p style={{ fontSize: '0.85rem', color: '#34d399', marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '4px' }}><Activity size={14}/> Live on platform</p>
                    </div>
                    <div className="card glass stat-card" style={{ padding: '2rem', position: 'relative', overflow: 'hidden' }}>
                      <div style={{ position: 'absolute', top: '-20px', right: '-20px', opacity: 0.1, color: '#c084fc' }}><Users size={120} /></div>
                      <p style={{ color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', fontSize: '0.8rem', letterSpacing: '1px' }}>Total Applicants</p>
                      <h3 style={{ fontSize: '3rem', fontWeight: 800, color: '#c084fc', marginTop: '0.5rem' }}>{analytics?.totalApplications || 0}</h3>
                      <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '4px' }}><Calendar size={14}/> Across all time</p>
                    </div>
                    <div className="card glass stat-card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                       <button className="btn btn-primary" onClick={() => setActiveTab('post-job')} style={{ borderRadius: '12px', padding: '1rem', width: '100%', fontSize: '1rem' }}>
                         <PlusCircle size={20} style={{ marginRight: '8px' }} /> Create New Listing
                       </button>
                    </div>
                  </div>

                  <div className="responsive-grid-2" style={{ gap: '1.5rem', marginTop: '1rem' }}>
                    <div className="card glass" style={{ padding: '2rem' }}>
                      <h4 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}><BarChart2 size={18} color="#818cf8"/> Applicant Volume by Role</h4>
                      {analytics?.applicationsPerJob?.length > 0 ? (
                        <div style={{ height: '300px', width: '100%' }}>
                          <ResponsiveContainer>
                            <BarChart data={analytics.applicationsPerJob}>
                              <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                              <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                              <Tooltip cursor={{ fill: 'rgba(255,255,255,0.05)' }} contentStyle={{ background: 'rgba(10,15,40,0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', backdropFilter: 'blur(10px)' }} />
                              <Bar dataKey="applications" fill="url(#colorGradient)" radius={[6, 6, 0, 0]} />
                              <defs>
                                <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="0%" stopColor="#818cf8" />
                                  <stop offset="100%" stopColor="#c084fc" />
                                </linearGradient>
                              </defs>
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      ) : (
                        <div style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', color: 'var(--text-muted)' }}>
                           <Activity size={32} style={{ marginBottom: '1rem', opacity: 0.5 }} />
                           <p>No applicant data to display yet.</p>
                        </div>
                      )}
                    </div>

                    <div className="card glass" style={{ padding: '2rem' }}>
                      <h4 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}><Target size={18} color="#c084fc"/> Hiring Pipeline Status</h4>
                      {analytics?.statusDistribution?.length > 0 ? (
                        <div style={{ height: '300px', width: '100%', position: 'relative' }}>
                          <ResponsiveContainer>
                            <PieChart>
                              <Pie data={analytics.statusDistribution} cx="50%" cy="50%" innerRadius={70} outerRadius={110} paddingAngle={5} dataKey="value">
                                {analytics.statusDistribution.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="rgba(255,255,255,0.05)" strokeWidth={2} />
                                ))}
                              </Pie>
                              <Tooltip contentStyle={{ background: 'rgba(10,15,40,0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', backdropFilter: 'blur(10px)' }} itemStyle={{ color: '#fff' }} />
                            </PieChart>
                          </ResponsiveContainer>
                          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
                            <div style={{ fontSize: '2rem', fontWeight: 800, color: 'white' }}>{analytics.totalApplications}</div>
                            <div style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase' }}>Total</div>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap', marginTop: '1rem' }}>
                            {analytics.statusDistribution.map((entry, index) => (
                              <div key={entry.name} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.03)', padding: '4px 10px', borderRadius: '20px' }}>
                                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: COLORS[index % COLORS.length], boxShadow: `0 0 10px ${COLORS[index % COLORS.length]}` }}></div>
                                <span style={{ fontSize: '0.8rem', color: '#cbd5e1', textTransform: 'capitalize' }}>{entry.name} <span style={{ fontWeight: 700, color: 'white', marginLeft: '4px' }}>{entry.value}</span></span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', color: 'var(--text-muted)' }}>
                           <PieChart size={32} style={{ marginBottom: '1rem', opacity: 0.5 }} />
                           <p>No pipeline data to display yet.</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="card glass" style={{ padding: '2rem', marginTop: '1rem' }}>
                    <h4 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}><Clock size={18} color="#fbbf24"/> Recent Candidate Activity</h4>
                    {analytics?.recentActivity?.length > 0 ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {analytics.recentActivity.map((activity, idx) => (
                          <div key={idx} style={{ display: 'flex', gap: '1rem', paddingBottom: idx !== analytics.recentActivity.length - 1 ? '1rem' : '0', borderBottom: idx !== analytics.recentActivity.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
                            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(52, 211, 153, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#34d399', flexShrink: 0 }}>
                              <Users size={16} />
                            </div>
                            <div>
                              <p style={{ color: 'white', fontSize: '0.95rem', marginBottom: '4px' }}><strong>{activity.candidate_name}</strong> applied for <strong style={{ color: '#34d399' }}>{activity.title}</strong></p>
                              <p style={{ color: '#94a3b8', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <Calendar size={12} /> {new Date(activity.created_at).toLocaleString()} • <span style={{ textTransform: 'capitalize', color: activity.status === 'accepted' ? '#34d399' : activity.status === 'rejected' ? '#f87171' : '#c084fc' }}>{activity.status}</span>
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p style={{ color: '#94a3b8', fontSize: '0.9rem', fontStyle: 'italic' }}>No recent applicant activity to display.</p>
                    )}
                  </div>
                </>
              )}
            </motion.div>
          )}

          {/* Tab: Manage Jobs */}
          {activeTab === 'manage-jobs' && (
            <motion.div key="manage-jobs" variants={tabVariants} initial="hidden" animate="visible" exit="exit" className="card glass" style={{ padding: '2.5rem' }}>
              <div className="card-title" style={{ marginBottom: '2rem' }}>
                <h3 style={{ fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '12px' }}><Briefcase color="#818cf8"/> Your Active Job Listings</h3>
              </div>

              {jobsLoading ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {[1, 2, 3].map(i => <SkeletonJobCard key={i} />)}
                </div>
              ) : myJobs.length > 0 ? (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem' }}>
                  {myJobs.map((job, idx) => (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }} key={job.id} className="card" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', transition: 'all 0.2s', ':hover': { background: 'rgba(255,255,255,0.05)', borderColor: 'rgba(129,140,248,0.3)' } }}>
                      <div>
                        <h4 style={{ fontSize: '1.2rem', fontWeight: 600, color: 'white', marginBottom: '0.5rem' }}>{job.title}</h4>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '1rem' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Building size={14} /> {job.location}</span>
                          <span>•</span>
                          <span>{job.salary_range}</span>
                          <span>•</span>
                          <span style={{ color: '#c084fc', fontWeight: 500 }}>{job.experience_level || 'Mid-Level'}</span>
                        </div>
                        <div style={{ display: 'flex', gap: '0.75rem' }}>
                          <span className="badge active" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Users size={12}/> {job.applicantCount} {job.applicantCount === 1 ? 'applicant' : 'applicants'}</span>
                          {job.is_featured === 1 && <span className="badge warning" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Activity size={12}/> Featured</span>}
                        </div>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <button className="btn btn-primary" onClick={() => handleViewApplicants(job)} style={{ borderRadius: '10px' }}>
                           Review Candidates <ArrowRight size={16} style={{ marginLeft: '4px' }}/>
                        </button>
                        <button className="btn btn-outline" style={{ borderRadius: '10px', color: '#f87171', borderColor: 'rgba(248, 113, 113, 0.2)' }} onClick={() => handleDeleteJob(job.id, job.title)}>
                          <Trash2 size={14} style={{ marginRight: '6px' }} /> Delete Listing
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '60px 40px', background: 'rgba(255,255,255,0.02)', borderRadius: '20px', border: '1px dashed rgba(255,255,255,0.1)' }}>
                  <div style={{ width: '64px', height: '64px', background: 'rgba(129, 140, 248, 0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px auto' }}>
                    <Briefcase size={32} style={{ color: '#818cf8' }} />
                  </div>
                  <h4 style={{ fontSize: '1.25rem', color: 'white', marginBottom: '8px' }}>No active job postings</h4>
                  <p style={{ color: '#94a3b8', marginBottom: '24px', maxWidth: '400px', margin: '0 auto 24px auto' }}>Publish a new position opening to start receiving matching candidate profiles.</p>
                  <button className="btn btn-primary" onClick={() => setActiveTab('post-job')} style={{ borderRadius: '12px' }}>
                    <PlusCircle size={18} style={{ marginRight: '8px' }}/> Publish First Job
                  </button>
                </div>
              )}
            </motion.div>
          )}

          {/* Tab: Post a Job */}
          {activeTab === 'post-job' && (
            <motion.div key="post-job" variants={tabVariants} initial="hidden" animate="visible" exit="exit" className="card glass" style={{ padding: '2.5rem' }}>
              <div className="card-title" style={{ marginBottom: '2.5rem', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '12px' }}><PlusCircle color="#c084fc"/> Publish a New Job Opening</h3>
                <p style={{ color: '#94a3b8', fontSize: '0.95rem', marginTop: '8px' }}>Reach thousands of top-tier professionals instantly.</p>
              </div>
              
              <form onSubmit={handlePostJob}>
                <div className="responsive-grid-2" style={{ gap: '1.5rem', marginBottom: '1.5rem' }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Job Title <span style={{ color: '#f87171' }}>*</span></label>
                    <input type="text" className="premium-input-field" placeholder="e.g. Senior Backend Engineer" value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} required />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Location <span style={{ color: '#f87171' }}>*</span></label>
                    <input type="text" className="premium-input-field" placeholder="e.g. Bangalore, KA (Hybrid)" value={jobLocation} onChange={(e) => setJobLocation(e.target.value)} required />
                  </div>
                </div>

                <div className="responsive-grid-3" style={{ gap: '1.5rem', marginBottom: '1.5rem' }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Employment Type <span style={{ color: '#f87171' }}>*</span></label>
                    <select className="premium-input-field" value={jobType} onChange={(e) => setJobType(e.target.value)} style={{ appearance: 'none', background: 'rgba(0,0,0,0.2) url("data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\' width=\'24\' height=\'24\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%2394a3b8\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'><polyline points=\'6 9 12 15 18 9\'></polyline></svg>") no-repeat right 16px center', backgroundSize: '16px' }}>
                      <option value="Full-time" style={{ background: 'var(--color-surface)' }}>Full-time</option>
                      <option value="Part-time" style={{ background: 'var(--color-surface)' }}>Part-time</option>
                      <option value="Contract" style={{ background: 'var(--color-surface)' }}>Contract</option>
                      <option value="Remote" style={{ background: 'var(--color-surface)' }}>Remote</option>
                    </select>
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Experience Level <span style={{ color: '#f87171' }}>*</span></label>
                    <select className="premium-input-field" value={jobExperienceLevel} onChange={(e) => setJobExperienceLevel(e.target.value)} style={{ appearance: 'none', background: 'rgba(0,0,0,0.2) url("data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\' width=\'24\' height=\'24\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%2394a3b8\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'><polyline points=\'6 9 12 15 18 9\'></polyline></svg>") no-repeat right 16px center', backgroundSize: '16px' }}>
                      <option value="Entry" style={{ background: 'var(--color-surface)' }}>Entry Level</option>
                      <option value="Mid-Level" style={{ background: 'var(--color-surface)' }}>Mid-Level</option>
                      <option value="Senior" style={{ background: 'var(--color-surface)' }}>Senior Level</option>
                      <option value="Lead" style={{ background: 'var(--color-surface)' }}>Lead / Manager</option>
                    </select>
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Salary Range <span style={{ color: '#f87171' }}>*</span></label>
                    <input type="text" className="premium-input-field" placeholder="e.g. ₹10,00,000 - ₹15,00,000 / year" value={jobSalary} onChange={(e) => setJobSalary(e.target.value)} required />
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                  <label className="form-label">Job Overview & Description <span style={{ color: '#f87171' }}>*</span></label>
                  <textarea className="premium-input-field" rows="6" placeholder="Provide a detailed overview of the role, team, and impact..." value={jobDesc} onChange={(e) => setJobDesc(e.target.value)} required style={{ resize: 'vertical' }} />
                </div>

                <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                  <label className="form-label">Key Requirements <span style={{ color: '#94a3b8', fontSize: '0.8rem', fontWeight: 400 }}>(One per line)</span> <span style={{ color: '#f87171' }}>*</span></label>
                  <textarea className="premium-input-field" rows="5" placeholder="3+ years React.js experience&#10;Familiarity with Node.js&#10;Excellent communication skills" value={jobReq} onChange={(e) => setJobReq(e.target.value)} required style={{ resize: 'vertical' }} />
                </div>

                <div className="form-group" style={{ marginBottom: '2rem' }}>
                  <label className="form-label">Compensation & Benefits <span style={{ color: '#94a3b8', fontSize: '0.8rem', fontWeight: 400 }}>(Optional, one per line)</span></label>
                  <textarea className="premium-input-field" rows="3" placeholder="Unlimited PTO&#10;Premium health coverage&#10;Home office stipend" value={jobBenefits} onChange={(e) => setJobBenefits(e.target.value)} style={{ resize: 'vertical' }} />
                </div>

                <div className="form-group" style={{ marginBottom: '2rem', padding: '1.5rem', background: 'rgba(129, 140, 248, 0.05)', border: '1px dashed rgba(129, 140, 248, 0.2)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
                  <div>
                    <h4 style={{ color: 'white', fontSize: '0.95rem', fontWeight: 600, marginBottom: '4px' }}>Bulk Job Posting</h4>
                    <p style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Upload a CSV file to post multiple job listings at once.</p>
                  </div>
                  <label className="btn btn-outline" style={{ cursor: 'pointer', borderRadius: '10px', display: 'inline-flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                    <Upload size={16} /> Upload CSV
                    <input type="file" accept=".csv" style={{ display: 'none' }} onChange={async (e) => {
                      const file = e.target.files[0];
                      if (!file) return;
                      try {
                        const formData = new FormData();
                        formData.append('csv', file);
                        await apiUpload('/jobs/bulk-upload', formData);
                        addToast('Jobs uploaded successfully!', 'success');
                        loadMyJobs();
                      } catch (err) {
                        addToast(err.message || 'Failed to upload jobs CSV.', 'error');
                      }
                    }} />
                  </label>
                </div>
                <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2.5rem', background: 'rgba(251, 191, 36, 0.05)', border: '1px solid rgba(251, 191, 36, 0.2)', padding: '1rem', borderRadius: '12px' }}>
                  <input type="checkbox" checked={jobFeatured} onChange={(e) => setJobFeatured(e.target.checked)} style={{ width: '18px', height: '18px', accentColor: '#fbbf24', cursor: 'pointer' }} id="featured-check" />
                  <label htmlFor="featured-check" style={{ fontSize: '0.95rem', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                     Mark as Featured Listing <span className="badge warning" style={{ padding: '2px 6px', fontSize: '0.7rem' }}>Premium</span>
                  </label>
                  <span style={{ fontSize: '0.85rem', color: '#94a3b8', marginLeft: 'auto' }}>Highlighted placement on landing page</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '1.5rem' }}>
                  <button type="button" className="btn btn-outline" onClick={() => setActiveTab('manage-jobs')} style={{ borderRadius: '12px' }}>Cancel</button>
                  <button type="submit" className="btn btn-primary" disabled={actionLoading} style={{ borderRadius: '12px', minWidth: '180px' }}>
                    {actionLoading ? 'Publishing...' : 'Publish Job Listing'}
                  </button>
                </div>
              </form>
            </motion.div>
          )}

          {/* Tab: Company Profile */}
          {activeTab === 'company-profile' && (
            <motion.div key="company-profile" variants={tabVariants} initial="hidden" animate="visible" exit="exit" className="card glass" style={{ padding: '2.5rem' }}>
              <div className="card-title" style={{ marginBottom: '2.5rem', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '12px' }}><Building color="#34d399"/> Company Public Profile</h3>
                <p style={{ color: '#94a3b8', fontSize: '0.95rem', marginTop: '8px' }}>This information is visible to candidates when they view your job listings.</p>
              </div>

              {profileLoading ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  <SkeletonText type="lg" />
                  <SkeletonText type="lg" />
                  <SkeletonText type="lg" style={{ height: '120px' }} />
                </div>
              ) : (
                <form onSubmit={handleProfileSubmit}>
                  <div className="responsive-grid-2" style={{ gap: '1.5rem', marginBottom: '1.5rem' }}>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">Company Legal Name</label>
                      <input type="text" className="premium-input-field" value={companyName} onChange={(e) => setCompanyName(e.target.value)} required />
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">Company Website URL</label>
                      <input type="url" className="premium-input-field" placeholder="https://techcorp.com" value={companyWebsite} onChange={(e) => setCompanyWebsite(e.target.value)} />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">About the Company (Bio)</label>
                    <textarea className="premium-input-field" rows="6" placeholder="Share a short bio about your mission, culture, and team..." value={companyBio} onChange={(e) => setCompanyBio(e.target.value)} style={{ resize: 'vertical' }} />
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '2rem', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '1.5rem' }}>
                    <button type="submit" className="btn btn-primary" disabled={actionLoading} style={{ borderRadius: '12px', background: 'linear-gradient(135deg, #10b981, #059669)' }}>
                      {actionLoading ? 'Saving...' : 'Save Profile Changes'}
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          )}

          {/* Tab: Candidate Search */}
          {activeTab === 'candidate-search' && (
            <motion.div key="candidate-search" variants={tabVariants} initial="hidden" animate="visible" exit="exit" className="card glass" style={{ padding: '2.5rem' }}>
              <div className="card-title" style={{ marginBottom: '2.5rem', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '12px' }}><Search color="#818cf8"/> Candidate Search</h3>
                <p style={{ color: '#94a3b8', fontSize: '0.95rem', marginTop: '8px' }}>Search for candidates by name, skills, or experience level.</p>
              </div>
              <div style={{ display: 'flex', gap: '12px', marginBottom: '2rem' }}>
                <input type="text" className="premium-input-field" placeholder="Search by skills, name, or title..." value={candidateSearch} onChange={(e) => setCandidateSearch(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleCandidateSearch()} style={{ flex: 1 }} />
                <button className="btn btn-primary" onClick={handleCandidateSearch} disabled={candidateSearchLoading} style={{ borderRadius: '12px' }}>
                  <Search size={16} style={{ marginRight: '6px' }} /> {candidateSearchLoading ? 'Searching...' : 'Search'}
                </button>
              </div>
              {candidateResults.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {candidateResults.map((candidate, idx) => (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }} key={candidate.id || idx} className="card" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <h4 style={{ color: 'white', fontWeight: 600, marginBottom: '4px' }}>{candidate.name}</h4>
                        <p style={{ color: '#94a3b8', fontSize: '0.85rem' }}>{candidate.title} {candidate.skills && <span>&bull; {candidate.skills}</span>}</p>
                      </div>
                      <button className="btn btn-outline btn-sm" style={{ borderRadius: '8px' }} onClick={() => addToast('Messaging coming soon!', 'info')}>
                        <MessageSquare size={14} style={{ marginRight: '4px' }} /> Contact
                      </button>
                    </motion.div>
                  ))}
                </div>
              ) : candidateSearch && !candidateSearchLoading ? (
                <div style={{ textAlign: 'center', padding: '60px 40px', background: 'rgba(255,255,255,0.02)', borderRadius: '20px', border: '1px dashed rgba(255,255,255,0.1)' }}>
                  <Users size={32} style={{ color: '#64748b', margin: '0 auto 12px auto' }} />
                  <p style={{ color: '#94a3b8' }}>No candidates match your search criteria. Try different keywords.</p>
                </div>
              ) : null}
              {!candidateSearch && candidateResults.length === 0 && (
                <div style={{ textAlign: 'center', padding: '60px 40px', background: 'rgba(255,255,255,0.02)', borderRadius: '20px', border: '1px dashed rgba(255,255,255,0.1)' }}>
                  <Search size={32} style={{ color: '#64748b', margin: '0 auto 12px auto' }} />
                  <p style={{ color: '#94a3b8' }}>Enter a search term above to find candidates.</p>
                </div>
              )}
            </motion.div>
          )}

          {/* Tab: Offer Letters */}
          {activeTab === 'offer-letters' && (
            <motion.div key="offer-letters" variants={tabVariants} initial="hidden" animate="visible" exit="exit" className="card glass" style={{ padding: '2.5rem' }}>
              <div className="card-title" style={{ marginBottom: '2.5rem', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '12px' }}><ScrollText color="#fbbf24"/> Offer Letters</h3>
                <p style={{ color: '#94a3b8', fontSize: '0.95rem', marginTop: '8px' }}>Manage offer letters sent to candidates.</p>
              </div>
              {offerLettersLoading ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {[1, 2].map(i => <SkeletonCard key={i} />)}
                </div>
              ) : offerLetters.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {offerLetters.map((letter, idx) => (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }} key={letter.id || idx} className="card" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', padding: '1.5rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <h4 style={{ color: 'white', fontWeight: 600, marginBottom: '4px' }}>{letter.candidate_name}</h4>
                          <p style={{ color: '#94a3b8', fontSize: '0.85rem' }}>{letter.position_title} &bull; {letter.status || 'Draft'}</p>
                        </div>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          {letter.file_url && (
                            <a href={letter.file_url} target="_blank" rel="noopener noreferrer" className="btn btn-outline btn-sm" style={{ borderRadius: '8px' }}>
                              <FileText size={14} style={{ marginRight: '4px' }} /> View
                            </a>
                          )}
                          <span className="badge" style={{
                            background: letter.status === 'accepted' ? 'rgba(52,211,153,0.15)' : letter.status === 'rejected' ? 'rgba(248,113,113,0.15)' : 'rgba(251,191,36,0.15)',
                            color: letter.status === 'accepted' ? '#34d399' : letter.status === 'rejected' ? '#f87171' : '#fbbf24',
                          }}>{letter.status || 'Draft'}</span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '60px 40px', background: 'rgba(255,255,255,0.02)', borderRadius: '20px', border: '1px dashed rgba(255,255,255,0.1)' }}>
                  <ScrollText size={32} style={{ color: '#64748b', margin: '0 auto 12px auto' }} />
                  <p style={{ color: '#94a3b8' }}>No offer letters yet. Create and send offer letters to your selected candidates.</p>
                </div>
              )}
            </motion.div>
          )}

          {/* Tab: Messages */}
          {activeTab === 'messages' && <LiveChat />}

          {/* Tab: View Applicants */}
          {activeTab === 'view-applicants' && selectedJob && (
            <motion.div key="view-applicants" variants={tabVariants} initial="hidden" animate="visible" exit="exit" className="card glass" style={{ padding: '2.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '1.5rem' }}>
                <div>
                  <button className="btn btn-outline btn-sm" onClick={() => setActiveTab('manage-jobs')} style={{ marginBottom: '1.5rem', borderRadius: '10px' }}>
                    <ArrowLeft size={14} style={{ marginRight: '6px' }} /> Back to Postings
                  </button>
                  <h3 style={{ fontSize: '1.5rem', color: 'white', marginBottom: '8px' }}>Reviewing: {selectedJob.title}</h3>
                  <p style={{ color: '#94a3b8', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Clock size={14} /> Posted on {new Date(selectedJob.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span className="badge active" style={{ fontSize: '1.2rem', padding: '0.75rem 1.5rem', background: 'rgba(129, 140, 248, 0.1)', color: '#818cf8', border: '1px solid rgba(129, 140, 248, 0.2)' }}>
                    {applicants.length} Total Applicants
                  </span>
                </div>
              </div>

              {applicantsLoading ? (
                 <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {[1, 2].map(i => <SkeletonCard key={i} />)}
                 </div>
              ) : applicants.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  {applicants.map((app, idx) => (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }} key={app.application_id} className="card" style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255,255,255,0.05)', padding: '2rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', marginBottom: '1.5rem' }}>
                        <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center' }}>
                          <div style={{ width: '64px', height: '64px', borderRadius: '16px', background: 'linear-gradient(135deg, #475569, #1e293b)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 800, color: '#fff', boxShadow: '0 4px 15px rgba(0,0,0,0.2)' }}>
                            {app.candidate_name.split(' ').map(n => n[0]).join('').toUpperCase()}
                          </div>
                          <div>
                            <h4 style={{ fontSize: '1.3rem', color: 'white', fontWeight: 700, marginBottom: '4px' }}>{app.candidate_name}</h4>
                            <p style={{ fontSize: '0.9rem', color: '#c084fc', fontWeight: 600, marginBottom: '8px' }}>{app.candidate_title || 'Software Professional'}</p>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.85rem', color: '#94a3b8' }}>
                              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Mail size={12} /> {app.candidate_email}</span>
                              <span>•</span>
                              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Clock size={12} /> Applied {new Date(app.applied_at).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                          <div style={{ background: 'rgba(0,0,0,0.3)', padding: '4px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                            <select 
                              className="premium-input-field" 
                              value={app.status} 
                              onChange={(e) => handleStatusChange(app.application_id, e.target.value)} 
                              style={{ width: '160px', padding: '8px 16px', background: 'transparent', border: 'none', appearance: 'none', color: 
                                app.status === 'accepted' ? '#34d399' : 
                                app.status === 'rejected' ? '#f87171' : 
                                app.status === 'interviewing' ? '#fbbf24' : '#818cf8',
                                fontWeight: 600,
                                cursor: 'pointer'
                              }}
                            >
                              <option value="applied" style={{ color: 'white', background: 'var(--color-surface)' }}>🔵 Applied / New</option>
                              <option value="reviewing" style={{ color: 'white', background: 'var(--color-surface)' }}>🟣 Reviewing</option>
                              <option value="interviewing" style={{ color: 'white', background: 'var(--color-surface)' }}>🟡 Interviewing</option>
                              <option value="accepted" style={{ color: 'white', background: 'var(--color-surface)' }}>🟢 Accepted</option>
                              <option value="rejected" style={{ color: 'white', background: 'var(--color-surface)' }}>🔴 Rejected</option>
                            </select>
                          </div>
                        </div>
                      </div>

                      <div style={{ fontSize: '0.95rem', color: '#cbd5e1', display: 'flex', flexDirection: 'column', gap: '1.5rem', background: 'rgba(0,0,0,0.2)', padding: '1.5rem', borderRadius: '16px' }}>
                        {app.candidate_bio && (
                          <div><strong style={{ color: 'white', display: 'block', marginBottom: '6px' }}>Professional Summary</strong><p style={{ lineHeight: 1.6 }}>{app.candidate_bio}</p></div>
                        )}

                        {app.candidate_skills && (
                          <div>
                            <strong style={{ color: 'white', display: 'block', marginBottom: '8px' }}>Core Competencies</strong>
                            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                              {app.candidate_skills.split(',').map((skill, i) => (
                                <span key={i} className="badge" style={{ background: 'rgba(255,255,255,0.05)', color: '#e2e8f0', border: '1px solid rgba(255,255,255,0.1)', padding: '6px 12px', borderRadius: '8px' }}>{skill.trim()}</span>
                              ))}
                            </div>
                          </div>
                        )}

                        {(app.experience || app.education) && (
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', borderTop: '1px dashed rgba(255,255,255,0.08)', paddingTop: '1.5rem' }}>
                            {app.experience && <div><strong style={{ color: 'white', display: 'block', marginBottom: '8px' }}>Experience</strong><p style={{ whiteSpace: 'pre-line', lineHeight: 1.6, color: '#94a3b8' }}>{app.experience}</p></div>}
                            {app.education && <div><strong style={{ color: 'white', display: 'block', marginBottom: '8px' }}>Education</strong><p style={{ whiteSpace: 'pre-line', lineHeight: 1.6, color: '#94a3b8' }}>{app.education}</p></div>}
                          </div>
                        )}

                        {app.cover_letter && (
                          <div style={{ padding: '1.5rem', background: 'rgba(129, 140, 248, 0.05)', borderRadius: '12px', borderLeft: '4px solid #818cf8', marginTop: '0.5rem' }}>
                            <strong style={{ color: 'white', fontSize: '0.9rem', display: 'block', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px' }}>Cover Letter Attachment</strong>
                            <p style={{ fontStyle: 'italic', lineHeight: 1.7, color: '#cbd5e1' }}>"{app.cover_letter}"</p>
                          </div>
                        )}

                        <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '1.5rem', display: 'flex' }}>
                          <a href={getStaticUrl(app.resume_url)} className="btn btn-outline" target="_blank" rel="noopener noreferrer" style={{ borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.02)' }}>
                            <FileText size={16} /> View Candidate Resume Document
                          </a>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                 <div style={{ textAlign: 'center', padding: '60px 40px', background: 'rgba(255,255,255,0.02)', borderRadius: '20px', border: '1px dashed rgba(255,255,255,0.1)' }}>
                  <div style={{ width: '64px', height: '64px', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px auto' }}>
                    <Users size={32} style={{ color: '#94a3b8' }} />
                  </div>
                  <h4 style={{ fontSize: '1.25rem', color: 'white', marginBottom: '8px' }}>Awaiting Candidates</h4>
                  <p style={{ color: '#94a3b8', maxWidth: '400px', margin: '0 auto' }}>Nobody has applied to this position yet. Try marking it as featured to boost visibility.</p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
