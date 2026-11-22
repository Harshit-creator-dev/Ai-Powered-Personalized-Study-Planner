import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  Trash2,
  Sparkles,
  Calendar,
  Clock,
  BookOpen,
  CheckCircle,
  AlertTriangle,
  Loader2,
  Zap,
  Sliders,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { generateStudyPlan, getSampleData } from '../services/api';

export const CreatePlanPage = () => {
  const navigate = useNavigate();
  const { workspaceId, setCurrentPlan, refreshPlans, refreshDashboard, showNotification, aiStatus } = useApp();

  // Form State
  const [planName, setPlanName] = useState('Final Examination Mastery Plan');
  const [availableHoursPerDay, setAvailableHoursPerDay] = useState(4);
  const [planningStartDate, setPlanningStartDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [planningEndDate, setPlanningEndDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d.toISOString().split('T')[0];
  });

  const [subjects, setSubjects] = useState([
    {
      name: 'Data Structures & Algorithms',
      difficulty: 'Hard',
      examDate: '',
      topics: ['Dynamic Programming', 'Graph Theory', 'Trees & Heaps'],
      newTopicInput: '',
    },
    {
      name: 'Database Management Systems',
      difficulty: 'Hard',
      examDate: '',
      topics: ['Normalization', 'Transactions & ACID', 'Indexing'],
      newTopicInput: '',
    },
  ]);

  const [weakSubjects, setWeakSubjects] = useState(['Database Management Systems']);

  // Preferences State
  const [preferredDuration, setPreferredDuration] = useState(60);
  const [studyTimeOfDay, setStudyTimeOfDay] = useState('Flexible');
  const [revisionRequirement, setRevisionRequirement] = useState(true);
  const [practiceRequirement, setPracticeRequirement] = useState(true);
  const [revisionIntensity, setRevisionIntensity] = useState('High');

  // Loading & Step State
  const [generating, setGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState('');
  const [errors, setErrors] = useState([]);

  // Calculate constraint metrics
  const startD = new Date(planningStartDate);
  const endD = new Date(planningEndDate);
  const totalDays = isNaN(startD.getTime()) || isNaN(endD.getTime()) 
    ? 0 
    : Math.max(0, Math.round((endD - startD) / (1000 * 60 * 60 * 24)) + 1);
  const totalCapacityHours = totalDays * availableHoursPerDay;

  // Add Subject
  const handleAddSubject = () => {
    setSubjects((prev) => [
      ...prev,
      {
        name: `Subject ${prev.length + 1}`,
        difficulty: 'Medium',
        examDate: '',
        topics: ['Core Fundamentals', 'Advanced Topics'],
        newTopicInput: '',
      },
    ]);
  };

  // Remove Subject
  const handleRemoveSubject = (idx) => {
    const removedName = subjects[idx].name;
    setSubjects((prev) => prev.filter((_, i) => i !== idx));
    setWeakSubjects((prev) => prev.filter((s) => s !== removedName));
  };

  // Toggle Weak Subject
  const handleToggleWeak = (subjectName) => {
    if (!subjectName.trim()) return;
    setWeakSubjects((prev) =>
      prev.includes(subjectName) ? prev.filter((s) => s !== subjectName) : [...prev, subjectName]
    );
  };

  // Add Topic to Subject
  const handleAddTopic = (subjectIdx) => {
    const input = subjects[subjectIdx].newTopicInput?.trim();
    if (!input) return;
    setSubjects((prev) => {
      const copy = [...prev];
      copy[subjectIdx].topics.push(input);
      copy[subjectIdx].newTopicInput = '';
      return copy;
    });
  };

  // Remove Topic from Subject
  const handleRemoveTopic = (subjectIdx, topicIdx) => {
    setSubjects((prev) => {
      const copy = [...prev];
      copy[subjectIdx].topics.splice(topicIdx, 1);
      return copy;
    });
  };

  // Load Section 17 Sample Test Dataset
  const handleLoadSampleData = async () => {
    try {
      showNotification('Loading Section 17 sample test dataset...', 'info');
      const res = await getSampleData();
      if (res.success) {
        const sample = res.data;
        setPlanName(sample.planName);
        setPlanningStartDate(sample.planningStartDate);
        setPlanningEndDate(sample.planningEndDate);
        setAvailableHoursPerDay(sample.availableHoursPerDay);
        setWeakSubjects(sample.weakSubjects);

        const examMap = {};
        sample.examDates.forEach((e) => {
          examMap[e.subject] = e.examDate;
        });

        const mappedSubjects = sample.subjects.map((s) => ({
          name: s.name,
          difficulty: s.difficulty,
          examDate: examMap[s.name] || '',
          topics: [...s.topics],
          newTopicInput: '',
        }));

        setSubjects(mappedSubjects);
        setPreferredDuration(sample.preferences.preferredSessionDuration || 60);
        setRevisionIntensity(sample.preferences.revisionIntensity || 'High');
        showNotification('Section 17 sample dataset loaded: DSA, DBMS (Weak), OS, NLP!', 'success');
      }
    } catch (err) {
      showNotification(`Failed to load sample data: ${err.message}`, 'error');
    }
  };

  // Validate form
  const validateForm = () => {
    const validationErrors = [];
    if (!planName.trim()) validationErrors.push('Study plan title cannot be empty.');
    if (subjects.length === 0) validationErrors.push('You must specify at least one subject to study.');

    subjects.forEach((s, i) => {
      if (!s.name.trim()) validationErrors.push(`Subject #${i + 1} must have a name.`);
      if (s.examDate && s.examDate < planningStartDate) {
        validationErrors.push(`Examination date for '${s.name}' cannot be earlier than the planning start date.`);
      }
    });

    if (totalDays <= 0) {
      validationErrors.push('Planning end date must be on or after the start date.');
    }
    if (availableHoursPerDay <= 0 || availableHoursPerDay > 16) {
      validationErrors.push('Daily study hours must be between 1 and 16 hours.');
    }

    setErrors(validationErrors);
    return validationErrors.length === 0;
  };

  // Submit and Generate Plan
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setGenerating(true);
    setGenerationStep('Constructing cognitive prompt & mathematical constraint budget...');

    // Extract subjects and examDates arrays
    const formattedSubjects = subjects.map((s) => ({
      name: s.name.trim(),
      difficulty: s.difficulty,
      topics: s.topics,
    }));

    const formattedExamDates = subjects
      .filter((s) => s.examDate)
      .map((s) => ({
        subject: s.name.trim(),
        examDate: s.examDate,
      }));

    const payload = {
      workspaceId,
      planName,
      subjects: formattedSubjects,
      examDates: formattedExamDates,
      weakSubjects,
      availableHoursPerDay: Number(availableHoursPerDay),
      planningStartDate,
      planningEndDate,
      preferences: {
        preferredSessionDuration: Number(preferredDuration),
        studyTimeOfDay,
        techniques: ['Active Recall', 'Spaced Repetition', 'Pomodoro'],
        revisionIntensity,
        practiceRequirement,
        revisionRequirement,
      },
      allowFallbackOnFailure: true,
    };

    try {
      setTimeout(() => {
        setGenerationStep('Sending engineered prompt to Google Gemini 3.5 Flash Lite API...');
      }, 700);

      const response = await generateStudyPlan(payload);

      if (response.success) {
        setGenerationStep('Validating scheduling constraints and computing deterministic metrics...');
        setCurrentPlan(response.data);
        await refreshPlans();
        await refreshDashboard();
        showNotification('Study plan generated and verified successfully!', 'success');
        navigate('/timetable');
      }
    } catch (err) {
      console.error('Plan generation failed:', err);
      showNotification(`Generation error: ${err.message}`, 'error');
      setErrors([err.message]);
    } finally {
      setGenerating(false);
      setGenerationStep('');
    }
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', paddingBottom: '40px' }}>
      {/* HEADER & QUICK PRESET BUTTON */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '28px' }}>
        <div>
          <h1 style={{ fontSize: '1.875rem', fontWeight: 800 }}>Create AI-Engineered Study Plan</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9375rem', marginTop: '4px' }}>
            Enter subjects, exam deadlines, and daily capacity. The prompt engine will construct your optimal timetable.
          </p>
        </div>

        <button onClick={handleLoadSampleData} type="button" className="btn btn-secondary">
          <Zap size={16} color="var(--primary)" />
          <span>Load Section 17 Test Dataset (DSA, DBMS, OS, NLP)</span>
        </button>
      </div>

      {/* ERROR SUMMARY BANNER */}
      {errors.length > 0 && (
        <div
          style={{
            padding: '16px 20px',
            borderRadius: '14px',
            backgroundColor: '#fef2f2',
            border: '1px solid #f87171',
            color: '#991b1b',
            marginBottom: '24px',
            animation: 'fadeIn 0.2s ease-out',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, marginBottom: '6px' }}>
            <AlertTriangle size={18} />
            <span>Please address the following requirements:</span>
          </div>
          <ul style={{ paddingLeft: '24px', fontSize: '0.875rem' }}>
            {errors.map((err, idx) => (
              <li key={idx}>{err}</li>
            ))}
          </ul>
        </div>
      )}

      {/* GENERATION IN-PROGRESS MODAL */}
      {generating && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            backgroundColor: 'rgba(15, 23, 42, 0.6)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}
        >
          <div
            className="card-3d-static"
            style={{
              padding: '36px 32px',
              maxWidth: '480px',
              width: '100%',
              textAlign: 'center',
              backgroundColor: '#ffffff',
              borderRadius: '24px',
            }}
          >
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #6366f1 0%, #3b82f6 100%)',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 20px auto',
              }}
              className="pulse-glow"
            >
              <Sparkles size={32} />
            </div>

            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '8px' }}>
              Synthesizing Personalized Study Plan
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '24px' }}>
              {generationStep || 'Processing prompt engineering constraints...'}
            </p>

            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', color: 'var(--primary)', fontWeight: 600, fontSize: '0.875rem' }}>
              <Loader2 size={18} className="animate-spin" />
              <span>Evaluating cognitive load & exam timelines...</span>
            </div>
          </div>
        </div>
      )}

      {/* MAIN FORM */}
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* SECTION 1: BASIC DETAILS & PLANNING WINDOW */}
        <div className="card-3d" style={{ padding: '28px' }}>
          <h3 style={{ fontSize: '1.1875rem', fontWeight: 700, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Calendar size={20} color="var(--primary)" />
            <span>1. Planning Window & Daily Study Capacity</span>
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label className="form-label">Study Plan Title</label>
              <input
                type="text"
                className="form-control"
                value={planName}
                onChange={(e) => setPlanName(e.target.value)}
                placeholder="e.g. University Semester Finals Preparation Plan"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Planning Start Date</label>
              <input
                type="date"
                className="form-control"
                value={planningStartDate}
                onChange={(e) => setPlanningStartDate(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Planning End Date</label>
              <input
                type="date"
                className="form-control"
                value={planningEndDate}
                onChange={(e) => setPlanningEndDate(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                Available Study Hours Per Day ({availableHoursPerDay} hours)
              </label>
              <input
                type="range"
                min="1"
                max="12"
                step="0.5"
                value={availableHoursPerDay}
                onChange={(e) => setAvailableHoursPerDay(Number(e.target.value))}
                style={{ width: '100%', accentColor: 'var(--primary)' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                <span>1h (Light)</span>
                <span>4h (Standard)</span>
                <span>8h (Intensive)</span>
                <span>12h (Max)</span>
              </div>
            </div>
          </div>

          {/* REAL-TIME CONSTRAINT SUMMARY PILL */}
          <div
            style={{
              marginTop: '16px',
              padding: '14px 18px',
              borderRadius: '12px',
              backgroundColor: '#f8fafc',
              border: '1px solid var(--border-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '12px',
              fontSize: '0.875rem',
            }}
          >
            <div>
              <span style={{ color: 'var(--text-muted)' }}>Calculated Duration: </span>
              <strong>{totalDays} Calendar Days</strong>
            </div>
            <div>
              <span style={{ color: 'var(--text-muted)' }}>Total Hour Budget: </span>
              <strong>{totalCapacityHours} Study Hours</strong>
            </div>
            <div>
              <span style={{ color: 'var(--text-muted)' }}>Status: </span>
              <strong style={{ color: totalDays > 0 ? 'var(--success)' : 'var(--danger)' }}>
                {totalDays > 0 ? 'Feasible Budget' : 'Invalid Date Range'}
              </strong>
            </div>
          </div>
        </div>

        {/* SECTION 2: SUBJECTS, EXAM DATES & TOPICS */}
        <div className="card-3d" style={{ padding: '28px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div>
              <h3 style={{ fontSize: '1.1875rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <BookOpen size={20} color="var(--primary)" />
                <span>2. Subjects, Examination Deadlines & Topics</span>
              </h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.8125rem', marginTop: '2px' }}>
                Add your curriculum. Mark subjects as weak to trigger automatic 1.35x-1.5x time weighting.
              </p>
            </div>

            <button type="button" onClick={handleAddSubject} className="btn btn-secondary btn-sm">
              <Plus size={16} />
              <span>Add Subject</span>
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {subjects.map((subject, sIdx) => {
              const isWeak = weakSubjects.includes(subject.name);

              return (
                <div
                  key={sIdx}
                  style={{
                    padding: '20px',
                    borderRadius: '16px',
                    backgroundColor: isWeak ? '#fffbeb' : '#ffffff',
                    border: `1.5px solid ${isWeak ? '#fcd34d' : 'var(--border-subtle)'}`,
                    boxShadow: 'var(--shadow-sm)',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span
                        style={{
                          width: '26px',
                          height: '26px',
                          borderRadius: '50%',
                          backgroundColor: isWeak ? '#f59e0b' : 'var(--primary)',
                          color: 'white',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                        }}
                      >
                        {sIdx + 1}
                      </span>
                      <span style={{ fontWeight: 700, fontSize: '1rem' }}>
                        {subject.name || `Subject ${sIdx + 1}`}
                      </span>
                      {isWeak && <span className="badge badge-warning">Weak Subject Prioritized</span>}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <button
                        type="button"
                        onClick={() => handleToggleWeak(subject.name)}
                        className={`btn btn-sm ${isWeak ? 'btn-primary' : 'btn-secondary'}`}
                        style={{ fontSize: '0.75rem' }}
                      >
                        {isWeak ? 'Marked as Weak ★' : 'Mark as Weak'}
                      </button>

                      {subjects.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveSubject(sIdx)}
                          className="btn btn-danger btn-sm"
                          title="Remove Subject"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Subject Inputs Grid */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '14px' }}>
                    <div>
                      <label className="form-label" style={{ fontSize: '0.8125rem' }}>Subject Name</label>
                      <input
                        type="text"
                        className="form-control"
                        value={subject.name}
                        onChange={(e) => {
                          const oldName = subject.name;
                          const newName = e.target.value;
                          setSubjects((prev) => {
                            const copy = [...prev];
                            copy[sIdx].name = newName;
                            return copy;
                          });
                          if (weakSubjects.includes(oldName)) {
                            setWeakSubjects((prev) => prev.map((w) => (w === oldName ? newName : w)));
                          }
                        }}
                        placeholder="e.g. Operating Systems"
                        required
                      />
                    </div>

                    <div>
                      <label className="form-label" style={{ fontSize: '0.8125rem' }}>Difficulty Level</label>
                      <select
                        className="form-control"
                        value={subject.difficulty}
                        onChange={(e) => {
                          setSubjects((prev) => {
                            const copy = [...prev];
                            copy[sIdx].difficulty = e.target.value;
                            return copy;
                          });
                        }}
                      >
                        <option value="Easy">Easy (1.0x time standard)</option>
                        <option value="Medium">Medium (1.15x time standard)</option>
                        <option value="Hard">Hard (1.30x time standard)</option>
                      </select>
                    </div>

                    <div>
                      <label className="form-label" style={{ fontSize: '0.8125rem' }}>Examination Date</label>
                      <input
                        type="date"
                        className="form-control"
                        value={subject.examDate}
                        onChange={(e) => {
                          setSubjects((prev) => {
                            const copy = [...prev];
                            copy[sIdx].examDate = e.target.value;
                            return copy;
                          });
                        }}
                      />
                    </div>
                  </div>

                  {/* Topics Tags List */}
                  <div>
                    <label className="form-label" style={{ fontSize: '0.8125rem', marginBottom: '6px' }}>
                      Topics to Master ({subject.topics.length})
                    </label>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '10px' }}>
                      {subject.topics.map((topic, tIdx) => (
                        <span
                          key={tIdx}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            backgroundColor: '#f1f5f9',
                            color: '#334155',
                            padding: '4px 10px',
                            borderRadius: '8px',
                            fontSize: '0.8125rem',
                            fontWeight: 500,
                          }}
                        >
                          <span>{topic}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveTopic(sIdx, tIdx)}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}
                          >
                            &times;
                          </button>
                        </span>
                      ))}
                    </div>

                    {/* Add Topic Input */}
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <input
                        type="text"
                        className="form-control"
                        value={subject.newTopicInput || ''}
                        onChange={(e) => {
                          const val = e.target.value;
                          setSubjects((prev) => {
                            const copy = [...prev];
                            copy[sIdx].newTopicInput = val;
                            return copy;
                          });
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddTopic(sIdx);
                          }
                        }}
                        placeholder="Add topic (e.g. Deadlocks, Semaphores) & press Enter"
                        style={{ fontSize: '0.875rem', padding: '8px 12px' }}
                      />
                      <button
                        type="button"
                        onClick={() => handleAddTopic(sIdx)}
                        className="btn btn-secondary btn-sm"
                      >
                        Add Topic
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* SECTION 3: STUDY PREFERENCES & PEDAGOGY */}
        <div className="card-3d" style={{ padding: '28px' }}>
          <h3 style={{ fontSize: '1.1875rem', fontWeight: 700, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sliders size={20} color="var(--primary)" />
            <span>3. Study Preferences & Pedagogical Techniques</span>
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
            <div className="form-group">
              <label className="form-label">Preferred Session Duration</label>
              <select
                className="form-control"
                value={preferredDuration}
                onChange={(e) => setPreferredDuration(Number(e.target.value))}
              >
                <option value={45}>45 Minutes (Short sprints)</option>
                <option value={60}>60 Minutes (Standard deep focus)</option>
                <option value={90}>90 Minutes (Ultradrive blocks)</option>
                <option value={120}>120 Minutes (Extended test practice)</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Preferred Time of Day</label>
              <select
                className="form-control"
                value={studyTimeOfDay}
                onChange={(e) => setStudyTimeOfDay(e.target.value)}
              >
                <option value="Flexible">Flexible / Balanced</option>
                <option value="Morning">Morning (Peak cognitive readiness)</option>
                <option value="Afternoon">Afternoon</option>
                <option value="Evening">Evening (Quiet study blocks)</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Revision Strategy Intensity</label>
              <select
                className="form-control"
                value={revisionIntensity}
                onChange={(e) => setRevisionIntensity(e.target.value)}
              >
                <option value="Standard">Standard Spaced Repetition (25% time)</option>
                <option value="High">High Retention Active Recall (35% time)</option>
                <option value="Intensive">Cram-Proof Continuous Loops (45% time)</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', marginTop: '12px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 600 }}>
              <input
                type="checkbox"
                checked={revisionRequirement}
                onChange={(e) => setRevisionRequirement(e.target.checked)}
                style={{ width: '18px', height: '18px', accentColor: 'var(--primary)' }}
              />
              <span>Mandatory Spaced Revision Cycles</span>
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 600 }}>
              <input
                type="checkbox"
                checked={practiceRequirement}
                onChange={(e) => setPracticeRequirement(e.target.checked)}
                style={{ width: '18px', height: '18px', accentColor: 'var(--primary)' }}
              />
              <span>Mandatory Practice Questions & Mock Tests</span>
            </label>
          </div>
        </div>

        {/* SUBMIT BUTTON */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '16px' }}>
          <button
            type="submit"
            disabled={generating}
            className="btn btn-primary btn-lg"
            style={{ minWidth: '260px' }}
          >
            {generating ? <Loader2 size={20} className="animate-spin" /> : <Sparkles size={20} />}
            <span>{generating ? 'Generating Plan...' : 'Generate AI Study Plan'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
