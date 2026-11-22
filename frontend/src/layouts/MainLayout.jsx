import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from '../components/Sidebar';
import { Navbar } from '../components/Navbar';
import { Notification } from '../components/Notification';
import { useApp } from '../context/AppContext';

export const MainLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { notification, showNotification } = useApp();

  return (
    <div className="app-container">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      <div className="main-content">
        <Navbar onToggleSidebar={() => setSidebarOpen((prev) => !prev)} />
        <main className="content-body animate-fade-in">
          <Outlet />
        </main>
      </div>
      <Notification notification={notification} onClose={() => showNotification(null, 'info', 0)} />
    </div>
  );
};
