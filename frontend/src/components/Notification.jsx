import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export const Notification = ({ notification, onClose }) => {
  if (!notification) return null;

  const { message, type = 'info' } = notification;

  const config = {
    success: {
      bg: '#ecfdf5',
      border: '#10b981',
      text: '#065f46',
      icon: <CheckCircle2 size={20} color="#10b981" />,
    },
    error: {
      bg: '#fef2f2',
      border: '#ef4444',
      text: '#991b1b',
      icon: <AlertCircle size={20} color="#ef4444" />,
    },
    info: {
      bg: '#eef2ff',
      border: '#6366f1',
      text: '#3730a3',
      icon: <Info size={20} color="#6366f1" />,
    },
  }[type] || {
    bg: '#ffffff',
    border: '#cbd5e1',
    text: '#0f172a',
    icon: <Info size={20} color="#64748b" />,
  };

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        background: config.bg,
        border: `1.5px solid ${config.border}`,
        borderRadius: '14px',
        padding: '14px 20px',
        color: config.text,
        boxShadow: '0 12px 28px -4px rgba(0, 0, 0, 0.15)',
        maxWidth: '450px',
        animation: 'fadeIn 0.25s ease-out',
      }}
    >
      <div style={{ flexShrink: 0 }}>{config.icon}</div>
      <div style={{ fontSize: '0.9rem', fontWeight: 500, flex: 1 }}>{message}</div>
      <button
        onClick={onClose}
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: '4px',
          color: config.text,
          opacity: 0.7,
        }}
        title="Dismiss"
      >
        <X size={16} />
      </button>
    </div>
  );
};
