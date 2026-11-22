import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar,
  Clock,
  CheckCircle2,
  Trash2,
  Edit2,
  Plus,
  RefreshCw,
  Filter,
  Sparkles,
  Layers,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ActivityBadge, StatusBadge } from '../components/Badge';
import { PDFExporter } from '../components/PDFExporter';
import { Modal } from '../components/Modal';
import { toggleSessionComplete, updateSession, deleteSession, generateStudyPlan } from '../services/api';
import confetti from 'canvas-confetti';

export const TimetablePage = () => {
  const { currentPlan, setCurrentPlan, refreshDashboard, refreshPlans, showNotification } = useApp();

  // Filters & Views
  const [viewMode, setViewMode] = useState('table'); // 'table' | 'daily' | 'weekly'
  const [selectedSubject, setSelectedSubject] = useState('ALL');
  const [selectedActivity, setSelectedActivity] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL'); // 'ALL' | 'COMPLETED' | 'PENDING'

  // Edit Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingSession, setEditingSession] = useState(null);

  // Regenerate In-Progress
  const [regenerating, setRegenerating] = useState(false);

  if (!currentPlan || !currentPlan.timetable || currentPlan.timetable.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 20px', maxWidth: '600px', margin: '0 auto' }}>
        <div
          style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            backgroundColor: '#eef2ff',
            color: 'var(--primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 20px auto',
          }}
        >
          <Calendar size={32} />
        </div>
        <h2 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '8px' }}>No Active Study Plan</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>
          Generate a study plan tailored to your exam deadlines and subjects to view your daily schedule.
        </p>
        <Link to="/create-plan" className="btn btn-primary btn-lg">
          <Sparkles size={18} />
          <span>Generate Study Plan</span>
        </Link>
      </div>
    );
  }

  const { planName, planningStartDate, planningEndDate, availableHoursPerDay = 4, weakSubjects = [], timetable = [] } = currentPlan;

  // Filter logic
  const filteredSessions = timetable.filter((s) => {
    if (selectedSubject !== 'ALL' && s.subject !== selectedSubject) return false;
    if (selectedActivity !== 'ALL' && s.activityType !== selectedActivity) return false;
    if (selectedStatus === 'COMPLETED' && !s.completed) return false;
    if (selectedStatus === 'PENDING' && s.completed) return false;
    return true;
  });

  // Calculate daily totals map
  const dailyHoursMap = {};
  timetable.forEach((s) => {
    dailyHoursMap[s.date] = (dailyHoursMap[s.date] || 0) + (Number(s.duration) || 0);
  });

  // Group by Date for Daily View
  const groupedByDate = {};
  filteredSessions.forEach((s) => {
    if (!groupedByDate[s.date]) {
      groupedByDate[s.date] = [];
    }
    groupedByDate[s.date].push(s);
  });

  // Unique Subjects for filter dropdown
  const uniqueSubjects = Array.from(new Set(timetable.map((s) => s.subject)));

  // Handlers
  const handleToggleComplete = async (session) => {
    const sId = session.sessionId || session._id;
    const newStatus = !session.completed;

    try {
      // Optimistic UI update
      const updatedTimetable = timetable.map((s) =>
        (s.sessionId === sId || s._id === sId) ? { ...s, completed: newStatus } : s
      );
      setCurrentPlan({ ...currentPlan, timetable: updatedTimetable });

      if (sId) {
        await toggleSessionComplete(sId, newStatus);
      }

      if (newStatus) {
        confetti({ particleCount: 50, spread: 60, origin: { y: 0.8 } });
        showNotification('Session completed!', 'success', 2500);
      } else {
        showNotification('Session marked as pending.', 'info', 2000);
      }
      refreshDashboard();
    } catch (err) {
      showNotification(`Failed to toggle status: ${err.message}`, 'error');
    }
  };

  const handleOpenEdit = (session) => {
    setEditingSession({ ...session });
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!editingSession) return;
    const sId = editingSession.sessionId || editingSession._id;

    try {
      if (sId) {
        await updateSession(sId, editingSession);
      }

      // Update local timetable state
      const updatedTimetable = timetable.map((s) =>
        (s.sessionId === sId || s._id === sId) ? { ...editingSession } : s
      );
      setCurrentPlan({ ...currentPlan, timetable: updatedTimetable });
      setIsEditModalOpen(false);
      showNotification('Study session updated successfully.', 'success');
      refreshDashboard();
    } catch (err) {
      showNotification(`Error updating session: ${err.message}`, 'error');
    }
  };

  const handleDeleteSession = async (session) => {
    const sId = session.sessionId || session._id;
    if (!window.confirm(`Are you sure you want to delete session for ${session.subject} on ${session.date}?`)) return;

    try {
      if (sId) {
        await deleteSession(sId);
      }
      const updatedTimetable = timetable.filter((s) => !(s.sessionId === sId || s._id === sId));
      setCurrentPlan({ ...currentPlan, timetable: updatedTimetable });
      showNotification('Session removed.', 'info');
      refreshDashboard();
    } catch (err) {
      showNotification(`Error deleting session: ${err.message}`, 'error');
    }
  };

  const handleRegenerate = async () => {
    if (!window.confirm('Regenerate timetable with updated constraints? This will refresh your schedule.')) return;
    setRegenerating(true);
    try {
      const res = await generateStudyPlan({
        ...currentPlan,
        _id: currentPlan._id,
        planId: currentPlan._id,
        allowFallbackOnFailure: true,
      });
      if (res.success) {
        setCurrentPlan(res.data);
        await refreshDashboard(res.data._id);
        await refreshPlans();
        showNotification('Timetable re-generated and re-evaluated successfully!', 'success');
      }
    } catch (err) {
      showNotification(`Regeneration failed: ${err.message}`, 'error');
    } finally {
      setRegenerating(false);
    }
  };

  const totalHours = timetable.reduce((acc, s) => acc + (Number(s.duration) || 0), 0);
  const completedHours = timetable.filter((s) => s.completed).reduce((acc, s) => acc + (Number(s.duration) || 0), 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* HEADER SECTION WITH TITLE & ACTIONS */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h1 style={{ fontSize: '1.875rem', fontWeight: 800 }}>{planName}</h1>
            <span className="badge badge-primary">{timetable.length} Sessions</span>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9375rem', marginTop: '4px' }}>
            Planning Window: {planningStartDate} to {planningEndDate} | Daily Limit: {availableHoursPerDay}h/day
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <button
            onClick={handleRegenerate}
            disabled={regenerating}
            className="btn btn-secondary"
            title="Re-run scheduling engine"
          >
            <RefreshCw size={16} className={regenerating ? 'animate-spin' : ''} />
            <span>{regenerating ? 'Regenerating...' : 'Regenerate'}</span>
          </button>

          <PDFExporter plan={currentPlan} />
        </div>
      </div>

      {/* SUMMARY BANNER */}
      <div
        className="card-3d-static"
        style={{
          padding: '16px 24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
          backgroundColor: '#ffffff',
        }}
      >
        <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
              Total Study Budget
            </span>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)' }}>
              {totalHours.toFixed(1)} Hours
            </div>
          </div>
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
              Hours Completed
            </span>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--success)' }}>
              {completedHours.toFixed(1)} Hours
            </div>
          </div>
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
              Weak Subjects
            </span>
            <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--warning)', marginTop: '2px' }}>
              {weakSubjects.length > 0 ? weakSubjects.join(', ') : 'None'}
            </div>
          </div>
        </div>

        {/* VIEW SELECTOR BUTTONS */}
        <div style={{ display: 'flex', backgroundColor: '#f1f5f9', padding: '4px', borderRadius: '10px', gap: '4px' }}>
          <button
            onClick={() => setViewMode('table')}
            style={{
              border: 'none',
              padding: '6px 14px',
              borderRadius: '8px',
              fontSize: '0.8125rem',
              fontWeight: 600,
              cursor: 'pointer',
              backgroundColor: viewMode === 'table' ? '#ffffff' : 'transparent',
              color: viewMode === 'table' ? 'var(--primary)' : 'var(--text-muted)',
              boxShadow: viewMode === 'table' ? 'var(--shadow-sm)' : 'none',
            }}
          >
            Table View
          </button>
          <button
            onClick={() => setViewMode('daily')}
            style={{
              border: 'none',
              padding: '6px 14px',
              borderRadius: '8px',
              fontSize: '0.8125rem',
              fontWeight: 600,
              cursor: 'pointer',
              backgroundColor: viewMode === 'daily' ? '#ffffff' : 'transparent',
              color: viewMode === 'daily' ? 'var(--primary)' : 'var(--text-muted)',
              boxShadow: viewMode === 'daily' ? 'var(--shadow-sm)' : 'none',
            }}
          >
            Daily View
          </button>
        </div>
      </div>

      {/* FILTER CONTROLS */}
      <div
        style={{
          display: 'flex',
          gap: '12px',
          alignItems: 'center',
          flexWrap: 'wrap',
          backgroundColor: '#ffffff',
          padding: '12px 18px',
          borderRadius: '14px',
          border: '1px solid var(--border-subtle)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-muted)' }}>
          <Filter size={16} />
          <span>Filters:</span>
        </div>

        {/* Subject Filter */}
        <select
          value={selectedSubject}
          onChange={(e) => setSelectedSubject(e.target.value)}
          className="form-control"
          style={{ width: 'auto', minWidth: '150px', padding: '6px 12px', fontSize: '0.8125rem' }}
        >
          <option value="ALL">All Subjects ({uniqueSubjects.length})</option>
          {uniqueSubjects.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>

        {/* Activity Filter */}
        <select
          value={selectedActivity}
          onChange={(e) => setSelectedActivity(e.target.value)}
          className="form-control"
          style={{ width: 'auto', minWidth: '150px', padding: '6px 12px', fontSize: '0.8125rem' }}
        >
          <option value="ALL">All Activities</option>
          <option value="Learning">Learning</option>
          <option value="Revision">Revision</option>
          <option value="Practice">Practice</option>
          <option value="Self-assessment">Self-assessment</option>
        </select>

        {/* Status Filter */}
        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="form-control"
          style={{ width: 'auto', minWidth: '140px', padding: '6px 12px', fontSize: '0.8125rem' }}
        >
          <option value="ALL">All Status</option>
          <option value="PENDING">Pending Only</option>
          <option value="COMPLETED">Completed Only</option>
        </select>

        {(selectedSubject !== 'ALL' || selectedActivity !== 'ALL' || selectedStatus !== 'ALL') && (
          <button
            onClick={() => {
              setSelectedSubject('ALL');
              setSelectedActivity('ALL');
              setSelectedStatus('ALL');
            }}
            className="btn btn-secondary btn-sm"
            style={{ fontSize: '0.75rem' }}
          >
            Reset Filters
          </button>
        )}

        <div style={{ marginLeft: 'auto', fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
          Showing <strong>{filteredSessions.length}</strong> of {timetable.length} sessions
        </div>
      </div>

      {/* VIEW MODE 1: COMPREHENSIVE DATA TABLE */}
      {viewMode === 'table' && (
        <div className="card-3d-static" style={{ overflowX: 'auto', backgroundColor: '#ffffff' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1.5px solid var(--border-subtle)' }}>
                <th style={{ padding: '14px 16px', fontWeight: 700, color: 'var(--text-muted)', width: '48px' }}>Done</th>
                <th style={{ padding: '14px 16px', fontWeight: 700, color: 'var(--text-muted)' }}>Date & Day</th>
                <th style={{ padding: '14px 16px', fontWeight: 700, color: 'var(--text-muted)' }}>Subject</th>
                <th style={{ padding: '14px 16px', fontWeight: 700, color: 'var(--text-muted)' }}>Topic</th>
                <th style={{ padding: '14px 16px', fontWeight: 700, color: 'var(--text-muted)' }}>Task / Activity</th>
                <th style={{ padding: '14px 16px', fontWeight: 700, color: 'var(--text-muted)' }}>Type</th>
                <th style={{ padding: '14px 16px', fontWeight: 700, color: 'var(--text-muted)' }}>Duration</th>
                <th style={{ padding: '14px 16px', fontWeight: 700, color: 'var(--text-muted)', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredSessions.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '36px', color: 'var(--text-muted)' }}>
                    No sessions match the selected filters.
                  </td>
                </tr>
              ) : (
                filteredSessions.map((session, idx) => {
                  const isWeak = weakSubjects.includes(session.subject);
                  const isDone = session.completed;

                  return (
                    <tr
                      key={session.sessionId || session._id || idx}
                      style={{
                        borderBottom: '1px solid #f1f5f9',
                        backgroundColor: isDone ? '#f8fafc' : '#ffffff',
                        opacity: isDone ? 0.75 : 1,
                        transition: 'background 0.15s ease',
                      }}
                    >
                      {/* Completion Checkbox */}
                      <td style={{ padding: '14px 16px' }}>
                        <input
                          type="checkbox"
                          checked={isDone}
                          onChange={() => handleToggleComplete(session)}
                          style={{ width: '18px', height: '18px', accentColor: 'var(--success)', cursor: 'pointer' }}
                        />
                      </td>

                      {/* Date & Day */}
                      <td style={{ padding: '14px 16px', whiteSpace: 'nowrap' }}>
                        <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>{session.date}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{session.day}</div>
                      </td>

                      {/* Subject */}
                      <td style={{ padding: '14px 16px', whiteSpace: 'nowrap' }}>
                        <div style={{ fontWeight: 700, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span>{session.subject}</span>
                          {isWeak && <span className="badge badge-warning" style={{ fontSize: '0.65rem' }}>Weak</span>}
                        </div>
                      </td>

                      {/* Topic */}
                      <td style={{ padding: '14px 16px', fontWeight: 500, color: 'var(--text-main)' }}>
                        {session.topic}
                      </td>

                      {/* Task Description */}
                      <td style={{ padding: '14px 16px', color: 'var(--text-muted)', fontSize: '0.8125rem', maxWidth: '280px' }}>
                        {session.task}
                      </td>

                      {/* Activity Type Badge */}
                      <td style={{ padding: '14px 16px' }}>
                        <ActivityBadge type={session.activityType} />
                      </td>

                      {/* Duration */}
                      <td style={{ padding: '14px 16px', fontWeight: 700, color: 'var(--primary)' }}>
                        {session.duration}h
                      </td>

                      {/* Action Buttons */}
                      <td style={{ padding: '14px 16px', textAlign: 'right', whiteSpace: 'nowrap' }}>
                        <button
                          onClick={() => handleOpenEdit(session)}
                          className="btn btn-secondary btn-sm"
                          style={{ padding: '6px 8px', marginRight: '6px' }}
                          title="Edit Session"
                        >
                          <Edit2 size={13} />
                        </button>
                        <button
                          onClick={() => handleDeleteSession(session)}
                          className="btn btn-danger btn-sm"
                          style={{ padding: '6px 8px' }}
                          title="Delete Session"
                        >
                          <Trash2 size={13} />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* VIEW MODE 2: DAILY ACCORDION VIEW */}
      {viewMode === 'daily' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {Object.keys(groupedByDate).sort().map((dateStr) => {
            const daySessions = groupedByDate[dateStr];
            const dayTotalHours = daySessions.reduce((acc, s) => acc + (Number(s.duration) || 0), 0);
            const isExceeded = dayTotalHours > availableHoursPerDay;

            return (
              <div key={dateStr} className="card-3d" style={{ padding: '22px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', borderBottom: '1px solid #f1f5f9', paddingBottom: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Calendar size={18} color="var(--primary)" />
                    <span style={{ fontWeight: 800, fontSize: '1.125rem' }}>{dateStr}</span>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                      ({daySessions[0]?.day || 'Scheduled'})
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span
                      style={{
                        fontSize: '0.8125rem',
                        fontWeight: 700,
                        padding: '3px 9px',
                        borderRadius: '6px',
                        backgroundColor: isExceeded ? '#fee2e2' : '#e0e7ff',
                        color: isExceeded ? '#991b1b' : '#3730a3',
                      }}
                    >
                      {dayTotalHours.toFixed(1)} / {availableHoursPerDay}h {isExceeded ? '⚠️ Limit Exceeded' : 'Allocated'}
                    </span>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
                  {daySessions.map((session, sIdx) => (
                    <div
                      key={sIdx}
                      style={{
                        padding: '14px',
                        borderRadius: '12px',
                        backgroundColor: session.completed ? '#f8fafc' : '#ffffff',
                        border: '1px solid var(--border-subtle)',
                        boxShadow: 'var(--shadow-sm)',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                          <span style={{ fontWeight: 700, fontSize: '0.9375rem' }}>{session.subject}</span>
                          <ActivityBadge type={session.activityType} />
                        </div>
                        <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-main)', marginBottom: '4px' }}>
                          {session.topic}
                        </div>
                        <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: '10px' }}>
                          {session.task}
                        </p>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '8px', borderTop: '1px solid #f1f5f9' }}>
                        <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--primary)' }}>
                          {session.duration} hours
                        </span>

                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button
                            onClick={() => handleToggleComplete(session)}
                            className={`btn btn-sm ${session.completed ? 'btn-secondary' : 'btn-primary'}`}
                            style={{ fontSize: '0.75rem' }}
                          >
                            {session.completed ? 'Completed' : 'Mark Done'}
                          </button>
                          <button
                            onClick={() => handleOpenEdit(session)}
                            className="btn btn-secondary btn-sm"
                            style={{ padding: '4px 6px' }}
                          >
                            <Edit2 size={12} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* EDIT SESSION MODAL */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Study Session"
      >
        {editingSession && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">Subject</label>
              <input
                type="text"
                className="form-control"
                value={editingSession.subject}
                onChange={(e) => setEditingSession({ ...editingSession, subject: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Topic</label>
              <input
                type="text"
                className="form-control"
                value={editingSession.topic}
                onChange={(e) => setEditingSession({ ...editingSession, topic: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Task Description</label>
              <textarea
                className="form-control"
                rows={3}
                value={editingSession.task}
                onChange={(e) => setEditingSession({ ...editingSession, task: e.target.value })}
                required
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div className="form-group">
                <label className="form-label">Date</label>
                <input
                  type="date"
                  className="form-control"
                  value={editingSession.date}
                  onChange={(e) => setEditingSession({ ...editingSession, date: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Duration (Hours)</label>
                <input
                  type="number"
                  step="0.25"
                  min="0.25"
                  max="8"
                  className="form-control"
                  value={editingSession.duration}
                  onChange={(e) => setEditingSession({ ...editingSession, duration: Number(e.target.value) })}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Activity Type</label>
              <select
                className="form-control"
                value={editingSession.activityType}
                onChange={(e) => setEditingSession({ ...editingSession, activityType: e.target.value })}
              >
                <option value="Learning">Learning</option>
                <option value="Revision">Revision</option>
                <option value="Practice">Practice</option>
                <option value="Self-assessment">Self-assessment</option>
              </select>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '12px' }}>
              <button onClick={() => setIsEditModalOpen(false)} className="btn btn-secondary">
                Cancel
              </button>
              <button onClick={handleSaveEdit} className="btn btn-primary">
                Save Changes
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
