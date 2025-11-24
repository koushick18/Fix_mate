import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { User, UserRole } from './types';
import { ResidentView } from './views/ResidentView';
import { TechnicianView } from './views/TechnicianView';
import { AdminView } from './views/AdminView';
import { AuthView } from './views/AuthView';
import { runSystemDiagnostics } from './utils/testSuite';

// Extend window for debugging
declare global {
    interface Window { FixMateTests: any; }
}

const SESSION_KEY = 'fixmate_session_user';

export default function App() {
  // Start with no user logged in
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Check for existing session on mount
  useEffect(() => {
    // Attach tests to window for debugging
    window.FixMateTests = runSystemDiagnostics;

    const savedUser = localStorage.getItem(SESSION_KEY);
    if (savedUser) {
      try {
        setCurrentUser(JSON.parse(savedUser));
      } catch (e) {
        console.error("Invalid session data");
        localStorage.removeItem(SESSION_KEY);
      }
    }
  }, []);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    localStorage.setItem(SESSION_KEY, JSON.stringify(user));
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem(SESSION_KEY);
  };

  // Render View based on Role
  const renderDashboard = () => {
    if (!currentUser) return null;

    switch (currentUser.role) {
      case UserRole.RESIDENT:
        return <ResidentView currentUser={currentUser} />;
      case UserRole.TECHNICIAN:
        return <TechnicianView currentUser={currentUser} />;
      case UserRole.ADMIN:
        return <AdminView currentUser={currentUser} />;
      default:
        return <div className="text-center mt-10">Unknown Role</div>;
    }
  };

  if (!currentUser) {
    return <AuthView onLogin={handleLogin} />;
  }

  return (
    <Layout currentUser={currentUser} onLogout={handleLogout}>
      {renderDashboard()}
    </Layout>
  );
}