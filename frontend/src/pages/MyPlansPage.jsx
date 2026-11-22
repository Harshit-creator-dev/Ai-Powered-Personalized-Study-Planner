import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  FolderKanban,
  Calendar,
  Clock,
  CheckCircle,
  Trash2,
  Edit,
  Eye,
  RefreshCw,
  Sparkles,
  Plus,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { getAllStudyPlans, deleteStudyPlan, updateStudyPlan, generateStudyPlan } from '../services/api';
import { ProgressBar } from '../components/ProgressBar';
import { Modal } from '../components/Modal';

export const MyPlansPage = () => {
  const navigate = useNavigate();
  const { workspaceId, plans, setPlans, setCurrentPlan, refreshDashboard, showNotification } = useApp();

  const [loading, setLoading] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const fetchPlans = async () => {
    setLoading(true);
    try {
      const res = await getAllStudyPlans(workspaceId);
      if (res.success) {
        setPlans(res.data);
      }
    } catch (err) {
      showNotification(`Failed to load plans: ${err.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, [workspaceId]);

  const handleOpenPlan = (plan) => {
    setCurrentPlan(plan);
    navigate('/timetable');
  };

  const handleDeletePlan = async (plan) => {
    if (!window.confirm(`Are you sure you want to delete "${plan.planName}"? All associated sessions will be removed.`)) return;

    try {
      const res = await deleteStudyPlan(plan._id);
      if (res.success) {
        showNotification('Study plan deleted.', 'info');
        setPlans((prev) => prev.filter((p) => p._id !== plan._id));
        refreshDashboard();
      }
    } catch (err) {
      showNotification(`Failed to delete plan: ${err.message}`, 'error');
    }
  };

  const handleOpenEdit = (plan) => {
    setEditingPlan({ ...plan });
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!editingPlan) return;
    try {
      const res = await updateStudyPlan(editingPlan._id, {
        planName: editingPlan.planName,
        availableHoursPerDay: editingPlan.availableHoursPerDay,
      });
      if (res.success) {
        showNotification('Plan updated successfully.', 'success');
        setPlans((prev) => prev.map((p) => (p._id === editingPlan._id ? res.data : p)));
        setIsEditModalOpen(false);
      }
    } catch (err) {
      showNotification(`Update failed: ${err.message}`, 'error');
    }
  };

  const handleRegenerate = async (plan) => {
    if (!window.confirm(`Regenerate timetable for "${plan.planName}"?`)) return;
    try {
      showNotification('Regenerating study plan...', 'info');
      const res = await generateStudyPlan({
        ...plan,
        _id: plan._id,
        planId: plan._id,
        allowFallbackOnFailure: true,
      });
      if (res.success) {
        showNotification('Plan regenerated and re-evaluated!', 'success');
        setCurrentPlan(res.data);
        fetchPlans();
        refreshDashboard(res.data._id);
        navigate('/timetable');
      }
    } catch (err) {
      showNotification(`Regeneration failed: ${err.message}`, 'error');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '1.875rem', fontWeight: 800 }}>My Saved Study Plans</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9375rem', marginTop: '4px' }}>
            Manage, inspect, and regenerate all plans saved under your current workspace.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button onClick={fetchPlans} className="btn btn-secondary">
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>
          <Link to="/create-plan" className="btn btn-primary">
            <Plus size={16} />
            <span>Create New Plan</span>
          </Link>
        </div>
      </div>

      {/* PLANS LIST */}
      {plans.length === 0 ? (
        <div className="card-3d" style={{ textAlign: 'center', padding: '60px 20px' }}>
          <FolderKanban size={48} color="var(--primary)" style={{ margin: '0 auto 16px auto', opacity: 0.8 }} />
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '8px' }}>No Saved Study Plans Yet</h3>
          <p style={{ color: 'var(--text-muted)', maxWidth: '440px', margin: '0 auto 20px auto', fontSize: '0.9375rem' }}>
            Generate your first personalized timetable with Google Gemini to start tracking your exam preparation.
          </p>
          <Link to="/create-plan" className="btn btn-primary">
            <Sparkles size={16} />
            <span>Generate Study Plan</span>
          </Link>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '24px' }}>
          {plans.map((plan) => {
            const totalHours = (plan.timetable || []).reduce((acc, s) => acc + (Number(s.duration) || 0), 0);
            const completedCount = (plan.timetable || []).filter((s) => s.completed).length;
            const totalCount = plan.timetable?.length || 0;
            const progress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
            const evalScore = plan.evaluationResults?.overallScore || 0;

            return (
              <div
                key={plan._id}
                className="card-3d"
                style={{
                  padding: '24px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  backgroundColor: '#ffffff',
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                    <h3 style={{ fontSize: '1.1875rem', fontWeight: 700, color: 'var(--text-main)' }}>
                      {plan.planName}
                    </h3>
                    <span
                      style={{
                        padding: '3px 8px',
                        borderRadius: '6px',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        backgroundColor: evalScore >= 90 ? '#ecfdf5' : '#fffbeb',
                        color: evalScore >= 90 ? '#065f46' : '#92400e',
                        border: `1px solid ${evalScore >= 90 ? '#10b981' : '#f59e0b'}`,
                      }}
                      title="Evaluation Score"
                    >
                      Score: {evalScore}%
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '0.8125rem', marginBottom: '8px' }}>
                    <Calendar size={14} />
                    <span>{plan.planningStartDate} to {plan.planningEndDate}</span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '0.8125rem', marginBottom: '16px' }}>
                    <Clock size={14} />
                    <span>{plan.availableHoursPerDay}h/day ({totalHours.toFixed(1)} total hours scheduled)</span>
                  </div>

                  {/* Subjects Tags */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '16px' }}>
                    {(plan.subjects || []).map((s, idx) => {
                      const isWeak = (plan.weakSubjects || []).includes(s.name);
                      return (
                        <span
                          key={idx}
                          style={{
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            padding: '2px 8px',
                            borderRadius: '6px',
                            backgroundColor: isWeak ? '#fffbeb' : '#f1f5f9',
                            color: isWeak ? '#92400e' : '#334155',
                            border: isWeak ? '1px solid #fcd34d' : 'none',
                          }}
                        >
                          {s.name} {isWeak && '★'}
                        </span>
                      );
                    })}
                  </div>

                  {/* Progress Bar */}
                  <div style={{ marginBottom: '20px' }}>
                    <ProgressBar
                      value={completedCount}
                      max={totalCount || 1}
                      label={`Progress: ${completedCount}/${totalCount} sessions`}
                    />
                  </div>
                </div>

                {/* Card Actions Footer */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '16px', borderTop: '1px solid #f1f5f9' }}>
                  <button
                    onClick={() => handleOpenPlan(plan)}
                    className="btn btn-primary btn-sm"
                  >
                    <Eye size={14} />
                    <span>Open Plan</span>
                  </button>

                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button
                      onClick={() => handleRegenerate(plan)}
                      className="btn btn-secondary btn-sm"
                      title="Regenerate Plan"
                    >
                      <RefreshCw size={14} />
                    </button>
                    <button
                      onClick={() => handleOpenEdit(plan)}
                      className="btn btn-secondary btn-sm"
                      title="Edit Plan Details"
                    >
                      <Edit size={14} />
                    </button>
                    <button
                      onClick={() => handleDeletePlan(plan)}
                      className="btn btn-danger btn-sm"
                      title="Delete Plan"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* EDIT PLAN MODAL */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Study Plan Metadata"
      >
        {editingPlan && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">Study Plan Title</label>
              <input
                type="text"
                className="form-control"
                value={editingPlan.planName}
                onChange={(e) => setEditingPlan({ ...editingPlan, planName: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Available Hours Per Day</label>
              <input
                type="number"
                min="1"
                max="16"
                className="form-control"
                value={editingPlan.availableHoursPerDay}
                onChange={(e) => setEditingPlan({ ...editingPlan, availableHoursPerDay: Number(e.target.value) })}
                required
              />
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
