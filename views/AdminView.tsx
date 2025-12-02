import React, { useState, useEffect } from 'react';
import { User, Issue, UserRole, IssueStatus } from '../types';
import { db } from '../services/db';
import { StatusBadge } from '../components/StatusBadge';
import { PriorityBadge } from '../components/PriorityBadge';
import { ChatWidget } from '../components/ChatWidget';
import { generateMaintenanceReport } from '../services/geminiService';
import { runSystemDiagnostics } from '../utils/testSuite';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell 
} from 'recharts';
import { 
  Sparkles, User as UserIcon, Search, Trash2, Activity, CheckCircle, AlertTriangle
} from 'lucide-react';
import { supabase } from '../services/supabaseClient';

export const AdminView: React.FC<{ currentUser: User }> = ({ currentUser }) => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'issues' | 'chat'>('dashboard');
  const [issues, setIssues] = useState<Issue[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [isDbConnected, setIsDbConnected] = useState<boolean | null>(null);
  
  // Chat Selection
  const [chatTarget, setChatTarget] = useState<User | undefined>(undefined);

  // AI Insight State
  const [aiSummary, setAiSummary] = useState<string>("");
  const [isLoadingAi, setIsLoadingAi] = useState(false);
  const [isRunningTests, setIsRunningTests] = useState(false);

  const loadData = async () => {
    try {
        const [loadedIssues, loadedUsers] = await Promise.all([
            db.getIssues(),
            db.getUsers()
        ]);
        setIssues(loadedIssues);
        setUsers(loadedUsers);
    } catch (e) {
        console.error(e);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 5000);
    
    // Check DB health on mount
    supabase.from('profiles').select('count').limit(1).then(({ error }) => {
        setIsDbConnected(!error);
    });

    return () => clearInterval(interval);
  }, []);

  // Prepare Chart Data - "In Progress" changed from Blue to Indigo (#6366f1) to avoid Teal clash
  const statusCounts = [
    { name: 'Open', value: issues.filter(i => i.status === IssueStatus.OPEN).length, color: '#ef4444' },
    { name: 'In Progress', value: issues.filter(i => [IssueStatus.ASSIGNED, IssueStatus.IN_PROGRESS].includes(i.status)).length, color: '#6366f1' },
    { name: 'Resolved', value: issues.filter(i => i.status === IssueStatus.RESOLVED).length, color: '#22c55e' },
  ];

  const categoryCounts = issues.reduce((acc, curr) => {
    const found = acc.find(x => x.name === curr.category);
    if (found) found.value++;
    else acc.push({ name: curr.category, value: 1 });
    return acc;
  }, [] as { name: string, value: number }[]);

  const handleAssign = async (issueId: string, techId: string) => {
    const tech = users.find(u => u.id === techId);
    await db.assignIssue(issueId, techId, tech?.name);
    loadData();
  };

  const handleGenerateReport = async () => {
    setIsLoadingAi(true);
    const summary = await generateMaintenanceReport(issues.filter(i => i.status !== IssueStatus.RESOLVED));
    setAiSummary(summary);
    setIsLoadingAi(false);
  };
  
  const handleDiagnostics = async () => {
      setIsRunningTests(true);
      const results = await runSystemDiagnostics();
      setIsRunningTests(false);
      alert(results.message);
  };

  const technicians = users.filter(u => u.role === UserRole.TECHNICIAN);

  // Filter Issues Logic
  const filteredIssues = issues.filter(i => {
    const matchesStatus = filterStatus === 'ALL' || i.status === filterStatus;
    const matchesSearch = i.description.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          i.residentName.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Sub-nav */}
      <div className="flex justify-between items-center border-b border-gray-200 bg-white p-1 rounded-t-lg">
        <div className="flex space-x-1">
          {['dashboard', 'issues', 'chat'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`px-4 py-2 rounded-md text-sm font-medium capitalize transition-colors ${
                activeTab === tab 
                  ? 'bg-teal-50 text-teal-700' 
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
        
        {/* Admin Tools Toolbar */}
        <div className="flex items-center px-4 gap-3">
            {/* System Health Indicator */}
            <div className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded border ${isDbConnected ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
                {isDbConnected ? <CheckCircle className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
                {isDbConnected ? 'DB Connected' : 'DB Error'}
            </div>

            <div className="h-4 w-px bg-gray-300"></div>

            <button 
                onClick={handleDiagnostics}
                disabled={isRunningTests}
                className="flex items-center text-xs font-medium text-gray-600 hover:text-teal-600 transition-colors disabled:opacity-50"
            >
                <Activity className={`w-3 h-3 mr-1 ${isRunningTests ? 'animate-pulse' : ''}`} />
                {isRunningTests ? 'Checking...' : 'Run Diagnostics'}
            </button>
        </div>
      </div>

      {/* Dashboard */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {statusCounts.map((stat) => (
              <div key={stat.name} className="bg-white p-6 rounded-lg shadow-sm border-l-4" style={{ borderLeftColor: stat.color }}>
                <h3 className="text-gray-500 text-sm font-medium uppercase">{stat.name} Issues</h3>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
              </div>
            ))}
          </div>

          {/* AI Insights */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-600" />
                Gemini AI Insights
              </h3>
              <button 
                onClick={handleGenerateReport}
                disabled={isLoadingAi}
                className="text-sm bg-purple-50 text-purple-700 px-3 py-1 rounded-md hover:bg-purple-100 disabled:opacity-50"
              >
                {isLoadingAi ? 'Analyzing...' : 'Generate Report'}
              </button>
            </div>
            <div className="bg-purple-50/50 p-4 rounded-md min-h-[80px] text-gray-700 text-sm whitespace-pre-line">
              {aiSummary || "Click 'Generate Report' to get an AI-powered summary of open maintenance requests and priority actions."}
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 h-80">
              <h4 className="text-gray-700 font-semibold mb-4">Issues by Status</h4>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={statusCounts}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#0d9488" radius={[4, 4, 0, 0]}>
                    {statusCounts.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 h-80">
              <h4 className="text-gray-700 font-semibold mb-4">Issues by Category</h4>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryCounts}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    fill="#8884d8"
                    paddingAngle={5}
                    dataKey="value"
                    label
                  >
                    {/* Updated Palette: Teal, Cyan, Blue, Violet, Pink */}
                    {categoryCounts.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={['#0d9488', '#0891b2', '#2563eb', '#7c3aed', '#db2777'][index % 5]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Issue Management */}
      {activeTab === 'issues' && (
        <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
          <div className="p-4 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-center gap-4">
            <h3 className="text-lg font-medium text-gray-900">Issue Management</h3>
            
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
                <input 
                  type="text"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 w-full"
                />
              </div>
              <select 
                className="border-teal-200 bg-teal-50 text-teal-900 rounded-md text-sm p-2 border focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 cursor-pointer hover:bg-teal-100 transition-colors"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="ALL">All Statuses</option>
                {Object.keys(IssueStatus).map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Issue</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Resident</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assigned To</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredIssues.map((issue) => (
                  <tr key={issue.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                       <PriorityBadge priority={issue.priority} compact />
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 font-medium max-w-xs truncate" title={issue.description}>{issue.description}</div>
                      <div className="text-xs text-gray-500">{new Date(issue.createdAt).toLocaleDateString()}</div>
                      {issue.resolutionNotes && (
                        <div className="text-xs text-green-600 mt-1">Fixed: {issue.resolutionNotes}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{issue.category}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge status={issue.status} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{issue.residentName}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <select
                        className="bg-white border-gray-300 rounded text-sm p-1 border w-32"
                        value={issue.assignedTo || ''}
                        onChange={(e) => handleAssign(issue.id, e.target.value)}
                      >
                        <option value="">Unassigned</option>
                        {technicians.map(tech => (
                          <option key={tech.id} value={tech.id}>{tech.name}</option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Chat Console */}
      {activeTab === 'chat' && (
        <div className="flex h-[600px] bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
          {/* User List */}
          <div className="w-1/3 border-r border-gray-200 flex flex-col">
             <div className="p-4 border-b bg-gray-50">
                <h3 className="font-semibold text-gray-700">Conversations</h3>
             </div>
             <div className="flex-grow overflow-y-auto">
                {users.filter(u => u.id !== currentUser.id).map(user => (
                  <button
                    key={user.id}
                    onClick={() => setChatTarget(user)}
                    className={`w-full text-left px-4 py-3 border-b border-gray-100 hover:bg-gray-50 transition-colors flex items-center gap-3 ${
                      chatTarget?.id === user.id ? 'bg-teal-50 border-l-4 border-l-teal-500' : ''
                    }`}
                  >
                    <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600">
                      <UserIcon className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{user.name}</p>
                      <p className="text-xs text-gray-500 capitalize">{user.role.toLowerCase()}</p>
                    </div>
                  </button>
                ))}
             </div>
          </div>

          {/* Chat Area */}
          <div className="w-2/3 bg-gray-50 p-4">
             <ChatWidget currentUser={currentUser} targetUser={chatTarget} />
          </div>
        </div>
      )}
    </div>
  );
};