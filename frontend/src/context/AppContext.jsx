import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getAllStudyPlans, getDashboardStats, getAIStatus } from '../services/api';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [workspaceId, setWorkspaceIdState] = useState(() => {
    return localStorage.getItem('study_workspace_id') || 'student-default-workspace';
  });

  const [plans, setPlans] = useState([]);
  const [currentPlan, setCurrentPlan] = useState(null);
  const [dashboardStats, setDashboardStats] = useState(null);
  const [aiStatus, setAiStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState(null);

  const showNotification = useCallback((message, type = 'info', duration = 4000) => {
    setNotification({ message, type });
    if (duration > 0) {
      setTimeout(() => {
        setNotification((prev) => (prev && prev.message === message ? null : prev));
      }, duration);
    }
  }, []);

  const setWorkspaceId = (id) => {
    const cleanId = id.trim() || 'student-default-workspace';
    localStorage.setItem('study_workspace_id', cleanId);
    setWorkspaceIdState(cleanId);
  };

  const refreshPlans = useCallback(async () => {
    try {
      const res = await getAllStudyPlans(workspaceId);
      if (res.success) {
        setPlans(res.data);
        if (res.data.length > 0 && !currentPlan) {
          setCurrentPlan(res.data[0]);
        }
      }
    } catch (err) {
      console.warn('Could not fetch plans:', err.message);
    }
  }, [workspaceId, currentPlan]);

  const refreshDashboard = useCallback(async (targetPlanId) => {
    try {
      const activeId = targetPlanId || currentPlan?._id;
      const res = await getDashboardStats(workspaceId, activeId);
      if (res.success) {
        setDashboardStats(res.data);
        if (res.data.activePlan && !currentPlan) {
          setCurrentPlan(res.data.activePlan);
        }
      }
    } catch (err) {
      console.warn('Could not fetch dashboard stats:', err.message);
    }
  }, [workspaceId, currentPlan]);

  const checkAI = useCallback(async () => {
    try {
      const res = await getAIStatus();
      if (res.success) {
        setAiStatus(res.data);
      }
    } catch (err) {
      console.warn('Could not verify AI status:', err.message);
    }
  }, []);

  useEffect(() => {
    refreshPlans();
    refreshDashboard();
    checkAI();
  }, [workspaceId, refreshPlans, refreshDashboard, checkAI]);

  return (
    <AppContext.Provider
      value={{
        workspaceId,
        setWorkspaceId,
        plans,
        setPlans,
        currentPlan,
        setCurrentPlan,
        dashboardStats,
        refreshDashboard,
        refreshPlans,
        aiStatus,
        checkAI,
        loading,
        setLoading,
        notification,
        showNotification,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
