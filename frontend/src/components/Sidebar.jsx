import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  PlusCircle,
  CalendarDays,
  FolderKanban,
  TrendingUp,
  Info,
  Sparkles,
  BookOpenCheck,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const Sidebar = ({ isOpen, setIsOpen }) => {
  const { currentPlan } = useApp();

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard size={20} /> },
    { label: 'Create Plan', path: '/create-plan', icon: <PlusCircle size={20} />, highlight: true },
    { label: 'Timetable', path: '/timetable', icon: <CalendarDays size={20} /> },
    { label: 'My Study Plans', path: '/my-plans', icon: <FolderKanban size={20} /> },
    { label: 'Progress Tracker', path: '/progress', icon: <TrendingUp size={20} /> },
    { label: 'About Project', path: '/about', icon: <Info size={20} /> },
  ];

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.4)',
            backdropFilter: 'blur(3px)',
            zIndex: 40,
          }}
          className="lg:hidden"
        />
      )}

      <aside
        style={{
          width: '260px',
          minWidth: '260px',
          backgroundColor: '#ffffff',
          borderRight: '1px solid var(--border-subtle)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          height: '100vh',
          position: 'sticky',
          top: 0,
          zIndex: 50,
          transition: 'transform 0.3s ease',
        }}
      >
        <div>
          {/* Logo Brand Header */}
          <div
            style={{
              padding: '24px 20px 20px 20px',
              borderBottom: '1px solid #f1f5f9',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
            }}
          >
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #6366f1 0%, #3b82f6 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                boxShadow: '0 8px 16px -2px rgba(99, 102, 241, 0.35)',
              }}
            >
              <Sparkles size={22} />
            </div>
            <div>
              <div style={{ fontSize: '1.0625rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em', lineHeight: 1.2 }}>
                Saarni AI
              </div>
              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--primary)' }}>
                Prompt Engineering
              </div>
            </div>
          </div>

          {/* Navigation Items */}
          <nav style={{ padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setIsOpen && setIsOpen(false)}
                style={({ isActive }) => ({
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '11px 16px',
                  borderRadius: '12px',
                  fontSize: '0.9rem',
                  fontWeight: isActive ? 700 : 500,
                  color: isActive ? '#4f46e5' : '#475569',
                  backgroundColor: isActive ? '#eef2ff' : 'transparent',
                  textDecoration: 'none',
                  transition: 'all 0.15s ease',
                  border: isActive ? '1px solid rgba(99, 102, 241, 0.2)' : '1px solid transparent',
                })}
              >
                {item.icon}
                <span>{item.label}</span>
                {item.highlight && (
                  <span
                    style={{
                      marginLeft: 'auto',
                      fontSize: '0.6875rem',
                      fontWeight: 700,
                      backgroundColor: '#6366f1',
                      color: 'white',
                      padding: '2px 6px',
                      borderRadius: '6px',
                    }}
                  >
                    AI
                  </span>
                )}
              </NavLink>
            ))}
          </nav>
        </div>

        {/* Current Active Plan Badge / Quick Status */}
        <div style={{ padding: '16px', borderTop: '1px solid #f1f5f9' }}>
          <div
            style={{
              padding: '14px',
              borderRadius: '14px',
              backgroundColor: '#f8fafc',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <BookOpenCheck size={16} color="var(--primary)" />
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Active Plan
              </span>
            </div>
            <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {currentPlan ? currentPlan.planName : 'No Active Plan'}
            </div>
            {currentPlan && (
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                {currentPlan.subjects?.length || 0} Subjects | {currentPlan.timetable?.length || 0} Sessions
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
};
