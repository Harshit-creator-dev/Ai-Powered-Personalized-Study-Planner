import React from 'react';
import { BookOpen, RefreshCw, Award, CheckCircle, AlertTriangle, AlertOctagon } from 'lucide-react';

export const ActivityBadge = ({ type }) => {
  const styles = {
    Learning: { bg: '#e0e7ff', text: '#3730a3', icon: <BookOpen size={12} /> },
    Revision: { bg: '#fef3c7', text: '#92400e', icon: <RefreshCw size={12} /> },
    Practice: { bg: '#ccfbf1', text: '#115e59', icon: <Award size={12} /> },
    'Self-assessment': { bg: '#fae8ff', text: '#86198f', icon: <CheckCircle size={12} /> },
  }[type] || { bg: '#f1f5f9', text: '#475569', icon: null };

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '5px',
        padding: '3px 9px',
        borderRadius: '9999px',
        fontSize: '0.75rem',
        fontWeight: 600,
        backgroundColor: styles.bg,
        color: styles.text,
      }}
    >
      {styles.icon}
      {type}
    </span>
  );
};

export const StatusBadge = ({ status }) => {
  const styles = {
    PASS: { bg: '#ecfdf5', text: '#065f46', border: '#10b981', icon: <CheckCircle size={12} /> },
    WARNING: { bg: '#fffbeb', text: '#92400e', border: '#f59e0b', icon: <AlertTriangle size={12} /> },
    FAIL: { bg: '#fef2f2', text: '#991b1b', border: '#ef4444', icon: <AlertOctagon size={12} /> },
  }[status] || { bg: '#f8fafc', text: '#475569', border: '#cbd5e1', icon: null };

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        padding: '2px 8px',
        borderRadius: '6px',
        fontSize: '0.75rem',
        fontWeight: 700,
        backgroundColor: styles.bg,
        color: styles.text,
        border: `1px solid ${styles.border}`,
      }}
    >
      {styles.icon}
      {status}
    </span>
  );
};

export const DifficultyBadge = ({ difficulty }) => {
  const styles = {
    Hard: { bg: '#fee2e2', text: '#991b1b' },
    Medium: { bg: '#fef3c7', text: '#92400e' },
    Easy: { bg: '#dcfce7', text: '#166534' },
  }[difficulty] || { bg: '#f1f5f9', text: '#475569' };

  return (
    <span
      style={{
        display: 'inline-block',
        padding: '2px 8px',
        borderRadius: '6px',
        fontSize: '0.75rem',
        fontWeight: 600,
        backgroundColor: styles.bg,
        color: styles.text,
      }}
    >
      {difficulty || 'Medium'}
    </span>
  );
};
