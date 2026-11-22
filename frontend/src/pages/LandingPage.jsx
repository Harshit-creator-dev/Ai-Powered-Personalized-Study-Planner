import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Sparkles,
  ArrowRight,
  BrainCircuit,
  CheckCircle2,
  Calendar,
  Layers,
  Award,
  Zap,
  Target,
  FileText,
  BarChart3,
  ShieldCheck,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { getSampleData, generateStudyPlan } from '../services/api';

export const LandingPage = () => {
  const navigate = useNavigate();
  const { setCurrentPlan, showNotification, refreshPlans, refreshDashboard } = useApp();

  const handleQuickLoadSample = async () => {
    try {
      showNotification('Loading Section 17 sample test dataset (DSA, DBMS, OS, NLP)...', 'info');
      const res = await getSampleData();
      if (res.success) {
        showNotification('Sample data loaded! Generating personalized plan...', 'info');
        const planRes = await generateStudyPlan({
          ...res.data,
          useAlgorithmicBaseline: false,
          allowFallbackOnFailure: true,
        });
        if (planRes.success) {
          setCurrentPlan(planRes.data);
          await refreshPlans();
          await refreshDashboard();
          showNotification('Sample Study Plan successfully generated and evaluated!', 'success');
          navigate('/timetable');
        }
      }
    } catch (err) {
      showNotification(`Failed to load sample: ${err.message}`, 'error');
    }
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px 0 60px 0' }}>
      {/* HERO SECTION */}
      <section style={{ textAlign: 'center', padding: '40px 20px 60px 20px' }}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 16px',
            borderRadius: '9999px',
            background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.12) 0%, rgba(6, 182, 212, 0.12) 100%)',
            border: '1px solid rgba(99, 102, 241, 0.25)',
            fontSize: '0.875rem',
            fontWeight: 700,
            color: 'var(--primary-hover)',
            marginBottom: '20px',
          }}
        >
          <Sparkles size={16} color="var(--primary)" />
          <span>Next-Gen Academic Scheduling Powered by Prompt Engineering</span>
        </div>

        <h1
          style={{
            fontSize: 'clamp(2.2rem, 5vw, 3.8rem)',
            fontWeight: 800,
            lineHeight: 1.15,
            letterSpacing: '-0.03em',
            marginBottom: '24px',
          }}
        >
          Master Multiple Exams with <br />
          <span className="text-gradient">AI-Engineered Personalized Study Plans</span>
        </h1>

        <p
          style={{
            fontSize: '1.1875rem',
            color: 'var(--text-muted)',
            maxWidth: '780px',
            margin: '0 auto 36px auto',
            lineHeight: 1.6,
          }}
        >
          Transform strict examination deadlines, difficult syllabi, and limited daily hours into a mathematically
          feasible, cognitive-science timetable using Google Gemini prompt engineering.
        </p>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}>
          <Link to="/create-plan" className="btn btn-primary btn-lg">
            <span>Create Study Plan</span>
            <ArrowRight size={18} />
          </Link>
          <button onClick={handleQuickLoadSample} className="btn btn-secondary btn-lg">
            <Zap size={18} color="var(--primary)" />
            <span>Load Fictional Test Dataset</span>
          </button>
          <Link to="/about" className="btn btn-secondary btn-lg">
            <span>Read Architecture Rationale</span>
          </Link>
        </div>
      </section>

      {/* 3D FEATURE CARDS GRID */}
      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px', marginBottom: '64px' }}>
        <div className="card-3d" style={{ padding: '28px' }}>
          <div
            style={{
              width: '50px',
              height: '50px',
              borderRadius: '14px',
              background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              marginBottom: '20px',
            }}
          >
            <BrainCircuit size={26} />
          </div>
          <h3 style={{ fontSize: '1.25rem', marginBottom: '10px' }}>Dynamic Prompt Engineering</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9375rem', lineHeight: 1.6 }}>
            Constructs context-dense system & user prompts providing Gemini with exact pedagogical constraints,
            exam countdowns, and structured JSON output specifications.
          </p>
        </div>

        <div className="card-3d" style={{ padding: '28px' }}>
          <div
            style={{
              width: '50px',
              height: '50px',
              borderRadius: '14px',
              background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              marginBottom: '20px',
            }}
          >
            <Target size={26} />
          </div>
          <h3 style={{ fontSize: '1.25rem', marginBottom: '10px' }}>Weak Subject Prioritization</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9375rem', lineHeight: 1.6 }}>
            Automatically detects weak subjects (e.g. DBMS) and allocates 1.35x to 1.5x preferential study time,
            ensuring extra revision loops and practice sessions.
          </p>
        </div>

        <div className="card-3d" style={{ padding: '28px' }}>
          <div
            style={{
              width: '50px',
              height: '50px',
              borderRadius: '14px',
              background: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              marginBottom: '20px',
            }}
          >
            <ShieldCheck size={26} />
          </div>
          <h3 style={{ fontSize: '1.25rem', marginBottom: '10px' }}>Deterministic Rule Engine</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9375rem', lineHeight: 1.6 }}>
            Assesses every generated timetable across 8 mathematical dimensions: Feasibility, Completeness, Consistency,
            Exam Compliance, and Practice coverage without random scores.
          </p>
        </div>
      </section>

      {/* COMPARATIVE ANALYSIS: MYSTUDYLIFE VS OUR SYSTEM */}
      <section className="card-3d" style={{ padding: '36px', marginBottom: '64px' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase' }}>
            Comparative Evaluation
          </span>
          <h2 style={{ fontSize: '1.875rem', marginTop: '6px' }}>
            Why Traditional Tools (e.g., MyStudyLife) Fall Short
          </h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
          {/* Traditional Planners */}
          <div style={{ padding: '24px', backgroundColor: '#fef2f2', borderRadius: '16px', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
            <h3 style={{ color: '#991b1b', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>Existing Solution: MyStudyLife</span>
            </h3>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.9rem', color: '#7f1d1d' }}>
              <li style={{ display: 'flex', gap: '10px' }}>
                <span style={{ color: '#ef4444', fontWeight: 'bold' }}>✕</span>
                <span>Requires manual entry and drag-and-drop for every single study session.</span>
              </li>
              <li style={{ display: 'flex', gap: '10px' }}>
                <span style={{ color: '#ef4444', fontWeight: 'bold' }}>✕</span>
                <span>No automated pedagogical awareness: cannot balance topic learning vs active recall revision.</span>
              </li>
              <li style={{ display: 'flex', gap: '10px' }}>
                <span style={{ color: '#ef4444', fontWeight: 'bold' }}>✕</span>
                <span>Ignores student weaknesses and does not calculate time allocation ratios.</span>
              </li>
              <li style={{ display: 'flex', gap: '10px' }}>
                <span style={{ color: '#ef4444', fontWeight: 'bold' }}>✕</span>
                <span>No constraint validation: students frequently over-schedule and burn out.</span>
              </li>
            </ul>
          </div>

          {/* Our AI Solution */}
          <div style={{ padding: '24px', backgroundColor: '#ecfdf5', borderRadius: '16px', border: '1px solid rgba(16, 185, 129, 0.25)' }}>
            <h3 style={{ color: '#065f46', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>Our Proposed Solution: AI-Powered StudyGen</span>
            </h3>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.9rem', color: '#064e3b' }}>
              <li style={{ display: 'flex', gap: '10px' }}>
                <CheckCircle2 size={18} color="#10b981" style={{ flexShrink: 0 }} />
                <span>Fully automated intelligent scheduling using Gemini 3.5 Flash Lite prompt engineering.</span>
              </li>
              <li style={{ display: 'flex', gap: '10px' }}>
                <CheckCircle2 size={18} color="#10b981" style={{ flexShrink: 0 }} />
                <span>Cognitive science distribution: 50% Learning, 25% Revision, 20% Practice, 5% Assessment.</span>
              </li>
              <li style={{ display: 'flex', gap: '10px' }}>
                <CheckCircle2 size={18} color="#10b981" style={{ flexShrink: 0 }} />
                <span>Weighted bias for weak subjects (+35% to +50% hours allocated automatically).</span>
              </li>
              <li style={{ display: 'flex', gap: '10px' }}>
                <CheckCircle2 size={18} color="#10b981" style={{ flexShrink: 0 }} />
                <span>Independent deterministic backend validation guaranteeing zero post-exam or overtime sessions.</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* CALL TO ACTION */}
      <section
        style={{
          textAlign: 'center',
          padding: '48px 32px',
          borderRadius: '24px',
          background: 'linear-gradient(135deg, #4f46e5 0%, #3b82f6 50%, #06b6d4 100%)',
          color: 'white',
          boxShadow: 'var(--shadow-3d)',
        }}
      >
        <h2 style={{ fontSize: '2rem', color: 'white', marginBottom: '14px' }}>
          Ready to Ace Your University Examinations?
        </h2>
        <p style={{ maxWidth: '640px', margin: '0 auto 28px auto', opacity: 0.9, fontSize: '1.0625rem' }}>
          Generate your personalized, constraint-verified study timetable in under 10 seconds.
        </p>
        <Link
          to="/create-plan"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: '#ffffff',
            color: '#4f46e5',
            fontWeight: 700,
            padding: '14px 28px',
            borderRadius: '14px',
            textDecoration: 'none',
            fontSize: '1rem',
            boxShadow: '0 8px 20px rgba(0, 0, 0, 0.15)',
          }}
        >
          <span>Start Plan Generator</span>
          <ArrowRight size={18} />
        </Link>
      </section>
    </div>
  );
};
