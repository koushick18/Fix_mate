import React from 'react';
import { IssuePriority } from '../types';
import { AlertTriangle, AlertCircle, Minus } from 'lucide-react';

const config = {
  [IssuePriority.HIGH]: {
    className: 'bg-red-50 text-red-700 border-red-100 border',
    icon: AlertTriangle,
    label: 'High Priority'
  },
  [IssuePriority.MEDIUM]: {
    // Changed to Amber/Orange for better standard visibility
    className: 'bg-amber-50 text-amber-700 border-amber-100 border',
    icon: AlertCircle,
    label: 'Medium Priority'
  },
  [IssuePriority.LOW]: {
    className: 'bg-gray-100 text-gray-700 border-gray-200 border',
    icon: Minus,
    label: 'Low Priority'
  }
};

interface PriorityBadgeProps {
  priority: IssuePriority;
  compact?: boolean;
  showIcon?: boolean;
}

export const PriorityBadge: React.FC<PriorityBadgeProps> = ({ priority, compact = false, showIcon = true }) => {
  const { className, icon: Icon, label } = config[priority];
  
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${className}`}>
      {showIcon && <Icon className="w-3 h-3 mr-1" />}
      {compact ? priority : label}
    </span>
  );
};