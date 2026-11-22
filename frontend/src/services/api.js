import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 45000, // 45s timeout for AI generation
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response interceptor for consistent error extraction
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const errorMsg = error.response?.data?.message || error.message || 'An unexpected API error occurred.';
    const customError = new Error(errorMsg);
    customError.statusCode = error.response?.status;
    customError.data = error.response?.data;
    return Promise.reject(customError);
  }
);

// Study Plan APIs
export const generateStudyPlan = (planData) => api.post('/study-plans/generate', planData);
export const getAllStudyPlans = (workspaceId) => api.get(`/study-plans?workspaceId=${encodeURIComponent(workspaceId || 'default-student-workspace')}`);
export const getStudyPlanById = (id) => api.get(`/study-plans/${id}`);
export const updateStudyPlan = (id, data) => api.put(`/study-plans/${id}`, data);
export const deleteStudyPlan = (id) => api.delete(`/study-plans/${id}`);

// Study Session APIs
export const getSessionsByPlanId = (planId) => api.get(`/sessions/${planId}`);
export const toggleSessionComplete = (sessionId, completed) => api.patch(`/sessions/${sessionId}/complete`, { completed });
export const updateSession = (sessionId, data) => api.put(`/sessions/${sessionId}`, data);
export const deleteSession = (sessionId) => api.delete(`/sessions/${sessionId}`);

// AI APIs
export const getAIStatus = () => api.get('/ai/status');
export const previewPrompt = (data) => api.post('/ai/preview-prompt', data);
export const generateAI = (data) => api.post('/ai/generate', data);

// Evaluation APIs
export const evaluatePlan = (planId) => api.post(`/evaluation/${planId}`);
export const getEvaluation = (planId) => api.get(`/evaluation/${planId}`);

// Dashboard APIs
export const getDashboardStats = (workspaceId, planId) => {
  const query = new URLSearchParams();
  query.set('workspaceId', workspaceId || 'default-student-workspace');
  if (planId) query.set('planId', planId);
  return api.get(`/dashboard/stats?${query.toString()}`);
};

// Sample Data & System Health
export const getSampleData = () => api.get('/sample-data');
export const getHealth = () => api.get('/health');

export default api;
