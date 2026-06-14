import React, { useState, useEffect } from 'react';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
} from '@dnd-kit/core';
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Briefcase, ChevronDown, ExternalLink } from 'lucide-react';
import { apiGet, apiPatch } from '../utils/api';
import { useToast } from './ToastProvider';

const COLUMNS = [
  { id: 'applied', title: 'Applied', color: '#818cf8' },
  { id: 'screening', title: 'Screening', color: '#38bdf8' },
  { id: 'interview', title: 'Interview', color: '#fbbf24' },
  { id: 'offer', title: 'Offer', color: '#34d399' },
  { id: 'hired', title: 'Hired', color: '#10b981' },
  { id: 'rejected', title: 'Rejected', color: '#f87171' },
];

function getInitials(name) {
  if (!name) return '?';
  const parts = name.split(' ');
  if (parts.length > 1) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

function formatDate(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  const now = new Date();
  const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

function SortableCard({ application }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: application.application_id });

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      style={{
        padding: '1rem 1.25rem',
        marginBottom: '0.75rem',
        cursor: 'grab',
        borderRadius: '14px',
        border: isDragging
          ? '1px solid rgba(129, 140, 248, 0.3)'
          : '1px solid rgba(255,255,255,0.06)',
        background: isDragging
          ? 'rgba(129, 140, 248, 0.08)'
          : 'rgba(255,255,255,0.03)',
        transform: CSS.Transform.toString(transform),
        transition: transition || 'all 0.2s ease',
        opacity: isDragging ? 0.3 : 1,
        position: 'relative',
        backdropFilter: 'blur(8px)',
        boxShadow: isDragging
          ? '0 8px 24px rgba(129, 140, 248, 0.15)'
          : 'none',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
        <div style={{
          width: '34px', height: '34px', borderRadius: '10px',
          background: 'linear-gradient(135deg, #818cf8, #c084fc)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '0.7rem', fontWeight: 700, color: '#fff', flexShrink: 0,
        }}>
          {getInitials(application.candidate_name)}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: '0.9rem', fontWeight: 600, color: 'white', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {application.candidate_name}
          </p>
          <p style={{ fontSize: '0.75rem', color: '#94a3b8', margin: '2px 0 0' }}>
            {formatDate(application.applied_at || application.created_at)}
          </p>
        </div>
      </div>
      {application.candidate_title && (
        <p style={{ fontSize: '0.75rem', color: '#64748b', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {application.candidate_title}
        </p>
      )}
    </div>
  );
}

function ColumnContent({ column, items }) {
  const { setNodeRef, isOver } = useDroppable({ id: column.id });

  return (
    <div
      ref={setNodeRef}
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        minHeight: '120px',
        borderRadius: '16px',
        background: isOver
          ? 'rgba(129, 140, 248, 0.06)'
          : 'transparent',
        border: isOver
          ? '1px dashed rgba(129, 140, 248, 0.3)'
          : '1px dashed transparent',
        transition: 'all 0.2s ease',
        padding: '0.25rem',
      }}
    >
      <SortableContext items={items.map(i => i.application_id)} strategy={verticalListSortingStrategy}>
        <div style={{ flex: 1 }}>
          {items.length > 0 ? (
            <AnimatePresence>
              {items.map((app) => (
                <motion.div
                  key={app.application_id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                >
                  <SortableCard application={app} />
                </motion.div>
              ))}
            </AnimatePresence>
          ) : (
            <div style={{
              textAlign: 'center',
              padding: '2rem 1rem',
              color: '#64748b',
              fontSize: '0.8rem',
              border: '1px dashed rgba(255,255,255,0.05)',
              borderRadius: '14px',
            }}>
              <Users size={22} style={{ opacity: 0.2, marginBottom: '0.5rem' }} />
              <p style={{ margin: 0 }}>Drop here</p>
            </div>
          )}
        </div>
      </SortableContext>
    </div>
  );
}

export default function KanbanBoard() {
  const { addToast } = useToast();
  const [jobs, setJobs] = useState([]);
  const [selectedJobId, setSelectedJobId] = useState('');
  const [allApplications, setAllApplications] = useState([]);
  const [columnItems, setColumnItems] = useState({});
  const [loading, setLoading] = useState(true);
  const [activeId, setActiveId] = useState(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const data = await apiGet('/jobs/my-jobs');
        setJobs(data);
        if (data.length > 0 && !selectedJobId) setSelectedJobId(data[0].id);
      } catch (err) {
        console.error('Failed to load jobs', err);
      }
    };
    fetchJobs();
  }, []);

  useEffect(() => {
    if (!selectedJobId) return;
    const fetchApplications = async () => {
      setLoading(true);
      try {
        const data = await apiGet(`/applications?job_id=${selectedJobId}`);
        setAllApplications(data);
      } catch (err) {
        console.error('Failed to load applications', err);
        setAllApplications([]);
      } finally {
        setLoading(false);
      }
    };
    fetchApplications();
  }, [selectedJobId]);

  useEffect(() => {
    const grouped = {};
    for (const col of COLUMNS) grouped[col.id] = [];
    for (const app of allApplications) {
      const status = app.status || 'applied';
      if (grouped[status]) grouped[status].push(app);
      else grouped['applied'].push(app);
    }
    setColumnItems(grouped);
  }, [allApplications]);

  function findContainer(id) {
    if (id in columnItems) return id;
    for (const [containerId, containerItems] of Object.entries(columnItems)) {
      if (containerItems.some(item => item.application_id === id)) return containerId;
    }
    return null;
  }

  function handleDragStart(event) {
    setActiveId(event.active.id);
  }

  function handleDragOver(event) {
    const { active, over } = event;
    if (!over) return;

    const activeContainer = findContainer(active.id);
    const overContainer = findContainer(over.id);

    if (!activeContainer || !overContainer || activeContainer === overContainer) return;

    setColumnItems(prev => {
      const srcItems = [...prev[activeContainer]];
      const dstItems = [...prev[overContainer]];
      const srcIndex = srcItems.findIndex(item => item.application_id === active.id);
      const dstIndex = dstItems.findIndex(item => item.application_id === over.id);

      if (srcIndex === -1) return prev;

      const [movedItem] = srcItems.splice(srcIndex, 1);

      if (dstIndex >= 0) dstItems.splice(dstIndex, 0, movedItem);
      else dstItems.push(movedItem);

      return {
        ...prev,
        [activeContainer]: srcItems,
        [overContainer]: dstItems,
      };
    });
  }

  async function handleDragEnd(event) {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const activeContainer = findContainer(active.id);
    const overContainer = findContainer(over.id);

    if (!activeContainer || !overContainer) return;

    if (activeContainer !== overContainer) {
      try {
        await apiPatch(`/applications/${active.id}/status`, { status: overContainer });
        setAllApplications(prev =>
          prev.map(app =>
            app.application_id === active.id ? { ...app, status: overContainer } : app
          )
        );
        const col = COLUMNS.find(c => c.id === overContainer);
        addToast(`Moved to ${col ? col.title : overContainer}`, 'success');
      } catch (err) {
        addToast('Failed to update application status', 'error');
        setColumnItems(prev => {
          const grouped = {};
          for (const col of COLUMNS) grouped[col.id] = [];
          for (const app of allApplications) {
            const status = app.status || 'applied';
            if (grouped[status]) grouped[status].push(app);
            else grouped['applied'].push(app);
          }
          return grouped;
        });
      }
    }
  }

  const activeApplication = activeId
    ? allApplications.find(app => app.application_id === activeId)
    : null;

  return (
    <div className="glass" style={{ padding: '2rem', border: '1px solid rgba(255,255,255,0.06)' }}>
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        paddingBottom: '1.5rem',
      }}>
        <h3 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'white', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Briefcase color="#818cf8" size={24} /> Pipeline Board
        </h3>

        <div style={{ position: 'relative', minWidth: '280px' }}>
          <select
            value={selectedJobId}
            onChange={(e) => setSelectedJobId(e.target.value)}
            className="premium-input-field"
            style={{
              padding: '0.75rem 2.5rem 0.75rem 1rem',
              borderRadius: '12px',
              width: '100%',
              appearance: 'none',
              background: 'rgba(0,0,0,0.3)',
              border: '1px solid rgba(255,255,255,0.08)',
              color: 'white',
              fontSize: '0.9rem',
              fontFamily: 'inherit',
              cursor: 'pointer',
            }}
          >
            <option value="" style={{ background: '#0f172a' }}>Select a job...</option>
            {jobs.map(job => (
              <option key={job.id} value={job.id} style={{ background: '#0f172a' }}>
                {job.title}
              </option>
            ))}
          </select>
          <ChevronDown size={16} style={{
            position: 'absolute', right: '12px', top: '50%',
            transform: 'translateY(-50%)', pointerEvents: 'none',
            color: '#94a3b8',
          }} />
        </div>
      </div>

      {!selectedJobId ? (
        <div style={{ textAlign: 'center', padding: '4rem 2rem', color: '#64748b' }}>
          <div style={{
            width: '80px', height: '80px', borderRadius: '50%',
            background: 'rgba(255,255,255,0.03)', display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 1.5rem',
          }}>
            <Briefcase size={40} style={{ opacity: 0.3 }} />
          </div>
          <p style={{ fontSize: '1.1rem', color: '#94a3b8' }}>Select a job to view its application pipeline.</p>
        </div>
      ) : loading ? (
        <div style={{ display: 'flex', gap: '1rem', overflow: 'auto' }}>
          {COLUMNS.map(col => (
            <div key={col.id} style={{ flex: '1 1 0', minWidth: '260px' }}>
              <div className="skeleton" style={{ height: '44px', marginBottom: '1rem', borderRadius: '10px' }} />
              {[1, 2, 3].map(i => (
                <div key={i} className="skeleton" style={{ height: '80px', marginBottom: '0.75rem', borderRadius: '14px' }} />
              ))}
            </div>
          ))}
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          <div style={{ display: 'flex', gap: '1rem', overflow: 'auto', paddingBottom: '0.5rem' }}>
            {COLUMNS.map(column => {
              const items = columnItems[column.id] || [];
              return (
                <motion.div
                  key={column.id}
                  layout
                  style={{ flex: '1 1 0', minWidth: '270px', maxWidth: '340px', display: 'flex', flexDirection: 'column' }}
                >
                  <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '0.75rem 1rem', marginBottom: '0.75rem',
                    borderRadius: '12px',
                    background: 'rgba(255,255,255,0.02)',
                    border: '1px solid rgba(255,255,255,0.06)',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <div style={{
                        width: '10px', height: '10px', borderRadius: '50%',
                        background: column.color,
                        boxShadow: `0 0 8px ${column.color}40`,
                      }} />
                      <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'white' }}>{column.title}</span>
                    </div>
                    <span style={{
                      padding: '0.25rem 0.75rem', borderRadius: '8px',
                      fontSize: '0.75rem', fontWeight: 600,
                      background: 'rgba(255,255,255,0.05)',
                      color: '#94a3b8',
                    }}>
                      {items.length}
                    </span>
                  </div>

                  <ColumnContent column={column} items={items} />
                </motion.div>
              );
            })}
          </div>

          <DragOverlay>
            {activeApplication ? (
              <div style={{
                padding: '1rem 1.25rem',
                borderRadius: '14px',
                border: '1px solid rgba(129, 140, 248, 0.3)',
                background: 'rgba(15, 23, 42, 0.95)',
                backdropFilter: 'blur(20px)',
                boxShadow: '0 20px 60px rgba(0,0,0,0.5), 0 0 30px rgba(129, 140, 248, 0.15)',
                width: '260px',
                transform: 'rotate(3deg)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{
                    width: '34px', height: '34px', borderRadius: '10px',
                    background: 'linear-gradient(135deg, #818cf8, #c084fc)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.7rem', fontWeight: 700, color: '#fff', flexShrink: 0,
                  }}>
                    {getInitials(activeApplication.candidate_name)}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: '0.9rem', fontWeight: 600, color: 'white', margin: 0 }}>
                      {activeApplication.candidate_name}
                    </p>
                    <p style={{ fontSize: '0.75rem', color: '#94a3b8', margin: '2px 0 0' }}>
                      {formatDate(activeApplication.applied_at || activeApplication.created_at)}
                    </p>
                  </div>
                </div>
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      )}
    </div>
  );
}
