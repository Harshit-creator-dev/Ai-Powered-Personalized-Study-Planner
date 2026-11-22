import React from 'react';

export const StatCard = ({ title, value, subtitle, icon, gradient, trend }) => {
  return (
    <div
      className="card-3d"
      style={{
        padding: '22px 24px',
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
        <div>
          <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            {title}
          </span>
          <div style={{ fontSize: '1.875rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '4px', letterSpacing: '-0.02em' }}>
            {value}
          </div>
        </div>
        <div
          style={{
            width: '48px',
            height: '48px',
            borderRadius: '14px',
            background: gradient || 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            boxShadow: '0 8px 16px -2px rgba(99, 102, 241, 0.25)',
          }}
        >
          {icon}
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.8125rem' }}>
        <span style={{ color: 'var(--text-muted)' }}>{subtitle}</span>
        {trend && (
          <span style={{ fontWeight: 600, color: trend.positive ? 'var(--success)' : 'var(--danger)' }}>
            {trend.text}
          </span>
        )}
      </div>
    </div>
  );
};
