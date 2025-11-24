import React from 'react';
import { IssueStatus } from '../types';

const statusConfig: Record<IssueStatus, string> = {
  [IssueStatus.OPEN]: 'bg-red-100 text-red-800 border-red-200',
  [IssueStatus.ASSIGNED]: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  // Changed from Blue to Indigo/Purple to distinct from Teal UI
  [IssueStatus.IN_PROGRESS]: 'bg-indigo-100 text-indigo-800 border-indigo-200',
  [IssueStatus.RESOLVED]: 'bg-green-100 text-green-800 border-green-200',
};

export const StatusBadge: React.FC<{ status: IssueStatus }> = ({ status }) => {
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusConfig[status]}`}>
      {status.replace('_', ' ')}
    </span>
  );
};