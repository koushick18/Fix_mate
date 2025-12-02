import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { User, UserRole } from './types';
import { ResidentView } from './views/ResidentView';
import { TechnicianView } from './views/TechnicianView';
import { AdminView } from './views/AdminView';
import { AuthView } from './views/AuthView';
import { db } from './services/db';

// Extend window for debugging
declare global {
    interface Window { FixMateTests: any; }
}

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Check for existing session on mount
  useEffect(() => {
    const initSession = async () => {
      try {
        const user = await db.getCurrentSession();
        setCurrentUser(user);
      } catch (e) {
        console.error("Session init error", e);
      } finally {
        setLoading(false);
      }
    };
    initSession();
  }, []);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
  };

  const handleLogout = async () => {
    await db.logout();
    setCurrentUser(null);
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-50 text-teal-600">Loading FixMate...</div>;
  }

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