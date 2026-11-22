import React, { useEffect } from 'react';
import {
  TrendingUp,
  CheckCircle2,
  Clock,
  BookOpen,
  Award,
  RefreshCw,
  Flame,
  Calendar,
  Layers,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { StatCard } from '../components/StatCard';
import { ProgressBar } from '../components/ProgressBar';
import { ActivityBadge } from '../components/Badge';

export const ProgressTrackerPage = () => {
  const { currentPlan, dashboardStats, refreshDashboard } = useApp();

  useEffect(() => {
    refreshDashboard();
  }, [refreshDashboard]);

  const summary = dashboardStats?.summary || {
    totalScheduledHours: 0,
    completedHours: 0,
    remainingHours: 0,
    overallCompletionRate: 0,
    totalSessions: 0,
    completedSessionsCount: 0,
  };

  const subjectProgress = dashboardStats?.subjectProgress || [];
  const activityStats = dashboardStats?.activityStats || {};
  const dailyCompletion = dashboardStats?.dailyCompletion || [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '1.875rem', fontWeight: 800 }}>Study Progress & Analytics</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9375rem', marginTop: '4px' }}>
            Empirical metrics computed directly from your database study sessions.
          </p>
        </div>

        <button onClick={refreshDashboard} className="btn btn-secondary">
          <RefreshCw size={16} />
          <span>Sync Database Stats</span>
        </button>
      </div>

      {/* TOP 4 METRICS CARDS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
        <StatCard
          title="Overall Mastery Rate"
          value={`${summary.overallCompletionRate}%`}
          subtitle={`${summary.completedSessionsCount} of ${summary.totalSessions} sessions completed`}
          icon={<TrendingUp size={24} />}
          gradient="linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)"
        />
        <StatCard
          title="Completed Study Hours"
          value={`${summary.completedHours}h`}
          subtitle={`Out of ${summary.totalScheduledHours}h planned`}
          icon={<CheckCircle2 size={24} />}
          gradient="linear-gradient(135deg, #10b981 0%, #059669 100%)"
        />
        <StatCard
          title="Remaining Hours"
          value={`${summary.remainingHours}h`}
          subtitle="Hours to complete before exams"
          icon={<Clock size={24} />}
          gradient="linear-gradient(135deg, #f59e0b 0%, #d97706 100%)"
        />
        <StatCard
          title="Active Study Streak"
          value={summary.completedSessionsCount > 0 ? 'Active' : 'Starting'}
          subtitle="Consistent daily habit"
          icon={<Flame size={24} />}
          gradient="linear-gradient(135deg, #ef4444 0%, #dc2626 100%)"
        />
      </div>

      {/* SUBJECT MASTERY BREAKDOWN */}
      <div className="card-3d" style={{ padding: '28px' }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '20px' }}>
          Subject-Wise Progress & Allocation
        </h3>

        {subjectProgress.length === 0 ? (
          <p style={{ color: 'var(--text-muted)' }}>No active subjects to display.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {subjectProgress.map((subj, idx) => (
              <div key={idx} style={{ padding: '16px', borderRadius: '14px', backgroundColor: '#f8fafc', border: '1px solid var(--border-subtle)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-main)' }}>
                      {subj.subject}
                    </span>
                    {subj.isWeak && (
                      <span className="badge badge-warning">
                        Weak Priority
                      </span>
                    )}
                  </div>

                  <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--primary)' }}>
                    {subj.completedHours}h / {subj.totalHours}h ({subj.completionRate}%)
                  </span>
                </div>

                <ProgressBar
                  value={subj.completedHours}
                  max={subj.totalHours || 1}
                  height={10}
                  showPercentage={false}
                  color={subj.isWeak ? 'linear-gradient(90deg, #f59e0b 0%, #ef4444 100%)' : undefined}
                />

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '6px' }}>
                  <span>Completed: {subj.completedHours}h</span>
                  <span>Remaining: {subj.remainingHours}h</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* PEDAGOGICAL ACTIVITY COMPLETION GAUGES */}
      <div className="card-3d" style={{ padding: '28px' }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '20px' }}>
          Pedagogical Activity Progress
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '18px' }}>
          {['Learning', 'Revision', 'Practice', 'Self-assessment'].map((act) => {
            const data = activityStats[act] || { total: 0, completed: 0 };
            const rate = data.total > 0 ? Math.round((data.completed / data.total) * 100) : 0;

            return (
              <div
                key={act}
                style={{
                  padding: '20px',
                  borderRadius: '16px',
                  backgroundColor: '#ffffff',
                  border: '1.5px solid var(--border-subtle)',
                  boxShadow: 'var(--shadow-sm)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <ActivityBadge type={act} />
                  <span style={{ fontWeight: 800, fontSize: '1.125rem', color: 'var(--text-main)' }}>
                    {rate}%
                  </span>
                </div>

                <ProgressBar
                  value={data.completed}
                  max={data.total || 1}
                  height={6}
                  showPercentage={false}
                />

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '8px' }}>
                  <span>Done: {data.completed}h</span>
                  <span>Total: {data.total}h</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* DAILY STUDY COMPLETION TIMELINE */}
      <div className="card-3d" style={{ padding: '28px' }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Calendar size={20} color="var(--primary)" />
          <span>Daily Study Pace & Completion Timeline</span>
        </h3>

        {dailyCompletion.length === 0 ? (
          <p style={{ color: 'var(--text-muted)' }}>No daily records found.</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '12px' }}>
            {dailyCompletion.map((day, idx) => {
              const dayRate = day.total > 0 ? Math.round((day.completed / day.total) * 100) : 0;
              const isFinished = dayRate === 100;

              return (
                <div
                  key={idx}
                  style={{
                    padding: '14px',
                    borderRadius: '12px',
                    backgroundColor: isFinished ? '#ecfdf5' : day.completed > 0 ? '#eff6ff' : '#f8fafc',
                    border: `1px solid ${isFinished ? '#a7f3d0' : '#e2e8f0'}`,
                    textAlign: 'center',
                  }}
                >
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                    {day.date}
                  </div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, color: isFinished ? '#065f46' : 'var(--text-main)', margin: '4px 0' }}>
                    {day.completed.toFixed(1)}h
                  </div>
                  <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
                    of {day.total.toFixed(1)}h ({dayRate}%)
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
