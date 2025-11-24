import React, { useState, useEffect } from 'react';
import { User, Issue, IssueCategory, IssuePriority } from '../types';
import { mockDb } from '../services/mockDb';
import { StatusBadge } from '../components/StatusBadge';
import { PriorityBadge } from '../components/PriorityBadge';
import { ChatWidget } from '../components/ChatWidget';
import { Plus, MessageSquare, ClipboardList, AlertCircle } from 'lucide-react';

const CATEGORY_IMAGES: Record<IssueCategory, string> = {
  [IssueCategory.ELECTRICAL]: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?q=80&w=600&h=400&auto=format&fit=crop',
  [IssueCategory.PLUMBING]: 'https://images.unsplash.com/photo-1581244277943-fe4a9c777189?q=80&w=600&h=400&auto=format&fit=crop',
  [IssueCategory.CARPENTRY]: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?q=80&w=600&h=400&auto=format&fit=crop',
  [IssueCategory.CLEANING]: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?q=80&w=600&h=400&auto=format&fit=crop',
  [IssueCategory.OTHER]: 'https://images.unsplash.com/photo-1505798577917-a65157d3320a?q=80&w=600&h=400&auto=format&fit=crop',
};

export const ResidentView: React.FC<{ currentUser: User }> = ({ currentUser }) => {
  const [activeTab, setActiveTab] = useState<'issues' | 'create' | 'chat'>('issues');
  const [myIssues, setMyIssues] = useState<Issue[]>([]);
  
  // Form State
  const [category, setCategory] = useState<IssueCategory>(IssueCategory.ELECTRICAL);
  const [priority, setPriority] = useState<IssuePriority>(IssuePriority.MEDIUM);
  const [description, setDescription] = useState('');

  useEffect(() => {
    const load = () => {
      const issues = mockDb.getIssues().filter(i => i.residentId === currentUser.id);
      setMyIssues(issues.sort((a, b) => b.createdAt - a.createdAt));
    };
    load();
    const interval = setInterval(load, 2000); // Polling for updates
    return () => clearInterval(interval);
  }, [currentUser.id]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Select image based on category for realism
    const image = CATEGORY_IMAGES[category] || CATEGORY_IMAGES[IssueCategory.OTHER];
    
    mockDb.addIssue({
      residentId: currentUser.id,
      residentName: currentUser.name,
      category,
      priority,
      description,
      photoUrl: image
    });
    setDescription('');
    setPriority(IssuePriority.MEDIUM);
    setActiveTab('issues');
  };

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex space-x-4 border-b border-gray-200 pb-2">
        <button
          onClick={() => setActiveTab('issues')}
          className={`flex items-center pb-2 px-1 ${activeTab === 'issues' ? 'border-b-2 border-teal-500 text-teal-600 font-medium' : 'text-gray-500'}`}
        >
          <ClipboardList className="w-4 h-4 mr-2" />
          My Requests
        </button>
        <button
          onClick={() => setActiveTab('create')}
          className={`flex items-center pb-2 px-1 ${activeTab === 'create' ? 'border-b-2 border-teal-500 text-teal-600 font-medium' : 'text-gray-500'}`}
        >
          <Plus className="w-4 h-4 mr-2" />
          New Request
        </button>
        <button
          onClick={() => setActiveTab('chat')}
          className={`flex items-center pb-2 px-1 ${activeTab === 'chat' ? 'border-b-2 border-teal-500 text-teal-600 font-medium' : 'text-gray-500'}`}
        >
          <MessageSquare className="w-4 h-4 mr-2" />
          Contact Admin
        </button>
      </div>

      {/* Content */}
      {activeTab === 'issues' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {myIssues.length === 0 ? (
            <div className="col-span-full text-center py-12 bg-white rounded-lg border border-dashed border-gray-300">
              <p className="text-gray-500 mb-2">No maintenance requests found.</p>
              <button onClick={() => setActiveTab('create')} className="text-teal-600 hover:underline">
                Create your first request
              </button>
            </div>
          ) : (
            myIssues.map(issue => (
              <div key={issue.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                <div className="h-48 bg-gray-100 relative">
                   <img src={issue.photoUrl} alt="Issue" className="w-full h-full object-cover" />
                   <div className="absolute top-2 right-2 flex gap-2">
                     <PriorityBadge priority={issue.priority} />
                     <StatusBadge status={issue.status} />
                   </div>
                </div>
                <div className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{issue.category}</span>
                    <span className="text-xs text-gray-400">{new Date(issue.createdAt).toLocaleDateString()}</span>
                  </div>
                  <p className="text-gray-800 font-medium mb-2">{issue.description}</p>
                  
                  {issue.resolutionNotes && (
                    <div className="mt-2 bg-green-50 p-2 rounded text-xs text-green-800 border border-green-100">
                      <strong>Resolution:</strong> {issue.resolutionNotes}
                    </div>
                  )}

                  {issue.assignedToName && (
                    <p className="text-xs text-gray-500 mt-2">Assigned to: <span className="font-medium">{issue.assignedToName}</span></p>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'create' && (
        <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Submit Maintenance Request</h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as IssueCategory)}
                  className="w-full bg-white text-gray-900 border-gray-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500 p-2 border"
                >
                  {Object.values(IssueCategory).map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as IssuePriority)}
                  className="w-full bg-white text-gray-900 border-gray-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500 p-2 border"
                >
                  {Object.values(IssuePriority).map(p => (
                    <option key={p} value={p}>{p} Priority</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                required
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-white text-gray-900 border-gray-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500 p-2 border"
                placeholder="Describe the issue in detail..."
              />
            </div>
            
            <div className="bg-teal-50 p-4 rounded-md flex items-start">
               <div className="flex-shrink-0">
                 <AlertCircle className="h-5 w-5 text-teal-400" />
               </div>
               <div className="ml-3 flex-1 md:flex md:justify-between">
                 <p className="text-sm text-teal-700">A category-specific sample image will be attached automatically for testing purposes.</p>
               </div>
            </div>

            <button
              type="submit"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
            >
              Submit Request
            </button>
          </form>
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