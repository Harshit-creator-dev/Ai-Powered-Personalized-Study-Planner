import React, { useState, useEffect } from 'react';
import {
  Settings,
  Layers,
  Sparkles,
  Database,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Server,
  Key,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { getHealth, getAIStatus } from '../services/api';

export const SettingsPage = () => {
  const { workspaceId, setWorkspaceId, aiStatus, checkAI, showNotification } = useApp();

  const [inputWorkspace, setInputWorkspace] = useState(workspaceId);
  const [healthData, setHealthData] = useState(null);
  const [checking, setChecking] = useState(false);

  const fetchStatus = async () => {
    setChecking(true);
    try {
      const [hRes] = await Promise.all([getHealth(), checkAI()]);
      setHealthData(hRes);
      showNotification('System status refreshed.', 'info', 2000);
    } catch (err) {
      showNotification(`Status check failed: ${err.message}`, 'error');
    } finally {
      setChecking(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const handleSaveWorkspace = (e) => {
    e.preventDefault();
    if (!inputWorkspace.trim()) return;
    setWorkspaceId(inputWorkspace.trim());
    showNotification(`Switched active workspace to: ${inputWorkspace.trim()}`, 'success');
  };

  const handleGenerateRandomWorkspace = () => {
    const randomId = 'student-' + Math.random().toString(36).substring(2, 9);
    setInputWorkspace(randomId);
    setWorkspaceId(randomId);
    showNotification(`Generated new anonymous workspace: ${randomId}`, 'success');
  };

  const isGeminiReady = aiStatus?.configured && aiStatus?.verification?.available;
  const isDbConnected = healthData?.database?.isConnected;

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '1.875rem', fontWeight: 800 }}>System Settings & Diagnostics</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9375rem', marginTop: '4px' }}>
            Inspect Gemini AI integration, MongoDB Atlas state, and manage your student workspace.
          </p>
        </div>

        <button onClick={fetchStatus} disabled={checking} className="btn btn-secondary">
          <RefreshCw size={16} className={checking ? 'animate-spin' : ''} />
          <span>Run Diagnostic Check</span>
        </button>
      </div>

      {/* 1. ANONYMOUS WORKSPACE IDENTIFIER */}
      <div className="card-3d" style={{ padding: '28px', backgroundColor: '#ffffff' }}>
        <h3 style={{ fontSize: '1.1875rem', fontWeight: 700, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Layers size={20} color="var(--primary)" />
          <span>Anonymous Student Workspace</span>
        </h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '20px', lineHeight: 1.5 }}>
          Your study plans and session progress are stored under your workspace identifier. You can share plans across
          browsers by using the same workspace key, without needing personal accounts or passwords.
        </p>

        <form onSubmit={handleSaveWorkspace} style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <input
            type="text"
            className="form-control"
            value={inputWorkspace}
            onChange={(e) => setInputWorkspace(e.target.value)}
            style={{ maxWidth: '380px' }}
            placeholder="Enter custom workspace identifier"
            required
          />
          <button type="submit" className="btn btn-primary">
            Save Workspace
          </button>
          <button type="button" onClick={handleGenerateRandomWorkspace} className="btn btn-secondary">
            Generate Random ID
          </button>
        </form>
      </div>

      {/* 2. GEMINI AI INTEGRATION STATUS */}
      <div className="card-3d" style={{ padding: '28px', backgroundColor: '#ffffff' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
          <h3 style={{ fontSize: '1.1875rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sparkles size={20} color="var(--primary)" />
            <span>Google Gemini AI Integration</span>
          </h3>

          <span
            style={{
              padding: '4px 12px',
              borderRadius: '9999px',
              fontSize: '0.8125rem',
              fontWeight: 700,
              backgroundColor: isGeminiReady ? '#ecfdf5' : '#fffbeb',
              color: isGeminiReady ? '#065f46' : '#92400e',
              border: `1px solid ${isGeminiReady ? '#10b981' : '#f59e0b'}`,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            {isGeminiReady ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
            <span>{isGeminiReady ? 'Model Verified & Active' : 'API Key Setup Required'}</span>
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px', marginBottom: '20px' }}>
          <div style={{ padding: '14px', borderRadius: '12px', backgroundColor: '#f8fafc', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Target Model</div>
            <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)', marginTop: '2px' }}>
              {aiStatus?.modelName || 'gemini-3.5-flash-lite'}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--primary)', marginTop: '2px' }}>
              Strict verification enabled
            </div>
          </div>

          <div style={{ padding: '14px', borderRadius: '12px', backgroundColor: '#f8fafc', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>SDK Integration</div>
            <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)', marginTop: '2px' }}>
              @google/genai (Official SDK)
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
              Backend isolated execution
            </div>
          </div>

          <div style={{ padding: '14px', borderRadius: '12px', backgroundColor: '#f8fafc', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Model Status</div>
            <div style={{ fontSize: '1rem', fontWeight: 700, color: isGeminiReady ? 'var(--success)' : 'var(--warning)', marginTop: '2px' }}>
              {isGeminiReady ? 'Ready for Generation' : 'Key Unconfigured'}
            </div>
          </div>
        </div>

        <div style={{ padding: '16px', borderRadius: '12px', backgroundColor: '#f8fafc', border: '1px solid var(--border-subtle)', fontSize: '0.875rem' }}>
          <div style={{ fontWeight: 600, marginBottom: '4px' }}>Configuration Instructions:</div>
          <p style={{ color: 'var(--text-muted)', lineHeight: 1.5 }}>
            To connect directly to Gemini, place your Google AI API key inside <code>backend/.env</code>:
          </p>
          <pre style={{ backgroundColor: '#0f172a', color: '#f8fafc', padding: '10px 14px', borderRadius: '8px', fontSize: '0.8125rem', marginTop: '8px', overflowX: 'auto' }}>
            GEMINI_API_KEY=your_actual_gemini_api_key{'\n'}
            GEMINI_MODEL=gemini-3.5-flash-lite
          </pre>
          <p style={{ color: 'var(--text-muted)', marginTop: '8px', fontSize: '0.8125rem' }}>
            *Note: As per strict system instructions, if the requested model is unavailable, another model is never silently substituted.
          </p>
        </div>
      </div>

      {/* 3. MONGODB DATABASE STATUS */}
      <div className="card-3d" style={{ padding: '28px', backgroundColor: '#ffffff' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
          <h3 style={{ fontSize: '1.1875rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Database size={20} color="var(--primary)" />
            <span>MongoDB Database Status</span>
          </h3>

          <span
            style={{
              padding: '4px 12px',
              borderRadius: '9999px',
              fontSize: '0.8125rem',
              fontWeight: 700,
              backgroundColor: isDbConnected ? '#ecfdf5' : '#fef2f2',
              color: isDbConnected ? '#065f46' : '#991b1b',
              border: `1px solid ${isDbConnected ? '#10b981' : '#f87171'}`,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            {isDbConnected ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
            <span>{isDbConnected ? 'Connected & Operational' : 'Disconnected'}</span>
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
          <div style={{ padding: '14px', borderRadius: '12px', backgroundColor: '#f8fafc', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Engine Type</div>
            <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)', marginTop: '2px' }}>
              {healthData?.database?.isMemoryFallback ? 'In-Memory Zero-Setup Engine' : 'MongoDB Atlas / Remote'}
            </div>
          </div>

          <div style={{ padding: '14px', borderRadius: '12px', backgroundColor: '#f8fafc', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Active Host</div>
            <div style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--text-muted)', marginTop: '2px', wordBreak: 'break-all' }}>
              {healthData?.database?.host || 'Local host'}
            </div>
          </div>

          <div style={{ padding: '14px', borderRadius: '12px', backgroundColor: '#f8fafc', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Database Name</div>
            <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)', marginTop: '2px' }}>
              {healthData?.database?.name || 'study_planner'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
