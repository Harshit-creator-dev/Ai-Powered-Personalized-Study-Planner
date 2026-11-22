/**
 * Sample Test Dataset specified in Section 17
 * 
 * Subjects: DSA, DBMS, OS, NLP
 * Exam Dates:
 *  - DSA: 2026-10-20
 *  - DBMS: 2026-10-24
 *  - OS: 2026-10-28
 *  - NLP: 2026-11-02
 * Available Study Time: 4 hours per day
 * Weak Subject: DBMS
 * Planning Period: 2026-10-12 to 2026-10-19
 */

const sampleStudyPlanData = {
  planName: 'University Semester Finals Preparation Plan',
  workspaceId: 'default-student-workspace',
  planningStartDate: '2026-10-12',
  planningEndDate: '2026-10-19',
  availableHoursPerDay: 4,
  weakSubjects: ['DBMS'],
  subjects: [
    {
      name: 'DSA',
      difficulty: 'Hard',
      topics: [
        'Dynamic Programming & Memoization',
        'Graph Algorithms (Dijkstra, Bellman-Ford, Kruskal)',
        'Trees & Heaps (AVL, Red-Black Trees, Priority Queues)',
        'Sorting & Binary Search Optimization',
      ],
    },
    {
      name: 'DBMS',
      difficulty: 'Hard',
      topics: [
        'Relational Algebra & Tuple Calculus',
        'Normalization & Normal Forms (1NF, 2NF, 3NF, BCNF)',
        'Transaction Management & ACID Properties',
        'Concurrency Control & Deadlock Resolution',
        'Indexing & B+ Trees',
      ],
    },
    {
      name: 'OS',
      difficulty: 'Medium',
      topics: [
        'Process Scheduling & Synchronization',
        'Semaphores & Classical IPC Problems',
        'Deadlock Prevention, Avoidance, and Detection',
        'Virtual Memory & Page Replacement Algorithms',
        'File Systems & Disk Scheduling',
      ],
    },
    {
      name: 'NLP',
      difficulty: 'Medium',
      topics: [
        'Tokenization, Stemming & Lemmatization',
        'N-gram Language Models & Perplexity',
        'Word Embeddings (Word2Vec, GloVe)',
        'Transformer Architecture & Self-Attention',
        'Fine-Tuning & Prompt Tuning for LLMs',
      ],
    },
  ],
  examDates: [
    { subject: 'DSA', examDate: '2026-10-20' },
    { subject: 'DBMS', examDate: '2026-10-24' },
    { subject: 'OS', examDate: '2026-10-28' },
    { subject: 'NLP', examDate: '2026-11-02' },
  ],
  preferences: {
    preferredSessionDuration: 60,
    studyTimeOfDay: 'Flexible',
    techniques: ['Pomodoro (50/10)', 'Active Recall', 'Spaced Repetition'],
    revisionIntensity: 'High',
    practiceRequirement: true,
    revisionRequirement: true,
  },
};

module.exports = {
  sampleStudyPlanData,
};
