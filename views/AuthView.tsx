import React, { useState } from 'react';
import { User, UserRole } from '../types';
import { mockDb } from '../services/mockDb';
import { Home, Wrench, UserPlus, LogIn, AlertCircle } from 'lucide-react';

interface AuthViewProps {
  onLogin: (user: User) => void;
}

export const AuthView: React.FC<AuthViewProps> = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<UserRole>(UserRole.RESIDENT);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      if (isLogin) {
        const user = mockDb.authenticate(email, password);
        if (user) {
          onLogin(user);
        } else {
          setError('Invalid email or password.');
        }
      } else {
        const user = mockDb.register(name, email, password, role);
        onLogin(user);
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  const fillDemo = (role: string) => {
     if (role === 'admin') {
         setEmail('admin@fixmate.com');
         setPassword('admin');
     } else if (role === 'res') {
         setEmail('alice@res.com');
         setPassword('password');
     } else if (role === 'tech') {
         setEmail('tom@tech.com');
         setPassword('password');
     }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
            <div className="bg-teal-600 p-4 rounded-2xl shadow-xl flex items-center justify-center relative">
                <Home className="w-10 h-10 text-white" />
                <div className="absolute -bottom-2 -right-2 bg-teal-800 rounded-full p-1.5 border-4 border-gray-100">
                   <Wrench className="w-5 h-5 text-white" />
                </div>
            </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 tracking-tight">
          {isLogin ? 'FixMate' : 'Create Account'}
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Your Complete Property Maintenance Solution
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            
            {!isLogin && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Full Name</label>
                  <div className="mt-1">
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm bg-white text-gray-900"
                    />
                  </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">I am a...</label>
                    <div className="mt-1 grid grid-cols-2 gap-3">
                        <button
                            type="button"
                            onClick={() => setRole(UserRole.RESIDENT)}
                            className={`flex items-center justify-center px-3 py-2 border text-sm font-medium rounded-md ${role === UserRole.RESIDENT ? 'bg-teal-50 border-teal-500 text-teal-700' : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'}`}
                        >
                            Resident
                        </button>
                        <button
                            type="button"
                            onClick={() => setRole(UserRole.TECHNICIAN)}
                            className={`flex items-center justify-center px-3 py-2 border text-sm font-medium rounded-md ${role === UserRole.TECHNICIAN ? 'bg-teal-50 border-teal-500 text-teal-700' : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'}`}
                        >
                            Technician
                        </button>
                    </div>
                </div>
              </>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm bg-white text-gray-900"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm bg-white text-gray-900"
                />
              </div>
            </div>

            {error && (
                <div className="rounded-md bg-red-50 p-4">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <AlertCircle className="h-5 w-5 text-red-400" />
                        </div>
                        <div className="ml-3">
                            <h3 className="text-sm font-medium text-red-800">{error}</h3>
                        </div>
                    </div>
                </div>
            )}

            <div>
              <button
                type="submit"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
              >
                {isLogin ? (
                    <>
                        <LogIn className="w-4 h-4 mr-2" /> Sign In
                    </>
                ) : (
                    <>
                        <UserPlus className="w-4 h-4 mr-2" /> Create Account
                    </>
                )}
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">
                  {isLogin ? 'New to FixMate?' : 'Already have an account?'}
                </span>
              </div>
            </div>

            <div className="mt-6">
                <button
                    onClick={() => {
                        setIsLogin(!isLogin);
                        setError('');
                        setEmail('');
                        setPassword('');
                    }}
                    className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
                >
                    {isLogin ? 'Create an account' : 'Sign in instead'}
                </button>
            </div>
          </div>
          
          {/* Demo Credentials Helper */}
          {isLogin && (
            <div className="mt-6 pt-6 border-t border-gray-200">
                <p className="text-xs text-center text-gray-400 mb-3">DEMO CREDENTIALS</p>
                <div className="flex justify-center space-x-2 text-xs">
                    <button onClick={() => fillDemo('res')} className="px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded text-gray-600">Resident</button>
                    <button onClick={() => fillDemo('tech')} className="px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded text-gray-600">Technician</button>
                    <button onClick={() => fillDemo('admin')} className="px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded text-gray-600">Admin</button>
                </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};