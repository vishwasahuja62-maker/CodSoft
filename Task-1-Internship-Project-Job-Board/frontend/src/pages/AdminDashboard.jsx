import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/ToastProvider';
import { apiGet, apiPatch, apiDelete } from '../utils/api';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Users, Briefcase, FileText, Trash2, X, BarChart2, Activity, Mail } from 'lucide-react';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const COLORS = ['#818cf8', '#34d399', '#fbbf24', '#f87171', '#c084fc'];

export default function AdminDashboard() {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState({ stats: true, users: true, jobs: true });

  if (user?.role !== 'admin') {
    return (
      <div className="dashboard-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '80vh' }}>
        <div className="bg-glow-1"></div>
        <div className="bg-glow-2"></div>
        <div className="bg-noise"></div>
        <div className="card glass" style={{ padding: '3rem', textAlign: 'center', maxWidth: '420px' }}>
          <Shield size={48} style={{ color: '#f87171', marginBottom: '1rem' }} />
          <h2 style={{ color: 'white', marginBottom: '0.5rem' }}>Access Denied</h2>
          <p style={{ color: '#94a3b8' }}>You do not have admin privileges to access this panel.</p>
        </div>
      </div>
    );
  }

  useEffect(() => {
    loadStats();
    loadUsers();
    loadJobs();
  }, []);

  const loadStats = async () => {
    try {
      const data = await apiGet('/admin/stats');
      setStats(data);
    } catch (err) {
      addToast('Failed to load platform stats', 'error');
    } finally {
      setLoading(s => ({ ...s, stats: false }));
    }
  };

  const loadUsers = async () => {
    try {
      const data = await apiGet('/admin/users');
      setUsers(data);
    } catch (err) {
      addToast('Failed to load users', 'error');
    } finally {
      setLoading(s => ({ ...s, users: false }));
    }
  };

  const loadJobs = async () => {
    try {
      const data = await apiGet('/admin/jobs');
      setJobs(data);
    } catch (err) {
      addToast('Failed to load jobs', 'error');
    } finally {
      setLoading(s => ({ ...s, jobs: false }));
    }
  };

  const handleRoleChange = async (id, role) => {
    try {
      await apiPatch(`/admin/users/${id}/role`, { role });
      setUsers(users.map(u => u.id === id ? { ...u, role } : u));
      addToast('User role updated successfully', 'success');
    } catch (err) {
      addToast(err.message || 'Failed to update role', 'error');
    }
  };

  const handleDeleteUser = async (id, name) => {
    if (!window.confirm(`Delete user "${name}"? This action cannot be undone.`)) return;
    try {
      await apiDelete(`/admin/users/${id}`);
      setUsers(users.filter(u => u.id !== id));
      addToast('User deleted successfully', 'success');
    } catch (err) {
      addToast(err.message || 'Failed to delete user', 'error');
    }
  };

  const handleDeleteJob = async (id, title) => {
    if (!window.confirm(`Delete job "${title}"? This action cannot be undone.`)) return;
    try {
      await apiDelete(`/admin/jobs/${id}`);
      setJobs(jobs.filter(j => j.id !== id));
      addToast('Job deleted successfully', 'success');
    } catch (err) {
      addToast(err.message || 'Failed to delete job', 'error');
    }
  };

  const getRoleCount = (role) => stats?.usersByRole?.find(r => r.role === role)?.count || 0;

  const tabVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
    exit: { opacity: 0, y: -10, transition: { duration: 0.2 } }
  };

  return (
    <div className="dashboard-container">
      <div className="bg-glow-1"></div>
      <div className="bg-glow-2"></div>
      <div className="bg-noise"></div>

      <aside className="sidebar glass">
        <div style={{ marginBottom: '2.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'linear-gradient(135deg, #f87171, #ef4444)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 15px rgba(248, 113, 113, 0.4)' }}>
            <Shield size={18} color="#fff" strokeWidth={2.5} />
          </div>
          <span style={{ fontSize: '1.2rem', fontWeight: 800, color: 'white' }}>Admin Panel</span>
        </div>

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <button className={`nav-item ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}>
            <BarChart2 size={18} /><span>Overview</span>
          </button>
          <button className={`nav-item ${activeTab === 'users' ? 'active' : ''}`} onClick={() => setActiveTab('users')}>
            <Users size={18} /><span>Users</span>
          </button>
          <button className={`nav-item ${activeTab === 'jobs' ? 'active' : ''}`} onClick={() => setActiveTab('jobs')}>
            <Briefcase size={18} /><span>Jobs</span>
          </button>
        </div>
      </aside>

      <main className="main-content-dash">
        <div className="header-bar" style={{ background: 'transparent', border: 'none', paddingBottom: 0 }}>
          <div className="welcome-text">
            <h1 style={{ fontSize: '2rem', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Shield size={28} style={{ color: '#f87171' }} /> Admin Dashboard
            </h1>
            <p>Monitor and manage the platform.</p>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {activeTab === 'overview' && (
            <motion.div key="overview" variants={tabVariants} initial="hidden" animate="visible" exit="exit" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {loading.stats ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
                  {[1, 2, 3, 4, 5].map(i => (
                    <div key={i} className="card glass" style={{ padding: '2rem', height: '120px', background: 'rgba(255,255,255,0.03)', animation: 'pulse 1.5s infinite' }}>
                      <style>{`@keyframes pulse { 0%, 100% { opacity: 0.4; } 50% { opacity: 0.8; } }`}</style>
                    </div>
                  ))}
                </div>
              ) : (
                <>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
                  <div className="card glass stat-card" style={{ padding: '2rem', position: 'relative', overflow: 'hidden' }}>
                    <div style={{ position: 'absolute', top: '-20px', right: '-20px', opacity: 0.1, color: '#818cf8' }}><Users size={120} /></div>
                    <p style={{ color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', fontSize: '0.8rem', letterSpacing: '1px' }}>Total Users</p>
                    <h3 style={{ fontSize: '3rem', fontWeight: 800, color: 'white', marginTop: '0.5rem' }}>{stats?.totalUsers || 0}</h3>
                    <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Activity size={14} /> {getRoleCount('candidate')} candidates, {getRoleCount('employer')} employers
                    </p>
                  </div>
                  <div className="card glass stat-card" style={{ padding: '2rem', position: 'relative', overflow: 'hidden' }}>
                    <div style={{ position: 'absolute', top: '-20px', right: '-20px', opacity: 0.1, color: '#34d399' }}><Briefcase size={120} /></div>
                    <p style={{ color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', fontSize: '0.8rem', letterSpacing: '1px' }}>Total Jobs</p>
                    <h3 style={{ fontSize: '3rem', fontWeight: 800, color: '#34d399', marginTop: '0.5rem' }}>{stats?.totalJobs || 0}</h3>
                    <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: '0.5rem' }}>Active listings</p>
                  </div>
                  <div className="card glass stat-card" style={{ padding: '2rem', position: 'relative', overflow: 'hidden' }}>
                    <div style={{ position: 'absolute', top: '-20px', right: '-20px', opacity: 0.1, color: '#c084fc' }}><FileText size={120} /></div>
                    <p style={{ color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', fontSize: '0.8rem', letterSpacing: '1px' }}>Applications</p>
                    <h3 style={{ fontSize: '3rem', fontWeight: 800, color: '#c084fc', marginTop: '0.5rem' }}>{stats?.totalApplications || 0}</h3>
                    <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: '0.5rem' }}>Total submissions</p>
                  </div>
                  <div className="card glass stat-card" style={{ padding: '2rem', position: 'relative', overflow: 'hidden' }}>
                    <div style={{ position: 'absolute', top: '-20px', right: '-20px', opacity: 0.1, color: '#fbbf24' }}><Mail size={120} /></div>
                    <p style={{ color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', fontSize: '0.8rem', letterSpacing: '1px' }}>Messages</p>
                    <h3 style={{ fontSize: '3rem', fontWeight: 800, color: '#fbbf24', marginTop: '0.5rem' }}>{stats?.totalMessages || 0}</h3>
                    <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: '0.5rem' }}>Total sent</p>
                  </div>
                  <div className="card glass stat-card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      {stats?.usersByRole?.map(r => (
                        <div key={r.role} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                          <span style={{ color: '#cbd5e1', textTransform: 'capitalize' }}>{r.role}</span>
                          <span style={{ color: 'white', fontWeight: 700 }}>{r.count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem', marginTop: '1.5rem' }}>
                  <div className="card glass stat-card" style={{ padding: '2rem' }}>
                    <div style={{ marginBottom: '1.5rem' }}>
                      <h3 style={{ fontSize: '1.2rem', color: 'white', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Briefcase size={20} color="#34d399" /> Jobs by Type
                      </h3>
                    </div>
                    <div style={{ height: '300px', width: '100%' }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={stats?.jobsByType || []} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                          <XAxis dataKey="type" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                          <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                          <Tooltip
                            contentStyle={{ background: '#0a0f28', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                            itemStyle={{ color: 'white' }}
                            cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                          />
                          <Bar dataKey="count" fill="#34d399" radius={[4, 4, 0, 0]} barSize={40} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div className="card glass stat-card" style={{ padding: '2rem' }}>
                    <div style={{ marginBottom: '1.5rem' }}>
                      <h3 style={{ fontSize: '1.2rem', color: 'white', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <FileText size={20} color="#c084fc" /> Applications by Status
                      </h3>
                    </div>
                    <div style={{ height: '300px', width: '100%' }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={stats?.applicationsByStatus || []}
                            cx="50%"
                            cy="50%"
                            innerRadius={70}
                            outerRadius={100}
                            paddingAngle={5}
                            dataKey="count"
                            nameKey="status"
                            stroke="none"
                          >
                            {(stats?.applicationsByStatus || []).map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip
                            contentStyle={{ background: '#0a0f28', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', textTransform: 'capitalize' }}
                            itemStyle={{ color: 'white' }}
                          />
                          <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ textTransform: 'capitalize', color: '#94a3b8', fontSize: '0.85rem' }} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
                </>
              )}
            </motion.div>
          )}

          {activeTab === 'users' && (
            <motion.div key="users" variants={tabVariants} initial="hidden" animate="visible" exit="exit" className="card glass" style={{ padding: '2.5rem' }}>
              <div className="card-title" style={{ marginBottom: '2rem' }}>
                <h3 style={{ fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '12px' }}><Users color="#818cf8" /> Platform Users</h3>
              </div>
              {loading.users ? (
                <p style={{ color: '#94a3b8' }}>Loading users...</p>
              ) : users.length > 0 ? (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', color: '#94a3b8', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
                        <th style={{ padding: '1rem 0.75rem', textAlign: 'left' }}>Name</th>
                        <th style={{ padding: '1rem 0.75rem', textAlign: 'left' }}>Email</th>
                        <th style={{ padding: '1rem 0.75rem', textAlign: 'left' }}>Role</th>
                        <th style={{ padding: '1rem 0.75rem', textAlign: 'left' }}>Joined</th>
                        <th style={{ padding: '1rem 0.75rem', textAlign: 'right' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((u, idx) => (
                        <motion.tr
                          key={u.id}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.03 }}
                          style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', transition: 'background 0.15s' }}
                          onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
                          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                        >
                          <td style={{ padding: '1rem 0.75rem', color: 'white', fontWeight: 600 }}>{u.name}</td>
                          <td style={{ padding: '1rem 0.75rem', color: '#94a3b8' }}>{u.email}</td>
                          <td style={{ padding: '1rem 0.75rem' }}>
                            <select
                              value={u.role}
                              onChange={e => handleRoleChange(u.id, e.target.value)}
                              style={{
                                background: u.role === 'admin' ? 'rgba(248, 113, 113, 0.1)' : u.role === 'employer' ? 'rgba(251, 191, 36, 0.1)' : 'rgba(129, 140, 248, 0.1)',
                                border: `1px solid ${u.role === 'admin' ? 'rgba(248, 113, 113, 0.2)' : u.role === 'employer' ? 'rgba(251, 191, 36, 0.2)' : 'rgba(129, 140, 248, 0.2)'}`,
                                color: u.role === 'admin' ? '#f87171' : u.role === 'employer' ? '#fbbf24' : '#818cf8',
                                padding: '6px 12px', borderRadius: '8px', fontWeight: 600, fontSize: '0.85rem',
                                cursor: 'pointer', outline: 'none', appearance: 'none',
                              }}
                            >
                              <option value="candidate" style={{ background: '#0a0f28', color: '#818cf8' }}>candidate</option>
                              <option value="employer" style={{ background: '#0a0f28', color: '#fbbf24' }}>employer</option>
                              <option value="admin" style={{ background: '#0a0f28', color: '#f87171' }}>admin</option>
                            </select>
                          </td>
                          <td style={{ padding: '1rem 0.75rem', color: '#94a3b8', fontSize: '0.9rem' }}>
                            {new Date(u.created_at).toLocaleDateString()}
                          </td>
                          <td style={{ padding: '1rem 0.75rem', textAlign: 'right' }}>
                            <button
                              onClick={() => handleDeleteUser(u.id, u.name)}
                              style={{
                                background: 'rgba(248, 113, 113, 0.1)', border: '1px solid rgba(248, 113, 113, 0.2)',
                                color: '#f87171', padding: '8px 12px', borderRadius: '8px', cursor: 'pointer',
                                display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem',
                                fontWeight: 600, transition: 'all 0.15s',
                              }}
                              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(248, 113, 113, 0.2)'; e.currentTarget.style.borderColor = 'rgba(248, 113, 113, 0.4)'; }}
                              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(248, 113, 113, 0.1)'; e.currentTarget.style.borderColor = 'rgba(248, 113, 113, 0.2)'; }}
                            >
                              <Trash2 size={14} /> Delete
                            </button>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p style={{ color: '#94a3b8', textAlign: 'center', padding: '2rem' }}>No users found.</p>
              )}
            </motion.div>
          )}

          {activeTab === 'jobs' && (
            <motion.div key="jobs" variants={tabVariants} initial="hidden" animate="visible" exit="exit" className="card glass" style={{ padding: '2.5rem' }}>
              <div className="card-title" style={{ marginBottom: '2rem' }}>
                <h3 style={{ fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '12px' }}><Briefcase color="#34d399" /> All Job Listings</h3>
              </div>
              {loading.jobs ? (
                <p style={{ color: '#94a3b8' }}>Loading jobs...</p>
              ) : jobs.length > 0 ? (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', color: '#94a3b8', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
                        <th style={{ padding: '1rem 0.75rem', textAlign: 'left' }}>Title</th>
                        <th style={{ padding: '1rem 0.75rem', textAlign: 'left' }}>Company</th>
                        <th style={{ padding: '1rem 0.75rem', textAlign: 'left' }}>Employer</th>
                        <th style={{ padding: '1rem 0.75rem', textAlign: 'left' }}>Status</th>
                        <th style={{ padding: '1rem 0.75rem', textAlign: 'right' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {jobs.map((j, idx) => (
                        <motion.tr
                          key={j.id}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.03 }}
                          style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', transition: 'background 0.15s' }}
                          onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
                          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                        >
                          <td style={{ padding: '1rem 0.75rem', color: 'white', fontWeight: 600 }}>{j.title}</td>
                          <td style={{ padding: '1rem 0.75rem', color: '#94a3b8' }}>{j.company_name}</td>
                          <td style={{ padding: '1rem 0.75rem', color: '#94a3b8' }}>{j.employer_name || 'Unknown'}</td>
                          <td style={{ padding: '1rem 0.75rem' }}>
                            <span style={{
                              padding: '4px 10px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 600,
                              background: j.is_featured ? 'rgba(251, 191, 36, 0.1)' : 'rgba(52, 211, 153, 0.1)',
                              color: j.is_featured ? '#fbbf24' : '#34d399',
                              border: `1px solid ${j.is_featured ? 'rgba(251, 191, 36, 0.2)' : 'rgba(52, 211, 153, 0.2)'}`,
                            }}>
                              {j.is_featured ? 'Featured' : 'Active'}
                            </span>
                          </td>
                          <td style={{ padding: '1rem 0.75rem', textAlign: 'right' }}>
                            <button
                              onClick={() => handleDeleteJob(j.id, j.title)}
                              style={{
                                background: 'rgba(248, 113, 113, 0.1)', border: '1px solid rgba(248, 113, 113, 0.2)',
                                color: '#f87171', padding: '8px 12px', borderRadius: '8px', cursor: 'pointer',
                                display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem',
                                fontWeight: 600, transition: 'all 0.15s',
                              }}
                              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(248, 113, 113, 0.2)'; e.currentTarget.style.borderColor = 'rgba(248, 113, 113, 0.4)'; }}
                              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(248, 113, 113, 0.1)'; e.currentTarget.style.borderColor = 'rgba(248, 113, 113, 0.2)'; }}
                            >
                              <Trash2 size={14} /> Delete
                            </button>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p style={{ color: '#94a3b8', textAlign: 'center', padding: '2rem' }}>No jobs found.</p>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
