export enum UserRole {
  RESIDENT = 'RESIDENT',
  TECHNICIAN = 'TECHNICIAN',
  ADMIN = 'ADMIN'
}

export enum IssueStatus {
  OPEN = 'OPEN',
  ASSIGNED = 'ASSIGNED',
  IN_PROGRESS = 'IN_PROGRESS',
  RESOLVED = 'RESOLVED'
}

export enum IssueCategory {
  ELECTRICAL = 'Electrical',
  PLUMBING = 'Plumbing',
  CARPENTRY = 'Carpentry',
  CLEANING = 'Cleaning',
  OTHER = 'Other'
}

export enum IssuePriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH'
}

export interface User {
  id: string;
  name: string;
  email: string;      // Added for auth
  password?: string;  // Added for auth (optional on frontend user object, required in DB)
  role: UserRole;
  avatar?: string;
}

export interface Issue {
  id: string;
  residentId: string;
  residentName: string;
  category: IssueCategory;
  description: string;
  photoUrl?: string;
  status: IssueStatus;
  priority: IssuePriority;
  assignedTo?: string; // technician_id
  assignedToName?: string;
  resolutionNotes?: string;
  createdAt: number;
  updatedAt: number;
}

export interface Message {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: UserRole;
  receiverId: string; // 'ADMIN' or specific user ID
  text: string;
  timestamp: number;
}