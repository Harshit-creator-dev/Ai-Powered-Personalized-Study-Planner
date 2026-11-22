import React, { useState } from 'react';
import {
  BrainCircuit,
  CheckCircle2,
  AlertTriangle,
  Code,
  Layers,
  FileText,
  Clock,
  Sparkles,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { StatusBadge } from '../components/Badge';
import { RadarChart } from '../components/RadarChart';

export const PromptAnalysisPage = () => {
  const { currentPlan, plans, setCurrentPlan } = useApp();
  const [activeTab, setActiveTab] = useState('rules'); // 'rules' | 'prompt' | 'response' | 'validation'

  if (!currentPlan) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 20px' }}>
        <BrainCircuit size={48} color="var(--primary)" style={{ margin: '0 auto 16px auto' }} />
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>No Active Plan Selected</h2>
        <p style={{ color: 'var(--text-muted)' }}>Generate or open a study plan to inspect its prompt engineering analysis.</p>
      </div>
    );
  }

  const {
    planName,
    evaluationResults = {},
    generatedPrompt = {},
    timetable = [],
    availableHoursPerDay,
    planningStartDate,
    planningEndDate,
    weakSubjects = [],
    subjects = [],
    examDates = [],
  } = currentPlan;

  const metrics = evaluationResults.metrics || [];
  const warnings = evaluationResults.warnings || [];
  const recommendations = evaluationResults.recommendations || [];
  const overallScore = evaluationResults.overallScore || 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* HEADER & PLAN SELECTOR */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h1 style={{ fontSize: '1.875rem', fontWeight: 800 }}>Prompt Engineering & Evaluation</h1>
            <span
              style={{
                fontSize: '0.8125rem',
                fontWeight: 700,
                padding: '4px 10px',
                borderRadius: '8px',
                backgroundColor: overallScore >= 90 ? '#ecfdf5' : '#fffbeb',
                color: overallScore >= 90 ? '#065f46' : '#92400e',
                border: `1px solid ${overallScore >= 90 ? '#10b981' : '#f59e0b'}`,
              }}
            >
              Evaluation Score: {overallScore}%
            </span>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9375rem', marginTop: '4px' }}>
            Transparent inspection of system prompts, user context grounding, and deterministic metric rules.
          </p>
        </div>

        {/* Plan Switcher */}
        {plans.length > 1 && (
          <select
            value={currentPlan._id}
            onChange={(e) => {
              const selected = plans.find((p) => p._id === e.target.value);
              if (selected) setCurrentPlan(selected);
            }}
            className="form-control"
            style={{ width: 'auto', minWidth: '220px' }}
          >
            {plans.map((p) => (
              <option key={p._id} value={p._id}>
                {p.planName}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* METRIC RADAR & SUMMARY BANNER */}
      <div
        className="card-3d"
        style={{
          padding: '28px',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '24px',
          alignItems: 'center',
          backgroundColor: '#ffffff',
        }}
      >
        <div>
          <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase' }}>
            Multi-Dimensional Constraint Engine
          </span>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginTop: '4px', marginBottom: '12px' }}>
            Deterministic Performance Evaluation
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '20px' }}>
            Scores are computed through independent mathematical verification rules on actual timetable data,
            verifying daily hour caps, exam deadlines, and weak subject multipliers.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div style={{ padding: '12px', borderRadius: '10px', backgroundColor: '#f8fafc', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Feasibility Cap</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--primary)' }}>
                {evaluationResults.feasibilityScore || 0}%
              </div>
            </div>

            <div style={{ padding: '12px', borderRadius: '10px', backgroundColor: '#f8fafc', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Exam Compliance</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--primary)' }}>
                {evaluationResults.examComplianceScore || 0}%
              </div>
            </div>

            <div style={{ padding: '12px', borderRadius: '10px', backgroundColor: '#f8fafc', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Weak Prioritization</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--primary)' }}>
                {evaluationResults.weakSubjectPrioritizationScore || 0}%
              </div>
            </div>

            <div style={{ padding: '12px', borderRadius: '10px', backgroundColor: '#f8fafc', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Hour Satisfaction</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--primary)' }}>
                {evaluationResults.hourSatisfactionScore || 0}%
              </div>
            </div>
          </div>
        </div>

        {/* Radar Chart Component */}
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <RadarChart metrics={metrics} size={300} />
        </div>
      </div>

      {/* WARNINGS & RECOMMENDATIONS */}
      {(warnings.length > 0 || recommendations.length > 0) && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
          {warnings.length > 0 && (
            <div style={{ padding: '20px', borderRadius: '14px', backgroundColor: '#fffbeb', border: '1px solid #fcd34d' }}>
              <h4 style={{ color: '#92400e', fontWeight: 700, fontSize: '0.9375rem', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <AlertTriangle size={16} />
                <span>Constraint Advisories</span>
              </h4>
              <ul style={{ paddingLeft: '20px', fontSize: '0.8125rem', color: '#78350f', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {warnings.map((w, idx) => (
                  <li key={idx}>{w}</li>
                ))}
              </ul>
            </div>
          )}

          {recommendations.length > 0 && (
            <div style={{ padding: '20px', borderRadius: '14px', backgroundColor: '#ecfdf5', border: '1px solid #a7f3d0' }}>
              <h4 style={{ color: '#065f46', fontWeight: 700, fontSize: '0.9375rem', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <CheckCircle2 size={16} />
                <span>Cognitive Scheduling Insights</span>
              </h4>
              <ul style={{ paddingLeft: '20px', fontSize: '0.8125rem', color: '#064e3b', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {recommendations.map((r, idx) => (
                  <li key={idx}>{r}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* INSPECT TABS NAVIGATION */}
      <div style={{ display: 'flex', gap: '8px', borderBottom: '2px solid var(--border-subtle)', paddingBottom: '4px' }}>
        <button
          onClick={() => setActiveTab('rules')}
          style={{
            background: 'none',
            border: 'none',
            padding: '10px 16px',
            fontSize: '0.9375rem',
            fontWeight: 700,
            cursor: 'pointer',
            color: activeTab === 'rules' ? 'var(--primary)' : 'var(--text-muted)',
            borderBottom: activeTab === 'rules' ? '3px solid var(--primary)' : '3px solid transparent',
          }}
        >
          1. Rule Evaluation Breakdown ({metrics.length})
        </button>

        <button
          onClick={() => setActiveTab('prompt')}
          style={{
            background: 'none',
            border: 'none',
            padding: '10px 16px',
            fontSize: '0.9375rem',
            fontWeight: 700,
            cursor: 'pointer',
            color: activeTab === 'prompt' ? 'var(--primary)' : 'var(--text-muted)',
            borderBottom: activeTab === 'prompt' ? '3px solid var(--primary)' : '3px solid transparent',
          }}
        >
          2. Generated AI Prompt
        </button>

        <button
          onClick={() => setActiveTab('response')}
          style={{
            background: 'none',
            border: 'none',
            padding: '10px 16px',
            fontSize: '0.9375rem',
            fontWeight: 700,
            cursor: 'pointer',
            color: activeTab === 'response' ? 'var(--primary)' : 'var(--text-muted)',
            borderBottom: activeTab === 'response' ? '3px solid var(--primary)' : '3px solid transparent',
          }}
        >
          3. Gemini Model Output & Latency
        </button>
      </div>

      {/* TAB 1: 8 RULE EVALUATION CARDS */}
      {activeTab === 'rules' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '18px' }}>
          {metrics.map((m, idx) => (
            <div
              key={idx}
              className="card-3d"
              style={{
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                backgroundColor: '#ffffff',
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <h4 style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--text-main)' }}>
                    {m.name}
                  </h4>
                  <StatusBadge status={m.status} />
                </div>

                <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--primary)', marginBottom: '8px' }}>
                  {m.score}%
                </div>

                <p style={{ fontSize: '0.8125rem', color: 'var(--text-main)', marginBottom: '10px', fontWeight: 500 }}>
                  {m.details}
                </p>
              </div>

              <div
                style={{
                  fontSize: '0.75rem',
                  fontFamily: 'var(--font-mono)',
                  color: 'var(--text-muted)',
                  backgroundColor: '#f8fafc',
                  padding: '8px 10px',
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0',
                  marginTop: '10px',
                  wordBreak: 'break-all',
                }}
              >
                {m.mathExplanation}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 2: PROMPT INSPECTION */}
      {activeTab === 'prompt' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="card-3d" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '12px' }}>
              System Prompt (Persona, Constraints & Output Schema)
            </h3>
            <pre
              style={{
                backgroundColor: '#0f172a',
                color: '#f8fafc',
                padding: '20px',
                borderRadius: '12px',
                fontSize: '0.8125rem',
                fontFamily: 'var(--font-mono)',
                whiteSpace: 'pre-wrap',
                maxHeight: '400px',
                overflowY: 'auto',
              }}
            >
              {generatedPrompt.systemPrompt || 'System prompt metadata not found.'}
            </pre>
          </div>

          <div className="card-3d" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '12px' }}>
              Dynamic Context-Grounded User Prompt
            </h3>
            <pre
              style={{
                backgroundColor: '#0f172a',
                color: '#f8fafc',
                padding: '20px',
                borderRadius: '12px',
                fontSize: '0.8125rem',
                fontFamily: 'var(--font-mono)',
                whiteSpace: 'pre-wrap',
                maxHeight: '400px',
                overflowY: 'auto',
              }}
            >
              {generatedPrompt.userPrompt || 'User prompt metadata not found.'}
            </pre>
          </div>
        </div>
      )}

      {/* TAB 3: GEMINI RESPONSE & LATENCY */}
      {activeTab === 'response' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="card-3d" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <h3 style={{ fontSize: '1.125rem', fontWeight: 700 }}>Model Execution Telemetry</h3>
                <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                  Model: <strong>{generatedPrompt.modelUsed || 'gemini-3.5-flash-lite'}</strong>
                </span>
              </div>

              <div style={{ display: 'flex', gap: '16px', fontSize: '0.8125rem' }}>
                <div>Latency: <strong>{generatedPrompt.latencyMs || 0} ms</strong></div>
                <div>Est. Prompt Tokens: <strong>{generatedPrompt.promptTokensEstimate || 0}</strong></div>
                <div>Est. Output Tokens: <strong>{generatedPrompt.responseTokensEstimate || 0}</strong></div>
              </div>
            </div>

            <pre
              style={{
                backgroundColor: '#0f172a',
                color: '#38bdf8',
                padding: '20px',
                borderRadius: '12px',
                fontSize: '0.8125rem',
                fontFamily: 'var(--font-mono)',
                whiteSpace: 'pre-wrap',
                maxHeight: '450px',
                overflowY: 'auto',
              }}
            >
              {generatedPrompt.rawResponseText || 'Raw response text not captured.'}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};
