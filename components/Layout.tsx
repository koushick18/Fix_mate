import React, { useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { Settings, Users, Wrench, Home, LogOut, Info, X, Wifi, WifiOff } from 'lucide-react';
import { supabase } from '../services/supabaseClient';

interface LayoutProps {
  currentUser: User;
  onLogout: () => void;
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ currentUser, onLogout, children }) => {
  const [showBanner, setShowBanner] = useState(true);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Check if we have a valid URL (not the placeholder)
    // Accessing the private property 'supabaseUrl' via type casting or checking specific behavior
    const checkConnection = async () => {
       const { data, error } = await supabase.from('profiles').select('count').limit(1);
       // If the query works (even if 0 rows), we are connected. 
       // If invalid URL, it usually throws an error or returns specific fetch failures.
       if (!error || error.code === 'PGRST116') { 
           setIsConnected(true);
       } else {
           setIsConnected(false);
       }
    };
    checkConnection();
  }, []);

  const getIcon = (role: UserRole) => {
    switch (role) {
      case UserRole.ADMIN: return <Settings className="w-4 h-4 mr-2" />;
      case UserRole.TECHNICIAN: return <Wrench className="w-4 h-4 mr-2" />;
      default: return <Home className="w-4 h-4 mr-2" />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Network Status Banner */}
      {showBanner && (
        <div className={`px-4 py-2 text-sm font-medium relative shadow-md print:hidden ${isConnected ? 'bg-green-600 text-white' : 'bg-gray-700 text-gray-200'}`}>
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-2">
              {isConnected ? <Wifi className="w-4 h-4" /> : <WifiOff className="w-4 h-4" />}
              <span>
                {isConnected 
                  ? <strong>System Online: Connected to Supabase Database</strong>
                  : <strong>Offline Mode: Database keys missing. Data will not save.</strong>
                }
              </span>
            </div>
            <button 
              onClick={() => setShowBanner(false)}
              className="ml-4 hover:bg-white/20 rounded p-1 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Top Navigation Bar */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center">
            <div className="bg-teal-600 p-2 rounded-lg mr-3">
              <Home className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-xl font-bold text-gray-900 tracking-tight">FixMate</h1>
          </div>

          {/* User Profile & Logout */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center text-right">
                <div className="mr-3 hidden sm:block">
                    <p className="text-sm font-medium text-gray-900">{currentUser.name}</p>
                    <p className="text-xs text-gray-500">{currentUser.role}</p>
                </div>
                <div className="h-9 w-9 rounded-full bg-teal-100 flex items-center justify-center text-teal-600 font-semibold border border-teal-200">
                  {currentUser.name.charAt(0)}
                </div>
            </div>
            
            <div className="h-6 w-px bg-gray-200 mx-2"></div>

            <button 
                onClick={onLogout}
                className="text-gray-500 hover:text-red-600 transition-colors p-2 rounded-full hover:bg-red-50"
                title="Sign Out"
            >
                <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center mb-6">
           <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-200 text-gray-800 shadow-sm">
             {getIcon(currentUser.role)}
             {currentUser.role} DASHBOARD
           </span>
        </div>
        {children}
      </main>

      <footer className="bg-white border-t border-gray-200 mt-auto">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-gray-500">
            &copy; 2024 FixMate Property Maintenance. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};