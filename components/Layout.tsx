import React, { useState } from 'react';
import { User, UserRole } from '../types';
import { Settings, Users, Wrench, Home, LogOut, Info, X } from 'lucide-react';

interface LayoutProps {
  currentUser: User;
  onLogout: () => void;
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ currentUser, onLogout, children }) => {
  const [showBanner, setShowBanner] = useState(true);

  const getIcon = (role: UserRole) => {
    switch (role) {
      case UserRole.ADMIN: return <Settings className="w-4 h-4 mr-2" />;
      case UserRole.TECHNICIAN: return <Wrench className="w-4 h-4 mr-2" />;
      default: return <Home className="w-4 h-4 mr-2" />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Public Demo Warning Banner */}
      {showBanner && (
        <div className="bg-indigo-600 text-white px-4 py-2 text-sm font-medium relative shadow-md print:hidden">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4 flex-shrink-0" />
              <span>
                <strong>Public Demo Mode:</strong> Data is stored locally on this device. You will not see updates from other users/browsers.
              </span>
            </div>
            <button 
              onClick={() => setShowBanner(false)}
              className="ml-4 hover:bg-indigo-500 rounded p-1 transition-colors"
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