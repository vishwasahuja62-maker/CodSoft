import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Clock, Video, Send, X, Users } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/ToastProvider';
import { apiGet, apiPost } from '../utils/api';

export default function InterviewScheduler() {
  const { user } = useAuth();
  const { addToast } = useToast();
  const isEmployer = user?.role === 'employer';

  const [jobs, setJobs] = useState([]);
  const [selectedJobId, setSelectedJobId] = useState('');
  const [applicants, setApplicants] = useState([]);
  const [applicantsLoading, setApplicantsLoading] = useState(false);

  const [interviews, setInterviews] = useState([]);
  const [interviewsLoading, setInterviewsLoading] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [selectedApplicant, setSelectedApplicant] = useState(null);
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleTime, setScheduleTime] = useState('');
  const [duration, setDuration] = useState(60);
  const [notes, setNotes] = useState('');
  const [scheduling, setScheduling] = useState(false);

  useEffect(() => {
    if (isEmployer) {
      apiGet('/jobs/my-jobs').then(data => {
        setJobs(data);
        if (data.length > 0) setSelectedJobId(String(data[0].id));
      }).catch(() => addToast('Failed to load jobs', 'error'));
    } else {
      loadInterviews();
    }
  }, [isEmployer]);

  useEffect(() => {
    if (isEmployer && selectedJobId) {
      setApplicantsLoading(true);
      apiGet(`/applications/employer/${selectedJobId}`)
        .then(setApplicants)
        .catch(() => addToast('Failed to load applicants', 'error'))
        .finally(() => setApplicantsLoading(false));
    }
  }, [selectedJobId, isEmployer]);

  const loadInterviews = async () => {
    setInterviewsLoading(true);
    try {
      const data = await apiGet('/interviews');
      setInterviews(data);
    } catch {
      addToast('Failed to load interviews', 'error');
    } finally {
      setInterviewsLoading(false);
    }
  };

  const openScheduleModal = (applicant) => {
    setSelectedApplicant(applicant);
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setScheduleDate(tomorrow.toISOString().split('T')[0]);
    setScheduleTime('10:00');
    setDuration(60);
    setNotes('');
    setShowModal(true);
  };

  const handleSchedule = async (e) => {
    e.preventDefault();
    if (!scheduleDate || !scheduleTime) {
      addToast('Please select a date and time', 'error');
      return;
    }
    setScheduling(true);
    try {
      const scheduled_at = new Date(`${scheduleDate}T${scheduleTime}`).toISOString();
      await apiPost('/interviews', {
        application_id: selectedApplicant.application_id,
        candidate_id: selectedApplicant.candidate_id,
        scheduled_at,
        duration_minutes: duration,
        notes: notes.trim() || null,
      });
      addToast('Interview scheduled successfully!', 'success');
      setShowModal(false);
      setSelectedApplicant(null);
    } catch (err) {
      addToast(err.message || 'Failed to schedule interview', 'error');
    } finally {
      setScheduling(false);
    }
  };

  const formatInterviewTime = (scheduledAt) => {
    const d = new Date(scheduledAt);
    return d.toLocaleDateString('en-US', {
      weekday: 'short', year: 'numeric', month: 'short', day: 'numeric',
    }) + ' at ' + d.toLocaleTimeString('en-US', {
      hour: '2-digit', minute: '2-digit',
    });
  };

  const isUpcoming = (scheduledAt) => new Date(scheduledAt) > new Date();

  if (isEmployer) {
    const currentJob = jobs.find(j => String(j.id) === selectedJobId);

    return (
      <div className="card glass" style={{ padding: '2.5rem' }}>
        <div style={{ marginBottom: '2rem', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '1.5rem' }}>
          <h3 style={{ fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '12px', color: 'white' }}>
            <Calendar color="#818cf8" /> Schedule Interviews
          </h3>
          <p style={{ color: '#94a3b8', fontSize: '0.95rem', marginTop: '8px' }}>
            Review applicants and schedule interview time slots.
          </p>
        </div>

        <div className="form-group" style={{ marginBottom: '2rem', maxWidth: '400px' }}>
          <label className="form-label">Select Job Position</label>
          {jobs.length === 0 ? (
            <p style={{ color: '#64748b', fontSize: '0.9rem', fontStyle: 'italic' }}>
              No job listings yet. Publish a job to start scheduling interviews.
            </p>
          ) : (
            <select
              className="premium-input-field"
              value={selectedJobId}
              onChange={(e) => setSelectedJobId(e.target.value)}
              style={{ appearance: 'none', background: 'rgba(0,0,0,0.2) url("data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\' width=\'24\' height=\'24\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%2394a3b8\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'><polyline points=\'6 9 12 15 18 9\'></polyline></svg>") no-repeat right 16px center', backgroundSize: '16px' }}
            >
              {jobs.map((job) => (
                <option key={job.id} value={job.id} style={{ background: 'var(--color-surface)' }}>
                  {job.title} — {job.location}
                </option>
              ))}
            </select>
          )}
        </div>

        {!selectedJobId || !currentJob ? null : applicantsLoading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {[1, 2].map(i => (
              <div key={i} className="card" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', padding: '1.5rem', height: '80px', animation: 'pulse 1.5s infinite' }} />
            ))}
          </div>
        ) : applicants.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {applicants.map((app, idx) => (
              <motion.div
                key={app.application_id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="card"
                style={{
                  background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
                  padding: '1.5rem', display: 'flex', justifyContent: 'space-between',
                  alignItems: 'center', flexWrap: 'wrap', gap: '16px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{
                    width: '48px', height: '48px', borderRadius: '12px',
                    background: 'linear-gradient(135deg, #475569, #1e293b)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '1.2rem', fontWeight: 700, color: '#fff', flexShrink: 0,
                  }}>
                    {app.candidate_name?.split(' ').map(n => n[0]).join('').toUpperCase()}
                  </div>
                  <div>
                    <h4 style={{ color: 'white', fontWeight: 600, marginBottom: '4px', fontSize: '1.05rem' }}>
                      {app.candidate_name}
                    </h4>
                    <p style={{ color: '#94a3b8', fontSize: '0.85rem' }}>
                      {app.candidate_title || 'Candidate'} · Applied {new Date(app.applied_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => openScheduleModal(app)}
                  style={{
                    borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '6px',
                    padding: '10px 18px',
                  }}
                >
                  <Calendar size={14} /> Schedule Interview
                </button>
              </motion.div>
            ))}
          </div>
        ) : (
          <div style={{
            textAlign: 'center', padding: '60px 40px', background: 'rgba(255,255,255,0.02)',
            borderRadius: '20px', border: '1px dashed rgba(255,255,255,0.1)',
          }}>
            <div style={{
              width: '64px', height: '64px', borderRadius: '50%',
              background: 'rgba(255,255,255,0.05)', display: 'flex',
              alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px auto',
            }}>
              <Users size={32} style={{ color: '#94a3b8' }} />
            </div>
            <h4 style={{ fontSize: '1.25rem', color: 'white', marginBottom: '8px' }}>No applicants yet</h4>
            <p style={{ color: '#94a3b8', maxWidth: '400px', margin: '0 auto' }}>
              Nobody has applied to this position yet.
            </p>
          </div>
        )}

        <AnimatePresence>
          {showModal && selectedApplicant && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{
                position: 'fixed', inset: 0, zIndex: 1000,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
                padding: '1rem',
              }}
              onClick={() => setShowModal(false)}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ duration: 0.2 }}
                className="card glass"
                style={{ maxWidth: '520px', width: '100%', padding: '2rem' }}
                onClick={(e) => e.stopPropagation()}
              >
                <div style={{
                  display: 'flex', justifyContent: 'space-between',
                  alignItems: 'center', marginBottom: '1.5rem',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Video size={20} color="#818cf8" />
                    <h3 style={{ color: 'white', fontSize: '1.25rem', fontWeight: 700 }}>
                      Schedule Interview
                    </h3>
                  </div>
                  <button
                    onClick={() => setShowModal(false)}
                    style={{
                      background: 'transparent', border: 'none', color: '#94a3b8',
                      cursor: 'pointer', padding: '4px', borderRadius: '8px',
                      transition: 'background 0.15s',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <X size={20} />
                  </button>
                </div>

                <div style={{
                  background: 'rgba(255,255,255,0.03)', borderRadius: '12px',
                  padding: '1rem', marginBottom: '1.5rem',
                }}>
                  <p style={{ color: '#e2e8f0', fontSize: '0.95rem' }}>
                    <strong style={{ color: 'white' }}>{selectedApplicant.candidate_name}</strong>
                    <span style={{ color: '#64748b' }}> for </span>
                    <strong style={{ color: '#818cf8' }}>{currentJob?.title}</strong>
                  </p>
                  {selectedApplicant.candidate_email && (
                    <p style={{ color: '#64748b', fontSize: '0.85rem', marginTop: '4px' }}>
                      {selectedApplicant.candidate_email}
                    </p>
                  )}
                </div>

                <form onSubmit={handleSchedule}>
                  <div style={{
                    display: 'grid', gridTemplateColumns: '1fr 1fr',
                    gap: '1rem', marginBottom: '1rem',
                  }}>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">
                        <Calendar size={14} style={{ marginRight: '6px', verticalAlign: 'middle' }} />
                        Date
                      </label>
                      <input
                        type="date"
                        className="premium-input-field"
                        value={scheduleDate}
                        onChange={(e) => setScheduleDate(e.target.value)}
                        required
                      />
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">
                        <Clock size={14} style={{ marginRight: '6px', verticalAlign: 'middle' }} />
                        Time
                      </label>
                      <input
                        type="time"
                        className="premium-input-field"
                        value={scheduleTime}
                        onChange={(e) => setScheduleTime(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="form-group" style={{ marginBottom: '1rem' }}>
                    <label className="form-label">
                      <Clock size={14} style={{ marginRight: '6px', verticalAlign: 'middle' }} />
                      Duration
                    </label>
                    <select
                      className="premium-input-field"
                      value={duration}
                      onChange={(e) => setDuration(Number(e.target.value))}
                      style={{
                        appearance: 'none',
                        background: 'rgba(0,0,0,0.2) url("data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\' width=\'24\' height=\'24\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%2394a3b8\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'><polyline points=\'6 9 12 15 18 9\'></polyline></svg>") no-repeat right 16px center',
                        backgroundSize: '16px',
                      }}
                    >
                      <option value={30} style={{ background: 'var(--color-surface)' }}>30 minutes</option>
                      <option value={60} style={{ background: 'var(--color-surface)' }}>60 minutes</option>
                      <option value={90} style={{ background: 'var(--color-surface)' }}>90 minutes</option>
                    </select>
                  </div>

                  <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                    <label className="form-label">
                      Notes <span style={{ color: '#94a3b8', fontWeight: 400 }}>(optional)</span>
                    </label>
                    <textarea
                      className="premium-input-field"
                      rows="3"
                      placeholder="Add preparation notes, topics to cover, or meeting link..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      style={{ resize: 'vertical' }}
                    />
                  </div>

                  <div style={{
                    display: 'flex', gap: '12px', justifyContent: 'flex-end',
                    borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '1.5rem',
                  }}>
                    <button
                      type="button"
                      className="btn btn-outline"
                      onClick={() => setShowModal(false)}
                      style={{ borderRadius: '10px' }}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={scheduling}
                      style={{ borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}
                    >
                      <Send size={16} />
                      {scheduling ? 'Scheduling...' : 'Schedule Interview'}
                    </button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  const upcoming = interviews.filter(i => isUpcoming(i.scheduled_at));
  const past = interviews.filter(i => !isUpcoming(i.scheduled_at));

  return (
    <div className="card glass" style={{ padding: '2.5rem' }}>
      <div style={{
        marginBottom: '2rem', borderBottom: '1px solid rgba(255,255,255,0.08)',
        paddingBottom: '1.5rem',
      }}>
        <h3 style={{ fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '12px', color: 'white' }}>
          <Calendar color="#818cf8" /> My Interviews
        </h3>
        <p style={{ color: '#94a3b8', fontSize: '0.95rem', marginTop: '8px' }}>
          View your upcoming and past interview schedules.
        </p>
      </div>

      {interviewsLoading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {[1, 2].map(i => (
            <div key={i} className="card" style={{
              background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
              padding: '1.5rem', height: '100px', animation: 'pulse 1.5s infinite',
            }} />
          ))}
        </div>
      ) : interviews.length === 0 ? (
        <div style={{
          textAlign: 'center', padding: '60px 40px', background: 'rgba(255,255,255,0.02)',
          borderRadius: '20px', border: '1px dashed rgba(255,255,255,0.1)',
        }}>
          <div style={{
            width: '64px', height: '64px', borderRadius: '50%',
            background: 'rgba(129, 140, 248, 0.1)', display: 'flex',
            alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px auto',
          }}>
            <Calendar size={32} style={{ color: '#818cf8' }} />
          </div>
          <h4 style={{ fontSize: '1.25rem', color: 'white', marginBottom: '8px' }}>
            No interviews scheduled
          </h4>
          <p style={{ color: '#94a3b8', maxWidth: '400px', margin: '0 auto' }}>
            When an employer schedules an interview with you, it will appear here.
          </p>
        </div>
      ) : (
        <>
          {upcoming.length > 0 && (
            <div style={{ marginBottom: past.length > 0 ? '2.5rem' : 0 }}>
              <h4 style={{
                color: '#34d399', marginBottom: '1rem', fontSize: '1rem',
                display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600,
              }}>
                <Clock size={16} /> Upcoming Interviews
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {upcoming.map((interview, idx) => (
                  <motion.div
                    key={interview.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="card"
                    style={{
                      background: 'rgba(255,255,255,0.03)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      padding: '1.5rem',
                      borderLeft: '4px solid #34d399',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <h4 style={{ color: 'white', fontWeight: 600, marginBottom: '6px', fontSize: '1.15rem' }}>
                          {interview.job_title}
                        </h4>
                        <p style={{ color: '#818cf8', fontWeight: 500, marginBottom: '10px', fontSize: '0.9rem' }}>
                          with {interview.employer_name}
                        </p>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '0.85rem', color: '#94a3b8', flexWrap: 'wrap' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Calendar size={14} /> {formatInterviewTime(interview.scheduled_at)}
                          </span>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Clock size={14} /> {interview.duration_minutes} min
                          </span>
                        </div>
                        {interview.notes && (
                          <p style={{
                            color: '#94a3b8', fontSize: '0.85rem', marginTop: '10px',
                            fontStyle: 'italic', padding: '10px 14px',
                            background: 'rgba(255,255,255,0.02)', borderRadius: '8px',
                            borderLeft: '2px solid rgba(129,140,248,0.3)',
                          }}>
                            {interview.notes}
                          </p>
                        )}
                      </div>
                      <span className="badge" style={{
                        background: 'rgba(52, 211, 153, 0.15)', color: '#34d399',
                        border: '1px solid rgba(52, 211, 153, 0.3)',
                        padding: '6px 14px', borderRadius: '8px',
                        fontSize: '0.8rem', fontWeight: 600, whiteSpace: 'nowrap',
                      }}>
                        {interview.status === 'completed' ? 'Completed' : 'Scheduled'}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {past.length > 0 && (
            <div>
              <h4 style={{
                color: '#64748b', marginBottom: '1rem', fontSize: '1rem',
                display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600,
              }}>
                <Calendar size={16} /> Past Interviews
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {past.map((interview, idx) => (
                  <motion.div
                    key={interview.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="card"
                    style={{
                      background: 'rgba(255,255,255,0.02)',
                      border: '1px solid rgba(255,255,255,0.05)',
                      padding: '1.25rem', opacity: 0.65,
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                      <div>
                        <h4 style={{ color: '#cbd5e1', fontWeight: 600, marginBottom: '4px', fontSize: '1rem' }}>
                          {interview.job_title}
                        </h4>
                        <p style={{ color: '#64748b', fontSize: '0.85rem' }}>
                          with {interview.employer_name} · {formatInterviewTime(interview.scheduled_at)} · {interview.duration_minutes} min
                        </p>
                      </div>
                      <span className="badge" style={{
                        background: 'rgba(100, 116, 139, 0.15)', color: '#64748b',
                        border: '1px solid rgba(100, 116, 139, 0.3)',
                        padding: '6px 14px', borderRadius: '8px',
                        fontSize: '0.8rem', fontWeight: 600, whiteSpace: 'nowrap',
                      }}>
                        Completed
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
