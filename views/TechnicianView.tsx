import React, { useState, useEffect } from 'react';
import { User, Issue, IssueStatus, IssuePriority } from '../types';
import { mockDb } from '../services/mockDb';
import { StatusBadge } from '../components/StatusBadge';
import { PriorityBadge } from '../components/PriorityBadge';
import { ChatWidget } from '../components/ChatWidget';
import { CheckCircle, Clock, MessageSquare, List } from 'lucide-react';

export const TechnicianView: React.FC<{ currentUser: User }> = ({ currentUser }) => {
  const [activeTab, setActiveTab] = useState<'tasks' | 'chat'>('tasks');
  const [assignedIssues, setAssignedIssues] = useState<Issue[]>([]);
  
  // State for resolution workflow
  const [resolvingId, setResolvingId] = useState<string | null>(null);
  const [resolutionNote, setResolutionNote] = useState('');

  const loadIssues = () => {
    const issues = mockDb.getIssues().filter(i => i.assignedTo === currentUser.id);
    setAssignedIssues(issues.sort((a, b) => {
      // 1. Sort by Priority (High first)
      const priorityWeight = { [IssuePriority.HIGH]: 3, [IssuePriority.MEDIUM]: 2, [IssuePriority.LOW]: 1 };
      if (priorityWeight[a.priority] !== priorityWeight[b.priority]) {
        return priorityWeight[b.priority] - priorityWeight[a.priority];
      }
      // 2. Sort by Status (Open/Progress first)
      if (a.status === IssueStatus.RESOLVED && b.status !== IssueStatus.RESOLVED) return 1;
      if (a.status !== IssueStatus.RESOLVED && b.status === IssueStatus.RESOLVED) return -1;
      // 3. Sort by Date
      return b.updatedAt - a.updatedAt;
    }));
  };

  useEffect(() => {
    loadIssues();
    const interval = setInterval(loadIssues, 2000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser.id]);

  const handleStatusChange = (issue: Issue) => {
    if (issue.status === IssueStatus.ASSIGNED) {
      // Start Work
      mockDb.updateIssueStatus(issue.id, IssueStatus.IN_PROGRESS);
      loadIssues();
    } else if (issue.status === IssueStatus.IN_PROGRESS) {
      // Open Resolution Input
      setResolvingId(issue.id);
    }
  };

  const submitResolution = (issueId: string) => {
    if (!resolutionNote.trim()) return;
    mockDb.updateIssueStatus(issueId, IssueStatus.RESOLVED, resolutionNote);
    setResolvingId(null);
    setResolutionNote('');
    loadIssues();
  };

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex space-x-4 border-b border-gray-200 pb-2">
        <button
          onClick={() => setActiveTab('tasks')}
          className={`flex items-center pb-2 px-1 ${activeTab === 'tasks' ? 'border-b-2 border-teal-500 text-teal-600 font-medium' : 'text-gray-500'}`}
        >
          <List className="w-4 h-4 mr-2" />
          My Assignments
        </button>
        <button
          onClick={() => setActiveTab('chat')}
          className={`flex items-center pb-2 px-1 ${activeTab === 'chat' ? 'border-b-2 border-teal-500 text-teal-600 font-medium' : 'text-gray-500'}`}
        >
          <MessageSquare className="w-4 h-4 mr-2" />
          Contact Admin
        </button>
      </div>

      {activeTab === 'tasks' && (
        <div className="space-y-4">
          {assignedIssues.length === 0 ? (
             <div className="text-center py-12 bg-white rounded-lg border border-dashed border-gray-300">
             <p className="text-gray-500">No tasks assigned yet.</p>
           </div>
          ) : (
            assignedIssues.map(issue => (
              <div key={issue.id} className={`bg-white rounded-lg shadow-sm border p-6 flex flex-col md:flex-row gap-6 ${issue.priority === IssuePriority.HIGH && issue.status !== IssueStatus.RESOLVED ? 'border-red-200 ring-1 ring-red-100' : 'border-gray-200'}`}>
                <div className="w-full md:w-48 h-32 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                  <img src={issue.photoUrl} alt="Issue" className="w-full h-full object-cover" />
                </div>
                
                <div className="flex-grow">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-bold text-gray-400 uppercase">{issue.category}</span>
                        <PriorityBadge priority={issue.priority} />
                      </div>
                      <h3 className="text-lg font-bold text-gray-900">{issue.description}</h3>
                      <p className="text-sm text-gray-500 mt-1">Resident: {issue.residentName}</p>
                    </div>
                    <StatusBadge status={issue.status} />
                  </div>
                  
                  {/* Resolution Input Area */}
                  {resolvingId === issue.id ? (
                    <div className="mt-4 bg-gray-50 p-4 rounded-md border border-gray-200 animate-in fade-in zoom-in-95 duration-200">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Resolution Notes</label>
                      <textarea 
                        className="w-full p-2 text-sm border border-gray-300 rounded focus:ring-teal-500 focus:border-teal-500"
                        rows={2}
                        placeholder="What did you fix? (e.g. Replaced faulty wiring)"
                        value={resolutionNote}
                        onChange={(e) => setResolutionNote(e.target.value)}
                      />
                      <div className="flex gap-2 mt-2 justify-end">
                        <button 
                          onClick={() => setResolvingId(null)}
                          className="px-3 py-1 text-sm text-gray-600 hover:bg-gray-200 rounded"
                        >
                          Cancel
                        </button>
                        <button 
                          onClick={() => submitResolution(issue.id)}
                          className="px-3 py-1 text-sm text-white bg-green-600 hover:bg-green-700 rounded shadow-sm"
                        >
                          Complete Task
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* Action Buttons */
                    <div className="mt-6 flex items-center gap-3">
                      {issue.status === IssueStatus.ASSIGNED && (
                        <button
                          onClick={() => handleStatusChange(issue)}
                          className="flex items-center px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 text-sm font-medium transition-colors"
                        >
                          <Clock className="w-4 h-4 mr-2" />
                          Start Work
                        </button>
                      )}
                      
                      {issue.status === IssueStatus.IN_PROGRESS && (
                        <button
                          onClick={() => handleStatusChange(issue)}
                          className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm font-medium transition-colors"
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Resolve...
                        </button>
                      )}
                      
                      {issue.status === IssueStatus.RESOLVED && (
                        <div className="flex flex-col">
                           <span className="flex items-center text-green-600 text-sm font-medium">
                            <CheckCircle className="w-5 h-5 mr-2" />
                            Completed
                          </span>
                          <span className="text-xs text-gray-500 ml-7">"{issue.resolutionNotes}"</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'chat' && (
         <div className="max-w-3xl mx-auto">
         <ChatWidget currentUser={currentUser} />
       </div>
      )}
    </div>
  );
};