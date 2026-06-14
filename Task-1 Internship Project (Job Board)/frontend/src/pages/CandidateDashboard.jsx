import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useToast } from '../components/ToastProvider';
import { SkeletonCard, SkeletonJobCard, SkeletonText } from '../components/SkeletonLoader';
import JobCard from '../components/JobCard';
import ResumeBuilder from '../components/ResumeBuilder';
import SkillAssessment from '../components/SkillAssessment';
import { apiGet, apiPut, apiUpload, apiPost, apiPatch, apiDelete, getStaticUrl } from '../utils/api';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Briefcase, FileText, Send, Calendar, CheckCircle, Upload, X, LogOut, ArrowLeft, BarChart2, Linkedin, Github, Bookmark, Activity, CheckCircle2, Clock, MessageSquare, Bell, TrendingUp, Settings, Inbox, Star, Award, Eye, Folder, Shield, ShieldCheck, ShieldAlert, Brain, Search, Mail, Sparkles, Download, Menu } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import ProfileStrength from '../components/ProfileStrength';

export default function CandidateDashboard() {
  const { user, syncUser, logout } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'analytics');

  const [name, setName] = useState(user?.name || '');
  const [title, setTitle] = useState('');
  const [bio, setBio] = useState('');
  const [skillsText, setSkillsText] = useState('');
  const [experience, setExperience] = useState('');
  const [education, setEducation] = useState('');
  const [resumeUrl, setResumeUrl] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [githubUrl, setGithubUrl] = useState('');

  const [profileLoading, setProfileLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const [applications, setApplications] = useState([]);
  const [appsLoading, setAppsLoading] = useState(false);

  const [savedJobs, setSavedJobs] = useState([]);
  const [savedLoading, setSavedLoading] = useState(false);

  const [analytics, setAnalytics] = useState(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);
  const [completeness, setCompleteness] = useState(0);

  const [messages, setMessages] = useState([]);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [messageThread, setMessageThread] = useState([]);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [replyText, setReplyText] = useState('');

  const [notifications, setNotifications] = useState([]);
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  const [notifFilter, setNotifFilter] = useState('all');

  const [documents, setDocuments] = useState([]);
  const [documentsLoading, setDocumentsLoading] = useState(false);

  const [insights, setInsights] = useState(null);
  const [insightsLoading, setInsightsLoading] = useState(false);

  const [notificationSettings, setNotificationSettings] = useState(null);
  const [settingsLoading, setSettingsLoading] = useState(false);

  const [alerts, setAlerts] = useState([]);
  const [alertsLoading, setAlertsLoading] = useState(false);
  const [showAlertModal, setShowAlertModal] = useState(false);
  const [alertForm, setAlertForm] = useState({ keywords: '', location: '', type: '', experience_level: '', frequency: 'daily' });

  const [savedSearches, setSavedSearches] = useState([]);
  const [savedSearchesLoading, setSavedSearchesLoading] = useState(false);
  const [offerLetters, setOfferLetters] = useState([]);
  const [offerLettersLoading, setOfferLettersLoading] = useState(false);
  const [isVerified] = useState(user?.is_verified || false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)');
    setIsMobile(mq.matches);
    const handler = (e) => setIsMobile(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  useEffect(() => {
    setSidebarOpen(false);
  }, [activeTab]);

  const COLORS = ['#818cf8', '#34d399', '#fbbf24', '#f87171', '#c084fc'];

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  const loadMessages = useCallback(async () => {
    setMessagesLoading(true);
    try {
      const data = await apiGet('/messages');
      setMessages(data);
    } catch (err) {
      console.error('Failed to load messages', err);
    } finally {
      setMessagesLoading(false);
    }
  }, [addToast]);

  const loadMessageThread = async (contactId) => {
    try {
      const data = await apiGet(`/messages/${contactId}`);
      setMessageThread(data);
    } catch (err) {
      console.error('Failed to load message thread', err);
    }
  };

  const handleSendReply = async () => {
    if (!replyText.trim() || !selectedMessage) return;
    try {
      await apiPost('/messages', {
        recipient_id: selectedMessage.contact_id,
        subject: selectedMessage.subject,
        body: replyText,
      });
      setReplyText('');
      addToast('Reply sent successfully!', 'success');
      loadMessageThread(selectedMessage.contact_id);
      loadMessages();
    } catch (err) {
      addToast('Failed to send reply.', 'error');
    }
  };

  const loadNotifications = useCallback(async () => {
    setNotificationsLoading(true);
    try {
      const data = await apiGet('/notifications');
      setNotifications(data);
    } catch (err) {
      console.error('Failed to load notifications', err);
    } finally {
      setNotificationsLoading(false);
    }
  }, [addToast]);

  const handleMarkNotifRead = async (id) => {
    try {
      await apiPatch(`/notifications/${id}/read`);
      setNotifications(prev =>
        prev.map(n => n.id === id ? { ...n, read: true } : n)
      );
    } catch (err) {
      console.error('Failed to mark notification read', err);
    }
  };

  const loadDocuments = useCallback(async () => {
    setDocumentsLoading(true);
    try {
      const data = await apiGet('/documents');
      setDocuments(data);
    } catch (err) {
      console.error('Failed to load documents', err);
    } finally {
      setDocumentsLoading(false);
    }
  }, [addToast]);

  const handleUploadDocument = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const formData = new FormData();
      formData.append('document', file);
      await apiUpload('/documents/upload', formData);
      addToast('Document uploaded successfully!', 'success');
      loadDocuments();
    } catch (err) {
      addToast(err.message || 'Failed to upload document.', 'error');
    }
  };

  const handleDeleteDocument = async (id) => {
    try {
      await apiDelete(`/documents/${id}`);
      setDocuments(prev => prev.filter(d => d.id !== id));
      addToast('Document removed.', 'success');
    } catch (err) {
      addToast('Failed to delete document.', 'error');
    }
  };

  const loadInsights = useCallback(async () => {
    setInsightsLoading(true);
    try {
      const data = await apiGet('/insights');
      setInsights(data);
    } catch (err) {
      console.error('Failed to load insights', err);
    } finally {
      setInsightsLoading(false);
    }
  }, [addToast]);

  const loadNotificationSettings = useCallback(async () => {
    setSettingsLoading(true);
    try {
      const data = await apiGet('/settings/notifications');
      setNotificationSettings(data);
    } catch (err) {
      console.error('Failed to load notification settings', err);
    } finally {
      setSettingsLoading(false);
    }
  }, [addToast]);

  const loadAlerts = useCallback(async () => {
    setAlertsLoading(true);
    try {
      const data = await apiGet('/alerts');
      setAlerts(data);
    } catch (err) {
      console.error('Failed to load alerts', err);
    } finally {
      setAlertsLoading(false);
    }
  }, [addToast]);

  const toggleSetting = async (key) => {
    const updated = { ...notificationSettings, [key]: !notificationSettings[key] };
    setNotificationSettings(updated);
    try {
      await apiPut('/settings/notifications', updated);
      addToast('Settings updated!', 'success');
    } catch (err) {
      addToast('Failed to update settings.', 'error');
      loadNotificationSettings();
    }
  };

  const loadSavedSearches = async () => {
    setSavedSearchesLoading(true);
    try {
      const data = await apiGet('/searches');
      setSavedSearches(data);
    } catch (err) {
      console.error('Failed to load saved searches', err);
    } finally {
      setSavedSearchesLoading(false);
    }
  };

  const loadOfferLetters = async () => {
    setOfferLettersLoading(true);
    try {
      const data = await apiGet('/offers/candidate');
      setOfferLetters(data);
    } catch (err) {
      console.error('Failed to load offer letters', err);
    } finally {
      setOfferLettersLoading(false);
    }
  };

  useEffect(() => {
    setSearchParams({ tab: activeTab });
    if (activeTab === 'applications') loadApplications();
    if (activeTab === 'analytics') loadAnalytics();
    if (activeTab === 'profile') loadProfile();
    if (activeTab === 'saved-jobs') loadSavedJobs();
    if (activeTab === 'saved-searches') loadSavedSearches();
    if (activeTab === 'offer-letters') loadOfferLetters();
    if (activeTab === 'messages') loadMessages();
    if (activeTab === 'notifications') loadNotifications();
    if (activeTab === 'documents') loadDocuments();
    if (activeTab === 'insights') loadInsights();
    if (activeTab === 'settings') loadNotificationSettings();
    if (activeTab === 'alerts') loadAlerts();
  }, [activeTab, setSearchParams]);

  useEffect(() => {
    loadProfile();
    loadAnalytics();
  }, []);

  const loadSavedJobs = async () => {
    setSavedLoading(true);
    try {
      const data = await apiGet('/bookmarks');
      setSavedJobs(data);
    } catch (err) {
      console.error('Failed to load saved jobs', err);
      addToast('Failed to load your bookmarks', 'error');
    } finally {
      setSavedLoading(false);
    }
  };

  const calculateCompleteness = (profile) => {
    const fields = ['title', 'bio', 'skills', 'experience', 'education', 'resume_url', 'linkedin_url', 'github_url'];
    let filled = 0;
    fields.forEach(f => {
      if (profile[f] && profile[f].trim() !== '') filled++;
    });
    return Math.round(((filled + 1) / (fields.length + 1)) * 100);
  };

  const loadProfile = async () => {
    setProfileLoading(true);
    try {
      const profile = await apiGet('/profiles/me');
      if (profile) {
        setTitle(profile.title || '');
        setBio(profile.bio || '');
        setSkillsText(profile.skills || '');
        setExperience(profile.experience || '');
        setEducation(profile.education || '');
        setResumeUrl(profile.resume_url || '');
        setLinkedinUrl(profile.linkedin_url || '');
        setGithubUrl(profile.github_url || '');
        setCompleteness(calculateCompleteness(profile));
      }
    } catch (err) {
      console.error('Failed to load profile', err);
    } finally {
      setProfileLoading(false);
    }
  };

  const loadApplications = async () => {
    setAppsLoading(true);
    try {
      const data = await apiGet('/applications/candidate');
      setApplications(data);
    } catch (err) {
      console.error('Failed to load applications', err);
      addToast('Failed to load your applications', 'error');
    } finally {
      setAppsLoading(false);
    }
  };

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

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setActionLoading(true);

    try {
      const result = await apiPut('/profiles/me', {
        name, title, bio, skills: skillsText, experience, education, linkedin_url: linkedinUrl, github_url: githubUrl
      });

      syncUser(result.user);
      setCompleteness(calculateCompleteness(result.profile));
      addToast('Profile portfolio updated successfully!', 'success');
    } catch (err) {
      addToast(err.message || 'Failed to update profile.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleResumeUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setActionLoading(true);

    try {
      const formData = new FormData();
      formData.append('resume', file);

      const result = await apiUpload('/profiles/upload-resume', formData);
      setResumeUrl(result.resume_url);

      loadProfile();
      addToast('Resume document uploaded successfully!', 'success');
    } catch (err) {
      addToast(err.message || 'Failed to upload resume.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const tabVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
    exit: { opacity: 0, y: -10, transition: { duration: 0.2 } }
  };

  const CircularProgress = ({ value, size = 120, strokeWidth = 10 }) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - (value / 100) * circumference;

    return (
      <div style={{ position: 'relative', width: size, height: size, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
          <circle cx={size / 2} cy={size / 2} r={radius} stroke="rgba(255,255,255,0.05)" strokeWidth={strokeWidth} fill="transparent" />
          <circle cx={size / 2} cy={size / 2} r={radius} stroke="url(#progressGradient)" strokeWidth={strokeWidth} fill="transparent" strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round" style={{ transition: 'stroke-dashoffset 1s ease-in-out' }} />
          <defs>
            <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#818cf8" />
              <stop offset="100%" stopColor="#c084fc" />
            </linearGradient>
          </defs>
        </svg>
        <div style={{ position: 'absolute', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <span style={{ fontSize: '1.8rem', fontWeight: 800, color: 'white', lineHeight: 1 }}>{value}%</span>
        </div>
      </div>
    );
  };

  const unreadMsgCount = messages.filter(m => m.unread).length;
  const unreadNotifCount = notifications.filter(n => !n.read).length;

  const sidebarItems = [
    { key: 'analytics', icon: Activity, label: 'Dashboard Overview' },
    { key: 'profile', icon: FileText, label: 'Portfolio Details' },
    { key: 'applications', icon: Briefcase, label: 'Applied Roles' },
    { key: 'saved-jobs', icon: Bookmark, label: 'Saved Bookmarks' },
    { key: 'saved-searches', icon: Search, label: 'Saved Searches' },
    { key: 'offer-letters', icon: Mail, label: 'Offer Letters' },
    { key: 'alerts', icon: Bell, label: 'Job Alerts' },
    { key: 'messages', icon: MessageSquare, label: 'Messages', badge: unreadMsgCount },
    { key: 'documents', icon: Folder, label: 'Documents & Files' },
    { key: 'resume', icon: FileText, label: 'Resume Builder' },
    { key: 'assessments', icon: Brain, label: 'Skill Assessments' },
    { key: 'notifications', icon: Bell, label: 'Notifications', badge: unreadNotifCount },
    { key: 'insights', icon: TrendingUp, label: 'Career Insights' },
    { key: 'settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <div className="dashboard-container">
      <div className="bg-glow-1"></div>
      <div className="bg-glow-2"></div>
      <div className="bg-noise"></div>

      <div className={`sidebar-overlay ${sidebarOpen ? 'active' : ''}`} onClick={() => setSidebarOpen(false)}></div>
      <aside className={`sidebar glass ${sidebarOpen ? 'mobile-open' : ''}`} style={{ border: 'none', borderRight: '1px solid rgba(255,255,255,0.08)' }}>
        <div style={{ marginBottom: '2.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }} onClick={() => navigate('/dashboard')}>
          <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'linear-gradient(135deg, #c084fc, #818cf8)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 15px rgba(192, 132, 252, 0.4)' }}>
            <User size={18} color="#fff" strokeWidth={2.5} />
          </div>
          <span style={{ fontSize: '1.2rem', fontWeight: 800, color: 'white' }}>Workspace</span>
        </div>

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          {sidebarItems.map(item => (
            <button key={item.key} className={`nav-item ${activeTab === item.key ? 'active' : ''}`} onClick={() => setActiveTab(item.key)} style={{ position: 'relative' }}>
              <item.icon size={18} /><span>{item.label}</span>
              {item.badge ? <span style={{ position: 'absolute', right: '12px', background: '#818cf8', color: 'white', fontSize: '0.65rem', fontWeight: 700, padding: '2px 7px', borderRadius: '10px', lineHeight: 1.4 }}>{item.badge}</span> : null}
            </button>
          ))}
        </div>

        <button className="nav-item" onClick={() => { logout(); navigate('/'); }} style={{ marginTop: 'auto', color: '#f87171' }}>
          <LogOut size={18} /><span>Sign Out</span>
        </button>
      </aside>

      <main className="main-content-dash">
        <div className="header-bar" style={{ background: 'transparent', border: 'none', paddingBottom: 0, display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
          <button className="sidebar-toggle" onClick={() => setSidebarOpen(true)} style={{ marginTop: '4px', flexShrink: 0 }}>
            <Menu size={20} />
          </button>
          <div className="welcome-text">
            <h1>{getGreeting()}, {user?.name.split(' ')[0]} {isVerified ? <ShieldCheck size={20} color="#34d399" style={{ display: 'inline', verticalAlign: 'middle' }} title="Verified" /> : <ShieldAlert size={20} color="#f87171" style={{ display: 'inline', verticalAlign: 'middle' }} title="Unverified" />} <span className="wave-emoji">👋</span></h1>
            <p>Manage your professional identity and track your career progression.</p>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {activeTab === 'analytics' && (
            <motion.div key="analytics" variants={tabVariants} initial="hidden" animate="visible" exit="exit" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {analyticsLoading ? (
                 <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))', gap: '1.5rem' }}>
                   {[1, 2].map(i => <SkeletonCard key={i} />)}
                 </div>
              ) : (
                <>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 240px), 1fr))', gap: '1.5rem' }}>
                    <div className="card glass stat-card" style={{ padding: '2rem', position: 'relative', overflow: 'hidden' }}>
                      <div style={{ position: 'absolute', top: '-20px', right: '-20px', opacity: 0.1, color: '#818cf8' }}><Briefcase size={120} /></div>
                      <p style={{ color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', fontSize: '0.8rem', letterSpacing: '1px' }}>Total Applications</p>
                      <h3 style={{ fontSize: '3rem', fontWeight: 800, color: 'white', marginTop: '0.5rem' }}>{analytics?.totalApplications || 0}</h3>
                      <button className="btn btn-primary btn-sm" onClick={() => navigate('/jobs')} style={{ marginTop: '1rem', borderRadius: '8px' }}>Explore More Roles</button>
                    </div>

                    <div className="card glass stat-card" style={{ padding: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '2rem', flexWrap: 'wrap' }}>
                      <div style={{ flex: '1 1 160px' }}>
                        <p style={{ color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', fontSize: '0.8rem', letterSpacing: '1px' }}>Profile Strength</p>
                        <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'white', marginTop: '0.5rem', marginBottom: '0.5rem' }}>
                          {completeness === 100 ? 'All-Star' : completeness > 70 ? 'Advanced' : 'Beginner'}
                        </h3>
                        {completeness < 100 ? (
                          <p style={{ fontSize: '0.85rem', color: '#fbbf24', lineHeight: 1.5 }}>Add more details to boost your visibility to employers.</p>
                        ) : (
                          <p style={{ fontSize: '0.85rem', color: '#34d399', lineHeight: 1.5, display: 'flex', alignItems: 'center', gap: '4px' }}><CheckCircle2 size={14}/> Your profile looks great!</p>
                        )}
                        <button className="btn btn-outline btn-sm" onClick={() => setActiveTab('profile')} style={{ marginTop: '1rem', borderRadius: '8px' }}>Edit Details</button>
                      </div>
                      <CircularProgress value={completeness} />
                    </div>
                  </div>

                  <div className="card glass" style={{ padding: '2rem' }}>
                    <h4 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}><Activity size={18} color="#c084fc"/> Application Pipeline Status</h4>
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
                      <div className="empty-state-dash" style={{ textAlign: 'center', padding: isMobile ? '40px 24px' : '60px 40px', background: 'rgba(255,255,255,0.02)', borderRadius: '20px', border: '1px dashed rgba(255,255,255,0.1)' }}>
                        <Briefcase size={32} style={{ color: '#94a3b8', margin: '0 auto 12px auto' }} />
                        <p style={{ color: 'white', fontSize: '1.1rem', marginBottom: '8px' }}>No Application History</p>
                        <p style={{ color: '#94a3b8', marginBottom: '20px' }}>Submit applications to start seeing your pipeline analytics.</p>
                        <button className="btn btn-primary" onClick={() => navigate('/jobs')} style={{ borderRadius: '10px' }}>Discover Opportunities</button>
                      </div>
                    )}
                  </div>

                  <div className="card glass" style={{ padding: '2rem' }}>
                    <h4 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}><Clock size={18} color="#fbbf24"/> Recent Activity Timeline</h4>
                    {analytics?.recentActivity?.length > 0 ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {analytics.recentActivity.map((activity, idx) => (
                          <div key={idx} style={{ display: 'flex', gap: '1rem', paddingBottom: idx !== analytics.recentActivity.length - 1 ? '1rem' : '0', borderBottom: idx !== analytics.recentActivity.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
                            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(129, 140, 248, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#818cf8', flexShrink: 0 }}>
                              <Briefcase size={16} />
                            </div>
                            <div>
                              <p style={{ color: 'white', fontSize: '0.95rem', marginBottom: '4px' }}>You applied for <strong style={{ color: '#818cf8' }}>{activity.title}</strong> at {activity.company_name}</p>
                              <p style={{ color: '#94a3b8', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <Calendar size={12} /> {new Date(activity.created_at).toLocaleString()} &bull; <span style={{ textTransform: 'capitalize', color: activity.status === 'accepted' ? '#34d399' : activity.status === 'rejected' ? '#f87171' : '#c084fc' }}>{activity.status}</span>
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p style={{ color: '#94a3b8', fontSize: '0.9rem', fontStyle: 'italic' }}>No recent activity to display.</p>
                    )}
                  </div>
                </>
              )}
            </motion.div>
          )}

          {activeTab === 'profile' && (
            <motion.div key="profile" variants={tabVariants} initial="hidden" animate="visible" exit="exit" className="dashboard-profile-grid" style={{ gap: '1.5rem' }}>
              <div className="card glass card-dash">
              <div className="card-title" style={{ marginBottom: '2.5rem', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '12px' }}><User color="#34d399"/> Portfolio Information</h3>
                <p style={{ color: '#94a3b8', fontSize: '0.95rem', marginTop: '8px' }}>Build a compelling professional identity to stand out to elite employers.</p>
              </div>

              {profileLoading ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  <SkeletonText type="lg" />
                  <SkeletonText type="lg" style={{ height: '120px' }} />
                  <SkeletonText type="lg" style={{ height: '80px' }} />
                </div>
              ) : (
                <form onSubmit={handleProfileSubmit}>
                  <div className="responsive-grid-2" style={{ gap: '1.5rem', marginBottom: '1.5rem' }}>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">Full Legal Name</label>
                      <input type="text" className="premium-input-field" value={name} onChange={(e) => setName(e.target.value)} required />
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">Professional Headline / Title</label>
                      <input type="text" className="premium-input-field" placeholder="e.g. Lead Frontend React Developer" value={title} onChange={(e) => setTitle(e.target.value)} />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Professional Summary (Bio)</label>
                    <textarea className="premium-input-field" rows="4" placeholder="Craft a compelling narrative about your career trajectory and expertise..." value={bio} onChange={(e) => setBio(e.target.value)} style={{ resize: 'vertical' }} />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Core Competencies & Skills <span style={{ color: '#94a3b8', fontSize: '0.8rem', fontWeight: 400 }}>(Comma-separated)</span></label>
                    <input type="text" className="premium-input-field" placeholder="e.g. React, Node.js, TypeScript, UI/UX" value={skillsText} onChange={(e) => setSkillsText(e.target.value)} />
                    {skillsText && (
                      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '1rem' }}>
                        {skillsText.split(',').map((skill, index) => {
                          const clean = skill.trim();
                          if (!clean) return null;
                          return (
                            <span key={index} className="badge" style={{ background: 'rgba(255,255,255,0.05)', color: '#e2e8f0', border: '1px solid rgba(255,255,255,0.1)', padding: '6px 12px', borderRadius: '8px' }}>
                              {clean}
                            </span>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  <div className="responsive-grid-2" style={{ gap: '1.5rem', marginBottom: '1.5rem', marginTop: '2rem' }}>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">Work Experience</label>
                      <textarea className="premium-input-field" rows="5" placeholder="TechCorp Inc.\nSenior Engineer (2020 - Present)\nLed development of core platform..." value={experience} onChange={(e) => setExperience(e.target.value)} style={{ resize: 'vertical' }} />
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">Education History</label>
                      <textarea className="premium-input-field" rows="5" placeholder="B.S. Computer Science\nUniversity of Technology (2016 - 2020)\nGPA: 3.8" value={education} onChange={(e) => setEducation(e.target.value)} style={{ resize: 'vertical' }} />
                    </div>
                  </div>

                  <div className="responsive-grid-2" style={{ gap: '1.5rem', marginBottom: '1.5rem' }}>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Linkedin size={14}/> LinkedIn URL</label>
                      <input type="url" className="premium-input-field" placeholder="https://linkedin.com/in/username" value={linkedinUrl} onChange={(e) => setLinkedinUrl(e.target.value)} />
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Github size={14}/> GitHub URL</label>
                      <input type="url" className="premium-input-field" placeholder="https://github.com/username" value={githubUrl} onChange={(e) => setGithubUrl(e.target.value)} />
                    </div>
                  </div>

                  <div className="form-group" style={{ marginTop: '3rem', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '2.5rem' }}>
                    <label className="form-label" style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>Resume Attachment</label>
                    {resumeUrl ? (
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.5rem', background: 'rgba(255,255,255,0.02)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.08)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                          <div style={{ width: '56px', height: '56px', borderRadius: '14px', background: 'linear-gradient(135deg, rgba(129, 140, 248, 0.2), rgba(192, 132, 252, 0.2))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#c084fc' }}>
                            <FileText size={28} />
                          </div>
                          <div>
                            <p style={{ fontWeight: 600, fontSize: '1.05rem', color: 'white', marginBottom: '4px' }}>Active Resume Document</p>
                            <a href={getStaticUrl(resumeUrl)} target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.85rem', color: '#818cf8', textDecoration: 'none', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <CheckCircle size={12} /> Successfully Uploaded &mdash; View File
                            </a>
                          </div>
                        </div>
                        <label className="btn btn-outline" style={{ cursor: 'pointer', borderRadius: '10px' }}>
                          <Upload size={14} style={{ marginRight: '6px' }}/> Replace Document
                          <input type="file" accept=".pdf,.doc,.docx,.txt,.rtf" onChange={handleResumeUpload} style={{ display: 'none' }} />
                        </label>
                      </div>
                    ) : (
                      <div style={{ padding: '3rem', border: '2px dashed rgba(255,255,255,0.1)', borderRadius: '20px', textAlign: 'center', background: 'rgba(255,255,255,0.02)' }}>
                        <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem auto' }}>
                          <Upload size={28} style={{ color: '#818cf8' }} />
                        </div>
                        <p style={{ fontWeight: 600, fontSize: '1.1rem', color: 'white', marginBottom: '8px' }}>Select or drag your resume to upload</p>
                        <p style={{ fontSize: '0.9rem', color: '#94a3b8', marginBottom: '2rem' }}>Supports PDF, DOCX, or TXT formats (Max 5MB)</p>
                        <label className="btn btn-primary" style={{ cursor: 'pointer', display: 'inline-flex', borderRadius: '12px', padding: '0.8rem 1.5rem' }}>
                          <span>Browse Local Files</span>
                          <input type="file" accept=".pdf,.doc,.docx,.txt,.rtf" onChange={handleResumeUpload} style={{ display: 'none' }} />
                        </label>
                      </div>
                    )}
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '2.5rem', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '1.5rem' }}>
                    <button type="submit" className="btn btn-primary" disabled={actionLoading} style={{ borderRadius: '12px', padding: '0.8rem 2rem', fontSize: '1rem', background: 'linear-gradient(135deg, #10b981, #059669)' }}>
                      {actionLoading ? 'Saving...' : 'Save Portfolio Changes'}
                    </button>
                  </div>
                </form>
              )}
              </div>
              <div>
                <ProfileStrength profile={{ title, bio, skills: skillsText, experience, education, resume_url: resumeUrl, linkedin_url: linkedinUrl, github_url: githubUrl }} />
              </div>
            </motion.div>
          )}

          {activeTab === 'applications' && (
            <motion.div key="applications" variants={tabVariants} initial="hidden" animate="visible" exit="exit" className="card glass card-dash">
              <div className="card-title" style={{ marginBottom: '2.5rem', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '12px' }}><Briefcase color="#f472b6"/> Job Application Status Tracker</h3>
                <p style={{ color: '#94a3b8', fontSize: '0.95rem', marginTop: '8px' }}>Monitor the progress of your active applications in real-time.</p>
              </div>

              {appsLoading ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {[1, 2, 3].map(i => <SkeletonJobCard key={i} />)}
                </div>
              ) : applications.length > 0 ? (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem' }}>
                  {applications.map((app, idx) => (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }} key={app.application_id} className="card app-card" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', padding: '1.5rem' }}>
                      <div className="app-card-info">
                         <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: '1.2rem', flexShrink: 0 }}>
                            {app.company_name.substring(0, 1).toUpperCase()}
                         </div>
                         <div style={{ minWidth: 0 }}>
                            <h4 style={{ fontSize: '1.15rem', fontWeight: 600, color: 'white', marginBottom: '0.4rem' }}>{app.job_title}</h4>
                            <div style={{ display: 'flex', gap: '12px', alignItems: 'center', fontSize: '0.85rem', color: '#94a3b8', flexWrap: 'wrap' }}>
                               <span>{app.company_name}</span>
                               <span>&bull;</span>
                               <span>{app.location}</span>
                               <span>&bull;</span>
                               <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Calendar size={12}/> Applied {new Date(app.applied_at).toLocaleDateString()}</span>
                            </div>
                         </div>
                      </div>
                      <div className="app-card-actions">
                        <span style={{ fontSize: '0.95rem', color: '#cbd5e1', fontWeight: 500 }}>{app.salary_range}</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                        <span className="badge" style={{
                          textTransform: 'capitalize', justifyContent: 'center', padding: '8px 12px',
                          background: app.status === 'accepted' ? 'rgba(52, 211, 153, 0.15)' :
                                      app.status === 'rejected' ? 'rgba(248, 113, 113, 0.15)' :
                                      app.status === 'interviewing' ? 'rgba(251, 191, 36, 0.15)' : 'rgba(129, 140, 248, 0.15)',
                          color: app.status === 'accepted' ? '#34d399' :
                                 app.status === 'rejected' ? '#f87171' :
                                 app.status === 'interviewing' ? '#fbbf24' : '#818cf8',
                          border: `1px solid ${
                                 app.status === 'accepted' ? 'rgba(52, 211, 153, 0.3)' :
                                 app.status === 'rejected' ? 'rgba(248, 113, 113, 0.3)' :
                                 app.status === 'interviewing' ? 'rgba(251, 191, 36, 0.3)' : 'rgba(129, 140, 248, 0.3)'
                          }`
                        }}>
                          {app.status === 'applied' ? '\uD83D\uDD35 Applied' :
                           app.status === 'reviewing' ? '\uD83D\uDD35 Reviewing' :
                           app.status === 'interviewing' ? '\uD83D\uDD35 Interviewing' :
                           app.status === 'accepted' ? '\uD83D\uDFE2 Accepted' : '\uD83D\uDD34 Rejected'}
                        </span>
                        <button className="btn btn-outline btn-sm" onClick={() => navigate(`/jobs/${app.job_id}`)} style={{ borderRadius: '8px', padding: '6px 12px' }}>
                           View Job
                        </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="empty-state-dash" style={{ textAlign: 'center', padding: isMobile ? '40px 24px' : '60px 40px', background: 'rgba(255,255,255,0.02)', borderRadius: '20px', border: '1px dashed rgba(255,255,255,0.1)' }}>
                  <div style={{ width: '64px', height: '64px', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px auto' }}>
                    <Briefcase size={32} style={{ color: '#94a3b8' }} />
                  </div>
                  <h4 style={{ fontSize: '1.25rem', color: 'white', marginBottom: '8px' }}>No submitted applications</h4>
                  <p style={{ color: '#94a3b8', marginBottom: '24px', maxWidth: '400px', margin: '0 auto 24px auto' }}>You haven't applied to any job listings yet. Start searching to explore matching roles!</p>
                  <button className="btn btn-primary" onClick={() => navigate('/jobs')} style={{ borderRadius: '12px' }}>Find Opportunities</button>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'saved-jobs' && (
            <motion.div key="saved-jobs" variants={tabVariants} initial="hidden" animate="visible" exit="exit" className="card glass card-dash">
              <div className="card-title" style={{ marginBottom: '2.5rem', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '12px' }}><Bookmark color="#fbbf24"/> Saved Bookmarks</h3>
                <p style={{ color: '#94a3b8', fontSize: '0.95rem', marginTop: '8px' }}>Access roles you've bookmarked to review or apply to later.</p>
              </div>

              {savedLoading ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {[1, 2].map(i => <SkeletonJobCard key={i} />)}
                </div>
              ) : savedJobs.length > 0 ? (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem' }}>
                  {savedJobs.map((job, idx) => (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }} key={job.id}>
                      <JobCard job={job} isInitiallyBookmarked={true} onBookmarkRemove={(id) => setSavedJobs(prev => prev.filter(j => j.id !== id))} />
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="empty-state-dash" style={{ textAlign: 'center', padding: isMobile ? '40px 24px' : '60px 40px', background: 'rgba(255,255,255,0.02)', borderRadius: '20px', border: '1px dashed rgba(255,255,255,0.1)' }}>
                  <div style={{ width: '64px', height: '64px', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px auto' }}>
                    <Bookmark size={32} style={{ color: '#94a3b8' }} />
                  </div>
                  <h4 style={{ fontSize: '1.25rem', color: 'white', marginBottom: '8px' }}>No saved roles yet</h4>
                  <p style={{ color: '#94a3b8', marginBottom: '24px', maxWidth: '400px', margin: '0 auto 24px auto' }}>Click the bookmark icon on any job listing to save it here for quick access later.</p>
                  <button className="btn btn-primary" onClick={() => navigate('/jobs')} style={{ borderRadius: '12px' }}>Explore Jobs</button>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'saved-searches' && (
            <motion.div key="saved-searches" variants={tabVariants} initial="hidden" animate="visible" exit="exit" className="card glass card-dash">
              <div className="card-title" style={{ marginBottom: '2.5rem', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '12px' }}><Search color="#818cf8"/> Saved Searches</h3>
                <p style={{ color: '#94a3b8', fontSize: '0.95rem', marginTop: '8px' }}>Quickly revisit your saved job searches and filters.</p>
              </div>
              {savedSearchesLoading ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {[1, 2].map(i => <SkeletonCard key={i} />)}
                </div>
              ) : savedSearches.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {savedSearches.map((search, idx) => (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }} key={search.id || idx} className="card" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <h4 style={{ color: 'white', fontWeight: 600, marginBottom: '4px' }}>{search.query || search.keywords || 'Search'}</h4>
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', fontSize: '0.85rem', color: '#94a3b8' }}>
                          {search.location && <span>{search.location}</span>}
                          {search.type && <span className="badge" style={{ fontSize: '0.75rem', padding: '2px 8px' }}>{search.type}</span>}
                        </div>
                      </div>
                      <button className="btn btn-outline btn-sm" onClick={() => navigate(`/jobs?search=${encodeURIComponent(search.query || '')}&location=${encodeURIComponent(search.location || '')}&type=${search.type || ''}`)} style={{ borderRadius: '8px' }}>
                        <Search size={14} style={{ marginRight: '4px' }} /> Run Search
                      </button>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="empty-state-dash" style={{ textAlign: 'center', padding: isMobile ? '40px 24px' : '60px 40px', background: 'rgba(255,255,255,0.02)', borderRadius: '20px', border: '1px dashed rgba(255,255,255,0.1)' }}>
                  <Search size={32} style={{ color: '#64748b', margin: '0 auto 12px auto' }} />
                  <p style={{ color: '#94a3b8' }}>No saved searches yet. Save your search filters from the job listings page.</p>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'offer-letters' && (
            <motion.div key="offer-letters" variants={tabVariants} initial="hidden" animate="visible" exit="exit" className="card glass card-dash">
              <div className="card-title" style={{ marginBottom: '2.5rem', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '12px' }}><Mail color="#34d399"/> Offer Letters</h3>
                <p style={{ color: '#94a3b8', fontSize: '0.95rem', marginTop: '8px' }}>Review and manage your employment offer letters.</p>
              </div>
              {offerLettersLoading ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {[1, 2].map(i => <SkeletonCard key={i} />)}
                </div>
              ) : offerLetters.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {offerLetters.map((letter, idx) => (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }} key={letter.id || idx} className="card" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <h4 style={{ color: 'white', fontWeight: 600, marginBottom: '4px' }}>{letter.title || 'Offer Letter'}</h4>
                        <p style={{ fontSize: '0.85rem', color: '#94a3b8' }}>{letter.company_name} &bull; {letter.status || 'Pending'}</p>
                      </div>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        {letter.file_url && (
                          <a href={letter.file_url} target="_blank" rel="noopener noreferrer" className="btn btn-outline btn-sm" style={{ borderRadius: '8px' }}>
                            <Download size={14} style={{ marginRight: '4px' }} /> View
                          </a>
                        )}
                        <span className="badge" style={{
                          background: letter.status === 'accepted' ? 'rgba(52,211,153,0.15)' : letter.status === 'rejected' ? 'rgba(248,113,113,0.15)' : 'rgba(251,191,36,0.15)',
                          color: letter.status === 'accepted' ? '#34d399' : letter.status === 'rejected' ? '#f87171' : '#fbbf24',
                        }}>{letter.status || 'Pending'}</span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="empty-state-dash" style={{ textAlign: 'center', padding: isMobile ? '40px 24px' : '60px 40px', background: 'rgba(255,255,255,0.02)', borderRadius: '20px', border: '1px dashed rgba(255,255,255,0.1)' }}>
                  <Mail size={32} style={{ color: '#64748b', margin: '0 auto 12px auto' }} />
                  <p style={{ color: '#94a3b8' }}>No offer letters yet. Once employers send you offers, they will appear here.</p>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'messages' && (
            <motion.div key="messages" variants={tabVariants} initial="hidden" animate="visible" exit="exit" className={selectedMessage ? "responsive-grid-2" : ""} style={{ display: 'grid', gridTemplateColumns: selectedMessage ? undefined : '1fr', gap: '1.5rem', height: isMobile ? 'auto' : 'calc(100vh - 220px)' }}>
              <div className="card glass" style={{ padding: '0', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                <div style={{ padding: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                  <h3 style={{ fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '8px', color: 'white' }}><Inbox size={18} color="#818cf8"/> Messages</h3>
                </div>
                <div style={{ flex: 1, overflowY: 'auto' }}>
                  {messagesLoading ? (
                    <div style={{ padding: '1.5rem' }}><SkeletonText type="lg" /></div>
                  ) : messages.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '40px 20px', color: '#64748b', fontSize: '0.9rem' }}>No messages yet.</div>
                  ) : messages.map(msg => (
                    <div key={msg.id} onClick={() => { setSelectedMessage(msg); loadMessageThread(msg.contact_id); }} style={{ padding: '1.25rem', borderBottom: '1px solid rgba(255,255,255,0.05)', cursor: 'pointer', background: selectedMessage?.id === msg.id ? 'rgba(129, 140, 248, 0.08)' : msg.unread ? 'rgba(129, 140, 248, 0.03)' : 'transparent', transition: 'background 0.15s' }}
                      onMouseEnter={(e) => e.currentTarget.style.background = selectedMessage?.id === msg.id ? 'rgba(129, 140, 248, 0.08)' : 'rgba(255,255,255,0.03)'}
                      onMouseLeave={(e) => e.currentTarget.style.background = selectedMessage?.id === msg.id ? 'rgba(129, 140, 248, 0.08)' : msg.unread ? 'rgba(129, 140, 248, 0.03)' : 'transparent'}
                    >
                      <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'linear-gradient(135deg, #818cf8, #c084fc)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.8rem', color: '#fff', flexShrink: 0 }}>{msg.avatar}</div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                            <span style={{ fontWeight: msg.unread ? 700 : 500, color: 'white', fontSize: '0.95rem' }}>{msg.contact_name || msg.company}</span>
                            <span style={{ fontSize: '0.75rem', color: '#64748b', flexShrink: 0 }}>{msg.time}</span>
                          </div>
                          <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: '2px' }}>{msg.role || 'Contact'}</p>
                          <p style={{ fontSize: '0.85rem', color: msg.unread ? '#e2e8f0' : '#64748b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{msg.lastMsg}</p>
                        </div>
                        {msg.unread && <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#818cf8', marginTop: '6px', flexShrink: 0 }}></div>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {selectedMessage && (
                <div className="card glass" style={{ padding: '0', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                  <div style={{ padding: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <h4 style={{ color: 'white', fontWeight: 600, marginBottom: '2px' }}>{selectedMessage.contact_name || selectedMessage.company}</h4>
                      <p style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{selectedMessage.role || 'Contact'}</p>
                    </div>
                    <button className="btn btn-outline btn-sm" onClick={() => setSelectedMessage(null)} style={{ borderRadius: '8px' }}><X size={14} /></button>
                  </div>
                  <div style={{ flex: 1, padding: '1.5rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {messageThread.length > 0 ? messageThread.map((threadMsg, idx) => {
                      const isMine = threadMsg.sender_id === user?.id;
                      return (
                        <div key={threadMsg.id || idx} style={{ maxWidth: '80%', padding: '1rem', background: isMine ? 'rgba(255,255,255,0.03)' : 'rgba(129, 140, 248, 0.1)', borderRadius: isMine ? '16px 16px 4px 16px' : '16px 16px 16px 4px', alignSelf: isMine ? 'flex-end' : 'flex-start' }}>
                          <p style={{ color: '#e2e8f0', fontSize: '0.9rem', lineHeight: 1.5 }}>{threadMsg.body}</p>
                          <p style={{ color: '#64748b', fontSize: '0.7rem', marginTop: '6px' }}>{new Date(threadMsg.created_at).toLocaleString()}</p>
                        </div>
                      );
                    }) : (
                      <div style={{ maxWidth: '80%', padding: '1rem', background: 'rgba(129, 140, 248, 0.1)', borderRadius: '16px 16px 16px 4px', alignSelf: 'flex-start' }}>
                        <p style={{ color: '#e2e8f0', fontSize: '0.9rem', lineHeight: 1.5 }}>{selectedMessage.lastMsg}</p>
                        <p style={{ color: '#64748b', fontSize: '0.7rem', marginTop: '6px' }}>{selectedMessage.time}</p>
                      </div>
                    )}
                  </div>
                  <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid rgba(255,255,255,0.08)', display: 'flex', gap: '8px' }}>
                    <input type="text" placeholder="Type your reply..." value={replyText} onChange={(e) => setReplyText(e.target.value)} style={{ flex: 1, padding: '10px 14px', borderRadius: '10px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.08)', color: 'white', outline: 'none', fontSize: '0.9rem' }} onFocus={(e) => e.target.style.borderColor = '#818cf8'} onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.08)'} onKeyDown={(e) => e.key === 'Enter' && handleSendReply()} />
                    <button className="btn btn-primary" onClick={handleSendReply} style={{ borderRadius: '10px', padding: '10px 16px' }}><Send size={16} /></button>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'documents' && (
            <motion.div key="documents" variants={tabVariants} initial="hidden" animate="visible" exit="exit" className="card glass card-dash">
              <div className="card-title" style={{ marginBottom: '2.5rem', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '12px' }}><Folder color="#fbbf24"/> Documents & Files</h3>
                <p style={{ color: '#94a3b8', fontSize: '0.95rem', marginTop: '8px' }}>Manage your resumes, cover letters, certificates, and portfolio files.</p>
              </div>

              <div style={{ marginBottom: '2rem', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                <label className="btn btn-primary" style={{ cursor: 'pointer', borderRadius: '12px', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                  <Upload size={16} /> Upload New Document
                  <input type="file" accept=".pdf,.doc,.docx,.txt,.rtf,.png,.jpg" style={{ display: 'none' }} onChange={handleUploadDocument} />
                </label>
              </div>

              {documentsLoading ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 280px), 1fr))', gap: '1rem' }}>
                  {[1, 2].map(i => <SkeletonCard key={i} />)}
                </div>
              ) : documents.length === 0 ? (
                <div className="empty-state-dash" style={{ textAlign: 'center', padding: isMobile ? '40px 24px' : '60px 40px', background: 'rgba(255,255,255,0.02)', borderRadius: '20px', border: '1px dashed rgba(255,255,255,0.1)' }}>
                  <Folder size={32} style={{ color: '#64748b', margin: '0 auto 12px auto' }} />
                  <p style={{ color: '#94a3b8' }}>No documents uploaded yet. Upload your first document above.</p>
                </div>
              ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 280px), 1fr))', gap: '1rem' }}>
                {documents.map(doc => (
                  <motion.div key={doc.id} whileHover={{ y: -4 }} style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.03)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.08)', cursor: 'pointer', transition: 'all 0.2s' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '1rem' }}>
                      <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: doc.type === 'PDF' ? 'rgba(248, 113, 113, 0.15)' : 'rgba(129, 140, 248, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: doc.type === 'PDF' ? '#f87171' : '#818cf8', fontWeight: 700, fontSize: '0.75rem' }}>{doc.type}</div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontWeight: 600, color: 'white', fontSize: '0.95rem', marginBottom: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{doc.name}</p>
                        <p style={{ fontSize: '0.8rem', color: '#64748b' }}>{doc.size} &bull; Updated {doc.updated}</p>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      {doc.file_path && (
                        <a href={getStaticUrl(doc.file_path)} target="_blank" rel="noopener noreferrer" className="btn btn-outline btn-sm" style={{ borderRadius: '8px', flex: 1, textDecoration: 'none', textAlign: 'center' }}><Eye size={13} style={{ marginRight: '4px' }} /> Preview</a>
                      )}
                      <button className="btn btn-outline btn-sm" style={{ borderRadius: '8px', flex: 1, color: '#f87171', borderColor: 'rgba(248, 113, 113, 0.2)' }} onClick={() => handleDeleteDocument(doc.id)}><X size={13} style={{ marginRight: '4px' }} /> Remove</button>
                    </div>
                  </motion.div>
                ))}
              </div>
              )}
            </motion.div>
          )}

          {activeTab === 'resume' && (
            <motion.div key="resume" variants={tabVariants} initial="hidden" animate="visible" exit="exit">
              <ResumeBuilder />
            </motion.div>
          )}

          {activeTab === 'assessments' && (
            <motion.div key="assessments" variants={tabVariants} initial="hidden" animate="visible" exit="exit" className="card glass card-dash">
              <SkillAssessment />
            </motion.div>
          )}

          {activeTab === 'notifications' && (
            <motion.div key="notifications" variants={tabVariants} initial="hidden" animate="visible" exit="exit" className="card glass card-dash">
              <div className="card-title" style={{ marginBottom: '2.5rem', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 style={{ fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '12px' }}><Bell color="#fbbf24"/> Notifications</h3>
                  {unreadNotifCount > 0 && (
                    <button className="btn btn-outline btn-sm" onClick={async () => {
                      try {
                        await apiPatch('/notifications/read-all');
                        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
                        addToast('All notifications marked as read.', 'success');
                      } catch { addToast('Failed to mark all as read.', 'error'); }
                    }} style={{ borderRadius: '8px' }}>Mark All Read</button>
                  )}
                </div>
                <p style={{ color: '#94a3b8', fontSize: '0.95rem', marginTop: '8px' }}>Stay updated on application status changes and new opportunities.</p>
              </div>

              <div style={{ display: 'flex', gap: '8px', marginBottom: '2rem' }}>
                {['all', 'unread', 'status', 'message', 'job', 'reminder'].map(filter => (
                  <button key={filter} onClick={() => setNotifFilter(filter)} style={{ padding: '6px 14px', borderRadius: '20px', border: 'none', background: notifFilter === filter ? 'rgba(129, 140, 248, 0.15)' : 'rgba(255,255,255,0.03)', color: notifFilter === filter ? '#818cf8' : '#94a3b8', fontWeight: 500, cursor: 'pointer', fontSize: '0.85rem', textTransform: 'capitalize', transition: 'all 0.2s' }}>
                    {filter === 'all' ? 'All' : filter === 'status' ? 'Status Updates' : filter === 'message' ? 'Messages' : filter === 'job' ? 'Job Alerts' : filter === 'reminder' ? 'Reminders' : 'Unread'}
                  </button>
                ))}
              </div>

              {notificationsLoading ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {[1, 2, 3].map(i => <SkeletonCard key={i} />)}
                </div>
              ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {notifications.filter(n => notifFilter === 'all' || notifFilter === n.type || (notifFilter === 'unread' && !n.read)).length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '40px', color: '#64748b', fontSize: '0.9rem' }}>No notifications to display.</div>
                ) : notifications.filter(n => notifFilter === 'all' || notifFilter === n.type || (notifFilter === 'unread' && !n.read)).map(notif => (
                  <div key={notif.id} onClick={() => !notif.read && handleMarkNotifRead(notif.id)} style={{ padding: '1.25rem', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', gap: '14px', alignItems: 'flex-start', background: !notif.read ? 'rgba(129, 140, 248, 0.03)' : 'transparent', cursor: !notif.read ? 'pointer' : 'default' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: notif.type === 'status' ? 'rgba(52, 211, 153, 0.1)' : notif.type === 'message' ? 'rgba(129, 140, 248, 0.1)' : notif.type === 'job' ? 'rgba(251, 191, 36, 0.1)' : 'rgba(192, 132, 252, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      {notif.type === 'status' ? <CheckCircle size={16} color="#34d399" /> : notif.type === 'message' ? <MessageSquare size={16} color="#818cf8" /> : notif.type === 'job' ? <Briefcase size={16} color="#fbbf24" /> : <Bell size={16} color="#c084fc" />}
                    </div>
                    <div style={{ flex: 1 }}>
                      <p style={{ color: 'white', fontSize: '0.9rem', lineHeight: 1.5, marginBottom: '4px' }}>{notif.message}</p>
                      <p style={{ color: '#64748b', fontSize: '0.8rem' }}>{notif.time}</p>
                    </div>
                    {!notif.read && <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#818cf8', marginTop: '8px', flexShrink: 0 }}></div>}
                  </div>
                ))}
              </div>
              )}
            </motion.div>
          )}

          {activeTab === 'insights' && (
            <motion.div key="insights" variants={tabVariants} initial="hidden" animate="visible" exit="exit" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {insightsLoading ? (
                <div className="responsive-grid-2" style={{ gap: '1.5rem' }}>
                  {[1, 2, 3].map(i => <SkeletonCard key={i} />)}
                </div>
              ) : (
                <>
              <div className="card glass" style={{ padding: '2rem' }}>
                <h4 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}><TrendingUp size={18} color="#34d399"/> Salary Trends by Role</h4>
                <div style={{ height: '280px' }}>
                  <ResponsiveContainer>
                    <LineChart data={insights?.salaryTrends || []}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                      <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} tickLine={false} />
                      <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} domain={[80, 120]} />
                      <Tooltip contentStyle={{ background: 'rgba(10,15,40,0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }} />
                      <Line type="monotone" dataKey="salary" stroke="#818cf8" strokeWidth={3} dot={{ fill: '#818cf8', strokeWidth: 2 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                <p style={{ color: '#94a3b8', fontSize: '0.85rem', textAlign: 'center', marginTop: '0.5rem' }}>Salary trend index (in thousands ₹) &mdash; Last 6 months</p>
              </div>

              <div className="responsive-grid-2" style={{ gap: '1.5rem' }}>
                <div className="card glass" style={{ padding: '2rem' }}>
                  <h4 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}><Star size={18} color="#fbbf24"/> In-Demand Skills</h4>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {(insights?.topSkills || []).map((skill, i) => (
                      <span key={skill} style={{ padding: '8px 14px', borderRadius: '10px', background: `rgba(129, 140, 248, ${0.05 + (1 - i / (insights?.topSkills?.length || 1)) * 0.15})`, border: `1px solid rgba(129, 140, 248, ${0.1 + (1 - i / (insights?.topSkills?.length || 1)) * 0.2})`, color: '#e2e8f0', fontWeight: 500, fontSize: '0.85rem' }}>
                        {skill} {i < 3 && <span style={{ color: '#fbbf24', marginLeft: '4px' }}>🔥</span>}
                      </span>
                    ))}
                  </div>
                  <p style={{ color: '#94a3b8', fontSize: '0.8rem', marginTop: '1rem' }}>Based on current job market demand analysis</p>
                </div>

                <div className="card glass" style={{ padding: '2rem' }}>
                  <h4 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}><Award size={18} color="#c084fc"/> Role Demand Index</h4>
                  <div style={{ height: '250px' }}>
                    <ResponsiveContainer>
                      <BarChart data={insights?.demandData || []} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                        <XAxis type="number" stroke="#94a3b8" fontSize={12} domain={[0, 100]} tickLine={false} />
                        <YAxis dataKey="role" type="category" stroke="#94a3b8" fontSize={12} tickLine={false} width={90} />
                        <Tooltip contentStyle={{ background: 'rgba(10,15,40,0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }} />
                        <Bar dataKey="demand" fill="url(#demandGradient)" radius={[0, 6, 6, 0]} />
                        <defs>
                          <linearGradient id="demandGradient" x1="0" y1="0" x2="1" y2="0">
                            <stop offset="0%" stopColor="#818cf8" />
                            <stop offset="100%" stopColor="#c084fc" />
                          </linearGradient>
                        </defs>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
              </>
              )}
            </motion.div>
          )}

          {activeTab === 'alerts' && (
  <motion.div key="alerts" variants={tabVariants} initial="hidden" animate="visible" exit="exit" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <h2 style={{ color: 'white', margin: 0 }}>Job Alerts</h2>
      <button className="btn btn-primary" onClick={() => setShowAlertModal(true)} style={{ borderRadius: '12px' }}>
        <Bell size={16} style={{ marginRight: '6px' }} /> Create Alert
      </button>
    </div>

    {alertsLoading ? (
      <p style={{ color: '#94a3b8' }}>Loading alerts...</p>
    ) : alerts.length === 0 ? (
      <div className="card glass" style={{ padding: '3rem', textAlign: 'center' }}>
        <Bell size={48} style={{ color: '#64748b', marginBottom: '1rem', opacity: 0.5 }} />
        <h3 style={{ color: 'white', marginBottom: '0.5rem' }}>No Job Alerts Yet</h3>
        <p style={{ color: '#94a3b8', marginBottom: '1.5rem' }}>Create alerts to get notified about new jobs matching your preferences.</p>
        <button className="btn btn-primary" onClick={() => setShowAlertModal(true)} style={{ borderRadius: '12px' }}>Create Your First Alert</button>
      </div>
    ) : (
      alerts.map(alert => (
        <div key={alert.id} className="card glass" style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '6px' }}>
              {alert.keywords && <span className="badge badge-primary">{alert.keywords}</span>}
              {alert.location && <span className="badge" style={{ background: 'rgba(52,211,153,0.15)', color: '#34d399', padding: '3px 10px', borderRadius: '6px', fontSize: '0.8rem' }}>{alert.location}</span>}
              {alert.type && <span className="badge" style={{ background: 'rgba(251,191,36,0.15)', color: '#fbbf24', padding: '3px 10px', borderRadius: '6px', fontSize: '0.8rem' }}>{alert.type}</span>}
              {alert.experience_level && <span className="badge" style={{ background: 'rgba(192,132,252,0.15)', color: '#c084fc', padding: '3px 10px', borderRadius: '6px', fontSize: '0.8rem' }}>{alert.experience_level}</span>}
            </div>
            <p style={{ color: '#94a3b8', fontSize: '0.85rem', margin: 0 }}>Frequency: {alert.frequency} • Created {new Date(alert.created_at).toLocaleDateString()}</p>
          </div>
          <button onClick={async () => { try { await apiDelete('/alerts/' + alert.id); setAlerts(prev => prev.filter(a => a.id !== alert.id)); } catch {} }} style={{ background: 'rgba(239,68,68,0.1)', border: 'none', color: '#ef4444', padding: '8px 16px', borderRadius: '10px', cursor: 'pointer', fontSize: '0.85rem', marginLeft: '1rem' }}>
            <X size={16} /> Delete
          </button>
        </div>
      ))
    )}

    <AnimatePresence>
      {showAlertModal && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }} onClick={() => setShowAlertModal(false)}>
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="card glass" style={{ padding: '2rem', width: '100%', maxWidth: '500px', margin: '1rem' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ color: 'white', margin: 0 }}><Bell size={18} style={{ marginRight: '8px', color: '#818cf8' }} /> New Job Alert</h3>
              <button onClick={() => setShowAlertModal(false)} style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}><X size={20} /></button>
            </div>
            <form onSubmit={async (e) => {
              e.preventDefault();
              try {
                await apiPost('/alerts', alertForm);
                addToast('Alert created!', 'success');
                setShowAlertModal(false);
                setAlertForm({ keywords: '', location: '', type: '', experience_level: '', frequency: 'daily' });
                loadAlerts();
              } catch (err) {
                addToast(err.message || 'Failed to create alert', 'error');
              }
            }} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <input className="dash-input" placeholder="Keywords (e.g., React, Node.js)" value={alertForm.keywords} onChange={e => setAlertForm(prev => ({...prev, keywords: e.target.value}))} />
              <input className="dash-input" placeholder="Location" value={alertForm.location} onChange={e => setAlertForm(prev => ({...prev, location: e.target.value}))} />
              <select className="dash-input" value={alertForm.type} onChange={e => setAlertForm(prev => ({...prev, type: e.target.value}))}>
                <option value="">Any Type</option>
                <option value="Full-time">Full-time</option>
                <option value="Part-time">Part-time</option>
                <option value="Contract">Contract</option>
              </select>
              <select className="dash-input" value={alertForm.experience_level} onChange={e => setAlertForm(prev => ({...prev, experience_level: e.target.value}))}>
                <option value="">Any Level</option>
                <option value="Entry">Entry</option>
                <option value="Mid-Level">Mid-Level</option>
                <option value="Senior">Senior</option>
                <option value="Lead">Lead</option>
              </select>
              <select className="dash-input" value={alertForm.frequency} onChange={e => setAlertForm(prev => ({...prev, frequency: e.target.value}))}>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
              <button type="submit" className="btn btn-primary" style={{ borderRadius: '12px', marginTop: '0.5rem' }}>Create Alert</button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  </motion.div>
)}

          {activeTab === 'settings' && (
            <motion.div key="settings" variants={tabVariants} initial="hidden" animate="visible" exit="exit" className="card glass card-dash">
              <div className="card-title" style={{ marginBottom: '2.5rem', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '12px' }}><Settings color="#94a3b8"/> Account Settings</h3>
                <p style={{ color: '#94a3b8', fontSize: '0.95rem', marginTop: '8px' }}>Manage your preferences, privacy, and account security.</p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                <div>
                  <h4 style={{ color: 'white', fontSize: '1.1rem', fontWeight: 600, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}><Bell size={16} color="#818cf8"/> Notification Preferences</h4>
                  {settingsLoading ? (
                    <SkeletonText type="lg" />
                  ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {[
                      { key: 'application_updates', label: 'Application status changes', desc: 'Get notified when employers update your application status' },
                      { key: 'job_alerts', label: 'New job alerts', desc: 'Receive alerts for new positions matching your skills and preferences' },
                      { key: 'message_notifications', label: 'Message notifications', desc: 'Be notified when employers send you direct messages' },
                      { key: 'weekly_digest', label: 'Weekly digest', desc: 'Receive a weekly summary of your application activity' },
                      { key: 'marketing_emails', label: 'Marketing emails', desc: 'Receive tips, resources, and platform updates' },
                    ].map((item) => {
                      const enabled = notificationSettings?.[item.key] ?? false;
                      return (
                      <label key={item.key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.06)', cursor: 'pointer' }}>
                        <div>
                          <p style={{ color: 'white', fontWeight: 500, marginBottom: '2px', fontSize: '0.9rem' }}>{item.label}</p>
                          <p style={{ color: '#64748b', fontSize: '0.8rem' }}>{item.desc}</p>
                        </div>
                        <div onClick={() => toggleSetting(item.key)} style={{ width: '44px', height: '24px', borderRadius: '12px', background: enabled ? '#818cf8' : 'rgba(255,255,255,0.1)', position: 'relative', transition: 'background 0.2s', flexShrink: 0 }}>
                          <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: 'white', position: 'absolute', top: '2px', left: enabled ? '22px' : '2px', transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.3)' }}></div>
                        </div>
                      </label>
                    )})}
                  </div>
                  )}
                </div>

                <div>
                  <h4 style={{ color: 'white', fontSize: '1.1rem', fontWeight: 600, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}><Shield size={16} color="#34d399"/> Privacy & Security</h4>
                  <div className="responsive-grid-2" style={{ gap: '1rem' }}>
                    <div style={{ padding: '1.25rem', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.06)' }}>
                      <p style={{ color: 'white', fontWeight: 600, marginBottom: '4px' }}>Password</p>
                      <p style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: '12px' }}>Update your account password regularly</p>
                      <button className="btn btn-outline btn-sm" style={{ borderRadius: '8px' }}>Change Password</button>
                    </div>
                    <div style={{ padding: '1.25rem', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.06)' }}>
                      <p style={{ color: 'white', fontWeight: 600, marginBottom: '4px' }}>Profile Visibility</p>
                      <p style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: '12px' }}>Your profile is visible to employers</p>
                      <button className="btn btn-outline btn-sm" style={{ borderRadius: '8px' }}>Manage</button>
                    </div>
                  </div>
                </div>

                <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h4 style={{ color: '#f87171', fontWeight: 600, marginBottom: '4px' }}>Danger Zone</h4>
                    <p style={{ color: '#64748b', fontSize: '0.85rem' }}>Permanently delete your account and all associated data.</p>
                  </div>
                  <button style={{ padding: '10px 20px', borderRadius: '10px', background: 'rgba(248, 113, 113, 0.1)', border: '1px solid rgba(248, 113, 113, 0.2)', color: '#f87171', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }}
                    onClick={() => addToast('Account deletion is not available in demo mode.', 'error')}>
                    Delete Account
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
