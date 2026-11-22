import React from 'react';
import { Menu, Layers } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const Navbar = ({ onToggleSidebar }) => {
  const { workspaceId } = useApp();

  return (
    <header
      className="glass-panel"
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 30,
        height: '68px',
        padding: '0 28px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid var(--border-subtle)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <button
          onClick={onToggleSidebar}
          className="btn btn-secondary btn-sm"
          style={{ padding: '8px', display: 'flex', alignItems: 'center' }}
          title="Toggle Navigation"
        >
          <Menu size={20} />
        </button>

        <div>
          <span style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--text-main)' }}>
            AI-Powered Personalized Study Plan Generator
          </span>
          <span
            style={{
              marginLeft: '10px',
              fontSize: '0.6875rem',
              fontWeight: 700,
              backgroundColor: '#eef2ff',
              color: 'var(--primary)',
              padding: '2px 8px',
              borderRadius: '6px',
            }}
          >
            Prompt Engineering System
          </span>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        {/* Workspace Identifier Pill */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 12px',
            borderRadius: '9999px',
            backgroundColor: '#ffffff',
            border: '1px solid var(--border-subtle)',
            fontSize: '0.78125rem',
            color: 'var(--text-muted)',
            fontWeight: 500,
          }}
        >
          <Layers size={14} color="var(--primary)" />
          <span style={{ maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {workspaceId}
          </span>
        </div>
      </div>
    </header>
  );
};
