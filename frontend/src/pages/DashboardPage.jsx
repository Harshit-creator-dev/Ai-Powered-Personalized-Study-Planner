import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  BookOpen,
  ArrowRight,
  TrendingUp,
  Sparkles,
  Award,
  Layers,
  RefreshCw,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { StatCard } from '../components/StatCard';
import { ProgressBar } from '../components/ProgressBar';
import { ActivityBadge } from '../components/Badge';
import { toggleSessionComplete } from '../services/api';
import confetti from 'canvas-confetti';

export const DashboardPage = () => {
  const { currentPlan, dashboardStats, refreshDashboard, showNotification } = useApp();
  const [togglingId, setTogglingId] = useState(null);

  useEffect(() => {
    refreshDashboard();
  }, [refreshDashboard]);

  const summary = dashboardStats?.summary || {
    totalPlans: 0,
    totalSessions: 0,
    completedSessionsCount: 0,
    totalScheduledHours: 0,
    completedHours: 0,
    remainingHours: 0,
    overallCompletionRate: 0,
  };

  const upcomingExams = dashboardStats?.upcomingExams || [];
  const subjectProgress = dashboardStats?.subjectProgress || [];
  const activityStats = dashboardStats?.activityStats || {};

  // Filter today's sessions or current plan pending sessions
  const timetableSessions = currentPlan?.timetable || [];
  const todayStr = new Date().toISOString().split('T')[0];
  const pendingSessions = timetableSessions.filter((s) => !s.completed).slice(0, 5);

  const handleToggleComplete = async (session) => {
    const sId = session.sessionId || session._id;
    if (!sId) return;

    setTogglingId(sId);
    try {
      const res = await toggleSessionComplete(sId, !session.completed);
      if (res.success) {
        if (!session.completed) {
          confetti({ particleCount: 60, spread: 60, origin: { y: 0.8 } });
          showNotification('Session marked completed! Great work!', 'success');
        } else {
          showNotification('Session marked as pending.', 'info');
        }
        await refreshDashboard();
      }
    } catch (err) {
      showNotification(`Failed to update session: ${err.message}`, 'error');
    } finally {
      setTogglingId(null);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* HEADER SECTION */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '1.875rem', fontWeight: 800 }}>Student Command Dashboard</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9375rem', marginTop: '4px' }}>
            Real-time tracking of study plans, exam countdowns, and constraint satisfaction.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button onClick={refreshDashboard} className="btn btn-secondary">
            <RefreshCw size={16} />
            <span>Refresh</span>
          </button>
          <Link to="/create-plan" className="btn btn-primary">
            <Sparkles size={16} />
            <span>Generate New Plan</span>
          </Link>
        </div>
      </div>

      {/* 4 TOP STAT CARDS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
        <StatCard
          title="Total Study Hours"
          value={`${summary.totalScheduledHours}h`}
          subtitle={`${summary.totalSessions} total scheduled sessions`}
          icon={<Clock size={24} />}
          gradient="linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)"
        />
        <StatCard
          title="Hours Completed"
          value={`${summary.completedHours}h`}
          subtitle={`${summary.remainingHours}h remaining to master`}
          icon={<CheckCircle size={24} />}
          gradient="linear-gradient(135deg, #10b981 0%, #059669 100%)"
        />
        <StatCard
          title="Overall Progress"
          value={`${summary.overallCompletionRate}%`}
          subtitle={`${summary.completedSessionsCount} of ${summary.totalSessions} sessions completed`}
          icon={<TrendingUp size={24} />}
          gradient="linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)"
        />
        <StatCard
          title="Upcoming Exams"
          value={upcomingExams.length}
          subtitle={upcomingExams[0] ? `Next: ${upcomingExams[0].subject} (${upcomingExams[0].daysLeft}d left)` : 'No exams tracked'}
          icon={<Calendar size={24} />}
          gradient="linear-gradient(135deg, #f59e0b 0%, #d97706 100%)"
        />
      </div>

      {/* TWO-COLUMN GRID: EXAM COUNTDOWN + PENDING SESSIONS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '24px' }}>
        {/* UPCOMING EXAMS COUNTDOWN CARD */}
        <div className="card-3d" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Calendar size={18} color="var(--primary)" />
              <span>Upcoming Examination Deadlines</span>
            </h3>
            <span className="badge badge-primary">{upcomingExams.length} Exams</span>
          </div>

          {upcomingExams.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '32px 16px', color: 'var(--text-muted)' }}>
              <p>No upcoming examination dates registered.</p>
              <Link to="/create-plan" style={{ color: 'var(--primary)', fontWeight: 600, fontSize: '0.875rem' }}>
                Create a study plan to register exam dates &rarr;
              </Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {upcomingExams.map((exam, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 16px',
                    borderRadius: '12px',
                    backgroundColor: exam.isWeak ? '#fffbeb' : '#f8fafc',
                    border: `1px solid ${exam.isWeak ? '#fcd34d' : 'var(--border-subtle)'}`,
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontWeight: 700, fontSize: '0.9375rem', color: 'var(--text-main)' }}>
                        {exam.subject}
                      </span>
                      {exam.isWeak && (
                        <span className="badge badge-warning" style={{ fontSize: '0.7rem' }}>
                          Weak Subject Priority
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                      Date: {exam.examDate}
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div
                      style={{
                        fontSize: '1.125rem',
                        fontWeight: 800,
                        color: exam.daysLeft !== null && exam.daysLeft <= 7 ? 'var(--danger)' : 'var(--primary)',
                      }}
                    >
                      {exam.daysLeft !== null ? (exam.daysLeft >= 0 ? `${exam.daysLeft} days` : 'Exam Passed') : 'TBD'}
                    </div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {exam.daysLeft !== null && exam.daysLeft >= 0 ? 'Countdown' : ''}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ACTIVE STUDY SESSIONS */}
        <div className="card-3d" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <BookOpen size={18} color="var(--primary)" />
              <span>Priority Study Sessions</span>
            </h3>
            <Link to="/timetable" style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--primary)', textDecoration: 'none' }}>
              View Full Timetable &rarr;
            </Link>
          </div>

          {pendingSessions.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '32px 16px', color: 'var(--text-muted)' }}>
              <CheckCircle size={32} color="#10b981" style={{ margin: '0 auto 12px auto' }} />
              <p style={{ fontWeight: 600 }}>All scheduled sessions completed or no plan active!</p>
              <Link to="/create-plan" className="btn btn-primary btn-sm" style={{ marginTop: '12px' }}>
                Create New Study Plan
              </Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {pendingSessions.map((session, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 16px',
                    borderRadius: '12px',
                    backgroundColor: '#ffffff',
                    border: '1px solid var(--border-subtle)',
                    boxShadow: 'var(--shadow-sm)',
                  }}
                >
                  <div style={{ flex: 1, marginRight: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <span style={{ fontWeight: 700, fontSize: '0.875rem' }}>{session.subject}</span>
                      <ActivityBadge type={session.activityType} />
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {session.date} ({session.day})
                      </span>
                    </div>
                    <div style={{ fontSize: '0.8125rem', color: 'var(--text-main)', fontWeight: 500 }}>
                      {session.topic}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      Duration: {session.duration}h
                    </div>
                  </div>

                  <button
                    onClick={() => handleToggleComplete(session)}
                    disabled={togglingId === (session.sessionId || session._id)}
                    className="btn btn-secondary btn-sm"
                    style={{ whiteSpace: 'nowrap' }}
                  >
                    <CheckCircle size={14} color="var(--success)" />
                    <span>Done</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* SUBJECT PROGRESS BARS & PEDAGOGICAL BREAKDOWN */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
        {/* Subject-Wise Mastery */}
        <div className="card-3d" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '16px' }}>
            Subject-Wise Study Allocation & Progress
          </h3>
          {subjectProgress.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>No subject data available.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {subjectProgress.map((subj, idx) => (
                <div key={idx}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <span style={{ fontWeight: 600, fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      {subj.subject}
                      {subj.isWeak && <span className="badge badge-warning" style={{ fontSize: '0.65rem' }}>Weak Priority</span>}
                    </span>
                    <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                      {subj.completedHours}h / {subj.totalHours}h ({subj.completionRate}%)
                    </span>
                  </div>
                  <ProgressBar
                    value={subj.completedHours}
                    max={subj.totalHours || 1}
                    height={8}
                    showPercentage={false}
                    color={subj.isWeak ? 'linear-gradient(90deg, #f59e0b 0%, #ef4444 100%)' : undefined}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pedagogical Distribution */}
        <div className="card-3d" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '16px' }}>
            Pedagogical Activity Distribution
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div style={{ padding: '14px', borderRadius: '12px', backgroundColor: '#e0e7ff', color: '#3730a3' }}>
              <div style={{ fontSize: '0.8125rem', fontWeight: 700 }}>Learning</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, marginTop: '4px' }}>
                {activityStats.Learning?.total || 0}h
              </div>
              <div style={{ fontSize: '0.75rem', marginTop: '4px' }}>
                Done: {activityStats.Learning?.completed || 0}h
              </div>
            </div>

            <div style={{ padding: '14px', borderRadius: '12px', backgroundColor: '#fef3c7', color: '#92400e' }}>
              <div style={{ fontSize: '0.8125rem', fontWeight: 700 }}>Revision</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, marginTop: '4px' }}>
                {activityStats.Revision?.total || 0}h
              </div>
              <div style={{ fontSize: '0.75rem', marginTop: '4px' }}>
                Done: {activityStats.Revision?.completed || 0}h
              </div>
            </div>

            <div style={{ padding: '14px', borderRadius: '12px', backgroundColor: '#ccfbf1', color: '#115e59' }}>
              <div style={{ fontSize: '0.8125rem', fontWeight: 700 }}>Practice</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, marginTop: '4px' }}>
                {activityStats.Practice?.total || 0}h
              </div>
              <div style={{ fontSize: '0.75rem', marginTop: '4px' }}>
                Done: {activityStats.Practice?.completed || 0}h
              </div>
            </div>

            <div style={{ padding: '14px', borderRadius: '12px', backgroundColor: '#fae8ff', color: '#86198f' }}>
              <div style={{ fontSize: '0.8125rem', fontWeight: 700 }}>Self-Assessment</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, marginTop: '4px' }}>
                {activityStats['Self-assessment']?.total || 0}h
              </div>
              <div style={{ fontSize: '0.75rem', marginTop: '4px' }}>
                Done: {activityStats['Self-assessment']?.completed || 0}h
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
