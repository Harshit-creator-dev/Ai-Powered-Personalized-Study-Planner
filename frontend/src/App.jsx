import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { MainLayout } from './layouts/MainLayout';
import { LandingPage } from './pages/LandingPage';
import { DashboardPage } from './pages/DashboardPage';
import { CreatePlanPage } from './pages/CreatePlanPage';
import { TimetablePage } from './pages/TimetablePage';
import { MyPlansPage } from './pages/MyPlansPage';
import { ProgressTrackerPage } from './pages/ProgressTrackerPage';
import { PromptAnalysisPage } from './pages/PromptAnalysisPage';
import { SettingsPage } from './pages/SettingsPage';
import { AboutPage } from './pages/AboutPage';

function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<MainLayout />}>
            <Route index element={<LandingPage />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="create-plan" element={<CreatePlanPage />} />
            <Route path="timetable" element={<TimetablePage />} />
            <Route path="my-plans" element={<MyPlansPage />} />
            <Route path="progress" element={<ProgressTrackerPage />} />
            <Route path="prompt-analysis" element={<Navigate to="/dashboard" replace />} />
            <Route path="settings" element={<Navigate to="/dashboard" replace />} />
            <Route path="about" element={<AboutPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
}

export default App;
