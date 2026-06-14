import React, { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, PlusCircle, User, ChevronDown, LayoutDashboard, Search, Compass, Bell, CheckCheck, X, ShieldCheck, ShieldAlert } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { apiGet, apiPatch } from '../utils/api';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
  }, [mobileMenuOpen]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setDropdownOpen(false);
        setMobileMenuOpen(false);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleLogout = () => {
    setDropdownOpen(false);
    setMobileMenuOpen(false);
    logout();
    navigate('/');
  };

  const closeMenus = () => {
    setMobileMenuOpen(false);
    setDropdownOpen(false);
  };

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifOpen, setNotifOpen] = useState(false);
  const notifRef = useRef(null);

  const fetchUnreadCount = async () => {
    try {
      const data = await apiGet('/notifications/unread/count');
      setUnreadCount(data.count || 0);
    } catch { }
  };

  const fetchNotifications = async () => {
    try {
      const data = await apiGet('/notifications');
      setNotifications(Array.isArray(data) ? data.slice(0, 10) : []);
      setUnreadCount(data.filter ? data.filter(n => !n.is_read).length : 0);
    } catch { }
  };

  useEffect(() => {
    if (!user) return;
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, [user]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNotifOpen = async () => {
    setNotifOpen(!notifOpen);
    if (!notifOpen) fetchNotifications();
  };

  const handleMarkRead = async (id) => {
    try { await apiPatch(`/notifications/${id}/read`); } catch { }
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: 1 } : n));
    fetchUnreadCount();
  };

  const handleMarkAllRead = async () => {
    try { await apiPatch('/notifications/read-all'); } catch { }
    setNotifications(prev => prev.map(n => ({ ...n, is_read: 1 })));
    setUnreadCount(0);
  };

  const timeAgo = (date) => {
    const s = Math.floor((new Date() - new Date(date)) / 1000);
    if (s < 60) return 'now';
    const m = Math.floor(s / 60); if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60); if (h < 24) return `${h}h ago`;
    const d = Math.floor(h / 24); return `${d}d ago`;
  };

  const isVerified = user?.is_verified;

  const getInitials = (name) => {
    if (!name) return '?';
    const parts = name.split(' ');
    if (parts.length > 1) return (parts[0][0] + parts[1][0]).toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <header className="landing-navbar" style={{
      background: scrolled ? 'rgba(2, 6, 23, 0.92)' : 'rgba(2, 6, 23, 0.3)',
      backdropFilter: scrolled ? 'blur(24px) saturate(180%)' : 'blur(12px)',
      borderBottom: scrolled ? '1px solid rgba(255,255,255,0.08)' : '1px solid transparent',
      boxShadow: scrolled ? '0 4px 30px rgba(0,0,0,0.4), 0 1px 0 rgba(129, 140, 248, 0.1)' : 'none',
      transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
    }}>
      <div className="nav-content">
        <Link to={user ? '/dashboard' : '/'} className="logo-container" onClick={closeMenus}>
          <img src="/logo.png" alt="ElevateHire" style={{ height: '40px', width: 'auto', borderRadius: '8px' }} />
          <h1 className="logo-text">ElevateHire</h1>
        </Link>

        <button
          className={`mobile-menu-btn ${mobileMenuOpen ? 'open' : ''}`}
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
          aria-expanded={mobileMenuOpen}
        >
          <span className="hamburger-line"></span>
          <span className="hamburger-line"></span>
          <span className="hamburger-line"></span>
        </button>

        {user ? (
          <>
            <div className="nav-links">
              <NavLink to="/dashboard" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'} end>
                <LayoutDashboard size={14} style={{ marginRight: '4px' }} />
                {user.role === 'employer' ? 'Console' : 'Dashboard'}
              </NavLink>

              <NavLink to="/jobs" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
                <Search size={14} style={{ marginRight: '4px' }} /> Browse Jobs
              </NavLink>

              {user.role === 'employer' && (
                <button className="btn btn-primary btn-sm" onClick={() => navigate('/dashboard?tab=post-job')} style={{ borderRadius: '12px' }}>
                  <PlusCircle size={15} />
                  <span>Post Job</span>
                </button>
              )}

              <div ref={notifRef} style={{ position: 'relative' }}>
                <button onClick={handleNotifOpen} style={{
                  width: '38px', height: '38px', borderRadius: '12px',
                  background: 'rgba(255,255,255,0.08)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', color: 'white', position: 'relative',
                  transition: 'all 0.2s ease', flexShrink: 0,
                }} aria-label="Notifications">
                  <Bell size={18} />
                  {unreadCount > 0 && (
                    <span style={{
                      position: 'absolute', top: '-4px', right: '-4px',
                      width: '18px', height: '18px', borderRadius: '50%',
                      background: '#ef4444', color: 'white', fontSize: '0.6rem',
                      fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center',
                      boxShadow: '0 2px 6px rgba(239,68,68,0.5)',
                    }}>{unreadCount > 9 ? '9+' : unreadCount}</span>
                  )}
                </button>
                <AnimatePresence>
                  {notifOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.96 }}
                      transition={{ duration: 0.15 }}
                      style={{
                        position: 'absolute', right: 0, top: 'calc(100% + 8px)',
                        width: '360px', background: 'rgba(10, 15, 40, 0.98)',
                        backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '16px', zIndex: 1001,
                        boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
                        maxHeight: '480px', display: 'flex', flexDirection: 'column',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 1rem 0.5rem', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                        <h4 style={{ color: 'white', margin: 0, fontSize: '0.95rem' }}>Notifications</h4>
                        {unreadCount > 0 && (
                          <button onClick={handleMarkAllRead} style={{ background: 'transparent', border: 'none', color: '#818cf8', fontSize: '0.75rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <CheckCheck size={14} /> Mark all read
                          </button>
                        )}
                      </div>
                      <div style={{ overflowY: 'auto', flex: 1 }}>
                        {notifications.length === 0 ? (
                          <p style={{ color: '#64748b', textAlign: 'center', padding: '2rem', fontSize: '0.85rem' }}>No notifications yet</p>
                        ) : (
                          notifications.map(n => (
                            <div key={n.id} onClick={() => !n.is_read && handleMarkRead(n.id)} style={{
                              padding: '0.75rem 1rem', cursor: 'pointer',
                              background: n.is_read ? 'transparent' : 'rgba(129,140,248,0.08)',
                              borderBottom: '1px solid rgba(255,255,255,0.05)',
                              transition: 'background 0.15s',
                            }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <p style={{ color: 'white', margin: 0, fontSize: '0.85rem', lineHeight: 1.4, flex: 1 }}>{n.message}</p>
                                {!n.is_read && <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#818cf8', flexShrink: 0, marginTop: '4px' }} />}
                              </div>
                              <p style={{ color: '#64748b', fontSize: '0.7rem', margin: '4px 0 0' }}>{timeAgo(n.created_at)}</p>
                            </div>
                          ))
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div ref={dropdownRef} style={{ position: 'relative' }}>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '10px',
                    background: dropdownOpen ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '14px', padding: '6px 14px 6px 6px',
                    cursor: 'pointer', transition: 'all 0.2s ease',
                    color: 'white',
                  }}
                  aria-expanded={dropdownOpen}
                >
                  <div style={{
                    width: '32px', height: '32px', borderRadius: '10px',
                    background: 'linear-gradient(135deg, #818cf8, #c084fc)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.75rem', fontWeight: 700, color: '#fff', flexShrink: 0,
                  }}>
                    {getInitials(user.name)}
                  </div>
                  <span style={{ fontSize: '0.9rem', fontWeight: 600, maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.name}</span>
                  <ChevronDown size={14} style={{ opacity: 0.6, transition: 'transform 0.2s', transform: dropdownOpen ? 'rotate(180deg)' : 'none' }} />
                </button>

                <AnimatePresence>
                  {dropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.96 }}
                      transition={{ duration: 0.15 }}
                      style={{
                        position: 'absolute', right: 0, top: 'calc(100% + 8px)',
                        width: '240px', background: 'rgba(10, 15, 40, 0.95)',
                        backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '16px', padding: '0.5rem', zIndex: 1000,
                        boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
                      }}
                    >
                      <div style={{ padding: '0.75rem 0.75rem 0.5rem', borderBottom: '1px solid rgba(255,255,255,0.08)', marginBottom: '0.25rem' }}>
                        <p style={{ fontWeight: 700, fontSize: '0.95rem', color: 'white', marginBottom: '2px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          {user.name}
                          {isVerified ? (
                            <ShieldCheck size={14} color="#34d399" title="Verified" />
                          ) : (
                            <ShieldAlert size={14} color="#f87171" title="Unverified" />
                          )}
                        </p>
                        <p style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{user.email}</p>
                        <span style={{
                          display: 'inline-block', marginTop: '6px',
                          fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase',
                          padding: '3px 8px', borderRadius: '6px',
                          background: user.role === 'employer' ? 'rgba(251, 191, 36, 0.15)' : 'rgba(129, 140, 248, 0.15)',
                          color: user.role === 'employer' ? '#fbbf24' : '#818cf8',
                        }}>
                          {user.role}
                        </span>
                      </div>

                      <button onClick={() => { setDropdownOpen(false); navigate('/dashboard'); }} style={{
                        display: 'flex', alignItems: 'center', gap: '10px', width: '100%',
                        padding: '0.6rem 0.75rem', background: 'transparent', border: 'none',
                        color: '#e2e8f0', fontSize: '0.9rem', borderRadius: '10px',
                        cursor: 'pointer', transition: 'background 0.15s',
                      }} onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                        <LayoutDashboard size={16} />
                        <span>{user.role === 'employer' ? 'Console' : 'Dashboard'}</span>
                      </button>

                      <button onClick={() => { setDropdownOpen(false); navigate('/dashboard?tab=profile'); }} style={{
                        display: 'flex', alignItems: 'center', gap: '10px', width: '100%',
                        padding: '0.6rem 0.75rem', background: 'transparent', border: 'none',
                        color: '#e2e8f0', fontSize: '0.9rem', borderRadius: '10px',
                        cursor: 'pointer', transition: 'background 0.15s',
                      }} onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                        <User size={16} />
                        <span>{user.role === 'employer' ? 'Company Profile' : 'My Profile'}</span>
                      </button>

                      <button onClick={() => { setDropdownOpen(false); navigate('/jobs'); }} style={{
                        display: 'flex', alignItems: 'center', gap: '10px', width: '100%',
                        padding: '0.6rem 0.75rem', background: 'transparent', border: 'none',
                        color: '#e2e8f0', fontSize: '0.9rem', borderRadius: '10px',
                        cursor: 'pointer', transition: 'background 0.15s',
                      }} onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                        <Compass size={16} />
                        <span>Browse Jobs</span>
                      </button>

                      <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', margin: '0.25rem 0' }}></div>

                      <button onClick={handleLogout} style={{
                        display: 'flex', alignItems: 'center', gap: '10px', width: '100%',
                        padding: '0.6rem 0.75rem', background: 'transparent', border: 'none',
                        color: '#f87171', fontSize: '0.9rem', borderRadius: '10px',
                        cursor: 'pointer', transition: 'background 0.15s',
                      }} onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(248, 113, 113, 0.08)'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                        <LogOut size={16} />
                        <span>Sign Out</span>
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </>
        ) : (
          <div className="nav-links">
            <NavLink to="/" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'} end>
              Home
            </NavLink>
            <NavLink to="/jobs" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
              <Search size={14} style={{ marginRight: '4px' }} /> Find Jobs
            </NavLink>

            <button onClick={() => navigate('/login')} className="nav-link">Sign In</button>
            <button onClick={() => navigate('/register')} className="btn btn-primary" style={{ borderRadius: '14px' }}>Get Started</button>
          </div>
        )}
      </div>

      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="mobile-nav-overlay"
          >
            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {user ? (
                <>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '1rem 1.25rem' }}>
                    <div style={{
                      width: '40px', height: '40px', borderRadius: '12px',
                      background: 'linear-gradient(135deg, #818cf8, #c084fc)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '1rem', fontWeight: 700, color: '#fff',
                    }}>
                      {getInitials(user.name)}
                    </div>
                    <div>
                      <p style={{ fontWeight: 600, color: 'white', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
                        {user.name}
                        {isVerified ? (
                          <ShieldCheck size={14} color="#34d399" title="Verified" />
                        ) : (
                          <ShieldAlert size={14} color="#f87171" title="Unverified" />
                        )}
                      </p>
                      <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: 0 }}>{user.email}</p>
                    </div>
                  </div>

                  <div className="mobile-nav-divider"></div>

                  <button className="mobile-nav-link" onClick={() => { closeMenus(); navigate('/dashboard'); }}>
                    <LayoutDashboard size={18} />
                    {user.role === 'employer' ? 'Employer Console' : 'My Dashboard'}
                  </button>

                  <button className="mobile-nav-link" onClick={() => { closeMenus(); navigate('/dashboard?tab=profile'); }}>
                    <User size={18} />
                    {user.role === 'employer' ? 'Company Profile' : 'My Profile'}
                  </button>

                  <button className="mobile-nav-link" onClick={() => { closeMenus(); navigate('/jobs'); }}>
                    <Search size={18} /> Browse Jobs
                  </button>

                  {user.role === 'employer' && (
                    <button className="mobile-nav-link" style={{ color: '#c084fc' }} onClick={() => { closeMenus(); navigate('/dashboard?tab=post-job'); }}>
                      <PlusCircle size={18} /> Post a New Job
                    </button>
                  )}

                  <button className="mobile-nav-link" style={{ color: '#f87171' }} onClick={handleLogout}>
                    <LogOut size={18} /> Sign Out
                  </button>
                </>
              ) : (
                <>
                  <NavLink
                    to="/"
                    className={({ isActive }) => isActive ? 'mobile-nav-link active' : 'mobile-nav-link'}
                    end
                    onClick={closeMenus}
                  >
                    Home
                  </NavLink>

                  <NavLink
                    to="/jobs"
                    className={({ isActive }) => isActive ? 'mobile-nav-link active' : 'mobile-nav-link'}
                    onClick={closeMenus}
                  >
                    <Search size={18} /> Find Jobs
                  </NavLink>

                  <button className="mobile-nav-link" onClick={() => { closeMenus(); navigate('/login'); }}>
                    Sign In
                  </button>
                  <button
                    className="btn btn-primary"
                    style={{ width: '100%', marginTop: '1rem' }}
                    onClick={() => { closeMenus(); navigate('/register'); }}
                  >
                    Get Started
                  </button>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
