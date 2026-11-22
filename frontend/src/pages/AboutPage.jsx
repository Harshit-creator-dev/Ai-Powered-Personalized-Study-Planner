import React from 'react';
import {
  Info,
  BrainCircuit,
  Target,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Layers,
  ArrowRight,
  Database,
  Cpu,
  BookOpen,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const AboutPage = () => {
  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '36px', paddingBottom: '60px' }}>
      {/* HERO / INTRODUCTION */}
      <div style={{ textAlign: 'center', padding: '20px 0' }}>
        <span
          style={{
            fontSize: '0.8125rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            color: 'var(--primary)',
            letterSpacing: '0.05em',
          }}
        >
          Academic Rationale & System Architecture
        </span>
        <h1 style={{ fontSize: '2.25rem', fontWeight: 800, marginTop: '8px', marginBottom: '14px' }}>
          AI-Powered Personalized Study Plan Generator <br />
          <span className="text-gradient">Using Prompt Engineering</span>
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.0625rem', maxWidth: '750px', margin: '0 auto', lineHeight: 1.6 }}>
          A full-stack research-grade web application demonstrating how structured prompt engineering, cognitive load theory,
          and deterministic post-validation transform LLM output into mathematically feasible academic timetables.
        </p>
      </div>

      {/* 1. PROBLEM STATEMENT */}
      <div className="card-3d" style={{ padding: '32px', backgroundColor: '#ffffff' }}>
        <h2 style={{ fontSize: '1.375rem', fontWeight: 800, marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Target size={22} color="var(--primary)" />
          <span>1. The University Examination Scheduling Crisis</span>
        </h2>
        <p style={{ color: 'var(--text-muted)', lineHeight: 1.7, fontSize: '0.9375rem', marginBottom: '16px' }}>
          University students preparing for multiple concurrent semester examinations face severe cognitive fatigue,
          asymmetric subject difficulties, and rigid calendar deadlines. Most students struggle with scheduling:
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
          <div style={{ padding: '16px', borderRadius: '12px', backgroundColor: '#fef2f2', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
            <h4 style={{ color: '#991b1b', fontWeight: 700, marginBottom: '6px', fontSize: '0.9rem' }}>Over-Scheduling & Burnout</h4>
            <p style={{ color: '#7f1d1d', fontSize: '0.8125rem', lineHeight: 1.5 }}>
              Planning more daily hours than physically feasible leads to schedule collapse after day 2 or 3.
            </p>
          </div>

          <div style={{ padding: '16px', borderRadius: '12px', backgroundColor: '#fffbeb', border: '1px solid rgba(245, 158, 11, 0.25)' }}>
            <h4 style={{ color: '#92400e', fontWeight: 700, marginBottom: '6px', fontSize: '0.9rem' }}>Neglecting Weak Subjects</h4>
            <p style={{ color: '#78350f', fontSize: '0.8125rem', lineHeight: 1.5 }}>
              Students instinctively spend time on subjects they already know, avoiding difficult topics until it is too late.
            </p>
          </div>

          <div style={{ padding: '16px', borderRadius: '12px', backgroundColor: '#f3f4f6', border: '1px solid #e5e7eb' }}>
            <h4 style={{ color: '#1f2937', fontWeight: 700, marginBottom: '6px', fontSize: '0.9rem' }}>Passive Reading vs Active Recall</h4>
            <p style={{ color: '#4b5563', fontSize: '0.8125rem', lineHeight: 1.5 }}>
              Without systematic pedagogical pacing, students spend 95% of time re-reading notes and 0% on timed practice.
            </p>
          </div>
        </div>
      </div>

      {/* 2. EXISTING SOLUTION CRITIQUE: MYSTUDYLIFE */}
      <div className="card-3d" style={{ padding: '32px', backgroundColor: '#ffffff' }}>
        <h2 style={{ fontSize: '1.375rem', fontWeight: 800, marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <BookOpen size={22} color="var(--primary)" />
          <span>2. Existing Solution Critique: MyStudyLife</span>
        </h2>
        <p style={{ color: 'var(--text-muted)', lineHeight: 1.7, fontSize: '0.9375rem', marginBottom: '16px' }}>
          While tools like <strong>MyStudyLife</strong> provide calendar organizers and task tracking, they are fundamentally 
          passive digitizers of student manual entries. They exhibit three critical structural flaws:
        </p>
        <ul style={{ paddingLeft: '24px', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.9rem', color: 'var(--text-main)' }}>
          <li>
            <strong>Zero Cognitive Intelligence:</strong> MyStudyLife has no internal model of syllabus difficulty, spaced repetition, or cognitive load decay.
          </li>
          <li>
            <strong>Manual Slot Burden:</strong> The student must calculate and drag-and-drop every individual hour block manually, creating friction and abandonment.
          </li>
          <li>
            <strong>No Constraint Feasibility Checks:</strong> If a student sets an unrealistic 14-hour study day before an exam, MyStudyLife displays it uncritically.
          </li>
        </ul>
      </div>

      {/* 3. PROPOSED SOLUTION & PROMPT ENGINEERING */}
      <div className="card-3d" style={{ padding: '32px', backgroundColor: '#ffffff' }}>
        <h2 style={{ fontSize: '1.375rem', fontWeight: 800, marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <BrainCircuit size={22} color="var(--primary)" />
          <span>3. Proposed Solution: Prompt Engineering with Gemini 3.5 Flash Lite</span>
        </h2>
        <p style={{ color: 'var(--text-muted)', lineHeight: 1.7, fontSize: '0.9375rem', marginBottom: '16px' }}>
          Our solution treats timetable construction as a <strong>Context-Grounded Constraint Satisfaction Problem</strong>.
          Through five specific prompt engineering techniques, we elicit optimal scheduling behavior from Google Gemini:
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
          <div style={{ padding: '16px', borderRadius: '12px', backgroundColor: '#eef2ff', border: '1px solid rgba(99, 102, 241, 0.2)' }}>
            <h4 style={{ color: 'var(--primary)', fontWeight: 700, marginBottom: '4px', fontSize: '0.875rem' }}>1. Role & Persona Framing</h4>
            <p style={{ color: '#312e81', fontSize: '0.8125rem', lineHeight: 1.5 }}>
              Positions Gemini as a Senior Academic Scheduling Architect and Cognitive Learning Scientist with strict mandates.
            </p>
          </div>

          <div style={{ padding: '16px', borderRadius: '12px', backgroundColor: '#ecfdf5', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
            <h4 style={{ color: 'var(--success)', fontWeight: 700, marginBottom: '4px', fontSize: '0.875rem' }}>2. Constraint Hierarchy</h4>
            <p style={{ color: '#064e3b', fontSize: '0.8125rem', lineHeight: 1.5 }}>
              Separates Hard Constraints (daily hour cap, exam deadlines) from Soft Constraints (preferred study duration).
            </p>
          </div>

          <div style={{ padding: '16px', borderRadius: '12px', backgroundColor: '#fef3c7', border: '1px solid rgba(245, 158, 11, 0.2)' }}>
            <h4 style={{ color: '#d97706', fontWeight: 700, marginBottom: '4px', fontSize: '0.875rem' }}>3. Chain-of-Thought (CoT) Pacing</h4>
            <p style={{ color: '#78350f', fontSize: '0.8125rem', lineHeight: 1.5 }}>
              Instructs the model to calculate day boundaries, verify exam countdowns, and balance daily hours before emitting sessions.
            </p>
          </div>

          <div style={{ padding: '16px', borderRadius: '12px', backgroundColor: '#fae8ff', border: '1px solid rgba(217, 70, 239, 0.2)' }}>
            <h4 style={{ color: '#86198f', fontWeight: 700, marginBottom: '4px', fontSize: '0.875rem' }}>4. Pedagogical Distribution</h4>
            <p style={{ color: '#701a75', fontSize: '0.8125rem', lineHeight: 1.5 }}>
              Enforces a 4-tier distribution: 50% Learning, 25% Revision, 20% Practice, and 5% Self-assessment.
            </p>
          </div>
        </div>
      </div>

      {/* 4. THE 8 DETERMINISTIC EVALUATION RULES */}
      <div className="card-3d" style={{ padding: '32px', backgroundColor: '#ffffff' }}>
        <h2 style={{ fontSize: '1.375rem', fontWeight: 800, marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <ShieldCheck size={22} color="var(--primary)" />
          <span>4. Deterministic Evaluation Engine (8 Rules)</span>
        </h2>
        <p style={{ color: 'var(--text-muted)', lineHeight: 1.7, fontSize: '0.9375rem', marginBottom: '20px' }}>
          Unlike systems that generate arbitrary evaluation ratings, our engine uses deterministic mathematical formulas
          executed on the actual timetable data:
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
          {[
            { name: '1. Feasibility', formula: '100 - (violatingDays / totalDays * 40 + excess * 15)' },
            { name: '2. Completeness', formula: '(coveredSubjects / total * 60) + (activities / 4 * 40)' },
            { name: '3. Consistency', formula: '(sessionsInRange / total * 70) + (validDays / total * 30)' },
            { name: '4. Hour Satisfaction', formula: '(compliantDays / totalScheduledDays) * 100' },
            { name: '5. Exam Compliance', formula: '(sessionsBeforeExam / totalSessions) * 100' },
            { name: '6. Revision Coverage', formula: '(subjsWithRevision / total * 60) + (revRatio / 0.25 * 40)' },
            { name: '7. Practice Coverage', formula: '(subjsWithPractice / total * 60) + (pracRatio / 0.20 * 40)' },
            { name: '8. Weak Prioritization', formula: 'min(100, (weakAvgHours / normalAvgHours / 1.25) * 100)' },
          ].map((r, i) => (
            <div key={i} style={{ padding: '12px', borderRadius: '10px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}>
              <div style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--text-main)', marginBottom: '4px' }}>
                {r.name}
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
                {r.formula}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* QUICK CTA */}
      <div style={{ textAlign: 'center' }}>
        <Link to="/create-plan" className="btn btn-primary btn-lg">
          <span>Create Your Study Plan Now</span>
          <ArrowRight size={18} />
        </Link>
      </div>
    </div>
  );
};
