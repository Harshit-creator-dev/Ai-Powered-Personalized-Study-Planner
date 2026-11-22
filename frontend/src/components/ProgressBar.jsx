import React from 'react';

export const ProgressBar = ({ value = 0, max = 100, height = 8, color, label, showPercentage = true }) => {
  const percentage = Math.min(100, Math.max(0, Math.round((value / (max || 1)) * 100)));

  return (
    <div style={{ width: '100%' }}>
      {(label || showPercentage) && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px', fontSize: '0.8125rem' }}>
          {label && <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{label}</span>}
          {showPercentage && <span style={{ fontWeight: 700, color: 'var(--primary)' }}>{percentage}%</span>}
        </div>
      )}
      <div
        style={{
          width: '100%',
          height: `${height}px`,
          backgroundColor: '#e2e8f0',
          borderRadius: '9999px',
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        <div
          style={{
            width: `${percentage}%`,
            height: '100%',
            background: color || 'linear-gradient(90deg, #6366f1 0%, #3b82f6 100%)',
            borderRadius: '9999px',
            transition: 'width 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        />
      </div>
    </div>
  );
};
